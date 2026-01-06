/**
 * Cohere Provider
 * Handles Cohere API format
 */

const { BaseProvider } = require('./base-provider.cjs');

class CohereProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'cohere';
    this.displayName = 'Cohere';
    this.baseUrl = config.baseUrl || 'https://api.cohere.ai/v1';
    this.model = config.model || 'command-r-plus';
    
    // Cohere free tier: 1000 calls/month
    this.requestsPerMinute = 10;
    this.tokensPerMinute = 100000;
  }

  getAvailableModels() {
    return [
      { id: 'command-r-plus', name: 'Command R+', description: '最强模型' },
      { id: 'command-r', name: 'Command R', description: '标准版' },
      { id: 'command', name: 'Command', description: '基础版' },
      { id: 'command-light', name: 'Command Light', description: '轻量版' },
    ];
  }

  async complete(prompt, systemInstruction = null, options = {}) {
    const retryCount = options.retryCount || 0;

    if (!this.apiKey) {
      throw new Error('Cohere API key not configured');
    }

    const inputContent = (prompt || '') + (systemInstruction || '');
    const estimatedTokens = Math.ceil(inputContent.length / 4);
    
    this.checkRateLimits(estimatedTokens);
    this.incrementUsage(estimatedTokens);

    const url = `${this.baseUrl}/chat`;
    console.log(`[CohereProvider] Calling API with model: ${this.model}`);

    const requestBody = {
      model: this.model,
      message: prompt,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      p: options.topP || 0.95,
    };

    if (systemInstruction) {
      requestBody.preamble = systemInstruction;
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
          console.log(`[CohereProvider] Rate limited. Retrying in ${waitTime}s...`);
          await this.sleep(waitTime * 1000);
          return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
        }
        
        throw new Error(`Cohere API error: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.text) {
        return data.text;
      }
      
      throw new Error('Invalid response from Cohere API');
    } catch (error) {
      if (retryCount < 3 && error.message.includes('fetch failed')) {
        await this.sleep(5000);
        return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
      }
      throw error;
    }
  }
}

module.exports = { CohereProvider };
