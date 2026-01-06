/**
 * Provider Registry - Configuration for all supported AI providers
 * Contains metadata about each provider including endpoints, models, and compatibility
 */

const PROVIDER_REGISTRY = {
  // ============================================
  // Google Gemini (Custom API format)
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
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: '快速响应' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: '经典版本' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: '高质量输出' },
    ],
    region: 'international',
    requiresProxy: true,
  },

  // ============================================
  // OpenAI-Compatible Providers
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
      { id: 'Qwen/Qwen2.5-32B-Instruct', name: 'Qwen 2.5 32B', description: '通义千问中型' },
      { id: 'THUDM/glm-4-9b-chat', name: 'GLM-4 9B', description: '智谱AI' },
      { id: 'internlm/internlm2_5-20b-chat', name: 'InternLM 2.5 20B', description: '书生浦语' },
    ],
    region: 'china',
    requiresProxy: false,
  },

  // DeepSeek
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'openai-compatible',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', description: '对话模型 (V3)' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', description: '推理模型 (R1)' },
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
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google 开源' },
    ],
    region: 'international',
    requiresProxy: true,
  },

  // OpenRouter
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openai-compatible',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.0-flash-exp:free',
    models: [
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', description: '免费' },
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', description: '免费' },
      { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Free)', description: '免费' },
      { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek Chat (Free)', description: '免费' },
      { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', description: '免费' },
    ],
    region: 'international',
    requiresProxy: true,
  },

  // Kimi (Moonshot)
  kimi: {
    id: 'kimi',
    name: 'Kimi (Moonshot)',
    type: 'openai-compatible',
    baseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    models: [
      { id: 'moonshot-v1-8k', name: 'Moonshot V1 8K', description: '8K 上下文' },
      { id: 'moonshot-v1-32k', name: 'Moonshot V1 32K', description: '32K 上下文' },
      { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K', description: '128K 超长上下文' },
    ],
    region: 'china',
    requiresProxy: false,
  },

  // Together AI
  together: {
    id: 'together',
    name: 'Together AI',
    type: 'openai-compatible',
    baseUrl: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    models: [
      { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', name: 'Llama 3.1 70B Turbo', description: '快速响应' },
      { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', name: 'Llama 3.1 8B Turbo', description: '轻量快速' },
      { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', description: 'MoE 架构' },
      { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', name: 'Qwen 2.5 72B', description: '通义千问' },
    ],
    region: 'international',
    requiresProxy: true,
  },

  // Fireworks AI
  fireworks: {
    id: 'fireworks',
    name: 'Fireworks AI',
    type: 'openai-compatible',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
    models: [
      { id: 'accounts/fireworks/models/llama-v3p1-70b-instruct', name: 'Llama 3.1 70B', description: '高质量' },
      { id: 'accounts/fireworks/models/llama-v3p1-8b-instruct', name: 'Llama 3.1 8B', description: '快速' },
      { id: 'accounts/fireworks/models/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', description: 'MoE' },
      { id: 'accounts/fireworks/models/qwen2p5-72b-instruct', name: 'Qwen 2.5 72B', description: '通义千问' },
    ],
    region: 'international',
    requiresProxy: true,
  },

  // Cerebras
  cerebras: {
    id: 'cerebras',
    name: 'Cerebras AI',
    type: 'openai-compatible',
    baseUrl: 'https://api.cerebras.ai/v1',
    defaultModel: 'llama3.1-70b',
    models: [
      { id: 'llama3.1-70b', name: 'Llama 3.1 70B', description: '超快推理' },
      { id: 'llama3.1-8b', name: 'Llama 3.1 8B', description: '极速响应' },
    ],
    region: 'international',
    requiresProxy: true,
  },

  // Mistral AI
  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    type: 'openai-compatible',
    baseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-large-latest',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', description: '最强模型' },
      { id: 'mistral-medium-latest', name: 'Mistral Medium', description: '平衡选择' },
      { id: 'mistral-small-latest', name: 'Mistral Small', description: '快速响应' },
      { id: 'codestral-latest', name: 'Codestral', description: '代码专用' },
      { id: 'open-mistral-7b', name: 'Mistral 7B', description: '开源版本' },
    ],
    region: 'international',
    requiresProxy: true,
  },

  // AIML API
  aimlapi: {
    id: 'aimlapi',
    name: 'AIML API',
    type: 'openai-compatible',
    baseUrl: 'https://api.aimlapi.com/v1',
    defaultModel: 'gpt-4o-mini',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '快速经济' },
      { id: 'gpt-4o', name: 'GPT-4o', description: '最新 GPT-4' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic' },
    ],
    region: 'international',
    requiresProxy: true,
  },

  // ============================================
  // Chinese Cloud Providers (Custom APIs but often have OpenAI-compatible endpoints)
  // ============================================

  // 阿里云百炼 (通义千问)
  aliyun: {
    id: 'aliyun',
    name: '阿里云百炼 (通义千问)',
    type: 'openai-compatible',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-turbo',
    models: [
      { id: 'qwen-turbo', name: 'Qwen Turbo', description: '快速响应' },
      { id: 'qwen-plus', name: 'Qwen Plus', description: '增强版' },
      { id: 'qwen-max', name: 'Qwen Max', description: '最强版本' },
      { id: 'qwen-long', name: 'Qwen Long', description: '长上下文' },
    ],
    region: 'china',
    requiresProxy: false,
  },

  // 华为云 ModelArts
  huawei: {
    id: 'huawei',
    name: '华为云 ModelArts',
    type: 'openai-compatible',
    baseUrl: 'https://infer-modelarts.cn-southwest-2.myhuaweicloud.com/v1',
    defaultModel: 'pangu-70b',
    models: [
      { id: 'pangu-70b', name: 'Pangu 70B', description: '盘古大模型' },
      { id: 'pangu-13b', name: 'Pangu 13B', description: '盘古中型' },
    ],
    region: 'china',
    requiresProxy: false,
    note: '需要配置 endpoint，baseUrl 可能需要根据区域调整',
  },

  // 火山引擎
  volcengine: {
    id: 'volcengine',
    name: '火山引擎',
    type: 'openai-compatible',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: 'doubao-pro-32k',
    models: [
      { id: 'doubao-pro-32k', name: 'Doubao Pro 32K', description: '豆包专业版' },
      { id: 'doubao-lite-32k', name: 'Doubao Lite 32K', description: '豆包轻量版' },
    ],
    region: 'china',
    requiresProxy: false,
    note: '需要先在火山引擎控制台创建模型接入点',
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
  // Special API Format Providers
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
    ],
    region: 'international',
    requiresProxy: true,
  },

  // Cohere
  cohere: {
    id: 'cohere',
    name: 'Cohere',
    type: 'cohere',
    baseUrl: 'https://api.cohere.ai/v1',
    defaultModel: 'command-r-plus',
    models: [
      { id: 'command-r-plus', name: 'Command R+', description: '最强模型' },
      { id: 'command-r', name: 'Command R', description: '标准版' },
      { id: 'command', name: 'Command', description: '基础版' },
      { id: 'command-light', name: 'Command Light', description: '轻量版' },
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
    ],
    region: 'international',
    requiresProxy: true,
    note: '需要 Account ID 和 API Token',
  },

  // AI21 Labs
  ai21: {
    id: 'ai21',
    name: 'AI21 Labs',
    type: 'ai21',
    baseUrl: 'https://api.ai21.com/studio/v1',
    defaultModel: 'jamba-1.5-large',
    models: [
      { id: 'jamba-1.5-large', name: 'Jamba 1.5 Large', description: '最新大模型' },
      { id: 'jamba-1.5-mini', name: 'Jamba 1.5 Mini', description: '轻量版' },
      { id: 'j2-ultra', name: 'Jurassic-2 Ultra', description: '经典模型' },
      { id: 'j2-mid', name: 'Jurassic-2 Mid', description: '中型模型' },
    ],
    region: 'international',
    requiresProxy: true,
  },

  // Clarifai
  clarifai: {
    id: 'clarifai',
    name: 'Clarifai',
    type: 'clarifai',
    baseUrl: 'https://api.clarifai.com/v2',
    defaultModel: 'gpt-4-turbo',
    models: [
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'OpenAI via Clarifai' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Anthropic' },
      { id: 'llama-3-70b-instruct', name: 'Llama 3 70B', description: 'Meta' },
    ],
    region: 'international',
    requiresProxy: true,
  },
};

/**
 * Get all providers
 */
function getAllProviders() {
  return Object.values(PROVIDER_REGISTRY);
}

/**
 * Get provider by ID
 */
function getProviderById(id) {
  return PROVIDER_REGISTRY[id] || null;
}

/**
 * Get providers by region
 */
function getProvidersByRegion(region) {
  return Object.values(PROVIDER_REGISTRY).filter(p => p.region === region);
}

/**
 * Get providers by type
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
