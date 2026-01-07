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
    
    // 速率限制
    this.requestsPerMinute = config.requestsPerMinute || 60;
    this.tokensPerMinute = config.tokensPerMinute || 100000;
    this.minuteWindowStart = Date.now();
    this.requestsInMinute = 0;
    this.tokensInMinute = 0;
  }

  /**
   * 设置 API 密钥
   * @param {string} key - API 密钥
   */
  setApiKey(key) {
    this.apiKey = key;
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
   * @param {string} model - 模型名称
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
    if (now - this.minuteWindowStart > 60000) {
      this.minuteWindowStart = now;
      this.requestsInMinute = 0;
      this.tokensInMinute = 0;
    }

    if (this.requestsInMinute >= this.requestsPerMinute) {
      throw new Error(`速率限制：每分钟最多${this.requestsPerMinute}次请求`);
    }

    if (this.tokensInMinute + estimatedTokens > this.tokensPerMinute) {
      throw new Error(`速率限制：每分钟最多${this.tokensPerMinute} Token`);
    }
  }

  /**
   * 增加使用计数器
   * @param {number} tokens - 使用的 Token 数
   */
  incrementUsage(tokens = 0) {
    this.requestsInMinute++;
    this.tokensInMinute += tokens;
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
