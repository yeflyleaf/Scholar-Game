import { useCallback, useState } from 'react';
import { useGameStore } from '../stores/useGameStore';

export interface BattleSequenceReturn {
  handleAnswerSubmit: (selectedIndex: number) => Promise<void>;
  statusMessage: string;
  isProcessing: boolean;
  selectedAnswerIndex: number | null;
  isCorrect: boolean | null;
}

export function useBattleSequence(): BattleSequenceReturn {
  const [statusMessage, setStatusMessage] = useState('等待输入...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const {
    currentQuestion,
    answerQuestion,
    battleState
  } = useGameStore();

  const handleAnswerSubmit = useCallback(
    async (selectedIndex: number) => {
      if (isProcessing || !currentQuestion || battleState !== 'PLAYER_TURN') return;

      setIsProcessing(true);
      setSelectedAnswerIndex(selectedIndex);

      const correctIndex = Array.isArray(currentQuestion.correctOptionIndex)
        ? currentQuestion.correctOptionIndex[0]
        : currentQuestion.correctOptionIndex;

      const correct = selectedIndex === correctIndex;
      setIsCorrect(correct);
      
      setStatusMessage(correct ? '逻辑验证通过' : '逻辑错误');

      // Wait for visual feedback
      setTimeout(() => {
          answerQuestion(selectedIndex);
          setIsProcessing(false);
          setSelectedAnswerIndex(null);
          setIsCorrect(null);
          setStatusMessage('等待输入...');
      }, 1000);
    },
    [isProcessing, currentQuestion, battleState, answerQuestion]
  );

  return {
    handleAnswerSubmit,
    statusMessage,
    isProcessing,
    selectedAnswerIndex,
    isCorrect,
  };
}
