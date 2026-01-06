/**
 * Base AI Provider - Abstract class for all AI providers
 * All providers must implement these methods
 */

class BaseProvider {
  constructor(config = {}) {
    this.apiKey = config.apiKey || null;
    this.model = config.model || null;
    this.baseUrl = config.baseUrl || null;
    this.providerName = 'base';
    this.displayName = 'Base Provider';
    
    // Rate limiting
    this.requestsPerMinute = config.requestsPerMinute || 60;
    this.tokensPerMinute = config.tokensPerMinute || 100000;
    this.minuteWindowStart = Date.now();
    this.requestsInMinute = 0;
    this.tokensInMinute = 0;
  }

  /**
   * Set the API key
   * @param {string} key - API key
   */
  setApiKey(key) {
    this.apiKey = key;
  }

  /**
   * Get current API key
   * @returns {string|null}
   */
  getApiKey() {
    return this.apiKey;
  }

  /**
   * Set the model
   * @param {string} model - Model name
   */
  setModel(model) {
    this.model = model;
  }

  /**
   * Get current model
   * @returns {string|null}
   */
  getModel() {
    return this.model;
  }

  /**
   * Check if the provider is configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Check rate limits before making a request
   * @param {number} estimatedTokens - Estimated tokens for this request
   * @throws {Error} If rate limits exceeded
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
   * Increment usage counters
   * @param {number} tokens - Tokens used
   */
  incrementUsage(tokens = 0) {
    this.requestsInMinute++;
    this.tokensInMinute += tokens;
  }

  /**
   * Sleep helper
   * @param {number} ms - Milliseconds to sleep
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Extract JSON from response text
   * @param {string} text - Response text
   * @returns {object} Parsed JSON
   */
  extractJson(text) {
    // Try to extract JSON from markdown code blocks or raw JSON
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
   * Make a completion request - MUST BE IMPLEMENTED BY SUBCLASS
   * @param {string} prompt - User prompt
   * @param {string} systemInstruction - System instruction
   * @param {object} options - Additional options
   * @returns {Promise<string>} Response text
   */
  async complete(prompt, systemInstruction = null, options = {}) {
    throw new Error('complete() must be implemented by subclass');
  }

  /**
   * Get available models for this provider
   * @returns {Array<{id: string, name: string, description: string}>}
   */
  getAvailableModels() {
    throw new Error('getAvailableModels() must be implemented by subclass');
  }

  /**
   * Get provider info
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
