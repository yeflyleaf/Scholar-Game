// 页面：系统配置 (SettingsScreen) - 多 AI 提供商支持
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { useGameStore } from '../../stores/useGameStore';
import type { AIProvider, AICustomConfig } from '../../types/electron';
import { isElectron } from '../../types/electron';
import { CustomAlertDialog } from '../common/CustomAlertDialog';

// 动画状态指示器
const StatusIndicator: React.FC<{ isActive: boolean; label: string }> = ({ isActive, label }) => (
    <div className="flex items-center gap-2">
        <motion.div
            className={`w-3 h-3 rounded-full ${isActive ? 'bg-stable' : 'bg-gray-600'}`}
            animate={isActive ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
        />
        <span className={`text-sm font-mono ${isActive ? 'text-stable' : 'text-gray-500'}`}>
            {label}
        </span>
    </div>
);

// 区域面板组件
const SectionPanel: React.FC<{
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
}> = ({ title, subtitle, children, icon }) => (
    <motion.div
        className="fui-panel p-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="w-10 h-10 flex items-center justify-center bg-neon-cyan/10 border border-neon-cyan/30"
                        style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                        {icon}
                    </div>
                )}
                <div>
                    <h2 className="text-xl font-display text-white">{title}</h2>
                    {subtitle && <p className="text-xs font-mono text-gray-500">{subtitle}</p>}
                </div>
            </div>
        </div>
        {children}
    </motion.div>
);

// 提供商卡片组件
const ProviderCard: React.FC<{
    provider: AIProvider;
    isSelected: boolean;
    onClick: () => void;
}> = ({ provider, isSelected, onClick }) => (
    <motion.button
        onClick={onClick}
        className={`
            w-full p-4 text-left rounded-lg border-2 transition-all
            ${isSelected 
                ? 'border-neon-cyan bg-neon-cyan/10' 
                : 'border-gray-700 hover:border-gray-500 bg-gray-800/30'
            }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
    >
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <h3 className={`font-display font-bold ${isSelected ? 'text-neon-cyan' : 'text-white'}`}>
                    {provider.name}
                </h3>
            </div>
            {isSelected && (
                <span className="text-neon-cyan text-lg">✓</span>
            )}
        </div>
        <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded ${
                provider.region === 'china' 
                    ? 'bg-holographic-gold/20 text-holographic-gold' 
                    : 'bg-blue-500/20 text-blue-400'
            }`}>
                {provider.region === 'china' ? '🇨🇳 国内' : '🌍 国际'}
            </span>
            {provider.requiresProxy && (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400">
                    需代理
                </span>
            )}
        </div>
    </motion.button>
);

export const SettingsScreen: React.FC = () => {
    const { setScreen, settings, updateSettings, resetProgress, distributeAIQuestionsToSectors, applyAITheme, updateSectorBriefing, updateSectorMetadata } = useGameStore();
    const {
        isConfigured,
        isLoading,
        error,
        providerId,
        providerName,
        model,
        providers,
        providersGrouped,
        setProvider,
        setApiKey,
        setModel,
        checkStatus,
        generateQuestions,
        generateTheme,
        generateAllMissionBriefings,
        testConnection,
        resetConfig,
        getCustomConfig,
        saveCustomConfig,
        clearError
    } = useAI();

    // UI State
    const [activeTab, setActiveTab] = useState<'china' | 'international'>('china');
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [modelInput, setModelInput] = useState('');
    const [prevModel, setPrevModel] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
    
    // Generation State
    const [textContent, setTextContent] = useState('');
    const [chapterTitle, setChapterTitle] = useState('');
    const [generationStatus, setGenerationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [generatedQuestionCount, setGeneratedQuestionCount] = useState(0);
    
    // Connection Test State
    const [connectionTestStatus, setConnectionTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [connectionTestResult, setConnectionTestResult] = useState<{ message: string; responseTime?: number } | null>(null);

    // Dialog State
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showResetSuccess, setShowResetSuccess] = useState(false);

    const isElectronEnv = isElectron();

    // Custom Config State
    const [customConfig, setCustomConfig] = useState<AICustomConfig>({
        customProviders: [],
        customModels: {}
    });

    const [showAddProvider, setShowAddProvider] = useState(false);
    const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
    const [providerForm, setProviderForm] = useState({
        id: '',
        name: '',
        type: 'openai-compatible',
        baseUrl: '',
        defaultModel: '',
        region: 'china' as 'china' | 'international',
        requiresProxy: false,
        note: ''
    });

    const [selectedModelProviderId, setSelectedModelProviderId] = useState<string>('gemini');
    const [showAddModel, setShowAddModel] = useState(false);
    const [editingModelId, setEditingModelId] = useState<string | null>(null);
    const [modelForm, setModelForm] = useState({
        id: '',
        name: '',
        description: '',
        url: '',
        toolCalling: true,
        vision: true,
        maxInputTokens: 0,
        maxOutputTokens: 0
    });

    const [providerFormError, setProviderFormError] = useState('');
    const [modelFormError, setModelFormError] = useState('');
    const [providerToDelete, setProviderToDelete] = useState<string | null>(null);
    const [modelToDelete, setModelToDelete] = useState<{pid: string, mid: string} | null>(null);

    const loadCustomConfigData = async () => {
        if (isElectronEnv && typeof getCustomConfig === 'function') {
            const config = await getCustomConfig();
            if (config) {
                setCustomConfig(config);
            }
        }
    };

    const handleSaveCustomConfig = async (newConfig: AICustomConfig) => {
        if (typeof saveCustomConfig === 'function') {
            const success = await saveCustomConfig(newConfig);
            if (success) {
                setCustomConfig(newConfig);
            }
        }
    };

    useEffect(() => {
        if (isElectronEnv) {
            loadCustomConfigData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isElectronEnv]);

    // Sync selectedModelProviderId when providerId changes (outside of useEffect to avoid cascading renders)
    const [prevProviderId, setPrevProviderId] = useState<string | null>(null);
    if (providerId !== prevProviderId) {
        setPrevProviderId(providerId);
        if (providerId) {
            setSelectedModelProviderId(providerId);
        }
    }

    const handleEditProvider = (p: AIProvider) => {
        setProviderForm({
            id: p.id,
            name: p.name,
            type: p.type || 'openai-compatible',
            baseUrl: p.baseUrl || '',
            defaultModel: p.defaultModel || '',
            region: p.region || 'china',
            requiresProxy: !!p.requiresProxy,
            note: p.note || ''
        });
        setEditingProviderId(p.id);
        setShowAddProvider(true);
    };

    const handleDeleteProvider = (pid: string) => {
        setProviderToDelete(pid);
    };

    const confirmDeleteProvider = async () => {
        if (!providerToDelete) return;
        const newConfig = {
            ...customConfig,
            customProviders: customConfig.customProviders.filter(p => p.id !== providerToDelete)
        };
        await handleSaveCustomConfig(newConfig);
        if (providerId === providerToDelete) {
            await setProvider('gemini');
        }
        setProviderToDelete(null);
    };

    const handleSaveProviderForm = async () => {
        setProviderFormError('');

        // 如果是新增，自动生成唯一的内部 ID
        let currentId = providerForm.id;
        if (!editingProviderId && !currentId) {
            currentId = 'custom_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
        }

        if (!providerForm.name || !providerForm.baseUrl) {
            setProviderFormError('请填写必要的信息：名称和 API Base URL');
            return;
        }

        let updatedProviders = [...customConfig.customProviders];
        if (editingProviderId) {
            updatedProviders = updatedProviders.map(p => p.id === editingProviderId ? { ...p, ...providerForm, id: currentId } : p);
        } else {
            updatedProviders.push({
                ...providerForm,
                id: currentId,
                models: []
            } as AIProvider);
        }

        const newConfig = {
            ...customConfig,
            customProviders: updatedProviders
        };

        await handleSaveCustomConfig(newConfig);
        setShowAddProvider(false);
        setEditingProviderId(null);
        setProviderForm({
            id: '',
            name: '',
            type: 'openai-compatible',
            baseUrl: '',
            defaultModel: '',
            region: 'china',
            requiresProxy: false,
            note: ''
        });
    };

    const handleAddModelSubmit = async () => {
        setModelFormError('');
        if (!modelForm.id || !modelForm.name) {
            setModelFormError('请填写必要的信息：模型 ID 和模型名称');
            return;
        }

        const currentCustomModels = { ...customConfig.customModels };
        const modelsForProvider = currentCustomModels[selectedModelProviderId] || [];
        const targetProvider = providers.find(p => p.id === selectedModelProviderId);

        let newModels;
        if (editingModelId) {
            if (modelForm.id !== editingModelId && targetProvider?.models.some(m => m.id === modelForm.id)) {
                setModelFormError('模型 ID 已存在于该服务商中');
                return;
            }
            newModels = modelsForProvider.map(m => m.id === editingModelId ? {
                ...m,
                id: modelForm.id,
                name: modelForm.name,
                description: modelForm.description,
                url: modelForm.url,
                toolCalling: modelForm.toolCalling,
                vision: modelForm.vision,
                maxInputTokens: modelForm.maxInputTokens || undefined,
                maxOutputTokens: modelForm.maxOutputTokens || undefined,
            } : m);
        } else {
            if (targetProvider?.models.some(m => m.id === modelForm.id)) {
                setModelFormError('模型 ID 已存在于该服务商中');
                return;
            }
            newModels = [
                ...modelsForProvider,
                {
                    id: modelForm.id,
                    name: modelForm.name,
                    description: modelForm.description,
                    url: modelForm.url,
                    toolCalling: modelForm.toolCalling,
                    vision: modelForm.vision,
                    maxInputTokens: modelForm.maxInputTokens || undefined,
                    maxOutputTokens: modelForm.maxOutputTokens || undefined,
                }
            ];
        }

        const newConfig = {
            ...customConfig,
            customModels: {
                ...currentCustomModels,
                [selectedModelProviderId]: newModels
            }
        };

        await handleSaveCustomConfig(newConfig);
        setShowAddModel(false);
        setEditingModelId(null);
        setModelForm({ id: '', name: '', description: '', url: '', toolCalling: true, vision: true, maxInputTokens: 0, maxOutputTokens: 0 });
    };


    const handleDeleteModel = (pid: string, mid: string) => {
        setModelToDelete({pid, mid});
    };

    const confirmDeleteModel = async () => {
        if (!modelToDelete) return;
        const { pid, mid } = modelToDelete;
        const currentCustomModels = { ...customConfig.customModels };
        const modelsForProvider = currentCustomModels[pid] || [];
        const newModels = modelsForProvider.filter(m => m.id !== mid);

        const newConfig = {
            ...customConfig,
            customModels: {
                ...currentCustomModels,
                [pid]: newModels
            }
        };

        await handleSaveCustomConfig(newConfig);
        setModelToDelete(null);
    };

    // Get current provider info
    const currentProvider = providers.find(p => p.id === providerId);
    const availableModels = currentProvider?.models || [];
    const availableModelIds = availableModels.map(m => m.id).join(',');

    // Auto-select first available model if current model is invalid
    useEffect(() => {
        if (availableModels.length > 0 && model) {
            const isModelValid = availableModels.some(m => m.id === model);
            if (!isModelValid) {
                const firstModelId = availableModels[0].id;
                setModelInput(firstModelId);
                setModel(firstModelId);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableModelIds, model, setModel]);

    useEffect(() => {
        if (isElectronEnv) {
            checkStatus();
        }
    }, [isElectronEnv, checkStatus]);

    // Sync model input when model changes (outside of useEffect to avoid cascading renders)
    if (model !== prevModel) {
        setPrevModel(model);
        if (model) {
            setModelInput(model);
        }
    }

    // Fullscreen toggle
    useEffect(() => {
        const handleFullscreen = async () => {
            try {
                if (settings.fullscreen) {
                    if (!document.fullscreenElement) {
                        await document.documentElement.requestFullscreen();
                    }
                } else {
                    if (document.fullscreenElement) {
                        await document.exitFullscreen();
                    }
                }
            } catch (err) {
                console.error("Fullscreen toggle failed:", err);
            }
        };
        handleFullscreen();
    }, [settings.fullscreen]);

    const handleSelectProvider = async (id: string) => {
        await setProvider(id);
        setApiKeyInput('');
        setSaveStatus('idle');
    };

    const handleSaveApiKey = async () => {
        if (apiKeyInput.trim()) {
            const success = await setApiKey(apiKeyInput.trim());
            if (success) {
                setApiKeyInput('');
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        }
    };


    const handleGenerate = async () => {
        if (!textContent.trim() || !chapterTitle.trim()) return;
        setGenerationStatus('loading');
        setGeneratedQuestionCount(0);
        clearError();
        
        try {
            let questionsSuccess = false;
            
            const questions = await generateQuestions(textContent, {
                count: 60,
                difficulty: settings.difficulty as 1 | 2 | 3 | 4 | 5 | 'mixed'
            });
            
            if (questions && questions.length > 0) {
                distributeAIQuestionsToSectors(questions, chapterTitle);
                setGeneratedQuestionCount(questions.length);
                questionsSuccess = true;
            }
            
            const theme = await generateTheme(chapterTitle, textContent);
            
            if (theme) {
                applyAITheme(theme);
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const themeWithSectors = theme as any;
                if (themeWithSectors.sectors && Array.isArray(themeWithSectors.sectors)) {
                    updateSectorMetadata(themeWithSectors.sectors);
                }
                
                const currentSectors = useGameStore.getState().sectors;
                const targetSectors = currentSectors.slice(0, 6).map(s => ({
                    id: s.id,
                    name: s.name,
                    description: s.description
                }));

                if (targetSectors.length > 0) {
                    const briefings = await generateAllMissionBriefings(targetSectors);
                    if (briefings) {
                        Object.entries(briefings).forEach(([sectorId, briefing]) => {
                            updateSectorBriefing(sectorId, briefing);
                        });
                    }
                }
            }
            
            if (questionsSuccess) {
                setGenerationStatus('success');
                setTextContent('');
                setChapterTitle('');
            } else {
                setGenerationStatus('error');
            }
        } catch {
            setGenerationStatus('error');
        }
    };

    const handleGoToLevelSelect = () => {
        setScreen('GRAND_UNIFICATION_SIM');
    };

    const handleResetConfirm = async () => {
        setShowResetConfirm(false);
        resetProgress();
        if (isElectronEnv) {
            await resetConfig();
        }
        setShowResetSuccess(true);
    };

    const chinaProviders = providersGrouped?.china || [];
    const internationalProviders = providersGrouped?.international || [];

    return (
        <div className="w-full h-screen bg-deep-space relative overflow-y-auto">
            <div className="hex-grid-bg opacity-20" />
            <div className="data-stream opacity-10" />

            <div className="max-w-5xl mx-auto p-8 space-y-8 relative z-10">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-4xl font-display font-bold text-neon-cyan glitch-text" data-text="系统配置">
                            系统配置
                        </h1>
                        <p className="text-sm font-mono text-gray-500 mt-1">多AI核心 | 灵感中枢</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isElectronEnv && (
                            <motion.button
                                onClick={() => window.electronAPI?.app.quit()}
                                className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-mono rounded hover:bg-red-500/30 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                退出程序
                            </motion.button>
                        )}
                        <motion.button
                            onClick={() => setScreen('TITLE')}
                            className="hex-button text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            返回枢纽
                        </motion.button>
                    </div>
                </motion.div>

                {/* Status Overview */}
                <motion.div
                    className="fui-panel p-4 flex items-center justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-8">
                        <StatusIndicator isActive={isElectronEnv} label="桌面应用环境" />
                        <StatusIndicator isActive={isConfigured} label="AI 核心连接" />
                        {providerName && (
                            <span className="text-sm font-mono text-neon-cyan">
                                当前: {providerName}
                            </span>
                        )}
                    </div>
                    <span className="text-xs font-mono text-gray-500">
                        支持 9+ AI 提供商
                    </span>
                </motion.div>

                {/* Basic Settings */}
                <SectionPanel
                    title="基础设置"
                    subtitle="系统参数调整"
                    icon={<span className="text-neon-cyan">⚙</span>}
                >
                    <div className="space-y-6">
                        {/* 难度等级 - 用于游戏机制调节 */}
                        <div className="space-y-5">
                            <span className="text-lg font-display font-bold text-holographic-gold block mb-3">
                                难度等级
                            </span>
                            <div className="flex gap-3">
                                {([1, 2, 3, 4, 5] as const).map((lvl) => (
                                    <motion.button
                                        key={lvl}
                                        onClick={() => updateSettings({ difficulty: lvl })}
                                        className={`
                                            w-12 h-12 font-display font-bold text-lg
                                            border-2 transition-all duration-300
                                            ${settings.difficulty === lvl
                                                ? 'border-holographic-gold bg-holographic-gold/20 text-holographic-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                                                : 'border-gray-600 text-gray-500 hover:border-gray-500'
                                            }
                                        `}
                                        style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {lvl}
                                    </motion.button>
                                ))}
                            </div>
                            {/* 难度说明 */}
                            <div className="text-sm font-mono text-gray-400 space-y-1 bg-gray-800/50 p-3 rounded border border-gray-700">
                                {settings.difficulty === 1 && (
                                    <p>✨ <span className="text-stable">新手模式</span> - 答题时间: <span className="text-stable">+20s</span> | 我方攻击力: <span className="text-neon-cyan">25</span> | 敌方攻击力: <span className="text-stable">-5</span> | 敌方生命: <span className="text-glitch-red">+100</span></p>
                                )}
                                {settings.difficulty === 2 && (
                                    <p>🌟 <span className="text-neon-cyan">简单模式</span> - 答题时间: <span className="text-neon-cyan">+10s</span> | 我方攻击力: <span className="text-neon-cyan">20</span> | 敌方攻击力: <span className="text-gray-400">不变</span> | 敌方生命: <span className="text-glitch-red">+200</span></p>
                                )}
                                {settings.difficulty === 3 && (
                                    <p>⚔️ <span className="text-holographic-gold">标准模式</span> - 答题时间: <span className="text-gray-400">默认</span> | 我方攻击力: <span className="text-neon-cyan">15</span> | 敌方攻击力: <span className="text-glitch-red">+5</span> | 敌方生命: <span className="text-glitch-red">+300</span></p>
                                )}
                                {settings.difficulty === 4 && (
                                    <p>🔥 <span className="text-orange-400">困难模式</span> - 答题时间: <span className="text-orange-400">-10s</span> | 我方攻击力: <span className="text-neon-cyan">10</span> | 敌方攻击力: <span className="text-glitch-red">+10</span> | 敌方生命: <span className="text-glitch-red">+500</span></p>
                                )}
                                {settings.difficulty === 5 && (
                                    <p>💀 <span className="text-glitch-red">地狱模式</span> - 答题时间: <span className="text-glitch-red">-15s</span> | 我方攻击力: <span className="text-neon-cyan">5</span> | 敌方攻击力: <span className="text-glitch-red">+20</span> | 敌方生命: <span className="text-glitch-red">+1000</span></p>
                                )}
                            </div>
                        </div>

                        {/* 全屏模式 */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-mono text-gray-300">全屏模式</span>
                            <motion.button
                                onClick={() => updateSettings({ fullscreen: !settings.fullscreen })}
                                className={`w-12 h-6 rounded-full relative transition-colors ${settings.fullscreen ? 'bg-neon-cyan' : 'bg-gray-700'}`}
                            >
                                <motion.div 
                                    className="w-4 h-4 bg-white rounded-full absolute top-1"
                                    animate={{ left: settings.fullscreen ? 'calc(100% - 1.25rem)' : '0.25rem' }}
                                />
                            </motion.button>
                        </div>
                    </div>
                </SectionPanel>

                {/* AI Provider Selection */}
                <SectionPanel
                    title="AI 核心选择"
                    subtitle="选择你的 AI 提供商"
                    icon={<span className="text-neon-cyan">◈</span>}
                >
                    <div className="space-y-6">
                        {/* Region Tabs */}
                        <div className="flex gap-4 border-b border-gray-700">
                            <button
                                onClick={() => setActiveTab('china')}
                                className={`pb-3 px-4 font-mono text-sm transition-colors relative ${
                                    activeTab === 'china' 
                                        ? 'text-holographic-gold' 
                                        : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                🇨🇳 国内提供商
                                {activeTab === 'china' && (
                                    <motion.div 
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-holographic-gold"
                                        layoutId="tab-indicator"
                                    />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('international')}
                                className={`pb-3 px-4 font-mono text-sm transition-colors relative ${
                                    activeTab === 'international' 
                                        ? 'text-blue-400' 
                                        : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                🌍 国际提供商
                                {activeTab === 'international' && (
                                    <motion.div 
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                                        layoutId="tab-indicator"
                                    />
                                )}
                            </button>
                        </div>

                        {/* Provider Grid */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-2 md:grid-cols-3 gap-4"
                            >
                                {(activeTab === 'china' ? chinaProviders : internationalProviders).map((provider) => (
                                    <ProviderCard
                                        key={provider.id}
                                        provider={provider}
                                        isSelected={providerId === provider.id}
                                        onClick={() => handleSelectProvider(provider.id)}
                                    />
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {/* Selected Provider Info */}
                        {currentProvider && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-neon-cyan/5 border border-neon-cyan/20 p-4 rounded-lg"
                            >
                                <h4 className="text-neon-cyan font-display mb-2">
                                    已选择: {currentProvider.name}
                                </h4>
                            </motion.div>
                        )}
                    </div>
                </SectionPanel>

                {/* API Key Configuration */}
                <SectionPanel
                    title="API 密钥配置"
                    subtitle="连接你选择的 AI 核心"
                    icon={<span className="text-neon-cyan">🔑</span>}
                >
                    <div className="space-y-4">
                        {/* API Key Input */}
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="password"
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                    placeholder={`输入 ${providerName || 'AI'} API 密钥...`}
                                    className="fui-input w-full pr-12"
                                />
                                {isConfigured && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <span className="text-stable text-lg">✓</span>
                                    </div>
                                )}
                            </div>
                            <motion.button
                                onClick={handleSaveApiKey}
                                disabled={isLoading || !apiKeyInput.trim()}
                                className="hex-button px-6 disabled:opacity-80 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                                        连接中
                                    </span>
                                ) : saveStatus === 'success' ? (
                                    <span className="text-stable">✓ 已保存</span>
                                ) : (
                                    '保存密钥'
                                )}
                            </motion.button>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <motion.div
                                className="bg-glitch-red/10 border border-glitch-red/30 p-3 rounded"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <span className="text-glitch-red font-mono text-sm">⚠ {error}</span>
                            </motion.div>
                        )}

                        <p className="text-xs font-mono text-gray-500 leading-relaxed">
                            密钥将安全存储于本地。不同提供商的密钥获取方式见各自官网文档。
                        </p>
                    </div>
                </SectionPanel>

                {/* Model Configuration */}
                <SectionPanel
                    title="模型配置"
                    subtitle="选择 AI 模型"
                    icon={<span className="text-neon-cyan">🧠</span>}
                >
                    <div className="space-y-4">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="block text-sm font-mono text-gray-400">
                                    模型标识
                                </label>
                                <select
                                    value={modelInput}
                                    onChange={async (e) => {
                                        const val = e.target.value;
                                        setModelInput(val);
                                        await setModel(val);
                                    }}
                                    className="fui-input w-full bg-gray-800"
                                >
                                    {availableModels.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} {m.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* Connection Test */}
                        <div className="flex items-center gap-4 pt-2">
                            <motion.button
                                onClick={async () => {
                                    setConnectionTestStatus('testing');
                                    setConnectionTestResult(null);
                                    const result = await testConnection();
                                    setConnectionTestStatus(result.success ? 'success' : 'error');
                                    setConnectionTestResult({ message: result.message, responseTime: result.responseTime });
                                    // 5秒后重置状态
                                    setTimeout(() => {
                                        setConnectionTestStatus('idle');
                                    }, 5000);
                                }}
                                disabled={!isConfigured || connectionTestStatus === 'testing'}
                                className={`px-4 py-2 font-mono text-sm border-2 transition-all duration-300 ${
                                    connectionTestStatus === 'success'
                                        ? 'border-stable bg-stable/20 text-stable'
                                        : connectionTestStatus === 'error'
                                        ? 'border-glitch-red bg-glitch-red/20 text-glitch-red'
                                        : connectionTestStatus === 'testing'
                                        ? 'border-holographic-gold bg-holographic-gold/20 text-holographic-gold'
                                        : 'border-gray-600 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                                whileHover={{ scale: isConfigured && connectionTestStatus !== 'testing' ? 1.02 : 1 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {connectionTestStatus === 'testing' ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-holographic-gold border-t-transparent rounded-full animate-spin" />
                                        测试中...
                                    </span>
                                ) : connectionTestStatus === 'success' ? (
                                    '✓ 连接成功'
                                ) : connectionTestStatus === 'error' ? (
                                    '✗ 连接失败'
                                ) : (
                                    '🔗 测试连接'
                                )}
                            </motion.button>
                            
                            {connectionTestResult && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`text-xs font-mono ${
                                        connectionTestStatus === 'success' ? 'text-stable' : 'text-glitch-red'
                                    }`}
                                >
                                    {connectionTestResult.responseTime && (
                                        <span className="text-holographic-gold mr-2">
                                            {connectionTestResult.responseTime}ms
                                        </span>
                                    )}
                                    {connectionTestResult.message}
                                </motion.span>
                            )}
                        </div>
                        
                        <p className="text-xs font-mono text-gray-500 leading-relaxed">
                            当前模型: <span className="text-neon-cyan">{availableModels.find(m => m.id === model)?.name || model || '未选择'}</span>
                        </p>
                    </div>
                </SectionPanel>

                {/* 自定义 AI 核心与模型可视化配置面板 */}
                {isElectronEnv && (
                    <SectionPanel
                        title="自定义 AI 核心与模型"
                        subtitle="可视化自主配置与扩展您的 AI 服务及模型库"
                        icon={<span className="text-neon-cyan">⚙</span>}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* 左列：服务商管理 */}
                            <div className="space-y-4 lg:border-r border-gray-800 lg:pr-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-display font-bold text-holographic-gold">
                                        自定义服务商列表
                                    </span>
                                    {!showAddProvider && (
                                        <button
                                            onClick={() => {
                                                setShowAddProvider(true);
                                                setEditingProviderId(null);
                                                setProviderForm({
                                                    id: '',
                                                    name: '',
                                                    type: 'openai-compatible',
                                                    baseUrl: '',
                                                    defaultModel: '',
                                                    region: 'china',
                                                    requiresProxy: false,
                                                    note: ''
                                                });
                                            }}
                                            className="px-3 py-1 text-xs border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 transition-colors rounded"
                                        >
                                            + 新增服务商
                                        </button>
                                    )}
                                </div>

                                {/* 自定义服务商列表滚动区域 */}
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                    {customConfig.customProviders.length === 0 ? (
                                        <p className="text-xs font-mono text-gray-500 italic py-4">
                                            暂无自定义服务商。您可以通过上方按钮进行添加。
                                        </p>
                                    ) : (
                                        customConfig.customProviders.map((p) => (
                                            <div 
                                                key={p.id}
                                                className="p-3 bg-gray-850/40 border border-gray-700 rounded-lg flex items-center justify-between hover:border-gray-500 transition-colors"
                                            >
                                                <div>
                                                    <h4 className="text-sm font-display font-bold text-white">
                                                        {p.name} <span className="text-xs font-mono text-gray-500 font-normal">({p.id})</span>
                                                    </h4>
                                                    <p className="text-xs font-mono text-gray-400 mt-1 truncate max-w-[220px]">
                                                        {p.baseUrl}
                                                    </p>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-[10px] px-1.5 py-0.2 bg-gray-700 text-gray-300 rounded font-mono">
                                                            {p.region === 'china' ? '🇨🇳 国内' : '🌍 国际'}
                                                        </span>
                                                        {p.requiresProxy && (
                                                            <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded font-mono">
                                                                需代理
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditProvider(p)}
                                                        className="px-2 py-1 text-xs text-neon-cyan hover:bg-neon-cyan/10 rounded transition-colors"
                                                    >
                                                        编辑
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProvider(p.id)}
                                                        className="px-2 py-1 text-xs text-glitch-red hover:bg-glitch-red/10 rounded transition-colors"
                                                    >
                                                        删除
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* 服务商新增与编辑表单 */}
                                {showAddProvider && (
                                    <motion.div 
                                        className="p-4 bg-gray-900/80 border border-neon-cyan/30 rounded-lg space-y-3"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <h4 className="text-sm font-display font-bold text-neon-cyan">
                                            {editingProviderId ? '编辑服务商' : '新增自定义服务商'}
                                        </h4>
                                        <div className="space-y-1">
                                            <label className="text-xs font-mono text-gray-400 block">名称 (显示用)</label>
                                            <input
                                                type="text"
                                                value={providerForm.name}
                                                onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                                                placeholder="e.g. Deep Seek"
                                                className="fui-input w-full text-sm py-1.5 px-2 bg-gray-800"
                                            />
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <label className="text-xs font-mono text-gray-400 block">API Base URL</label>
                                            <input
                                                type="text"
                                                value={providerForm.baseUrl}
                                                onChange={(e) => setProviderForm({ ...providerForm, baseUrl: e.target.value })}
                                                placeholder="e.g. https://api.deepseek.com"
                                                className="fui-input w-full text-sm py-1.5 px-2 bg-gray-800"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-xs font-mono text-gray-400 block">默认模型 ID</label>
                                                <input
                                                    type="text"
                                                    value={providerForm.defaultModel}
                                                    onChange={(e) => setProviderForm({ ...providerForm, defaultModel: e.target.value })}
                                                    placeholder="e.g. deepseek-v4-pro"
                                                    className="fui-input w-full text-sm py-1.5 px-2 bg-gray-800"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-mono text-gray-400 block">区域归属</label>
                                                <select
                                                    value={providerForm.region}
                                                    onChange={(e) => setProviderForm({ ...providerForm, region: e.target.value as 'china' | 'international' })}
                                                    className="fui-input w-full text-sm py-1.5 px-2 bg-gray-800"
                                                >
                                                    <option value="china">🇨🇳 国内区域</option>
                                                    <option value="international">🌍 国际区域</option>
                                                </select>
                                            </div>
                                        </div>



                                        {providerFormError && <div className="text-red-500 text-xs font-mono">{providerFormError}</div>}
                                        <div className="flex justify-end gap-3 pt-2">
                                            <button
                                                onClick={() => {
                                                    setShowAddProvider(false);
                                                    setEditingProviderId(null);
                                                    setProviderFormError('');
                                                }}
                                                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                                            >
                                                取消
                                            </button>
                                            <button
                                                onClick={handleSaveProviderForm}
                                                className="px-4 py-1.5 text-xs bg-neon-cyan/20 border border-neon-cyan text-neon-cyan rounded hover:bg-neon-cyan/30 transition-colors"
                                            >
                                                保存服务商
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* 右列：模型配置字典 */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <span className="text-sm font-display font-bold text-holographic-gold block">
                                        模型配置管理
                                    </span>
                                    <div className="flex gap-2 items-center">
                                        <span className="text-xs font-mono text-gray-400 shrink-0">选择服务商:</span>
                                        <select
                                            value={selectedModelProviderId}
                                            onChange={(e) => setSelectedModelProviderId(e.target.value)}
                                            className="fui-input flex-1 bg-gray-800 text-sm py-1.5 px-2"
                                        >
                                            {providers.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} {p.id === providerId ? '(当前激活)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* 模型列表滚动区域 */}
                                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 border-t border-gray-800/50 pt-3">
                                    {(() => {
                                        const currentModelProvider = providers.find(p => p.id === selectedModelProviderId);
                                        const allModels = currentModelProvider?.models || [];
                                        
                                        if (allModels.length === 0) {
                                            return (
                                                <p className="text-xs font-mono text-gray-500 italic py-4">
                                                    该服务商暂无模型列表。请在下方添加第一个模型。
                                                </p>
                                            );
                                        }

                                        return allModels.map((m) => {
                                            const isCustomModel = !!m.isCustom;
                                            return (
                                                <div 
                                                    key={m.id}
                                                    className="flex items-center justify-between p-2 bg-gray-800/20 border border-gray-700/50 rounded hover:border-gray-600 transition-colors animate-fade-in"
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-mono text-white font-bold">{m.name}</span>
                                                            <span className="text-[9px] font-mono text-gray-500">({m.id})</span>
                                                            <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono ${
                                                                isCustomModel 
                                                                    ? 'bg-holographic-gold/20 text-holographic-gold border border-holographic-gold/30' 
                                                                    : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                                                            }`}>
                                                                {isCustomModel ? '自定义' : '内置'}
                                                            </span>
                                                        </div>
                                                        {m.description && (
                                                            <p className="text-[10px] font-mono text-gray-400 mt-0.5">{m.description}</p>
                                                        )}
                                                    </div>
                                                    {isCustomModel && (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    setModelForm({
                                                                        id: m.id,
                                                                        name: m.name,
                                                                        description: m.description || '',
                                                                        url: m.url || '',
                                                                        toolCalling: m.toolCalling ?? true,
                                                                        vision: m.vision ?? true,
                                                                        maxInputTokens: m.maxInputTokens || 0,
                                                                        maxOutputTokens: m.maxOutputTokens || 0
                                                                    });
                                                                    setEditingModelId(m.id);
                                                                    setShowAddModel(true);
                                                                }}
                                                                className="px-2 py-0.5 text-[10px] text-neon-cyan hover:bg-neon-cyan/10 rounded transition-colors border border-transparent hover:border-neon-cyan/30"
                                                            >
                                                                编辑
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteModel(selectedModelProviderId, m.id)}
                                                                className="px-2 py-0.5 text-[10px] text-glitch-red hover:bg-glitch-red/10 rounded transition-colors border border-transparent hover:border-glitch-red/30"
                                                            >
                                                                删除
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>

                                {/* 模型新增表单 */}
                                {!showAddModel ? (
                                    <button
                                        onClick={() => {
                                            setShowAddModel(true);
                                            setEditingModelId(null);
                                            setModelFormError('');
                                            setModelForm({ id: '', name: '', description: '', url: '', toolCalling: true, vision: true, maxInputTokens: 0, maxOutputTokens: 0 });
                                        }}
                                        className="w-full py-2 border border-dashed border-gray-700 text-gray-400 hover:text-neon-cyan hover:border-neon-cyan/50 text-xs font-mono transition-colors rounded"
                                    >
                                        + 为此服务商添加模型
                                    </button>
                                ) : (
                                    <motion.div 
                                        className="p-3 bg-gray-900/60 border border-holographic-gold/30 rounded-lg space-y-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <h4 className="text-xs font-display font-bold text-holographic-gold">
                                            {editingModelId ? '编辑模型' : '添加新模型'}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono text-gray-400 block">模型真实 ID (与厂商完全一致)</label>
                                                <input
                                                    type="text"
                                                    value={modelForm.id}
                                                    onChange={(e) => setModelForm({ ...modelForm, id: e.target.value.trim() })}
                                                    placeholder="e.g. deepseek-v4-pro"
                                                    className="fui-input w-full text-xs py-1 px-1.5 bg-gray-800"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono text-gray-400 block">模型友好显示名称</label>
                                                <input
                                                    type="text"
                                                    value={modelForm.name}
                                                    onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                                                    placeholder="e.g. Deep Seek V4 Pro"
                                                    className="fui-input w-full text-xs py-1 px-1.5 bg-gray-800"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="toolCalling"
                                                    checked={modelForm.toolCalling}
                                                    onChange={(e) => setModelForm({ ...modelForm, toolCalling: e.target.checked })}
                                                    className="w-3 h-3 text-neon-cyan bg-gray-800 border-gray-600 rounded focus:ring-neon-cyan/50"
                                                />
                                                <label htmlFor="toolCalling" className="ml-2 text-[10px] font-mono text-gray-400">支持工具调用 (toolCalling)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="vision"
                                                    checked={modelForm.vision}
                                                    onChange={(e) => setModelForm({ ...modelForm, vision: e.target.checked })}
                                                    className="w-3 h-3 text-neon-cyan bg-gray-800 border-gray-600 rounded focus:ring-neon-cyan/50"
                                                />
                                                <label htmlFor="vision" className="ml-2 text-[10px] font-mono text-gray-400">支持视觉 (vision)</label>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono text-gray-400 block">最大输入 Token (可选)</label>
                                                <input
                                                    type="number"
                                                    value={modelForm.maxInputTokens || ''}
                                                    onChange={(e) => setModelForm({ ...modelForm, maxInputTokens: parseInt(e.target.value) || 0 })}
                                                    placeholder="1024000"
                                                    className="fui-input w-full text-xs py-1 px-1.5 bg-gray-800"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono text-gray-400 block">最大输出 Token (可选)</label>
                                                <input
                                                    type="number"
                                                    value={modelForm.maxOutputTokens || ''}
                                                    onChange={(e) => setModelForm({ ...modelForm, maxOutputTokens: parseInt(e.target.value) || 0 })}
                                                    placeholder="32768"
                                                    className="fui-input w-full text-xs py-1 px-1.5 bg-gray-800"
                                                />
                                            </div>
                                        </div>
                                        {modelFormError && <div className="text-red-500 text-[10px] font-mono mt-1">{modelFormError}</div>}
                                        <div className="flex justify-end gap-2 pt-1">
                                            <button
                                                onClick={() => {
                                                    setShowAddModel(false);
                                                    setEditingModelId(null);
                                                    setModelFormError('');
                                                }}
                                                className="px-2.5 py-1 text-[10px] text-gray-400 hover:text-white transition-colors"
                                            >
                                                取消
                                            </button>
                                            <button
                                                onClick={handleAddModelSubmit}
                                                className="px-3 py-1 text-[10px] bg-holographic-gold/20 border border-holographic-gold text-holographic-gold rounded hover:bg-holographic-gold/30 transition-colors"
                                            >
                                                {editingModelId ? '保存修改' : '确认添加'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </SectionPanel>
                )}

                {/* Data Synthesis */}
                <SectionPanel
                    title="数据合成"
                    subtitle="知识合成引擎"
                    icon={<span className="text-holographic-gold">⬡</span>}
                >
                    <div className="space-y-6">
                        {/* Chapter Title */}
                        <div className="space-y-2">
                            <label className="block text-lg font-mono text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 bg-neon-cyan" />
                                章节标识
                            </label>
                            <input
                                type="text"
                                value={chapterTitle}
                                onChange={(e) => setChapterTitle(e.target.value)}
                                placeholder="例: 计算机操作系统"
                                className="fui-input w-full"
                            />
                        </div>



                        {/* Source Content */}
                        <div className="space-y-2">
                            <label className="block text-lg font-mono text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 bg-neon-cyan" />
                                源数据输入
                            </label>
                            <textarea
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                rows={8}
                                className="fui-input w-full resize-none"
                                placeholder="在此粘贴复习资料、教材内容或笔记...&#10;&#10;AI 将根据输入内容自动生成相关题目。"
                            />
                            <div className="flex justify-between text-xs font-mono text-gray-500">
                                <span className="text-red-400 text-lg">仅支持.txt和.md文本格式</span>
                                <span>{textContent.length} 字符</span>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <motion.button
                            onClick={handleGenerate}
                            disabled={generationStatus === 'loading' || !isConfigured || !textContent.trim() || !chapterTitle.trim()}
                            className={`hex-button w-full py-4 text-lg font-display relative overflow-hidden ${
                                !isConfigured ? 'opacity-80 cursor-not-allowed' : ''
                            }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            {generationStatus === 'loading' ? (
                                <span className="flex items-center justify-center gap-3">
                                    <div className="processing-ring w-6 h-6 border-2" style={{ borderWidth: '2px' }} />
                                    <span>正在使用 {providerName} 合成...</span>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <span>启动合成</span>
                                    <span className="text-holographic-gold">⬡</span>
                                </span>
                            )}
                            {generationStatus === 'loading' && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-cyan/30 to-neon-cyan/10"
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                />
                            )}
                        </motion.button>

                        {/* Status Messages */}
                        <AnimatePresence mode="wait">
                            {generationStatus === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-stable/10 border border-stable/30 p-4 rounded"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-stable text-2xl">✓</span>
                                        <div>
                                            <p className="text-stable font-display">合成完成</p>
                                            <p className="text-sm text-stable/70 font-mono">
                                                已成功生成 <span className="text-holographic-gold font-bold">{generatedQuestionCount}</span> 道AI题目
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-3">
                                        <motion.button
                                            onClick={handleGoToLevelSelect}
                                            className="flex-1 py-2 px-4 bg-stable/20 border border-stable/50 text-stable font-mono text-sm rounded hover:bg-stable/30 transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            🚀 前往关卡选择
                                        </motion.button>
                                        <motion.button
                                            onClick={() => setGenerationStatus('idle')}
                                            className="py-2 px-4 border border-gray-600 text-gray-400 font-mono text-sm rounded hover:border-gray-500 transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            继续生成
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                            {generationStatus === 'error' && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-glitch-red/10 border border-glitch-red/30 p-4 rounded flex items-center gap-3"
                                >
                                    <span className="text-glitch-red text-2xl">✕</span>
                                    <div>
                                        <p className="text-glitch-red font-display">合成失败</p>
                                        <p className="text-sm text-glitch-red/70 font-mono">
                                            {error || '检查 AI 核心连接状态'}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </SectionPanel>

                {/* Danger Zone */}
                <SectionPanel
                    title="危险区域"
                    subtitle="数据重置与调试"
                    icon={<span className="text-glitch-red">⚠</span>}
                >
                    <div className="space-y-4">
                        <p className="text-sm font-mono text-gray-400">
                            重置所有游戏进度，包括解锁的扇区、获得的铭文和经验值。此操作不可逆。
                        </p>
                        <motion.button
                            onClick={() => setShowResetConfirm(true)}
                            className="hex-button border-glitch-red text-glitch-red hover:bg-glitch-red/10 w-full py-3"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            重置游戏进度
                        </motion.button>
                    </div>
                </SectionPanel>

                {/* Footer */}
                <motion.div
                    className="text-center py-8 space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="text-xs font-mono text-gray-500">
                        智者计划 | 学习飞升 | 支持 9+ AI 提供商
                    </p>
                    <p className="text-xs font-mono text-gray-600">
                        为世界上所有的不挂科而战！
                    </p>
                </motion.div>
            </div>

            {/* Corner Decorations */}
            <div className="fixed top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-neon-cyan/20 pointer-events-none" />
            <div className="fixed top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-neon-cyan/20 pointer-events-none" />
            <div className="fixed bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-neon-cyan/20 pointer-events-none" />
            <div className="fixed bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-neon-cyan/20 pointer-events-none" />

            {/* Custom Alert Dialogs */}
            <CustomAlertDialog
                isOpen={showResetConfirm}
                title="系统警告"
                message="您确定要重置所有游戏进度吗？此操作将清除所有解锁扇区、铭文、经验值以及本地存储的 AI 密钥配置。此操作不可撤销。"
                confirmText="确认重置"
                cancelText="取消"
                type="warning"
                onConfirm={handleResetConfirm}
                onCancel={() => setShowResetConfirm(false)}
            />
            
            <CustomAlertDialog
                isOpen={showResetSuccess}
                title="重置完成"
                message="系统已重置。所有进度和配置已清除。"
                confirmText="确认"
                cancelText="关闭"
                type="success"
                onConfirm={() => setShowResetSuccess(false)}
                onCancel={() => setShowResetSuccess(false)}
            />

            <CustomAlertDialog
                isOpen={!!providerToDelete}
                title="删除自定义服务商"
                message="确认删除该自定义服务商吗？删除后，该服务商下的所有模型配置也将失效。"
                confirmText="确认删除"
                cancelText="取消"
                type="warning"
                onConfirm={confirmDeleteProvider}
                onCancel={() => setProviderToDelete(null)}
            />

            <CustomAlertDialog
                isOpen={!!modelToDelete}
                title="删除自定义模型"
                message="确认删除该自定义模型吗？"
                confirmText="确认删除"
                cancelText="取消"
                type="warning"
                onConfirm={confirmDeleteModel}
                onCancel={() => setModelToDelete(null)}
            />
        </div>
    );
};
