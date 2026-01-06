// 页面：系统配置 (SettingsScreen) - 设置 API Key 和生成题目
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { useGameStore } from '../../stores/useGameStore';
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
        {/* 头部 */}
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

export const SettingsScreen: React.FC = () => {
    const { setScreen, settings, updateSettings, resetProgress, distributeAIQuestionsToSectors, applyAITheme, currentTheme, updateSectorBriefing, updateSectorMetadata } = useGameStore();
    const {
        isConfigured,
        isLoading,
        error,
        model,
        setApiKey,
        setModel,
        checkStatus,
        generateQuestions,
        generateTheme,
        generateAllMissionBriefings,
        clearError
    } = useGemini();

    const [apiKeyInput, setApiKeyInput] = useState('');
    const [modelInput, setModelInput] = useState(model || '');
    const [prevModel, setPrevModel] = useState(model);
    const [modelSaveStatus, setModelSaveStatus] = useState<'idle' | 'success'>('idle');
    const [textContent, setTextContent] = useState('');
    const [chapterTitle, setChapterTitle] = useState('');
    const [difficulty, setDifficulty] = useState(3);
    const [generationStatus, setGenerationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [generatedQuestionCount, setGeneratedQuestionCount] = useState(0);

    const isElectronEnv = isElectron();

    useEffect(() => {
        if (isElectronEnv) {
            checkStatus();
        }
    }, [isElectronEnv, checkStatus]);

    // 全屏切换副作用
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

    const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

    if (model !== prevModel) {
        setPrevModel(model);
        setModelInput(model);
    }

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
        if (modelInput.trim()) {
            const success = await setModel(modelInput.trim());
            if (success) {
                setModelSaveStatus('success');
                setTimeout(() => setModelSaveStatus('idle'), 3000);
            }
        }
    };

    // 统一生成：同时生成题目和主题
    const handleGenerate = async () => {
        if (!textContent.trim() || !chapterTitle.trim()) return;
        setGenerationStatus('loading');
        setGeneratedQuestionCount(0);
        clearError();
        
        try {
            let questionsSuccess = false;
            
            // 1. 生成60道题目并分配到6个关卡
            const questions = await generateQuestions(textContent, {
                count: 60,
                difficulty: difficulty as 1 | 2 | 3 | 4 | 5 | 'mixed'
            });
            
            if (questions && questions.length > 0) {
                distributeAIQuestionsToSectors(questions, chapterTitle);
                setGeneratedQuestionCount(questions.length);
                questionsSuccess = true;
            }
            
            // 2. 生成游戏主题（不影响主页面标题）
            const theme = await generateTheme(chapterTitle, textContent);
            
            if (theme) {
                // 应用主题（UI标签等）
                applyAITheme(theme);
                
                // 2.5 更新扇区名称和描述（如果主题包含sectors数据）
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const themeWithSectors = theme as any;
                if (themeWithSectors.sectors && Array.isArray(themeWithSectors.sectors)) {
                    updateSectorMetadata(themeWithSectors.sectors);
                }
                
                // 3. 为所有扇区生成任务简报（使用更新后的扇区数据）
                // 需要重新获取扇区，因为名称可能已更新
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
            
            // 只要题目生成成功就算成功
            if (questionsSuccess) {
                setGenerationStatus('success');
                // 清空输入
                setTextContent('');
                setChapterTitle('');
            } else {
                setGenerationStatus('error');
            }
        } catch {
            setGenerationStatus('error');
        }
    };

    // 跳转到关卡选择页面
    const handleGoToLevelSelect = () => {
        setScreen('GRAND_UNIFICATION_SIM');
    };

    return (
        <div className="w-full h-screen bg-deep-space relative overflow-y-auto">
            {/* 背景特效 */}
            <div className="hex-grid-bg opacity-20" />
            <div className="data-stream opacity-10" />

            <div className="max-w-5xl mx-auto p-8 space-y-8 relative z-10">
                {/* 头部 */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-4xl font-display font-bold text-neon-cyan glitch-text" data-text="系统配置">
                            系统配置
                        </h1>
                        <p className="text-sm font-mono text-gray-500 mt-1">系统配置 | 灵感中枢</p>
                    </div>
                    <motion.button
                        onClick={() => setScreen('TITLE')}
                        className="hex-button text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        返回枢纽
                    </motion.button>
                </motion.div>

                {/* 状态概览 */}
                <motion.div
                    className="fui-panel p-4 flex items-center justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-8">
                        <StatusIndicator isActive={isElectronEnv} label="桌面应用环境" />
                        <StatusIndicator isActive={isConfigured} label="AI 核心连接" />
                    </div>
                    <span className="text-xs font-mono text-gray-500">
                        智者协议
                    </span>
                </motion.div>

                {/* 基础设置区域 */}
                <SectionPanel
                    title="基础设置"
                    subtitle="系统参数调整"
                    icon={<span className="text-neon-cyan">⚙</span>}
                >
                    <div className="space-y-6">
                        {/* 显示设置 */}
                        <div className="space-y-4">
                             <h3 className="text-sm font-mono text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 bg-holographic-gold" />
                                显示设置
                            </h3>
                            
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
                    </div>
                </SectionPanel>

                {/* API Key 区域 */}
                <SectionPanel
                    title="AI 核心链接"
                    subtitle="神经链接配置"
                    icon={<span className="text-neon-cyan">◈</span>}
                >
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="password"
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                    placeholder="输入 Gemini 密钥..."
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
                                    <span className="text-stable">✓ 已更新</span>
                                ) : (
                                    '建立链接'
                                )}
                            </motion.button>
                        </div>

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
                            连接 Google Gemini AI 核心以启用知识生成功能。密钥将安全存储于本地。
                        </p>
                    </div>
                </SectionPanel>

                {/* 模型配置区域 */}
                <SectionPanel
                    title="模型配置"
                    subtitle="选择 AI 核心模型"
                    icon={<span className="text-neon-cyan">🧠</span>}
                >
                    <div className="space-y-4">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="block text-sm font-mono text-gray-400">
                                    模型标识
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={modelInput}
                                        onChange={(e) => setModelInput(e.target.value)}
                                        placeholder="例如: gemini-2.0-flash"
                                        className="fui-input w-full"
                                        list="model-suggestions"
                                    />
                                    <datalist id="model-suggestions">
                                        <option value="gemini-2.0-flash" />
                                        <option value="gemini-1.5-flash" />
                                        <option value="gemini-1.5-pro" />
                                        <option value="gemini-pro" />
                                    </datalist>
                                </div>
                            </div>
                            <motion.button
                                onClick={handleSaveModel}
                                disabled={modelInput === model}
                                className="hex-button px-6 h-[46px] disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {modelSaveStatus === 'success' ? (
                                    <span className="text-stable">✓ 已保存</span>
                                ) : (
                                    '应用模型'
                                )}
                            </motion.button>
                        </div>
                        <p className="text-xs font-mono text-gray-500 leading-relaxed">
                            当前使用模型: <span className="text-neon-cyan">{model}</span>。
                            推荐使用 <span className="text-white">gemini-2.0-flash</span> 以获得最佳速度和效果。
                        </p>
                    </div>
                </SectionPanel>
                <SectionPanel
                    title="数据合成"
                    subtitle="知识合成引擎"
                    icon={<span className="text-holographic-gold">⬡</span>}
                >
                    <div className="space-y-6">
                        {/* 章节标题 */}
                        <div className="space-y-2">
                            <label className="block text-sm font-mono text-gray-400 flex items-center gap-2">
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

                        {/* 难度 */}
                        <div className="space-y-2">
                            <label className="block text-sm font-mono text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 bg-holographic-gold" />
                                挑战等级
                            </label>
                            <div className="flex gap-3">
                                {[1, 2, 3, 4, 5].map((lvl) => (
                                    <motion.button
                                        key={lvl}
                                        onClick={() => setDifficulty(lvl)}
                                        className={`
                                            w-14 h-14 font-display font-bold text-xl
                                            border-2 transition-all duration-300
                                            ${difficulty === lvl
                                                ? 'border-holographic-gold bg-holographic-gold/20 text-holographic-gold'
                                                : 'border-gray-600 text-gray-500 hover:border-gray-500'
                                            }
                                        `}
                                        style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {lvl}
                                    </motion.button>
                                ))}
                            </div>
                            <p className="text-xs font-mono text-gray-500">
                                等级 {difficulty}：
                                {difficulty === 1 && '入门级知识点'}
                                {difficulty === 2 && '基础概念理解'}
                                {difficulty === 3 && '标准考试难度'}
                                {difficulty === 4 && '进阶综合题目'}
                                {difficulty === 5 && '顶级挑战难度'}
                            </p>
                        </div>

                        {/* 源内容 */}
                        <div className="space-y-2">
                            <label className="block text-sm font-mono text-gray-400 flex items-center gap-2">
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
                                <span className="text-sm">仅支持.txt和.md文本格式</span>
                                <span>{textContent.length} 字符</span>
                            </div>
                        </div>

                        {/* 当前主题显示 */}
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-holographic-gold/5 border border-holographic-gold/20 p-3 rounded"
                        >
                            <p className="text-xs font-mono text-holographic-gold">
                                📍 当前主题: {currentTheme.name}
                            </p>
                            <p className="text-xs font-mono text-gray-500 mt-1">
                                一键生成：题目(60道) + 主题 + 任务简报
                            </p>
                        </motion.div>

                        {/* 生成按钮 */}
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
                                    <span>正在合成知识矩阵...</span>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <span>启动合成</span>
                                    <span className="text-holographic-gold">⬡</span>
                                </span>
                            )}

                            {/* 加载时的动画背景 */}
                            {generationStatus === 'loading' && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-cyan/30 to-neon-cyan/10"
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                />
                            )}
                        </motion.button>

                        {/* 状态消息 */}
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
                                    <p className="text-xs text-gray-500 font-mono mt-2">
                                        💡 题目已分配到6个关卡：第1关10道、第2关20道、依此类推
                                    </p>
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

                {/* 危险区域 */}
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
                            onClick={() => {
                                if (confirm('确定要重置所有进度吗？此操作无法撤销。')) {
                                    resetProgress();
                                    alert('进度已重置。');
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

                {/* 信息区域 */}
                <motion.div
                    className="text-center py-8 space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="text-xs font-mono text-gray-500">
                        智者计划 | 学习飞升
                    </p>
                    <p className="text-xs font-mono text-gray-600">
                        为世界上所有的不挂科而战！
                    </p>
                    <p className="text-xs font-mono text-gray-600">
                        把这些不完美的成绩，变成我们所期待的样子！
                    </p>
                </motion.div>
            </div>

            {/* 角落装饰 */}
            <div className="fixed top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-neon-cyan/20 pointer-events-none" />
            <div className="fixed top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-neon-cyan/20 pointer-events-none" />
            <div className="fixed bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-neon-cyan/20 pointer-events-none" />
            <div className="fixed bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-neon-cyan/20 pointer-events-none" />
        </div>
    );
};
