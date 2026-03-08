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
  // 状态
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 当前配置
  providerId: string | null;
  providerName: string | null;
  model: string | null;
  
  // 提供商
  providers: AIProvider[];
  providersGrouped: AIProvidersGrouped | null;
  
  // 动作 - 配置
  loadProviders: () => Promise<void>;
  setProvider: (providerId: string) => Promise<boolean>;
  setApiKey: (key: string) => Promise<boolean>;
  setModel: (model: string) => Promise<boolean>;
  checkStatus: () => Promise<AIStatus | null>;
  resetConfig: () => Promise<boolean>;
  testConnection: () => Promise<ConnectionTestResult>;
  
  // 动作 - 生成
  generateQuestions: (content: string, options?: QuestionGenerationOptions) => Promise<Question[] | null>;
  generateKnowledgeTree: (content: string) => Promise<GeneratedKnowledgeTree | null>;
  generateEnemies: (topic: string, difficulty?: number) => Promise<EntropyEntity[] | null>;
  generateChapter: (title: string, content: string, difficulty?: number) => Promise<GeneratedChapter | null>;
  generateTheme: (themeName: string, content: string) => Promise<Partial<GameTheme> | null>;
  generateMissionBriefing: (sectorName: string, sectorDescription: string) => Promise<string | null>;
  generateAllMissionBriefings: (sectors: Array<{ id: string; name: string; description: string }>) => Promise<Record<string, string> | null>;
  
  // 工具
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

  // 检查是否在 Electron 中运行
  const electronAPI = typeof window !== 'undefined' ? window.electronAPI : undefined;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 加载提供商列表
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

  // 检查状态
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

  // 设置提供商
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
        // 从列表更新提供商名称
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

  // 设置 API 密钥
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

  // 设置模型
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

  // 生成题目
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

  // 生成知识树
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

  // 生成敌人
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

  // 生成章节
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

  // 生成主题
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

  // 生成任务简报
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

  // 生成所有任务简报
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

  // 测试连接
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

  // 重置配置
  const resetConfig = useCallback(async (): Promise<boolean> => {
    if (!electronAPI?.ai) {
      setError('AI API only available in Electron');
      return false;
    }

    try {
      const result = await electronAPI.ai.resetConfig();
      if (result.success) {
        setIsConfigured(false);
        setProviderId(null);
        setProviderName(null);
        setModelState(null);
        return true;
      } else {
        setError(result.error || 'Failed to reset config');
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return false;
    }
  }, [electronAPI]);

  // 挂载时加载提供商并检查状态
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
    checkStatus,
    generateQuestions,
    generateKnowledgeTree,
    generateEnemies,
    generateChapter,
    generateTheme,
    generateMissionBriefing,
    generateAllMissionBriefings,
    testConnection,
    resetConfig,
    clearError,
  };
}
