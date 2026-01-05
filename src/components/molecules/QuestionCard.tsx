import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckSquare, Clock, Code, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, GAME_CONFIG } from '../../lib/constants';
import { cn } from '../../lib/utils';
import type { Question } from '../../types';
import { CyberButton, GlitchText } from '../atoms';

interface QuestionCardProps {
  question: Question;
  onAnswer: (index: number) => void;
  disabled?: boolean;
  selectedIndex?: number | null;
  isCorrect?: boolean | null;
  timeRemaining?: number;
  isTimerWarning?: boolean;
  hasFlowState?: boolean; // 心流状态 - 隐藏2个错误选项
  className?: string;
}

const QuestionTypeIcon = ({ type }: { type: Question['type'] }) => {
  switch (type) {
    case 'Code':
      return <Code size={18} />;
    case 'Multi':
      return <CheckSquare size={18} />;
    case 'CaseAnalysis':
      return <AlertTriangle size={18} />;
    default:
      return <HelpCircle size={18} />;
  }
};

const questionTypeLabels: Record<string, string> = {
  Single: '单选题',
  Multi: '多选题',
  FillBlank: '填空题',
  TrueFalse: '判断题',
  CaseAnalysis: '案例分析',
  Code: '代码题',
};

export function QuestionCard({
  question,
  onAnswer,
  disabled = false,
  selectedIndex,
  isCorrect,
  timeRemaining = 30,
  isTimerWarning = false,
  hasFlowState = false,
  className,
}: QuestionCardProps) {
  const difficultyColor = DIFFICULTY_COLORS[question.difficulty];
  const [showObfuscation, setShowObfuscation] = useState(question.isObfuscated);

  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);

  // 心流状态：隐藏2个错误选项
  useEffect(() => {
    if (hasFlowState && question.options.length >= 4) {
      const correctIndex = Array.isArray(question.correctOptionIndex)
        ? question.correctOptionIndex[0]
        : question.correctOptionIndex;
      
      const wrongIndices = question.options
        .map((_, i) => i)
        .filter((i) => i !== correctIndex);
      
      // 随机选择2个错误选项隐藏
      const shuffled = wrongIndices.sort(() => Math.random() - 0.5);
      setTimeout(() => {
        setHiddenOptions(shuffled.slice(0, GAME_CONFIG.flowStateOptionsHidden));
      }, 0);
    } else {
      setTimeout(() => {
        setHiddenOptions([]);
      }, 0);
    }
  }, [hasFlowState, question]);

  // Timer progress
  const timerProgress = (timeRemaining / (question.timeLimit || 30)) * 100;

  return (
    <motion.div
      className={cn(
        'relative p-6 rounded-lg border-2 border-data-blue/50 bg-deep-void/90 backdrop-blur-md',
        'overflow-hidden',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Timer Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className={cn(
            'h-full transition-colors',
            isTimerWarning ? 'bg-warning-red' : 'bg-neon-green'
          )}
          initial={{ width: '100%' }}
          animate={{ width: `${timerProgress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Timer Display */}
      <motion.div
        className={cn(
          'absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full font-mono text-sm',
          isTimerWarning
            ? 'bg-warning-red/20 text-warning-red'
            : 'bg-neon-green/20 text-neon-green'
        )}
        animate={isTimerWarning ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: isTimerWarning ? Infinity : 0 }}
      >
        <Clock size={16} />
        <span>{timeRemaining}s</span>
      </motion.div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-data-blue">
            <QuestionTypeIcon type={question.type} />
          </span>
          <span className="text-xs font-mono text-gray-400 uppercase">
            {questionTypeLabels[question.type] || question.type}
          </span>
          
          {/* 心流状态指示 */}
          {hasFlowState && (
            <motion.span
              className="ml-2 px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-mono"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ✨ 心流加持
            </motion.span>
          )}
        </div>

        {/* Difficulty indicator */}
        <motion.div className="flex items-center gap-2" style={{ color: difficultyColor }}>
          <span className="text-xs font-mono uppercase">
            {DIFFICULTY_LABELS[question.difficulty]}
          </span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <motion.div
                key={level}
                className="w-2 h-2 rounded-sm"
                style={{
                  backgroundColor: level <= question.difficulty ? difficultyColor : '#333',
                }}
                animate={
                  level <= question.difficulty
                    ? {
                        boxShadow: [
                          `0 0 3px ${difficultyColor}`,
                          `0 0 8px ${difficultyColor}`,
                          `0 0 3px ${difficultyColor}`,
                        ],
                      }
                    : {}
                }
                transition={{ duration: 1.5, repeat: Infinity, delay: level * 0.1 }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Question text */}
      <div className="mb-6 relative">
        {showObfuscation ? (
          <div className="relative">
            <div className="blur-sm select-none">
              <GlitchText intensity="high" className="text-lg font-mono text-white leading-relaxed">
                {question.text}
              </GlitchText>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => setShowObfuscation(false)}
                className="px-4 py-2 bg-warning-red/20 border border-warning-red rounded font-mono text-sm text-warning-red hover:bg-warning-red/30 transition-colors"
              >
                <Eye className="inline mr-2" size={16} />
                使用去噪工具
              </button>
            </div>
          </div>
        ) : (
          <GlitchText intensity="low" className="text-lg font-mono text-white leading-relaxed">
            {question.text}
          </GlitchText>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {question.options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const correctIndex = Array.isArray(question.correctOptionIndex)
              ? question.correctOptionIndex[0]
              : question.correctOptionIndex;
            const isCorrectOption = index === correctIndex;
            const showResult = selectedIndex !== null;
            const isHidden = hiddenOptions.includes(index);

            // 隐藏选项（心流状态）
            if (isHidden && !showResult) {
              return (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 0.5, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-full px-4 py-3 rounded border-2 border-dashed border-gray-700 bg-gray-900/50 text-gray-600 font-mono text-sm flex items-center gap-2">
                    <EyeOff size={16} />
                    <span>选项已排除</span>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: isSelected && isCorrect === true ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  delay: index * 0.1,
                  type: isSelected && isCorrect === true ? 'tween' : 'spring',
                }}
              >
                <CyberButton
                  variant={
                    showResult && isCorrectOption
                      ? 'primary'
                      : showResult && isSelected && !isCorrectOption
                      ? 'danger'
                      : 'secondary'
                  }
                  onClick={() => onAnswer(index)}
                  disabled={disabled || showObfuscation}
                  className={cn(
                    'w-full text-left justify-start',
                    showResult && isCorrectOption && 'ring-2 ring-neon-green',
                    showResult && isSelected && !isCorrectOption && 'ring-2 ring-warning-red'
                  )}
                >
                  <span className="mr-2 opacity-60">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </CyberButton>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Result feedback */}
      {selectedIndex !== null && isCorrect !== null && (
        <motion.div
          className={cn(
            'mt-4 p-3 rounded font-mono text-sm',
            isCorrect ? 'bg-neon-green/20 text-neon-green' : 'bg-warning-red/20 text-warning-red'
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isCorrect ? '✓ 回答正确！' : '✗ 回答错误'}
          {!isCorrect && question.explanation && (
            <p className="mt-2 text-xs text-gray-400">{question.explanation}</p>
          )}
        </motion.div>
      )}

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,240,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,240,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-data-blue/50" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-data-blue/50" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-data-blue/50" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-data-blue/50" />
      </div>

      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        animate={{
          boxShadow: [
            'inset 0 0 30px rgba(0,240,255,0.1)',
            'inset 0 0 50px rgba(0,240,255,0.2)',
            'inset 0 0 30px rgba(0,240,255,0.1)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
}
