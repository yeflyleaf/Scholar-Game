import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { useGameStore } from '../../stores/useGameStore';
import { isElectron } from '../../types/electron';

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
        <div className="w-full h-full bg-deep-space relative overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neon-cyan pb-4">
                    <h1 className="text-3xl font-mono text-neon-cyan glitch-text" data-text="系统配置">
                        系统配置
                    </h1>
                    <button onClick={() => setScreen('TITLE')} className="hex-button text-xs">
                        返回
                    </button>
                </div>

                {/* API Key Section */}
                <div className="fui-panel p-6">
                    <h2 className="text-xl font-mono text-white mb-4 flex items-center gap-2">
                        GEMINI 链接
                        {isConfigured && <span className="text-stable text-xs">[已连接]</span>}
                    </h2>
                    
                    <div className="flex gap-4">
                        <input 
                            type="password" 
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="输入 API KEY"
                            className="flex-1 bg-black/50 border border-gray-600 p-2 font-mono text-white focus:border-neon-cyan outline-none"
                        />
                        <button 
                            onClick={handleSaveApiKey}
                            disabled={isLoading}
                            className="hex-button"
                        >
                            {isLoading ? '连接中...' : '建立链接'}
                        </button>
                    </div>
                    {error && <p className="text-glitch-red mt-2 font-mono text-sm">{error}</p>}
                </div>

                {/* Generation Section */}
                <div className="fui-panel p-6">
                    <h2 className="text-xl font-mono text-white mb-4">数据合成</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">章节标题</label>
                            <input 
                                type="text"
                                value={chapterTitle}
                                onChange={(e) => setChapterTitle(e.target.value)}
                                className="w-full bg-black/50 border border-gray-600 p-2 font-mono text-white focus:border-neon-cyan outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">难度等级</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(lvl => (
                                    <button 
                                        key={lvl}
                                        onClick={() => setDifficulty(lvl)}
                                        className={`px-4 py-2 border ${difficulty === lvl ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan' : 'border-gray-600 text-gray-500'}`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">源数据</label>
                            <textarea 
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                rows={6}
                                className="w-full bg-black/50 border border-gray-600 p-2 font-mono text-white focus:border-neon-cyan outline-none"
                                placeholder="在此粘贴知识库内容..."
                            />
                        </div>

                        <button 
                            onClick={handleGenerateChapter}
                            disabled={generationStatus === 'loading' || !isConfigured}
                            className="hex-button w-full"
                        >
                            {generationStatus === 'loading' ? '合成中...' : '启动合成'}
                        </button>

                        <AnimatePresence>
                            {generationStatus === 'success' && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-stable/10 border border-stable p-4 text-stable font-mono text-center"
                                >
                                    合成完成。数据准备注入。
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
