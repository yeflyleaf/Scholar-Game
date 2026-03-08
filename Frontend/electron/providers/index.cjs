/**
 * 提供商索引
 * 导出所有提供商和工具
 * @author yeflyleaf
 * @link https://github.com/yeflyleaf
 */

const { BaseProvider } = require('./base-provider.cjs');
const { GeminiProvider } = require('./gemini-provider.cjs');
const { OpenAICompatibleProvider } = require('./openai-compatible-provider.cjs');
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
  // 基础类
  BaseProvider,
  
  // 提供商
  GeminiProvider,
  OpenAICompatibleProvider,
  
  // 注册表
  PROVIDER_REGISTRY,
  getAllProviders,
  getProviderById,
  getProvidersByRegion,
  getProvidersByType,
  
  // 工厂
  createProvider,
  getAvailableProviders,
  getProvidersGroupedByRegion,
};
