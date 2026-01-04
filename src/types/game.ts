// ============================
// 赛博学神：神经潜渊 - 类型定义
// ============================

// Character Roles - 神经代理人角色
export type CharacterRole = 'LogicEngine' | 'Archivist' | 'Firewall';

// Enemy Types - 数据幽灵类型
export type EnemyType = 'Minion' | 'Elite' | 'Boss';

// Question Types - 题目类型
export type QuestionType = 'Single' | 'Multi' | 'FillBlank' | 'TrueFalse' | 'CaseAnalysis' | 'Code';

// Battle States - 战斗状态
export type BattleState = 
  | 'PLAYER_TURN' 
  | 'ENEMY_TURN' 
  | 'PROCESSING' 
  | 'WIN' 
  | 'LOSE' 
  | 'REWARD';

// Game Screen - 游戏场景
export type GameScreen = 
  | 'TITLE' 
  | 'KNOWLEDGE_GRID' 
  | 'BATTLE' 
  | 'REWARD' 
  | 'REST' 
  | 'GAME_OVER'
  | 'SETTINGS';

// Node Status - 节点状态
export type NodeStatus = 'locked' | 'available' | 'completed';

// Overload Result - 过载爆发结果
export type OverloadResult = 'cyberpsychosis' | 'optimization' | null;

// Cyberpsychosis Symptom - 赛博精神病症状
export type CyberpsychosisSymptom = 
  | 'command_refuse'    // 拒绝指令
  | 'random_answer'     // 乱选
  | 'despair';          // 绝望

// Status Effect Type
export type StatusEffectType = 
  | 'damage_boost' 
  | 'damage_reduce' 
  | 'heal_over_time' 
  | 'overload_reduce'
  | 'shield'           // 护盾
  | 'stunned'          // 眩晕
  | 'flow_state'       // 心流状态
  | 'cyberpsychosis'   // 赛博精神病
  | 'multi_core';      // 多核运算激活

// Status Effect
export interface StatusEffect {
  id: string;
  name: string;
  duration: number;
  type: 'buff' | 'debuff';
  effect: StatusEffectType;
  value: number;
  symptom?: CyberpsychosisSymptom;
}

// Skill - 技能
export interface Skill {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  type: 'active' | 'passive';
  targetType: 'self' | 'ally' | 'enemy' | 'all_allies' | 'all_enemies';
  cost?: number; // 能量消耗
}

// Question Interface - 题目
export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctOptionIndex: number | number[]; // number[] for Multi type
  difficulty: 1 | 2 | 3 | 4 | 5;
  timeLimit?: number; // 答题时限（秒）
  hint?: string; // 提示
  explanation?: string; // 解析
  tags?: string[]; // 知识点标签
  isObfuscated?: boolean; // 是否被干扰（马赛克）
}

// Character Interface - 神经代理人
export interface Character {
  id: string;
  name: string;
  nameEn: string;
  role: CharacterRole;
  archetype: string; // 原型（DPS/Tank/Support）
  hp: number;
  maxHp: number;
  overload: number; // 0-100
  statusEffects: StatusEffect[];
  skills: Skill[];
  passiveAbility: {
    name: string;
    nameEn: string;
    description: string;
    isActive: boolean;
    stacks?: number; // 如逻辑引擎的连续答对计数
  };
  isDisabled: boolean; // 是否被禁用（赛博精神病拒绝指令）
  avatar?: string;
  color: string;
}

// Enemy Interface - 数据幽灵
export interface Enemy {
  id: string;
  name: string;
  type: EnemyType;
  hp: number;
  maxHp: number;
  damage: number;
  questionBank: Question[];
  specialAbility?: {
    name: string;
    description: string;
    triggerCondition: string;
  };
  avatar?: string;
  isStunned: boolean;
  stunDuration: number;
}

// Knowledge Node - 知识节点
export interface KnowledgeNode {
  id: string;
  name: string;
  description: string;
  status: NodeStatus;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prerequisites: string[]; // 前置节点ID
  position: { x: number; y: number };
  questionCount: number;
  enemies: Enemy[];
  rewards?: {
    exp?: number;
    items?: string[];
    skillUpgrade?: string;
  };
  isCompleted: boolean;
  isBoss: boolean;
}

// Cyber Items - 赛博道具
export interface CyberItem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  quantity: number;
  type: 'battle' | 'rest' | 'passive';
  effect: () => void;
}

// Damage Indicator for floating damage numbers
export interface DamageIndicator {
  id: string;
  value: number;
  x: number;
  y: number;
  type: 'damage' | 'heal' | 'overload' | 'critical' | 'shield' | 'miss';
  timestamp: number;
  text?: string;
  color?: string;
}

// Battle Log Entry
export interface BattleLogEntry {
  id: string;
  message: string;
  type: 'info' | 'damage' | 'heal' | 'overload' | 'system' | 'skill' | 'critical' | 'cyberpsychosis' | 'optimization';
  timestamp: number;
  icon?: string;
}

// Game Progress
export interface GameProgress {
  currentChapter: number;
  completedNodes: string[];
  totalExp: number;
  itemsCollected: CyberItem[];
  wrongAnswers: Question[]; // 错题本
  correctStreak: number;
  totalQuestions: number;
  correctAnswers: number;
}

// Timer State
export interface TimerState {
  isRunning: boolean;
  timeRemaining: number;
  totalTime: number;
}

// Skill Animation
export interface SkillAnimation {
  skillId: string;
  characterId: string;
  targetId?: string;
  isPlaying: boolean;
  type: 'attack' | 'heal' | 'buff' | 'debuff' | 'special';
}
