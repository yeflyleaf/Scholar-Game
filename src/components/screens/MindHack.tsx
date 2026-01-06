// 页面：思维骇入 (MindHack) - 抽卡/获取物品界面
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import type { Inscription } from '../../types/game';

// 量子漩涡动画组件
const QuantumVortex: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            {/* 多重旋转环 */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full border border-neon-cyan/30"
                    style={{
                        width: 200 + i * 80,
                        height: 200 + i * 80,
                    }}
                    animate={{
                        rotate: isActive ? 360 * (i % 2 === 0 ? 1 : -1) : 0,
                        scale: isActive ? [1, 1.1, 1] : 1,
                        opacity: isActive ? [0.3, 0.6, 0.3] : 0.1,
                    }}
                    transition={{
                        rotate: { duration: 10 + i * 3, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                        opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 },
                    }}
                />
            ))}
            
            {/* 中心光晕 */}
            <motion.div
                className="absolute w-64 h-64 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 243, 255, 0.3) 0%, transparent 70%)',
                }}
                animate={{
                    scale: isActive ? [1, 1.5, 1] : [1, 1.1, 1],
                    opacity: isActive ? [0.3, 0.6, 0.3] : [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
        </div>
    );
};

// 预生成数据碎片数据 - 在模块加载时计算，避免渲染时调用不纯函数
const CHARS = '01中文符号数据流量';
const PRECOMPUTED_FRAGMENTS = [...Array(20)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    repeatDelay: Math.random() * 5,
    text: Array(3).fill(0).map(() => CHARS[Math.floor(Math.random() * CHARS.length)]).join(''),
}));

// 漂浮数据碎片
const DataFragment: React.FC<{ delay: number; fragmentIndex: number }> = ({ delay, fragmentIndex }) => {
    // 使用预计算的碎片数据
    const fragment = PRECOMPUTED_FRAGMENTS[fragmentIndex % PRECOMPUTED_FRAGMENTS.length];
    
    return (
        <motion.div
            className="absolute text-neon-cyan/30 font-mono text-xs"
            style={{
                left: fragment.left,
                top: fragment.top,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: [0, 0.5, 0],
                scale: [0, 1, 0],
                y: [-20, 20],
            }}
            transition={{
                duration: 3,
                delay,
                repeat: Infinity,
                repeatDelay: fragment.repeatDelay,
            }}
        >
            {fragment.text}
        </motion.div>
    );
};

// 稀有度颜色映射
const rarityConfig: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    SSR: { bg: 'from-yellow-500/20 to-orange-500/20', border: 'border-holographic-gold', text: 'text-holographic-gold', glow: 'rgba(255, 215, 0, 0.5)' },
    SR: { bg: 'from-purple-500/20 to-pink-500/20', border: 'border-plasma-purple', text: 'text-plasma-purple', glow: 'rgba(153, 69, 255, 0.5)' },
    R: { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-neon-cyan', text: 'text-neon-cyan', glow: 'rgba(0, 243, 255, 0.5)' },
    N: { bg: 'from-gray-500/20 to-gray-600/20', border: 'border-gray-500', text: 'text-gray-400', glow: 'rgba(100, 100, 100, 0.5)' },
};

export const MindHack: React.FC = () => {
    const { setScreen, performMindHack, currentTheme } = useGameStore();
    const labels = currentTheme.pageLabels.mindHack;
    const [result, setResult] = useState<Inscription | null>(null);
    const [isHacking, setIsHacking] = useState(false);
    const [phase, setPhase] = useState<'idle' | 'hacking' | 'reveal'>('idle');

    const handleHack = async () => {
        setIsHacking(true);
        setPhase('hacking');
        
        // 模拟骇入延迟以增强戏剧效果
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        const item = performMindHack();
        setResult(item);
        setPhase('reveal');
        setIsHacking(false);
    };

    const handleConfirm = () => {
        setResult(null);
        setPhase('idle');
    };

    const config = result ? (rarityConfig[result.rarity] || rarityConfig.N) : rarityConfig.N;

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-deep-space relative overflow-hidden">
            {/* 背景特效 */}
            <div className="hex-grid-bg opacity-50" />
            <div className="data-stream opacity-40" />
            <div className="scan-line opacity-30" />

            {/* 漂浮数据碎片 */}
            {[...Array(15)].map((_, i) => (
                <DataFragment key={i} delay={i * 0.5} fragmentIndex={i} />
            ))}

            {/* 量子漩涡 */}
            <QuantumVortex isActive={isHacking || phase === 'reveal'} />

            {/* 标题 */}
            <motion.div
                className="absolute top-10 left-0 right-0 text-center z-20"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-5xl font-display font-bold text-neon-cyan glitch-text mb-2" data-text={labels.title}>
                    {labels.title}
                </h1>
                <p className="text-sm font-mono text-gray-500 tracking-widest">{labels.subtitle}</p>
            </motion.div>

            {/* 主内容 */}
            <div className="z-10 flex flex-col items-center gap-8">
                <AnimatePresence mode="wait">
                    {phase === 'idle' && (
                        <motion.div
                            key="idle"
                            className="flex flex-col items-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            {/* 骇入按钮 */}
                            <motion.button
                                onClick={handleHack}
                                className="relative w-72 h-72 rounded-full flex items-center justify-center group"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* 外环 */}
                                <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/30" />
                                
                                {/* 旋转虚线环 */}
                                <motion.div
                                    className="absolute inset-2 rounded-full border border-dashed border-neon-cyan/50"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                />
                                
                                {/* 内部光晕圆 */}
                                <motion.div
                                    className="absolute inset-8 rounded-full bg-gradient-to-br from-neon-cyan/10 to-transparent"
                                    animate={{
                                        boxShadow: [
                                            '0 0 30px rgba(0, 243, 255, 0.2)',
                                            '0 0 60px rgba(0, 243, 255, 0.4)',
                                            '0 0 30px rgba(0, 243, 255, 0.2)',
                                        ],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                
                                {/* 六边形图标 */}
                                <motion.div
                                    className="relative z-10"
                                    animate={{
                                        rotateY: [0, 180, 360],
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <span className="text-6xl text-neon-cyan group-hover:text-white transition-colors">
                                        ⬡
                                    </span>
                                </motion.div>
                                
                                {/* 文本 */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-display text-neon-cyan group-hover:text-white transition-colors mt-24">
                                        {labels.hackButton}
                                    </span>
                                    <span className="text-xs font-mono text-gray-500 mt-2">
                                        INITIATE HACK
                                    </span>
                                </div>
                            </motion.button>

                            <p className="text-sm font-mono text-gray-500 mt-8 text-center max-w-md">
                                连接量子之海，打捞前文明的残响...<br/>
                                <span className="text-neon-cyan/50">{labels.warningText}</span>
                            </p>
                        </motion.div>
                    )}

                    {phase === 'hacking' && (
                        <motion.div
                            key="hacking"
                            className="flex flex-col items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* 处理中动画 */}
                            <div className="processing-ring" />
                            
                            <motion.p
                                className="text-xl font-mono text-neon-cyan mt-8"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                {labels.hackingText}
                            </motion.p>
                            
                            <motion.div
                                className="flex gap-1 mt-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 h-2 bg-neon-cyan rounded-full"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.3, 1, 0.3],
                                        }}
                                        transition={{
                                            duration: 0.6,
                                            repeat: Infinity,
                                            delay: i * 0.1,
                                        }}
                                    />
                                ))}
                            </motion.div>
                        </motion.div>
                    )}

                    {phase === 'reveal' && result && (
                        <motion.div
                            key="reveal"
                            className={`fui-panel p-8 flex flex-col items-center gap-6 max-w-lg relative overflow-hidden bg-gradient-to-br ${config.bg}`}
                            initial={{ scale: 0, opacity: 0, rotateY: 180 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            transition={{ duration: 0.8, type: 'spring' }}
                            style={{
                                boxShadow: `0 0 60px ${config.glow}`,
                            }}
                        >
                            {/* 闪光特效 */}
                            <motion.div
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                                }}
                                initial={{ x: '-100%' }}
                                animate={{ x: '200%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />

                            {/* 六边形图标 */}
                            <motion.div
                                className={`text-8xl ${config.text}`}
                                animate={{
                                    rotateY: [0, 360],
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    rotateY: { duration: 2, delay: 0.5 },
                                    scale: { duration: 1.5, repeat: Infinity },
                                }}
                                style={{
                                    textShadow: `0 0 30px ${config.glow}`,
                                }}
                            >
                                ⬡
                            </motion.div>

                            {/* 稀有度徽章 */}
                            <motion.div
                                className={`px-4 py-1 ${config.bg} ${config.border} border-2 rounded-full font-display font-bold text-sm ${config.text}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                            >
                                {result.rarity}
                            </motion.div>

                            {/* 物品名称 */}
                            <motion.h2
                                className={`text-3xl font-display font-bold ${config.text} text-center glitch-text`}
                                data-text={result.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                {result.name}
                            </motion.h2>

                            {/* 描述 */}
                            <motion.p
                                className="text-center text-gray-300 font-mono text-sm leading-relaxed max-w-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                "{result.description}"
                            </motion.p>

                            {/* 确认按钮 */}
                            <motion.button
                                onClick={handleConfirm}
                                className="hex-button mt-4 px-8 py-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {labels.confirmButton}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 返回按钮 */}
                <motion.button
                    onClick={() => setScreen('GRAND_UNIFICATION_SIM')}
                    className="hex-button z-10 mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {labels.backButton}
                </motion.button>
            </div>

            {/* 角落装饰 */}
            <div className="absolute top-6 left-6 w-20 h-20 border-t-2 border-l-2 border-neon-cyan/30" />
            <div className="absolute top-6 right-6 w-20 h-20 border-t-2 border-r-2 border-neon-cyan/30" />
            <div className="absolute bottom-6 left-6 w-20 h-20 border-b-2 border-l-2 border-neon-cyan/30" />
            <div className="absolute bottom-6 right-6 w-20 h-20 border-b-2 border-r-2 border-neon-cyan/30" />
        </div>
    );
};
