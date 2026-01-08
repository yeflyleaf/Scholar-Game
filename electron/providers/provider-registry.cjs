/**
 * 提供商注册表 - 所有支持的 AI 提供商的配置
 * 包含每个提供商的元数据，包括端点、模型和兼容性
 * @author yeflyleaf
 * @link https://github.com/yeflyleaf
 */

const PROVIDER_REGISTRY = {
  // ============================================
  // Google Gemini (自定义 API 格式)
  // ============================================
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-2.5-flash',
    models: [
      { 
        id: 'gemini-2.5-flash', 
        name: 'gemini-2.5-flash', 
        description: '高性价比模型',
        rateLimits: {
          rpm: 5,
          tpm: 250000
        }
      },
      { 
        id: 'gemini-3-flash', 
        name: 'gemini-3-flash', 
        description: '新一代高性能模型',
        rateLimits: {
          rpm: 5,
          tpm: 250000
        }
      },
    ],
    region: 'international',
    requiresProxy: true,
    note: '前往 Google AI Studio 获取 API Key',
  },

  // ============================================
  // OpenAI 兼容提供商
  // ============================================
  
  // 硅基流动 SiliconFlow
  siliconflow: {
    id: 'siliconflow',
    name: '硅基流动 SiliconFlow',
    type: 'openai-compatible',
    baseUrl: 'https://api.siliconflow.cn/v1',
    defaultModel: 'deepseek-ai/DeepSeek-V3.2',
    models: [
      { 
        id: 'deepseek-ai/DeepSeek-V3.2', 
        name: 'DeepSeek-V3.2', 
        description: '深度求索V3.2', 
        rateLimits: {
          rpm: 1000,
          tpm: 100000
        }
      },
      { 
        id: 'deepseek-ai/DeepSeek-R1', 
        name: 'DeepSeek-R1', 
        description: '深度求索R1',
        rateLimits: {
          rpm: 1000,
          tpm: 100000
        }
      },
      { 
        id: 'Qwen/Qwen2.5-72B-Instruct', 
        name: 'Qwen2.5-72B-Instruct', 
        description: '通义千问',
        rateLimits: {
          rpm: 1000,
          tpm: 20000
        }
      },
      { 
        id: 'THUDM/glm-4-9b-chat', 
        name: 'glm-4-9b-chat', 
        description: '智谱AI 免费模型',
        rateLimits: {
          rpm: 1000,
          tpm: 50000
        }
      },
    ],
    region: 'china',
    requiresProxy: false,
    note: '前往硅基流动官网注册获取 API Key',
  },

  // Groq
  groq: {
    id: 'groq',
    name: 'Groq',
    type: 'openai-compatible',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'meta-llama/llama-guard-4-12b',
    models: [
      {
        id: 'llama-3.3-70b-versatile', 
        name: 'llama-3.3-70b-versatile', 
        description: '开源模型',
        rateLimits: {
          rpm: 1000,
          tpm: 300000
        }
      },
      { 
        id: 'meta-llama/llama-guard-4-12b', 
        name: 'llama-guard-4-12b', 
        description: '轻量开源模型',
        rateLimits: {
          rpm: 100,
          tpm: 30000
        }
      },
      { 
        id: 'openai/gpt-oss-120b', 
        name: 'gpt-oss-120b', 
        description: 'ChatGPT轻量模型',
        rateLimits: {
          rpm: 1000,
          tpm: 250000
        }
      },
    ],
    region: 'international',
    requiresProxy: true,
    note: '前往 Groq Console 获取 API Key',
  },

  // X.AI (Grok)
  xai: {
    id: 'xai',
    name: 'X.AI (Grok)',
    type: 'openai-compatible',
    baseUrl: 'https://api.x.ai/v1',
    defaultModel: 'grok-3-mini',
    models: [
      {
        id: 'grok-4-1-fast-reasoning', 
        name: 'grok-4-1-fast-reasoning', 
        description: '最新最强模型',
        rateLimits: {
          rpm: 480,
          tpm: 4000000
        }
      },
      { 
        id: 'grok-3-mini', 
        name: 'grok-3-mini', 
        description: '快速推理版本',
        rateLimits: {
          rpm: 480
        }
      },
    ],
    region: 'international',
    requiresProxy: true,
    note: '前往 X.AI Console 获取 API Key',
  },

  // OpenAI
  openai: {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai-compatible',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-5.1',
    models: [
      { 
        id: 'gpt-5.1', 
        name: 'gpt-5.1', 
        description: '最新多模态模型',
        rateLimits: {
          rpm: 3,
          tpm: 10000,
        }
      },
      { 
        id: 'gpt-4.1', 
        name: 'gpt-4.1', 
        description: '高性价比版本',
        rateLimits: {
          rpm: 3,
          tpm: 10000,
        }
      },
      { 
        id: 'gpt-4.1-nano', 
        name: 'gpt-4.1-nano', 
        description: '增强版',
        rateLimits: {
          rpm: 3,
          tpm: 60000,
        }
      },
      { 
        id: 'o4-mini', 
        name: 'o4-mini', 
        description: '轻量版',
        rateLimits: {
          rpm: 3,
          tpm: 100000,
        }
      },
    ],
    region: 'international',
    requiresProxy: true,
    note: '前往 OpenAI Platform 获取 API Key',
  },

  // ============================================
  // 中国云提供商
  // ============================================

  // 智谱 AI (Zhipu AI)
  // 注意：智谱AI使用并发数限制，以下RPM为L1等级估算值（并发数×6）
  zhipu: {
    id: 'zhipu',
    name: '智谱 AI (BigModel)',
    type: 'openai-compatible',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4.6',
    models: [
      { id: 'glm-4.6', name: 'glm-4.6', description: '深度推理模型', rateLimits: { rpm: 3,tpm: 10000} },
      { id: 'glm-4.5-air', name: 'glm-4.5-air', description: '高性价比', rateLimits: { rpm: 5,tpm: 10000} },
      { id: 'glm-4.5-flash', name: 'glm-4.5-flash', description: '快速免费', rateLimits: { rpm: 2,tpm: 10000} },
    ],
    region: 'china',
    requiresProxy: false,
    note: '前往智谱 AI 开放平台获取 API Key',
  },

  // 百度千帆 (使用新版 OpenAI 兼容 API)
  baidu: {
    id: 'baidu',
    name: '百度千帆 (文心一言)',
    type: 'openai-compatible',
    // 新版 API 端点，支持标准 OpenAI 格式
    baseUrl: 'https://qianfan.baidubce.com/v2',
    defaultModel: 'ernie-4.5-turbo-128k',
    models: [
      { id: 'ernie-4.5-turbo-128k', name: 'ernie-4.5-turbo-128k', description: '文心4.5 Turbo', rateLimits: { rpm: 5000, tpm: 400000 } },
      { id: 'deepseek-v3.2', name: 'deepseek-v3.2', description: '深度求索V3.2', rateLimits: { rpm: 60, tpm: 150000 } },
      { id: 'deepseek-r1', name: 'deepseek-r1', description: '深度求索R1', rateLimits: { rpm: 5000, tpm: 1000000 } },
    ],
    region: 'china',
    requiresProxy: false,
    note: '使用百度智能云控制台获取的 API Key',
  },

};

/**
 * 获取所有提供商
 */
function getAllProviders() {
  return Object.values(PROVIDER_REGISTRY);
}

/**
 * 根据 ID 获取提供商
 */
function getProviderById(id) {
  return PROVIDER_REGISTRY[id] || null;
}

/**
 * 根据区域获取提供商
 */
function getProvidersByRegion(region) {
  return Object.values(PROVIDER_REGISTRY).filter(p => p.region === region);
}

/**
 * 根据类型获取提供商
 */
function getProvidersByType(type) {
  return Object.values(PROVIDER_REGISTRY).filter(p => p.type === type);
}

module.exports = {
  PROVIDER_REGISTRY,
  getAllProviders,
  getProviderById,
  getProvidersByRegion,
  getProvidersByType,
};
