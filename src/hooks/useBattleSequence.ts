import { useCallback, useEffect, useMemo, useState } from 'react';
import { DIFFICULTY_DAMAGE, GAME_CONFIG } from '../lib/constants';
import { delay, getRandomItem } from '../lib/utils';
import { useGameStore } from '../stores';

export interface BattleSequenceReturn {
  handleAnswerSubmit: (selectedIndex: number) => Promise<void>;
  skipTurn: () => void;
  statusMessage: string;
  isProcessing: boolean;
  selectedAnswerIndex: number | null;
  isCorrect: boolean | null;
  timeRemaining: number;
  isTimerWarning: boolean;
}

export function useBattleSequence(): BattleSequenceReturn {
  const [statusMessage, setStatusMessage] = useState('选择你的答案...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const {
    party,
    enemies,
    phase,
    currentQuestion,
    timer,
    tickTimer,
    stopTimer,
    attackEnemy,
    takeDamage,
    increaseOverload,
    setPhase,
    addDamageIndicator,
    addBattleLog,
    incrementCorrectStreak,
    resetCorrectStreak,
    checkMultiCoreActivation,
    addWrongAnswer,
    nextQuestion,
    setCurrentQuestion,
  } = useGameStore();

  // Get living characters and enemies
  const livingParty = useMemo(() => party.filter((c) => c.hp > 0 && !c.isDisabled), [party]);
  const livingEnemies = useMemo(() => enemies.filter((e) => e.hp > 0), [enemies]);

  // Timer tick effect
  useEffect(() => {
    if (!timer.isRunning || phase !== 'PLAYER_TURN') return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.isRunning, phase, tickTimer]);

  /**
   * Proceed to next question after answer is processed
   */
  const proceedToNextQuestion = useCallback(async () => {
    // 检查战斗是否结束
    const allEnemiesDead = enemies.every((e) => e.hp <= 0);
    const allPartyDead = party.every((c) => c.hp <= 0);

    if (allEnemiesDead) {
      setPhase('WIN');
      setStatusMessage('胜利！概念体已收割！');
      return;
    }

    if (allPartyDead) {
      setPhase('LOSE');
      setStatusMessage('装甲崩溃...狩猎失败');
      return;
    }

    // 获取下一题
    setStatusMessage('选择你的答案...');
    nextQuestion();
  }, [enemies, party, setPhase, nextQuestion]);

  /**
   * Handle question timeout
   */
  const handleTimeout = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    stopTimer();
    setStatusMessage('时间到！熵值增加...');
    addBattleLog('⏱️ 超时！全队过载增加！', 'overload');

    // 超时：全队增加过载
    for (const char of livingParty) {
      increaseOverload(char.id, GAME_CONFIG.overloadOnTimeout);
    }

    // 超时也算敌人攻击一次
    const attacker = getRandomItem(livingEnemies);
    const victim = getRandomItem(livingParty);
    if (attacker && victim) {
      takeDamage(victim.id, attacker.damage);
      addDamageIndicator({
        value: attacker.damage,
        x: 25,
        y: 50,
        type: 'damage',
      });
    }

    // 重置连击
    resetCorrectStreak();

    await delay(1000);

    // 进入下一题
    await proceedToNextQuestion();

    setIsProcessing(false);
    setSelectedAnswerIndex(null);
    setIsCorrect(null);
  }, [isProcessing, livingParty, livingEnemies, stopTimer, increaseOverload, takeDamage, addBattleLog, resetCorrectStreak, addDamageIndicator, proceedToNextQuestion]);

  // Handle timeout
  useEffect(() => {
    if (timer.timeRemaining === 0 && timer.isRunning && phase === 'PLAYER_TURN' && !isProcessing) {
      const timeoutId = setTimeout(() => {
        handleTimeout();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [timer.timeRemaining, timer.isRunning, phase, isProcessing, handleTimeout]);

  /**
   * Handle player submitting an answer
   */
  const handleAnswerSubmit = useCallback(
    async (selectedIndex: number) => {
      if (phase !== 'PLAYER_TURN' || isProcessing || !currentQuestion) {
        return;
      }

      setIsProcessing(true);
      stopTimer();
      setSelectedAnswerIndex(selectedIndex);

      const correctIndex = Array.isArray(currentQuestion.correctOptionIndex)
        ? currentQuestion.correctOptionIndex[0]
        : currentQuestion.correctOptionIndex;

      const correct = selectedIndex === correctIndex;
      setIsCorrect(correct);

      if (correct) {
        // === 正确答案 ===
        setStatusMessage('正确！发起攻击...');
        addBattleLog('✓ 回答正确！', 'info');

        // 增加连击计数
        incrementCorrectStreak();

        await delay(600);

        // 计算伤害
        let damage = DIFFICULTY_DAMAGE[currentQuestion.difficulty] || GAME_CONFIG.baseDamage;

        // 检查心流状态（灵光一现）
        const activeChar = livingParty[0];
        const flowState = activeChar?.statusEffects.find((e) => e.effect === 'flow_state');
        if (flowState) {
          damage *= flowState.value;
          addBattleLog(`💫 心流状态！伤害翻倍！`, 'optimization');
        }

        // 检查多核运算是否激活
        const isMultiCore = checkMultiCoreActivation();

        // 选择目标
        const target = livingEnemies[0];
        if (target) {
          if (isMultiCore) {
            // AOE攻击
            attackEnemy(target.id, damage, true);
            resetCorrectStreak();
          } else {
            attackEnemy(target.id, damage);
            addDamageIndicator({
              value: damage,
              x: 70,
              y: 30,
              type: flowState ? 'critical' : 'damage',
            });
          }

          setStatusMessage(`对 ${target.name} 造成 ${damage} 点伤害！`);
        }

        await delay(1000);

      } else {
        // === 错误答案 ===
        setStatusMessage('错误！遭到反噬...');
        addBattleLog('✗ 回答错误！遭到概念体反噬...', 'damage');

        // 记录错题
        addWrongAnswer(currentQuestion);

        // 重置连击
        resetCorrectStreak();

        await delay(600);

        // 检查护盾效果
        const target = getRandomItem(livingParty);
        if (target) {
          const hasShield = target.statusEffects.some((e) => e.effect === 'shield');

          if (hasShield) {
            addBattleLog(`🛡️ 异常拦截生效！过载增加被抵消！`, 'skill');
            const shieldEffect = target.statusEffects.find((e) => e.effect === 'shield');
            if (shieldEffect) {
              useGameStore.getState().removeStatusEffect(target.id, shieldEffect.id);
            }
          } else {
            increaseOverload(target.id, GAME_CONFIG.overloadOnWrongAnswer);
          }
        }

        // 敌人对玩家造成伤害
        const attacker = getRandomItem(livingEnemies);
        const victim = getRandomItem(livingParty);

        if (attacker && victim) {
          takeDamage(victim.id, attacker.damage);

          addDamageIndicator({
            value: attacker.damage,
            x: 25,
            y: 50,
            type: 'damage',
          });

          setStatusMessage(`${attacker.name} 对 ${victim.name} 造成 ${attacker.damage} 点伤害！`);
        }

        await delay(1000);
      }

      // 进入下一题
      await proceedToNextQuestion();

      setIsProcessing(false);
      setSelectedAnswerIndex(null);
      setIsCorrect(null);
    },
    [
      phase,
      isProcessing,
      currentQuestion,
      livingEnemies,
      livingParty,
      attackEnemy,
      takeDamage,
      increaseOverload,
      addDamageIndicator,
      addBattleLog,
      incrementCorrectStreak,
      resetCorrectStreak,
      checkMultiCoreActivation,
      addWrongAnswer,
      stopTimer,
      proceedToNextQuestion,
    ]
  );

  /**
   * Skip player turn (DDOS Attack)
   */
  const skipTurn = useCallback(async () => {
    if (phase !== 'PLAYER_TURN' || isProcessing) return;

    setIsProcessing(true);
    stopTimer();
    setStatusMessage('跳过回合...');
    addBattleLog('使用DDOS攻击跳过此题', 'system');
    resetCorrectStreak();

    await delay(500);
    await proceedToNextQuestion();

    setIsProcessing(false);
  }, [phase, isProcessing, stopTimer, addBattleLog, resetCorrectStreak, proceedToNextQuestion]);

  // Update status based on game state
  useEffect(() => {
    let targetMessage = '';
    if (phase === 'WIN') {
      targetMessage = '胜利！概念体已收割！';
    } else if (phase === 'LOSE') {
      targetMessage = '装甲崩溃...狩猎失败';
    } else if (phase === 'PLAYER_TURN' && !isProcessing) {
      targetMessage = '选择你的答案...';
    }

    if (targetMessage) {
      const timeoutId = setTimeout(() => {
        setStatusMessage((prev) => (prev !== targetMessage ? targetMessage : prev));
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [phase, isProcessing]);

  return {
    handleAnswerSubmit,
    skipTurn,
    statusMessage,
    isProcessing,
    selectedAnswerIndex,
    isCorrect,
    timeRemaining: timer.timeRemaining,
    isTimerWarning: timer.timeRemaining <= 10,
  };
}
