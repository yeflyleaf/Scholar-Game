/**
 * AI 提供商工厂
 * 根据提供商 ID 创建适当的提供商实例
 */

const { GeminiProvider } = require('./gemini-provider.cjs');
const { OpenAICompatibleProvider } = require('./openai-compatible-provider.cjs');
const { HuggingFaceProvider } = require('./huggingface-provider.cjs');
const { CloudflareProvider } = require('./cloudflare-provider.cjs');
const { getProviderById, getAllProviders } = require('./provider-registry.cjs');

/**
 * 创建提供商实例
 * @param {string} providerId - 来自注册表的提供商 ID
 * @param {object} config - 额外配置
 * @returns {BaseProvider} 提供商实例
 */
function createProvider(providerId, config = {}) {
  const providerConfig = getProviderById(providerId);
  
  if (!providerConfig) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  const mergedConfig = {
    ...config,
    providerId,
    baseUrl: config.baseUrl || providerConfig.baseUrl,
    model: config.model || providerConfig.defaultModel,
  };

  switch (providerConfig.type) {
    case 'gemini':
      return new GeminiProvider(mergedConfig);
    
    case 'openai-compatible':
      return new OpenAICompatibleProvider(mergedConfig);
    
    case 'huggingface':
      return new HuggingFaceProvider(mergedConfig);
    
    case 'cloudflare':
      return new CloudflareProvider(mergedConfig);
    
    default:
      // 未知类型默认为 OpenAI 兼容
      console.warn(`Unknown provider type "${providerConfig.type}", using OpenAI-compatible`);
      return new OpenAICompatibleProvider(mergedConfig);
  }
}

/**
 * 获取所有可用提供商及其元数据
 */
function getAvailableProviders() {
  return getAllProviders().map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    freeQuota: p.freeQuota,
    region: p.region,
    requiresProxy: p.requiresProxy,
    models: p.models,
    defaultModel: p.defaultModel,
  }));
}

/**
 * 按区域分组获取提供商
 */
function getProvidersGroupedByRegion() {
  const providers = getAllProviders();
  return {
    china: providers.filter(p => p.region === 'china'),
    international: providers.filter(p => p.region === 'international'),
  };
}

module.exports = {
  createProvider,
  getAvailableProviders,
  getProvidersGroupedByRegion,
};
