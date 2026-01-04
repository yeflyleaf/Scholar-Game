// ============================
// 赛博学神：神经潜渊 - 常量配置
// ============================

import type { Character, CyberItem, Enemy, KnowledgeNode, Question, Skill } from '../types';

// Cyberpunk Academic Design Colors
export const COLORS = {
  // Primary Colors
  neonGreen: '#39ff14',
  cyberPink: '#ff00ff',
  deepVoid: '#0a0a0a',
  dataBlue: '#00f0ff',
  warningRed: '#ff3333',
  
  // Stats Colors
  hpGreen: '#00ff88',
  overloadPurple: '#9933ff',
  overloadYellow: '#ffff00',
  
  // Effect Colors
  goldGlow: '#ffd700', // 灵光一闪
  psychoRed: '#ff0000', // 赛博精神病
  shieldBlue: '#4488ff',
  healGreen: '#00ff88',
  criticalOrange: '#ff6600',
  
  // UI Colors
  panelBg: 'rgba(10, 10, 10, 0.9)',
  borderGlow: 'rgba(57, 255, 20, 0.3)',
} as const;

// Character Role Configs
export const CHARACTER_CONFIGS: Record<string, {
  color: string;
  archetype: string;
  icon: string;
  specialty: string[];
}> = {
  LogicEngine: {
    color: COLORS.dataBlue,
    archetype: 'DPS',
    icon: 'cpu',
    specialty: ['计算', '推理', '逻辑判断'],
  },
  Archivist: {
    color: COLORS.neonGreen,
    archetype: 'Tank/Control',
    icon: 'database',
    specialty: ['概念记忆', '填空', '历史'],
  },
  Firewall: {
    color: COLORS.cyberPink,
    archetype: 'Support/Healer',
    icon: 'shield',
    specialty: ['综合', '判断题'],
  },
};

// Role Colors for backward compatibility
export const ROLE_COLORS: Record<string, string> = {
  LogicEngine: COLORS.dataBlue,
  Archivist: COLORS.neonGreen,
  Firewall: COLORS.cyberPink,
};

// Enemy Type Colors
export const ENEMY_TYPE_COLORS: Record<string, string> = {
  Minion: '#ff6b35',
  Elite: '#9933ff',
  Boss: '#ff3333',
};

// Role Icons (Lucide icon names)
export const ROLE_ICONS: Record<string, string> = {
  LogicEngine: 'cpu',
  Archivist: 'database',
  Firewall: 'shield',
};

// Enemy Icons
export const ENEMY_ICONS: Record<string, string> = {
  Minion: 'bug',
  Elite: 'zap',
  Boss: 'skull',
};

// Game Constants
export const GAME_CONFIG = {
  // Damage
  baseDamage: 25,
  criticalMultiplier: 1.5,
  
  // Overload
  overloadOnWrongAnswer: 20,
  overloadOnTimeout: 10, // 超时增加全队过载
  overloadDecayPerTurn: 5,
  overloadThreshold: 100,
  
  // Cyberpsychosis Probability
  cyberpsychosisChance: 0.7, // 70%
  optimizationChance: 0.3,   // 30%
  
  // Flow State (灵光一现)
  flowStateDuration: 3,
  flowStateOptionsHidden: 2, // 隐藏2个错误选项
  flowStateDamageMultiplier: 2,
  
  // Timing
  enemyTurnDelay: 1500,
  damageIndicatorDuration: 1500,
  questionTimeLimit: 30, // 默认30秒
  bossQuestionTimeLimit: 60, // Boss题目60秒
  
  // Combo System
  comboThreshold: 3, // 连续答对3题触发多核运算
  
  // Passive Effects
  archivistOverloadReduction: 0.2, // 档案馆员过载伤害减少20%
  firewallBattleHeal: 5, // 防火墙战斗胜利回复过载值
} as const;

// Difficulty Multipliers
export const DIFFICULTY_DAMAGE: Record<number, number> = {
  1: 20,
  2: 25,
  3: 30,
  4: 35,
  5: 50,
};

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: '简单',
  2: '普通',
  3: '中等',
  4: '困难',
  5: '极难',
};

export const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#39ff14',
  2: '#00f0ff',
  3: '#ffff00',
  4: '#ff9933',
  5: '#ff3333',
};

// Default Character Skills
export const DEFAULT_SKILLS: Record<string, Skill[]> = {
  LogicEngine: [
    {
      id: 'brute-force',
      name: '暴力破解',
      nameEn: 'Brute Force',
      description: '单体高伤害攻击。若题目涉及公式计算，暴击率翻倍。',
      cooldown: 0,
      currentCooldown: 0,
      type: 'active',
      targetType: 'enemy',
    },
  ],
  Archivist: [
    {
      id: 'index-search',
      name: '数据检索',
      nameEn: 'Index Search',
      description: '针对多个小怪（填空题）。答对一个空，眩晕敌人一回合。',
      cooldown: 2,
      currentCooldown: 0,
      type: 'active',
      targetType: 'enemy',
    },
  ],
  Firewall: [
    {
      id: 'exception-catch',
      name: '异常拦截',
      nameEn: 'Exception Catch',
      description: '为队友施加护盾，抵消一次答错带来的过载增加。',
      cooldown: 3,
      currentCooldown: 0,
      type: 'active',
      targetType: 'ally',
    },
  ],
};

// Default Passive Abilities
export const PASSIVE_ABILITIES: Record<string, {
  name: string;
  nameEn: string;
  description: string;
}> = {
  LogicEngine: {
    name: '多核运算',
    nameEn: 'Multi-Core Processing',
    description: '连续答对3题后，下一次攻击变为AOE（群体攻击）',
  },
  Archivist: {
    name: '只读存储',
    nameEn: 'Read-Only Storage',
    description: '自身受到的"过载伤害"降低 20%',
  },
  Firewall: {
    name: '系统重构',
    nameEn: 'System Rebuild',
    description: '战斗胜利后，微量回复全队过载值',
  },
};

// Initial Party - 初始小队
export const createInitialParty = (): Character[] => [
  {
    id: 'char-logic',
    name: '逻辑引擎',
    nameEn: 'Logic Engine',
    role: 'LogicEngine',
    archetype: 'DPS',
    hp: 100,
    maxHp: 100,
    overload: 0,
    statusEffects: [],
    skills: DEFAULT_SKILLS.LogicEngine,
    passiveAbility: {
      name: '多核运算',
      nameEn: 'Multi-Core Processing',
      description: '连续答对3题后，下一次攻击变为AOE',
      isActive: false,
      stacks: 0,
    },
    isDisabled: false,
    color: COLORS.dataBlue,
  },
  {
    id: 'char-archivist',
    name: '档案馆员',
    nameEn: 'The Archivist',
    role: 'Archivist',
    archetype: 'Tank/Control',
    hp: 120,
    maxHp: 120,
    overload: 0,
    statusEffects: [],
    skills: DEFAULT_SKILLS.Archivist,
    passiveAbility: {
      name: '只读存储',
      nameEn: 'Read-Only Storage',
      description: '自身受到的"过载伤害"降低 20%',
      isActive: true,
    },
    isDisabled: false,
    color: COLORS.neonGreen,
  },
  {
    id: 'char-firewall',
    name: '防火墙',
    nameEn: 'The Firewall',
    role: 'Firewall',
    archetype: 'Support/Healer',
    hp: 80,
    maxHp: 80,
    overload: 0,
    statusEffects: [],
    skills: DEFAULT_SKILLS.Firewall,
    passiveAbility: {
      name: '系统重构',
      nameEn: 'System Rebuild',
      description: '战斗胜利后，微量回复全队过载值',
      isActive: true,
    },
    isDisabled: false,
    color: COLORS.cyberPink,
  },
];

// Sample Questions for Demo
export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: '在JavaScript中，以下哪个方法用于向数组末尾添加元素？',
    type: 'Single',
    options: ['push()', 'pop()', 'shift()', 'unshift()'],
    correctOptionIndex: 0,
    difficulty: 1,
    timeLimit: 30,
    explanation: 'push() 方法将一个或多个元素添加到数组的末尾，并返回数组的新长度。',
  },
  {
    id: 'q2',
    text: 'React Hooks中，useEffect的第二个参数是什么？',
    type: 'Single',
    options: ['回调函数', '依赖数组', '初始状态', '清理函数'],
    correctOptionIndex: 1,
    difficulty: 2,
    timeLimit: 30,
    explanation: 'useEffect的第二个参数是依赖数组，用于控制副作用何时重新执行。',
  },
  {
    id: 'q3',
    text: 'TypeScript中，interface和type的主要区别是什么？',
    type: 'Single',
    options: ['没有区别', 'interface可以被扩展，type可以使用联合类型', 'type更快', 'interface不支持泛型'],
    correctOptionIndex: 1,
    difficulty: 3,
    timeLimit: 45,
    explanation: 'interface可以被继承和扩展，而type更适合定义联合类型、交叉类型等。',
  },
  {
    id: 'q4',
    text: 'CSS Flexbox中，justify-content的默认值是？',
    type: 'Single',
    options: ['center', 'flex-start', 'space-between', 'stretch'],
    correctOptionIndex: 1,
    difficulty: 2,
    timeLimit: 30,
    explanation: 'justify-content的默认值是flex-start，将子元素排列在主轴的起始位置。',
  },
  {
    id: 'q5',
    text: '以下哪个HTTP状态码表示"未授权"？',
    type: 'Single',
    options: ['400', '401', '403', '404'],
    correctOptionIndex: 1,
    difficulty: 1,
    timeLimit: 20,
    explanation: '401 Unauthorized 表示请求需要用户认证。',
  },
  {
    id: 'q6',
    text: 'Promise.all() 在以下哪种情况下会reject？',
    type: 'Single',
    options: ['所有Promise都resolve', '任意一个Promise reject', '超过一半Promise reject', '最后一个Promise reject'],
    correctOptionIndex: 1,
    difficulty: 3,
    timeLimit: 30,
    explanation: 'Promise.all() 在任意一个Promise被reject时，整体就会reject。',
  },
  {
    id: 'q7',
    text: 'Git中，用于查看提交历史的命令是？',
    type: 'Single',
    options: ['git status', 'git log', 'git diff', 'git show'],
    correctOptionIndex: 1,
    difficulty: 1,
    timeLimit: 20,
    explanation: 'git log 用于查看项目的提交历史记录。',
  },
  {
    id: 'q8',
    text: '在React中，useState返回的数组第二个元素是什么？',
    type: 'Single',
    options: ['当前状态值', '状态更新函数', '初始状态', '状态类型'],
    correctOptionIndex: 1,
    difficulty: 2,
    timeLimit: 30,
    explanation: 'useState返回一个数组，第一个元素是当前状态值，第二个元素是更新状态的函数。',
  },
];

// Create Initial Enemies - 初始敌人
export const createInitialEnemies = (): Enemy[] => [
  {
    id: 'enemy-1',
    name: '语法错误',
    type: 'Minion',
    hp: 40,
    maxHp: 40,
    damage: 10,
    questionBank: SAMPLE_QUESTIONS.slice(0, 2),
    isStunned: false,
    stunDuration: 0,
  },
  {
    id: 'enemy-2',
    name: '逻辑门卫',
    type: 'Elite',
    hp: 80,
    maxHp: 80,
    damage: 15,
    questionBank: SAMPLE_QUESTIONS.slice(2, 5),
    specialAbility: {
      name: '记忆干扰',
      description: '将题目中的关键信息打上马赛克',
      triggerCondition: '每3回合触发一次',
    },
    isStunned: false,
    stunDuration: 0,
  },
  {
    id: 'enemy-3',
    name: '病毒核心',
    type: 'Boss',
    hp: 150,
    maxHp: 150,
    damage: 25,
    questionBank: SAMPLE_QUESTIONS.slice(5),
    specialAbility: {
      name: '系统崩溃',
      description: '玩家答错时，额外增加10点过载',
      triggerCondition: 'HP低于50%时激活',
    },
    isStunned: false,
    stunDuration: 0,
  },
];

// Default Cyber Items - 赛博道具
export const DEFAULT_ITEMS: CyberItem[] = [
  {
    id: 'item-ddos',
    name: 'DDOS攻击',
    nameEn: 'DDOS Attack',
    description: '跳过当前题目，不扣血但也不造成伤害，战斗轮次延后',
    icon: 'skip-forward',
    quantity: 2,
    type: 'battle',
    effect: () => {},
  },
  {
    id: 'item-sql-injection',
    name: 'SQL注入',
    nameEn: 'SQL Injection',
    description: '针对多选题，自动选中一个正确选项',
    icon: 'code',
    quantity: 3,
    type: 'battle',
    effect: () => {},
  },
  {
    id: 'item-antivirus',
    name: '杀毒软件',
    nameEn: 'Antivirus',
    description: '休息阶段使用，消除错题本中的记录，降低全队过载值',
    icon: 'shield-check',
    quantity: 1,
    type: 'rest',
    effect: () => {},
  },
  {
    id: 'item-denoiser',
    name: '去噪工具',
    nameEn: 'Denoiser',
    description: '消耗能量使用，清除Boss的记忆干扰效果',
    icon: 'eye',
    quantity: 2,
    type: 'battle',
    effect: () => {},
  },
];

// Knowledge Grid Nodes - 知识网络节点
export const DEMO_KNOWLEDGE_NODES: KnowledgeNode[] = [
  {
    id: 'node-basics',
    name: 'JavaScript基础',
    description: '本章节包含15个知识实体，危险等级：低',
    status: 'available',
    difficulty: 1,
    prerequisites: [],
    position: { x: 10, y: 50 },
    questionCount: 15,
    enemies: [],
    isCompleted: false,
    isBoss: false,
  },
  {
    id: 'node-react-intro',
    name: 'React入门',
    description: '本章节包含20个知识实体，危险等级：中',
    status: 'locked',
    difficulty: 2,
    prerequisites: ['node-basics'],
    position: { x: 30, y: 30 },
    questionCount: 20,
    enemies: [],
    isCompleted: false,
    isBoss: false,
  },
  {
    id: 'node-typescript',
    name: 'TypeScript进阶',
    description: '本章节包含25个知识实体，危险等级：高',
    status: 'locked',
    difficulty: 3,
    prerequisites: ['node-basics'],
    position: { x: 30, y: 70 },
    questionCount: 25,
    enemies: [],
    isCompleted: false,
    isBoss: false,
  },
  {
    id: 'node-hooks',
    name: 'React Hooks深入',
    description: '本章节包含18个知识实体，危险等级：高',
    status: 'locked',
    difficulty: 3,
    prerequisites: ['node-react-intro'],
    position: { x: 50, y: 40 },
    questionCount: 18,
    enemies: [],
    isCompleted: false,
    isBoss: false,
  },
  {
    id: 'node-advanced',
    name: '高级模式',
    description: '本章节包含30个知识实体，危险等级：极高',
    status: 'locked',
    difficulty: 4,
    prerequisites: ['node-hooks', 'node-typescript'],
    position: { x: 70, y: 50 },
    questionCount: 30,
    enemies: [],
    isCompleted: false,
    isBoss: false,
  },
  {
    id: 'node-boss',
    name: '图灵审查程序',
    description: '最终挑战 - 综合案例分析',
    status: 'locked',
    difficulty: 5,
    prerequisites: ['node-advanced'],
    position: { x: 90, y: 50 },
    questionCount: 10,
    enemies: [],
    isCompleted: false,
    isBoss: true,
  },
];

// Narrative Texts
export const NARRATIVE = {
  worldBackground: '2077年，知识不再免费。巨型企业"荒坂教育 (Arasaka Edu)"垄断了所有高等学科，将其锁在被称为"赛博格里 (Cyberglyph)"的数据要塞中。',
  playerIdentity: '你是一名"知识行者 (Knowledge Runner)"。你需要通过非法的"神经潜渊"手段，强行接入数据要塞。',
  goal: '赶在"图灵审查程序（期末考试）"启动前，将核心资料完整下载到自己的大脑皮层。',
  enemy: '数据幽灵 (Data Phantoms) —— 由你未掌握的知识点异化而成的防御程序。',
};
