/**
 * Hugging Face 提供商
 * 处理 Hugging Face 推理 API
 */

const { BaseProvider } = require('./base-provider.cjs');
const { getProviderById } = require('./provider-registry.cjs');

class HuggingFaceProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'huggingface';
    this.displayName = 'Hugging Face';
    this.baseUrl = config.baseUrl || 'https://api-inference.huggingface.co/models';
    this.model = config.model || 'meta-llama/Meta-Llama-3-8B-Instruct';
    
    // Hugging Face 免费层限制
    this.requestsPerMinute = 5; // 300/hour = 5/minute
    this.tokensPerMinute = 100000;
    
    // 从注册表加载模型配置
    this.providerConfig = getProviderById('huggingface');
  }

  getAvailableModels() {
    // 从注册表读取模型，确保前后端一致
    if (this.providerConfig && this.providerConfig.models) {
      return this.providerConfig.models;
    }
    // 后备默认值
    return [
      { id: 'meta-llama/Meta-Llama-3-8B-Instruct', name: 'Llama 3 8B', description: 'Meta 开源' },
    ];
  }

  async complete(prompt, systemInstruction = null, options = {}) {
    const retryCount = options.retryCount || 0;

    if (!this.apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    const inputContent = (prompt || '') + (systemInstruction || '');
    const estimatedTokens = Math.ceil(inputContent.length / 4);
    
    this.checkRateLimits(estimatedTokens);
    this.incrementUsage(estimatedTokens);

    const url = `${this.baseUrl}/${this.model}`;
    console.log(`[HuggingFaceProvider] Calling API with model: ${this.model}`);

    // 为指令微调模型构建提示词
    let fullPrompt = prompt;
    if (systemInstruction) {
      fullPrompt = `[INST] ${systemInstruction}\n\n${prompt} [/INST]`;
    }

    const requestBody = {
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.95,
        do_sample: true,
        return_full_text: false,
      },
      options: {
        wait_for_model: true,
      }
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
          console.log(`[HuggingFaceProvider] Rate limited. Retrying in ${waitTime}s...`);
          await this.sleep(waitTime * 1000);
          return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
        }

        if (response.status === 503 && retryCount < 3) {
          // 模型正在加载
          console.log('[HuggingFaceProvider] Model loading, waiting...');
          await this.sleep(30000);
          return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
        }
        
        throw new Error(`Hugging Face API error: ${errorText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text;
      } else if (data.generated_text) {
        return data.generated_text;
      }
      
      throw new Error('Invalid response from Hugging Face API');
    } catch (error) {
      if (retryCount < 3 && error.message.includes('fetch failed')) {
        await this.sleep(5000);
        return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
      }
      throw error;
    }
  }
}

module.exports = { HuggingFaceProvider };
