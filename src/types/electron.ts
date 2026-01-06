/**
 * Electron API 类型定义
 * 这些类型与 preload.js 中暴露的 API 相匹配
 */

import type { EntropyEntity, GameTheme, Question } from './game';

// ============================================
// AI Provider Types
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
  freeQuota: string;
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

// ============================================
// Generated Data Types
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
// API Response Types
// ============================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// AI Service API Interface (new unified API)
// ============================================

export interface AIAPI {
  // Provider management
  getProviders: () => Promise<AIProvider[]>;
  getProvidersGrouped: () => Promise<AIProvidersGrouped>;
  setProvider: (providerId: string) => Promise<APIResponse<void>>;
  setApiKey: (apiKey: string) => Promise<APIResponse<void>>;
  setModel: (model: string) => Promise<APIResponse<void>>;
  setAccountId: (accountId: string) => Promise<APIResponse<void>>;
  checkStatus: () => Promise<AIStatus>;
  
  // Content generation
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
// Gemini API Interface (legacy, for backward compatibility)
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
// File System API Interface
// ============================================

export interface FileSystemAPI {
  readFile: (filePath: string) => Promise<APIResponse<string>>;
  selectFile: (options?: { filters?: Array<{ name: string; extensions: string[] }> }) => Promise<APIResponse<string>>;
}

// ============================================
// App API Interface
// ============================================

export interface AppAPI {
  getVersion: () => Promise<string>;
  getPlatform: () => string;
}

// ============================================
// Complete Electron API Interface
// ============================================

export interface ElectronAPI {
  ai: AIAPI;
  gemini: GeminiAPI;
  fs: FileSystemAPI;
  app: AppAPI;
}

// Extend Window interface
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// Check if running in Electron
export function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI;
}
