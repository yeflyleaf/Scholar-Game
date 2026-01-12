// ============================
// 学者计划：飞升学习 - 常量与配置
// ============================
// Author: yeflyleaf
// GitHub: https://github.com/yeflyleaf
// ============================

// 应用元信息
export const APP_META = {
  author: "yeflyleaf",
  authorGithub: "https://github.com/yeflyleaf",
  appName: "学者计划：飞升学习",
} as const;

import type {
    Construct,
    EnemySkill,
    EntropyEntity,
    GameTheme,
    Inscription,
    Question,
    StarSector,
} from "../types/game";

// 1. 视觉美学
export const COLORS = {
  coldWhite: "#F0F8FF",
  deepSpaceBlue: "#0B0E14",
  glitchRed: "#FF003C",
  holographicGold: "#D4AF37",
  neonCyan: "#00F3FF",
  hexBorder: "rgba(0, 243, 255, 0.3)",
  hexFill: "rgba(11, 14, 20, 0.85)",
  stable: "#39FF14",
  highEntropy: "#FF003C",
  locked: "#4A4A4A",
} as const;

// 2. 逻辑构造体定义
// 初始可用的逻辑构造体（玩家角色）列表
export const INITIAL_CONSTRUCTS: Construct[] = [
  {
    id: "construct-01",
    model: "ARBITER",
    name: "裁决者",
    title: "The Arbiter",
    attack: 15,
    hp: 500,
    maxHp: 500,
    energy: 100,
    maxEnergy: 100,
    isDead: false,
    statusEffects: [],
    skills: [
      {
        id: "skill-arbiter-1",
        name: "强制中断",
        nameEn: "Force Interrupt",
        description: "对单体造成高额逻辑伤害 (30点伤害)。",
        cooldown: 8,
        currentCooldown: 0,
        type: "active",
        targetType: "single_enemy",
        cost: 60,
        visualEffect: "data_deletion",
      },
      {
        id: "skill-arbiter-ult",
        name: "最终裁定",
        nameEn: "Final Verdict",
        description:
          "消耗所有能量，对全体敌人造成毁灭性打击 (30点伤害)。",
        cooldown: 20,
        currentCooldown: 0,
        type: "ultimate",
        targetType: "all_enemies",
        cost: 100,
        visualEffect: "binary_stream",
      },
    ],
  },
  {
    id: "construct-02",
    model: "WEAVER",
    name: "织网者",
    title: "The Weaver",
    attack: 15,
    hp: 350,
    maxHp: 350,
    energy: 300,
    maxEnergy: 300,
    isDead: false,
    statusEffects: [],
    skills: [
      {
        id: "skill-weaver-1",
        name: "链路封锁",
        nameEn: "Link Blockade",
        description:
          "对全体敌人施加'逻辑死锁'（无法行动一回合）。",
        cooldown: 10,
        currentCooldown: 0,
        type: "active",
        targetType: "all_enemies",
        cost: 80,
        visualEffect: "hex_shield",
      },
      {
        id: "skill-weaver-ult",
        name: "广播风暴",
        nameEn: "Broadcast Storm",
        description:
          "消耗所有能量，引发网络风暴，对全体敌人造成高频伤害20点，并使其攻击力降低20，持续三回合。",
        cooldown: 20,
        currentCooldown: 0,
        type: "ultimate",
        targetType: "all_enemies",
        cost: 250,
        visualEffect: "digital_storm",
      },
    ],
  },
  {
    id: "construct-03",
    model: "ARCHITECT",
    name: "虚构者",
    title: "The Architect",
    attack: 15,
    hp: 400,
    maxHp: 400,
    energy: 150,
    maxEnergy: 150,
    isDead: false,
    statusEffects: [],
    skills: [
      {
        id: "skill-architect-1",
        name: "哈希重构",
        nameEn: "Hash Rebuild",
        description: "为我方全体施加护盾 (使下一次受到的伤害降低20点)，并修复自身受损的逻辑扇区（自身回复20生命值）。",
        cooldown: 15,
        currentCooldown: 0,
        type: "active",
        targetType: "self",
        cost: 100,
        visualEffect: "hex_shield",
      },
      {
        id: "skill-architect-ult",
        name: "系统还原",
        nameEn: "System Restore",
        description:
          "消耗所有能量，将全体队友分别回复最大生命和最大能量的25%。",
        cooldown: 20,
        currentCooldown: 0,
        type: "ultimate",
        targetType: "ally",
        cost: 150,
        visualEffect: "time_rewind",
      },
    ],
  },
];

// 3. 样本题目
export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "在操作系统中，死锁产生的必要条件不包括？",
    type: "Single",
    options: ["互斥条件", "请求与保持条件", "不剥夺条件", "时间片轮转条件"],
    correctOptionIndex: 3,
    difficulty: 1,
    timeLimit: 30,
    explanation:
      "死锁的四个必要条件是：互斥、请求与保持、不剥夺、循环等待。时间片轮转是调度算法。",
    tags: ["OS", "Deadlock"],
  },
  {
    id: "q2",
    text: "TCP协议的三次握手中，第二次握手发送的标志位是？",
    type: "Single",
    options: ["SYN", "ACK", "SYN+ACK", "FIN"],
    correctOptionIndex: 2,
    difficulty: 2,
    timeLimit: 30,
    explanation: "第二次握手是服务器收到SYN后，回复SYN+ACK确认。",
    tags: ["Network", "TCP"],
  },
  {
    id: "q3",
    text: "二叉树的前序遍历顺序是？",
    type: "Single",
    options: ["左-根-右", "根-左-右", "左-右-根", "根-右-左"],
    correctOptionIndex: 1,
    difficulty: 1,
    timeLimit: 20,
    explanation: "前序遍历：根节点 -> 左子树 -> 右子树。",
    tags: ["DataStructure", "Tree"],
  },
  {
    id: "q4",
    text: "数据库事务的ACID特性中，I代表什么？",
    type: "Single",
    options: [
      "Isolation (隔离性)",
      "Integrity (完整性)",
      "Identity (一致性)",
      "Immediate (即时性)",
    ],
    correctOptionIndex: 0,
    difficulty: 2,
    timeLimit: 30,
    explanation:
      "ACID代表Atomicity(原子性), Consistency(一致性), Isolation(隔离性), Durability(持久性)。",
    tags: ["Database", "Transaction"],
  },
  {
    id: "q5",
    text: "快速排序在最坏情况下的时间复杂度是？",
    type: "Single",
    options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
    correctOptionIndex: 2,
    difficulty: 3,
    timeLimit: 30,
    explanation:
      "快速排序平均时间复杂度为O(n log n)，但在最坏情况下（如数组已有序）为O(n^2)。",
    tags: ["Algorithm", "Sorting"],
  },
  {
    id: "q6",
    text: "CPU缓存（Cache）的主要作用是？",
    type: "Single",
    options: [
      "增加硬盘容量",
      "解决CPU与内存速度不匹配问题",
      "提高CPU主频",
      "防止数据丢失",
    ],
    correctOptionIndex: 1,
    difficulty: 2,
    timeLimit: 25,
    explanation:
      "Cache位于CPU和主存之间，用于缓解CPU速度快而内存速度慢的矛盾。",
    tags: ["Architecture", "Hardware"],
  },
  {
    id: "q7",
    text: "以下哪些是面向对象编程(OOP)的三大特性？(多选)",
    type: "Multi",
    options: [
      "封装 (Encapsulation)",
      "多态 (Polymorphism)",
      "编译 (Compilation)",
      "继承 (Inheritance)",
    ],
    correctOptionIndex: [0, 1, 3],
    difficulty: 2,
    timeLimit: 40,
    explanation:
      "面向对象编程的三大特性是：封装、继承、多态。编译是程序构建过程。",
    tags: ["Programming", "OOP"],
  },
  {
    id: "q8",
    text: "HTTP协议是基于TCP/IP协议之上的应用层协议。",
    type: "TrueFalse",
    options: ["正确", "错误"],
    correctOptionIndex: 0,
    difficulty: 1,
    timeLimit: 20,
    explanation: "HTTP确实是应用层协议，传输层依赖TCP。",
    tags: ["Network", "HTTP"],
  },
  {
    id: "q9",
    text: "栈(Stack)是一种先进先出(FIFO)的数据结构。",
    type: "TrueFalse",
    options: ["正确", "错误"],
    correctOptionIndex: 1,
    difficulty: 1,
    timeLimit: 20,
    explanation: "栈是后进先出(LIFO)的数据结构，队列才是先进先出(FIFO)。",
    tags: ["DataStructure", "Stack"],
  },
];

// 3.5 敌人专属技能定义
// 每个认知熵实体都拥有一个符合其主题的专属技能
// 触发机制已更新：大部分技能在敌人攻击时触发，详见 游戏数值机制一览.md
export const ENEMY_SKILLS: Record<string, EnemySkill> = {
  // 🔊 白噪·干扰者 - 信号干扰 (Signal Interference)
  // 类型: 减益 | 触发条件: 攻击时触发 | 效果: 下一道题答题时间减少5秒
  "skill-white-noise": {
    id: "skill-white-noise",
    name: "信号干扰",
    nameEn: "Signal Interference",
    description: "释放高频噪声，干扰逻辑构造体的信息接收，使随机一个逻辑构造体损失10点能量。",
    type: "debuff_player",
    cooldown: 5,
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" },
    effect: {
      specialEffect: "reduce_time_limit",
      statusToApply: {
        effectType: "entropy_erosion",
        duration: 1,
        value: 10,
      },
    },
    visualEffect: "static_noise",
  },

  // 🌀 虚数·崩坏体 - 虚空坍缩 (Void Collapse)
  // 类型: 伤害 | 触发条件: 攻击时触发 | 效果: 1.5倍真实伤害，无视护盾和减伤
  "skill-imaginary-collapse": {
    id: "skill-imaginary-collapse",
    name: "虚空坍缩",
    nameEn: "Void Collapse",
    description: "引发虚数空间坍缩，造成2倍基础伤害的真实伤害，无视所有护盾和减伤效果。",
    type: "damage_single",
    cooldown: 15,
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" },
    effect: {
      damageMultiplier: 2.0,
      specialEffect: "true_damage",
    },
    visualEffect: "void_implosion",
  },

  // ⚠️ 空指针·虚空 - 引用消解 (Reference Dissolution)
  // 类型: 减益 | 触发条件: 攻击时触发 | 效果: 随机使一个已就绪技能进入3回合冷却
  "skill-null-pointer": {
    id: "skill-null-pointer",
    name: "引用消解",
    nameEn: "Reference Dissolution",
    description: "消解逻辑链接，随机使一名逻辑构造体的一个已就绪技能进入3回合冷却。",
    type: "debuff_player",
    cooldown: 20,
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" },
    effect: {
      specialEffect: "force_cooldown",
      statusToApply: {
        effectType: "logic_lock",
        duration: 3,
        value: 1,
      },
    },
    visualEffect: "null_void",
  },

  // 💧 内存·泄露者 - 资源侵蚀 (Resource Erosion)
  // 类型: 减益 | 触发条件: 攻击时触发 | 效果: 全体3回合内每回合损失5点能量
  "skill-memory-leak": {
    id: "skill-memory-leak",
    name: "资源侵蚀",
    nameEn: "Resource Erosion",
    description: "悄然吞噬系统资源，全体逻辑构造体在3回合内每回合损失10点能量。",
    type: "debuff_player",
    cooldown: 10,
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" },
    effect: {
      specialEffect: "energy_drain",
      statusToApply: {
        effectType: "entropy_erosion",
        duration: 3,
        value: 10,
      },
    },
    visualEffect: "data_leak",
  },

  // 📚 栈溢出·巨像 - 递归压制 (Recursive Oppression)
  // 类型: 自强 | 触发条件: 攻击时触发 | 效果: 攻击力每回合+10%，持续4回合(最高+40%)
  "skill-stack-overflow": {
    id: "skill-stack-overflow",
    name: "递归压制",
    nameEn: "Recursive Oppression",
    description: "进入失控递归状态，攻击力每回合增加10点，持续4回合（最高40点加成）。",
    type: "self_buff",
    cooldown: 12,
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" },
    effect: {
      specialEffect: "stacking_damage",
      statusToApply: {
        effectType: "damage_boost",
        duration: 4,
        value: 10,
      },
    },
    visualEffect: "stack_explosion",
  },

  // 🔗 死锁·幽灵 - 资源禁锢 (Resource Imprisonment)
  // 类型: 控制 | 触发条件: 攻击时触发 | 效果: 随机一名玩家陷入「逻辑死锁」2回合
  "skill-deadlock": {
    id: "skill-deadlock",
    name: "资源禁锢",
    nameEn: "Resource Imprisonment",
    description: "形成逻辑死锁，随机使一名逻辑构造体陷入「逻辑死锁」状态，无法行动2回合。",
    type: "debuff_player",
    cooldown: 8,
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" },
    effect: {
      specialEffect: "stun_single",
      statusToApply: {
        effectType: "logic_lock",
        duration: 2,
        value: 100,
      },
    },
    visualEffect: "chain_lock",
  },

  // ⏱️ 竞态·幻影 - 时序混乱 (Temporal Chaos)
  // 类型: 特殊 | 触发条件: 攻击时触发 | 效果: 清空随机一个玩家的能量
  "skill-race-condition": {
    id: "skill-race-condition",
    name: "时序混乱",
    nameEn: "Temporal Chaos",
    description: "扰乱时间线，使随机一个逻辑构造体的能量清空！",
    type: "special",
    cooldown: 30,
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" },
    effect: {
      specialEffect: "drain_all_energy",
    },
    visualEffect: "time_distortion",
  },

  // 💀 蓝屏·恐惧 - 系统崩溃 (System Crash)
  // 类型: 处决 | 触发条件: 攻击时触发 | 效果: 若玩家血量<40%，对其造成2倍伤害
  "skill-bsod-terror": {
    id: "skill-bsod-terror",
    name: "系统崩溃",
    nameEn: "System Crash",
    description: "引发严重系统错误！若逻辑构造体血量低于40%，对其造成2倍伤害。",
    type: "damage_single",
    cooldown: 15,
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" },
    effect: {
      damageMultiplier: 2.0,
      specialEffect: "execute_low_hp",
    },
    visualEffect: "blue_screen_flash",
  },

  // 🔍 404·虚无 - 资源丢失 (Resource Not Found)
  // 类型: 减益 | 触发条件: 攻击时触发 | 效果: 全体技能冷却+2回合
  "skill-not-found": {
    id: "skill-not-found",
    name: "资源丢失",
    nameEn: "Resource Not Found",
    description: "请求的资源不存在！全体逻辑构造体所有技能冷却时间+2回合。",
    type: "debuff_player",
    cooldown: 15,
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" },
    effect: {
      specialEffect: "extend_cooldowns",
      statusToApply: {
        effectType: "entropy_erosion",
        duration: 1,
        value: 2,
      },
    },
    visualEffect: "void_404",
  },

  // ♾️ 死循环·衔尾蛇 - 无限迭代 (Infinite Iteration)
  // 类型: 续航 | 触发条件: 攻击时触发（自动触发）| 效果: 恢复自身最大生命值10%
  "skill-infinite-loop": {
    id: "skill-infinite-loop",
    name: "无限迭代",
    nameEn: "Infinite Iteration",
    description: "进入无穷循环，每次攻击后恢复自身最大生命值的10%。",
    type: "heal_self",
    cooldown: 0,
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" },
    effect: {
      healPercent: 10,
      specialEffect: "heal_on_attack",
    },
    visualEffect: "ouroboros_glow",
  },

  // 💥 段错误·粉碎者 - 内存越界 (Memory Boundary Breach)
  // 类型: AOE | 触发条件: 攻击时触发 | 效果: 0.5倍全体伤害，20%几率眩晕1回合
  "skill-segfault": {
    id: "skill-segfault",
    name: "内存越界",
    nameEn: "Memory Boundary Breach",
    description: "突破内存边界，对全体逻辑构造体造成40点伤害，并有20%几率使其陷入「眩晕」1回合。",
    type: "damage_all",
    cooldown: 8,
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" },
    effect: {
      damageMultiplier: 0,
      specialEffect: "aoe_stun_chance",
      statusToApply: {
        effectType: "stunned",
        duration: 1,
        value: 20,
      },
    },
    visualEffect: "memory_shatter",
  },

  // ⭐ 奇点·抖动 (Boss) - 正熵爆发 (Entropy Burst)
  // 类型: 毁灭 | 触发条件: 每损失10%最大生命值时自动触发 | 效果: 1.5倍全体伤害
  "skill-singularity": {
    id: "skill-singularity",
    name: "正熵爆发",
    nameEn: "Entropy Burst",
    description: "释放奇点蕴含的毁灭性能量！每损失20%最大生命值时自动触发，对全体逻辑构造体造成50点伤害。",
    type: "damage_all",
    cooldown: 0,
    currentCooldown: 0,
    triggerCondition: { type: "on_hp_loss_threshold", value: 20 },
    effect: {
      damageMultiplier: 0,
      specialEffect: "scaling_damage_by_hp_lost",
    },
    visualEffect: "singularity_explosion",
  },

  // ⭐ 奇点·抖动 (Boss) - 逆熵回复 (Entropy Recovery)
  // 类型: 续航 | 触发条件: 生命值首次低于40%时触发 | 效果: 恢复50%已损失血量
  "skill-singularity-recovery": {
    id: "skill-singularity-recovery",
    name: "逆熵回复",
    nameEn: "Entropy Recovery",
    description: "扭转熵增定律，当生命值首次低于40%时恢复自身50%已损失血量。",
    type: "heal_self",
    cooldown: 0,
    currentCooldown: 0,
    triggerCondition: { type: "hp_below", value: 40 },
    effect: {
      healPercent: 50,
      specialEffect: "heal_once_on_low_hp",
    },
    visualEffect: "entropy_reversal",
  },
};

// 4. 认知熵实体 (敌人)
// 游戏中出现的敌对单位列表
export const INITIAL_ENTROPY_ENTITIES: EntropyEntity[] = [
  {
    id: "entropy-1",
    name: "白噪·干扰者",
    form: "WHITE_NOISE",
    hp: 150,
    maxHp: 150,
    damage: 10,
    questionBank: SAMPLE_QUESTIONS,
    statusEffects: [],
    isDead: false,
    visualGlitchIntensity: 0.2,
    skill: ENEMY_SKILLS["skill-white-noise"],
  },
  {
    id: "entropy-2",
    name: "虚数·崩坏体",
    form: "IMAGINARY_COLLAPSE",
    hp: 250,
    maxHp: 250,
    damage: 25,
    questionBank: SAMPLE_QUESTIONS,
    statusEffects: [],
    isDead: false,
    visualGlitchIntensity: 0.5,
    skill: ENEMY_SKILLS["skill-imaginary-collapse"],
  },
  {
    id: "entropy-3",
    name: "空指针·虚空",
    form: "NULL_POINTER",
    hp: 300,
    maxHp: 300,
    damage: 20,
    questionBank: SAMPLE_QUESTIONS,
    statusEffects: [],
    isDead: false,
    visualGlitchIntensity: 0.3,
    skill: ENEMY_SKILLS["skill-null-pointer"],
  },
  {
    id: "entropy-4",
    name: "内存·泄露者",
    form: "MEMORY_LEAK",
    hp: 350,
    maxHp: 350,
    damage: 45,
    questionBank: SAMPLE_QUESTIONS,
    statusEffects: [],
    isDead: false,
    visualGlitchIntensity: 0.35,
    skill: ENEMY_SKILLS["skill-memory-leak"],
  },
  {
    id: "entropy-5",
    name: "栈溢出·巨像",
    form: "STACK_OVERFLOW",
    hp: 400,
    maxHp: 400,
    damage: 30,
    questionBank: SAMPLE_QUESTIONS,
    statusEffects: [],
    isDead: false,
    visualGlitchIntensity: 0.4,
    skill: ENEMY_SKILLS["skill-stack-overflow"],
  },
  {
    id: "entropy-6",
    name: "死锁·幽灵",
    form: "DEADLOCK_PHANTOM",
    hp: 450,
    maxHp: 450,
    damage: 50,
    questionBank: SAMPLE_QUESTIONS,
    statusEffects: [],
    isDead: false,
    visualGlitchIntensity: 0.45,
    skill: ENEMY_SKILLS["skill-deadlock"],
  },
  {
    id: "entropy-7",
    name: "竞态·幻影",
    form: "RACE_CONDITION",
    hp: 500,
    maxHp: 500,
    damage: 40,
    questionBank: SAMPLE_QUESTIONS,
    statusEffects: [],
    isDead: false,
    visualGlitchIntensity: 0.5,
    skill: ENEMY_SKILLS["skill-race-condition"],
  },
  {
    id: "entropy-8",
    name: "蓝屏·恐惧",
    form: "BSOD_TERROR",
    hp: 550,
    maxHp: 550,
    damage: 35,
    questionBank: SAMPLE_QUESTIONS,
    statusEffects: [],
    isDead: false,
    visualGlitchIntensity: 0.55,
    skill: ENEMY_SKILLS["skill-bsod-terror"],
  },
  {
    id: "entropy-9",
    name: "404·虚无",
    form: "NOT_FOUND_VOID",
    hp: 600,
    maxHp: 600,
    damage: 50,
    questionBank: SAMPLE_QUESTIONS,
    statusEffects: [],
    isDead: false,
    visualGlitchIntensity: 0.6,
    skill: ENEMY_SKILLS["skill-not-found"],
  },
  {
    id: "entropy-10",
    name: "死循环·衔尾蛇",
    form: "INFINITE_LOOP",
    hp: 550,
    maxHp: 550,
    damage: 60,
    questionBank: SAMPLE_QUESTIONS,
    statusEffects: [],
    isDead: false,
    visualGlitchIntensity: 0.65,
    skill: ENEMY_SKILLS["skill-infinite-loop"],
  },
  {
    id: "entropy-11",
    name: "段错误·粉碎者",
    form: "SEGFAULT_BREAKER",
    hp: 500,
    maxHp: 500,
    damage: 80,
    questionBank: SAMPLE_QUESTIONS,
    statusEffects: [],
    isDead: false,
    visualGlitchIntensity: 0.7,
    skill: ENEMY_SKILLS["skill-segfault"],
  },
  {
    id: "entropy-boss",
    name: "奇点·抖动",
    form: "SINGULARITY",
    hp: 800,
    maxHp: 800,
    damage: 100,
    questionBank: SAMPLE_QUESTIONS,
    statusEffects: [],
    isDead: false,
    visualGlitchIntensity: 0.8,
    skill: ENEMY_SKILLS["skill-singularity"],
    skills: [
      ENEMY_SKILLS["skill-singularity"],
      ENEMY_SKILLS["skill-singularity-recovery"]
    ],
  },
];

// 5. 星图关卡
export const STAR_SECTORS: StarSector[] = [
  {
    id: "sector-1",
    name: "初始引导扇区",
    description: "Boot Sector - 这里的逻辑尚且稳定，适合进行基础演练。",
    status: "STABLE",
    difficulty: 1,
    position: { x: 10, y: 50 },
    totalQuestions: 20,
    entropyEntities: [INITIAL_ENTROPY_ENTITIES[0]],
    rewards: { exp: 100 },
    missionBriefing: "目标：渗透认知熵侵蚀区域，通过知识验证重建逻辑框架。",
  },
  {
    id: "sector-2",
    name: "虚存的迷宫",
    description:
      "Labyrinth of Virtual Memory - 页面置换算法失效，小心缺页中断。",
    status: "STABLE",
    difficulty: 2,
    position: { x: 25, y: 20 },
    totalQuestions: 40,
    entropyEntities: [INITIAL_ENTROPY_ENTITIES[1], INITIAL_ENTROPY_ENTITIES[2]],
    rewards: { exp: 150 },
    missionBriefing:
      "检测到页面置换逻辑异常。任务：修复缺页中断处理程序，恢复内存映射一致性。",
  },
  {
    id: "sector-3",
    name: "并发的洪流",
    description: "Concurrency Torrent - 线程同步机制紊乱，竞态条件频发。",
    status: "STABLE",
    difficulty: 3,
    position: { x: 40, y: 80 },
    totalQuestions: 60,
    entropyEntities: [
      INITIAL_ENTROPY_ENTITIES[3],
      INITIAL_ENTROPY_ENTITIES[4],
      INITIAL_ENTROPY_ENTITIES[2],
    ],
    rewards: { exp: 200 },
    missionBriefing:
      "线程同步锁失效，数据竞争正在破坏核心数据结构。任务：重新建立互斥机制，消除竞态条件。",
  },
  {
    id: "sector-4",
    name: "协议的废墟",
    description: "Protocol Ruins - 握手失败，连接超时，数据包大量丢失。",
    status: "HIGH_ENTROPY",
    difficulty: 4,
    position: { x: 55, y: 30 },
    totalQuestions: 80,
    entropyEntities: [
      INITIAL_ENTROPY_ENTITIES[5],
      INITIAL_ENTROPY_ENTITIES[6],
      INITIAL_ENTROPY_ENTITIES[7],
      INITIAL_ENTROPY_ENTITIES[4],
    ],
    rewards: { exp: 500 },
    missionBriefing:
      "传输层协议握手序列被熵噪声干扰。任务：重建连接状态机，确保数据包可靠传输。",
  },
  {
    id: "sector-5",
    name: "算法的深渊",
    description: "Algorithm Abyss - 递归深度过大，栈溢出警告。",
    status: "HIGH_ENTROPY",
    difficulty: 5,
    position: { x: 70, y: 70 },
    totalQuestions: 100,
    entropyEntities: [
      INITIAL_ENTROPY_ENTITIES[8],
      INITIAL_ENTROPY_ENTITIES[9],
      INITIAL_ENTROPY_ENTITIES[10],
      INITIAL_ENTROPY_ENTITIES[6],
      INITIAL_ENTROPY_ENTITIES[2],
    ],
    rewards: { exp: 700 },
    missionBriefing:
      "检测到无限递归循环，堆栈空间即将耗尽。任务：优化递归算法，引入尾递归或迭代方案，防止栈溢出。",
  },
  {
    id: "sector-boss",
    name: "奇点·抖动",
    description:
      "Singularity: Thrashing - 系统的最终防线，必须在此重构底层逻辑。",
    status: "HIGH_ENTROPY",
    difficulty: 6,
    position: { x: 85, y: 50 },
    totalQuestions: 120,
    entropyEntities: [
      INITIAL_ENTROPY_ENTITIES[11],
      INITIAL_ENTROPY_ENTITIES[1],
      INITIAL_ENTROPY_ENTITIES[8],
    ],
    rewards: { exp: 1000 },
    missionBriefing:
      "系统核心逻辑正在发生剧烈抖动，资源调度完全失效。任务：直面奇点，重构底层调度算法，恢复系统秩序。",
  },
];

// 6. 铭文 (抽卡物品)
// 玩家可以通过抽卡获得的增益道具列表
export const INSCRIPTIONS: Inscription[] = [
  {
    id: "inscription-genesis-compiler",
    name: "创世编译器",
    rarity: "SSR",
    description:
      "传说中第一位编程者留下的神器。据说它能将混沌的熵流重新编译为有序的逻辑。装备后，在战斗开始20个回合后，所有技能伤害提升 10%，在战斗开始50个回合后，所有技能伤害提升 20%，在战斗开始80个回合后，所有技能伤害提升 30%。",
    trigger: "on_damage",
    effect: (context) => {
      const { currentTurn, damageSource, addBattleLog } = context;
      if (!damageSource || damageSource.type !== 'skill') return damageSource?.baseDamage;
      
      let multiplier = 1.0;
      if (currentTurn >= 80) {
        multiplier = 1.3; // 30% 伤害提升
      } else if (currentTurn >= 50) {
        multiplier = 1.2; // 20% 伤害提升
      } else if (currentTurn >= 20) {
        multiplier = 1.1; // 10% 伤害提升
      }
      
      if (multiplier > 1.0) {
        const bonusDamage = Math.floor(damageSource.baseDamage * (multiplier - 1));
        addBattleLog(`【创世编译器】回合${currentTurn}，伤害提升 ${Math.round((multiplier - 1) * 100)}%！(+${bonusDamage})`);
      }
      
      return Math.floor(damageSource.baseDamage * multiplier);
    },
    icon: "genesis_compiler_icon",
  },
  {
    id: "inscription-quantum-anchor",
    name: "量子锚点",
    rarity: "SR",
    description:
      "一枚刻印着坍缩波函数的晶片，能在时间线分叉时锁定观察者的存在。当生命值首次降至30%以下时，立即回复 50% 已损失的生命值，每场战斗仅触发一次。",
    trigger: "on_low_hp",
    effect: (context) => {
      const { constructs, triggeredFlags, addBattleLog, updateConstructs } = context;
      const flagKey = "quantum-anchor-triggered";
      
      // 如果已触发过，跳过
      if (triggeredFlags.has(flagKey)) return;
      
      // 检查是否有构造体血量低于30%
      const needHealing = constructs.some(c => !c.isDead && c.hp < c.maxHp * 0.3);
      if (!needHealing) return;
      
      // 标记已触发
      triggeredFlags.add(flagKey);
      
      // 为所有存活且血量低于30%的构造体恢复50%已损失的生命值
      updateConstructs((current) => current.map(c => {
        if (!c.isDead && c.hp < c.maxHp * 0.3) {
          const lostHp = c.maxHp - c.hp;
          const healAmount = Math.floor(lostHp * 0.5);
          const newHp = Math.min(c.maxHp, c.hp + healAmount);
          addBattleLog(`【量子锚点】${c.name} 生命值锁定！恢复 ${healAmount} 点生命值！`);
          return { ...c, hp: newHp };
        }
        return c;
      }));
    },
    icon: "quantum_anchor_icon",
  },
  {
    id: "inscription-entropy-siphon",
    name: "熵噬虫",
    rarity: "R",
    description:
      "从虚数·崩坏体内核中提取的寄生程序。每次击败敌人时，窃取其残余熵值转化为能量，恢复 15 点能量值。",
    trigger: "on_enemy_defeat",
    effect: (context) => {
      const { addBattleLog, updateConstructs } = context;
      const energyGain = 15;
      
      addBattleLog(`【熵噬虫】窃取残余熵值，全体恢复 ${energyGain} 点能量！`);
      
      updateConstructs((current) => current.map(c => {
        if (!c.isDead) {
          const newEnergy = Math.min(c.maxEnergy, c.energy + energyGain);
          return { ...c, energy: newEnergy };
        }
        return c;
      }));
    },
    icon: "entropy_siphon_icon",
  },
  {
    id: "inscription-null-shield",
    name: "空指针护盾",
    rarity: "N",
    description:
      "利用空引用的虚无特性构建的薄弱屏障。战斗开始时获得一层护盾，可抵挡一次攻击的 50% 伤害。",
    trigger: "battle_start",
    effect: (context) => {
      const { addBattleLog, updateConstructs } = context;
      
      addBattleLog(`【空指针护盾】虚空屏障已激活，可抵挡首次攻击 50% 伤害！`);
      
      // 添加护盾状态效果
      updateConstructs((current) => current.map(c => {
        if (!c.isDead) {
          const shieldEffect = {
            id: "null-shield-effect",
            name: "空指针护盾",
            duration: 99, // 持续整场战斗，但只触发一次
            type: "buff" as const,
            effect: "shield" as const,
            value: 50 // 50% 减伤
          };
          return { 
            ...c, 
            statusEffects: [...c.statusEffects, shieldEffect]
          };
        }
        return c;
      }));
    },
    icon: "null_shield_icon",
  },
  {
    id: "inscription-logic-residue",
    name: "逻辑残响",
    rarity: "N",
    description:
      "前文明崩溃时残留在信息层的微弱回音。每回合结束时，有 5% 几率减少一个技能 1 回合冷却时间。",
    trigger: "turn_end",
    effect: (context) => {
      const { addBattleLog, updateConstructs } = context;
      
      // 5% 几率触发
      if (Math.random() > 0.05) return;
      
      // 找到一个处于冷却中的技能
      let triggered = false;
      updateConstructs((current) => current.map(c => {
        if (triggered || c.isDead) return c;
        
        const skillsOnCooldown = c.skills.filter(s => s.currentCooldown > 0);
        if (skillsOnCooldown.length === 0) return c;
        
        // 随机选择一个冷却中的技能
        const randomSkill = skillsOnCooldown[Math.floor(Math.random() * skillsOnCooldown.length)];
        triggered = true;
        
        addBattleLog(`【逻辑残响】时空回响！${c.name} 的 ${randomSkill.name} 冷却时间 -1！`);
        
        return {
          ...c,
          skills: c.skills.map(s => 
            s.id === randomSkill.id 
              ? { ...s, currentCooldown: Math.max(0, s.currentCooldown - 1) }
              : s
          )
        };
      }));
    },
    icon: "logic_residue_icon",
  },
];

// 7. 游戏配置
export const GAME_CONFIG = {
  entropyThreshold: 100,
  comboThreshold: 3,
  gachaCost: 100,
} as const;

// 8. 默认主题配置 - 当没有AI生成主题时使用
export const DEFAULT_THEME: GameTheme = {
  id: "default-cyber-scholar",
  name: "智者计划：默认主题",
  generatedAt: 0,
  sourceContent: "内置默认主题",

  pageLabels: {
    levelSelect: {
      title: "大统一理论演练",
      subtitle: "GRAND UNIFICATION SIMULATION",
      sectorAnalysis: "扇区分析",
      missionBriefing: "协议部署简报",
      startButton: "开始潜渊",
      backButton: "中止链接",
      mindHackButton: "思维骇入",
    },
    battle: {
      constructsLabel: "逻辑构造体",
      entropyLabel: "认知熵实体",
      battleLogLabel: "战斗日志",
      retreatButton: "撤退",
      turnLabel: "回合",
    },
    mindHack: {
      title: "思维骇入",
      subtitle: "MIND HACK // QUANTUM RETRIEVAL SYSTEM",
      hackButton: "启动骇入",
      hackingText: "正在穿透量子屏障...",
      confirmButton: "确认接收",
      backButton: "返回星图",
      warningText: "警告：每次骇入将消耗 100 能量单位",
    },
  },

  constructs: [
    {
      id: "construct-01",
      model: "ARBITER",
      name: "裁决者",
      title: "The Arbiter",
      description: "专注于高伤害输出的逻辑构造体，擅长清除状态和终结打击。",
      skills: [
        {
          id: "skill-arbiter-1",
          name: "强制中断",
          nameEn: "Force Interrupt",
          description: "对单体造成高额逻辑伤害，并清除目标所有增益状态。",
        },
        {
          id: "skill-arbiter-ult",
          name: "最终裁定",
          nameEn: "Final Verdict",
          description:
            "消耗所有能量，对全体敌人造成毁灭性打击。若敌人处于逻辑死锁状态，伤害翻倍。",
        },
      ],
    },
    {
      id: "construct-02",
      model: "WEAVER",
      name: "织网者",
      title: "The Weaver",
      description: "擅长控制和群体作战的逻辑构造体，可以施加逻辑死锁。",
      skills: [
        {
          id: "skill-weaver-1",
          name: "链路封锁",
          nameEn: "Link Blockade",
          description:
            '对全体敌人造成中等伤害，并施加"逻辑死锁"（无法行动1回合）。',
        },
        {
          id: "skill-weaver-ult",
          name: "广播风暴",
          nameEn: "Broadcast Storm",
          description:
            "消耗所有能量，引发网络风暴，对全体敌人造成多段高频伤害，并降低其攻击力。",
        },
      ],
    },
    {
      id: "construct-03",
      model: "ARCHITECT",
      name: "虚构者",
      title: "The Architect",
      description: "防御型逻辑构造体，专注于为团队提供护盾和恢复。",
      skills: [
        {
          id: "skill-architect-1",
          name: "哈希重构",
          nameEn: "Hash Rebuild",
          description: "为我方全体施加护盾，并修复受损的逻辑扇区（回血）。",
        },
        {
          id: "skill-architect-ult",
          name: "系统还原",
          nameEn: "System Restore",
          description:
            "消耗所有能量，将全体队友的状态回滚至最佳时刻（大幅回血并清除所有异常状态）。",
        },
      ],
    },
  ],

  inscriptions: [
    {
      id: "inscription-genesis-compiler",
      name: "创世编译器",
      rarity: "SSR",
      description:
        "传说中第一位编程者留下的神器。据说它能将混沌的熵流重新编译为有序的逻辑。装备后，在战斗开始20个回合后，所有技能伤害提升 10%，在战斗开始50个回合后，所有技能伤害提升 20%，在战斗开始80个回合后，所有技能伤害提升 30%。",
    },
    {
      id: "inscription-quantum-anchor",
      name: "量子锚点",
      rarity: "SR",
      description:
        "一枚刻印着坍缩波函数的晶片，能在时间线分叉时锁定观察者的存在。当生命值首次降至30%以下时，立即回复 50% 已损失的生命值，每场战斗仅触发一次。",
    },
    {
      id: "inscription-entropy-siphon",
      name: "熵噬虫",
      rarity: "R",
      description:
        "从虚数·崩坏体内核中提取的寄生程序。每次击败敌人时，窃取其残余熵值转化为能量，恢复 15 点能量值。",
    },
    {
      id: "inscription-null-shield",
      name: "空指针护盾",
      rarity: "N",
      description:
        "利用空引用的虚无特性构建的薄弱屏障。战斗开始时获得一层护盾，可抵挡一次攻击的 50% 伤害。",
    },
    {
      id: "inscription-logic-residue",
      name: "逻辑残响",
      rarity: "N",
      description:
        "前文明崩溃时残留在信息层的微弱回音。每回合结束时，有 5% 几率减少一个技能 1 回合冷却时间。",
    },
  ],

  battleLogTemplates: {
    enterSector: "进入扇区: {sectorName}",
    entropyStatus: {
      stable: "稳定",
      highEntropy: "高熵警报",
      locked: "已锁定",
    },
    questionSource: {
      ai: "🤖 AI动态生成",
      builtin: "📚 内置题库",
    },
    answerCorrect: "逻辑验证成功！熵值降低。",
    answerWrong: "逻辑错误！熵值上升！",
    skillUsed: "{constructName} 对目标使用了 {skillName}！",
    enemyDefeated: "{enemyName} 已被消解！",
    victory: "所有题目已完成！逻辑框架重建成功！",
    defeat: "逻辑构造体全灭，撤退失败...",
  },

  entropyEntities: [
    {
      id: "entropy-1",
      name: "白噪·干扰者",
      skills: [
        {
          id: "skill-white-noise",
          name: "信号干扰",
          description: "释放高频噪声，干扰逻辑构造体的信息接收，使随机一个逻辑构造体损失10点能量。",
        },
      ],
    },
    {
      id: "entropy-2",
      name: "虚数·崩坏体",
      skills: [
        {
          id: "skill-imaginary-collapse",
          name: "虚空坍缩",
          description: "引发虚数空间坍缩，造成2倍基础伤害的真实伤害，无视所有护盾和减伤效果。",
        },
      ],
    },
    {
      id: "entropy-3",
      name: "空指针·虚空",
      skills: [
        {
          id: "skill-null-pointer",
          name: "引用消解",
          description: "消解逻辑链接，随机使一名逻辑构造体的一个已就绪技能进入3回合冷却。",
        },
      ],
    },
    {
      id: "entropy-4",
      name: "内存·泄露者",
      skills: [
        {
          id: "skill-memory-leak",
          name: "资源侵蚀",
          description: "悄然吞噬系统资源，全体逻辑构造体在3回合内每回合损失10点能量。",
        },
      ],
    },
    {
      id: "entropy-5",
      name: "栈溢出·巨像",
      skills: [
        {
          id: "skill-stack-overflow",
          name: "递归压制",
          description: "进入失控递归状态，攻击力每回合增加10点，持续4回合（最高40点加成）。",
        },
      ],
    },
    {
      id: "entropy-6",
      name: "死锁·幽灵",
      skills: [
        {
          id: "skill-deadlock",
          name: "资源禁锢",
          description: "形成逻辑死锁，随机使一名逻辑构造体陷入「逻辑死锁」状态，无法行动2回合。",
        },
      ],
    },
    {
      id: "entropy-7",
      name: "竞态·幻影",
      skills: [
        {
          id: "skill-race-condition",
          name: "时序混乱",
          description: "扰乱时间线，使随机一个逻辑构造体的能量清空！",
        },
      ],
    },
    {
      id: "entropy-8",
      name: "蓝屏·恐惧",
      skills: [
        {
          id: "skill-bsod-terror",
          name: "系统崩溃",
          description: "引发严重系统错误！若逻辑构造体血量低于40%，对其造成2倍伤害。",
        },
      ],
    },
    {
      id: "entropy-9",
      name: "404·虚无",
      skills: [
        {
          id: "skill-not-found",
          name: "资源丢失",
          description: "请求的资源不存在！全体逻辑构造体所有技能冷却时间+2回合。",
        },
      ],
    },
    {
      id: "entropy-10",
      name: "死循环·衔尾蛇",
      skills: [
        {
          id: "skill-infinite-loop",
          name: "无限迭代",
          description: "进入无穷循环，每次攻击后恢复自身最大生命值的10%。",
        },
      ],
    },
    {
      id: "entropy-11",
      name: "段错误·粉碎者",
      skills: [
        {
          id: "skill-segfault",
          name: "内存越界",
          description: "突破内存边界，对全体逻辑构造体造成40点伤害，并有20%几率使其陷入「眩晕」1回合。",
        },
      ],
    },
    {
      id: "entropy-boss",
      name: "奇点·抖动",
      skills: [
        {
          id: "skill-singularity",
          name: "正熵爆发",
          description: "释放奇点蕴含的毁灭性能量！每损失20%最大生命值时自动触发，对全体逻辑构造体造成50点伤害。",
        },
        {
          id: "skill-singularity-recovery",
          name: "逆熵回复",
          description: "扭转熵增定律，当生命值首次低于40%时恢复自身最大生命值的25%。",
        },
      ],
    },
  ],
};
