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
    usedQuestionIds: Set<string>;
    remainingQuestionCount: number;
    
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
                maxExp: 1000,
                unlockedConstructs: ['ARBITER', 'WEAVER', 'ARCHITECT'],
                inventory: [],
                clearedSectors: [],
                entropyStabilized: 0
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
            usedQuestionIds: new Set<string>(),
            remainingQuestionCount: 0,
            
            battleLog: [],
            damageIndicators: [],
            isScreenShaking: false,
            glitchIntensity: 0,

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
                    entropyStabilized: 0
                },
                sectors: STAR_SECTORS,
                currentTheme: DEFAULT_THEME, // Reset theme as well
                currentSector: null,
                battleState: 'PLAYER_TURN',
                currentTurn: 1,
                constructs: INITIAL_CONSTRUCTS,
                entropyEntities: [],
                activeConstructId: null,
                selectedTargetId: null,
                currentQuestion: null,
                questionQueue: [],
                usedQuestionIds: new Set<string>(),
                remainingQuestionCount: 0,
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

                set({
                    currentScreen: 'BATTLE',
                    currentSector: sector,
                    entropyEntities: JSON.parse(JSON.stringify(sector.entropyEntities)), // 深拷贝
                    constructs: JSON.parse(JSON.stringify(INITIAL_CONSTRUCTS)), // 重置队伍
                    battleState: 'PLAYER_TURN',
                    currentTurn: 1,
                    battleLog: [],
                    questionQueue: remainingQueue,
                    currentQuestion: shuffleQuestion(firstQuestion),
                    usedQuestionIds: usedIds,
                    remainingQuestionCount: selectedQuestions.length,
                    glitchIntensity: 0
                });
                
                get().addBattleLog(`进入扇区: ${sector.name}`, 'system');
                get().addBattleLog(`熵状态: ${sector.status === 'STABLE' ? '稳定' : sector.status === 'HIGH_ENTROPY' ? '高熵警报' : '已锁定'}`, 'system');
                get().addBattleLog(`题目来源: ${isAIMode ? '🤖 AI动态生成' : '📚 内置题库'}`, 'system');
                get().addBattleLog(`本关卡共 ${selectedQuestions.length} 道题目`, 'system');
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

                const userAnswers = Array.isArray(optionIndex) ? optionIndex : [optionIndex];
                const correctAnswers = Array.isArray(currentQuestion.correctOptionIndex) 
                    ? currentQuestion.correctOptionIndex 
                    : [currentQuestion.correctOptionIndex];

                const isCorrect = userAnswers.length === correctAnswers.length && 
                    userAnswers.every(a => correctAnswers.includes(a));

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
                const { currentTurn, questionQueue, addBattleLog } = get();
                
                // 冷却减少
                const updatedConstructs = get().constructs.map(c => ({
                    ...c,
                    skills: c.skills.map(s => ({ ...s, currentCooldown: Math.max(0, s.currentCooldown - 1) }))
                }));

                // 检查是否还有剩余题目
                if (questionQueue.length === 0) {
                    // 所有题目回答完毕，进入胜利状态
                    addBattleLog('所有题目已完成！逻辑框架重建成功！', 'system');
                    setTimeout(() => set({ battleState: 'VICTORY', currentScreen: 'CAUSALITY_RECORD' }), 1000);
                    return;
                }

                // 下一个问题
                const nextQ = questionQueue[0];
                const remainingQ = questionQueue.slice(1);

                set({
                    currentTurn: currentTurn + 1,
                    constructs: updatedConstructs,
                    currentQuestion: shuffleQuestion(nextQ),
                    questionQueue: remainingQ,
                    remainingQuestionCount: remainingQ.length + 1 // 当前题目 + 剩余题目
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
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                observerProfile: state.observerProfile,
                sectors: state.sectors,
                currentTheme: state.currentTheme,
                settings: state.settings
            })
        }
    )
);
