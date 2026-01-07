/**
 * 提供商注册表 - 所有支持的 AI 提供商的配置
 * 包含每个提供商的元数据，包括端点、模型和兼容性
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
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: '最新最快的模型' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: '最强推理能力' },
    ],
    region: 'international',
    requiresProxy: true,
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
    defaultModel: 'deepseek-ai/DeepSeek-V3',
    models: [
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', description: '最新最强' },
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', description: '推理模型' },
      { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B', description: '通义千问' },
      { id: 'THUDM/glm-4-9b-chat', name: 'GLM-4 9B', description: '智谱AI' },
    ],
    region: 'china',
    requiresProxy: false,
  },

  // Groq
  groq: {
    id: 'groq',
    name: 'Groq',
    type: 'openai-compatible',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: '最强开源模型' },
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', description: '高质量输出' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: '超快响应' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'MoE 架构' },
    ],
    region: 'international',
    requiresProxy: true,
  },

  // ============================================
  // 中国云提供商
  // ============================================

  // 讯飞星火 (iFlytek Spark)
  spark: {
    id: 'spark',
    name: '讯飞星火 (iFlytek Spark)',
    type: 'openai-compatible',
    baseUrl: 'https://spark-api-open.xf-yun.com/v1',
    defaultModel: 'generalv3.5',
    models: [
      { id: 'generalv3.5', name: 'Spark Max (v3.5)', description: '星火大模型 Max' },
      { id: 'generalv3', name: 'Spark Pro (v3.0)', description: '星火大模型 Pro' },
      { id: 'pro-128k', name: 'Spark Pro 128K', description: '长文本支持' },
      { id: 'general', name: 'Spark Lite', description: '轻量版' },
      { id: '4.0Ultra', name: 'Spark 4.0 Ultra', description: '最强版本' },
    ],
    region: 'china',
    requiresProxy: false,
  },

  // 智谱 AI (Zhipu AI)
  zhipu: {
    id: 'zhipu',
    name: '智谱 AI (BigModel)',
    type: 'openai-compatible',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4',
    models: [
      { id: 'glm-4', name: 'GLM-4', description: '最强通用模型' },
      { id: 'glm-4-air', name: 'GLM-4 Air', description: '高性价比' },
      { id: 'glm-4-flash', name: 'GLM-4 Flash', description: '快速免费' },
      { id: 'glm-4-long', name: 'GLM-4 Long', description: '超长上下文' },
    ],
    region: 'china',
    requiresProxy: false,
  },

  // 腾讯云混元
  tencent: {
    id: 'tencent',
    name: '腾讯云混元',
    type: 'openai-compatible',
    baseUrl: 'https://api.hunyuan.cloud.tencent.com/v1',
    defaultModel: 'hunyuan-lite',
    models: [
      { id: 'hunyuan-lite', name: 'Hunyuan Lite', description: '轻量版' },
      { id: 'hunyuan-standard', name: 'Hunyuan Standard', description: '标准版' },
      { id: 'hunyuan-pro', name: 'Hunyuan Pro', description: '专业版' },
    ],
    region: 'china',
    requiresProxy: false,
  },

  // 百度千帆
  baidu: {
    id: 'baidu',
    name: '百度千帆 (文心一言)',
    type: 'openai-compatible',
    baseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
    defaultModel: 'ernie-4.0-8k',
    models: [
      { id: 'ernie-4.0-8k', name: 'ERNIE 4.0 8K', description: '文心一言4.0' },
      { id: 'ernie-3.5-8k', name: 'ERNIE 3.5 8K', description: '文心一言3.5' },
      { id: 'ernie-speed-128k', name: 'ERNIE Speed 128K', description: '长上下文' },
      { id: 'ernie-lite-8k', name: 'ERNIE Lite 8K', description: '轻量版' },
    ],
    region: 'china',
    requiresProxy: false,
    note: '百度 API 有特殊认证方式，需要 access_token',
  },

  // ============================================
  // 特殊 API 格式提供商
  // ============================================

  // Hugging Face
  huggingface: {
    id: 'huggingface',
    name: 'Hugging Face',
    type: 'huggingface',
    baseUrl: 'https://api-inference.huggingface.co/models',
    defaultModel: 'meta-llama/Meta-Llama-3-8B-Instruct',
    models: [
      { id: 'meta-llama/Meta-Llama-3-8B-Instruct', name: 'Llama 3 8B', description: 'Meta 开源' },
      { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B', description: 'Mistral 开源' },
      { id: 'google/gemma-7b-it', name: 'Gemma 7B', description: 'Google 开源' },
      { id: 'microsoft/Phi-3-mini-4k-instruct', name: 'Phi-3 Mini', description: 'Microsoft' },
      { id: 'Qwen/Qwen2-7B-Instruct', name: 'Qwen2 7B', description: '通义千问' },
    ],
    region: 'international',
    requiresProxy: true,
  },

  // Cloudflare Workers AI
  cloudflare: {
    id: 'cloudflare',
    name: 'Cloudflare Workers AI',
    type: 'cloudflare',
    baseUrl: 'https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run',
    defaultModel: '@cf/meta/llama-3.1-8b-instruct',
    models: [
      { id: '@cf/meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', description: 'Meta' },
      { id: '@cf/meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', description: 'Meta 大型' },
      { id: '@cf/mistral/mistral-7b-instruct-v0.2', name: 'Mistral 7B', description: 'Mistral' },
      { id: '@cf/qwen/qwen1.5-14b-chat-awq', name: 'Qwen 1.5 14B', description: '通义千问' },
      { id: '@cf/google/gemma-7b-it', name: 'Gemma 7B', description: 'Google' },
    ],
    region: 'international',
    requiresProxy: true,
    note: '需要 Account ID 和 API Token',
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
