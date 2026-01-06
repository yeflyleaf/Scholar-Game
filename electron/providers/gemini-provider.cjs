/**
 * Gemini Provider - Google Gemini API implementation
 * Handles the specific API format used by Google's Gemini models
 */

const { BaseProvider } = require('./base-provider.cjs');

class GeminiProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'gemini';
    this.displayName = 'Google Gemini';
    this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = config.model || 'gemini-2.5-flash';
    
    // Gemini rate limits (free tier)
    this.requestsPerMinute = 5;
    this.tokensPerMinute = 250000;
    this.requestsPerDay = 20;
    this.requestsToday = 0;
  }

  getAvailableModels() {
    return [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: '最新最快的模型' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: '最强推理能力' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: '快速响应' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: '经典版本' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: '高质量输出' },
    ];
  }

  /**
   * Make a completion request to Gemini API
   */
  async complete(prompt, systemInstruction = null, options = {}) {
    const maxTokens = options.maxTokens || 8192;
    const retryCount = options.retryCount || 0;

    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Estimate tokens and check rate limits
    const inputContent = (prompt || '') + (systemInstruction || '');
    const estimatedTokens = Math.ceil(inputContent.length / 4);
    
    this.checkRateLimits(estimatedTokens);
    this.incrementUsage(estimatedTokens);

    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
    console.log(`[GeminiProvider] Calling API with model: ${this.model}`);

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        topP: options.topP || 0.95,
        maxOutputTokens: maxTokens,
      }
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle 429 Rate Limit
        if (response.status === 429) {
          console.error('[GeminiProvider] Quota Exceeded:', errorText);
          
          if (retryCount < 3) {
            let waitTime = 10;
            try {
              const errorJson = JSON.parse(errorText);
              const retryInfo = errorJson.error?.details?.find(d => d['@type']?.includes('RetryInfo'));
              if (retryInfo && retryInfo.retryDelay) {
                waitTime = parseFloat(retryInfo.retryDelay.replace('s', '')) + 1;
              }
            } catch (e) {
              waitTime = 10 * Math.pow(2, retryCount);
            }
            
            console.log(`[GeminiProvider] Rate limited. Retrying in ${waitTime}s... (Attempt ${retryCount + 1}/3)`);
            await this.sleep(waitTime * 1000);
            return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
          }
          
          throw new Error('AI核心过载（配额耗尽），请稍后重试或检查API密钥配额。');
        }
        
        // Handle 503 Service Overload
        if (response.status === 503) {
          console.error('[GeminiProvider] API Overloaded:', errorText);
          
          if (retryCount < 3) {
            const waitTime = 15 * Math.pow(1.5, retryCount);
            console.log(`[GeminiProvider] API overloaded (503). Retrying in ${waitTime.toFixed(1)}s... (Attempt ${retryCount + 1}/3)`);
            await this.sleep(waitTime * 1000);
            return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
          }
          
          throw new Error('AI核心暂时过载，请稍后重试。');
        }
        
        throw new Error(`Gemini API error: ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      // Network error retry
      if (retryCount < 3 && error.message.includes('fetch failed')) {
        console.log(`[GeminiProvider] Network error. Retrying... (Attempt ${retryCount + 1}/3)`);
        await this.sleep(5000);
        return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
      }
      throw error;
    }
  }
}

module.exports = { GeminiProvider };
