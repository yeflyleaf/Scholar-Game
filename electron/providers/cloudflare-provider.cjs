/**
 * Cloudflare Workers AI Provider
 * Handles Cloudflare's Workers AI API format
 */

const { BaseProvider } = require('./base-provider.cjs');

class CloudflareProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'cloudflare';
    this.displayName = 'Cloudflare Workers AI';
    this.baseUrl = config.baseUrl || 'https://api.cloudflare.com/client/v4/accounts';
    this.model = config.model || '@cf/meta/llama-3.1-8b-instruct';
    this.accountId = config.accountId || null;
    
    // Cloudflare free tier: 10,000 requests/day
    this.requestsPerMinute = 20;
    this.tokensPerMinute = 100000;
  }

  getAvailableModels() {
    return [
      { id: '@cf/meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', description: 'Meta' },
      { id: '@cf/meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', description: 'Meta 大型' },
      { id: '@cf/mistral/mistral-7b-instruct-v0.2', name: 'Mistral 7B', description: 'Mistral' },
      { id: '@cf/qwen/qwen1.5-14b-chat-awq', name: 'Qwen 1.5 14B', description: '通义千问' },
      { id: '@cf/google/gemma-7b-it', name: 'Gemma 7B', description: 'Google' },
    ];
  }

  setAccountId(accountId) {
    this.accountId = accountId;
  }

  async complete(prompt, systemInstruction = null, options = {}) {
    const retryCount = options.retryCount || 0;

    if (!this.apiKey) {
      throw new Error('Cloudflare API Token not configured');
    }

    if (!this.accountId) {
      throw new Error('Cloudflare Account ID not configured');
    }

    const inputContent = (prompt || '') + (systemInstruction || '');
    const estimatedTokens = Math.ceil(inputContent.length / 4);
    
    this.checkRateLimits(estimatedTokens);
    this.incrementUsage(estimatedTokens);

    const url = `${this.baseUrl}/${this.accountId}/ai/run/${this.model}`;
    console.log(`[CloudflareProvider] Calling API with model: ${this.model}`);

    // Cloudflare format
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const requestBody = {
      messages: messages,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.7,
    };

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
          console.log(`[CloudflareProvider] Rate limited. Retrying in ${waitTime}s...`);
          await this.sleep(waitTime * 1000);
          return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
        }
        
        throw new Error(`Cloudflare API error: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.result?.response) {
        return data.result.response;
      } else if (data.result?.text) {
        return data.result.text;
      }
      
      throw new Error('Invalid response from Cloudflare API');
    } catch (error) {
      if (retryCount < 3 && error.message.includes('fetch failed')) {
        await this.sleep(5000);
        return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
      }
      throw error;
    }
  }
}

module.exports = { CloudflareProvider };
