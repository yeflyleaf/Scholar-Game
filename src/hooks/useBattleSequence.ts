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
    resolveTurn,
    addDamageIndicator,
    addBattleLog,
    incrementCorrectStreak,
    resetCorrectStreak,
    checkMultiCoreActivation,
    addWrongAnswer,
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

  // Handle timeout
  useEffect(() => {
    if (timer.timeRemaining === 0 && timer.isRunning && phase === 'PLAYER_TURN' && !isProcessing) {
      handleTimeout();
    }
  }, [timer.timeRemaining, timer.isRunning, phase, isProcessing]);

  /**
   * Handle question timeout
   */
  const handleTimeout = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    stopTimer();
    setStatusMessage('时间到！系统过载...');
    addBattleLog('⏱️ 超时！全队过载增加！', 'overload');

    // 超时：全队增加过载
    for (const char of livingParty) {
      increaseOverload(char.id, GAME_CONFIG.overloadOnTimeout);
    }

    await delay(800);

    // 重置连击
    resetCorrectStreak();

    // 进入敌方回合
    setStatusMessage('敌方回合...');
    resolveTurn();

    setIsProcessing(false);
    setSelectedAnswerIndex(null);
    setIsCorrect(null);
  }, [isProcessing, livingParty, stopTimer, increaseOverload, resolveTurn, addBattleLog, resetCorrectStreak]);

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

        await delay(500);

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
            resetCorrectStreak(); // 使用后重置
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

        await delay(800);

        // 检查是否胜利
        const allEnemiesDead = enemies.every(
          (e) => e.hp <= 0 || (e.id === target?.id && target.hp - damage <= 0)
        );
        if (!allEnemiesDead) {
          setStatusMessage('敌方回合...');
          resolveTurn();
        }
      } else {
        // === 错误答案 ===
        setStatusMessage('错误！系统过载...');
        addBattleLog('✗ 回答错误！系统遭受反噬...', 'damage');

        // 记录错题
        addWrongAnswer(currentQuestion);

        // 重置连击
        resetCorrectStreak();

        await delay(500);

        // 检查护盾效果
        const target = getRandomItem(livingParty);
        if (target) {
          const hasShield = target.statusEffects.some((e) => e.effect === 'shield');

          if (hasShield) {
            addBattleLog(`🛡️ 异常拦截生效！过载增加被抵消！`, 'skill');
            // 移除护盾效果
            const shieldEffect = target.statusEffects.find((e) => e.effect === 'shield');
            if (shieldEffect) {
              useGameStore.getState().removeStatusEffect(target.id, shieldEffect.id);
            }
          } else {
            increaseOverload(target.id, GAME_CONFIG.overloadOnWrongAnswer);
          }
        }

        await delay(500);

        // 敌人反击
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

        await delay(800);

        // 检查是否失败
        const allPartyDead = party.every((c) => c.hp <= 0);
        if (!allPartyDead) {
          setStatusMessage('敌方回合...');
          resolveTurn();
        }
      }

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
      party,
      enemies,
      attackEnemy,
      takeDamage,
      increaseOverload,
      resolveTurn,
      addDamageIndicator,
      addBattleLog,
      incrementCorrectStreak,
      resetCorrectStreak,
      checkMultiCoreActivation,
      addWrongAnswer,
      stopTimer,
    ]
  );

  /**
   * Skip player turn (DDOS Attack)
   */
  const skipTurn = useCallback(() => {
    if (phase !== 'PLAYER_TURN' || isProcessing) return;

    stopTimer();
    setStatusMessage('跳过回合...');
    addBattleLog('玩家跳过回合', 'system');
    resetCorrectStreak();
    resolveTurn();
  }, [phase, isProcessing, resolveTurn, addBattleLog, resetCorrectStreak, stopTimer]);

  /**
   * Handle enemy turn automatically
   */
  useEffect(() => {
    if (phase !== 'ENEMY_TURN') return;

    const executeEnemyTurn = async () => {
      setIsProcessing(true);
      setStatusMessage('系统拦截中...');

      await delay(GAME_CONFIG.enemyTurnDelay);

      // 选择未眩晕的敌人
      const activeEnemies = livingEnemies.filter((e) => !e.isStunned);
      const attacker = getRandomItem(activeEnemies);

      if (!attacker) {
        // 所有敌人都被眩晕
        addBattleLog('所有敌人处于眩晕状态！', 'system');
        resolveTurn();
        setIsProcessing(false);
        return;
      }

      const target = getRandomItem(livingParty);
      if (!target) {
        resolveTurn();
        setIsProcessing(false);
        return;
      }

      setStatusMessage(`${attacker.name} 正在攻击...`);
      addBattleLog(`${attacker.name} 发起攻击！`, 'info');

      await delay(500);

      takeDamage(target.id, attacker.damage);

      addDamageIndicator({
        value: attacker.damage,
        x: 25,
        y: 40,
        type: 'damage',
      });

      setStatusMessage(`${attacker.name} 对 ${target.name} 造成 ${attacker.damage} 点伤害！`);

      await delay(800);

      const allPartyDead = party.every((c) => c.hp <= 0);
      if (!allPartyDead) {
        resolveTurn();
        setStatusMessage('选择你的答案...');
      }

      setIsProcessing(false);
    };

    executeEnemyTurn();
  }, [phase, livingEnemies, livingParty, party, takeDamage, resolveTurn, addDamageIndicator, addBattleLog]);

  // Update status based on game state
  useEffect(() => {
    if (phase === 'WIN') {
      setStatusMessage('胜利！病毒已清除！');
    } else if (phase === 'LOSE') {
      setStatusMessage('系统崩溃...游戏结束');
    } else if (phase === 'PLAYER_TURN' && !isProcessing) {
      setStatusMessage('选择你的答案...');
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
