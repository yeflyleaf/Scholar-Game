/**
 * Gemini 提供商 - Google Gemini API 实现
 * 处理 Google Gemini 模型使用的特定 API 格式
 * @author yeflyleaf
 * @link https://github.com/yeflyleaf
 */

const { BaseProvider } = require('./base-provider.cjs');
const { getProviderById } = require('./provider-registry.cjs');

class GeminiProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'gemini';
    this.displayName = 'Google Gemini';
    this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = config.model || 'gemini-2.5-flash';
    
    // 从注册表加载模型配置
    this.providerConfig = getProviderById('gemini');
  }

  getAvailableModels() {
    // 从注册表读取模型，确保前后端一致
    if (this.providerConfig && this.providerConfig.models) {
      return this.providerConfig.models;
    }
    // 后备默认值
    return [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: '最新最快的模型' },
    ];
  }

  /**
   * 向 Gemini API 发起补全请求
   */
  async complete(prompt, systemInstruction = null, options = {}) {
    const maxTokens = options.maxTokens || 8192;
    const retryCount = options.retryCount || 0;

    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // 估算 Token 并检查速率限制
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
        
        // 处理 429 速率限制
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
        
        // 处理 503 服务过载
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
      // 网络错误重试
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
