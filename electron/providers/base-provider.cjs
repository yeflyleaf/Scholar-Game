/**
 * 基础 AI 提供商 - 所有 AI 提供商的抽象基类
 * 所有提供商必须实现这些方法
 */

class BaseProvider {
  constructor(config = {}) {
    this.apiKey = config.apiKey || null;
    this.model = config.model || null;
    this.baseUrl = config.baseUrl || null;
    this.providerName = 'base';
    this.displayName = 'Base Provider';
    
    // 速率限制 (按模型独立追踪)
    this.requestsPerMinute = config.requestsPerMinute || 60;
    this.tokensPerMinute = config.tokensPerMinute || 100000;
    this.requestsPerDay = config.requestsPerDay || 0; // 0 表示无限制
    
    this.minuteWindowStart = Date.now();
    this.dayWindowStart = new Date().setHours(0, 0, 0, 0); // 今天 0 点
    
    // 使用 Map 存储每个模型的用量: modelName -> { requests: 0, tokens: 0, requestsToday: 0 }
    this.usageByModel = new Map();
  }

  /**
   * 获取指定模型的用量统计
   */
  _getModelUsage(model) {
    if (!this.usageByModel.has(model)) {
      this.usageByModel.set(model, { requests: 0, tokens: 0, requestsToday: 0 });
    }
    return this.usageByModel.get(model);
  }

  /**
   * 获取模型配置（如果存在）
   */
  _getModelConfig(modelId) {
    if (this.providerConfig && this.providerConfig.models) {
      return this.providerConfig.models.find(m => m.id === modelId);
    }
    return null;
  }

  /**
   * 设置 API 密钥
   * @param {string} apiKey - API 密钥
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * 获取当前 API 密钥
   * @returns {string|null}
   */
  getApiKey() {
    return this.apiKey;
  }

  /**
   * 设置模型
   * @param {string} model - 模型 ID
   */
  setModel(model) {
    this.model = model;
  }

  /**
   * 获取当前模型
   * @returns {string|null}
   */
  getModel() {
    return this.model;
  }

  /**
   * 检查提供商是否已配置
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * 在发起请求前检查速率限制
   * @param {number} estimatedTokens - 此请求的预估 Token 数
   * @throws {Error} 如果超出速率限制
   */
  checkRateLimits(estimatedTokens = 0) {
    const now = Date.now();
    
    // 检查分钟窗口
    if (now - this.minuteWindowStart > 60000) {
      this.minuteWindowStart = now;
      // 重置所有模型的分钟计数器
      for (const usage of this.usageByModel.values()) {
        usage.requests = 0;
        usage.tokens = 0;
      }
    }
    
    // 检查天窗口
    const todayStart = new Date().setHours(0, 0, 0, 0);
    if (todayStart > this.dayWindowStart) {
      this.dayWindowStart = todayStart;
      // 重置所有模型的天计数器
      for (const usage of this.usageByModel.values()) {
        usage.requestsToday = 0;
      }
    }

    const currentModel = this.model || 'default';
    const usage = this._getModelUsage(currentModel);
    const modelConfig = this._getModelConfig(currentModel);
    
    // 获取限制：优先使用模型特定配置，否则使用默认值
    const rpmLimit = modelConfig?.rateLimits?.rpm || this.requestsPerMinute;
    const tpmLimit = modelConfig?.rateLimits?.tpm || this.tokensPerMinute;
    const rpdLimit = modelConfig?.rateLimits?.rpd || this.requestsPerDay;

    // 检查 RPM
    if (usage.requests >= rpmLimit) {
      throw new Error(`速率限制：模型 ${currentModel} 每分钟最多 ${rpmLimit} 次请求`);
    }

    // 检查 TPM
    if (usage.tokens + estimatedTokens > tpmLimit) {
      throw new Error(`速率限制：模型 ${currentModel} 每分钟最多 ${tpmLimit} Token`);
    }
    
    // 检查 RPD (如果有设置)
    if (rpdLimit > 0 && usage.requestsToday >= rpdLimit) {
      throw new Error(`速率限制：模型 ${currentModel} 每天最多 ${rpdLimit} 次请求`);
    }
  }

  /**
   * 增加使用计数器
   * @param {number} tokens - 使用的 Token 数
   */
  incrementUsage(tokens = 0) {
    const currentModel = this.model || 'default';
    const usage = this._getModelUsage(currentModel);
    
    usage.requests++;
    usage.tokens += tokens;
    usage.requestsToday++;
  }

  /**
   * 睡眠辅助函数
   * @param {number} ms - 睡眠毫秒数
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 从响应文本中提取 JSON
   * @param {string} text - 响应文本
   * @returns {object} 解析后的 JSON
   */
  extractJson(text) {
    // 尝试从 markdown 代码块或原始 JSON 中提取 JSON
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                      text.match(/(\[[\s\S]*\])/) || 
                      text.match(/(\{[\s\S]*\})/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        throw new Error('Failed to parse JSON from AI response');
      }
    }
    
    throw new Error('No valid JSON found in response');
  }

  /**
   * 发起补全请求 - 必须由子类实现
   * @param {string} prompt - 用户提示词
   * @param {string} systemInstruction - 系统指令
   * @param {object} options - 额外选项
   * @returns {Promise<string>} 响应文本
   */
  async complete(prompt, systemInstruction = null, options = {}) {
    throw new Error('complete() must be implemented by subclass');
  }

  /**
   * 获取此提供商的可用模型
   * @returns {Array<{id: string, name: string, description: string}>}
   */
  getAvailableModels() {
    throw new Error('getAvailableModels() must be implemented by subclass');
  }

  /**
   * 获取提供商信息
   * @returns {object}
   */
  getInfo() {
    return {
      name: this.providerName,
      displayName: this.displayName,
      configured: this.isConfigured(),
      model: this.model,
      models: this.getAvailableModels()
    };
  }
}

module.exports = { BaseProvider };
