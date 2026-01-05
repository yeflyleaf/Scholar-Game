import { AnimatePresence, motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import type { StarSector } from '../../types/game';

// Nebula background
const NebulaBackground: React.FC = () => {
    const stars = useMemo(() => 
        [...Array(80)].map((_, i) => ({
            id: i,
            size: Math.random() * 2 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 2,
        })), []
    );

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Deep space gradient */}
            <div 
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 50% 50%, #090a0f 0%, #000000 100%)' }}
            />
            
            {/* Nebula clouds */}
            <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: 600,
                    height: 400,
                    top: '-10%',
                    right: '-5%',
                    background: 'radial-gradient(ellipse, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: 500,
                    height: 350,
                    bottom: '10%',
                    left: '-10%',
                    background: 'radial-gradient(ellipse, rgba(34, 211, 238, 0.3) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 8, delay: 2, repeat: Infinity }}
            />
            <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: 400,
                    height: 300,
                    top: '40%',
                    left: '60%',
                    background: 'radial-gradient(ellipse, rgba(74, 222, 128, 0.25) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 8, delay: 4, repeat: Infinity }}
            />
            
            {/* Stars */}
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        width: star.size,
                        height: star.size,
                        left: star.left,
                        top: star.top,
                        boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
                    }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
                />
            ))}
        </div>
    );
};

// Planet configurations based on SplashScreen.vue styles
// Scaled up slightly for better playability while maintaining proportions
const PLANET_STYLES = [
    {
        // 主星 - 蓝紫色带星环 (Main planet)
        size: 160, // Original: 180
        bodyStyle: {
            background: 'radial-gradient(circle at 30% 30%, #818cf8 0%, #4f46e5 50%, #1e1b4b 100%)',
            boxShadow: 'inset -30px -20px 40px rgba(0, 0, 0, 0.6), inset 10px 10px 30px rgba(255, 255, 255, 0.1)',
        },
        glowStyle: {
            background: 'radial-gradient(ellipse, rgba(129, 140, 248, 0.4) 0%, transparent 70%)',
        },
        hasRing: true,
        ringStyle: {
            width: '150%',
            height: '35%',
            border: '3px solid rgba(167, 139, 250, 0.5)',
            boxShadow: '0 0 20px rgba(167, 139, 250, 0.3)',
            transform: 'translate(-50%, -50%) rotateX(75deg) rotateZ(-15deg)',
        }
    },
    {
        // 红巨星 (Red giant)
        size: 120, // Original: 120
        bodyStyle: {
            background: 'radial-gradient(circle at 35% 35%, #fca5a5 0%, #dc2626 40%, #7f1d1d 100%)',
            boxShadow: 'inset -20px -15px 30px rgba(0, 0, 0, 0.5)',
        },
        glowStyle: {
            background: 'radial-gradient(ellipse, rgba(248, 113, 113, 0.5) 0%, transparent 70%)',
        }
    },
    {
        // 毒气星 (Toxic planet)
        size: 90, // Original: 80
        bodyStyle: {
            // Note: In CSS, multiple backgrounds are layered top-to-bottom. 
            // We put the pattern ON TOP of the gradient to ensure visibility, using semi-transparent colors.
            background: `
                repeating-conic-gradient(from 0deg, transparent 0deg, transparent 30deg, rgba(74, 222, 128, 0.3) 30deg, rgba(74, 222, 128, 0.3) 60deg),
                radial-gradient(circle at 40% 40%, #86efac 0%, #22c55e 50%, #14532d 100%)
            `,
            boxShadow: 'inset -15px -10px 20px rgba(0, 0, 0, 0.4)',
        },
        glowStyle: {
            background: 'radial-gradient(ellipse, rgba(74, 222, 128, 0.4) 0%, transparent 70%)',
        }
    },
    {
        // 熔岩金星 (Lava planet)
        size: 70, // Original: 50
        bodyStyle: {
            background: 'radial-gradient(circle at 30% 30%, #fef08a 0%, #eab308 50%, #78350f 100%)',
            boxShadow: 'inset -10px -8px 15px rgba(0, 0, 0, 0.3)',
        },
        glowStyle: {
            background: 'radial-gradient(ellipse, rgba(251, 191, 36, 0.6) 0%, transparent 70%)',
            inset: '-40%', // Special larger glow for lava planet
        }
    },
    {
        // 冰霜世界 (Ice planet)
        size: 60, // Original: 40
        bodyStyle: {
            background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #a5f3fc 40%, #0891b2 100%)',
            boxShadow: 'inset -8px -6px 12px rgba(0, 0, 0, 0.2)',
        },
        glowStyle: {
            background: 'radial-gradient(ellipse, rgba(165, 243, 252, 0.4) 0%, transparent 70%)',
        }
    },
    {
        // 紫水晶星 (Crystal planet)
        size: 55, // Original: 35
        bodyStyle: {
            background: 'radial-gradient(circle at 30% 30%, #e9d5ff 0%, #a855f7 50%, #581c87 100%)',
            boxShadow: 'inset -6px -5px 10px rgba(0, 0, 0, 0.3)',
        },
        glowStyle: {
            background: 'radial-gradient(ellipse, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
        }
    },
];

// Planet Node component matching SplashScreen.vue style
const PlanetNode: React.FC<{
    sector: StarSector;
    isSelected: boolean;
    onClick: () => void;
    index: number;
}> = ({ sector, isSelected, onClick, index }) => {
    const isLocked = sector.status === 'LOCKED';
    const isHighEntropy = sector.status === 'HIGH_ENTROPY';
    
    // Get planet style based on index
    const style = PLANET_STYLES[index % PLANET_STYLES.length];
    const size = style.size;

    return (
        <motion.div
            className="absolute cursor-pointer"
            style={{ 
                left: `${sector.position.x}%`, 
                top: `${sector.position.y}%`,
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.12, type: 'spring' }}
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Selection indicator - Outer Ring */}
            {isSelected && (
                <motion.div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        inset: -20,
                        border: `2px solid ${isHighEntropy ? '#ff003c' : '#22d3ee'}`,
                        boxShadow: `0 0 30px ${isHighEntropy ? 'rgba(255, 0, 60, 0.6)' : 'rgba(34, 211, 238, 0.6)'}`,
                    }}
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                    transition={{ 
                        rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 2, repeat: Infinity },
                    }}
                />
            )}

            {/* Planet Glow (Atmosphere) */}
            <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                    inset: style.glowStyle.inset || '-20%', // Default to -20% like SplashScreen
                    background: isLocked 
                        ? 'radial-gradient(ellipse, rgba(100, 100, 100, 0.2) 0%, transparent 70%)'
                        : isHighEntropy
                            ? 'radial-gradient(ellipse, rgba(255, 0, 60, 0.4) 0%, transparent 70%)'
                            : style.glowStyle.background,
                    filter: 'blur(20px)',
                }}
                animate={{
                    scale: isSelected ? [1, 1.2, 1] : [1, 1.1, 1],
                    opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Planet Ring (if applicable) */}
            {!isLocked && style.hasRing && style.ringStyle && (
                <div
                    className="absolute pointer-events-none"
                    style={{
                        top: '50%',
                        left: '50%',
                        width: style.ringStyle.width,
                        height: style.ringStyle.height,
                        border: style.ringStyle.border,
                        borderRadius: '50%',
                        transform: style.ringStyle.transform,
                        boxShadow: style.ringStyle.boxShadow,
                        zIndex: 0, // Ring goes behind/around
                    }}
                />
            )}

            {/* Planet Body */}
            <div 
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{
                    background: isLocked 
                        ? 'radial-gradient(circle at 30% 30%, #525252 0%, #27272a 50%, #18181b 100%)'
                        : isHighEntropy
                            ? 'radial-gradient(circle at 35% 35%, #fca5a5 0%, #dc2626 40%, #7f1d1d 100%)'
                            : style.bodyStyle.background,
                    boxShadow: isLocked
                        ? 'inset -10px -8px 20px rgba(0, 0, 0, 0.5), inset 2px 2px 10px rgba(255, 255, 255, 0.1)'
                        : isHighEntropy
                            ? 'inset -20px -15px 30px rgba(0, 0, 0, 0.5)'
                            : style.bodyStyle.boxShadow,
                    zIndex: 1,
                }}
            >
                {/* Center content (Difficulty Number) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {isLocked ? (
                        <span className="text-2xl opacity-50">🔒</span>
                    ) : (
                        <span 
                            className="font-display font-black text-white"
                            style={{ 
                                fontSize: size / 2.5,
                                textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)',
                            }}
                        >
                            {sector.difficulty}
                        </span>
                    )}
                </div>
            </div>

            {/* Label */}
            <motion.div
                className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap z-20 pointer-events-none"
                style={{ bottom: -30 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
            >
                <div 
                    className="px-4 py-2 rounded-lg"
                    style={{
                        background: 'rgba(16, 20, 36, 0.85)',
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${isSelected 
                            ? (isHighEntropy ? '#ff003c' : '#22d3ee') 
                            : 'rgba(255, 255, 255, 0.15)'}`,
                        boxShadow: isSelected 
                            ? `0 0 20px ${isHighEntropy ? 'rgba(255, 0, 60, 0.4)' : 'rgba(34, 211, 238, 0.4)'}` 
                            : '0 4px 20px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <span className="text-sm font-mono" style={{ color: '#22d3ee' }}>{sector.name}</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Data panel
const DataPanel: React.FC<{ sector: StarSector | null; onStart: () => void }> = ({ sector, onStart }) => {
    if (!sector) {
        return (
            <div className="flex items-center justify-center h-full">
                <motion.div
                    className="text-center"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-dashed border-cyan-400/30 flex items-center justify-center">
                        <div className="w-10 h-10 border-2 border-cyan-400/50 rounded-full animate-pulse" />
                    </div>
                    <p className="text-gray-500 font-mono">扫描中...</p>
                    <p className="text-xs text-gray-600 font-mono mt-1">请选择目标扇区</p>
                </motion.div>
            </div>
        );
    }

    const isHighEntropy = sector.status === 'HIGH_ENTROPY';

    return (
        <motion.div
            key={sector.id}
            className="h-full flex flex-col"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
        >
            {/* Sector name */}
            <div className="mb-6">
                <h3 className="text-3xl font-display font-bold text-white glitch-text mb-2" data-text={sector.name}>
                    {sector.name}
                </h3>
                <p className="text-sm text-gray-400 font-mono leading-relaxed">
                    {sector.description}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div
                    className="relative p-4 rounded-lg overflow-hidden"
                    style={{
                        background: 'rgba(16, 20, 36, 0.65)',
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${isHighEntropy ? 'rgba(255, 0, 60, 0.3)' : 'rgba(57, 255, 20, 0.3)'}`,
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">熵状态</span>
                    <div className={`text-lg font-display font-bold mt-1 ${isHighEntropy ? 'text-red-400' : 'text-green-400'}`}>
                        {isHighEntropy ? '⚠ 高熵警告' : '✓ 逻辑稳定'}
                    </div>
                </motion.div>

                <motion.div
                    className="relative p-4 rounded-lg overflow-hidden"
                    style={{
                        background: 'rgba(16, 20, 36, 0.65)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">挑战等级</span>
                    <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <motion.span
                                key={star}
                                className={`text-xl ${star <= sector.difficulty ? 'text-yellow-400' : 'text-gray-700'}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 + star * 0.1, type: 'spring' }}
                            >
                                ★
                            </motion.span>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Mission briefing */}
            <motion.div
                className="p-4 rounded-lg mb-6"
                style={{
                    background: 'rgba(16, 20, 36, 0.65)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(34, 211, 238, 0.2)',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <motion.div
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">任务简报</span>
                </div>
                <p className="text-sm text-gray-300 font-mono leading-relaxed">
                    目标：渗透认知熵侵蚀区域，通过知识验证重建逻辑框架。
                </p>
            </motion.div>

            <div className="flex-1" />

            {/* Start button */}
            <motion.button
                onClick={onStart}
                className="relative w-full py-5 rounded-lg overflow-hidden group"
                style={{
                    background: 'rgba(16, 20, 36, 0.65)',
                    backdropFilter: 'blur(8px)',
                    border: '2px solid rgba(34, 211, 238, 0.5)',
                    boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(34, 211, 238, 0.4)' }}
                whileTap={{ scale: 0.98 }}
            >
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                <span className="relative z-10 flex items-center justify-center gap-3 text-xl font-display text-cyan-400 group-hover:text-white transition-colors">
                    <span>开始潜渊</span>
                    <motion.span animate={{ x: [0, 8, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                        →
                    </motion.span>
                </span>
            </motion.button>
        </motion.div>
    );
};

// Main component
export const GrandUnificationSim: React.FC = () => {
    const { sectors, currentSector, selectSector, startBattle, setScreen } = useGameStore();

    const handleSectorClick = (sector: StarSector) => {
        if (sector.status !== 'LOCKED') {
            selectSector(sector.id);
        }
    };

    React.useEffect(() => {
        if (!currentSector && sectors.length > 0) {
            const firstAvailable = sectors.find(s => s.status !== 'LOCKED');
            if (firstAvailable) {
                selectSector(firstAvailable.id);
            }
        }
    }, [currentSector, sectors, selectSector]);

    const handleStart = () => {
        if (currentSector) {
            startBattle(currentSector.id);
        }
    };

    return (
        <div className="w-full h-full bg-black relative overflow-hidden flex">
            {/* Background */}
            <NebulaBackground />

            {/* Star Map Area */}
            <div className="flex-1 relative">
                {/* Title */}
                <motion.div
                    className="absolute top-6 left-8 z-30"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-display font-bold text-cyan-400 glitch-text" data-text="大统一理论演练">
                        大统一理论演练
                    </h1>
                    <p className="text-sm font-mono text-gray-500 mt-1 tracking-widest">
                        GRAND UNIFICATION SIMULATION
                    </p>
                </motion.div>

                {/* Planet nodes */}
                <div className="absolute inset-0 z-20">
                    {sectors.map((sector, index) => (
                        <PlanetNode
                            key={sector.id}
                            sector={sector}
                            isSelected={currentSector?.id === sector.id}
                            onClick={() => handleSectorClick(sector)}
                            index={index}
                        />
                    ))}
                </div>
            </div>

            {/* Side Panel - Glass morphism style */}
            <motion.div
                className="w-[420px] h-full relative z-30"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                {/* Panel background with glass effect */}
                <div 
                    className="absolute inset-0"
                    style={{
                        background: 'rgba(16, 20, 36, 0.65)',
                        backdropFilter: 'blur(16px)',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
                    }}
                />
                
                {/* Panel border gradient */}
                <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
                    }}
                />

                <div className="relative h-full p-6 flex flex-col">
                    <div className="mb-6 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="w-3 h-3 bg-cyan-400"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            <h2 className="text-2xl font-display text-cyan-400">扇区分析</h2>
                        </div>
                        <p className="text-xs font-mono text-gray-500 mt-1">SECTOR ANALYSIS</p>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <DataPanel 
                                key={currentSector?.id || 'empty'}
                                sector={currentSector} 
                                onStart={handleStart} 
                            />
                        </AnimatePresence>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 flex gap-3">
                        <motion.button
                            onClick={() => setScreen('TITLE')}
                            className="flex-1 py-3 px-4 font-mono text-sm text-gray-400 rounded-lg transition-all"
                            style={{
                                background: 'rgba(16, 20, 36, 0.5)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                            whileHover={{ scale: 1.02, borderColor: 'rgba(34, 211, 238, 0.5)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            中止链接
                        </motion.button>
                        <motion.button
                            onClick={() => setScreen('MIND_HACK')}
                            className="flex-1 py-3 px-4 font-mono text-sm text-yellow-400 rounded-lg transition-all"
                            style={{
                                background: 'rgba(16, 20, 36, 0.5)',
                                border: '1px solid rgba(255, 215, 0, 0.3)',
                            }}
                            whileHover={{ scale: 1.02, background: 'rgba(255, 215, 0, 0.1)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            思维骇入
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
