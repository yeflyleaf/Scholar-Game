/**
 * Electron API type definitions
 * These types match the APIs exposed in preload.js
 */

import type { EntropyEntity, Question } from './game';

// Generated Chapter Data
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

// Generated Knowledge Tree
export interface GeneratedKnowledgeTree {
  nodes: Array<{
    id: string;
    name: string;
    description: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
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

// Question Generation Options
export interface QuestionGenerationOptions {
  count?: number;
  difficulty?: 1 | 2 | 3 | 4 | 5 | 'mixed';
  types?: Array<'Single' | 'Multi' | 'TrueFalse'>;
  language?: string;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Gemini API interface
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

// File System API interface
export interface FileSystemAPI {
  readFile: (filePath: string) => Promise<APIResponse<string>>;
  selectFile: (options?: { filters?: Array<{ name: string; extensions: string[] }> }) => Promise<APIResponse<string>>;
}

// App API interface
export interface AppAPI {
  getVersion: () => Promise<string>;
  getPlatform: () => string;
}

// Complete Electron API interface
export interface ElectronAPI {
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
