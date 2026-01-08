/**
 * Electron API 类型定义
 * 这些类型与 preload.js 中暴露的 API 相匹配
 */

import type { EntropyEntity, GameTheme, Question } from './game';

// ============================================
// AI 提供商类型
// ============================================

export interface AIProviderModel {
  id: string;
  name: string;
  description: string;
}

export interface AIProvider {
  id: string;
  name: string;
  type: string;
  region: 'china' | 'international';
  requiresProxy: boolean;
  models: AIProviderModel[];
  defaultModel: string;
}

export interface AIProvidersGrouped {
  china: AIProvider[];
  international: AIProvider[];
}

export interface AIStatus {
  configured: boolean;
  providerId: string | null;
  model: string | null;
  providerName: string | null;
}

export interface QuotaStatus {
  quotaExhausted: boolean;
  quotaExhaustedTime: number | null;
}

// ============================================
// 生成数据类型
// ============================================

export interface GeneratedChapter {
  chapter: {
    id: string;
    title: string;
    description: string;
    difficulty: number;
    estimatedTime: string;
  };
  enemies: EntropyEntity[];
  questions: Question[];
  rewards: {
    exp: number;
    items: string[];
  };
}

export interface GeneratedKnowledgeTree {
  nodes: Array<{
    id: string;
    name: string;
    description: string;
    difficulty: 1 | 2 | 3 | 4 | 5 | 6;
    prerequisites: string[];
    position: { x: number; y: number };
    questionCount: number;
    isBoss: boolean;
    topics: string[];
  }>;
  metadata: {
    totalNodes: number;
    estimatedDuration: string;
    suggestedOrder: string[];
  };
}

export interface QuestionGenerationOptions {
  count?: number;
  difficulty?: 1 | 2 | 3 | 4 | 5 | 6 | 'mixed';
  types?: Array<'Single' | 'Multi' | 'TrueFalse'>;
  language?: string;
}

// ============================================
// API 响应类型
// ============================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
}

// ============================================
// AI 服务 API 接口 (新统一 API)
// ============================================

export interface AIAPI {
  // 提供商管理
  getProviders: () => Promise<AIProvider[]>;
  getProvidersGrouped: () => Promise<AIProvidersGrouped>;
  setProvider: (providerId: string) => Promise<APIResponse<void>>;
  setApiKey: (apiKey: string) => Promise<APIResponse<void>>;
  setModel: (model: string) => Promise<APIResponse<void>>;
  checkStatus: () => Promise<AIStatus>;
  checkQuotaStatus: () => Promise<QuotaStatus>;
  resetQuota: () => Promise<APIResponse<void>>;
  testConnection: () => Promise<ConnectionTestResult>;
  
  // 内容生成
  generateQuestions: (
    content: string,
    options?: QuestionGenerationOptions
  ) => Promise<APIResponse<Question[]>>;
  generateKnowledgeTree: (content: string) => Promise<APIResponse<GeneratedKnowledgeTree>>;
  generateEnemies: (topic: string, difficulty?: number) => Promise<APIResponse<EntropyEntity[]>>;
  parseDocument: (filePath: string) => Promise<APIResponse<string>>;
  generateChapter: (
    title: string,
    content: string,
    difficulty?: number
  ) => Promise<APIResponse<GeneratedChapter>>;
  generateTheme: (
    themeName: string,
    content: string
  ) => Promise<APIResponse<Partial<GameTheme>>>;
  generateMissionBriefing: (
    sectorName: string,
    sectorDescription: string
  ) => Promise<APIResponse<string>>;
  generateAllMissionBriefings: (
    sectors: Array<{ id: string; name: string; description: string }>
  ) => Promise<APIResponse<Record<string, string>>>;
}

// ============================================
// Gemini API 接口 (旧版，用于向后兼容)
// ============================================

export interface GeminiAPI {
  setApiKey: (apiKey: string) => Promise<APIResponse<void>>;
  checkStatus: () => Promise<{ configured: boolean; model?: string }>;
  setModel: (model: string) => Promise<APIResponse<void>>;
  generateQuestions: (
    content: string,
    options?: QuestionGenerationOptions
  ) => Promise<APIResponse<Question[]>>;
  generateKnowledgeTree: (content: string) => Promise<APIResponse<GeneratedKnowledgeTree>>;
  generateEnemies: (topic: string, difficulty?: number) => Promise<APIResponse<EntropyEntity[]>>;
  parseDocument: (filePath: string) => Promise<APIResponse<string>>;
  generateChapter: (
    title: string,
    content: string,
    difficulty?: number
  ) => Promise<APIResponse<GeneratedChapter>>;
  generateTheme: (
    themeName: string,
    content: string
  ) => Promise<APIResponse<Partial<GameTheme>>>;
  generateMissionBriefing: (
    sectorName: string,
    sectorDescription: string
  ) => Promise<APIResponse<string>>;
  generateAllMissionBriefings: (
    sectors: Array<{ id: string; name: string; description: string }>
  ) => Promise<APIResponse<Record<string, string>>>;
}

// ============================================
// 文件系统 API 接口
// ============================================

export interface FileSystemAPI {
  readFile: (filePath: string) => Promise<APIResponse<string>>;
  selectFile: (options?: { filters?: Array<{ name: string; extensions: string[] }> }) => Promise<APIResponse<string>>;
}

// ============================================
// 应用 API 接口
// ============================================

export interface AppAPI {
  getVersion: () => Promise<string>;
  getPlatform: () => string;
  quit: () => Promise<void>;
}

// ============================================
// 窗口 API 接口
// ============================================

export interface WindowAPI {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
}

// ============================================
// 完整 Electron API 接口
// ============================================

export interface ElectronAPI {
  ai: AIAPI;
  gemini: GeminiAPI;
  fs: FileSystemAPI;
  app: AppAPI;
  window: WindowAPI;
}

// 扩展 Window 接口
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// 检查是否在 Electron 中运行
export function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI;
}
