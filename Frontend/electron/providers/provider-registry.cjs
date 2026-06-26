const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const PROVIDER_REGISTRY = {
  // ============================================
  // 国际提供商 (International Providers)
  // ============================================

  // Google Gemini
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-3.5-flash',
    models: [
      { 
        id: 'gemini-3.5-flash', 
        name: 'gemini-3.5-flash', 
        description: '最新高性价比 3.5 Flash 旗舰模型',
        rateLimits: { rpm: 5, tpm: 250000 }
      },
      { 
        id: 'gemini-3.1-pro', 
        name: 'gemini-3.1-pro', 
        description: '最新旗舰复杂逻辑纯推理模型',
        rateLimits: { rpm: 5, tpm: 250000 }
      },
      { 
        id: 'gemini-3.1-flash-lite', 
        name: 'gemini-3.1-flash-lite', 
        description: '高性价比轻量极速多模态模型',
        rateLimits: { rpm: 5, tpm: 250000 }
      },
    ],
    region: 'international',
    requiresProxy: true,
    note: '前往 Google AI Studio 获取 API Key',
  },

  // ChatGPT
  openai: {
    id: 'openai',
    name: 'ChatGPT',
    type: 'openai-compatible',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-5.4-mini',
    models: [
      { id: 'gpt-5.5', name: 'gpt-5.5', description: '旗舰级多模态深度思考与推理模型', rateLimits: { rpm: 3, tpm: 10000 } },
      { id: 'gpt-5.5-pro', name: 'gpt-5.5-pro', description: '最高算力级多模态极限推理模型', rateLimits: { rpm: 3, tpm: 10000 } },
      { id: 'gpt-5.4', name: 'gpt-5.4', description: '高性价比强力多模态生产力模型', rateLimits: { rpm: 3, tpm: 100000 } },
      { id: 'gpt-5.4-mini', name: 'gpt-5.4-mini', description: '极速低延迟轻量化多模态主力模型', rateLimits: { rpm: 3, tpm: 100000 } },
      { id: 'gpt-5.4-nano', name: 'gpt-5.4-nano', description: '最经济高并发微型极速模型', rateLimits: { rpm: 3, tpm: 100000 } },
    ],
    region: 'international',
    requiresProxy: true,
    note: '前往 OpenAI Platform 获取 API Key',
  },

  // Claude
  claude: {
    id: 'claude',
    name: 'Claude',
    type: 'openai-compatible',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-sonnet-4-6',
    models: [
      { id: 'claude-opus-4-8', name: 'Claude 4.8 Opus', description: '最新旗舰长文本与深度分析模型' },
      { id: 'claude-sonnet-4-6', name: 'Claude 4.6 Sonnet', description: '经典全能多模态主力智能模型' },
      { id: 'claude-haiku-4-5', name: 'Claude 4.5 Haiku', description: '极速高性价比轻量级模型' },
    ],
    region: 'international',
    requiresProxy: true,
    note: '前往 Anthropic Console 获取 API Key (若使用第三方中转，请修改 API Base URL)',
  },

  // Grok
  xai: {
    id: 'xai',
    name: 'Grok',
    type: 'openai-compatible',
    baseUrl: 'https://api.x.ai/v1',
    defaultModel: 'grok-4-3',
    models: [
      { id: 'grok-4-3', name: 'grok-4-3', description: '最新旗舰级全能智能超级推理模型', rateLimits: { rpm: 480 } },
      { id: 'grok-build-0-1', name: 'grok-build-0-1', description: '专为代码开发打造的编程基座模型', rateLimits: { rpm: 480 } },
      { id: 'grok-imagine-1-5', name: 'grok-imagine-1-5', description: '最新视频与图像生成专属模型', rateLimits: { rpm: 480 } },
    ],
    region: 'international',
    requiresProxy: true,
    note: '前往 xAI Console 获取 API Key',
  },

  // ============================================
  // 国内提供商 (China Providers)
  // ============================================

  // 硅基流动
  siliconflow: {
    id: 'siliconflow',
    name: '硅基流动',
    type: 'openai-compatible',
    baseUrl: 'https://api.siliconflow.cn/v1',
    defaultModel: 'deepseek-v4-pro',
    models: [
      { id: 'deepseek-ai/DeepSeek-V4-Pro', name: 'DeepSeek-V4-Pro', description: '深度求索新旗舰复杂推理模型', rateLimits: { rpm: 1000, tpm: 100000 } },
      { id: 'deepseek-ai/DeepSeek-V4-Flash', name: 'DeepSeek-V4-Flash', description: '深度求索极速高性价比模型', rateLimits: { rpm: 1000, tpm: 100000 } },
      { id: 'zai-org/GLM-5.2', name: 'GLM-5.2', description: '智谱AI最新旗舰开源 1M 上下文模型', rateLimits: { rpm: 1000, tpm: 50000 } },
      { id: 'Qwen/Qwen3.6-27B', name: 'Qwen3.6-27B', description: '通义千问最新开源全能主力模型', rateLimits: { rpm: 1000, tpm: 20000 } },
    ],
    region: 'china',
    requiresProxy: false,
    note: '前往硅基流动官网获取 API Key',
  },

  // Deep Seek
  deepseek: {
    id: 'deepseek',
    name: 'Deep Seek',
    type: 'openai-compatible',
    baseUrl: 'https://api.deepseek.com',
    defaultModel: 'deepseek-v4-pro',
    models: [
      { id: 'deepseek-v4-pro', name: 'deepseek-v4-pro', description: '深度求索旗舰级 1.6T 深度思考模型 (DeepSeek-V4-Pro)' },
      { id: 'deepseek-v4-flash', name: 'deepseek-v4-flash', description: '深度求索高性价比极速模型 (DeepSeek-V4-Flash)' },
    ],
    region: 'china',
    requiresProxy: false,
    note: '前往 DeepSeek 开放平台获取 API Key',
  },

  // 智谱AI
  zhipu: {
    id: 'zhipu',
    name: '智谱AI',
    type: 'openai-compatible',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-5.2',
    models: [
      { id: 'glm-5.2', name: 'glm-5.2', description: '智谱AI新旗舰 1M 级全能大语言模型', rateLimits: { rpm: 3, tpm: 10000 } },
      { id: 'glm-5.1', name: 'glm-5.1', description: '智谱AI长周期深度工程模型', rateLimits: { rpm: 3, tpm: 10000 } },
      { id: 'glm-5-turbo', name: 'glm-5-turbo', description: '智谱AI极速高并发多轮交互模型', rateLimits: { rpm: 5, tpm: 10000 } },
      { id: 'glm-4.7-flash', name: 'glm-4.7-flash', description: '智谱AI开源级免费轻量模型', rateLimits: { rpm: 2, tpm: 10000 } },
      { id: 'glm-4.5-air', name: 'glm-4.5-air', description: '智谱AI高性价比日用模型', rateLimits: { rpm: 5, tpm: 10000 } },
    ],
    region: 'china',
    requiresProxy: false,
    note: '前往智谱 AI 开放平台获取 API Key',
  },

  // 豆包
  doubao: {
    id: 'doubao',
    name: '豆包',
    type: 'openai-compatible',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: 'doubao-pro-2.1',
    models: [
      { id: 'doubao-pro-2.1', name: 'doubao-pro-2.1 (请替换为您的Endpoint ID)', description: '最新全能旗舰 2.1 编程办公版' },
      { id: 'doubao-turbo-2.1', name: 'doubao-turbo-2.1 (请替换为您的Endpoint ID)', description: '最新极速大并发 2.1 生产力版' },
    ],
    region: 'china',
    requiresProxy: false,
    note: '前往火山引擎 Ark 大模型平台获取 API Key 与您的接入点 Endpoint ID 作为模型标识',
  },

  // 通义千问
  aliyun: {
    id: 'aliyun',
    name: '通义千问',
    type: 'openai-compatible',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen3.7-plus',
    models: [
      { id: 'qwen3.7-max', name: 'qwen3.7-max', description: '通义千问官方最新旗舰级 3.7 大模型', rateLimits: { rpm: 600, tpm: 1000000 } },
      { id: 'qwen3.7-plus', name: 'qwen3.7-plus', description: '通义千问官方主流高性价比 3.7 模型', rateLimits: { rpm: 15000, tpm: 5000000 } },
      { id: 'qwen3.6-27b', name: 'qwen3.6-27b', description: '通义千问高效超强代码代理 3.6 模型', rateLimits: { rpm: 15000, tpm: 10000000 } },
    ],
    region: 'china',
    requiresProxy: false,
    note: '前往阿里云百炼控制台获取 API Key',
  },

};

let cachedMergedRegistry = null;

function loadMergedRegistry() {
  const baseRegistry = JSON.parse(JSON.stringify(PROVIDER_REGISTRY));
  const filePath = getCustomFilePath();
  if (!filePath || !fs.existsSync(filePath)) {
    return baseRegistry;
  }

  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const customConfig = JSON.parse(data);

    // 1. 合并自定义服务商
    if (customConfig.customProviders && Array.isArray(customConfig.customProviders)) {
      customConfig.customProviders.forEach(p => {
        if (p && p.id) {
          baseRegistry[p.id] = {
            id: p.id,
            name: p.name,
            type: p.type || "openai-compatible",
            baseUrl: p.baseUrl,
            defaultModel: p.defaultModel,
            models: p.models || [],
            region: p.region || "china",
            requiresProxy: !!p.requiresProxy,
            note: p.note || "",
            isCustom: true,
          };
        }
      });
    }

    // 2. 合并服务商自定义模型 (支持内置/自定义服务商)
    if (customConfig.customModels && typeof customConfig.customModels === "object") {
      Object.entries(customConfig.customModels).forEach(([providerId, models]) => {
        if (baseRegistry[providerId] && Array.isArray(models)) {
          const existingModels = baseRegistry[providerId].models || [];
          const modelMap = new Map(existingModels.map(m => [m.id, m]));

          models.forEach(m => {
            if (m && m.id) {
              modelMap.set(m.id, {
                id: m.id,
                name: m.name || m.id,
                description: m.description || "",
                url: m.url || "",
                toolCalling: !!m.toolCalling,
                vision: !!m.vision,
                maxInputTokens: m.maxInputTokens || undefined,
                maxOutputTokens: m.maxOutputTokens || undefined,
                isCustom: true
              });
            }
          });

          baseRegistry[providerId].models = Array.from(modelMap.values());
        }
      });
    }
  } catch (e) {
    console.error("[provider-registry] Failed to load custom configurations:", e);
  }

  return baseRegistry;
}

function getCustomFilePath() {
  try {
    const userDataFolder = app.getPath("userData");
    return path.join(userDataFolder, "custom-providers.json");
  } catch (e) {
    return null;
  }
}

function reloadRegistry() {
  cachedMergedRegistry = loadMergedRegistry();
}

function getRegistry() {
  if (!cachedMergedRegistry) {
    reloadRegistry();
  }
  return cachedMergedRegistry;
}

/**
 * 获取所有提供商
 */
function getAllProviders() {
  return Object.values(getRegistry());
}

/**
 * 根据 ID 获取提供商
 */
function getProviderById(id) {
  return getRegistry()[id] || null;
}

/**
 * 根据区域获取提供商
 */
function getProvidersByRegion(region) {
  return Object.values(getRegistry()).filter(p => p.region === region);
}

/**
 * 根据类型获取提供商
 */
function getProvidersByType(type) {
  return Object.values(getRegistry()).filter(p => p.type === type);
}

module.exports = {
  PROVIDER_REGISTRY,
  getAllProviders,
  getProviderById,
  getProvidersByRegion,
  getProvidersByType,
  reloadRegistry,
};
