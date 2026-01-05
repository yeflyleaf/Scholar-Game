// 页面：标题画面 (TitleScreen) - 游戏启动界面，包含炫酷的视觉特效
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';

// 数字雨特效（黑客帝国风格）
const DigitalRain: React.FC = () => {
    const columns = 30;
    const chars = '学者计划-真理知识-智慧未来-科技系统-网络数据-代码连接-进化飞升';
    
    const rainColumns = useMemo(() => 
        [...Array(columns)].map((_, i) => ({
            id: i,
            left: `${(i / columns) * 100}%`,
            duration: 8 + Math.random() * 8,
            delay: Math.random() * 5,
            characters: [...Array(30)].map((_, j) => ({
                char: chars[Math.floor(Math.random() * chars.length)],
                opacity: 1 - j * 0.03,
            })),
        })), [chars, columns]
    );
    
    return (
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
            {rainColumns.map((col) => (
                <motion.div
                    key={col.id}
                    className="absolute text-neon-cyan font-mono text-xs whitespace-pre leading-4"
                    style={{ left: col.left }}
                    initial={{ y: '-100%' }}
                    animate={{ y: '100vh' }}
                    transition={{
                        duration: col.duration,
                        repeat: Infinity,
                        delay: col.delay,
                        ease: 'linear',
                    }}
                >
                    {col.characters.map((item, j) => (
                        <div key={j} style={{ opacity: item.opacity }}>
                            {item.char}
                        </div>
                    ))}
                </motion.div>
            ))}
        </div>
    );
};

// 动画星座/神经网络背景
const NeuralNetwork: React.FC = () => {
    const nodes = useMemo(() => 
        [...Array(25)].map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 2 + Math.random() * 4,
            delay: Math.random() * 2,
        })), []
    );

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
            <defs>
                <filter id="glow-strong">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00f3ff" stopOpacity="0" />
                    <stop offset="50%" stopColor="#00f3ff" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#00f3ff" stopOpacity="0" />
                </linearGradient>
            </defs>
            
            {/* 连接线 */}
            {nodes.map((node, i) => 
                nodes.slice(i + 1).filter((_, j) => j < 3).map((target, j) => (
                    <motion.line
                        key={`${i}-${j}`}
                        x1={`${node.x}%`}
                        y1={`${node.y}%`}
                        x2={`${target.x}%`}
                        y2={`${target.y}%`}
                        stroke="url(#lineGradient)"
                        strokeWidth="0.5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
                        transition={{
                            duration: 4,
                            delay: node.delay,
                            repeat: Infinity,
                            repeatDelay: 2,
                        }}
                    />
                ))
            )}
            
            {/* 节点 */}
            {nodes.map((node) => (
                <motion.circle
                    key={node.id}
                    cx={`${node.x}%`}
                    cy={`${node.y}%`}
                    r={node.size}
                    fill="#00f3ff"
                    filter="url(#glow-strong)"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                        opacity: [0, 1, 0.5, 1, 0],
                        scale: [0, 1, 1.2, 1, 0],
                    }}
                    transition={{
                        duration: 5,
                        delay: node.delay,
                        repeat: Infinity,
                        repeatDelay: 3,
                    }}
                />
            ))}
        </svg>
    );
};

// 大型旋转六边形框架
const HexagonFrame: React.FC<{ size: number; duration: number; reverse?: boolean; opacity?: number }> = ({ 
    size, duration, reverse = false, opacity = 0.3 
}) => (
    <motion.div
        className="absolute"
        style={{
            width: size,
            height: size,
            left: '50%',
            top: '50%',
            marginLeft: -size / 2,
            marginTop: -size / 2,
        }}
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
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
    </motion.div>
);

// 轨道能量粒子
const OrbitingParticle: React.FC<{ radius: number; duration: number; delay: number; color: string }> = ({
    radius, duration, delay, color
}) => (
    <motion.div
        className="absolute left-1/2 top-1/2"
        style={{ width: radius * 2, height: radius * 2, marginLeft: -radius, marginTop: -radius }}
        animate={{ rotate: 360 }}
        transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    >
        <motion.div
            className="absolute w-3 h-3 rounded-full"
            style={{ 
                backgroundColor: color,
                boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
                top: 0,
                left: '50%',
                marginLeft: -6,
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1, repeat: Infinity }}
        />
    </motion.div>
);

// 脉动核心
const CentralCore: React.FC = () => (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {/* 外部脉冲环 */}
        {[...Array(3)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon-cyan/30"
                initial={{ width: 100, height: 100, opacity: 0.8 }}
                animate={{ 
                    width: [100, 400 + i * 100],
                    height: [100, 400 + i * 100],
                    opacity: [0.6, 0],
                }}
                transition={{
                    duration: 3,
                    delay: i * 1,
                    repeat: Infinity,
                    ease: 'easeOut',
                }}
            />
        ))}
        
        {/* 核心光晕 */}
        <motion.div
            className="w-32 h-32 rounded-full"
            style={{
                background: 'radial-gradient(circle, rgba(0, 243, 255, 0.4) 0%, rgba(0, 243, 255, 0.1) 50%, transparent 70%)',
            }}
            animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
    </div>
);

// 漂浮故障碎片
const GlitchFragment: React.FC<{ index: number }> = ({ index }) => {
    const style = useMemo(() => ({
        left: `${10 + Math.random() * 80}%`,
        top: `${10 + Math.random() * 80}%`,
        width: 20 + Math.random() * 60,
        height: 2 + Math.random() * 4,
    }), []);

    return (
        <motion.div
            className="absolute bg-glitch-red"
            style={style}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{
                opacity: [0, 0.8, 0],
                scaleX: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 50],
            }}
            transition={{
                duration: 0.3,
                delay: index * 0.5 + Math.random() * 5,
                repeat: Infinity,
                repeatDelay: 5 + Math.random() * 10,
            }}
        />
    );
};

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
                            transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 + Math.random() * 2 }}
                        >
                            {char}
                        </motion.span>
                        <motion.span
                            className="absolute inset-0 text-neon-cyan"
                            style={{ clipPath: 'polygon(0 70%, 100% 70%, 100% 100%, 0 100%)' }}
                            animate={{ x: [2, -2, 2], opacity: [0, 0.8, 0] }}
                            transition={{ duration: 0.1, delay: 0.05, repeat: Infinity, repeatDelay: 4 + Math.random() * 2 }}
                        >
                            {char}
                        </motion.span>
                    </motion.span>
                ))}
            </div>
        </motion.div>
    );
};

// 漂浮全息卡片
const HolographicCard: React.FC<{ delay: number; position: { x: string; y: string } }> = ({ delay, position }) => {
    const cardId = useMemo(() => Math.random().toString(36).substr(2, 6).toUpperCase(), []);
    
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
                    <div className="mb-1">ID: {cardId}</div>
                    <div className="w-full h-12 border border-neon-cyan/20 mb-2" />
                    <div className="space-y-1">
                        <div className="h-1 bg-neon-cyan/20 w-3/4" />
                        <div className="h-1 bg-neon-cyan/20 w-1/2" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

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
        <div className="w-full h-full flex flex-col items-center justify-center bg-deep-space relative overflow-hidden">
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

                    {/* 带有打字机效果的英文副标题 */}
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
                    <motion.p
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
                    </motion.p>
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
