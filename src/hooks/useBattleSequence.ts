// Hook：战斗序列 (useBattleSequence) - 处理战斗回合、答题逻辑和状态消息
import { useCallback, useEffect, useRef, useState } from "react";
import { useGameStore } from "../stores/useGameStore";

// 每题答题时间（秒）


export interface BattleSequenceReturn {
  handleAnswerSubmit: (selectedIndex: number) => void;
  statusMessage: string;
  isProcessing: boolean;
  selectedAnswerIndex: number | null;
  isCorrect: boolean | null;
  timeRemaining: number;
  isTimedOut: boolean;
  isPaused: boolean;
  togglePause: () => void;
}

export function useBattleSequence(): BattleSequenceReturn {
  const [statusMessage, setStatusMessage] = useState("等待输入...");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null
  );
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // 用于追踪当前问题的ID，检测问题切换
  const currentQuestionIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { currentQuestion, answerQuestion, battleState, settings } = useGameStore();

  // 根据难度计算答题时间
  const getQuestionTimeLimit = useCallback(() => {
    const baseTime = 30;
    const difficulty = settings.difficulty;
    
    switch (difficulty) {
      case 1: return baseTime + 20; // 50s
      case 2: return baseTime + 10; // 40s
      case 3: return baseTime;      // 30s
      case 4: return baseTime - 10; // 20s
      case 5: return baseTime - 15; // 15s
      default: return baseTime;
    }
  }, [settings.difficulty]);

  const [timeRemaining, setTimeRemaining] = useState(getQuestionTimeLimit());

  // 切换暂停状态
  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // 空格键快捷键切换暂停
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只在战斗界面且不在输入框中响应空格键
      if (e.code === 'Space' && battleState === 'PLAYER_TURN' && !isProcessing) {
        // 防止空格键的默认行为（如页面滚动）
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [battleState, isProcessing, togglePause]);

  // 清理计时器
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 处理超时 - 自动判定为错误答案
  const handleTimeout = useCallback(() => {
    if (isProcessing || !currentQuestion || battleState !== "PLAYER_TURN")
      return;

    clearTimer();
    setIsTimedOut(true);
    setIsProcessing(true);
    setSelectedAnswerIndex(-1); // -1 表示超时未选择
    setIsCorrect(false);
    setStatusMessage("⏰ 时间耗尽！");

    // 等待视觉反馈后触发敌人攻击
    setTimeout(() => {
      // 传入 -1 表示超时，answerQuestion 会处理为错误答案
      answerQuestion(-1);
      setIsProcessing(false);
      setSelectedAnswerIndex(null);
      setIsCorrect(null);
      setIsTimedOut(false);
      setTimeRemaining(getQuestionTimeLimit());
      setStatusMessage("等待输入...");
    }, 1000);
  }, [isProcessing, currentQuestion, battleState, answerQuestion, clearTimer, getQuestionTimeLimit]);

  // 倒计时逻辑
  useEffect(() => {
    // 检测新问题
    const questionId = currentQuestion?.id || null;

    // 如果问题变化，重置倒计时（使用 setTimeout 调度更新，避免同步 setState 警告）
    if (questionId !== currentQuestionIdRef.current) {
      currentQuestionIdRef.current = questionId;
      clearTimer();
      // 使用 queueMicrotask 调度状态更新，避免同步渲染警告
      queueMicrotask(() => {
        setTimeRemaining(getQuestionTimeLimit());
        setIsTimedOut(false);
      });
    }

    // 只在玩家回合且有问题且未暂停时启动计时器
    if (battleState === "PLAYER_TURN" && currentQuestion && !isProcessing && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // 时间到
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearTimer();
    }

    return () => clearTimer();
  }, [currentQuestion, battleState, isProcessing, isPaused, clearTimer, getQuestionTimeLimit]);

  // 监听 timeRemaining 变化，触发超时
  useEffect(() => {
    if (
      timeRemaining === 0 &&
      !isProcessing &&
      !isTimedOut &&
      battleState === "PLAYER_TURN"
    ) {
      // 使用 queueMicrotask 调度超时处理，避免同步渲染警告
      queueMicrotask(() => {
        handleTimeout();
      });
    }
  }, [timeRemaining, isProcessing, isTimedOut, battleState, handleTimeout]);

  const handleAnswerSubmit = useCallback(
    async (selectedIndex: number) => {
      if (isProcessing || !currentQuestion || battleState !== "PLAYER_TURN")
        return;

      // 停止计时器
      clearTimer();

      setIsProcessing(true);
      setSelectedAnswerIndex(selectedIndex);

      const userAnswers = [selectedIndex];
      const correctAnswers = Array.isArray(currentQuestion.correctOptionIndex)
        ? currentQuestion.correctOptionIndex
        : [currentQuestion.correctOptionIndex];

      const correct =
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((a) => correctAnswers.includes(a));

      setIsCorrect(correct);

      setStatusMessage(correct ? "逻辑验证通过" : "逻辑错误");

      // 等待视觉反馈
      setTimeout(() => {
        answerQuestion(selectedIndex);
        setIsProcessing(false);
        setSelectedAnswerIndex(null);
        setIsCorrect(null);
        setTimeRemaining(getQuestionTimeLimit());
        setStatusMessage("等待输入...");
      }, 1500);
    },
    [isProcessing, currentQuestion, battleState, answerQuestion, clearTimer, getQuestionTimeLimit]
  );

  return {
    handleAnswerSubmit,
    statusMessage,
    isProcessing,
    selectedAnswerIndex,
    isCorrect,
    timeRemaining,
    isTimedOut,
    isPaused,
    togglePause,
  };
}
