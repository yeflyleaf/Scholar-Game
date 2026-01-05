// 页面：因果录入 (CausalityRecord) - 战斗结算界面，显示胜利或失败结果
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';

// 胜利时的粒子爆炸特效
const VictoryParticles: React.FC = () => {
    const particles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.cos((i / 30) * Math.PI * 2) * 200,
        y: Math.sin((i / 30) * Math.PI * 2) * 200,
        delay: i * 0.02,
        color: i % 3 === 0 ? '#00f3ff' : i % 3 === 1 ? '#ffd700' : '#39ff14',
    }));

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ backgroundColor: p.color }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                        x: p.x,
                        y: p.y,
                        scale: [0, 1.5, 0],
                        opacity: [1, 1, 0],
                    }}
                    transition={{
                        duration: 2,
                        delay: p.delay,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    );
};

// 失败时的故障扭曲线条特效
const DefeatGlitchLines: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-full h-1 bg-glitch-red"
                    style={{ top: `${10 + i * 12}%` }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{
                        scaleX: [0, 1, 0.5, 0],
                        opacity: [0, 0.8, 0.4, 0],
                        x: ['-100%', '0%', '50%', '100%'],
                    }}
                    transition={{
                        duration: 0.5,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 2,
                    }}
                />
            ))}
        </div>
    );
};

// 数字化重构特效
const ReconstructionEffect: React.FC = () => {
    const [blocks] = useState(() => Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 4 + Math.random() * 8,
        delay: i * 0.15,
    })));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {blocks.map((b) => (
                <motion.div
                    key={b.id}
                    className="absolute bg-neon-cyan"
                    style={{
                        left: b.left,
                        top: b.top,
                        width: b.size,
                        height: b.size,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1, 1, 2],
                    }}
                    transition={{
                        duration: 2,
                        delay: b.delay,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    );
};

export const CausalityRecord: React.FC = () => {
    const { setScreen, battleState, currentSector, resetBattle } = useGameStore();
    // 使用本地状态锁定结果，防止在点击继续（重置战斗状态）时闪烁错误页面
    const [isVictory] = useState(battleState === 'VICTORY');

    const handleContinue = () => {
        resetBattle();
        setScreen('GRAND_UNIFICATION_SIM');
    };

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-deep-space relative overflow-hidden">
            {/* 背景暗化遮罩 */}
            <motion.div
                className="absolute inset-0 bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                transition={{ duration: 1 }}
            />

            {/* 基于结果的背景特效 */}
            {isVictory ? (
                <>
                    <VictoryParticles />
                    <ReconstructionEffect />
                    {/* 胜利光晕 */}
                    <motion.div
                        className="absolute w-[600px] h-[600px] rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(0, 243, 255, 0.2) 0%, transparent 70%)',
                        }}
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </>
            ) : (
                <>
                    <DefeatGlitchLines />
                    {/* 错误遮罩 */}
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            background: 'repeating-linear-gradient(0deg, transparent 0%, rgba(255, 0, 60, 0.03) 2%, transparent 4%)',
                        }}
                        animate={{
                            backgroundPosition: ['0 0', '0 100%'],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                </>
            )}

            {/* 主内容面板 */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className={`z-10 fui-panel p-12 max-w-3xl w-full flex flex-col items-center gap-8 relative overflow-hidden ${
                    isVictory ? 'border-neon-cyan/30' : 'border-glitch-red/30'
                }`}
                style={{
                    boxShadow: isVictory
                        ? '0 0 60px rgba(0, 243, 255, 0.3), inset 0 0 30px rgba(0, 243, 255, 0.1)'
                        : '0 0 60px rgba(255, 0, 60, 0.3), inset 0 0 30px rgba(255, 0, 60, 0.1)',
                }}
            >
                {/* 顶部装饰线 */}
                <motion.div
                    className={`absolute top-0 left-0 right-0 h-1 ${isVictory ? 'bg-neon-cyan' : 'bg-glitch-red'}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                />

                {/* 状态图标 */}
                <motion.div
                    className={`text-8xl ${isVictory ? 'text-neon-cyan' : 'text-glitch-red'}`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, type: 'spring' }}
                    style={{
                        textShadow: isVictory
                            ? '0 0 40px rgba(0, 243, 255, 0.8)'
                            : '0 0 40px rgba(255, 0, 60, 0.8)',
                    }}
                >
                    {isVictory ? '◆' : '✕'}
                </motion.div>

                {/* 主标题 */}
                <motion.h1
                    className={`text-5xl md:text-6xl font-display font-bold ${
                        isVictory ? 'text-neon-cyan victory-glow' : 'text-glitch-red defeat-glow glitch-text-heavy'
                    }`}
                    data-text={isVictory ? '逻辑重构完成' : '致命错误'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    {isVictory ? '逻辑重构完成' : '致命错误'}
                </motion.h1>

                {/* 英文副标题 */}
                <motion.p
                    className={`text-sm font-mono tracking-widest ${isVictory ? 'text-neon-cyan/70' : 'text-glitch-red/70'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    {isVictory ? 'LOGIC RECONSTRUCTED' : 'FATAL ERROR'}
                </motion.p>

                {/* 分隔线 */}
                <motion.div
                    className={`w-48 h-px ${isVictory ? 'bg-neon-cyan/50' : 'bg-glitch-red/50'}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8 }}
                />

                {/* 详情 */}
                <motion.div
                    className="text-center space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                >
                    <p className="text-2xl text-white font-display">
                        {isVictory
                            ? `扇区「${currentSector?.name}」已恢复稳定。`
                            : '连接丢失。智者，世界已回归虚无。'}
                    </p>

                    {isVictory && (
                        <motion.div
                            className="flex items-center justify-center gap-6 mt-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.1 }}
                        >
                            <div className="text-center">
                                <p className="text-sm text-gray-500 font-mono">熵值降低</p>
                                <p className="text-3xl font-display text-stable text-glow-cyan">-15%</p>
                            </div>
                            <div className="w-px h-12 bg-gray-700" />
                            <div className="text-center">
                                <p className="text-sm text-gray-500 font-mono">逻辑完整性</p>
                                <p className="text-3xl font-display text-holographic-gold text-glow-gold">+100</p>
                            </div>
                        </motion.div>
                    )}

                    {!isVictory && (
                        <motion.p
                            className="text-glitch-red/60 font-mono text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.1 }}
                        >
                            ERROR CODE: 0xDEAD_LOGIC | 逻辑单元全损
                        </motion.p>
                    )}
                </motion.div>

                {/* 操作按钮 */}
                <motion.button
                    onClick={handleContinue}
                    className={`hex-button text-lg px-12 py-4 mt-4 ${
                        isVictory ? '' : 'hex-button-red'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isVictory ? '继续探索' : '重启系统'}
                </motion.button>
            </motion.div>

            {/* 底部状态栏 */}
            <motion.div
                className="absolute bottom-6 left-0 right-0 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1.5 }}
            >
                <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                    <span>因果录入 // CAUSALITY RECORD</span>
                    <div className={`w-2 h-2 rounded-full ${isVictory ? 'bg-neon-cyan' : 'bg-glitch-red'} animate-pulse`} />
                    <span>{new Date().toLocaleTimeString()}</span>
                </div>
            </motion.div>

            {/* 角落装饰 */}
            <div className={`absolute top-6 left-6 w-20 h-20 border-t-2 border-l-2 ${isVictory ? 'border-neon-cyan/30' : 'border-glitch-red/30'}`} />
            <div className={`absolute top-6 right-6 w-20 h-20 border-t-2 border-r-2 ${isVictory ? 'border-neon-cyan/30' : 'border-glitch-red/30'}`} />
            <div className={`absolute bottom-6 left-6 w-20 h-20 border-b-2 border-l-2 ${isVictory ? 'border-neon-cyan/30' : 'border-glitch-red/30'}`} />
            <div className={`absolute bottom-6 right-6 w-20 h-20 border-b-2 border-r-2 ${isVictory ? 'border-neon-cyan/30' : 'border-glitch-red/30'}`} />
        </div>
    );
};
