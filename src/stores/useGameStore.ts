// Store：游戏状态 (useGameStore) - 管理全局游戏状态、导航和数据
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
    DEFAULT_THEME,
    GAME_CONFIG,
    INITIAL_CONSTRUCTS,
    INSCRIPTIONS,
    SAMPLE_QUESTIONS,
    STAR_SECTORS
} from '../lib/constants';
import { generateId, shuffleArray } from '../lib/utils';
import type {
    BattleLogEntry,
    BattleState,
    Construct,
    DamageIndicator,
    EntropyEntity,
    GameScreen,
    GameSettings,
    GameTheme,
    Inscription,
    InscriptionEffectContext,
    InscriptionTrigger,
    ObserverProfile,
    Question,
    StarSector
} from '../types/game';

// 辅助函数：随机打乱题目选项
const shuffleQuestion = (question: Question): Question => {
    const indices = question.options.map((_, i) => i);
    const shuffledIndices = shuffleArray(indices);
    
    const newOptions = shuffledIndices.map(i => question.options[i]);
    
    let newCorrectIndex: number | number[];
    
    if (Array.isArray(question.correctOptionIndex)) {
        newCorrectIndex = question.correctOptionIndex.map(oldIdx => 
            shuffledIndices.indexOf(oldIdx)
        );
    } else {
        newCorrectIndex = shuffledIndices.indexOf(question.correctOptionIndex);
    }
    
    return {
        ...question,
        options: newOptions,
        correctOptionIndex: newCorrectIndex
    };
};

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
    performMindHack: () => Inscription | null; // 返回null表示点数不足
    addHackPoint: () => void; // 通关后增加抽卡点数
    addExp: (amount: number) => { levelUp: boolean; newLevel: number }; // 增加经验值，返回是否升级

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
    allBattleQuestions: Question[]; // 存储本场战斗所有已抽取的题目，用于循环
    usedQuestionIds: Set<string>;
    remainingQuestionCount: number;
    
    // 连击系统
    comboCount: number; // 当前连击数
    
    // 视觉效果
    battleLog: BattleLogEntry[];
    damageIndicators: DamageIndicator[];
    isScreenShaking: boolean;
    glitchIntensity: number; // 0-1
    
    // 铭文系统
    inscriptionTriggeredFlags: Set<string>; // 铭文触发标记（用于追踪一次性效果）
    triggerInscriptions: (trigger: InscriptionTrigger, damageSource?: { type: 'skill' | 'question'; baseDamage: number }) => number | void;

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

    // === 系统设置 ===
    settings: GameSettings;
    updateSettings: (settings: Partial<GameSettings>) => void;
    resetProgress: () => void;
    
    // === 动态内容注入 ===
    setBattleQuestions: (questions: Question[]) => void;
    // 将AI生成的题目保存到指定扇区
    setSectorAIQuestions: (sectorId: string, questions: Question[], sourceTitle: string) => void;
    // 创建新的AI扇区
    createAISector: (sectorData: {
        name: string;
        description: string;
        difficulty: 1 | 2 | 3 | 4 | 5 | 6;
        questions: Question[];
        entropyEntities?: import('../types/game').EntropyEntity[];
        missionBriefing?: string;
    }) => string;
    
    // 更新扇区任务简报
    updateSectorBriefing: (sectorId: string, briefing: string) => void;
    
    // 将AI生成的60道题目分配到六个默认关卡
    // 第一关10道，第二关20道，以此类推，题目循环分配
    distributeAIQuestionsToSectors: (questions: Question[], sourceTitle: string) => void;
    
    // 批量更新扇区的名称和描述
    updateSectorMetadata: (sectors: Array<{ id: string; name: string; description: string }>) => void;
    
    // === 主题系统 ===
    currentTheme: GameTheme;
    setTheme: (theme: GameTheme) => void;
    // 应用AI生成的完整主题（包含所有UI文本和游戏内容）
    applyAITheme: (theme: Partial<GameTheme>) => void;
    // 重置为默认主题
    resetTheme: () => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            // === 初始状态 ===
            currentScreen: 'TITLE',
            
            observerProfile: {
                name: 'Observer',
                level: 1,
                exp: 0,
                maxExp: 200,
                unlockedConstructs: ['ARBITER', 'WEAVER', 'ARCHITECT'],
                inventory: [],
                clearedSectors: [],
                entropyStabilized: 0,
                hackPoints: 1 // 初始1个抽卡点数
            },

            sectors: STAR_SECTORS,
            currentSector: null,
            currentTheme: DEFAULT_THEME,

            battleState: 'PLAYER_TURN',
            currentTurn: 1,
            constructs: INITIAL_CONSTRUCTS,
            entropyEntities: [],
            
            activeConstructId: null,
            selectedTargetId: null,
            
            currentQuestion: null,
            questionQueue: [],
            allBattleQuestions: [], // 本场战斗所有题目
            usedQuestionIds: new Set<string>(),
            remainingQuestionCount: 0,
            comboCount: 0, // 连击计数器初始化
            
            battleLog: [],
            damageIndicators: [],
            isScreenShaking: false,
            glitchIntensity: 0,
            
            // 铭文系统初始状态
            inscriptionTriggeredFlags: new Set<string>(),
            
            // 铭文效果触发函数
            triggerInscriptions: (trigger, damageSource) => {
                const { observerProfile, currentTurn, constructs, entropyEntities, addBattleLog, inscriptionTriggeredFlags } = get();
                
                // 从玩家背包中获取铭文ID，然后从INSCRIPTIONS常量中查找完整铭文对象（包含effect函数）
                // 这是因为存储到localStorage的铭文会丢失effect函数
                const inventoryInscriptionIds = observerProfile.inventory.map(i => i.id);
                const matchingInscriptions = INSCRIPTIONS.filter(
                    inscription => inventoryInscriptionIds.includes(inscription.id) && inscription.trigger === trigger
                );
                
                if (matchingInscriptions.length === 0) return damageSource?.baseDamage;
                
                // 构建效果上下文
                const context: InscriptionEffectContext = {
                    currentTurn,
                    constructs,
                    entropyEntities,
                    addBattleLog: (msg: string) => addBattleLog(msg, 'system'),
                    triggeredFlags: inscriptionTriggeredFlags,
                    updateConstructs: (updater: (constructs: Construct[]) => Construct[]) => {
                        set(state => ({ constructs: updater(state.constructs) }));
                    },
                    updateEnemies: (updater: (enemies: EntropyEntity[]) => EntropyEntity[]) => {
                        set(state => ({ entropyEntities: updater(state.entropyEntities) }));
                    },
                    damageSource
                };
                
                // 触发所有匹配的铭文效果
                let finalDamage = damageSource?.baseDamage;
                for (const inscription of matchingInscriptions) {
                    const result = inscription.effect(context);
                    // 如果铭文返回了数值（伤害），则更新最终伤害
                    if (typeof result === 'number') {
                        finalDamage = result;
                        // 更新上下文中的伤害值供后续铭文使用
                        if (context.damageSource) {
                            context.damageSource.baseDamage = result;
                        }
                    }
                }
                
                return finalDamage;
            },

            settings: {
                resolution: "1920x1080",
                fullscreen: false,
                language: "zh-CN"
            },

            updateSettings: (newSettings) => set(state => ({
                settings: { ...state.settings, ...newSettings }
            })),

            resetProgress: () => set({
                observerProfile: {
                    name: 'Observer',
                    level: 1,
                    exp: 0,
                    maxExp: 1000,
                    unlockedConstructs: ['ARBITER', 'WEAVER', 'ARCHITECT'],
                    inventory: [],
                    clearedSectors: [],
                    entropyStabilized: 0,
                    hackPoints: 1 // 重置时也是1个点数
                },
                sectors: STAR_SECTORS,
                currentTheme: DEFAULT_THEME, // 同时也重置主题
                currentSector: null,
                battleState: 'PLAYER_TURN',
                currentTurn: 1,
                constructs: INITIAL_CONSTRUCTS,
                entropyEntities: [],
                activeConstructId: null,
                selectedTargetId: null,
                currentQuestion: null,
                questionQueue: [],
                allBattleQuestions: [],
                usedQuestionIds: new Set<string>(),
                remainingQuestionCount: 0,
                comboCount: 0,
                battleLog: [],
                damageIndicators: [],
                isScreenShaking: false,
                glitchIntensity: 0
            }),

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
                const { observerProfile } = get();
                
                // 检查是否有足够的抽卡点数
                if (observerProfile.hackPoints < 1) {
                    console.log('[思维骇入] 点数不足，无法抽卡');
                    return null;
                }
                
                // 抽卡概率配置
                // SSR: 13%, SR: 17%, R: 20%, N: 25% (每个N物品)
                // 总和: 13 + 17 + 20 + 25 + 25 = 100%
                
                const weights: Record<string, number> = {
                    'SSR': 13,
                    'SR': 17,
                    'R': 20,
                    'N': 25 
                };

                // 创建带权重的物品列表
                const weightedItems = INSCRIPTIONS.map(item => ({
                    item,
                    weight: weights[item.rarity] || 0
                }));

                // 计算总权重
                const totalWeight = weightedItems.reduce((sum, { weight }) => sum + weight, 0);
                
                // 生成随机数
                const randomValue = Math.random() * totalWeight;
                let cumulativeProbability = 0;
                let selectedItem: Inscription | undefined;
                
                for (const { item, weight } of weightedItems) {
                    cumulativeProbability += weight;
                    if (randomValue < cumulativeProbability) {
                        selectedItem = item;
                        break;
                    }
                }
                
                // 兜底
                if (!selectedItem) selectedItem = INSCRIPTIONS[INSCRIPTIONS.length - 1];

                // 消耗1个点数并添加物品到背包
                set(state => ({
                    observerProfile: {
                        ...state.observerProfile,
                        hackPoints: state.observerProfile.hackPoints - 1,
                        inventory: [...state.observerProfile.inventory, selectedItem!]
                    }
                }));
                
                console.log(`[思维骇入] 抽卡成功！获得: ${selectedItem!.name} (剩余点数: ${get().observerProfile.hackPoints})`);
                return selectedItem!;
            },

            // 通关后增加抽卡点数
            addHackPoint: () => {
                set(state => {
                    const currentPoints = state.observerProfile.hackPoints;
                    const maxPoints = 3; // 最多存储3个点数
                    
                    if (currentPoints >= maxPoints) {
                        console.log(`[思维骇入] 点数已达上限 (${maxPoints})`);
                        return state;
                    }
                    
                    const newPoints = currentPoints + 1;
                    console.log(`[思维骇入] 通关奖励，点数+1 (当前: ${newPoints}/${maxPoints})`);
                    
                    return {
                        observerProfile: {
                            ...state.observerProfile,
                            hackPoints: newPoints
                        }
                    };
                });
            },

            // 增加经验值并处理升级
            addExp: (amount) => {
                const state = get();
                const MAX_LEVEL = 10; // 满级10级
                
                // 如果已满级，不再获得经验
                if (state.observerProfile.level >= MAX_LEVEL) {
                    console.log(`[经验获得] 已达满级 Lv.${MAX_LEVEL}，经验不再增加`);
                    return { levelUp: false, newLevel: MAX_LEVEL };
                }
                
                let currentExp = state.observerProfile.exp + amount;
                let currentLevel = state.observerProfile.level;
                let currentMaxExp = state.observerProfile.maxExp;
                let levelUp = false;
                
                // 根据等级计算下一级所需经验
                // Lv.1->2: 200, Lv.2->3: 300, Lv.3->4: 400, Lv.4->5: 500
                // Lv.5->6: 1000, Lv.6->7: 2000, Lv.7->8+: 2000
                const getMaxExpForLevel = (level: number): number => {
                    if (level <= 1) return 200;
                    if (level === 2) return 300;
                    if (level === 3) return 400;
                    if (level === 4) return 500;
                    if (level === 5) return 1000;
                    if (level >= 6) return 2000;
                    return 2000;
                };
                
                // 处理升级（可能连续升多级，但不超过满级）
                while (currentExp >= currentMaxExp && currentLevel < MAX_LEVEL) {
                    currentExp -= currentMaxExp;
                    currentLevel += 1;
                    currentMaxExp = getMaxExpForLevel(currentLevel);
                    levelUp = true;
                    
                    if (currentLevel >= MAX_LEVEL) {
                        currentExp = currentMaxExp; // 满级后经验保持最满状态
                        console.log(`[等级提升] 恭喜达到满级 Lv.${MAX_LEVEL}！`);
                    } else {
                        console.log(`[等级提升] 升至 Lv.${currentLevel}！下一级需要 ${currentMaxExp} EXP`);
                    }
                }
                
                set({
                    observerProfile: {
                        ...state.observerProfile,
                        exp: currentExp,
                        level: currentLevel,
                        maxExp: currentMaxExp
                    }
                });
                
                console.log(`[经验获得] +${amount} EXP (当前: ${currentExp}/${currentMaxExp})`);
                
                return { levelUp, newLevel: currentLevel };
            },

            // === 战斗设置 ===
            startBattle: (sectorId) => {
                const sector = get().sectors.find(s => s.id === sectorId);
                if (!sector) return;

                // 根据关卡的totalQuestions选择题目
                const totalQuestionsNeeded = sector.totalQuestions;
                let selectedQuestions: Question[] = [];
                const usedIds = new Set<string>();

                // 优先使用AI生成的题目，若无则回退到样本题库
                if (sector.aiQuestions && sector.aiQuestions.length > 0) {
                    // 使用AI生成的题目
                    console.log(`[AI模式] 扇区 ${sector.name} 使用AI生成的 ${sector.aiQuestions.length} 道题目`);
                    const aiQuestions = [...sector.aiQuestions];
                    
                    // 随机打乱AI题目顺序
                    for (let i = aiQuestions.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [aiQuestions[i], aiQuestions[j]] = [aiQuestions[j], aiQuestions[i]];
                    }
                    
                    // 选择所需数量的题目
                    selectedQuestions = aiQuestions.slice(0, totalQuestionsNeeded);
                    selectedQuestions.forEach(q => usedIds.add(q.id));
                    
                    // 如果AI题目不够，从样本题库补充
                    if (selectedQuestions.length < totalQuestionsNeeded) {
                        const availableSamples = [...SAMPLE_QUESTIONS].filter(q => !usedIds.has(q.id));
                        while (selectedQuestions.length < totalQuestionsNeeded && availableSamples.length > 0) {
                            const randomIndex = Math.floor(Math.random() * availableSamples.length);
                            const question = availableSamples.splice(randomIndex, 1)[0];
                            selectedQuestions.push(question);
                            usedIds.add(question.id);
                        }
                        console.warn(`[AI模式] AI题目不足，已从样本题库补充 ${selectedQuestions.length - sector.aiQuestions.length} 道题目`);
                    }
                } else {
                    // 回退到样本题库
                    console.log(`[样本模式] 扇区 ${sector.name} 使用样本题库`);
                    const availableQuestions = [...SAMPLE_QUESTIONS];
                    
                    // 随机选择不重复的题目
                    while (selectedQuestions.length < totalQuestionsNeeded && availableQuestions.length > 0) {
                        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
                        const question = availableQuestions.splice(randomIndex, 1)[0];
                        if (!usedIds.has(question.id)) {
                            selectedQuestions.push(question);
                            usedIds.add(question.id);
                        }
                    }

                    // 如果题目数量不够，记录警告但继续游戏
                    if (selectedQuestions.length < totalQuestionsNeeded) {
                        console.warn(`[样本模式] 题库题目不足！需要 ${totalQuestionsNeeded} 题，但只有 ${selectedQuestions.length} 题可用`);
                    }
                }

                const firstQuestion = selectedQuestions.length > 0 ? selectedQuestions[0] : SAMPLE_QUESTIONS[0];
                const remainingQueue = selectedQuestions.slice(1);

                // 判断是否使用AI题目
                const isAIMode = sector.aiQuestions && sector.aiQuestions.length > 0;

                // 深拷贝并将能量值重置为0
                const battleConstructs = JSON.parse(JSON.stringify(INITIAL_CONSTRUCTS)).map(
                    (c: Construct) => ({ ...c, energy: 0 })
                );
                
                set({
                    currentScreen: 'BATTLE',
                    currentSector: sector,
                    entropyEntities: JSON.parse(JSON.stringify(sector.entropyEntities)), // 深拷贝
                    constructs: battleConstructs, // 重置队伍，能量归零
                    battleState: 'PLAYER_TURN',
                    currentTurn: 1,
                    battleLog: [],
                    questionQueue: remainingQueue,
                    allBattleQuestions: [...selectedQuestions], // 保存所有题目用于循环
                    currentQuestion: shuffleQuestion(firstQuestion),
                    usedQuestionIds: usedIds,
                    remainingQuestionCount: selectedQuestions.length,
                    glitchIntensity: 0,
                    comboCount: 0, // 重置连击计数
                    inscriptionTriggeredFlags: new Set<string>() // 重置铭文触发标记
                });
                
                get().addBattleLog(`进入扇区: ${sector.name}`, 'system');
                get().addBattleLog(`熵状态: ${sector.status === 'STABLE' ? '稳定' : sector.status === 'HIGH_ENTROPY' ? '高熵警报' : '已锁定'}`, 'system');
                get().addBattleLog(`题目来源: ${isAIMode ? '🤖 AI动态生成' : '📚 内置题库'}`, 'system');
                get().addBattleLog(`本关卡共 ${selectedQuestions.length} 道题目`, 'system');
                
                // 触发战斗开始时的铭文效果（如：空指针护盾）
                get().triggerInscriptions('battle_start');
            },

            resetBattle: () => {
                set({
                    battleState: 'PLAYER_TURN',
                    currentTurn: 1,
                    comboCount: 0,
                    glitchIntensity: 0,
                    allBattleQuestions: []
                });
            },

            // === 战斗动作 ===
            setActiveConstruct: (id) => set({ activeConstructId: id }),
            setSelectedTarget: (id) => set({ selectedTargetId: id }),

            useSkill: (constructId, skillId, targetId) => {
                const { constructs, entropyEntities, addBattleLog, addDamageIndicator, triggerInscriptions } = get();
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
                let currentConstructsState = constructs.map(c => 
                    c.id === constructId 
                        ? { ...c, energy: c.energy - (skill.cost || 0) } 
                        : c
                );

                // 应用效果
                let updatedEnemies = [...entropyEntities];
                const previousDeadCount = entropyEntities.filter(e => e.isDead).length;
                
                // 伤害倍率 (终极技能伤害更高)
                const damageMultiplier = skill.type === 'ultimate' ? 2.5 : 1;

                if (skill.targetType === 'single_enemy' && targetId) {
                    // 计算基础伤害
                    const baseDamage = Math.floor(50 * damageMultiplier);
                    // 触发on_damage铭文效果（如：创世编译器），可能返回增强后的伤害
                    const finalDamage = triggerInscriptions('on_damage', { type: 'skill', baseDamage }) as number ?? baseDamage;
                    
                    updatedEnemies = updatedEnemies.map(e => {
                        if (e.id === targetId) {
                            const newHp = Math.max(0, e.hp - finalDamage);
                            addDamageIndicator({ value: finalDamage, x: 50, y: 50, type: 'damage' }); 
                            return { ...e, hp: newHp, isDead: newHp <= 0 };
                        }
                        return e;
                    });
                    addBattleLog(`${construct.name} 对目标使用了 ${skill.name}！`, 'combat');
                } else if (skill.targetType === 'all_enemies') {
                    // 计算基础伤害
                    const baseDamage = Math.floor(30 * damageMultiplier);
                    // 触发on_damage铭文效果
                    const finalDamage = triggerInscriptions('on_damage', { type: 'skill', baseDamage }) as number ?? baseDamage;
                    
                    updatedEnemies = updatedEnemies.map(e => {
                        if (!e.isDead) {
                            const newHp = Math.max(0, e.hp - finalDamage);
                            addDamageIndicator({ value: finalDamage, x: 50, y: 50, type: 'damage' });
                            return { ...e, hp: newHp, isDead: newHp <= 0 };
                        }
                        return e;
                    });
                    addBattleLog(`${construct.name} 对所有敌人使用了 ${skill.name}！`, 'combat');
                } else if (skill.targetType === 'ally') {
                    // 治疗/护盾逻辑
                    const healAmount = skill.type === 'ultimate' ? 100 : 30;
                    currentConstructsState = currentConstructsState.map(c => {
                        const newHp = Math.min(c.maxHp, c.hp + healAmount);
                        if (newHp > c.hp) {
                             addDamageIndicator({ value: newHp - c.hp, x: 50, y: 50, type: 'heal' });
                        }
                        return { ...c, hp: newHp };
                    });
                    addBattleLog(`${construct.name} 对全体队友使用了 ${skill.name}！`, 'combat');
                }

                // 设置冷却
                const finalConstructs = currentConstructsState.map(c => 
                    c.id === constructId 
                        ? { 
                            ...c, 
                            skills: c.skills.map(s => s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s)
                          }
                        : c
                );

                set({ constructs: finalConstructs, entropyEntities: updatedEnemies });
                
                // 检查是否有敌人被击败，触发on_enemy_defeat铭文
                const newlyDefeatedCount = updatedEnemies.filter(e => e.isDead).length - previousDeadCount;
                if (newlyDefeatedCount > 0) {
                    for (let i = 0; i < newlyDefeatedCount; i++) {
                        get().triggerInscriptions('on_enemy_defeat');
                    }
                }
                
                // 检查胜利
                if (updatedEnemies.every(e => e.isDead)) {
                    setTimeout(() => set({ battleState: 'VICTORY', currentScreen: 'CAUSALITY_RECORD' }), 1000);
                } else {
                     get().nextTurn();
                }
            },

            answerQuestion: (optionIndex) => {
                const { currentQuestion, entropyEntities, addBattleLog, addDamageIndicator, comboCount, selectedTargetId, setSelectedTarget } = get();
                if (!currentQuestion) return;

                const userAnswers = Array.isArray(optionIndex) ? optionIndex : [optionIndex];
                const correctAnswers = Array.isArray(currentQuestion.correctOptionIndex) 
                    ? currentQuestion.correctOptionIndex 
                    : [currentQuestion.correctOptionIndex];

                const isCorrect = userAnswers.length === correctAnswers.length && 
                    userAnswers.every(a => correctAnswers.includes(a));

                if (isCorrect) {
                    // 更新连击计数
                    const newComboCount = comboCount + 1;
                    set({ comboCount: newComboCount });
                    
                    // 连击伤害计算：使用激活角色的攻击力 × 连击倍率
                    // 公式：伤害 = 激活角色攻击力 × min(连击数, 3)
                    const { activeConstructId, constructs } = get();
                    const aliveConstructs = constructs.filter(c => !c.isDead);
                    
                    // 获取激活的输出角色，如果未选择则默认第一个存活角色
                    let activeAttacker = aliveConstructs.find(c => c.id === activeConstructId);
                    if (!activeAttacker || activeAttacker.isDead) {
                        activeAttacker = aliveConstructs[0];
                    }
                    
                    const attackPower = activeAttacker?.attack || 5; // 默认攻击力5
                    const comboMultiplier = Math.min(newComboCount, GAME_CONFIG.comboThreshold); // 最多3倍
                    const damage = attackPower * comboMultiplier;
                    
                    if (newComboCount >= 2) {
                        addBattleLog(`⚡ ${newComboCount}连击！逻辑验证成功！熵值降低。`, 'system');
                    } else {
                        addBattleLog('逻辑验证成功！熵值降低。', 'system');
                    }
                    
                    // 答对题目，为每个存活的构造体增加 10 点能量
                    const energyGain = 10;
                    const updatedConstructs = get().constructs.map(c => {
                        if (!c.isDead) {
                            const newEnergy = Math.min(c.maxEnergy, c.energy + energyGain);
                            return { ...c, energy: newEnergy };
                        }
                        return c;
                    });
                    set({ constructs: updatedConstructs });
                    addBattleLog(`能量充能 +${energyGain}！`, 'system');
                    
                    // 确定攻击目标：优先选中的目标，否则选择第一个存活敌人
                    const aliveEnemies = entropyEntities.filter(e => !e.isDead);
                    let targetId = selectedTargetId;
                    
                    // 如果没有选中目标或选中的目标已死亡，选择第一个存活敌人
                    if (!targetId || !aliveEnemies.find(e => e.id === targetId)) {
                        targetId = aliveEnemies[0]?.id || null;
                    }
                    
                    // 对锁定的目标造成连击伤害
                    const previousDeadCount = entropyEntities.filter(e => e.isDead).length;
                    let updatedEnemies = entropyEntities.map(e => {
                        // 只攻击锁定的目标
                        if (e.id === targetId && !e.isDead) {
                            const newHp = Math.max(0, e.hp - damage);
                            addDamageIndicator({ value: damage, x: 50, y: 50, type: 'damage' });
                            const targetName = e.name;
                            if (newComboCount >= 2) {
                                addBattleLog(`连击加成！对 ${targetName} 造成 ${damage} 点伤害！`, 'combat');
                            } else {
                                addBattleLog(`对 ${targetName} 造成 ${damage} 点伤害！`, 'combat');
                            }
                            return { ...e, hp: newHp, isDead: newHp <= 0 };
                        }
                        return e;
                    });
                    
                    // === Boss专属技能：正熵爆发 ===
                    // 每损失10%最大生命值时触发，对全体逻辑构造体造成1.5倍伤害
                    const { inscriptionTriggeredFlags } = get();
                    let currentConstructs = get().constructs;
                    
                    updatedEnemies = updatedEnemies.map(e => {
                        if (e.id === 'entropy-boss' && !e.isDead) {
                            // 检查正熵爆发技能
                            const burstSkill = e.skills?.find(s => s.effect.specialEffect === 'scaling_damage_by_hp_lost') || 
                                              (e.skill?.effect.specialEffect === 'scaling_damage_by_hp_lost' ? e.skill : null);
                            
                            if (burstSkill) {
                                const currentHpPercent = e.hp / e.maxHp;
                                const damageMultiplier = burstSkill.effect.damageMultiplier || 1.5;
                                
                                // 检查各个10%血量阈值是否已触发
                                const thresholds = [90, 80, 70, 60, 50, 40, 30, 20, 10];
                                
                                for (const threshold of thresholds) {
                                    const thresholdKey = `boss-entropy-burst-${threshold}`;
                                    const thresholdRatio = threshold / 100;
                                    
                                    // 如果血量低于阈值且未触发过
                                    if (currentHpPercent < thresholdRatio && !inscriptionTriggeredFlags.has(thresholdKey)) {
                                        inscriptionTriggeredFlags.add(thresholdKey);
                                        
                                        // 计算伤害
                                        const burstDamage = Math.floor(e.damage * damageMultiplier);
                                        
                                        addBattleLog(`⚠️ 【${e.name}】触发【${burstSkill.name}】！血量降至 ${threshold}% 以下！`, 'combat');
                                        addBattleLog(`⭐ 奇点能量爆发！对全体造成 ${burstDamage} 点伤害！`, 'combat');
                                        
                                        // 对所有存活的构造体造成伤害
                                        currentConstructs = currentConstructs.map(c => {
                                            if (c.isDead) return c;
                                            
                                            const newHp = Math.max(0, c.hp - burstDamage);
                                            addDamageIndicator({ value: burstDamage, x: 50, y: 50, type: 'critical' });
                                            addBattleLog(`💥 ${c.name} 受到 ${burstDamage} 点熵爆发伤害！`, 'combat');
                                            
                                            return { ...c, hp: newHp, isDead: newHp <= 0 };
                                        });
                                        
                                        // 只触发一次（当前帧），后续阈值在下次受伤时检查
                                        break;
                                    }
                                }
                            }
                            
                            // === Boss专属技能：逆熵回复 ===
                            // 当前生命值首次低于最大生命值40%时触发，恢复50%已损失血量
                            const recoverySkill = e.skills?.find(s => s.effect.specialEffect === 'heal_once_on_low_hp');
                            
                            if (recoverySkill) {
                                const currentHpPercent = e.hp / e.maxHp;
                                const threshold = (recoverySkill.triggerCondition?.value || 40) / 100;
                                const recoveryKey = 'boss-entropy-recovery-triggered';
                                
                                // 如果血量低于40%且未触发过
                                if (currentHpPercent < threshold && !inscriptionTriggeredFlags.has(recoveryKey)) {
                                    inscriptionTriggeredFlags.add(recoveryKey);
                                    
                                    // 计算恢复量：50%已损失血量
                                    const lostHp = e.maxHp - e.hp;
                                    const healPercent = recoverySkill.effect.healPercent || 50;
                                    const healAmount = Math.floor(lostHp * (healPercent / 100));
                                    const newHp = Math.min(e.maxHp, e.hp + healAmount);
                                    
                                    addBattleLog(`⚠️ 【${e.name}】触发【${recoverySkill.name}】！生命值降至 ${Math.round(currentHpPercent * 100)}%！`, 'combat');
                                    addBattleLog(`🔄 逆熵流动！恢复 ${healAmount} 点生命值！`, 'system');
                                    addDamageIndicator({ value: healAmount, x: 50, y: 50, type: 'heal' });
                                    
                                    return { ...e, hp: newHp };
                                }
                            }
                        }
                        return e;
                    });
                    
                    // 更新构造体状态（可能被Boss技能伤害）
                    set({ constructs: currentConstructs, entropyEntities: updatedEnemies });
                    
                    // 如果目标被击杀，自动选择下一个存活敌人
                    const targetEnemy = updatedEnemies.find(e => e.id === targetId);
                    if (targetEnemy?.isDead) {
                        const nextAlive = updatedEnemies.find(e => !e.isDead);
                        if (nextAlive) {
                            setSelectedTarget(nextAlive.id);
                            addBattleLog(`${targetEnemy.name} 已消解！目标切换至 ${nextAlive.name}`, 'system');
                        }
                    }
                    
                    // 检查是否有敌人被击败，触发on_enemy_defeat铭文（如：熵噬虫）
                    const newlyDefeatedCount = updatedEnemies.filter(e => e.isDead).length - previousDeadCount;
                    if (newlyDefeatedCount > 0) {
                        for (let i = 0; i < newlyDefeatedCount; i++) {
                            get().triggerInscriptions('on_enemy_defeat');
                        }
                    }
                    
                     if (updatedEnemies.every(e => e.isDead)) {
                        setTimeout(() => set({ battleState: 'VICTORY', currentScreen: 'CAUSALITY_RECORD' }), 1000);
                    } else {
                        get().nextTurn();
                    }

                } else {
                    // 答错时重置连击计数
                    set({ comboCount: 0 });
                    addBattleLog('逻辑错误！熵值上升！连击中断！', 'system');
                    set({ glitchIntensity: Math.min(1, get().glitchIntensity + 0.2) });
                    
                    // 随机选择一个存活的敌人进行攻击
                    const aliveEnemiesForAttack = entropyEntities.filter(e => !e.isDead);
                    if (aliveEnemiesForAttack.length === 0) return;
                    
                    const attackerIndex = Math.floor(Math.random() * aliveEnemiesForAttack.length);
                    const attacker = aliveEnemiesForAttack[attackerIndex];
                    
                    // 计算敌人攻击力（包含状态效果加成）
                    let baseDamage = attacker.damage;
                    const damageBoostEffect = attacker.statusEffects.find(e => e.effect === 'damage_boost');
                    if (damageBoostEffect) {
                        // 递归压制效果：每层增加10%伤害
                        const boostPercent = damageBoostEffect.value / 100;
                        const boostedDamage = Math.floor(baseDamage * (1 + boostPercent));
                        addBattleLog(`📈 ${attacker.name} 处于【递归压制】状态，攻击力增加 ${damageBoostEffect.value}%！`, 'system');
                        baseDamage = boostedDamage;
                    }
                    
                    // 随机选择一个存活的构造体受到伤害
                    const aliveConstructs = get().constructs.filter(c => !c.isDead);
                    if (aliveConstructs.length === 0) return;
                    
                    const randomIndex = Math.floor(Math.random() * aliveConstructs.length);
                    const targetConstruct = aliveConstructs[randomIndex];
                    
                    addBattleLog(`${attacker.name} 发动攻击！`, 'combat');
                    
                    const updatedConstructs = get().constructs.map(c => {
                        // 只对随机选中的目标造成伤害
                        if (c.id !== targetConstruct.id) return c;
                        
                        // 检查是否有护盾状态效果
                        const shieldEffect = c.statusEffects.find(e => e.effect === 'shield');
                        let actualDamage = baseDamage;
                        let newStatusEffects = c.statusEffects;
                        
                        if (shieldEffect) {
                            // 应用护盾减伤
                            actualDamage = Math.floor(baseDamage * (1 - shieldEffect.value / 100));
                            addBattleLog(`【空指针护盾】抵挡了 ${baseDamage - actualDamage} 点伤害！护盾消散。`, 'system');
                            // 移除护盾效果（一次性使用）
                            newStatusEffects = c.statusEffects.filter(e => e.effect !== 'shield');
                        }
                        
                        const newHp = Math.max(0, c.hp - actualDamage);
                        addDamageIndicator({ value: actualDamage, x: 50, y: 50, type: 'damage' });
                        addBattleLog(`${c.name} 受到 ${actualDamage} 点伤害！`, 'combat');
                        return { ...c, hp: newHp, isDead: newHp <= 0, statusEffects: newStatusEffects };
                    });
                    set({ constructs: updatedConstructs });
                    
                    // === 敌人"攻击时触发"技能系统 ===
                    // 根据文档，大部分敌人技能在敌人攻击时触发（冷却归零时）
                    let currentConstructsAfterSkill = get().constructs;
                    let updatedEnemiesAfterAttack = [...entropyEntities];
                    const skill = attacker.skill;
                    
                    // 检查敌人是否有技能且技能触发条件为 on_attack
                    if (skill && skill.triggerCondition?.type === 'on_attack' && skill.currentCooldown === 0) {
                        addBattleLog(`⚠️ 【${attacker.name}】释放了【${skill.name}】！`, 'combat');
                        
                        // 根据技能效果类型执行不同逻辑
                        switch (skill.effect.specialEffect) {
                            case 'reduce_time_limit':
                                // 信号干扰：下一道题答题时间减少
                                currentConstructsAfterSkill = currentConstructsAfterSkill.map(c => ({
                                    ...c,
                                    statusEffects: [...c.statusEffects, {
                                        id: generateId('status'),
                                        name: '信号干扰',
                                        duration: 1,
                                        type: 'debuff' as const,
                                        effect: 'entropy_erosion' as const,
                                        value: skill.effect.statusToApply?.value || 5
                                    }]
                                }));
                                addBattleLog(`📡 下一道题的答题时间将减少 ${skill.effect.statusToApply?.value || 5} 秒！`, 'system');
                                break;
                                
                            case 'true_damage':
                                // 虚空坍缩：真实伤害，无视护盾
                                {
                                    const aliveTargets = currentConstructsAfterSkill.filter(c => !c.isDead);
                                    if (aliveTargets.length > 0) {
                                        const targetIdx = Math.floor(Math.random() * aliveTargets.length);
                                        const target = aliveTargets[targetIdx];
                                        const damage = Math.floor(attacker.damage * (skill.effect.damageMultiplier || 1.5));
                                        
                                        currentConstructsAfterSkill = currentConstructsAfterSkill.map(c => {
                                            if (c.id === target.id) {
                                                const newHp = Math.max(0, c.hp - damage);
                                                addDamageIndicator({ value: damage, x: 50, y: 50, type: 'critical' });
                                                addBattleLog(`💀 ${c.name} 受到 ${damage} 点真实伤害！（无视护盾）`, 'combat');
                                                return { ...c, hp: newHp, isDead: newHp <= 0 };
                                            }
                                            return c;
                                        });
                                    }
                                }
                                break;
                                
                            case 'force_cooldown':
                                // 引用消解：随机使一个技能进入冷却
                                {
                                    const aliveTargets = currentConstructsAfterSkill.filter(c => !c.isDead);
                                    if (aliveTargets.length > 0) {
                                        const targetIdx = Math.floor(Math.random() * aliveTargets.length);
                                        const target = aliveTargets[targetIdx];
                                        const availableSkills = target.skills.filter(s => s.currentCooldown === 0);
                                        if (availableSkills.length > 0) {
                                            const skillToLock = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                                            const cooldownToAdd = skill.effect.statusToApply?.duration || 3;
                                            
                                            currentConstructsAfterSkill = currentConstructsAfterSkill.map(c => {
                                                if (c.id === target.id) {
                                                    return {
                                                        ...c,
                                                        skills: c.skills.map(s => 
                                                            s.id === skillToLock.id 
                                                                ? { ...s, currentCooldown: cooldownToAdd }
                                                                : s
                                                        )
                                                    };
                                                }
                                                return c;
                                            });
                                            addBattleLog(`🔒 ${target.name} 的【${skillToLock.name}】被强制进入 ${cooldownToAdd} 回合冷却！`, 'system');
                                        }
                                    }
                                }
                                break;
                                
                            case 'energy_drain':
                                // 资源侵蚀：全体每回合损失能量
                                {
                                    const duration = skill.effect.statusToApply?.duration || 3;
                                    const drainValue = skill.effect.statusToApply?.value || 5;
                                    
                                    currentConstructsAfterSkill = currentConstructsAfterSkill.map(c => ({
                                        ...c,
                                        statusEffects: [...c.statusEffects, {
                                            id: generateId('status'),
                                            name: '资源侵蚀',
                                            duration: duration,
                                            type: 'debuff' as const,
                                            effect: 'entropy_erosion' as const,
                                            value: drainValue
                                        }]
                                    }));
                                    addBattleLog(`💧 全体构造体将在 ${duration} 回合内每回合损失 ${drainValue} 点能量！`, 'system');
                                }
                                break;
                                
                            case 'stacking_damage':
                                // 递归压制：敌人攻击力增加
                                {
                                    const duration = skill.effect.statusToApply?.duration || 4;
                                    const boostValue = skill.effect.statusToApply?.value || 10;
                                    
                                    updatedEnemiesAfterAttack = updatedEnemiesAfterAttack.map(e => {
                                        if (e.id === attacker.id) {
                                            return {
                                                ...e,
                                                statusEffects: [...e.statusEffects, {
                                                    id: generateId('status'),
                                                    name: '递归压制',
                                                    duration: duration,
                                                    type: 'buff' as const,
                                                    effect: 'damage_boost' as const,
                                                    value: boostValue
                                                }]
                                            };
                                        }
                                        return e;
                                    });
                                    addBattleLog(`📈 ${attacker.name} 进入失控递归状态，攻击力将增加 ${boostValue}%！`, 'system');
                                }
                                break;
                                
                            case 'stun_single':
                                // 资源禁锢：随机眩晕一名玩家
                                {
                                    const aliveTargets = currentConstructsAfterSkill.filter(c => !c.isDead);
                                    if (aliveTargets.length > 0) {
                                        const targetIdx = Math.floor(Math.random() * aliveTargets.length);
                                        const target = aliveTargets[targetIdx];
                                        const stunDuration = skill.effect.statusToApply?.duration || 2;
                                        
                                        currentConstructsAfterSkill = currentConstructsAfterSkill.map(c => {
                                            if (c.id === target.id) {
                                                return {
                                                    ...c,
                                                    statusEffects: [...c.statusEffects, {
                                                        id: generateId('status'),
                                                        name: '逻辑死锁',
                                                        duration: stunDuration,
                                                        type: 'debuff' as const,
                                                        effect: 'logic_lock' as const,
                                                        value: 100
                                                    }]
                                                };
                                            }
                                            return c;
                                        });
                                        addBattleLog(`🔗 ${target.name} 陷入「逻辑死锁」状态，无法行动 ${stunDuration} 回合！`, 'system');
                                    }
                                }
                                break;
                                
                            case 'drain_all_energy':
                                // 时序混乱：清空随机一个玩家的能量
                                {
                                    const aliveTargets = currentConstructsAfterSkill.filter(c => !c.isDead && c.energy > 0);
                                    if (aliveTargets.length > 0) {
                                        const targetIdx = Math.floor(Math.random() * aliveTargets.length);
                                        const target = aliveTargets[targetIdx];
                                        const drainedEnergy = target.energy;
                                        
                                        currentConstructsAfterSkill = currentConstructsAfterSkill.map(c => {
                                            if (c.id === target.id) {
                                                return { ...c, energy: 0 };
                                            }
                                            return c;
                                        });
                                        addBattleLog(`⏱️ ${target.name} 的能量被完全清空！（损失 ${drainedEnergy} 点能量）`, 'system');
                                    }
                                }
                                break;
                                
                            case 'execute_low_hp':
                                // 系统崩溃：对低血量目标造成双倍伤害
                                {
                                    const threshold = 0.4; // 40%血量
                                    const lowHpTargets = currentConstructsAfterSkill.filter(c => 
                                        !c.isDead && (c.hp / c.maxHp) < threshold
                                    );
                                    
                                    if (lowHpTargets.length > 0) {
                                        const target = lowHpTargets[0];
                                        const damage = Math.floor(attacker.damage * (skill.effect.damageMultiplier || 2.0));
                                        
                                        currentConstructsAfterSkill = currentConstructsAfterSkill.map(c => {
                                            if (c.id === target.id) {
                                                const newHp = Math.max(0, c.hp - damage);
                                                addDamageIndicator({ value: damage, x: 50, y: 50, type: 'critical' });
                                                addBattleLog(`💀 【处决】${c.name} 血量过低，受到 ${damage} 点致命伤害！`, 'combat');
                                                return { ...c, hp: newHp, isDead: newHp <= 0 };
                                            }
                                            return c;
                                        });
                                    }
                                }
                                break;
                                
                            case 'extend_cooldowns':
                                // 资源丢失：全体技能冷却+2
                                {
                                    const cooldownIncrease = skill.effect.statusToApply?.value || 2;
                                    
                                    currentConstructsAfterSkill = currentConstructsAfterSkill.map(c => ({
                                        ...c,
                                        skills: c.skills.map(s => ({
                                            ...s,
                                            currentCooldown: s.currentCooldown > 0 
                                                ? s.currentCooldown + cooldownIncrease 
                                                : s.currentCooldown
                                        }))
                                    }));
                                    addBattleLog(`🔍 404错误！全体冷却中的技能冷却时间 +${cooldownIncrease} 回合！`, 'system');
                                }
                                break;
                                
                            case 'heal_on_attack':
                                // 无限迭代：攻击后回血
                                {
                                    const healPercent = skill.effect.healPercent || 10;
                                    const healAmount = Math.floor(attacker.maxHp * (healPercent / 100));
                                    
                                    updatedEnemiesAfterAttack = updatedEnemiesAfterAttack.map(e => {
                                        if (e.id === attacker.id && !e.isDead) {
                                            const newHp = Math.min(e.maxHp, e.hp + healAmount);
                                            if (newHp > e.hp) {
                                                addDamageIndicator({ value: healAmount, x: 50, y: 50, type: 'heal' });
                                                addBattleLog(`♾️ ${e.name} 恢复 ${healAmount} 点生命值！`, 'system');
                                            }
                                            return { ...e, hp: newHp };
                                        }
                                        return e;
                                    });
                                }
                                break;
                                
                            case 'aoe_stun_chance':
                                // 内存越界：AOE伤害 + 概率眩晕
                                {
                                    const damage = Math.floor(attacker.damage * (skill.effect.damageMultiplier || 0.5));
                                    const stunChance = (skill.effect.statusToApply?.value || 20) / 100;
                                    const stunDuration = skill.effect.statusToApply?.duration || 1;
                                    
                                    currentConstructsAfterSkill = currentConstructsAfterSkill.map(c => {
                                        if (c.isDead) return c;
                                        
                                        const newHp = Math.max(0, c.hp - damage);
                                        addDamageIndicator({ value: damage, x: 50, y: 50, type: 'damage' });
                                        
                                        const newEffects = [...c.statusEffects];
                                        let stunned = false;
                                        
                                        if (Math.random() < stunChance) {
                                            stunned = true;
                                            newEffects.push({
                                                id: generateId('status'),
                                                name: '眩晕',
                                                duration: stunDuration,
                                                type: 'debuff' as const,
                                                effect: 'stunned' as const,
                                                value: 100
                                            });
                                        }
                                        
                                        addBattleLog(`💥 ${c.name} 受到 ${damage} 点伤害！${stunned ? '（陷入眩晕！）' : ''}`, 'combat');
                                        
                                        return { 
                                            ...c, 
                                            hp: newHp, 
                                            isDead: newHp <= 0,
                                            statusEffects: newEffects
                                        };
                                    });
                                }
                                break;
                        }
                        
                        // 重置技能冷却
                        updatedEnemiesAfterAttack = updatedEnemiesAfterAttack.map(e => {
                            if (e.id === attacker.id && e.skill) {
                                return {
                                    ...e,
                                    skill: {
                                        ...e.skill,
                                        currentCooldown: e.skill.cooldown
                                    }
                                };
                            }
                            return e;
                        });
                    }
                    
                    // 更新状态
                    set({ constructs: currentConstructsAfterSkill, entropyEntities: updatedEnemiesAfterAttack });
                    
                    // 触发低血量铭文效果（如：量子锚点）
                    get().triggerInscriptions('on_low_hp');
                    
                    if (get().constructs.every(c => c.isDead)) {
                         setTimeout(() => set({ battleState: 'DEFEAT', currentScreen: 'CAUSALITY_RECORD' }), 1000);
                    } else {
                        get().nextTurn();
                    }
                }
            },

            nextTurn: () => {
                const { currentTurn, questionQueue, addBattleLog, entropyEntities, constructs } = get();
                
                // === 1. 玩家构造体技能冷却减少 ===
                let updatedConstructs = constructs.map(c => ({
                    ...c,
                    skills: c.skills.map(s => ({ ...s, currentCooldown: Math.max(0, s.currentCooldown - 1) }))
                }));

                // === 2. 敌人技能冷却减少 ===
                let updatedEnemies = entropyEntities.map(e => {
                    if (e.isDead || !e.skill) return e;
                    const newSkill = {
                        ...e.skill,
                        currentCooldown: Math.max(0, e.skill.currentCooldown - 1)
                    };
                    return { ...e, skill: newSkill };
                });

                // === 3. 处理敌人状态效果（能量侵蚀等） ===
                updatedConstructs = updatedConstructs.map(c => {
                    if (c.isDead) return c;
                    
                    // 检查是否有能量侵蚀效果
                    const erosionEffect = c.statusEffects.find(e => e.effect === 'entropy_erosion');
                    let newEnergy = c.energy;
                    let newStatusEffects = c.statusEffects;
                    
                    if (erosionEffect && erosionEffect.value > 0 && erosionEffect.value < 100) {
                        // 能量侵蚀：每回合损失能量
                        newEnergy = Math.max(0, c.energy - erosionEffect.value);
                        addBattleLog(`⚡ ${c.name} 受到资源侵蚀，损失 ${erosionEffect.value} 点能量！`, 'combat');
                        
                        // 减少持续时间
                        newStatusEffects = c.statusEffects.map(e => 
                            e.effect === 'entropy_erosion' 
                                ? { ...e, duration: e.duration - 1 }
                                : e
                        ).filter(e => e.duration > 0);
                    }
                    
                    // 减少其他状态效果持续时间
                    newStatusEffects = newStatusEffects.map(e => ({
                        ...e,
                        duration: e.duration - 1
                    })).filter(e => e.duration > 0);
                    
                    return { ...c, energy: newEnergy, statusEffects: newStatusEffects };
                });

                // === 4. 敌人状态效果处理（递归压制等BUFF过期）===
                updatedEnemies = updatedEnemies.map(e => {
                    if (e.isDead) return e;
                    
                    // 减少敌人状态效果持续时间
                    const newStatusEffects = e.statusEffects.map(eff => ({
                        ...eff,
                        duration: eff.duration - 1
                    })).filter(eff => eff.duration > 0);
                    
                    return { ...e, statusEffects: newStatusEffects };
                });
                
                // 注意：敌人技能的 on_attack 触发已移至 answerQuestion 中的敌人攻击逻辑
                // 此处只处理特殊触发条件（如Boss的血量阈值触发技能）
                // Boss的正熵爆发（每损失10%血量触发）在 answerQuestion 中的玩家攻击逻辑处理
                // Boss的逆熵回复（血量首次低于40%触发）也在该处处理

                // === 5. 检查是否全灭 ===
                if (updatedConstructs.every(c => c.isDead)) {
                    setTimeout(() => set({ battleState: 'DEFEAT', currentScreen: 'CAUSALITY_RECORD' }), 1000);
                    return;
                }

                // === 6. 检查是否所有敌人阵亡（胜利条件）===
                if (updatedEnemies.every(e => e.isDead)) {
                    addBattleLog('所有敌人已消灭！逻辑框架重建成功！', 'system');
                    setTimeout(() => set({ battleState: 'VICTORY', currentScreen: 'CAUSALITY_RECORD' }), 1000);
                    return;
                }

                // === 7. 下一个问题（题目循环机制）===
                const { allBattleQuestions } = get();
                let nextQ: Question;
                let remainingQ: Question[];
                
                if (questionQueue.length > 0) {
                    // 还有剩余题目，正常取出
                    nextQ = questionQueue[0];
                    remainingQ = questionQueue.slice(1);
                } else {
                    // 题目队列已空，从所有题目中随机选择一道继续循环
                    addBattleLog('📚 题目已用尽，开始循环出题...', 'system');
                    const randomIndex = Math.floor(Math.random() * allBattleQuestions.length);
                    nextQ = allBattleQuestions[randomIndex];
                    remainingQ = []; // 保持队列为空，每次都随机选择
                }

                set({
                    currentTurn: currentTurn + 1,
                    constructs: updatedConstructs,
                    entropyEntities: updatedEnemies,
                    currentQuestion: shuffleQuestion(nextQ),
                    questionQueue: remainingQ,
                    remainingQuestionCount: remainingQ.length > 0 ? remainingQ.length + 1 : allBattleQuestions.length
                });
                
                // 触发回合结束时的铭文效果（如：逻辑残响）
                get().triggerInscriptions('turn_end');
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
            },

            setBattleQuestions: (questions) => {
                if (!questions || questions.length === 0) return;
                set({
                    currentQuestion: shuffleQuestion(questions[0]),
                    questionQueue: questions.slice(1)
                });
            },

            // 将AI生成的题目保存到指定扇区
            setSectorAIQuestions: (sectorId, questions, sourceTitle) => {
                if (!questions || questions.length === 0) return;
                
                set(state => ({
                    sectors: state.sectors.map(s => 
                        s.id === sectorId 
                            ? {
                                ...s,
                                aiQuestions: questions,
                                totalQuestions: questions.length, // 更新题目总数
                                aiGenerated: {
                                    generatedAt: Date.now(),
                                    sourceTitle
                                }
                            }
                            : s
                    )
                }));
                
                console.log(`[AI注入] 扇区 ${sectorId} 已注入 ${questions.length} 道AI题目，来源: ${sourceTitle}`);
            },

            // 创建新的AI扇区
            createAISector: (sectorData) => {
                const { name, description, difficulty, questions, entropyEntities, missionBriefing } = sectorData;
                const sectorId = generateId('ai-sector');
                
                // 根据难度确定扇区状态
                const status = difficulty >= 3 ? 'HIGH_ENTROPY' : 'STABLE';
                
                // 计算新扇区位置 - 基于现有扇区数量
                const existingSectorCount = get().sectors.length;
                const position = {
                    x: 15 + (existingSectorCount % 5) * 17,
                    y: 25 + Math.floor(existingSectorCount / 5) * 25
                };
                
                const newSector = {
                    id: sectorId,
                    name,
                    description,
                    status: status as 'STABLE' | 'HIGH_ENTROPY' | 'LOCKED',
                    difficulty,
                    position,
                    totalQuestions: questions.length,
                    entropyEntities: entropyEntities || [],
                    rewards: { exp: difficulty * 100 },
                    aiQuestions: questions,
                    aiGenerated: {
                        generatedAt: Date.now(),
                        sourceTitle: name
                    },
                    missionBriefing: missionBriefing || "目标：渗透认知熵侵蚀区域，通过知识验证重建逻辑框架。"
                };
                
                set(state => ({
                    sectors: [...state.sectors, newSector]
                }));
                
                console.log(`[AI创建] 新扇区 "${name}" 已创建，ID: ${sectorId}，包含 ${questions.length} 道题目`);
                return sectorId;
            },

            updateSectorBriefing: (sectorId, briefing) => {
                set(state => ({
                    sectors: state.sectors.map(s => 
                        s.id === sectorId ? { ...s, missionBriefing: briefing } : s
                    ),
                    // 如果当前选中的是这个扇区，也需要更新 currentSector
                    currentSector: state.currentSector?.id === sectorId 
                        ? { ...state.currentSector, missionBriefing: briefing } 
                        : state.currentSector
                }));
                console.log(`[扇区更新] 扇区 ${sectorId} 简报已更新`);
            },

            // 将AI生成的120道题目分配到六个默认关卡
            // 第一关20道，第二关40道，以此类推，题目循环分配
            distributeAIQuestionsToSectors: (questions, sourceTitle) => {
                if (!questions || questions.length === 0) return;
                
                // 默认六个关卡的ID（按顺序对应难度1-6）
                const defaultSectorIds = [
                    'sector-1',  // 第一关: 20道题
                    'sector-2',  // 第二关: 40道题
                    'sector-3',  // 第三关: 60道题
                    'sector-4',  // 第四关: 80道题
                    'sector-5',  // 第五关: 100道题
                    'sector-boss' // 第六关: 120道题
                ];
                
                // 每个关卡需要的题目数量（与关卡的totalQuestions相同）
                const questionsPerSector = [20, 40, 60, 80, 100, 120];
                
                const state = get();
                const allQuestions = [...questions];
                const totalAvailable = allQuestions.length;
                
                console.log(`[AI分配] 开始将 ${totalAvailable} 道题目分配到 ${defaultSectorIds.length} 个默认关卡`);
                
                // 为每个关卡分配题目
                const updatedSectors = state.sectors.map(sector => {
                    const sectorIndex = defaultSectorIds.indexOf(sector.id);
                    
                    // 只处理默认的六个关卡
                    if (sectorIndex === -1) {
                        return sector;
                    }
                    
                    const neededCount = questionsPerSector[sectorIndex];
                    
                    // 修改逻辑：将所有AI题目都分配给该关卡，让 startBattle 在进入战斗时随机抽取
                    // 这样每次进入关卡都会从总题库中随机选择指定数量的题目
                    const sectorQuestions = allQuestions.map((q, i) => ({
                        ...q,
                        // 为每个关卡的题目生成唯一ID，避免重复
                        id: `${sector.id}-${q.id}-${i}`
                    }));
                    
                    console.log(`[AI分配] 关卡 "${sector.name}" (${sector.id}): 关联全量题库 ${sectorQuestions.length} 题 (需抽取 ${neededCount} 题)`);
                    
                    return {
                        ...sector,
                        aiQuestions: sectorQuestions,
                        totalQuestions: neededCount,
                        aiGenerated: {
                            generatedAt: Date.now(),
                            sourceTitle
                        }
                    };
                });
                
                set({ sectors: updatedSectors });
                console.log(`[AI分配] 完成！共分配题目到 ${defaultSectorIds.length} 个关卡`);
            },

            // 批量更新扇区的名称和描述
            updateSectorMetadata: (sectorUpdates) => {
                if (!sectorUpdates || sectorUpdates.length === 0) return;
                
                set(state => ({
                    sectors: state.sectors.map(sector => {
                        const update = sectorUpdates.find(u => u.id === sector.id);
                        if (update) {
                            console.log(`[扇区更新] ${sector.id}: "${sector.name}" → "${update.name}"`);
                            return {
                                ...sector,
                                name: update.name,
                                description: update.description
                            };
                        }
                        return sector;
                    }),
                    // 如果当前选中的扇区也在更新列表中，同步更新
                    currentSector: state.currentSector 
                        ? (() => {
                            const update = sectorUpdates.find(u => u.id === state.currentSector?.id);
                            return update 
                                ? { ...state.currentSector, name: update.name, description: update.description }
                                : state.currentSector;
                        })()
                        : null
                }));
                
                console.log(`[扇区更新] 完成！共更新 ${sectorUpdates.length} 个扇区的名称和描述`);
            },

            // === 主题系统 ===
            setTheme: (theme) => {
                set({ currentTheme: theme });
                console.log(`[主题] 已切换到主题: ${theme.name}`);
            },

            applyAITheme: (partialTheme) => {
                const currentTheme = get().currentTheme;
                const newTheme: GameTheme = {
                    ...currentTheme,
                    ...partialTheme,
                    id: partialTheme.id || generateId('theme'),
                    generatedAt: Date.now(),
                    pageLabels: {
                        levelSelect: {
                            ...currentTheme.pageLabels.levelSelect,
                            ...(partialTheme.pageLabels?.levelSelect || {})
                        },
                        battle: {
                            ...currentTheme.pageLabels.battle,
                            ...(partialTheme.pageLabels?.battle || {})
                        },
                        mindHack: {
                            ...currentTheme.pageLabels.mindHack,
                            ...(partialTheme.pageLabels?.mindHack || {})
                        }
                    },
                    constructs: partialTheme.constructs || currentTheme.constructs,
                    inscriptions: partialTheme.inscriptions || currentTheme.inscriptions,
                    battleLogTemplates: {
                        ...currentTheme.battleLogTemplates,
                        ...(partialTheme.battleLogTemplates || {}),
                        entropyStatus: {
                            ...currentTheme.battleLogTemplates.entropyStatus,
                            ...(partialTheme.battleLogTemplates?.entropyStatus || {})
                        },
                        questionSource: {
                            ...currentTheme.battleLogTemplates.questionSource,
                            ...(partialTheme.battleLogTemplates?.questionSource || {})
                        }
                    }
                };
                set({ currentTheme: newTheme });
                console.log(`[主题] 已应用AI主题: ${newTheme.name || '未命名'}`);
            },

            resetTheme: () => {
                set({ currentTheme: DEFAULT_THEME });
                console.log('[主题] 已重置为默认主题');
            }
        }),
        {
            name: 'scholar-game-storage',
            version: 2, // 版本号，用于数据迁移
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                observerProfile: state.observerProfile,
                sectors: state.sectors,
                currentTheme: state.currentTheme,
                settings: state.settings
            }),
            // 数据迁移：修复旧版本的 maxExp 值
            migrate: (persistedState: unknown, version: number) => {
                const state = persistedState as { observerProfile?: { level: number; exp: number; maxExp: number } };
                
                if (version < 2 && state?.observerProfile) {
                    // 根据等级重新计算正确的 maxExp
                    const getMaxExpForLevel = (level: number): number => {
                        if (level <= 1) return 200;
                        if (level === 2) return 300;
                        if (level === 3) return 400;
                        if (level === 4) return 500;
                        if (level === 5) return 1000;
                        if (level >= 6) return 2000;
                        return 2000;
                    };
                    
                    const correctMaxExp = getMaxExpForLevel(state.observerProfile.level);
                    console.log(`[数据迁移] 修正 maxExp: ${state.observerProfile.maxExp} -> ${correctMaxExp}`);
                    state.observerProfile.maxExp = correctMaxExp;
                    
                    // 确保 exp 不超过 maxExp
                    if (state.observerProfile.exp > correctMaxExp) {
                        state.observerProfile.exp = correctMaxExp;
                    }
                }
                
                return state;
            }
        }
    )
);
