import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';

// Quantum vortex animation component
const QuantumVortex: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            {/* Multiple rotating rings */}
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
            
            {/* Central glow */}
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

// Floating data fragments
const DataFragment: React.FC<{ delay: number }> = ({ delay }) => {
    const chars = '01アイウエオカキクケコ';
    const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
    
    return (
        <motion.div
            className="absolute text-neon-cyan/30 font-mono text-xs"
            style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
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
                repeatDelay: Math.random() * 5,
            }}
        >
            {randomChar()}{randomChar()}{randomChar()}
        </motion.div>
    );
};

// Rarity color mapping
const rarityConfig: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    SSR: { bg: 'from-yellow-500/20 to-orange-500/20', border: 'border-holographic-gold', text: 'text-holographic-gold', glow: 'rgba(255, 215, 0, 0.5)' },
    SR: { bg: 'from-purple-500/20 to-pink-500/20', border: 'border-plasma-purple', text: 'text-plasma-purple', glow: 'rgba(153, 69, 255, 0.5)' },
    R: { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-neon-cyan', text: 'text-neon-cyan', glow: 'rgba(0, 243, 255, 0.5)' },
    N: { bg: 'from-gray-500/20 to-gray-600/20', border: 'border-gray-500', text: 'text-gray-400', glow: 'rgba(100, 100, 100, 0.5)' },
};

export const MindHack: React.FC = () => {
    const { setScreen, performMindHack } = useGameStore();
    const [result, setResult] = useState<any>(null);
    const [isHacking, setIsHacking] = useState(false);
    const [phase, setPhase] = useState<'idle' | 'hacking' | 'reveal'>('idle');

    const handleHack = async () => {
        setIsHacking(true);
        setPhase('hacking');
        
        // Simulated hacking delay for dramatic effect
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
        <div className="w-full h-full flex flex-col items-center justify-center bg-deep-space relative overflow-hidden">
            {/* Background effects */}
            <div className="hex-grid-bg opacity-50" />
            <div className="data-stream opacity-40" />
            <div className="scan-line opacity-30" />

            {/* Floating data fragments */}
            {[...Array(15)].map((_, i) => (
                <DataFragment key={i} delay={i * 0.5} />
            ))}

            {/* Quantum vortex */}
            <QuantumVortex isActive={isHacking || phase === 'reveal'} />

            {/* Title */}
            <motion.div
                className="absolute top-10 left-0 right-0 text-center z-20"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-5xl font-display font-bold text-neon-cyan glitch-text mb-2" data-text="思维骇入">
                    思维骇入
                </h1>
                <p className="text-sm font-mono text-gray-500 tracking-widest">MIND HACK // QUANTUM RETRIEVAL SYSTEM</p>
            </motion.div>

            {/* Main content */}
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
                            {/* Hack button */}
                            <motion.button
                                onClick={handleHack}
                                className="relative w-72 h-72 rounded-full flex items-center justify-center group"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* Outer ring */}
                                <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/30" />
                                
                                {/* Spinning dashed ring */}
                                <motion.div
                                    className="absolute inset-2 rounded-full border border-dashed border-neon-cyan/50"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                />
                                
                                {/* Inner glow circle */}
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
                                
                                {/* Hexagon icon */}
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
                                
                                {/* Text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-display text-neon-cyan group-hover:text-white transition-colors mt-24">
                                        启动骇入
                                    </span>
                                    <span className="text-xs font-mono text-gray-500 mt-2">
                                        INITIATE HACK
                                    </span>
                                </div>
                            </motion.button>

                            <p className="text-sm font-mono text-gray-500 mt-8 text-center max-w-md">
                                连接量子之海，打捞前文明的残响...<br/>
                                <span className="text-neon-cyan/50">警告：每次骇入将消耗 100 能量单位</span>
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
                            {/* Processing animation */}
                            <div className="processing-ring" />
                            
                            <motion.p
                                className="text-xl font-mono text-neon-cyan mt-8"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                正在穿透量子屏障...
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
                            {/* Shine effect */}
                            <motion.div
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                                }}
                                initial={{ x: '-100%' }}
                                animate={{ x: '200%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />

                            {/* Hexagon icon */}
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

                            {/* Rarity badge */}
                            <motion.div
                                className={`px-4 py-1 ${config.bg} ${config.border} border-2 rounded-full font-display font-bold text-sm ${config.text}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                            >
                                {result.rarity}
                            </motion.div>

                            {/* Item name */}
                            <motion.h2
                                className={`text-3xl font-display font-bold ${config.text} text-center glitch-text`}
                                data-text={result.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                {result.name}
                            </motion.h2>

                            {/* Description */}
                            <motion.p
                                className="text-center text-gray-300 font-mono text-sm leading-relaxed max-w-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                "{result.description}"
                            </motion.p>

                            {/* Confirm button */}
                            <motion.button
                                onClick={handleConfirm}
                                className="hex-button mt-4 px-8 py-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                确认接收
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Back button */}
                <motion.button
                    onClick={() => setScreen('GRAND_UNIFICATION_SIM')}
                    className="hex-button z-10 mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    返回星图
                </motion.button>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-6 left-6 w-20 h-20 border-t-2 border-l-2 border-neon-cyan/30" />
            <div className="absolute top-6 right-6 w-20 h-20 border-t-2 border-r-2 border-neon-cyan/30" />
            <div className="absolute bottom-6 left-6 w-20 h-20 border-b-2 border-l-2 border-neon-cyan/30" />
            <div className="absolute bottom-6 right-6 w-20 h-20 border-b-2 border-r-2 border-neon-cyan/30" />
        </div>
    );
};
