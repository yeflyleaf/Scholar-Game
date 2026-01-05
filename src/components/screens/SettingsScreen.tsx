import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { useGameStore } from '../../stores/useGameStore';
import { isElectron } from '../../types/electron';

// Animated status indicator
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

// Section panel component
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
        {/* Header */}
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
    const { setScreen } = useGameStore();
    const {
        isConfigured,
        isLoading,
        error,
        setApiKey,
        checkStatus,
        generateChapter,
        clearError
    } = useGemini();

    const [apiKeyInput, setApiKeyInput] = useState('');
    const [textContent, setTextContent] = useState('');
    const [chapterTitle, setChapterTitle] = useState('');
    const [difficulty, setDifficulty] = useState(3);
    const [generationStatus, setGenerationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const isElectronEnv = isElectron();

    useEffect(() => {
        if (isElectronEnv) {
            checkStatus();
        }
    }, [isElectronEnv, checkStatus]);

    const handleSaveApiKey = async () => {
        if (apiKeyInput.trim()) {
            const success = await setApiKey(apiKeyInput.trim());
            if (success) {
                setApiKeyInput('');
            }
        }
    };

    const handleGenerateChapter = async () => {
        if (!textContent.trim() || !chapterTitle.trim()) return;
        setGenerationStatus('loading');
        clearError();
        try {
            const data = await generateChapter(chapterTitle, textContent, difficulty);
            if (data) {
                setGenerationStatus('success');
            } else {
                setGenerationStatus('error');
            }
        } catch {
            setGenerationStatus('error');
        }
    };

    return (
        <div className="w-full h-full bg-deep-space relative overflow-y-auto">
            {/* Background effects */}
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
                        <p className="text-sm font-mono text-gray-500 mt-1">SYSTEM CONFIGURATION // AKASHIC HUB</p>
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

                {/* Status overview */}
                <motion.div
                    className="fui-panel p-4 flex items-center justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-8">
                        <StatusIndicator isActive={isElectronEnv} label="Electron 环境" />
                        <StatusIndicator isActive={isConfigured} label="AI 核心连接" />
                    </div>
                    <span className="text-xs font-mono text-gray-500">
                        版本 1.0.0 // Scholar Protocol
                    </span>
                </motion.div>

                {/* API Key Section */}
                <SectionPanel
                    title="GEMINI 链接"
                    subtitle="NEURAL LINK CONFIGURATION"
                    icon={<span className="text-neon-cyan">◈</span>}
                >
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="password"
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                    placeholder="输入 Gemini API Key..."
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
                                className="hex-button px-6"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                                        连接中
                                    </span>
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
                            连接 Google Gemini AI 核心以启用知识生成功能。API Key 将安全存储于本地。
                        </p>
                    </div>
                </SectionPanel>

                {/* Generation Section */}
                <SectionPanel
                    title="数据合成"
                    subtitle="KNOWLEDGE SYNTHESIS ENGINE"
                    icon={<span className="text-holographic-gold">⬡</span>}
                >
                    <div className="space-y-6">
                        {/* Chapter Title */}
                        <div className="space-y-2">
                            <label className="block text-sm font-mono text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 bg-neon-cyan" />
                                章节标识
                            </label>
                            <input
                                type="text"
                                value={chapterTitle}
                                onChange={(e) => setChapterTitle(e.target.value)}
                                placeholder="例: 进程调度与死锁"
                                className="fui-input w-full"
                            />
                        </div>

                        {/* Difficulty */}
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

                        {/* Source Content */}
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
                                <span>支持任意文本格式</span>
                                <span>{textContent.length} 字符</span>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <motion.button
                            onClick={handleGenerateChapter}
                            disabled={generationStatus === 'loading' || !isConfigured || !textContent.trim() || !chapterTitle.trim()}
                            className={`hex-button w-full py-4 text-lg font-display relative overflow-hidden ${
                                !isConfigured ? 'opacity-50' : ''
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

                            {/* Animated background for loading */}
                            {generationStatus === 'loading' && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-cyan/30 to-neon-cyan/10"
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                />
                            )}
                        </motion.button>

                        {/* Status messages */}
                        <AnimatePresence mode="wait">
                            {generationStatus === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-stable/10 border border-stable/30 p-4 rounded flex items-center gap-3"
                                >
                                    <span className="text-stable text-2xl">✓</span>
                                    <div>
                                        <p className="text-stable font-display">合成完成</p>
                                        <p className="text-sm text-stable/70 font-mono">知识矩阵已准备注入战术数据库</p>
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
                                        <p className="text-sm text-glitch-red/70 font-mono">检查 AI 核心连接状态</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </SectionPanel>

                {/* Info section */}
                <motion.div
                    className="text-center py-8 space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="text-xs font-mono text-gray-500">
                        PROJECT SCHOLAR // THE STUDY ASCENSION
                    </p>
                    <p className="text-xs font-mono text-gray-600">
                        为世界上所有的不挂科而战
                    </p>
                </motion.div>
            </div>

            {/* Corner decorations */}
            <div className="fixed top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-neon-cyan/20 pointer-events-none" />
            <div className="fixed top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-neon-cyan/20 pointer-events-none" />
            <div className="fixed bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-neon-cyan/20 pointer-events-none" />
            <div className="fixed bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-neon-cyan/20 pointer-events-none" />
        </div>
    );
};
