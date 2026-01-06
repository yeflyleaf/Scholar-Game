/**
 * Providers Index
 * Export all providers and utilities
 */

const { BaseProvider } = require('./base-provider.cjs');
const { GeminiProvider } = require('./gemini-provider.cjs');
const { OpenAICompatibleProvider } = require('./openai-compatible-provider.cjs');
const { HuggingFaceProvider } = require('./huggingface-provider.cjs');
const { CohereProvider } = require('./cohere-provider.cjs');
const { CloudflareProvider } = require('./cloudflare-provider.cjs');
const { AI21Provider } = require('./ai21-provider.cjs');
const { ClarifaiProvider } = require('./clarifai-provider.cjs');
const { 
  PROVIDER_REGISTRY, 
  getAllProviders, 
  getProviderById, 
  getProvidersByRegion, 
  getProvidersByType 
} = require('./provider-registry.cjs');
const { 
  createProvider, 
  getAvailableProviders, 
  getProvidersGroupedByRegion 
} = require('./provider-factory.cjs');

module.exports = {
  // Base
  BaseProvider,
  
  // Providers
  GeminiProvider,
  OpenAICompatibleProvider,
  HuggingFaceProvider,
  CohereProvider,
  CloudflareProvider,
  AI21Provider,
  ClarifaiProvider,
  
  // Registry
  PROVIDER_REGISTRY,
  getAllProviders,
  getProviderById,
  getProvidersByRegion,
  getProvidersByType,
  
  // Factory
  createProvider,
  getAvailableProviders,
  getProvidersGroupedByRegion,
};
