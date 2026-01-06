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
  // AI动态生成的题目（可选）- 若存在则优先使用
  aiQuestions?: Question[];
  // AI生成的元数据
  aiGenerated?: {
    generatedAt: number; // 生成时间戳
    sourceTitle: string; // 生成来源标题
  };
  missionBriefing?: string; // AI生成的任务简报
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

// 6. 动态主题配置 - 支持AI生成全部游戏文本
export interface GameTheme {
  // 主题元数据
  id: string;
  name: string;                    // 主题名称，如 "计算机操作系统"
  generatedAt: number;             // 生成时间戳
  sourceContent: string;           // 原始学习资料摘要

  // 页面标题配置
  pageLabels: {
    levelSelect: {
      title: string;               // 原 "大统一理论演练"
      subtitle: string;            // 副标题
      sectorAnalysis: string;      // 原 "扇区分析"
      missionBriefing: string;     // 原 "任务简报"
      startButton: string;         // 原 "开始潜渊"
      backButton: string;          // 原 "中止链接"
      mindHackButton: string;      // 原 "思维骇入"
    };
    battle: {
      constructsLabel: string;     // 原 "逻辑构造体"
      entropyLabel: string;        // 原 "认知熵实体"
      battleLogLabel: string;      // 原 "战斗日志"
      retreatButton: string;       // 原 "撤退"
      turnLabel: string;           // 原 "回合"
    };
    mindHack: {
      title: string;               // 原 "思维骇入"
      subtitle: string;            // 副标题
      hackButton: string;          // 原 "启动骇入"
      hackingText: string;         // 原 "正在穿透量子屏障..."
      confirmButton: string;       // 原 "确认接收"
      backButton: string;          // 原 "返回星图"
      warningText: string;         // 能量消耗警告
    };
  };

  // 构造体配置（玩家角色）
  constructs: Array<{
    id: string;
    model: ConstructModel;
    name: string;                  // 原 "裁决者"/"织网者"/"虚构者"
    title: string;                 // 原 "The Arbiter" 等
    description: string;           // 角色描述
    skills: Array<{
      id: string;
      name: string;                // 技能名称
      nameEn: string;              // 英文名称
      description: string;         // 技能描述
    }>;
  }>;

  // 铭文配置（抽卡物品）
  inscriptions: Array<{
    id: string;
    name: string;                  // 原 "银行家算法"
    rarity: "R" | "SR" | "SSR";
    description: string;           // 铭文效果描述
  }>;

  // 战斗日志模板
  battleLogTemplates: {
    enterSector: string;           // 进入扇区消息模板
    entropyStatus: {
      stable: string;              // 稳定状态
      highEntropy: string;         // 高熵警报
      locked: string;              // 已锁定
    };
    questionSource: {
      ai: string;                  // AI题目来源
      builtin: string;             // 内置题库来源
    };
    answerCorrect: string;         // 答对消息
    answerWrong: string;           // 答错消息
    skillUsed: string;             // 使用技能消息模板
    enemyDefeated: string;         // 击败敌人消息
    victory: string;               // 胜利消息
    defeat: string;                // 失败消息
  };
}

// 默认主题ID
export const DEFAULT_THEME_ID = 'default-cyber-scholar';
