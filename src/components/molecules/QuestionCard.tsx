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

export const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    onAnswer,
    disabled,
    selectedIndex,
    isCorrect
}) => {
    return (
        <div className="fui-panel p-6 w-full max-w-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                <span className="text-neon-cyan font-mono text-sm">
                    类型 // {question.type === 'Single' ? '单选题' : question.type === 'Multi' ? '多选题' : '判断题'}
                </span>
                <span className="text-holographic-gold font-mono text-sm">
                    等级 {question.difficulty}
                </span>
            </div>

            {/* Question Text */}
            <div className="mb-8">
                <p className="text-xl font-mono text-white leading-relaxed glitch-text" data-text={question.text}>
                    {question.text}
                </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-4">
                {question.options.map((option, index) => {
                    const isSelected = selectedIndex === index;
                    const showResult = selectedIndex !== null || selectedIndex !== undefined;
                    
                    let buttonClass = "hex-button w-full text-left relative overflow-hidden group";
                    if (isSelected) {
                        buttonClass += " bg-neon-cyan/20 border-neon-cyan text-white";
                    }
                    
                    // Result styling
                    if (showResult && isSelected) {
                         if (isCorrect) {
                             buttonClass += " bg-stable/20 border-stable text-stable";
                         } else {
                             buttonClass += " bg-glitch-red/20 border-glitch-red text-glitch-red";
                         }
                    }

                    return (
                        <motion.button
                            key={index}
                            onClick={() => onAnswer(index)}
                            disabled={disabled}
                            className={buttonClass}
                            whileHover={!disabled ? { scale: 1.02, x: 10 } : {}}
                            whileTap={!disabled ? { scale: 0.98 } : {}}
                        >
                            <span className="mr-4 font-bold opacity-50">0{index + 1}</span>
                            {option}
                            
                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                        </motion.button>
                    );
                })}
            </div>
            
            {/* Decor */}
            <div className="absolute top-0 right-0 p-2 opacity-20">
                <div className="w-16 h-16 border-t-2 border-r-2 border-neon-cyan rounded-tr-xl" />
            </div>
            <div className="absolute bottom-0 left-0 p-2 opacity-20">
                <div className="w-16 h-16 border-b-2 border-l-2 border-neon-cyan rounded-bl-xl" />
            </div>
        </div>
    );
};
