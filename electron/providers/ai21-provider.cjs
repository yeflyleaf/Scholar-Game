/**
 * AI21 Labs Provider
 * Handles AI21 Labs API format
 */

const { BaseProvider } = require('./base-provider.cjs');

class AI21Provider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'ai21';
    this.displayName = 'AI21 Labs';
    this.baseUrl = config.baseUrl || 'https://api.ai21.com/studio/v1';
    this.model = config.model || 'jamba-1.5-large';
    
    this.requestsPerMinute = 10;
    this.tokensPerMinute = 100000;
  }

  getAvailableModels() {
    return [
      { id: 'jamba-1.5-large', name: 'Jamba 1.5 Large', description: '最新大模型' },
      { id: 'jamba-1.5-mini', name: 'Jamba 1.5 Mini', description: '轻量版' },
      { id: 'j2-ultra', name: 'Jurassic-2 Ultra', description: '经典模型' },
      { id: 'j2-mid', name: 'Jurassic-2 Mid', description: '中型模型' },
    ];
  }

  async complete(prompt, systemInstruction = null, options = {}) {
    const retryCount = options.retryCount || 0;

    if (!this.apiKey) {
      throw new Error('AI21 API key not configured');
    }

    const inputContent = (prompt || '') + (systemInstruction || '');
    const estimatedTokens = Math.ceil(inputContent.length / 4);
    
    this.checkRateLimits(estimatedTokens);
    this.incrementUsage(estimatedTokens);

    // AI21 has different endpoints for different models
    const isJamba = this.model.startsWith('jamba');
    const url = isJamba 
      ? `${this.baseUrl}/${this.model}/chat/completions`
      : `${this.baseUrl}/${this.model}/complete`;
    
    console.log(`[AI21Provider] Calling API with model: ${this.model}`);

    let requestBody;
    if (isJamba) {
      // Jamba models use chat format
      const messages = [];
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }
      messages.push({ role: 'user', content: prompt });

      requestBody = {
        model: this.model,
        messages: messages,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.95,
      };
    } else {
      // Jurassic models use complete format
      let fullPrompt = prompt;
      if (systemInstruction) {
        fullPrompt = `${systemInstruction}\n\n${prompt}`;
      }
      
      requestBody = {
        prompt: fullPrompt,
        maxTokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        topP: options.topP || 0.95,
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 429 && retryCount < 3) {
          const waitTime = 20 * Math.pow(2, retryCount);
          console.log(`[AI21Provider] Rate limited. Retrying in ${waitTime}s...`);
          await this.sleep(waitTime * 1000);
          return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
        }
        
        throw new Error(`AI21 API error: ${errorText}`);
      }

      const data = await response.json();
      
      // Handle response based on model type
      if (isJamba && data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      } else if (data.completions?.[0]?.data?.text) {
        return data.completions[0].data.text;
      }
      
      throw new Error('Invalid response from AI21 API');
    } catch (error) {
      if (retryCount < 3 && error.message.includes('fetch failed')) {
        await this.sleep(5000);
        return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
      }
      throw error;
    }
  }
}

module.exports = { AI21Provider };
