/**
 * 统一 AI 服务
 * 管理 AI 提供商并处理内容生成的主要服务
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { createProvider, getAvailableProviders, getProvidersGroupedByRegion } = require('./providers/index.cjs');

class AIService {
  constructor() {
    this.provider = null;
    this.providerId = null;
    this.apiKey = null;
    this.model = null;
    this.accountId = null; // 用于 Cloudflare
    
    // 配额耗尽状态 Map <providerId, timestamp>
    // 记录每个提供商的配额耗尽时间
    this.quotaStatus = new Map();
    
    // 加载保存的配置
    this.loadConfig();
    
    // 如果存在配置，初始化提供商
    if (this.providerId && this.apiKey) {
      this.initProvider();
    }
  }

  /**
   * 获取当前提供商的配额耗尽时间
   */
  get quotaExhaustedTime() {
    return this.providerId ? (this.quotaStatus.get(this.providerId) || null) : null;
  }
  
  /**
   * 检查当前提供商配额是否耗尽
   * 如果配额已耗尽超过5分钟，自动重置标志
   */
  isQuotaExhausted() {
    if (!this.providerId) return false;
    
    const exhaustedTime = this.quotaStatus.get(this.providerId);
    if (!exhaustedTime) return false;
    
    // 如果配额耗尽超过5分钟，自动重置（允许用户再次尝试）
    const QUOTA_RESET_TIME = 5 * 60 * 1000; // 5分钟
    if ((Date.now() - exhaustedTime) > QUOTA_RESET_TIME) {
      console.log(`[AIService] 配额耗尽标志已自动重置（超过5分钟）: ${this.providerId}`);
      this.resetQuotaFlag();
      return false;
    }
    
    return true;
  }
  
  /**
   * 设置当前提供商配额耗尽标志
   */
  setQuotaExhausted() {
    if (!this.providerId) return;
    
    this.quotaStatus.set(this.providerId, Date.now());
    console.error(`[AIService] ⛔ 配额耗尽标志已设置: ${this.providerId}，后续请求将被阻止`);
  }
  
  /**
   * 重置当前提供商配额耗尽标志
   */
  resetQuotaFlag() {
    if (!this.providerId) return;
    
    this.quotaStatus.delete(this.providerId);
    console.log(`[AIService] ✓ 配额耗尽标志已重置: ${this.providerId}`);
  }

  // ============================================
  // 配置管理
  // ============================================

  getConfigPath() {
    const appDataFolder = app.getPath('userData');
    if (!fs.existsSync(appDataFolder)) {
      fs.mkdirSync(appDataFolder, { recursive: true });
    }
    return path.join(appDataFolder, 'ai-config.json');
  }

  loadConfig() {
    const configPath = this.getConfigPath();
    if (fs.existsSync(configPath)) {
      try {
        const data = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(data);
        this.providerId = config.providerId || 'gemini';
        this.apiKey = config.apiKey || null;
        this.model = config.model || null;
        this.accountId = config.accountId || null;
        return config;
      } catch (e) {
        console.error('[AIService] Failed to load config:', e);
        return {};
      }
    }
    return {};
  }

  saveConfig() {
    const configPath = this.getConfigPath();
    const config = {
      providerId: this.providerId,
      apiKey: this.apiKey,
      model: this.model,
      accountId: this.accountId,
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  initProvider() {
    if (!this.providerId) {
      console.error('[AIService] No provider ID set');
      return false;
    }

    try {
      this.provider = createProvider(this.providerId, {
        apiKey: this.apiKey,
        model: this.model,
        accountId: this.accountId,
      });
      console.log(`[AIService] Initialized provider: ${this.providerId}`);
      return true;
    } catch (e) {
      console.error('[AIService] Failed to initialize provider:', e);
      return false;
    }
  }

  // ============================================
  // 提供商管理
  // ============================================

  setProvider(providerId) {
    this.providerId = providerId;
    // 切换提供商时重置模型
    const providers = getAvailableProviders();
    const providerInfo = providers.find(p => p.id === providerId);
    if (providerInfo) {
      this.model = providerInfo.defaultModel;
    }
    this.saveConfig();
    this.initProvider();
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.saveConfig();
    if (this.provider) {
      this.provider.setApiKey(apiKey);
    } else {
      this.initProvider();
    }
  }

  setModel(model) {
    this.model = model;
    this.saveConfig();
    if (this.provider) {
      this.provider.setModel(model);
    }
  }

  setAccountId(accountId) {
    this.accountId = accountId;
    this.saveConfig();
    if (this.provider && typeof this.provider.setAccountId === 'function') {
      this.provider.setAccountId(accountId);
    }
  }

  isConfigured() {
    return !!this.apiKey && !!this.providerId;
  }

  getStatus() {
    return {
      configured: this.isConfigured(),
      providerId: this.providerId,
      model: this.model,
      providerName: this.provider?.displayName || null,
    };
  }

  getProviders() {
    return getAvailableProviders();
  }

  getProvidersGrouped() {
    return getProvidersGroupedByRegion();
  }

  // ============================================
  // 工具方法
  // ============================================

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 测试 API 连接是否正常
   * @returns {Promise<{success: boolean, message: string, responseTime?: number}>}
   */
  async testConnection() {
    // 1. 检查基本配置
    if (!this.providerId) {
      return { success: false, message: 'AI 提供商未选择' };
    }

    if (!this.apiKey) {
      return { success: false, message: 'API 密钥未设置' };
    }

    // 2. 确保提供商已初始化
    if (!this.provider) {
      if (!this.initProvider()) {
        return { success: false, message: 'AI 提供商初始化失败' };
      }
    }

    // 3. 确保 provider 的 apiKey 是最新的
    if (this.provider.getApiKey() !== this.apiKey) {
      this.provider.setApiKey(this.apiKey);
    }

    // 4. 确保 provider 的 model 是最新的
    if (this.model && this.provider.getModel() !== this.model) {
      this.provider.setModel(this.model);
    }

    // 5. 对于 Cloudflare，还需要检查 accountId
    if (this.providerId === 'cloudflare') {
      if (!this.accountId) {
        return { success: false, message: 'Cloudflare Account ID 未设置' };
      }
      if (typeof this.provider.setAccountId === 'function') {
        this.provider.setAccountId(this.accountId);
      }
    }

    const startTime = Date.now();
    try {
      console.log(`[AIService] 测试连接: ${this.providerId} / ${this.model}`);
      
      // 6. 发送一个简单的测试请求
      const response = await this.provider.complete(
        '请回复"OK"两个字母。',
        null,
        { maxTokens: 20 }  // 进一步限制输出长度，节省配额
      );
      
      const responseTime = Date.now() - startTime;
      
      // 7. 验证响应
      if (response && response.length > 0) {
        console.log(`[AIService] 测试成功: ${responseTime}ms`);
        return {
          success: true,
          message: `${this.provider.displayName} 连接正常`,
          responseTime
        };
      } else {
        return { success: false, message: '收到空响应，请检查 API 配置' };
      }
    } catch (error) {
      console.error(`[AIService] 测试失败:`, error.message);
      
      // 8. 提供更友好的错误信息
      // 整合硅基流动 + Google Gemini + 通用 OpenAI 兼容 API 的错误码
      let errorMessage = error.message;
      const msg = errorMessage.toLowerCase();
      
      // ========================================
      // 4xx 客户端错误
      // ========================================
      
      // 400 Bad Request - 请求参数不正确
      // 硅基流动: max_tokens 设置过高
      // Gemini: INVALID_ARGUMENT (请求格式错误), FAILED_PRECONDITION (免费层不可用/未启用计费)
      if (msg.includes('400') || msg.includes('bad request') || msg.includes('invalid request') || msg.includes('invalid_request') || msg.includes('invalid_argument')) {
        if (msg.includes('max_tokens') || msg.includes('max_total_tokens') || msg.includes('max_seq_len') || msg.includes('maxoutputtokens')) {
          errorMessage = '请求参数错误：max_tokens 设置过高，请减少生成长度';
        } else if (msg.includes('failed_precondition') || msg.includes('precondition') || msg.includes('not available in your country') || msg.includes('billing')) {
          errorMessage = 'Gemini API 在当前地区不可用，或需要启用 Google Cloud 计费';
        } else if (msg.includes('model') || msg.includes('invalid_model')) {
          errorMessage = '请求参数错误：模型名称无效，请检查模型配置';
        } else if (msg.includes('api_key') || msg.includes('apikey')) {
          errorMessage = 'API 密钥格式错误，请检查密钥是否完整';
        } else {
          errorMessage = '请求参数错误，请检查 API 配置是否正确';
        }
      }
      // 401 Unauthorized - API Key 无效
      // 硅基流动: API Key 设置不正确
      // Gemini: API key 无效/泄露被封/端点配置错误/区域限制
      else if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('invalid api key') || msg.includes('invalid_api_key') || msg.includes('authentication') || msg.includes('api key not valid')) {
        if (msg.includes('leaked') || msg.includes('blocked') || msg.includes('revoked')) {
          errorMessage = 'API 密钥已被撤销或封禁，请重新生成密钥';
        } else if (msg.includes('endpoint') || msg.includes('vertex')) {
          errorMessage = 'API 端点配置错误，请确认使用正确的 API 格式';
        } else if (msg.includes('region') || msg.includes('country') || msg.includes('地区')) {
          errorMessage = 'API 在当前地区不可用，请检查是否需要代理';
        } else {
          errorMessage = 'API 密钥无效，请检查密钥是否正确';
        }
      }
      // 402 Payment Required - 需要付费/余额不足
      else if (msg.includes('402') || msg.includes('payment required') || msg.includes('insufficient_quota') || msg.includes('billing') || msg.includes('insufficient quota')) {
        errorMessage = '账户余额不足或需要启用付费，请前往平台充值';
      }
      // 403 Forbidden - 权限不足
      // 硅基流动: 【未实名认证】最常见，余额不足，无模型权限
      // Gemini: PERMISSION_DENIED (API key 权限不足/微调模型未认证/违反服务条款)
      else if (msg.includes('403') || msg.includes('forbidden') || msg.includes('permission_denied') || msg.includes('permission denied') || msg.includes('权限不足')) {
        if (msg.includes('实名') || msg.includes('认证') || msg.includes('verify') || msg.includes('verification') || msg.includes('identity')) {
          errorMessage = '账户未实名认证，请先完成实名认证后重试';
        } else if (msg.includes('tuned') || msg.includes('fine-tune') || msg.includes('finetune')) {
          errorMessage = '微调模型权限不足，请检查模型访问权限';
        } else if (msg.includes('terms') || msg.includes('tos') || msg.includes('policy') || msg.includes('violation')) {
          errorMessage = '请求可能违反服务条款，请检查输入内容';
        } else if (msg.includes('余额') || msg.includes('balance') || msg.includes('quota') || msg.includes('credit')) {
          errorMessage = '账户余额不足或已欠费，请充值后重试';
        } else if (msg.includes('region') || msg.includes('country') || msg.includes('地区') || msg.includes('location')) {
          errorMessage = 'API 在当前地区受限，请检查是否需要代理';
        } else {
          errorMessage = '权限不足，请检查：1.是否已实名认证 2.账户余额是否充足 3.是否有该模型的使用权限 4.是否需要代理访问';
        }
      }
      // 404 Not Found - 资源/模型不存在
      // Gemini: 文件/模型不存在，参数对当前 API 版本无效
      else if (msg.includes('404') || msg.includes('not found') || msg.includes('model not found') || msg.includes('does not exist') || msg.includes('no such model') || msg.includes('resource not found')) {
        if (msg.includes('file') || msg.includes('image') || msg.includes('video') || msg.includes('audio')) {
          errorMessage = '引用的文件资源不存在，请检查文件路径';
        } else if (msg.includes('version') || msg.includes('api version')) {
          errorMessage = 'API 版本不支持此参数，请检查 API 配置';
        } else {
          errorMessage = '模型不存在或已下线，请选择其他可用模型';
        }
      }
      // 405 Method Not Allowed - 方法不允许
      else if (msg.includes('405') || msg.includes('method not allowed')) {
        errorMessage = 'API 端点配置错误，请检查提供商设置';
      }
      // 408 Request Timeout - 请求超时
      else if (msg.includes('408') || msg.includes('timeout') || msg.includes('timed out') || msg.includes('超时') || msg.includes('deadline_exceeded') || msg.includes('deadline exceeded')) {
        errorMessage = '请求超时，建议：1.检查网络 2.减少输入内容 3.稍后重试';
      }
      // 409 Conflict - 冲突
      else if (msg.includes('409') || msg.includes('conflict')) {
        errorMessage = '请求冲突，请稍后重试';
      }
      // 413 Payload Too Large - 请求体过大
      else if (msg.includes('413') || msg.includes('payload too large') || msg.includes('request entity too large') || msg.includes('too long') || msg.includes('too large')) {
        errorMessage = '输入内容过长，请减少文本长度';
      }
      // 415 Unsupported Media Type - 不支持的媒体类型
      else if (msg.includes('415') || msg.includes('unsupported media type')) {
        errorMessage = '请求格式不支持，请联系开发者';
      }
      // 422 Unprocessable Entity - 无法处理的请求
      else if (msg.includes('422') || msg.includes('unprocessable') || msg.includes('validation failed') || msg.includes('validation error')) {
        errorMessage = '请求参数验证失败，请检查模型和参数配置';
      }
      // 429 Too Many Requests - 速率限制/限流
      // 硅基流动: TPM/RPM/IPM/IPD 限流
      // Gemini: RESOURCE_EXHAUSTED (超出速率限制，免费层限制较严)
      else if (msg.includes('429') || msg.includes('too many requests') || msg.includes('rate limit') || msg.includes('ratelimit') || msg.includes('resource_exhausted') || msg.includes('resource exhausted') || msg.includes('配额') || msg.includes('quota exceeded') || msg.includes('quota_exceeded')) {
        if (msg.includes('tpm') || msg.includes('tokens per minute')) {
          errorMessage = '每分钟 Token 数已达上限（TPM 限流），请稍后重试';
        } else if (msg.includes('rpm') || msg.includes('requests per minute')) {
          errorMessage = '每分钟请求数已达上限（RPM 限流），请稍后重试';
        } else if (msg.includes('rpd') || msg.includes('requests per day') || msg.includes('daily') || msg.includes('per day')) {
          errorMessage = '今日请求次数已达上限（每日限额），请明天再试';
        } else if (msg.includes('free') || msg.includes('免费')) {
          errorMessage = '免费额度已用尽，请升级付费计划或稍后重试';
        } else {
          errorMessage = 'API 请求频率过高，已触发限流，请稍后重试';
        }
      }
      
      // ========================================
      // 5xx 服务器错误
      // ========================================
      
      // 500 Internal Server Error - 服务异常
      // Gemini: INTERNAL (Google 服务器意外错误)
      else if (msg.includes('500') || msg.includes('internal server error') || msg.includes('internal error') || msg.includes('internal') || msg.includes('服务异常')) {
        errorMessage = 'AI 服务内部错误，建议：1.减少输入内容 2.尝试其他模型 3.稍后重试';
      }
      // 501 Not Implemented - 功能未实现
      else if (msg.includes('501') || msg.includes('not implemented')) {
        errorMessage = '该功能暂未支持';
      }
      // 502 Bad Gateway - 网关错误
      else if (msg.includes('502') || msg.includes('bad gateway')) {
        errorMessage = 'AI 服务网关错误，请稍后重试';
      }
      // 503 Service Unavailable - 服务不可用/过载
      // 硅基流动: 服务负载高
      // Gemini: UNAVAILABLE (服务过载或维护)
      else if (msg.includes('503') || msg.includes('service unavailable') || msg.includes('unavailable') || msg.includes('overloaded') || msg.includes('过载') || msg.includes('负载') || msg.includes('maintenance')) {
        errorMessage = 'AI 服务暂时不可用，建议：1.错峰使用 2.选择其他模型 3.稍后重试';
      }
      // 504 Gateway Timeout - 网关超时
      // Gemini: DEADLINE_EXCEEDED (处理超时)
      else if (msg.includes('504') || msg.includes('gateway timeout') || msg.includes('deadline') || msg.includes('processing time')) {
        errorMessage = 'AI 服务响应超时，建议：1.减少输入内容 2.增加超时时间 3.稍后重试';
      }
      // 529 Site is overloaded - 站点过载（Cloudflare 特有）
      else if (msg.includes('529') || msg.includes('site is overloaded')) {
        errorMessage = 'AI 服务过载，请稍后重试';
      }
      
      // ========================================
      // 网络相关错误
      // ========================================
      
      else if (msg.includes('fetch failed') || msg.includes('network error') || msg.includes('enotfound') || msg.includes('econnrefused') || msg.includes('无法连接') || msg.includes('failed to fetch')) {
        if (msg.includes('googleapis') || msg.includes('google') || msg.includes('gemini')) {
          errorMessage = '无法连接到 Google 服务器，请检查是否需要代理才能访问';
        } else {
          errorMessage = '网络连接失败，请检查：1.网络是否正常 2.是否需要代理';
        }
      }
      else if (msg.includes('econnreset') || msg.includes('connection reset') || msg.includes('socket hang up')) {
        errorMessage = '网络连接被重置，请检查网络稳定性后重试';
      }
      else if (msg.includes('etimedout') || msg.includes('connect etimedout') || msg.includes('connection timed out')) {
        errorMessage = '网络连接超时，请检查网络或尝试使用代理';
      }
      else if (msg.includes('ssl') || msg.includes('certificate') || msg.includes('cert') || msg.includes('tls')) {
        errorMessage = 'SSL/TLS 连接失败，请检查系统时间和网络环境';
      }
      else if (msg.includes('dns') || msg.includes('getaddrinfo') || msg.includes('域名') || msg.includes('resolve')) {
        errorMessage = 'DNS 解析失败，请检查网络设置或更换 DNS';
      }
      else if (msg.includes('proxy') || msg.includes('tunnel') || msg.includes('代理') || msg.includes('407')) {
        errorMessage = '代理连接失败，请检查代理服务器设置';
      }
      
      // ========================================
      // AI 服务特定错误
      // ========================================
      
      // 上下文长度限制
      else if (msg.includes('context length') || msg.includes('context_length') || msg.includes('token limit') || msg.includes('max_seq_len') || msg.includes('context window') || msg.includes('input too long')) {
        errorMessage = '输入内容超过模型最大上下文长度，请减少输入内容';
      }
      // 内容安全过滤
      // Gemini: 内容安全检查较严格
      else if (msg.includes('content filter') || msg.includes('content_filter') || msg.includes('safety') || msg.includes('blocked') || msg.includes('moderation') || msg.includes('违规') || msg.includes('harmful') || msg.includes('unsafe')) {
        errorMessage = '内容触发安全过滤，请修改输入内容后重试';
      }
      // Gemini 特定: 候选内容被过滤
      else if (msg.includes('candidate') || msg.includes('finish_reason') || msg.includes('block_reason')) {
        errorMessage = 'AI 生成的内容被安全策略拦截，请尝试修改提示词';
      }
      // 模型错误
      else if (msg.includes('invalid model') || msg.includes('model_not_found') || msg.includes('model error') || msg.includes('unsupported model')) {
        errorMessage = '模型不可用或配置错误，请选择其他模型';
      }
      // 空响应
      else if (msg.includes('empty response') || msg.includes('no response') || msg.includes('空响应') || msg.includes('no candidates') || msg.includes('no content')) {
        errorMessage = '服务返回空响应，可能是内容被过滤，请稍后重试或修改输入';
      }
      // JSON 解析错误
      else if (msg.includes('json') || msg.includes('parse error') || msg.includes('解析') || msg.includes('unexpected token')) {
        errorMessage = '响应格式错误，请稍后重试';
      }
      // API 版本错误
      else if (msg.includes('api version') || msg.includes('deprecated') || msg.includes('版本')) {
        errorMessage = 'API 版本不兼容，请联系开发者更新';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  extractJson(text) {
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

  // ============================================
  // 内容生成方法
  // ============================================

  async complete(prompt, systemInstruction = null, options = {}) {
    // 检查配额是否耗尽
    if (this.isQuotaExhausted()) {
      throw new Error('AI配额已耗尽，请等待5分钟后重试或检查API密钥配额。');
    }
    
    if (!this.provider) {
      if (!this.initProvider()) {
        throw new Error('AI provider not configured');
      }
    }
    
    try {
      return await this.provider.complete(prompt, systemInstruction, options);
    } catch (error) {
      // 在 complete 层面也检测配额错误，设置标志
      if (error.message && (error.message.includes('配额') || error.message.includes('Quota') || error.message.includes('quota'))) {
        this.setQuotaExhausted();
      }
      throw error;
    }
  }

  /**
   * 根据学习内容生成题目
   * 
   * 生成策略：
   * - 每批次生成30道题目（BATCH_SIZE = 30）
   * - 总共最多4个批次（MAX_BATCHES = 4），最多生成120道题目
   * - 每批次失败时，间隔15秒后重试，最多重试3次（MAX_RETRIES = 3）
   * - 3次重试都失败后，强制停止当前批次，继续下一批次或结束
   * - 避免程序因AI超时而卡死
   */
  async generateQuestions(content, options = {}) {
    let {
      count = 120,
      types = ['Single', 'Multi', 'TrueFalse'],
    } = options;

    // 注意：difficulty参数已移除，1-5难度现在用于游戏机制（怪物血量、伤害），不影响题目生成

    // 确保最少生成120道题目
    if (count < 120) {
      count = 120;
    }

    // 配置参数
    const BATCH_SIZE = 30;           // 每批次生成30道题目
    const MAX_BATCHES = 4;           // 最多4个批次（30 x 4 = 120题）
    const MAX_RETRIES = 3;           // 每批次最多重试3次
    const RETRY_DELAY_MS = 15000;    // 失败后等待15秒再重试
    const BATCH_DELAY_MS = 3000;     // 批次之间等待3秒

    let allQuestions = [];

    for (let batch = 0; batch < MAX_BATCHES; batch++) {
      // 批次之间等待
      if (batch > 0) {
        console.log(`[AIService] 等待 ${BATCH_DELAY_MS / 1000}s 后开始第 ${batch + 1} 批次...`);
        await this.sleep(BATCH_DELAY_MS);
      }

      const batchCount = Math.min(BATCH_SIZE, count - allQuestions.length);
      
      // 如果已经生成够了，直接停止
      if (batchCount <= 0) {
        console.log('[AIService] 已达到目标数量，停止生成');
        break;
      }

      let batchSuccess = false;
      let retryCount = 0;

      // 重试循环：最多重试3次
      while (!batchSuccess && retryCount < MAX_RETRIES) {
        try {
          console.log(`[AIService] 批次 ${batch + 1}/${MAX_BATCHES}，尝试 ${retryCount + 1}/${MAX_RETRIES}，生成 ${batchCount} 道题目...`);
          
          const batchQuestions = await this._generateQuestionBatch(content, {
            count: batchCount,
            types,
            batchIndex: batch,
            existingCount: allQuestions.length,
            previousQuestions: allQuestions.map(q => q.text),
          });
          
          if (batchQuestions && batchQuestions.length > 0) {
            allQuestions = allQuestions.concat(batchQuestions);
            console.log(`[AIService] 批次 ${batch + 1} 成功，生成了 ${batchQuestions.length} 道题目，总计 ${allQuestions.length} 道`);
            batchSuccess = true;
          } else {
            throw new Error('AI返回的题目数组为空');
          }
        } catch (error) {
          retryCount++;
          console.error(`[AIService] 批次 ${batch + 1} 第 ${retryCount} 次尝试失败:`, error.message);
          
          // 检查是否是配额错误，配额错误直接停止所有生成并设置全局标志
          if (error.message && (error.message.includes('配额') || error.message.includes('Quota') || error.message.includes('quota'))) {
            console.error('[AIService] ⛔ 检测到配额限制，强制停止所有生成并阻止后续请求');
            this.setQuotaExhausted();  // 设置全局配额耗尽标志
            return allQuestions.slice(0, count);
          }
          
          // 如果还有重试机会，等待15秒后重试
          if (retryCount < MAX_RETRIES) {
            console.log(`[AIService] 等待 ${RETRY_DELAY_MS / 1000}s 后进行第 ${retryCount + 1} 次重试...`);
            await this.sleep(RETRY_DELAY_MS);
          }
        }
      }

      // 如果该批次重试3次都失败了
      if (!batchSuccess) {
        console.error(`[AIService] 批次 ${batch + 1} 重试 ${MAX_RETRIES} 次均失败，强制停止所有生成`);
        break;
      }
      
      // 如果已经生成够了，直接停止
      if (allQuestions.length >= count) {
        console.log(`[AIService] 已生成 ${allQuestions.length} 道题目，达到目标，停止生成`);
        break;
      }
    }

    console.log(`[AIService] 题目生成完成，最终生成 ${allQuestions.length} 道题目`);
    return allQuestions.slice(0, count);
  }

  async _generateQuestionBatch(content, options) {
    const { count, types, batchIndex, existingCount, previousQuestions = [] } = options;

    const systemInstruction = `你是《智者计划：学习飞升》的首席知识架构师。
【世界观背景】
宇宙是一个巨大的运行程序。每隔一个学期纪元，被称为"大过滤器"的灾难就会降临。玩家是"第13纪元"的最后一位英桀，代号"首席智者"。

【绝对限制 - 违反者将被系统抹除】
1. 内容来源：所有题目的**题干**和**选项**必须【完全基于】提供的【知识碎片数据流】。不要编造资料中不存在的概念。
2. 答案逻辑：如果输入资料是习题集（只有题目没有答案），你必须利用你的 **逻辑推理能力** 和 **内建知识** 来分析并确定正确的选项。 **绝对禁止随机指定正确答案！** 必须确保\`correctOptionIndex\`指向客观正确的选项。
3. 严禁重复：必须检查【已生成题目列表】，确保新生成的题目与已有题目不重复。
4. 数量保证：必须生成 ${count} 道题。

【题目设计准则】
1. 深度挖掘：对于知识点，从定义、应用、反例等角度出题。
2. 干扰项：错误选项应是常见误解。
3. 解析深度：解析必须解释"为什么选这个"，如果原资料有解释则引用，如果没有则基于逻辑补充。

【注意】difficulty字段统一设为3，该字段将由用户手动调整用于游戏机制。

【重要】必须严格生成 ${count} 道题目！确保答案准确无误！`;

    const prompt = `【逻辑重构请求 - 第${batchIndex + 1}批次】

首席智者，请生成 ${count} 道"真理验证"挑战（这是第${batchIndex + 1}批，之前已生成${existingCount}道）。

【已生成题目列表（禁止重复）】
${previousQuestions.length > 0 ? previousQuestions.map((q, i) => `${i+1}. ${q}`).join('\n') : '无'}

【知识碎片数据流（仅限使用以下内容，但需自动分析正确答案）】
${content}

【输出协议】
返回纯JSON数组，包含 ${count} 道题目：

[
  {
    "id": "q-${batchIndex}xxxx",
    "text": "题目内容",
    "type": "Single|Multi|TrueFalse",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correctOptionIndex": 0, // 必须是经过逻辑分析后的正确答案索引
    "difficulty": 1, // 固定为1，用户会手动调整用于游戏机制
    "timeLimit": 建议秒数,
    "explanation": "详细解析（解释为什么该选项正确）",
    "tags": ["知识点标签"]
  }
]

【生成策略】
- 必须生成 ${count} 道题目
- **核心要求**：如果输入是题目，请务必**做题**，选出正确答案。如果输入是知识点，请据此出题。
- 绝对不要重复已有的题目
- difficulty字段统一设为1
- 题型配比：${types.join(', ')}

立即输出包含 ${count} 道题目的JSON数组：`;

    // 根据提供商调整 maxTokens
    // Gemini 支持超长上下文，可以设置很大
    // 其他提供商（如 SiliconFlow）通常限制在 32k 或 64k，设置过大会导致 "max_total_tokens > max_seq_len" 错误
    const maxTokens = this.providerId === 'gemini' ? 100000 : 8192;
    const response = await this.complete(prompt, systemInstruction, { maxTokens });
    const questions = this.extractJson(response);
    
    if (!Array.isArray(questions)) {
      console.warn('[AIService] Invalid question format, returning empty array');
      return [];
    }
    
    console.log(`[AIService] Batch ${batchIndex + 1}: requested ${count}, generated ${questions.length}`);
    return questions;
  }

  /**
   * 根据内容生成知识树结构
   */
  async generateKnowledgeTree(content) {
    const systemInstruction = `你是《智者计划》的星图测绘师，负责将学习资料转化为可探索的"知识星域"。

【世界观】
在智者计划的宇宙中，知识以"星图扇区"的形式存在。每个扇区都可能被"认知熵"侵蚀，玩家需要逐个攻克这些扇区来重建逻辑框架。

【扇区设计原则】
1. 层级递进：从"初始引导扇区"到"奇点抖动"，难度逐步提升
2. 前置依赖：高级扇区需要先攻克基础扇区
3. 熵状态：STABLE(稳定)、HIGH_ENTROPY(高熵警告)、LOCKED(锁定)
4. 命名风格：使用计算机/科幻术语，如"虚存的迷宫"、"并发的洪流"、"协议的废墟"`;

    const prompt = `【星图测绘请求】

请分析以下学习内容，生成知识星域结构：

${content}

返回JSON格式：
{
  "nodes": [
    {
      "id": "sector-xxx",
      "name": "扇区名称（如：初始引导扇区、虚存的迷宫）",
      "description": "扇区描述，包含熵状态和危险等级",
      "difficulty": 1-6,
      "prerequisites": ["前置扇区ID数组"],
      "position": { "x": 0-100, "y": 0-100 },
      "questionCount": 题目数量(难度x10),
      "isBoss": 是否为Boss扇区,
      "status": "STABLE|HIGH_ENTROPY|LOCKED",
      "topics": ["涵盖的具体知识点"]
    }
  ],
  "metadata": {
    "totalNodes": 总扇区数,
    "estimatedDuration": "预计学习时长",
    "suggestedOrder": ["建议的攻克顺序ID"]
  }
}

请只返回JSON，不要其他内容。`;

    const response = await this.complete(prompt, systemInstruction);
    return this.extractJson(response);
  }

  /**
   * 根据主题生成敌人数据
   */
  async generateEnemies(topic, difficulty = 3) {
    const systemInstruction = `你是《智者计划》的认知熵实体设计师。

【敌人背景】
认知熵实体是由未掌握的知识点异化而成的数据幽灵。它们窃取人类的知识碎片，将其扭曲为攻击武器。玩家必须通过正确答题来击败它们，夺回被窃取的知识。

【实体类型】
- WHITE_NOISE（白噪干扰者）：低级实体，HP约50，攻击力10，造成选项干扰
- IMAGINARY_COLLAPSE（虚数崩坏体）：中级实体，HP约120，攻击力25，可能导致时间压缩
- SINGULARITY（奇点抖动）：Boss级实体，HP约300，攻击力40，拥有"熵值暴涨"等强力技能

【命名风格】
使用"形容词·名词"格式，如"白噪·干扰者"、"虚数·崩坏体"、"递归·死循环"`;

    const prompt = `【认知熵实体生成请求】

为主题"${topic}"生成敌人数据，难度等级${difficulty}：

返回JSON格式：
[
  {
    "id": "entropy-xxx",
    "name": "实体名称（如：白噪·干扰者）",
    "form": "WHITE_NOISE|IMAGINARY_COLLAPSE|SINGULARITY",
    "hp": 血量,
    "maxHp": 最大血量,
    "damage": 攻击力,
    "visualGlitchIntensity": 0-1的故障特效强度,
    "specialAbility": {
      "name": "技能名称",
      "description": "技能描述",
      "triggerCondition": "触发条件"
    }
  }
]

根据难度${difficulty}，生成合适数量和强度的敌人。
请只返回JSON数组，不要其他内容。`;

    const response = await this.complete(prompt, systemInstruction);
    return this.extractJson(response);
  }

  /**
   * 生成完整的章节数据
   */
  async generateChapter(title, content, difficulty = 3) {
    const systemInstruction = `你是《智者计划：学习飞升》的星域扇区设计师。

【任务】
为首席智者设计一个完整可玩的知识扇区，包含认知熵实体（敌人）和真理验证挑战（题目）。

【设计原则】
1. 扇区描述要有科幻感，使用计算机术语
2. 认知熵实体命名使用"形容词·名词"格式
3. 题目数量 = 难度等级 x 10
4. 难度3及以上标记为HIGH_ENTROPY（高熵警告）
5. 奖励经验值 = 难度等级 x 100`;

    const prompt = `【扇区构建请求】

扇区名称：${title}
熵压等级：${difficulty}

知识碎片：
${content}

返回JSON格式：
{
  "sector": {
    "id": "sector-xxx",
    "name": "${title}",
    "description": "扇区描述（科幻风格）",
    "difficulty": ${difficulty},
    "status": "${difficulty >= 3 ? 'HIGH_ENTROPY' : 'STABLE'}",
    "totalQuestions": ${difficulty * 10}
  },
  "entropyEntities": [
    {
      "id": "entropy-xxx",
      "name": "实体名称（如：白噪·干扰者）",
      "form": "WHITE_NOISE|IMAGINARY_COLLAPSE|SINGULARITY",
      "hp": 数值,
      "maxHp": 数值,
      "damage": 数值,
      "visualGlitchIntensity": 0-1
    }
  ],
  "questions": [
    {
      "id": "q-xxx",
      "text": "题目",
      "type": "Single|Multi|TrueFalse",
      "options": ["选项数组"],
      "correctOptionIndex": 正确答案索引,
      "difficulty": 1-${difficulty},
      "timeLimit": 秒数,
      "explanation": "解析",
      "tags": ["标签"]
    }
  ],
  "rewards": {
    "exp": ${difficulty * 100}
  }
}

生成${Math.max(3, difficulty)}个敌人和${difficulty * 10}道题目。
请只返回JSON，不要其他内容。`;

    const maxTokens = this.providerId === 'gemini' ? 100000 : 8192;
    const response = await this.complete(prompt, systemInstruction, { maxTokens });
    return this.extractJson(response);
  }

  /**
   * 生成完整的游戏主题
   */
  async generateTheme(themeName, content) {
    const systemInstruction = `你是一个游戏内容生成专家，正在为一款教育类RPG游戏生成完整的主题配置。
游戏名为"智者计划：飞升学习"，采用赛博朋克+科幻美学风格。

根据用户提供的学习资料，你需要生成以下内容：
1. 页面标签（levelSelect, battle, mindHack）
2. 构造体（玩家角色，3个）
3. 铭文（抽卡物品，3个以上）
4. 战斗日志模板

所有内容必须：
- 与学习资料的主题相关
- 保持赛博朋克/科幻的语言风格
- 使用中文
- 具有教育意义`;

    const prompt = `用户提供的主题关键词: ${themeName}

学习资料内容:
${content.substring(0, 6000)}

请生成一个完整的游戏主题配置。
【重要】主题名称（name字段）需要你根据学习资料内容创造一个富有意境的、符合赛博朋克/科幻风格的名称，不要直接使用用户输入的"${themeName}"这个直白的名称。
例如：如果用户输入"计算机网络"，你可以生成"数据洪流·节点觉醒"或"协议圣殿"这样有意境的名称。

返回JSON格式：
{
  "name": "由AI生成的有意境的主题名称",
  "sourceContent": "基于提供的学习资料",
  "pageLabels": {
    "levelSelect": {
      "title": "根据内容起一个符合主题的标题",
      "subtitle": "英文副标题",
      "sectorAnalysis": "扇区分析的别名",
      "missionBriefing": "任务简报的别名",
      "startButton": "开始按钮文本",
      "backButton": "返回按钮文本",
      "mindHackButton": "抽卡按钮文本"
    },
    "battle": {
      "constructsLabel": "玩家角色区域标签",
      "entropyLabel": "敌人区域标签",
      "battleLogLabel": "战斗日志标签",
      "retreatButton": "撤退按钮文本",
      "turnLabel": "回合标签"
    },
    "mindHack": {
      "title": "抽卡界面标题",
      "subtitle": "英文副标题",
      "hackButton": "抽卡按钮文本",
      "hackingText": "抽卡进行中的提示文本",
      "confirmButton": "确认按钮文本",
      "backButton": "返回按钮文本",
      "warningText": "消耗警告文本"
    }
  },
  "constructs": [
    {
      "id": "construct-01",
      "model": "ARBITER",
      "name": "根据主题起名",
      "title": "英文称号",
      "description": "角色描述",
      "skills": [
        {
          "id": "skill-1",
          "name": "技能名",
          "nameEn": "英文名",
          "description": "技能效果描述"
        }
      ]
    },
    // WEAVER 和 ARCHITECT 类似
  ],
  "inscriptions": [
    {
      "id": "inscription-1",
      "name": "铭文名称（与学习内容相关的概念）",
      "rarity": "SSR|SR|R",
      "description": "铭文效果描述"
    }
  ],
  "battleLogTemplates": {
    "enterSector": "进入扇区消息模板，用{sectorName}表示扇区名",
    "entropyStatus": {
      "stable": "稳定状态文本",
      "highEntropy": "危险状态文本",
      "locked": "锁定状态文本"
    },
    "questionSource": {
      "ai": "AI题目来源标签",
      "builtin": "内置题库来源标签"
    },
    "answerCorrect": "答对消息",
    "answerWrong": "答错消息",
    "skillUsed": "使用技能消息模板，用{constructName}和{skillName}占位",
    "enemyDefeated": "击败敌人消息，用{enemyName}占位",
    "victory": "胜利消息",
    "defeat": "失败消息"
  },
  "sectors": [
    {
      "id": "sector-1",
      "name": "第1关名称（与学习主题相关，有意境）",
      "description": "英文副标题 - 简短的中文描述，难度最低"
    },
    {
      "id": "sector-2",
      "name": "第2关名称",
      "description": "英文副标题 - 简短的中文描述"
    },
    {
      "id": "sector-3",
      "name": "第3关名称",
      "description": "英文副标题 - 简短的中文描述"
    },
    {
      "id": "sector-4",
      "name": "第4关名称",
      "description": "英文副标题 - 简短的中文描述"
    },
    {
      "id": "sector-5",
      "name": "第5关名称",
      "description": "英文副标题 - 简短的中文描述"
    },
    {
      "id": "sector-boss",
      "name": "最终关名称（Boss关，最高难度）",
      "description": "英文副标题 - 简短的中文描述，体现最高挑战"
    }
  ]
}

请生成3个构造体（ARBITER、WEAVER、ARCHITECT各一个）和至少3个铭文。
【重要】sectors数组中的6个扇区名称和描述必须与"${themeName}"学习主题相关，体现从简单到困难的递进。
确保所有内容都与"${themeName}"主题相关。
请只返回JSON，不要其他内容。`;

    const maxTokens = this.providerId === 'gemini' ? 100000 : 8192;
    const response = await this.complete(prompt, systemInstruction, { maxTokens });
    const theme = this.extractJson(response);
    
    if (theme) {
      theme.id = `theme-${Date.now()}`;
      theme.generatedAt = Date.now();
    }
    
    return theme;
  }

  /**
   * 为扇区生成任务简报
   */
  async generateMissionBriefing(sectorName, sectorDescription) {
    const systemInstruction = `你是《智者计划》的战术指挥官，负责向首席智者发布任务简报。
【风格要求】
1. 极简主义：不超过50个字。
2. 科幻/赛博朋克风格：使用"认知熵"、"逻辑框架"、"数据流"、"协议"等术语。
3. 紧迫感：强调任务的重要性和危险性。
4. 动态性：每次生成的简报应略有不同，反映战场的实时变化。`;

    const prompt = `【生成任务简报】
目标扇区：${sectorName}
扇区情报：${sectorDescription}

请生成一条简短的任务简报（Mission Briefing），指导玩家在该扇区的行动。
格式参考："目标：[行动目标]，通过[手段]达成[结果]。" 或 "警告：[异常现象]。任务：[具体行动]。"

请只返回简报文本，不要JSON，不要引号。`;

    const response = await this.complete(prompt, systemInstruction);
    return response.trim();
  }

  /**
   * 为多个扇区生成任务简报
   */
  async generateAllMissionBriefings(sectors) {
    const systemInstruction = `你是《智者计划》的战术指挥官，负责批量发布任务简报。
【风格要求】
1. 极简主义：每条不超过50个字。
2. 科幻/赛博朋克风格：使用"认知熵"、"逻辑框架"、"数据流"、"协议"等术语。
3. 紧迫感：强调任务的重要性和危险性。

请为每个扇区生成一条简报。`;

    const sectorsText = sectors.map((s, i) => `扇区${i+1} [ID:${s.id}]: ${s.name} - ${s.description}`).join('\n');

    const prompt = `【批量生成任务简报】
请为以下扇区生成任务简报：

${sectorsText}

请返回JSON格式，键为扇区ID，值为简报文本：
{
  "sector-id-1": "简报内容...",
  "sector-id-2": "简报内容..."
}
请只返回JSON。`;

    const response = await this.complete(prompt, systemInstruction);
    return this.extractJson(response);
  }

  /**
   * 解析文档内容（用于文本文件）
   */
  async parseDocument(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.txt' || ext === '.md') {
      return fs.readFileSync(filePath, 'utf-8');
    }
    
    throw new Error(`Unsupported file format: ${ext}. Currently supported: .txt, .md`);
  }
}

module.exports = { AIService };
