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
    // === Navigation ===
    currentScreen: GameScreen;
    setScreen: (screen: GameScreen) => void;

    // === Player Profile ===
    observerProfile: ObserverProfile;
    
    // === Grand Unification Sim (Level Select) ===
    sectors: StarSector[];
    currentSector: StarSector | null;
    selectSector: (sectorId: string) => void;
    unlockSector: (sectorId: string) => void;

    // === Mind Hack (Gacha) ===
    performMindHack: () => Inscription;

    // === Battle System ===
    battleState: BattleState;
    currentTurn: number;
    
    // Entities
    constructs: Construct[]; // Player party
    entropyEntities: EntropyEntity[]; // Enemies
    
    // Selection
    activeConstructId: string | null;
    selectedTargetId: string | null;
    
    // Questions
    currentQuestion: Question | null;
    questionQueue: Question[];
    
    // Visuals
    battleLog: BattleLogEntry[];
    damageIndicators: DamageIndicator[];
    isScreenShaking: boolean;
    glitchIntensity: number; // 0-1

    // === Actions ===
    // Setup
    startBattle: (sectorId: string) => void;
    resetBattle: () => void;
    
    // Combat
    setActiveConstruct: (id: string | null) => void;
    setSelectedTarget: (id: string | null) => void;
    useSkill: (constructId: string, skillId: string, targetId?: string) => void;
    answerQuestion: (optionIndex: number | number[]) => void;
    nextTurn: () => void;
    
    // Visual Helpers
    addBattleLog: (message: string, type: BattleLogEntry['type']) => void;
    addDamageIndicator: (indicator: Omit<DamageIndicator, 'id' | 'timestamp'>) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    // === Initial State ===
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

    // === Navigation ===
    setScreen: (screen) => set({ currentScreen: screen }),

    // === Grand Unification Sim ===
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

    // === Mind Hack ===
    performMindHack: () => {
        // Simple random gacha logic
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

    // === Battle Setup ===
    startBattle: (sectorId) => {
        const sector = get().sectors.find(s => s.id === sectorId);
        if (!sector) return;

        set({
            currentScreen: 'BATTLE',
            currentSector: sector,
            entropyEntities: JSON.parse(JSON.stringify(sector.entropyEntities)), // Deep copy
            constructs: JSON.parse(JSON.stringify(INITIAL_CONSTRUCTS)), // Reset party
            battleState: 'PLAYER_TURN',
            currentTurn: 1,
            battleLog: [],
            questionQueue: [...SAMPLE_QUESTIONS], // In real app, fetch from sector
            currentQuestion: SAMPLE_QUESTIONS[0],
            glitchIntensity: 0
        });
        
        get().addBattleLog(`Entering Sector: ${sector.name}`, 'system');
        get().addBattleLog(`Entropy Levels: ${sector.status}`, 'system');
    },

    resetBattle: () => {
        set({
            battleState: 'PLAYER_TURN',
            currentTurn: 1,
            glitchIntensity: 0
        });
    },

    // === Combat Actions ===
    setActiveConstruct: (id) => set({ activeConstructId: id }),
    setSelectedTarget: (id) => set({ selectedTargetId: id }),

    useSkill: (constructId, skillId, targetId) => {
        const { constructs, entropyEntities, addBattleLog, addDamageIndicator } = get();
        const construct = constructs.find(c => c.id === constructId);
        const skill = construct?.skills.find(s => s.id === skillId);
        
        if (!construct || !skill) return;
        if (skill.currentCooldown > 0) {
            addBattleLog(`${skill.name} is on cooldown!`, 'system');
            return;
        }
        if (construct.energy < (skill.cost || 0)) {
            addBattleLog(`Insufficient Energy for ${skill.name}!`, 'system');
            return;
        }

        // Deduct Cost
        const updatedConstructs = constructs.map(c => 
            c.id === constructId 
                ? { ...c, energy: c.energy - (skill.cost || 0) } 
                : c
        );

        // Apply Effects
        let updatedEnemies = [...entropyEntities];
        
        if (skill.targetType === 'single_enemy' && targetId) {
            updatedEnemies = updatedEnemies.map(e => {
                if (e.id === targetId) {
                    const damage = 50; // Base skill damage
                    const newHp = Math.max(0, e.hp - damage);
                    addDamageIndicator({ value: damage, x: 50, y: 50, type: 'damage' }); // Mock coords
                    return { ...e, hp: newHp, isDead: newHp <= 0 };
                }
                return e;
            });
            addBattleLog(`${construct.name} used ${skill.name} on target!`, 'combat');
        } else if (skill.targetType === 'all_enemies') {
             updatedEnemies = updatedEnemies.map(e => {
                const damage = 30; // AOE damage
                const newHp = Math.max(0, e.hp - damage);
                addDamageIndicator({ value: damage, x: 50, y: 50, type: 'damage' });
                return { ...e, hp: newHp, isDead: newHp <= 0 };
            });
            addBattleLog(`${construct.name} used ${skill.name} on ALL enemies!`, 'combat');
        }

        // Set Cooldown
        const finalConstructs = updatedConstructs.map(c => 
            c.id === constructId 
                ? { 
                    ...c, 
                    skills: c.skills.map(s => s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s)
                  }
                : c
        );

        set({ constructs: finalConstructs, entropyEntities: updatedEnemies });
        
        // Check Victory
        if (updatedEnemies.every(e => e.isDead)) {
            setTimeout(() => set({ battleState: 'VICTORY', currentScreen: 'CAUSALITY_RECORD' }), 1000);
        } else {
             get().nextTurn();
        }
    },

    answerQuestion: (optionIndex) => {
        const { currentQuestion, entropyEntities, addBattleLog, addDamageIndicator } = get();
        if (!currentQuestion) return;

        const isCorrect = currentQuestion.correctOptionIndex === optionIndex; // Simplify for single choice

        if (isCorrect) {
            addBattleLog('Logic Verified. Entropy Reduced.', 'system');
            // Deal damage to random enemy or all
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
            addBattleLog('Logic Error! Entropy Increasing!', 'system');
            set({ glitchIntensity: Math.min(1, get().glitchIntensity + 0.2) });
            // Take damage
            const damage = 20;
            const updatedConstructs = get().constructs.map(c => {
                 const newHp = Math.max(0, c.hp - damage);
                 addDamageIndicator({ value: damage, x: 50, y: 50, type: 'damage' }); // Should be on player
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
        
        // Cooldown reduction
        const updatedConstructs = get().constructs.map(c => ({
            ...c,
            skills: c.skills.map(s => ({ ...s, currentCooldown: Math.max(0, s.currentCooldown - 1) }))
        }));

        // Next Question
        const nextQ = questionQueue.length > 0 ? questionQueue[0] : SAMPLE_QUESTIONS[0];
        const remainingQ = questionQueue.slice(1);

        set({
            currentTurn: currentTurn + 1,
            constructs: updatedConstructs,
            currentQuestion: nextQ,
            questionQueue: remainingQ.length > 0 ? remainingQ : SAMPLE_QUESTIONS // Loop for demo
        });
    },

    // === Visual Helpers ===
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
