import { create } from 'zustand';
import {
    createInitialEnemies,
    createInitialParty,
    DEFAULT_ITEMS,
    DEMO_KNOWLEDGE_NODES,
    GAME_CONFIG,
    SAMPLE_QUESTIONS
} from '../lib/constants';
import { generateId } from '../lib/utils';
import type {
    BattleLogEntry,
    BattleState,
    Character,
    CyberItem,
    DamageIndicator,
    Enemy,
    GameProgress,
    GameScreen,
    KnowledgeNode,
    OverloadResult,
    Question,
    StatusEffect,
    TimerState,
} from '../types';

interface GameState {
  // === Screen & Navigation ===
  currentScreen: GameScreen;
  setScreen: (screen: GameScreen) => void;

  // === Knowledge Grid ===
  knowledgeNodes: KnowledgeNode[];
  currentNode: KnowledgeNode | null;
  selectNode: (nodeId: string) => void;
  completeNode: (nodeId: string) => void;

  // === Party & Enemies ===
  party: Character[];
  enemies: Enemy[];
  activeCharacterId: string | null;
  selectedTargetId: string | null;

  // === Battle State ===
  currentTurn: number;
  phase: BattleState;
  currentQuestion: Question | null;
  questionQueue: Question[];
  correctStreak: number; // 连续答对计数

  // === Timer ===
  timer: TimerState;
  startTimer: (seconds: number) => void;
  tickTimer: () => void;
  stopTimer: () => void;

  // === Inventory ===
  items: CyberItem[];
  useItem: (itemId: string) => void;

  // === Visual Effects ===
  damageIndicators: DamageIndicator[];
  battleLog: BattleLogEntry[];
  isScreenShaking: boolean;
  showGlitchEffect: boolean;
  showGoldGlow: string | null; // characterId for gold glow
  showCyberpsychosis: string | null; // characterId

  // === Game Progress ===
  progress: GameProgress;

  // === Actions - Setters ===
  setParty: (party: Character[]) => void;
  setEnemies: (enemies: Enemy[]) => void;
  setPhase: (phase: BattleState) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setActiveCharacter: (charId: string | null) => void;
  setSelectedTarget: (targetId: string | null) => void;

  // === Actions - Combat ===
  attackEnemy: (targetId: string, damage: number, isAOE?: boolean) => void;
  takeDamage: (targetId: string, amount: number) => void;
  increaseOverload: (targetId: string, amount: number) => void;
  decreaseOverload: (targetId: string, amount: number) => void;
  healCharacter: (targetId: string, amount: number) => void;
  applyStatusEffect: (targetId: string, effect: StatusEffect) => void;
  removeStatusEffect: (targetId: string, effectId: string) => void;
  stunEnemy: (enemyId: string, duration: number) => void;

  // === Actions - Overload System ===
  triggerOverloadCheck: (characterId: string) => OverloadResult;
  applyCyberpsychosis: (characterId: string) => void;
  applyOptimization: (characterId: string) => void;

  // === Actions - Skills ===
  useSkill: (characterId: string, skillId: string, targetId?: string) => void;
  updateSkillCooldowns: () => void;

  // === Actions - Passive Abilities ===
  incrementCorrectStreak: () => void;
  resetCorrectStreak: () => void;
  checkMultiCoreActivation: () => boolean;

  // === Actions - Turn Management ===
  resolveTurn: () => void;
  nextTurn: () => void;
  nextQuestion: () => void;

  // === Actions - Visual Effects ===
  addDamageIndicator: (indicator: Omit<DamageIndicator, 'id' | 'timestamp'>) => void;
  removeDamageIndicator: (id: string) => void;
  addBattleLog: (message: string, type: BattleLogEntry['type']) => void;
  triggerScreenShake: () => void;
  triggerGlitchEffect: () => void;
  setGoldGlow: (characterId: string | null) => void;

  // === Actions - Game Flow ===
  startBattle: (nodeId?: string) => void;
  endBattle: (victory: boolean) => void;
  resetBattle: () => void;
  resetGame: () => void;

  // === Actions - Wrong Answer Tracking ===
  addWrongAnswer: (question: Question) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // === Initial State ===
  currentScreen: 'TITLE',
  knowledgeNodes: DEMO_KNOWLEDGE_NODES,
  currentNode: null,
  party: createInitialParty(),
  enemies: createInitialEnemies(),
  activeCharacterId: null,
  selectedTargetId: null,
  currentTurn: 1,
  phase: 'PLAYER_TURN',
  currentQuestion: SAMPLE_QUESTIONS[0],
  questionQueue: [...SAMPLE_QUESTIONS],
  correctStreak: 0,
  timer: {
    isRunning: false,
    timeRemaining: 30,
    totalTime: 30,
  },
  items: [...DEFAULT_ITEMS],
  damageIndicators: [],
  battleLog: [],
  isScreenShaking: false,
  showGlitchEffect: false,
  showGoldGlow: null,
  showCyberpsychosis: null,
  progress: {
    currentChapter: 1,
    completedNodes: [],
    totalExp: 0,
    itemsCollected: [],
    wrongAnswers: [],
    correctStreak: 0,
    totalQuestions: 0,
    correctAnswers: 0,
  },

  // === Screen Navigation ===
  setScreen: (screen) => set({ currentScreen: screen }),

  // === Knowledge Grid ===
  selectNode: (nodeId) => {
    const node = get().knowledgeNodes.find((n) => n.id === nodeId);
    if (node && node.status === 'available') {
      set({ currentNode: node });
    }
  },

  completeNode: (nodeId) => {
    const nodes = get().knowledgeNodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, status: 'completed' as const, isCompleted: true };
      }
      // Unlock nodes that have this as prerequisite
      if (node.prerequisites.includes(nodeId) && node.status === 'locked') {
        const allPrereqsMet = node.prerequisites.every((prereq) =>
          prereq === nodeId ||
          get().knowledgeNodes.find((n) => n.id === prereq)?.isCompleted
        );
        if (allPrereqsMet) {
          return { ...node, status: 'available' as const };
        }
      }
      return node;
    });

    set({
      knowledgeNodes: nodes,
      progress: {
        ...get().progress,
        completedNodes: [...get().progress.completedNodes, nodeId],
      },
    });
  },

  // === Setters ===
  setParty: (party) => set({ party }),
  setEnemies: (enemies) => set({ enemies }),
  setPhase: (phase) => set({ phase }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setActiveCharacter: (charId) => set({ activeCharacterId: charId }),
  setSelectedTarget: (targetId) => set({ selectedTargetId: targetId }),

  // === Timer ===
  startTimer: (seconds) =>
    set({
      timer: {
        isRunning: true,
        timeRemaining: seconds,
        totalTime: seconds,
      },
    }),

  tickTimer: () => {
    const { timer } = get();
    if (timer.isRunning && timer.timeRemaining > 0) {
      set({
        timer: {
          ...timer,
          timeRemaining: timer.timeRemaining - 1,
        },
      });
    }
  },

  stopTimer: () =>
    set((state) => ({
      timer: { ...state.timer, isRunning: false },
    })),

  // === Combat Actions ===
  attackEnemy: (targetId, damage, isAOE = false) => {
    const state = get();

    if (isAOE) {
      // AOE攻击所有敌人
      const updatedEnemies = state.enemies.map((enemy) => {
        if (enemy.hp > 0) {
          const newHp = Math.max(0, enemy.hp - damage);
          get().addDamageIndicator({
            value: damage,
            x: 70 + Math.random() * 10,
            y: 30 + Math.random() * 20,
            type: 'critical',
            text: '多核运算!',
          });
          return { ...enemy, hp: newHp };
        }
        return enemy;
      });

      const allDead = updatedEnemies.every((e) => e.hp <= 0);
      set({
        enemies: updatedEnemies,
        phase: allDead ? 'WIN' : state.phase,
      });

      get().addBattleLog(`多核运算发动! 对所有敌人造成 ${damage} 点伤害！`, 'critical');
    } else {
      const updatedEnemies = state.enemies.map((enemy) => {
        if (enemy.id === targetId) {
          const newHp = Math.max(0, enemy.hp - damage);
          return { ...enemy, hp: newHp };
        }
        return enemy;
      });

      const allDead = updatedEnemies.every((e) => e.hp <= 0);

      set({
        enemies: updatedEnemies,
        phase: allDead ? 'WIN' : state.phase,
      });

      const enemy = state.enemies.find((e) => e.id === targetId);
      if (enemy) {
        get().addBattleLog(`对 ${enemy.name} 造成 ${damage} 点伤害！`, 'damage');
      }
    }
  },

  takeDamage: (targetId, amount) => {
    const state = get();
    const updatedParty = state.party.map((char) => {
      if (char.id === targetId) {
        const newHp = Math.max(0, char.hp - amount);
        return { ...char, hp: newHp };
      }
      return char;
    });

    const allDead = updatedParty.every((c) => c.hp <= 0);

    set({
      party: updatedParty,
      phase: allDead ? 'LOSE' : state.phase,
    });

    get().triggerScreenShake();

    const char = state.party.find((c) => c.id === targetId);
    if (char) {
      get().addBattleLog(`${char.name} 受到 ${amount} 点伤害！`, 'damage');
    }
  },

  increaseOverload: (targetId, amount) => {
    const state = get();
    let finalAmount = amount;

    // 档案馆员被动：过载伤害减少20%
    const target = state.party.find((c) => c.id === targetId);
    if (target?.role === 'Archivist') {
      finalAmount = Math.floor(amount * (1 - GAME_CONFIG.archivistOverloadReduction));
      get().addBattleLog(`只读存储生效，过载减少 ${amount - finalAmount}！`, 'skill');
    }

    const updatedParty = state.party.map((char) => {
      if (char.id === targetId) {
        const newOverload = Math.min(100, char.overload + finalAmount);

        // 检查是否达到过载阈值
        if (newOverload >= GAME_CONFIG.overloadThreshold && char.overload < GAME_CONFIG.overloadThreshold) {
          // 延迟触发过载检查
          setTimeout(() => {
            get().triggerOverloadCheck(targetId);
          }, 500);
        }

        return { ...char, overload: newOverload };
      }
      return char;
    });

    set({ party: updatedParty });

    if (target) {
      get().addBattleLog(`${target.name} 过载值增加 ${finalAmount}！`, 'overload');
      get().addDamageIndicator({
        value: finalAmount,
        x: 25,
        y: 40,
        type: 'overload',
      });
    }
  },

  decreaseOverload: (targetId, amount) => {
    const state = get();
    const updatedParty = state.party.map((char) => {
      if (char.id === targetId) {
        const newOverload = Math.max(0, char.overload - amount);
        return { ...char, overload: newOverload };
      }
      return char;
    });

    set({ party: updatedParty });
  },

  healCharacter: (targetId, amount) => {
    const state = get();
    const updatedParty = state.party.map((char) => {
      if (char.id === targetId) {
        const newHp = Math.min(char.maxHp, char.hp + amount);
        return { ...char, hp: newHp };
      }
      return char;
    });

    set({ party: updatedParty });

    const char = state.party.find((c) => c.id === targetId);
    if (char) {
      get().addBattleLog(`${char.name} 恢复 ${amount} 点生命！`, 'heal');
    }
  },

  applyStatusEffect: (targetId, effect) => {
    const updatedParty = get().party.map((char) => {
      if (char.id === targetId) {
        return {
          ...char,
          statusEffects: [...char.statusEffects, effect],
        };
      }
      return char;
    });
    set({ party: updatedParty });
  },

  removeStatusEffect: (targetId, effectId) => {
    const updatedParty = get().party.map((char) => {
      if (char.id === targetId) {
        return {
          ...char,
          statusEffects: char.statusEffects.filter((e) => e.id !== effectId),
        };
      }
      return char;
    });
    set({ party: updatedParty });
  },

  stunEnemy: (enemyId, duration) => {
    const updatedEnemies = get().enemies.map((enemy) => {
      if (enemy.id === enemyId) {
        return { ...enemy, isStunned: true, stunDuration: duration };
      }
      return enemy;
    });
    set({ enemies: updatedEnemies });
    get().addBattleLog(`敌人被眩晕 ${duration} 回合！`, 'skill');
  },

  // === Overload System ===
  triggerOverloadCheck: (characterId) => {
    const char = get().party.find((c) => c.id === characterId);
    if (!char || char.overload < 100) return null;

    const roll = Math.random();
    const result: OverloadResult =
      roll < GAME_CONFIG.cyberpsychosisChance ? 'cyberpsychosis' : 'optimization';

    if (result === 'cyberpsychosis') {
      get().applyCyberpsychosis(characterId);
    } else {
      get().applyOptimization(characterId);
    }

    return result;
  },

  applyCyberpsychosis: (characterId) => {
    get().triggerGlitchEffect();
    set({ showCyberpsychosis: characterId });

    const symptoms: Array<'command_refuse' | 'random_answer' | 'despair'> = [
      'command_refuse',
      'random_answer',
      'despair',
    ];
    const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];

    const effect: StatusEffect = {
      id: generateId('effect'),
      name: '赛博精神病',
      duration: 3,
      type: 'debuff',
      effect: 'cyberpsychosis',
      value: 0,
      symptom,
    };

    get().applyStatusEffect(characterId, effect);

    const symptomText = {
      command_refuse: '拒绝指令',
      random_answer: '乱选',
      despair: '绝望',
    };

    get().addBattleLog(
      `⚠️ 赛博精神病发作！症状: ${symptomText[symptom]}`,
      'cyberpsychosis'
    );

    // 如果是拒绝指令，禁用该角色
    if (symptom === 'command_refuse') {
      const updatedParty = get().party.map((char) => {
        if (char.id === characterId) {
          return { ...char, isDisabled: true };
        }
        return char;
      });
      set({ party: updatedParty });
    }

    setTimeout(() => {
      set({ showCyberpsychosis: null });
    }, 3000);
  },

  applyOptimization: (characterId) => {
    set({ showGoldGlow: characterId });

    const effect: StatusEffect = {
      id: generateId('effect'),
      name: '心流状态',
      duration: GAME_CONFIG.flowStateDuration,
      type: 'buff',
      effect: 'flow_state',
      value: GAME_CONFIG.flowStateDamageMultiplier,
    };

    get().applyStatusEffect(characterId, effect);
    get().addBattleLog(
      `✨ 灵光一现！进入心流状态，接下来 ${GAME_CONFIG.flowStateDuration} 回合伤害翻倍！`,
      'optimization'
    );

    // 重置过载值
    const updatedParty = get().party.map((char) => {
      if (char.id === characterId) {
        return { ...char, overload: 0 };
      }
      return char;
    });
    set({ party: updatedParty });

    setTimeout(() => {
      set({ showGoldGlow: null });
    }, 5000);
  },

  // === Skills ===
  useSkill: (characterId, skillId, targetId) => {
    const char = get().party.find((c) => c.id === characterId);
    if (!char) return;

    const skill = char.skills.find((s) => s.id === skillId);
    if (!skill || skill.currentCooldown > 0) return;

    // 设置技能冷却
    const updatedParty = get().party.map((c) => {
      if (c.id === characterId) {
        return {
          ...c,
          skills: c.skills.map((s) => {
            if (s.id === skillId) {
              return { ...s, currentCooldown: s.cooldown };
            }
            return s;
          }),
        };
      }
      return c;
    });
    set({ party: updatedParty });

    get().addBattleLog(`${char.name} 使用了 ${skill.name}！`, 'skill');

    // 执行技能效果
    switch (skillId) {
      case 'brute-force':
        if (targetId) {
          const damage = GAME_CONFIG.baseDamage * 1.5;
          get().attackEnemy(targetId, damage);
          get().addDamageIndicator({
            value: damage,
            x: 70,
            y: 30,
            type: 'critical',
            text: '暴力破解!',
          });
        }
        break;

      case 'index-search':
        if (targetId) {
          get().stunEnemy(targetId, 1);
        }
        break;

      case 'exception-catch':
        if (targetId) {
          const shieldEffect: StatusEffect = {
            id: generateId('shield'),
            name: '异常拦截',
            duration: 2,
            type: 'buff',
            effect: 'shield',
            value: 1,
          };
          get().applyStatusEffect(targetId, shieldEffect);
          get().addBattleLog(`护盾已施加，将抵消一次过载增加！`, 'skill');
        }
        break;
    }
  },

  updateSkillCooldowns: () => {
    const updatedParty = get().party.map((char) => ({
      ...char,
      skills: char.skills.map((skill) => ({
        ...skill,
        currentCooldown: Math.max(0, skill.currentCooldown - 1),
      })),
    }));
    set({ party: updatedParty });
  },

  // === Passive Abilities ===
  incrementCorrectStreak: () => {
    const newStreak = get().correctStreak + 1;
    set({ correctStreak: newStreak });

    // 检查逻辑引擎的多核运算是否激活
    if (newStreak >= GAME_CONFIG.comboThreshold) {
      const updatedParty = get().party.map((char) => {
        if (char.role === 'LogicEngine') {
          return {
            ...char,
            passiveAbility: {
              ...char.passiveAbility,
              isActive: true,
              stacks: newStreak,
            },
          };
        }
        return char;
      });
      set({ party: updatedParty });
      get().addBattleLog(`🔥 多核运算激活！下次攻击变为AOE！`, 'skill');
    }
  },

  resetCorrectStreak: () => {
    set({ correctStreak: 0 });
    const updatedParty = get().party.map((char) => {
      if (char.role === 'LogicEngine') {
        return {
          ...char,
          passiveAbility: {
            ...char.passiveAbility,
            isActive: false,
            stacks: 0,
          },
        };
      }
      return char;
    });
    set({ party: updatedParty });
  },

  checkMultiCoreActivation: () => {
    const logicEngine = get().party.find((c) => c.role === 'LogicEngine');
    return logicEngine?.passiveAbility.isActive ?? false;
  },

  // === Turn Management ===
  resolveTurn: () => {
    const state = get();
    if (state.phase === 'PLAYER_TURN') {
      set({ phase: 'ENEMY_TURN' });
    } else if (state.phase === 'ENEMY_TURN') {
      set({ phase: 'PLAYER_TURN' });
      get().nextTurn();
    }
  },

  nextTurn: () => {
    const state = get();

    // 更新技能冷却
    get().updateSkillCooldowns();

    // 更新敌人眩晕状态
    const updatedEnemies = state.enemies.map((enemy) => {
      if (enemy.isStunned && enemy.stunDuration > 0) {
        const newDuration = enemy.stunDuration - 1;
        return {
          ...enemy,
          stunDuration: newDuration,
          isStunned: newDuration > 0,
        };
      }
      return enemy;
    });
    set({ enemies: updatedEnemies });

    // 更新状态效果持续时间
    const updatedParty = state.party.map((char) => ({
      ...char,
      statusEffects: char.statusEffects
        .map((effect) => ({
          ...effect,
          duration: effect.duration - 1,
        }))
        .filter((effect) => effect.duration > 0),
    }));
    set({ party: updatedParty });

    // 获取新题目
    get().nextQuestion();

    set({
      currentTurn: state.currentTurn + 1,
    });

    get().addBattleLog(`--- 回合 ${state.currentTurn + 1} ---`, 'system');
  },

  nextQuestion: () => {
    const state = get();
    const queue = state.questionQueue;

    if (queue.length === 0) {
      set({ questionQueue: [...SAMPLE_QUESTIONS] });
    }

    const [nextQ, ...rest] = queue.length > 0 ? queue : SAMPLE_QUESTIONS;
    set({
      currentQuestion: nextQ,
      questionQueue: rest,
    });

    // 启动计时器
    const timeLimit = nextQ?.timeLimit || GAME_CONFIG.questionTimeLimit;
    get().startTimer(timeLimit);
  },

  // === Items ===
  useItem: (itemId) => {
    const state = get();
    const item = state.items.find((i) => i.id === itemId);
    if (!item || item.quantity <= 0) return;

    // 减少物品数量
    const updatedItems = state.items.map((i) => {
      if (i.id === itemId) {
        return { ...i, quantity: i.quantity - 1 };
      }
      return i;
    });
    set({ items: updatedItems });

    get().addBattleLog(`使用了 ${item.name}！`, 'system');

    // 执行物品效果
    switch (itemId) {
      case 'item-ddos':
        // 跳过当前题目
        get().nextQuestion();
        get().addBattleLog(`DDOS攻击！跳过当前题目`, 'system');
        break;

      case 'item-antivirus':
        // 降低全队过载
        state.party.forEach((char) => {
          get().decreaseOverload(char.id, 20);
        });
        get().addBattleLog(`杀毒软件启动！全队过载值降低20`, 'heal');
        break;
    }
  },

  // === Visual Effects ===
  addDamageIndicator: (indicator) => {
    const id = generateId('dmg');
    const newIndicator: DamageIndicator = {
      ...indicator,
      id,
      timestamp: Date.now(),
    };

    set((state) => ({
      damageIndicators: [...state.damageIndicators, newIndicator],
    }));

    setTimeout(() => {
      get().removeDamageIndicator(id);
    }, 1500);
  },

  removeDamageIndicator: (id) => {
    set((state) => ({
      damageIndicators: state.damageIndicators.filter((d) => d.id !== id),
    }));
  },

  addBattleLog: (message, type) => {
    const entry: BattleLogEntry = {
      id: generateId('log'),
      message,
      type,
      timestamp: Date.now(),
    };

    set((state) => ({
      battleLog: [...state.battleLog.slice(-50), entry],
    }));
  },

  triggerScreenShake: () => {
    set({ isScreenShaking: true });
    setTimeout(() => {
      set({ isScreenShaking: false });
    }, 500);
  },

  triggerGlitchEffect: () => {
    set({ showGlitchEffect: true });
    setTimeout(() => {
      set({ showGlitchEffect: false });
    }, 2000);
  },

  setGoldGlow: (characterId) => {
    set({ showGoldGlow: characterId });
  },

  // === Game Flow ===
  startBattle: (nodeId) => {
    if (nodeId) {
      get().selectNode(nodeId);
    }

    set({
      currentScreen: 'BATTLE',
      phase: 'PLAYER_TURN',
      currentTurn: 1,
      enemies: createInitialEnemies(),
      correctStreak: 0,
      battleLog: [],
      damageIndicators: [],
    });

    get().nextQuestion();
    get().addBattleLog('=== 神经潜渊开始 ===', 'system');
    get().addBattleLog('选择你的答案...', 'system');
  },

  endBattle: (victory) => {
    get().stopTimer();

    if (victory) {
      // 防火墙被动：战斗胜利回复过载
      const updatedParty = get().party.map((char) => {
        const newOverload = Math.max(0, char.overload - GAME_CONFIG.firewallBattleHeal);
        return { ...char, overload: newOverload };
      });
      set({ party: updatedParty });

      get().addBattleLog(`系统重构生效！全队过载值恢复 ${GAME_CONFIG.firewallBattleHeal}`, 'heal');

      if (get().currentNode) {
        get().completeNode(get().currentNode!.id);
      }

      set({ currentScreen: 'REWARD' });
    } else {
      set({ currentScreen: 'GAME_OVER' });
    }
  },

  resetBattle: () => {
    set({
      party: createInitialParty(),
      enemies: createInitialEnemies(),
      currentTurn: 1,
      phase: 'PLAYER_TURN',
      currentQuestion: SAMPLE_QUESTIONS[0],
      questionQueue: [...SAMPLE_QUESTIONS],
      correctStreak: 0,
      damageIndicators: [],
      battleLog: [],
      isScreenShaking: false,
      showGlitchEffect: false,
      showGoldGlow: null,
      showCyberpsychosis: null,
      items: [...DEFAULT_ITEMS],
    });

    get().startTimer(GAME_CONFIG.questionTimeLimit);
  },

  resetGame: () => {
    set({
      currentScreen: 'TITLE',
      knowledgeNodes: DEMO_KNOWLEDGE_NODES,
      currentNode: null,
      party: createInitialParty(),
      enemies: createInitialEnemies(),
      activeCharacterId: null,
      selectedTargetId: null,
      currentTurn: 1,
      phase: 'PLAYER_TURN',
      currentQuestion: SAMPLE_QUESTIONS[0],
      questionQueue: [...SAMPLE_QUESTIONS],
      correctStreak: 0,
      timer: {
        isRunning: false,
        timeRemaining: 30,
        totalTime: 30,
      },
      items: [...DEFAULT_ITEMS],
      damageIndicators: [],
      battleLog: [],
      isScreenShaking: false,
      showGlitchEffect: false,
      showGoldGlow: null,
      showCyberpsychosis: null,
      progress: {
        currentChapter: 1,
        completedNodes: [],
        totalExp: 0,
        itemsCollected: [],
        wrongAnswers: [],
        correctStreak: 0,
        totalQuestions: 0,
        correctAnswers: 0,
      },
    });
  },

  // === Wrong Answer Tracking ===
  addWrongAnswer: (question) => {
    set((state) => ({
      progress: {
        ...state.progress,
        wrongAnswers: [...state.progress.wrongAnswers, question],
        totalQuestions: state.progress.totalQuestions + 1,
      },
    }));
  },
}));
