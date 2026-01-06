/**
 * AI Provider Factory
 * Creates the appropriate provider instance based on provider ID
 */

const { GeminiProvider } = require('./gemini-provider.cjs');
const { OpenAICompatibleProvider } = require('./openai-compatible-provider.cjs');
const { HuggingFaceProvider } = require('./huggingface-provider.cjs');
const { CohereProvider } = require('./cohere-provider.cjs');
const { CloudflareProvider } = require('./cloudflare-provider.cjs');
const { AI21Provider } = require('./ai21-provider.cjs');
const { ClarifaiProvider } = require('./clarifai-provider.cjs');
const { getProviderById, getAllProviders } = require('./provider-registry.cjs');

/**
 * Create a provider instance
 * @param {string} providerId - Provider ID from registry
 * @param {object} config - Additional configuration
 * @returns {BaseProvider} Provider instance
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
    
    case 'cohere':
      return new CohereProvider(mergedConfig);
    
    case 'cloudflare':
      return new CloudflareProvider(mergedConfig);
    
    case 'ai21':
      return new AI21Provider(mergedConfig);
    
    case 'clarifai':
      return new ClarifaiProvider(mergedConfig);
    
    default:
      // Default to OpenAI-compatible for unknown types
      console.warn(`Unknown provider type "${providerConfig.type}", using OpenAI-compatible`);
      return new OpenAICompatibleProvider(mergedConfig);
  }
}

/**
 * Get list of all available providers with metadata
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
 * Get providers grouped by region
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
