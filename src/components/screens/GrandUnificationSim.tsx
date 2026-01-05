// 页面：大统一理论演练 (GrandUnificationSim) - 关卡选择界面，显示星图和扇区信息
import { AnimatePresence, motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import type { StarSector } from '../../types/game';

// 星云背景
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
            {/* 深空渐变 */}
            <div 
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 50% 50%, #090a0f 0%, #000000 100%)' }}
            />
            
            {/* 星云云团 */}
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
            
            {/* 星星 */}
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

// 六边形节点配置 - 每个难度对应不同的颜色方案和尺寸
const NODE_STYLES = [
    { 
        size: 130, 
        primaryColor: '#00f3ff', // 青色
        secondaryColor: '#0891b2',
        glowColor: 'rgba(0, 243, 255, 0.4)',
        accentColor: '#22d3ee',
    },
    { 
        size: 120, 
        primaryColor: '#a855f7', // 紫色
        secondaryColor: '#7c3aed',
        glowColor: 'rgba(168, 85, 247, 0.4)',
        accentColor: '#c084fc',
    },
    { 
        size: 110, 
        primaryColor: '#f59e0b', // 金色
        secondaryColor: '#d97706',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        accentColor: '#fbbf24',
    },
    { 
        size: 100, 
        primaryColor: '#10b981', // 翡翠绿
        secondaryColor: '#059669',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        accentColor: '#34d399',
    },
    { 
        size: 95, 
        primaryColor: '#ec4899', // 粉红
        secondaryColor: '#db2777',
        glowColor: 'rgba(236, 72, 153, 0.4)',
        accentColor: '#f472b6',
    },
    { 
        size: 90, 
        primaryColor: '#3b82f6', // 蓝色
        secondaryColor: '#2563eb',
        glowColor: 'rgba(59, 130, 246, 0.4)',
        accentColor: '#60a5fa',
    },
];

// SVG 六边形路径生成
const getHexagonPath = (size: number, inset: number = 0): string => {
    const s = size / 2 - inset;
    const h = s * Math.sin(Math.PI / 3);
    const points = [
        [size/2, size/2 - s],           // 顶部
        [size/2 + h, size/2 - s/2],     // 右上
        [size/2 + h, size/2 + s/2],     // 右下
        [size/2, size/2 + s],           // 底部
        [size/2 - h, size/2 + s/2],     // 左下
        [size/2 - h, size/2 - s/2],     // 左上
    ];
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
};

// 华丽的多边形几何节点组件
const GeometricNode: React.FC<{
    sector: StarSector;
    isSelected: boolean;
    onClick: () => void;
    index: number;
}> = ({ sector, isSelected, onClick, index }) => {
    const isLocked = sector.status === 'LOCKED';
    const isHighEntropy = sector.status === 'HIGH_ENTROPY';
    
    const style = NODE_STYLES[index % NODE_STYLES.length];
    const size = style.size;
    
    // 状态颜色覆盖
    const primaryColor = isLocked ? '#4a4a4a' : isHighEntropy ? '#ff003c' : style.primaryColor;
    const secondaryColor = isLocked ? '#2a2a2a' : isHighEntropy ? '#991b1b' : style.secondaryColor;
    const glowColor = isLocked ? 'rgba(100, 100, 100, 0.2)' : isHighEntropy ? 'rgba(255, 0, 60, 0.5)' : style.glowColor;
    const accentColor = isLocked ? '#666' : isHighEntropy ? '#ff6b6b' : style.accentColor;

    return (
        <motion.div
            className="absolute cursor-pointer"
            style={{ 
                left: `${sector.position.x}%`, 
                top: `${sector.position.y}%`,
                width: size + 60,
                height: size + 60,
                marginLeft: -(size + 60) / 2,
                marginTop: -(size + 60) / 2,
                zIndex: isSelected ? 50 : 20,
            }}
            initial={{ scale: 0, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: index * 0.15, type: 'spring' }}
            onClick={onClick}
            whileHover={{ scale: isLocked ? 1 : 1.08 }}
            whileTap={{ scale: isLocked ? 1 : 0.95 }}
        >
            {/* 1. 外层能量脉冲环 */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    inset: 0,
                    background: `radial-gradient(circle, ${glowColor} 0%, transparent 60%)`,
                    filter: 'blur(15px)',
                }}
                animate={{
                    scale: isSelected ? [1, 1.3, 1] : [1, 1.15, 1],
                    opacity: [0.4, 0.8, 0.4],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
            />

            {/* 2. 最外层旋转六边形框 */}
            <motion.svg
                className="absolute pointer-events-none"
                style={{ inset: 0 }}
                viewBox={`0 0 ${size + 60} ${size + 60}`}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
                <path
                    d={getHexagonPath(size + 60, 5)}
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth="1"
                    strokeDasharray="10 5"
                    opacity={0.3}
                />
            </motion.svg>

            {/* 3. 选中状态 - 旋转能量环 */}
            {isSelected && (
                <motion.svg
                    className="absolute pointer-events-none"
                    style={{ inset: 5 }}
                    viewBox={`0 0 ${size + 50} ${size + 50}`}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                >
                    <defs>
                        <linearGradient id={`selectGrad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
                            <stop offset="50%" stopColor={accentColor} stopOpacity="0.5" />
                            <stop offset="100%" stopColor={primaryColor} stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    <path
                        d={getHexagonPath(size + 50, 3)}
                        fill="none"
                        stroke={`url(#selectGrad-${index})`}
                        strokeWidth="2"
                        filter={`drop-shadow(0 0 10px ${primaryColor})`}
                    />
                </motion.svg>
            )}

            {/* 4. 中层六边形框架 */}
            <motion.svg
                className="absolute pointer-events-none"
                style={{ inset: 15 }}
                viewBox={`0 0 ${size + 30} ${size + 30}`}
                animate={{ rotate: isSelected ? -180 : 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
                <path
                    d={getHexagonPath(size + 30, 2)}
                    fill="none"
                    stroke={secondaryColor}
                    strokeWidth="1.5"
                    opacity={0.6}
                />
            </motion.svg>

            {/* 5. 核心六边形本体 */}
            <div
                className="absolute"
                style={{
                    inset: 30,
                    clipPath: `polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 25%, 0% 75%)`,
                }}
            >
                {/* 六边形背景 */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `
                            linear-gradient(135deg, ${primaryColor}22 0%, ${secondaryColor}44 50%, ${primaryColor}22 100%),
                            radial-gradient(circle at 30% 30%, ${primaryColor}33 0%, transparent 60%)
                        `,
                        border: `2px solid ${primaryColor}`,
                        filter: isLocked ? 'grayscale(0.8) brightness(0.6)' : 'none',
                    }}
                />

                {/* 内部网格纹理 */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `
                            linear-gradient(0deg, ${primaryColor}40 1px, transparent 1px),
                            linear-gradient(90deg, ${primaryColor}40 1px, transparent 1px)
                        `,
                        backgroundSize: '10px 10px',
                    }}
                />

                {/* 扫描线动画 */}
                {!isLocked && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: `linear-gradient(180deg, transparent 0%, ${primaryColor}40 50%, transparent 100%)`,
                            height: '30%',
                        }}
                        animate={{ y: ['-100%', '400%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                )}

                {/* 中央内容区 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {isLocked ? (
                        <span className="text-3xl opacity-50">🔒</span>
                    ) : (
                        <>
                            {/* 难度数字 */}
                            <span 
                                className="font-display font-black"
                                style={{ 
                                    fontSize: size / 2.2,
                                    color: primaryColor,
                                    textShadow: `0 0 20px ${primaryColor}, 0 0 40px ${primaryColor}50`,
                                }}
                            >
                                {sector.difficulty}
                            </span>
                            {/* 难度星级 */}
                            <div className="flex gap-0.5 mt-1">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{
                                            background: i < sector.difficulty ? accentColor : `${primaryColor}30`,
                                            boxShadow: i < sector.difficulty ? `0 0 5px ${accentColor}` : 'none',
                                        }}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 6. 角落装饰 */}
            {!isLocked && (
                <>
                    <div className="absolute top-[28px] left-[28px] w-3 h-3 border-t-2 border-l-2" style={{ borderColor: accentColor }} />
                    <div className="absolute top-[28px] right-[28px] w-3 h-3 border-t-2 border-r-2" style={{ borderColor: accentColor }} />
                    <div className="absolute bottom-[28px] left-[28px] w-3 h-3 border-b-2 border-l-2" style={{ borderColor: accentColor }} />
                    <div className="absolute bottom-[28px] right-[28px] w-3 h-3 border-b-2 border-r-2" style={{ borderColor: accentColor }} />
                </>
            )}

            {/* 7. 数据点装饰 */}
            {!isLocked && [0, 60, 120, 180, 240, 300].map((angle, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full pointer-events-none"
                    style={{
                        top: '50%',
                        left: '50%',
                        marginLeft: -4,
                        marginTop: -4,
                        background: accentColor,
                        boxShadow: `0 0 8px ${accentColor}`,
                        transform: `rotate(${angle}deg) translateY(-${size/2 + 22}px)`,
                    }}
                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                />
            ))}

            {/* 8. 标签 */}
            <motion.div
                className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
                style={{ bottom: -15, zIndex: 100 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
            >
                <div 
                    className="px-4 py-2 flex flex-col items-center"
                    style={{
                        background: 'rgba(5, 10, 20, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${isSelected ? primaryColor : `${primaryColor}40`}`,
                        clipPath: 'polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0% 50%)',
                        boxShadow: isSelected ? `0 0 25px ${glowColor}` : 'none',
                    }}
                >
                    <span 
                        className="text-sm font-mono font-bold tracking-wider"
                        style={{ color: primaryColor }}
                    >
                        {sector.name}
                    </span>
                    {isHighEntropy && (
                        <motion.span 
                            className="text-[9px] text-red-400 font-mono tracking-widest mt-0.5"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        >
                            ⚠ 熵警报
                        </motion.span>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

// 数据面板
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
            {/* 扇区名称 */}
            <div className="mb-6">
                <h3 className="text-3xl font-display font-bold text-white glitch-text mb-2" data-text={sector.name}>
                    {sector.name}
                </h3>
                <p className="text-sm text-gray-400 font-mono leading-relaxed">
                    {sector.description}
                </p>
            </div>

            {/* 统计数据 */}
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

            {/* 任务简报 */}
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

            {/* 开始按钮 */}
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

// 主组件
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
        <div className="w-full h-screen bg-black relative overflow-hidden flex">
            {/* 背景 */}
            <NebulaBackground />

            {/* 星图区域 */}
            <div className="flex-1 relative">
                {/* 标题 */}
                <motion.div
                    className="absolute top-6 left-8 z-30"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-display font-bold text-cyan-400 glitch-text" data-text="大统一理论演练">
                        大统一理论演练
                    </h1>
                    <p className="text-sm font-mono text-gray-500 mt-1 tracking-widest">
                        大统一理论演练
                    </p>
                </motion.div>

                {/* 几何节点 */}
                <div className="absolute inset-0 z-20">
                    {sectors.map((sector, index) => (
                        <GeometricNode
                            key={sector.id}
                            sector={sector}
                            isSelected={currentSector?.id === sector.id}
                            onClick={() => handleSectorClick(sector)}
                            index={index}
                        />
                    ))}
                </div>
            </div>

            {/* 侧边面板 - 毛玻璃风格 */}
            <motion.div
                className="w-[420px] h-full relative z-30"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                {/* 带有毛玻璃效果的面板背景 */}
                <div 
                    className="absolute inset-0"
                    style={{
                        background: 'rgba(16, 20, 36, 0.65)',
                        backdropFilter: 'blur(16px)',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
                    }}
                />
                
                {/* 面板边框渐变 */}
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
                        <p className="text-xs font-mono text-gray-500 mt-1">扇区分析</p>
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
