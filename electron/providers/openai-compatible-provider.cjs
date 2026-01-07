/**
 * OpenAI 兼容提供商
 * 处理所有使用 OpenAI 兼容 API 格式的提供商
 * 支持：DeepSeek、Groq、硅基流动、Kimi、OpenRouter、Together、Fireworks、
 *       Cerebras、Mistral、AIML、阿里云、华为、火山引擎、腾讯、百度
 */

const { BaseProvider } = require('./base-provider.cjs');
const { getProviderById } = require('./provider-registry.cjs');

class OpenAICompatibleProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    
    // 如果指定了 providerId，从注册表加载提供商配置
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

    // 额外配置
    this.extraHeaders = config.extraHeaders || {};
    this.accountId = config.accountId || null; // 用于 Cloudflare
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
   * 构建请求 URL
   */
  getRequestUrl() {
    // 处理 Cloudflare 的特殊 URL 格式
    if (this.providerName === 'cloudflare' && this.accountId) {
      return this.baseUrl.replace('{account_id}', this.accountId) + `/${this.model}`;
    }
    return `${this.baseUrl}/chat/completions`;
  }

  /**
   * 构建请求头
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...this.extraHeaders,
    };

    // OpenRouter 需要额外的头
    if (this.providerName === 'openrouter') {
      headers['HTTP-Referer'] = 'https://scholar-game.app';
      headers['X-Title'] = 'Scholar Game';
    }

    return headers;
  }

  /**
   * 使用 OpenAI 兼容格式发起补全请求
   */
  async complete(prompt, systemInstruction = null, options = {}) {
    const maxTokens = options.maxTokens || 4096;
    const retryCount = options.retryCount || 0;

    if (!this.apiKey) {
      throw new Error(`${this.displayName} API key not configured`);
    }

    // 估算 Token 并检查速率限制
    const inputContent = (prompt || '') + (systemInstruction || '');
    const estimatedTokens = Math.ceil(inputContent.length / 4);
    
    this.checkRateLimits(estimatedTokens);
    this.incrementUsage(estimatedTokens);

    const url = this.getRequestUrl();
    console.log(`[${this.providerName}] Calling API with model: ${this.model}`);

    // 构建消息数组
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

    // 部分提供商支持 response_format
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
        
        // 处理速率限制 (429)
        if (response.status === 429) {
          console.error(`[${this.providerName}] Rate Limited:`, errorText);
          
          if (retryCount < 3) {
            let waitTime = 10;
            try {
              const errorJson = JSON.parse(errorText);
              // 尝试从各种格式中提取 retry-after
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
        
        // 处理服务器错误 (5xx)
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

        // 处理认证错误
        if (response.status === 401 || response.status === 403) {
          throw new Error(`${this.displayName} API 密钥无效或权限不足。`);
        }
        
        throw new Error(`${this.displayName} API error: ${errorText}`);
      }

      const data = await response.json();
      
      // 处理不同的响应格式
      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      } else if (data.result) {
        // 部分中文提供商使用 'result' 字段
        return data.result;
      } else if (data.response) {
        return data.response;
      }
      
      throw new Error(`Invalid response from ${this.displayName}`);
    } catch (error) {
      // 网络错误重试
      if (retryCount < 3 && (error.message.includes('fetch failed') || error.message.includes('network'))) {
        console.log(`[${this.providerName}] Network error. Retrying...`);
        await this.sleep(5000);
        return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
      }
      throw error;
    }
  }

  /**
   * 设置额外配置
   */
  setAccountId(accountId) {
    this.accountId = accountId;
  }

  setExtraHeaders(headers) {
    this.extraHeaders = headers;
  }
}

module.exports = { OpenAICompatibleProvider };
