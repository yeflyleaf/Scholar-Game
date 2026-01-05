/**
 * Electron API 类型定义
 * 这些类型与 preload.js 中暴露的 API 相匹配
 */

import type { EntropyEntity, Question } from './game';

// 生成的章节数据
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

// 生成的知识树
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

// 题目生成选项
export interface QuestionGenerationOptions {
  count?: number;
  difficulty?: 1 | 2 | 3 | 4 | 5 | 6 | 'mixed';
  types?: Array<'Single' | 'Multi' | 'TrueFalse'>;
  language?: string;
}

// API 响应类型
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Gemini API 接口
export interface GeminiAPI {
  setApiKey: (apiKey: string) => Promise<APIResponse<void>>;
  checkStatus: () => Promise<{ configured: boolean }>;
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
}

// 文件系统 API 接口
export interface FileSystemAPI {
  readFile: (filePath: string) => Promise<APIResponse<string>>;
  selectFile: (options?: { filters?: Array<{ name: string; extensions: string[] }> }) => Promise<APIResponse<string>>;
}

// 应用 API 接口
export interface AppAPI {
  getVersion: () => Promise<string>;
  getPlatform: () => string;
}

// 完整的 Electron API 接口
export interface ElectronAPI {
  gemini: GeminiAPI;
  fs: FileSystemAPI;
  app: AppAPI;
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
