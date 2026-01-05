// 组件：问题卡片 (QuestionCard) - 显示问题和选项，处理用户回答
import { motion } from 'framer-motion';
import React from 'react';
import type { Question } from '../../types/game';

interface QuestionCardProps {
    question: Question;
    onAnswer: (index: number) => void;
    disabled?: boolean;
    selectedIndex?: number | null;
    isCorrect?: boolean | null;
}

// 错误答案的数据腐蚀特效
const CorruptionOverlay: React.FC = () => (
    <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
            background: `repeating-linear-gradient(
                0deg,
                transparent 0%,
                rgba(255, 0, 60, 0.1) 1%,
                transparent 2%
            )`,
        }}
    />
);

// 成功粒子
const SuccessParticles: React.FC = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 bg-stable rounded-full"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                    scale: [0, 1.5, 0],
                    opacity: [1, 0.5, 0],
                    y: [-10, -30],
                }}
                transition={{
                    duration: 1,
                    delay: i * 0.05,
                }}
            />
        ))}
    </div>
);

export const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    onAnswer,
    disabled,
    selectedIndex,
    isCorrect
}) => {
    const hasAnswered = selectedIndex !== null && selectedIndex !== undefined;

    const typeLabel = question.type === 'Single' ? '单选题' : question.type === 'Multi' ? '多选题' : '判断题';

    return (
        <motion.div
            className="fui-panel p-8 w-full max-w-3xl relative overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            style={{
                boxShadow: hasAnswered
                    ? isCorrect
                        ? '0 0 40px rgba(57, 255, 20, 0.3)'
                        : '0 0 40px rgba(255, 0, 60, 0.3)'
                    : '0 0 40px rgba(0, 243, 255, 0.2)',
            }}
        >
            {/* 基于回答状态的特效 */}
            {hasAnswered && isCorrect && <SuccessParticles />}
            {hasAnswered && !isCorrect && <CorruptionOverlay />}

            {/* 动画顶部边框 */}
            <motion.div
                className="absolute top-0 left-0 h-1"
                style={{
                    background: hasAnswered
                        ? isCorrect
                            ? 'linear-gradient(90deg, transparent, #39ff14, transparent)'
                            : 'linear-gradient(90deg, transparent, #ff003c, transparent)'
                        : 'linear-gradient(90deg, transparent, #00f3ff, transparent)',
                }}
                initial={{ width: '0%', left: '50%' }}
                animate={{ width: '100%', left: '0%' }}
                transition={{ duration: 0.5 }}
            />

            {/* 头部 */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700/50">
                <div className="flex items-center gap-4">
                    {/* 类型徽章 */}
                    <motion.div
                        className="px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="text-neon-cyan font-mono text-sm">
                            {typeLabel}
                        </span>
                    </motion.div>
                    
                    {/* 难度指示器 */}
                    <motion.div
                        className="flex gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                                key={lvl}
                                className={`w-2 h-4 ${
                                    lvl <= question.difficulty
                                        ? 'bg-holographic-gold'
                                        : 'bg-gray-700'
                                }`}
                            />
                        ))}
                    </motion.div>
                </div>

                {/* 计时器或状态指示器 */}
                <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className={`w-3 h-3 rounded-full ${
                        hasAnswered
                            ? isCorrect ? 'bg-stable' : 'bg-glitch-red'
                            : 'bg-neon-cyan animate-pulse'
                    }`} />
                    <span className="text-sm font-mono text-gray-400">
                        {hasAnswered
                            ? isCorrect ? '正确' : '错误'
                            : '等待输入'
                        }
                    </span>
                </motion.div>
            </div>

            {/* 问题文本 */}
            <motion.div
                className="mb-10 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                {/* 题号装饰 */}
                <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-neon-cyan via-neon-cyan/50 to-transparent" />
                
                <p className="text-2xl font-display text-white leading-relaxed pl-4">
                    {question.text}
                </p>
            </motion.div>

            {/* 选项 */}
            <div className="grid grid-cols-1 gap-4">
                {question.options.map((option, index) => {
                    const isSelected = selectedIndex === index;
                    const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...

                    // 确定选项状态
                    let stateClass = '';
                    let borderColor = 'border-gray-600/50';
                    let bgGradient = 'from-black/40 to-black/20';
                    
                    if (isSelected) {
                        if (isCorrect) {
                            stateClass = 'correct';
                            borderColor = 'border-stable';
                            bgGradient = 'from-stable/20 to-stable/5';
                        } else {
                            stateClass = 'incorrect';
                            borderColor = 'border-glitch-red';
                            bgGradient = 'from-glitch-red/20 to-glitch-red/5';
                        }
                    }

                    return (
                        <motion.button
                            key={index}
                            onClick={() => !disabled && onAnswer(index)}
                            disabled={disabled}
                            className={`
                                option-card ${stateClass}
                                relative w-full text-left p-5 rounded
                                bg-gradient-to-r ${bgGradient}
                                border ${borderColor}
                                transition-all duration-300
                                disabled:cursor-not-allowed
                                group
                            `}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            whileHover={!disabled ? { x: 10, scale: 1.01 } : {}}
                            whileTap={!disabled ? { scale: 0.99 } : {}}
                        >
                            {/* 选项字母 */}
                            <span className={`
                                inline-flex items-center justify-center
                                w-10 h-10 mr-4
                                border-2 ${isSelected ? borderColor : 'border-neon-cyan/30'}
                                text-lg font-display font-bold
                                ${isSelected 
                                    ? isCorrect ? 'text-stable bg-stable/10' : 'text-glitch-red bg-glitch-red/10'
                                    : 'text-neon-cyan/70 group-hover:text-neon-cyan group-hover:border-neon-cyan'
                                }
                                transition-all duration-300
                            `}
                            style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}
                            >
                                {optionLetter}
                            </span>
                            
                            {/* 选项文本 */}
                            <span className={`
                                font-mono text-lg
                                ${isSelected 
                                    ? isCorrect ? 'text-stable' : 'text-glitch-red'
                                    : 'text-gray-200 group-hover:text-white'
                                }
                                transition-colors duration-300
                            `}>
                                {option}
                            </span>

                            {/* 悬停扫描特效 */}
                            <motion.div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.1), transparent)',
                                }}
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6 }}
                            />

                            {/* 选择指示器 */}
                            {isSelected && (
                                <motion.div
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 text-2xl ${
                                        isCorrect ? 'text-stable' : 'text-glitch-red'
                                    }`}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    {isCorrect ? '✓' : '✕'}
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* 角落装饰 */}
            <motion.div
                className="absolute top-0 right-0 p-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 0.5 }}
            >
                <div className="w-12 h-12 border-t-2 border-r-2 border-neon-cyan" />
            </motion.div>
            <motion.div
                className="absolute bottom-0 left-0 p-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 0.5 }}
            >
                <div className="w-12 h-12 border-b-2 border-l-2 border-neon-cyan" />
            </motion.div>

            {/* 侧边数据流 */}
            <div className="absolute left-0 top-0 bottom-0 w-1 overflow-hidden opacity-30">
                <motion.div
                    className="w-full bg-gradient-to-b from-transparent via-neon-cyan to-transparent"
                    style={{ height: '50%' }}
                    animate={{ y: ['-100%', '300%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
            </div>
        </motion.div>
    );
};
