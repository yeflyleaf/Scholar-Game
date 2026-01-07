import { useCallback, useEffect, useState } from 'react';
import type {
    AIProvider,
    AIProvidersGrouped,
    AIStatus,
    ConnectionTestResult,
    GeneratedChapter,
    GeneratedKnowledgeTree,
    QuestionGenerationOptions
} from '../types/electron';
import type {
    EntropyEntity,
    GameTheme,
    Question
} from '../types/game';

interface UseAIReturn {
  // Status
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Current config
  providerId: string | null;
  providerName: string | null;
  model: string | null;
  
  // Providers
  providers: AIProvider[];
  providersGrouped: AIProvidersGrouped | null;
  
  // Actions - Config
  loadProviders: () => Promise<void>;
  setProvider: (providerId: string) => Promise<boolean>;
  setApiKey: (key: string) => Promise<boolean>;
  setModel: (model: string) => Promise<boolean>;
  setAccountId: (accountId: string) => Promise<boolean>;
  checkStatus: () => Promise<AIStatus | null>;
  testConnection: () => Promise<ConnectionTestResult>;
  
  // Actions - Generation
  generateQuestions: (content: string, options?: QuestionGenerationOptions) => Promise<Question[] | null>;
  generateKnowledgeTree: (content: string) => Promise<GeneratedKnowledgeTree | null>;
  generateEnemies: (topic: string, difficulty?: number) => Promise<EntropyEntity[] | null>;
  generateChapter: (title: string, content: string, difficulty?: number) => Promise<GeneratedChapter | null>;
  generateTheme: (themeName: string, content: string) => Promise<Partial<GameTheme> | null>;
  generateMissionBriefing: (sectorName: string, sectorDescription: string) => Promise<string | null>;
  generateAllMissionBriefings: (sectors: Array<{ id: string; name: string; description: string }>) => Promise<Record<string, string> | null>;
  
  // Utilities
  clearError: () => void;
}

export function useAI(): UseAIReturn {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [providerId, setProviderId] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string | null>(null);
  const [model, setModelState] = useState<string | null>(null);
  
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [providersGrouped, setProvidersGrouped] = useState<AIProvidersGrouped | null>(null);

  // Check if running in Electron
  const electronAPI = typeof window !== 'undefined' ? window.electronAPI : undefined;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load providers list
  const loadProviders = useCallback(async (): Promise<void> => {
    if (!electronAPI?.ai) {
      setError('AI API only available in Electron');
      return;
    }

    try {
      const [providersList, grouped] = await Promise.all([
        electronAPI.ai.getProviders(),
        electronAPI.ai.getProvidersGrouped(),
      ]);
      setProviders(providersList);
      setProvidersGrouped(grouped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load providers');
    }
  }, [electronAPI]);

  // Check status
  const checkStatus = useCallback(async (): Promise<AIStatus | null> => {
    if (!electronAPI?.ai) {
      return null;
    }

    try {
      const status = await electronAPI.ai.checkStatus();
      setIsConfigured(status.configured);
      setProviderId(status.providerId);
      setProviderName(status.providerName);
      setModelState(status.model);
      return status;
    } catch {
      return null;
    }
  }, [electronAPI]);

  // Set provider
  const setProvider = useCallback(async (newProviderId: string): Promise<boolean> => {
    if (!electronAPI?.ai) {
      setError('AI API only available in Electron');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await electronAPI.ai.setProvider(newProviderId);
      if (result.success) {
        setProviderId(newProviderId);
        // Update provider name from list
        const provider = providers.find(p => p.id === newProviderId);
        if (provider) {
          setProviderName(provider.name);
          setModelState(provider.defaultModel);
        }
        return true;
      } else {
        setError(result.error || 'Failed to set provider');
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [electronAPI, providers]);

  // Set API key
  const setApiKey = useCallback(async (key: string): Promise<boolean> => {
    if (!electronAPI?.ai) {
      setError('AI API only available in Electron');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await electronAPI.ai.setApiKey(key);
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

  // Set model
  const setModel = useCallback(async (newModel: string): Promise<boolean> => {
    if (!electronAPI?.ai) {
      setError('AI API only available in Electron');
      return false;
    }

    try {
      const result = await electronAPI.ai.setModel(newModel);
      if (result.success) {
        setModelState(newModel);
        return true;
      } else {
        setError(result.error || 'Failed to set model');
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return false;
    }
  }, [electronAPI]);

  // Set account ID (for Cloudflare)
  const setAccountId = useCallback(async (accountId: string): Promise<boolean> => {
    if (!electronAPI?.ai) {
      setError('AI API only available in Electron');
      return false;
    }

    try {
      const result = await electronAPI.ai.setAccountId(accountId);
      return result.success;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return false;
    }
  }, [electronAPI]);

  // Generate questions
  const generateQuestions = useCallback(async (
    content: string,
    options?: QuestionGenerationOptions
  ): Promise<Question[] | null> => {
    if (!electronAPI?.ai) {
      setError('AI API only available in Electron');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await electronAPI.ai.generateQuestions(content, options);
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

  // Generate knowledge tree
  const generateKnowledgeTree = useCallback(async (
    content: string
  ): Promise<GeneratedKnowledgeTree | null> => {
    if (!electronAPI?.ai) {
      setError('AI API only available in Electron');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await electronAPI.ai.generateKnowledgeTree(content);
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

  // Generate enemies
  const generateEnemies = useCallback(async (
    topic: string,
    difficulty = 3
  ): Promise<EntropyEntity[] | null> => {
    if (!electronAPI?.ai) {
      setError('AI API only available in Electron');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await electronAPI.ai.generateEnemies(topic, difficulty);
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

  // Generate chapter
  const generateChapter = useCallback(async (
    title: string,
    content: string,
    difficulty = 3
  ): Promise<GeneratedChapter | null> => {
    if (!electronAPI?.ai) {
      setError('AI API only available in Electron');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await electronAPI.ai.generateChapter(title, content, difficulty);
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

  // Generate theme
  const generateTheme = useCallback(async (
    themeName: string,
    content: string
  ): Promise<Partial<GameTheme> | null> => {
    if (!electronAPI?.ai) {
      setError('AI API only available in Electron');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await electronAPI.ai.generateTheme(themeName, content);
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'Failed to generate theme');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [electronAPI]);

  // Generate mission briefing
  const generateMissionBriefing = useCallback(async (
    sectorName: string,
    sectorDescription: string
  ): Promise<string | null> => {
    if (!electronAPI?.ai) {
      setError('AI API only available in Electron');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await electronAPI.ai.generateMissionBriefing(sectorName, sectorDescription);
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'Failed to generate mission briefing');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [electronAPI]);

  // Generate all mission briefings
  const generateAllMissionBriefings = useCallback(async (
    sectors: Array<{ id: string; name: string; description: string }>
  ): Promise<Record<string, string> | null> => {
    if (!electronAPI?.ai) {
      setError('AI API only available in Electron');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await electronAPI.ai.generateAllMissionBriefings(sectors);
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'Failed to generate mission briefings');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [electronAPI]);

  // Test connection
  const testConnection = useCallback(async (): Promise<ConnectionTestResult> => {
    if (!electronAPI?.ai) {
      return { success: false, message: 'AI API 仅在桌面应用中可用' };
    }

    try {
      const result = await electronAPI.ai.testConnection();
      return result;
    } catch (e) {
      return {
        success: false,
        message: e instanceof Error ? e.message : '未知错误'
      };
    }
  }, [electronAPI]);

  // Load providers and check status on mount
  useEffect(() => {
    if (electronAPI?.ai) {
      loadProviders();
      checkStatus();
    }
  }, [electronAPI, loadProviders, checkStatus]);

  return {
    isConfigured,
    isLoading,
    error,
    providerId,
    providerName,
    model,
    providers,
    providersGrouped,
    loadProviders,
    setProvider,
    setApiKey,
    setModel,
    setAccountId,
    checkStatus,
    generateQuestions,
    generateKnowledgeTree,
    generateEnemies,
    generateChapter,
    generateTheme,
    generateMissionBriefing,
    generateAllMissionBriefings,
    testConnection,
    clearError,
  };
}
