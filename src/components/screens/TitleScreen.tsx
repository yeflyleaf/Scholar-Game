// 页面：标题画面 (TitleScreen) - 游戏启动界面，包含炫酷的视觉特效
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';

// 数字雨特效（黑客帝国风格）- 使用CSS动画优化性能
const DigitalRain: React.FC = React.memo(() => {
    const columns = 15; // 减少列数以提升性能
    const chars = '学者计划-真理知识-智慧未来-科技系统-网络数据-代码连接-进化飞升';
    
    const rainColumns = useMemo(() => 
        [...Array(columns)].map((_, i) => ({
            id: i,
            left: `${(i / columns) * 100}%`,
            duration: 10 + (i % 5) * 2, // 使用确定性的持续时间
            delay: (i % 5) * 1.5,
            characters: [...Array(15)].map((_, j) => ({ // 减少字符数
                char: chars[(i * 3 + j) % chars.length], // 使用确定性的字符选择
                opacity: 1 - j * 0.05,
            })),
        })), [chars, columns]
    );
    
    return (
        <>
            <style>{`
                @keyframes rain-fall {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(100vh); }
                }
            `}</style>
            <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                {rainColumns.map((col) => (
                    <div
                        key={col.id}
                        className="absolute text-neon-cyan font-mono text-xs whitespace-pre leading-4 will-change-transform"
                        style={{ 
                            left: col.left,
                            animation: `rain-fall ${col.duration}s linear ${col.delay}s infinite`,
                        }}
                    >
                        {col.characters.map((item, j) => (
                            <div key={j} style={{ opacity: item.opacity }}>
                                {item.char}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
});

// 动画星座/神经网络背景 - 使用CSS简化以优化性能
const NeuralNetwork: React.FC = React.memo(() => {
    // 使用确定性位置以避免 Math.random() 纯函数问题
    const nodes = useMemo(() => [
        { id: 0, x: 15, y: 20, size: 4, delay: 0 },
        { id: 1, x: 85, y: 15, size: 3, delay: 0.3 },
        { id: 2, x: 45, y: 35, size: 5, delay: 0.6 },
        { id: 3, x: 25, y: 70, size: 3, delay: 0.9 },
        { id: 4, x: 75, y: 65, size: 4, delay: 1.2 },
        { id: 5, x: 55, y: 85, size: 3, delay: 1.5 },
        { id: 6, x: 10, y: 45, size: 4, delay: 0.2 },
        { id: 7, x: 90, y: 50, size: 3, delay: 0.5 },
        { id: 8, x: 35, y: 10, size: 5, delay: 0.8 },
        { id: 9, x: 65, y: 90, size: 4, delay: 1.1 },
        { id: 10, x: 50, y: 55, size: 3, delay: 1.4 },
        { id: 11, x: 30, y: 45, size: 4, delay: 1.7 },
    ], []);

    // 预计算连接线（只连接相近的节点）
    const connections = useMemo(() => [
        [0, 2], [1, 2], [2, 4], [3, 5], [4, 5],
        [6, 3], [7, 4], [8, 1], [9, 5], [10, 2], [10, 4],
    ], []);

    return (
        <>
            <style>{`
                @keyframes node-pulse {
                    0%, 100% { opacity: 0; transform: scale(0); }
                    20% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                    80% { opacity: 1; transform: scale(1); }
                }
                @keyframes line-fade {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 0.5; }
                }
            `}</style>
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00f3ff" stopOpacity="0" />
                        <stop offset="50%" stopColor="#00f3ff" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#00f3ff" stopOpacity="0" />
                    </linearGradient>
                </defs>
                
                {/* 连接线 - 使用CSS动画 */}
                {connections.map(([fromIdx, toIdx], i) => {
                    const from = nodes[fromIdx];
                    const to = nodes[toIdx];
                    return (
                        <line
                            key={`line-${i}`}
                            x1={`${from.x}%`}
                            y1={`${from.y}%`}
                            x2={`${to.x}%`}
                            y2={`${to.y}%`}
                            stroke="url(#lineGradient)"
                            strokeWidth="0.5"
                            className="will-change-[opacity]"
                            style={{
                                animation: `line-fade 6s ease-in-out ${from.delay}s infinite`,
                            }}
                        />
                    );
                })}
                
                {/* 节点 - 使用CSS动画替代framer-motion以提升性能 */}
                {nodes.map((node) => (
                    <circle
                        key={node.id}
                        cx={`${node.x}%`}
                        cy={`${node.y}%`}
                        r={node.size}
                        fill="#00f3ff"
                        className="will-change-[opacity,transform]"
                        style={{
                            animation: `node-pulse 8s ease-in-out ${node.delay}s infinite`,
                            transformOrigin: `${node.x}% ${node.y}%`,
                            filter: 'drop-shadow(0 0 4px #00f3ff)',
                        }}
                    />
                ))}
            </svg>
        </>
    );
});

// 大型旋转六边形框架 - 使用CSS动画优化性能
const HexagonFrame: React.FC<{ size: number; duration: number; reverse?: boolean; opacity?: number }> = React.memo(({ 
    size, duration, reverse = false, opacity = 0.3 
}) => (
    <>
        <style>{`
            @keyframes rotate-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes rotate-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        `}</style>
        <div
            className="absolute will-change-transform"
            style={{
                width: size,
                height: size,
                left: '50%',
                top: '50%',
                marginLeft: -size / 2,
                marginTop: -size / 2,
                animation: `${reverse ? 'rotate-ccw' : 'rotate-cw'} ${duration}s linear infinite`,
            }}
        >
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon
                    points="50 2, 93 25, 93 75, 50 98, 7 75, 7 25"
                    fill="none"
                    stroke="#00f3ff"
                    strokeWidth="0.3"
                    opacity={opacity}
                />
            </svg>
        </div>
    </>
));

// 轨道能量粒子 - 使用CSS动画优化性能
const OrbitingParticle: React.FC<{ radius: number; duration: number; delay: number; color: string }> = React.memo(({
    radius, duration, delay, color
}) => (
    <>
        <style>{`
            @keyframes particle-pulse {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.5); opacity: 1; }
            }
        `}</style>
        <div
            className="absolute left-1/2 top-1/2 will-change-transform"
            style={{ 
                width: radius * 2, 
                height: radius * 2, 
                marginLeft: -radius, 
                marginTop: -radius,
                animation: `rotate-cw ${duration}s linear ${delay}s infinite`,
            }}
        >
            <div
                className="absolute w-3 h-3 rounded-full"
                style={{ 
                    backgroundColor: color,
                    boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
                    top: 0,
                    left: '50%',
                    marginLeft: -6,
                    animation: 'particle-pulse 1s ease-in-out infinite',
                }}
            />
        </div>
    </>
));

// 脉动核心 - 使用CSS动画优化性能
const CentralCore: React.FC = React.memo(() => (
    <>
        <style>{`
            @keyframes pulse-ring-0 {
                from { width: 100px; height: 100px; opacity: 0.6; }
                to { width: 400px; height: 400px; opacity: 0; }
            }
            @keyframes pulse-ring-1 {
                from { width: 100px; height: 100px; opacity: 0.6; }
                to { width: 500px; height: 500px; opacity: 0; }
            }
            @keyframes pulse-ring-2 {
                from { width: 100px; height: 100px; opacity: 0.6; }
                to { width: 600px; height: 600px; opacity: 0; }
            }
            @keyframes core-glow {
                0%, 100% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.3); opacity: 1; }
            }
        `}</style>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {/* 外部脉冲环 */}
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon-cyan/30 will-change-[width,height,opacity]"
                    style={{
                        animation: `pulse-ring-${i} 3s ease-out ${i}s infinite`,
                    }}
                />
            ))}
            
            {/* 核心光晕 */}
            <div
                className="w-32 h-32 rounded-full will-change-transform"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 243, 255, 0.4) 0%, rgba(0, 243, 255, 0.1) 50%, transparent 70%)',
                    animation: 'core-glow 2s ease-in-out infinite',
                }}
            />
        </div>
    </>
));

// 漂浮故障碎片 - 使用基于 index 的确定性值以确保纯函数
const GlitchFragment: React.FC<{ index: number }> = React.memo(({ index }) => {
    // 使用基于 index 的确定性值替代 Math.random()
    const fragmentStyles = useMemo(() => [
        { left: '15%', top: '20%', width: 45, height: 3 },
        { left: '72%', top: '35%', width: 60, height: 2 },
        { left: '28%', top: '65%', width: 35, height: 4 },
        { left: '85%', top: '50%', width: 50, height: 3 },
        { left: '40%', top: '80%', width: 55, height: 2 },
        { left: '60%', top: '15%', width: 40, height: 3 },
        { left: '10%', top: '45%', width: 65, height: 2 },
        { left: '50%', top: '70%', width: 30, height: 4 },
    ], []);

    const style = fragmentStyles[index % fragmentStyles.length];
    const xOffset = (index % 3 - 1) * 25; // -25, 0, or 25
    const delayOffset = index * 1.5;
    const repeatDelayValue = 8 + (index % 4) * 2; // 8, 10, 12, or 14

    return (
        <motion.div
            className="absolute bg-glitch-red will-change-[opacity,transform]"
            style={style}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{
                opacity: [0, 0.8, 0],
                scaleX: [0, 1, 0],
                x: [0, xOffset],
            }}
            transition={{
                duration: 0.3,
                delay: delayOffset,
                repeat: Infinity,
                repeatDelay: repeatDelayValue,
            }}
        />
    );
});

// 带有戏剧性揭示效果的动画标题
const AnimatedTitle: React.FC = () => {
    const titleChars = '学习飞升'.split('');

    return (
        <motion.div className="relative">
            {/* 揭示时的背景闪光 */}
            <motion.div
                className="absolute inset-0 bg-white rounded-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.2, 1] }}
                transition={{ duration: 0.6, delay: 0.5 }}
            />

            {/* 带有逐字动画的主标题 */}
            <div className="flex justify-center gap-2">
                {titleChars.map((char, i) => (
                    <motion.span
                        key={i}
                        className="text-7xl md:text-9xl font-display font-black relative"
                        style={{
                            textShadow: `
                                0 0 20px rgba(0, 243, 255, 0.8),
                                0 0 40px rgba(0, 243, 255, 0.6),
                                0 0 60px rgba(0, 243, 255, 0.4),
                                0 0 80px rgba(0, 243, 255, 0.2)
                            `,
                        }}
                        initial={{ opacity: 0, y: 50, rotateX: -90 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.8 + i * 0.15,
                            type: 'spring',
                            stiffness: 100,
                        }}
                    >
                        <span className="gradient-text-cyber">{char}</span>
                        
                        {/* 故障图层 */}
                        <motion.span
                            className="absolute inset-0 text-glitch-red"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 30%, 0 30%)' }}
                            animate={{ x: [-2, 2, -2], opacity: [0, 0.8, 0] }}
                            transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 + i * 0.5 }}
                        >
                            {char}
                        </motion.span>
                        <motion.span
                            className="absolute inset-0 text-neon-cyan"
                            style={{ clipPath: 'polygon(0 70%, 100% 70%, 100% 100%, 0 100%)' }}
                            animate={{ x: [2, -2, 2], opacity: [0, 0.8, 0] }}
                            transition={{ duration: 0.1, delay: 0.05, repeat: Infinity, repeatDelay: 4.5 + i * 0.5 }}
                        >
                            {char}
                        </motion.span>
                    </motion.span>
                ))}
            </div>
        </motion.div>
    );
};

// 漂浮全息卡片 - 使用 delay 参数生成确定性 ID
const HolographicCard: React.FC<{ delay: number; position: { x: string; y: string } }> = React.memo(({ delay, position }) => {
    // 使用 delay 参数生成确定性 ID
    const cardId = useMemo(() => {
        const ids = ['A7F3C2', 'B9D4E1', 'C2A5F8', 'D6B3E9', 'E1C7A4', 'F8D2B6'];
        return ids[Math.floor(delay) % ids.length];
    }, [delay]);
    
    return (
        <motion.div
            className="absolute w-24 h-32 perspective-1000"
            style={{ left: position.x, top: position.y }}
            initial={{ opacity: 0, rotateY: -30 }}
            animate={{ 
                opacity: [0, 0.6, 0.6, 0],
                rotateY: [-30, 0, 0, 30],
                y: [0, -20, -20, -40],
            }}
            transition={{
                duration: 8,
                delay,
                repeat: Infinity,
                repeatDelay: 4,
            }}
        >
            <div 
                className="w-full h-full rounded border border-neon-cyan/30 backdrop-blur-sm"
                style={{
                    background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.1) 0%, rgba(153, 69, 255, 0.1) 100%)',
                    transform: 'rotateY(10deg)',
                }}
            >
                <div className="p-2 text-[8px] font-mono text-neon-cyan/60">
                    <div className="mb-1">编号: {cardId}</div>
                    <div className="w-full h-12 border border-neon-cyan/20 mb-2" />
                    <div className="space-y-1">
                        <div className="h-1 bg-neon-cyan/20 w-3/4" />
                        <div className="h-1 bg-neon-cyan/20 w-1/2" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

// 从中心射出的能量束
const EnergyBeam: React.FC<{ angle: number; delay: number }> = ({ angle, delay }) => (
    <motion.div
        className="absolute left-1/2 top-1/2 origin-left h-0.5"
        style={{
            width: '50vw',
            transform: `rotate(${angle}deg)`,
            background: 'linear-gradient(90deg, rgba(0, 243, 255, 0.8), rgba(0, 243, 255, 0) 80%)',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 0.5, 0] }}
        transition={{
            duration: 2,
            delay,
            repeat: Infinity,
            repeatDelay: 8,
        }}
    />
);

export const TitleScreen: React.FC = () => {
    const { setScreen } = useGameStore();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-deep-space relative overflow-hidden">
            {/* 图层 1：数字雨背景 */}
            <DigitalRain />

            {/* 图层 2：神经网络 */}
            <NeuralNetwork />

            {/* 图层 3：旋转六边形框架 */}
            <HexagonFrame size={600} duration={60} opacity={0.15} />
            <HexagonFrame size={500} duration={45} reverse opacity={0.2} />
            <HexagonFrame size={400} duration={30} opacity={0.25} />
            <HexagonFrame size={300} duration={20} reverse opacity={0.3} />

            {/* 图层 4：能量束 */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <EnergyBeam key={angle} angle={angle} delay={i * 0.3} />
            ))}

            {/* 图层 5：轨道粒子 */}
            <OrbitingParticle radius={180} duration={12} delay={0} color="#00f3ff" />
            <OrbitingParticle radius={220} duration={15} delay={1} color="#ffd700" />
            <OrbitingParticle radius={260} duration={18} delay={2} color="#9945ff" />

            {/* 图层 6：中心核心 */}
            <CentralCore />

            {/* 图层 7：故障碎片 */}
            {[...Array(8)].map((_, i) => (
                <GlitchFragment key={i} index={i} />
            ))}

            {/* 图层 8：漂浮全息卡片 */}
            <HolographicCard delay={0} position={{ x: '8%', y: '20%' }} />
            <HolographicCard delay={2} position={{ x: '85%', y: '25%' }} />
            <HolographicCard delay={4} position={{ x: '5%', y: '65%' }} />
            <HolographicCard delay={6} position={{ x: '88%', y: '70%' }} />

            {/* 主内容 */}
            {isLoaded && (
                <div className="relative z-20 flex flex-col items-center">
                    {/* 带有扫描效果的项目代号 */}
                    <motion.div
                        className="mb-6 relative overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center gap-6">
                            <motion.div 
                                className="h-px w-20 bg-gradient-to-r from-transparent to-neon-cyan"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            />
                            <motion.h2
                                className="text-neon-cyan font-mono tracking-[0.8em] text-lg uppercase"
                                style={{ textShadow: '0 0 20px rgba(0, 243, 255, 0.8)' }}
                                initial={{ opacity: 0, letterSpacing: '0.3em' }}
                                animate={{ opacity: 1, letterSpacing: '0.8em' }}
                                transition={{ delay: 0.5, duration: 1 }}
                            >
                                PROJECT SCHOLAR
                            </motion.h2>
                            <motion.div 
                                className="h-px w-20 bg-gradient-to-l from-transparent to-neon-cyan"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            />
                        </div>
                        
                        {/* 扫描线 */}
                        <motion.div
                            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ delay: 0.5, duration: 1, ease: 'easeInOut' }}
                        />
                    </motion.div>

                    {/* 主标题 */}
                    <AnimatedTitle />

                    {/* 带有打字机效果的副标题 */}
                    <motion.div
                        className="mt-6 overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                    >
                        <motion.p
                            className="text-holographic-gold font-display tracking-[0.5em] text-xl"
                            style={{ textShadow: '0 0 15px rgba(255, 215, 0, 0.6)' }}
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            transition={{ delay: 2, duration: 0.5 }}
                        >
                            THE STUDY ASCENSION
                        </motion.p>
                    </motion.div>

                    {/* 标语 */}
                    <motion.div
                        className="text-gray-400 font-mono italic text-lg mt-8 relative"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.5 }}
                    >
                        <span className="text-glitch-red">"</span>
                        为世界上所有的不挂科而战！
                        <span className="text-glitch-red">"</span>
                        
                        {/* 下划线动画 */}
                        <motion.div
                            className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent w-full"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 3, duration: 1 }}
                        />
                    </motion.div>
                </div>
            )}

            {/* 按钮区域 */}
            <motion.div
                className="relative z-20 mt-16 flex flex-col gap-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
            >
                {/* 带有额外特效的主按钮 */}
                <motion.button
                    onClick={() => setScreen('GRAND_UNIFICATION_SIM')}
                    className="group relative w-80 py-5 font-display text-xl tracking-widest overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.15) 0%, rgba(0, 243, 255, 0.05) 100%)',
                        border: '2px solid rgba(0, 243, 255, 0.5)',
                        clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)',
                    }}
                    whileHover={{ 
                        scale: 1.05,
                        boxShadow: '0 0 40px rgba(0, 243, 255, 0.6), inset 0 0 40px rgba(0, 243, 255, 0.1)',
                    }}
                    whileTap={{ scale: 0.98 }}
                >
                    {/* 动画边框 */}
                    <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.5), transparent)',
                        }}
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    
                    {/* 角落装饰 */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-cyan" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-cyan" />
                    
                    <span className="relative z-10 text-neon-cyan group-hover:text-white transition-colors">
                        开始链接
                    </span>
                    
                    {/* 箭头指示器 */}
                    <motion.span
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-neon-cyan opacity-0 group-hover:opacity-100"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    >
                        →
                    </motion.span>
                </motion.button>

                {/* 设置按钮 */}
                <motion.button
                    onClick={() => setScreen('SETTINGS')}
                    className="w-80 py-3 font-mono text-sm tracking-widest text-gray-400 border border-gray-600 hover:border-neon-cyan/50 hover:text-neon-cyan transition-all duration-300"
                    style={{
                        clipPath: 'polygon(5% 0, 100% 0, 100% 80%, 95% 100%, 0 100%, 0 20%)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    系统配置
                </motion.button>
            </motion.div>

            {/* 底部状态栏 */}
            <motion.div
                className="absolute bottom-8 left-0 right-0 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 3.5 }}
            >
            </motion.div>

            {/* 全屏角落装饰 */}
            <div className="absolute top-8 left-8 w-32 h-32">
                <div className="w-full h-full border-t-2 border-l-2 border-neon-cyan/20" />
                <motion.div
                    className="absolute top-0 left-0 w-full h-0.5 bg-neon-cyan origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                />
            </div>
            <div className="absolute top-8 right-8 w-32 h-32">
                <div className="w-full h-full border-t-2 border-r-2 border-neon-cyan/20" />
            </div>
            <div className="absolute bottom-8 left-8 w-32 h-32">
                <div className="w-full h-full border-b-2 border-l-2 border-neon-cyan/20" />
            </div>
            <div className="absolute bottom-8 right-8 w-32 h-32">
                <div className="w-full h-full border-b-2 border-r-2 border-neon-cyan/20" />
                <motion.div
                    className="absolute bottom-0 right-0 w-full h-0.5 bg-neon-cyan origin-right"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                />
            </div>

            {/* 晕影效果 */}
            <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5, 8, 13, 0.4) 70%, rgba(5, 8, 13, 0.8) 100%)',
                }}
            />
        </div>
    );
};
