// ============================
// 学者计划：飞升学习 - 类型定义
// ============================

// 1. Core Entities - 核心实体

// Construct Model - 逻辑构造体型号
export type ConstructModel = "ARBITER" | "WEAVER" | "ARCHITECT";

// Entropy Form - 认知熵形态 (敌人类型)
export type EntropyForm = "WHITE_NOISE" | "IMAGINARY_COLLAPSE" | "SINGULARITY";

// Question Types - 题目类型
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
  | "CAUSALITY_RECORD"; // 结算

// Game Screen - 游戏场景
export type GameScreen =
  | "TITLE"
  | "GRAND_UNIFICATION_SIM" // 关卡选择 (原 KnowledgeGrid)
  | "MIND_HACK" // 抽卡系统
  | "BATTLE"
  | "CAUSALITY_RECORD" // 战斗结果 (原 Reward/GameOver)
  | "SETTINGS";

// Node Status - 星球/节点状态
export type NodeStatus = "LOCKED" | "HIGH_ENTROPY" | "STABLE";

// 2. Combat System - 战斗系统

// 状态效果类型
export type StatusEffectType =
  | "damage_boost"
  | "damage_reduce"
  | "heal_over_time"
  | "shield"
  | "stunned"
  | "logic_lock" // 逻辑死锁 (相当于眩晕)
  | "flow_state" // 心流状态
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
  cost?: number; // 能量/MP 消耗
  visualEffect?: "data_deletion" | "binary_stream" | "hex_shield"; // 用于视觉特效
}

export interface Construct {
  id: string;
  model: ConstructModel;
  name: string;
  title: string; // 例如："The Arbiter"
  hp: number;
  maxHp: number;
  energy: number; // 用于技能
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
  questionBank: Question[]; // 它们窃取的“知识”
  statusEffects: StatusEffect[];
  isDead: boolean;
  visualGlitchIntensity: number; // 0-1，用于渲染故障特效
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctOptionIndex: number | number[];
  difficulty: 1 | 2 | 3 | 4 | 5 | 6;
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
  icon: string; // 六边形图标路径
}

// Level/Chapter - 章节/星球
export interface StarSector {
  id: string;
  name: string; // 例如："Boot Sector"
  description: string;
  status: NodeStatus;
  difficulty: 1 | 2 | 3 | 4 | 5 | 6;
  position: { x: number; y: number }; // 用于星图 UI
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
  entropyStabilized: number; // 总共降低的熵值 (分数)
}

// 4. 视觉效果与日志

export interface BattleLogEntry {
  id: string;
  message: string;
  type: "system" | "combat" | "dialogue";
  speaker?: string; // 例如："Arbiter"
  timestamp: number;
}

export interface DamageIndicator {
  id: string;
  value: string | number; // 可以是 "MISS" 或 "CRIT"
  x: number;
  y: number;
  type: "damage" | "heal" | "critical" | "deletion"; // deletion = 特殊击杀特效
  timestamp: number;
}

// 5. System Settings - 系统设置
export interface GameSettings {
  resolution: string; // "1920x1080", etc.
  fullscreen: boolean;
  language: "zh-CN" | "en-US";
}
