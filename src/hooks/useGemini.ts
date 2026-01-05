import { useCallback, useState } from 'react';
import type {
    GeneratedChapter,
    GeneratedKnowledgeTree,
    QuestionGenerationOptions
} from '../types/electron';
import type {
    EntropyEntity,
    Question
} from '../types/game';

interface UseGeminiReturn {
  // Status
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setApiKey: (key: string) => Promise<boolean>;
  checkStatus: () => Promise<boolean>;
  generateQuestions: (content: string, options?: QuestionGenerationOptions) => Promise<Question[] | null>;
  generateKnowledgeTree: (content: string) => Promise<GeneratedKnowledgeTree | null>;
  generateEnemies: (topic: string, difficulty?: number) => Promise<EntropyEntity[] | null>;
  generateChapter: (title: string, content: string, difficulty?: number) => Promise<GeneratedChapter | null>;
  
  // Utility
  clearError: () => void;
}

export function useGemini(): UseGeminiReturn {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if running in Electron
  const electronAPI = typeof window !== 'undefined' ? window.electronAPI : undefined;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setApiKey = useCallback(async (key: string): Promise<boolean> => {
    if (!electronAPI) {
      setError('Gemini API only available in Electron');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await electronAPI.gemini.setApiKey(key);
      if (result.success) {
        setIsConfigured(true);
        return true;
      } else {
        setError(result.error || 'Failed to set API key');
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [electronAPI]);

  const checkStatus = useCallback(async (): Promise<boolean> => {
    if (!electronAPI) {
      return false;
    }

    try {
      const result = await electronAPI.gemini.checkStatus();
      setIsConfigured(result.configured);
      return result.configured;
    } catch {
      return false;
    }
  }, [electronAPI]);

  const generateQuestions = useCallback(async (
    content: string,
    options?: QuestionGenerationOptions
  ): Promise<Question[] | null> => {
    if (!electronAPI) {
      setError('Gemini API only available in Electron');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await electronAPI.gemini.generateQuestions(content, options);
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'Failed to generate questions');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [electronAPI]);

  const generateKnowledgeTree = useCallback(async (
    content: string
  ): Promise<GeneratedKnowledgeTree | null> => {
    if (!electronAPI) {
      setError('Gemini API only available in Electron');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await electronAPI.gemini.generateKnowledgeTree(content);
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'Failed to generate knowledge tree');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [electronAPI]);

  const generateEnemies = useCallback(async (
    topic: string,
    difficulty = 3
  ): Promise<EntropyEntity[] | null> => {
    if (!electronAPI) {
      setError('Gemini API only available in Electron');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await electronAPI.gemini.generateEnemies(topic, difficulty);
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'Failed to generate enemies');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [electronAPI]);

  const generateChapter = useCallback(async (
    title: string,
    content: string,
    difficulty = 3
  ): Promise<GeneratedChapter | null> => {
    if (!electronAPI) {
      setError('Gemini API only available in Electron');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await electronAPI.gemini.generateChapter(title, content, difficulty);
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'Failed to generate chapter');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [electronAPI]);

  return {
    isConfigured,
    isLoading,
    error,
    setApiKey,
    checkStatus,
    generateQuestions,
    generateKnowledgeTree,
    generateEnemies,
    generateChapter,
    clearError,
  };
}
