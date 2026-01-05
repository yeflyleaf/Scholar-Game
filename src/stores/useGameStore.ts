// Store：游戏状态 (useGameStore) - 管理全局游戏状态、导航和数据
import { create } from 'zustand';
import {
    GAME_CONFIG,
    INITIAL_CONSTRUCTS,
    INSCRIPTIONS,
    SAMPLE_QUESTIONS,
    STAR_SECTORS
} from '../lib/constants';
import { generateId } from '../lib/utils';
import type {
    BattleLogEntry,
    BattleState,
    Construct,
    DamageIndicator,
    EntropyEntity,
    GameScreen,
    Inscription,
    ObserverProfile,
    Question,
    StarSector
} from '../types/game';

interface GameState {
    // === 导航 ===
    currentScreen: GameScreen;
    setScreen: (screen: GameScreen) => void;

    // === 玩家档案 ===
    observerProfile: ObserverProfile;
    
    // === 大统一理论演练 (关卡选择) ===
    sectors: StarSector[];
    currentSector: StarSector | null;
    selectSector: (sectorId: string) => void;
    unlockSector: (sectorId: string) => void;

    // === 思维骇入 (抽卡) ===
    performMindHack: () => Inscription;

    // === 战斗系统 ===
    battleState: BattleState;
    currentTurn: number;
    
    // 实体
    constructs: Construct[]; // 玩家队伍
    entropyEntities: EntropyEntity[]; // 敌人
    
    // 选择
    activeConstructId: string | null;
    selectedTargetId: string | null;
    
    // 问题
    currentQuestion: Question | null;
    questionQueue: Question[];
    
    // 视觉效果
    battleLog: BattleLogEntry[];
    damageIndicators: DamageIndicator[];
    isScreenShaking: boolean;
    glitchIntensity: number; // 0-1

    // === 动作 ===
    // 设置
    startBattle: (sectorId: string) => void;
    resetBattle: () => void;
    
    // 战斗
    setActiveConstruct: (id: string | null) => void;
    setSelectedTarget: (id: string | null) => void;
    useSkill: (constructId: string, skillId: string, targetId?: string) => void;
    answerQuestion: (optionIndex: number | number[]) => void;
    nextTurn: () => void;
    
    // 视觉辅助
    addBattleLog: (message: string, type: BattleLogEntry['type']) => void;
    addDamageIndicator: (indicator: Omit<DamageIndicator, 'id' | 'timestamp'>) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    // === 初始状态 ===
    currentScreen: 'TITLE',
    
    observerProfile: {
        name: 'Observer',
        level: 1,
        exp: 0,
        maxExp: 1000,
        unlockedConstructs: ['ARBITER', 'WEAVER', 'ARCHITECT'],
        inventory: [],
        clearedSectors: [],
        entropyStabilized: 0
    },

    sectors: STAR_SECTORS,
    currentSector: null,

    battleState: 'PLAYER_TURN',
    currentTurn: 1,
    constructs: INITIAL_CONSTRUCTS,
    entropyEntities: [],
    
    activeConstructId: null,
    selectedTargetId: null,
    
    currentQuestion: null,
    questionQueue: [],
    
    battleLog: [],
    damageIndicators: [],
    isScreenShaking: false,
    glitchIntensity: 0,

    // === 导航 ===
    setScreen: (screen) => set({ currentScreen: screen }),

    // === 大统一理论演练 ===
    selectSector: (sectorId) => {
        const sector = get().sectors.find(s => s.id === sectorId);
        if (sector) {
            set({ currentSector: sector });
        }
    },

    unlockSector: (sectorId) => {
        set(state => ({
            sectors: state.sectors.map(s => 
                s.id === sectorId ? { ...s, status: 'STABLE' } : s
            )
        }));
    },

    // === 思维骇入 ===
    performMindHack: () => {
        // 简单的随机抽卡逻辑
        const randomIndex = Math.floor(Math.random() * INSCRIPTIONS.length);
        const item = INSCRIPTIONS[randomIndex];
        
        set(state => ({
            observerProfile: {
                ...state.observerProfile,
                inventory: [...state.observerProfile.inventory, item]
            }
        }));
        
        return item;
    },

    // === 战斗设置 ===
    startBattle: (sectorId) => {
        const sector = get().sectors.find(s => s.id === sectorId);
        if (!sector) return;

        set({
            currentScreen: 'BATTLE',
            currentSector: sector,
            entropyEntities: JSON.parse(JSON.stringify(sector.entropyEntities)), // 深拷贝
            constructs: JSON.parse(JSON.stringify(INITIAL_CONSTRUCTS)), // 重置队伍
            battleState: 'PLAYER_TURN',
            currentTurn: 1,
            battleLog: [],
            questionQueue: [...SAMPLE_QUESTIONS], // 在实际应用中，从扇区获取
            currentQuestion: SAMPLE_QUESTIONS[0],
            glitchIntensity: 0
        });
        
        get().addBattleLog(`进入扇区: ${sector.name}`, 'system');
        get().addBattleLog(`熵状态: ${sector.status === 'STABLE' ? '稳定' : sector.status === 'HIGH_ENTROPY' ? '高熵警报' : '已锁定'}`, 'system');
    },

    resetBattle: () => {
        set({
            battleState: 'PLAYER_TURN',
            currentTurn: 1,
            glitchIntensity: 0
        });
    },

    // === 战斗动作 ===
    setActiveConstruct: (id) => set({ activeConstructId: id }),
    setSelectedTarget: (id) => set({ selectedTargetId: id }),

    useSkill: (constructId, skillId, targetId) => {
        const { constructs, entropyEntities, addBattleLog, addDamageIndicator } = get();
        const construct = constructs.find(c => c.id === constructId);
        const skill = construct?.skills.find(s => s.id === skillId);
        
        if (!construct || !skill) return;
        if (skill.currentCooldown > 0) {
            addBattleLog(`${skill.name} 正在冷却中！`, 'system');
            return;
        }
        if (construct.energy < (skill.cost || 0)) {
            addBattleLog(`能量不足，无法使用 ${skill.name}！`, 'system');
            return;
        }

        // 扣除消耗
        const updatedConstructs = constructs.map(c => 
            c.id === constructId 
                ? { ...c, energy: c.energy - (skill.cost || 0) } 
                : c
        );

        // 应用效果
        let updatedEnemies = [...entropyEntities];
        
        if (skill.targetType === 'single_enemy' && targetId) {
            updatedEnemies = updatedEnemies.map(e => {
                if (e.id === targetId) {
                    const damage = 50; // 基础技能伤害
                    const newHp = Math.max(0, e.hp - damage);
                    addDamageIndicator({ value: damage, x: 50, y: 50, type: 'damage' }); // 模拟坐标
                    return { ...e, hp: newHp, isDead: newHp <= 0 };
                }
                return e;
            });
            addBattleLog(`${construct.name} 对目标使用了 ${skill.name}！`, 'combat');
        } else if (skill.targetType === 'all_enemies') {
             updatedEnemies = updatedEnemies.map(e => {
                const damage = 30; // AOE 伤害
                const newHp = Math.max(0, e.hp - damage);
                addDamageIndicator({ value: damage, x: 50, y: 50, type: 'damage' });
                return { ...e, hp: newHp, isDead: newHp <= 0 };
            });
            addBattleLog(`${construct.name} 对所有敌人使用了 ${skill.name}！`, 'combat');
        }

        // 设置冷却
        const finalConstructs = updatedConstructs.map(c => 
            c.id === constructId 
                ? { 
                    ...c, 
                    skills: c.skills.map(s => s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s)
                  }
                : c
        );

        set({ constructs: finalConstructs, entropyEntities: updatedEnemies });
        
        // 检查胜利
        if (updatedEnemies.every(e => e.isDead)) {
            setTimeout(() => set({ battleState: 'VICTORY', currentScreen: 'CAUSALITY_RECORD' }), 1000);
        } else {
             get().nextTurn();
        }
    },

    answerQuestion: (optionIndex) => {
        const { currentQuestion, entropyEntities, addBattleLog, addDamageIndicator } = get();
        if (!currentQuestion) return;

        const isCorrect = currentQuestion.correctOptionIndex === optionIndex; // 简化为单选

        if (isCorrect) {
            addBattleLog('逻辑验证成功！熵值降低。', 'system');
            // 对随机敌人或所有敌人造成伤害
            const damage = GAME_CONFIG.baseDamage;
            const updatedEnemies = entropyEntities.map(e => {
                if (!e.isDead) {
                     const newHp = Math.max(0, e.hp - damage);
                     addDamageIndicator({ value: damage, x: 50, y: 50, type: 'damage' });
                     return { ...e, hp: newHp, isDead: newHp <= 0 };
                }
                return e;
            });
            set({ entropyEntities: updatedEnemies });
            
             if (updatedEnemies.every(e => e.isDead)) {
                setTimeout(() => set({ battleState: 'VICTORY', currentScreen: 'CAUSALITY_RECORD' }), 1000);
            } else {
                get().nextTurn();
            }

        } else {
            addBattleLog('逻辑错误！熵值上升！', 'system');
            set({ glitchIntensity: Math.min(1, get().glitchIntensity + 0.2) });
            // 受到伤害
            const damage = 20;
            const updatedConstructs = get().constructs.map(c => {
                 const newHp = Math.max(0, c.hp - damage);
                 addDamageIndicator({ value: damage, x: 50, y: 50, type: 'damage' }); // 应该在玩家身上
                 return { ...c, hp: newHp, isDead: newHp <= 0 };
            });
            set({ constructs: updatedConstructs });
            
            if (updatedConstructs.every(c => c.isDead)) {
                 setTimeout(() => set({ battleState: 'DEFEAT', currentScreen: 'CAUSALITY_RECORD' }), 1000);
            } else {
                get().nextTurn();
            }
        }
    },

    nextTurn: () => {
        const { currentTurn, questionQueue } = get();
        
        // 冷却减少
        const updatedConstructs = get().constructs.map(c => ({
            ...c,
            skills: c.skills.map(s => ({ ...s, currentCooldown: Math.max(0, s.currentCooldown - 1) }))
        }));

        // 下一个问题
        const nextQ = questionQueue.length > 0 ? questionQueue[0] : SAMPLE_QUESTIONS[0];
        const remainingQ = questionQueue.slice(1);

        set({
            currentTurn: currentTurn + 1,
            constructs: updatedConstructs,
            currentQuestion: nextQ,
            questionQueue: remainingQ.length > 0 ? remainingQ : SAMPLE_QUESTIONS // 演示循环
        });
    },

    // === 视觉辅助 ===
    addBattleLog: (message, type) => {
        const entry: BattleLogEntry = {
            id: generateId('log'),
            message,
            type,
            timestamp: Date.now()
        };
        set(state => ({ battleLog: [...state.battleLog.slice(-20), entry] }));
    },

    addDamageIndicator: (indicator) => {
        const id = generateId('dmg');
        const newIndicator = { ...indicator, id, timestamp: Date.now() };
        set(state => ({ damageIndicators: [...state.damageIndicators, newIndicator] }));
        setTimeout(() => {
            set(state => ({ damageIndicators: state.damageIndicators.filter(d => d.id !== id) }));
        }, 1000);
    }
}));
