// 页面：系统配置 (SettingsScreen) - 多 AI 提供商支持
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { useGameStore } from '../../stores/useGameStore';
import type { AIProvider } from '../../types/electron';
import { isElectron } from '../../types/electron';

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

    const isElectronEnv = isElectron();

    // Get current provider info
    const currentProvider = providers.find(p => p.id === providerId);
    const availableModels = currentProvider?.models || [];

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

    const handleSaveModel = async () => {
        if (modelInput.trim() && modelInput !== model) {
            await setModel(modelInput.trim());
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
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
                difficulty: settings.gameDifficulty as 1 | 2 | 3 | 4 | 5 | 'mixed'
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
                                        onClick={() => updateSettings({ gameDifficulty: lvl })}
                                        className={`
                                            w-12 h-12 font-display font-bold text-lg
                                            border-2 transition-all duration-300
                                            ${settings.gameDifficulty === lvl
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
                                {settings.gameDifficulty === 1 && (
                                    <p>✨ <span className="text-stable">新手模式</span> - 我方攻击力: <span className="text-neon-cyan">25</span> | 敌方攻击力: <span className="text-stable">-5</span> | 敌方生命: <span className="text-glitch-red">+100</span></p>
                                )}
                                {settings.gameDifficulty === 2 && (
                                    <p>🌟 <span className="text-neon-cyan">简单模式</span> - 我方攻击力: <span className="text-neon-cyan">20</span> | 敌方攻击力: <span className="text-gray-400">不变</span> | 敌方生命: <span className="text-glitch-red">+200</span></p>
                                )}
                                {settings.gameDifficulty === 3 && (
                                    <p>⚔️ <span className="text-holographic-gold">标准模式</span> - 我方攻击力: <span className="text-neon-cyan">15</span> | 敌方攻击力: <span className="text-glitch-red">+5</span> | 敌方生命: <span className="text-glitch-red">+300</span></p>
                                )}
                                {settings.gameDifficulty === 4 && (
                                    <p>🔥 <span className="text-orange-400">困难模式</span> - 我方攻击力: <span className="text-neon-cyan">10</span> | 敌方攻击力: <span className="text-glitch-red">+10</span> | 敌方生命: <span className="text-glitch-red">+500</span></p>
                                )}
                                {settings.gameDifficulty === 5 && (
                                    <p>💀 <span className="text-glitch-red">地狱模式</span> - 我方攻击力: <span className="text-neon-cyan">5</span> | 敌方攻击力: <span className="text-glitch-red">+20</span> | 敌方生命: <span className="text-glitch-red">+1000</span></p>
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
                                    onChange={(e) => setModelInput(e.target.value)}
                                    className="fui-input w-full bg-gray-800"
                                >
                                    {availableModels.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} {m.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <motion.button
                                onClick={handleSaveModel}
                                disabled={modelInput === model}
                                className="hex-button px-6 h-[46px] disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                应用模型
                            </motion.button>
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
                            onClick={async () => {
                                if (confirm('确定要重置所有进度吗？此操作无法撤销。')) {
                                    resetProgress();
                                    if (isElectronEnv) {
                                        await resetConfig();
                                    }
                                    alert('进度已重置，AI 配置已清除。');
                                }
                            }}
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
        </div>
    );
};
