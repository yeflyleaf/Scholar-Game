// ============================
// Project Scholar: The Study Ascension - Type Definitions
// ============================

// 1. Core Entities - 核心实体

// Construct Model - 逻辑构造体型号
export type ConstructModel = "ARBITER" | "WEAVER" | "ARCHITECT";

// Entropy Form - 认知熵形态 (敌人类型)
export type EntropyForm = "WHITE_NOISE" | "IMAGINARY_COLLAPSE" | "SINGULARITY";

// Question Types - 题目类型 (Unchanged)
export type QuestionType =
  | "Single"
  | "Multi"
  | "FillBlank"
  | "TrueFalse"
  | "CaseAnalysis"
  | "Code";

// Battle States - 战斗状态
export type BattleState =
  | "PLAYER_TURN"
  | "ENEMY_TURN"
  | "PROCESSING"
  | "VICTORY"
  | "DEFEAT"
  | "CAUSALITY_RECORD"; // Settlement

// Game Screen - 游戏场景
export type GameScreen =
  | "TITLE"
  | "GRAND_UNIFICATION_SIM" // Level Select (was KnowledgeGrid)
  | "MIND_HACK" // Gacha System
  | "BATTLE"
  | "CAUSALITY_RECORD" // Battle Result (was Reward/GameOver)
  | "SETTINGS";

// Node Status - 星球/节点状态
export type NodeStatus = "LOCKED" | "HIGH_ENTROPY" | "STABLE";

// 2. Combat System - 战斗系统

// Status Effect Type
export type StatusEffectType =
  | "damage_boost"
  | "damage_reduce"
  | "heal_over_time"
  | "shield"
  | "stunned"
  | "logic_lock" // 逻辑死锁 (Stun equivalent)
  | "flow_state" // 心流
  | "entropy_erosion"; // 熵侵蚀

export interface StatusEffect {
  id: string;
  name: string;
  duration: number;
  type: "buff" | "debuff";
  effect: StatusEffectType;
  value: number;
}

export interface Skill {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  type: "active" | "passive" | "ultimate";
  targetType: "self" | "single_enemy" | "all_enemies";
  cost?: number; // Energy/MP cost
  visualEffect?: "data_deletion" | "binary_stream" | "hex_shield"; // For VFX
}

export interface Construct {
  id: string;
  model: ConstructModel;
  name: string;
  title: string; // e.g., "The Arbiter"
  hp: number;
  maxHp: number;
  energy: number; // For skills
  maxEnergy: number;
  skills: Skill[];
  statusEffects: StatusEffect[];
  isDead: boolean;
}

export interface EntropyEntity {
  id: string;
  name: string;
  form: EntropyForm;
  hp: number;
  maxHp: number;
  damage: number;
  questionBank: Question[]; // The "knowledge" they stole
  statusEffects: StatusEffect[];
  isDead: boolean;
  visualGlitchIntensity: number; // 0-1, for rendering glitch effects
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctOptionIndex: number | number[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  timeLimit?: number;
  hint?: string;
  explanation?: string;
  tags?: string[];
}

// 3. Progression System - 进度系统

// Inscription - 核心铭文 (Gacha Items)
export interface Inscription {
  id: string;
  name: string;
  rarity: "R" | "SR" | "SSR";
  description: string;
  effect: (target: Construct | EntropyEntity) => void;
  icon: string; // Hexagon icon path
}

// Level/Chapter - 章节/星球
export interface StarSector {
  id: string;
  name: string; // e.g., "Boot Sector"
  description: string;
  status: NodeStatus;
  difficulty: 1 | 2 | 3 | 4 | 5;
  position: { x: number; y: number }; // For star map UI
  totalQuestions: number;
  entropyEntities: EntropyEntity[];
  rewards: {
    exp: number;
    inscriptions?: Inscription[];
  };
}

// Player Progress - 观测者档案
export interface ObserverProfile {
  name: string;
  level: number;
  exp: number;
  maxExp: number;
  unlockedConstructs: ConstructModel[];
  inventory: Inscription[];
  clearedSectors: string[];
  entropyStabilized: number; // Total entropy reduced (score)
}

// 4. Visuals & Logs

export interface BattleLogEntry {
  id: string;
  message: string;
  type: "system" | "combat" | "dialogue";
  speaker?: string; // e.g., "Arbiter"
  timestamp: number;
}

export interface DamageIndicator {
  id: string;
  value: string | number; // Can be "MISS" or "CRIT"
  x: number;
  y: number;
  type: "damage" | "heal" | "critical" | "deletion"; // deletion = special kill effect
  timestamp: number;
}
