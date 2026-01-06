/**
 * OpenAI-Compatible Provider
 * Handles all providers that use OpenAI-compatible API format
 * Supports: DeepSeek, Groq, SiliconFlow, Kimi, OpenRouter, Together, Fireworks, 
 *           Cerebras, Mistral, AIML, Aliyun, Huawei, Volcengine, Tencent, Baidu
 */

const { BaseProvider } = require('./base-provider.cjs');
const { getProviderById } = require('./provider-registry.cjs');

class OpenAICompatibleProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    
    // Load provider config from registry if providerId is specified
    if (config.providerId) {
      const providerConfig = getProviderById(config.providerId);
      if (providerConfig) {
        this.providerName = providerConfig.id;
        this.displayName = providerConfig.name;
        this.baseUrl = config.baseUrl || providerConfig.baseUrl;
        this.model = config.model || providerConfig.defaultModel;
        this.providerConfig = providerConfig;
      }
    } else {
      this.providerName = config.providerName || 'openai-compatible';
      this.displayName = config.displayName || 'OpenAI Compatible';
      this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
      this.model = config.model || 'gpt-4o-mini';
      this.providerConfig = null;
    }

    // Additional config
    this.extraHeaders = config.extraHeaders || {};
    this.accountId = config.accountId || null; // For Cloudflare
  }

  getAvailableModels() {
    if (this.providerConfig && this.providerConfig.models) {
      return this.providerConfig.models;
    }
    return [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '默认模型' },
    ];
  }

  /**
   * Build the request URL
   */
  getRequestUrl() {
    // Handle Cloudflare's special URL format
    if (this.providerName === 'cloudflare' && this.accountId) {
      return this.baseUrl.replace('{account_id}', this.accountId) + `/${this.model}`;
    }
    return `${this.baseUrl}/chat/completions`;
  }

  /**
   * Build request headers
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...this.extraHeaders,
    };

    // OpenRouter requires additional headers
    if (this.providerName === 'openrouter') {
      headers['HTTP-Referer'] = 'https://scholar-game.app';
      headers['X-Title'] = 'Scholar Game';
    }

    return headers;
  }

  /**
   * Make a completion request using OpenAI-compatible format
   */
  async complete(prompt, systemInstruction = null, options = {}) {
    const maxTokens = options.maxTokens || 4096;
    const retryCount = options.retryCount || 0;

    if (!this.apiKey) {
      throw new Error(`${this.displayName} API key not configured`);
    }

    // Estimate tokens and check rate limits
    const inputContent = (prompt || '') + (systemInstruction || '');
    const estimatedTokens = Math.ceil(inputContent.length / 4);
    
    this.checkRateLimits(estimatedTokens);
    this.incrementUsage(estimatedTokens);

    const url = this.getRequestUrl();
    console.log(`[${this.providerName}] Calling API with model: ${this.model}`);

    // Build messages array
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const requestBody = {
      model: this.model,
      messages: messages,
      max_tokens: maxTokens,
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.95,
    };

    // Some providers support response_format
    if (options.responseFormat === 'json') {
      requestBody.response_format = { type: 'json_object' };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle rate limiting (429)
        if (response.status === 429) {
          console.error(`[${this.providerName}] Rate Limited:`, errorText);
          
          if (retryCount < 3) {
            let waitTime = 10;
            try {
              const errorJson = JSON.parse(errorText);
              // Try to extract retry-after from various formats
              if (errorJson.error?.retry_after) {
                waitTime = errorJson.error.retry_after;
              } else if (errorJson.retry_after) {
                waitTime = errorJson.retry_after;
              }
            } catch (e) {
              waitTime = 10 * Math.pow(2, retryCount);
            }
            
            console.log(`[${this.providerName}] Rate limited. Retrying in ${waitTime}s...`);
            await this.sleep(waitTime * 1000);
            return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
          }
          
          throw new Error(`${this.displayName} 配额已用尽，请稍后重试。`);
        }
        
        // Handle server errors (5xx)
        if (response.status >= 500 && response.status < 600) {
          console.error(`[${this.providerName}] Server Error:`, errorText);
          
          if (retryCount < 3) {
            const waitTime = 15 * Math.pow(1.5, retryCount);
            console.log(`[${this.providerName}] Server error. Retrying in ${waitTime.toFixed(1)}s...`);
            await this.sleep(waitTime * 1000);
            return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
          }
          
          throw new Error(`${this.displayName} 服务暂时不可用。`);
        }

        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          throw new Error(`${this.displayName} API 密钥无效或权限不足。`);
        }
        
        throw new Error(`${this.displayName} API error: ${errorText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      } else if (data.result) {
        // Some Chinese providers use 'result' field
        return data.result;
      } else if (data.response) {
        return data.response;
      }
      
      throw new Error(`Invalid response from ${this.displayName}`);
    } catch (error) {
      // Network error retry
      if (retryCount < 3 && (error.message.includes('fetch failed') || error.message.includes('network'))) {
        console.log(`[${this.providerName}] Network error. Retrying...`);
        await this.sleep(5000);
        return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
      }
      throw error;
    }
  }

  /**
   * Set additional configuration
   */
  setAccountId(accountId) {
    this.accountId = accountId;
  }

  setExtraHeaders(headers) {
    this.extraHeaders = headers;
  }
}

module.exports = { OpenAICompatibleProvider };
