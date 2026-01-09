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
  appName: "智者计划",
  version: "1.4.0",
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
  // 核心色板
  coldWhite: "#F0F8FF",
  deepSpaceBlue: "#0B0E14",
  glitchRed: "#FF003C",
  holographicGold: "#D4AF37",
  neonCyan: "#00F3FF",

  // UI 元素
  hexBorder: "rgba(0, 243, 255, 0.3)",
  hexFill: "rgba(11, 14, 20, 0.85)",

  // 状态
  stable: "#39FF14",
  highEntropy: "#FF003C",
  locked: "#4A4A4A",
} as const;

// 2. 逻辑构造体定义
// 初始可用的逻辑构造体（玩家角色）列表
export const INITIAL_CONSTRUCTS: Construct[] = [
  {
    // 构造体唯一标识符，用于系统内部引用
    id: "construct-01",
    // 构造体型号，对应不同的角色职业或定位
    model: "ARBITER",
    // 构造体中文名称，显示在UI界面上
    name: "裁决者",
    // 构造体英文称号，用于装饰性显示
    title: "The Arbiter",
    // 攻击力，决定答题正确时造成的伤害
    attack: 15,
    // 当前生命值 (Health Points)，降为0时角色无法战斗
    hp: 500,
    // 最大生命值上限
    maxHp: 500,
    // 当前能量值，用于释放终极技能
    energy: 100,
    // 最大能量值上限
    maxEnergy: 100,
    // 存活状态标识，true表示已阵亡
    isDead: false,
    // 当前受到的状态效果列表（如中毒、眩晕等）
    statusEffects: [],
    // 拥有的技能列表
    skills: [
      {
        // 技能唯一标识符
        id: "skill-arbiter-1",
        // 技能中文名称
        name: "强制中断",
        // 技能英文名称
        nameEn: "Force Interrupt",
        // 技能详细描述，解释技能效果
        description: "对单体造成高额逻辑伤害 (30点伤害)。",
        // 技能冷却时间（回合数）
        cooldown: 8,
        // 当前剩余冷却时间，0表示可以使用
        currentCooldown: 0,
        // 技能类型：active(主动技能) / ultimate(终极技能) / passive(被动技能)
        type: "active",
        // 技能目标类型：single_enemy(单体敌人) / all_enemies(全体敌人) / self(自身) / ally(队友)
        targetType: "single_enemy",
        // 技能消耗的资源数值（通常指能量或行动点）
        cost: 60,
        // 技能释放时的视觉特效ID
        visualEffect: "data_deletion",
      },
      {
        // 技能唯一标识符
        id: "skill-arbiter-ult",
        // 技能中文名称
        name: "最终裁定",
        // 技能英文名称
        nameEn: "Final Verdict",
        // 技能详细描述
        description:
          "消耗所有能量，对全体敌人造成毁灭性打击 (30点伤害)。",
        // 技能冷却时间
        cooldown: 20,
        // 当前剩余冷却时间
        currentCooldown: 0,
        // 技能类型：终极技能
        type: "ultimate",
        // 技能目标类型：全体敌人
        targetType: "all_enemies",
        // 技能消耗能量值
        cost: 100,
        // 视觉特效ID
        visualEffect: "binary_stream",
      },
    ],
  },
  {
    // 构造体唯一标识符
    id: "construct-02",
    // 构造体型号
    model: "WEAVER",
    // 构造体中文名称
    name: "织网者",
    // 构造体英文称号
    title: "The Weaver",
    // 攻击力
    attack: 15,
    // 当前生命值
    hp: 350,
    // 最大生命值
    maxHp: 350,
    // 当前能量值
    energy: 300,
    // 最大能量值
    maxEnergy: 300,
    // 存活状态标识
    isDead: false,
    // 状态效果列表
    statusEffects: [],
    // 技能列表
    skills: [
      {
        // 技能唯一标识符
        id: "skill-weaver-1",
        // 技能中文名称
        name: "链路封锁",
        // 技能英文名称
        nameEn: "Link Blockade",
        // 技能描述
        description:
          "对全体敌人施加'逻辑死锁'（无法行动一回合）。",
        // 技能冷却时间
        cooldown: 10,
        // 当前剩余冷却时间
        currentCooldown: 0,
        // 技能类型
        type: "active",
        // 技能目标类型
        targetType: "all_enemies",
        // 技能消耗
        cost: 80,
        // 视觉特效ID
        visualEffect: "hex_shield",
      },
      {
        // 技能唯一标识符
        id: "skill-weaver-ult",
        // 技能中文名称
        name: "广播风暴",
        // 技能英文名称
        nameEn: "Broadcast Storm",
        // 技能描述
        description:
          "消耗所有能量，引发网络风暴，对全体敌人造成多段高频伤害，并降低其攻击力50%，持续三回合。",
        // 技能冷却时间
        cooldown: 20,
        // 当前剩余冷却时间
        currentCooldown: 0,
        // 技能类型
        type: "ultimate",
        // 技能目标类型
        targetType: "all_enemies",
        // 技能消耗
        cost: 250,
        // 视觉特效ID
        visualEffect: "digital_storm",
      },
    ],
  },
  {
    // 构造体唯一标识符
    id: "construct-03",
    // 构造体型号
    model: "ARCHITECT",
    // 构造体中文名称
    name: "虚构者",
    // 构造体英文称号
    title: "The Architect",
    // 攻击力
    attack: 15,
    // 当前生命值
    hp: 400,
    // 最大生命值
    maxHp: 400,
    // 当前能量值
    energy: 150,
    // 最大能量值
    maxEnergy: 150,
    // 存活状态标识
    isDead: false,
    // 状态效果列表
    statusEffects: [],
    // 技能列表
    skills: [
      {
        // 技能唯一标识符
        id: "skill-architect-1",
        // 技能中文名称
        name: "哈希重构",
        // 技能英文名称
        nameEn: "Hash Rebuild",
        // 技能描述
        description: "为我方全体施加护盾 (使下一次受到的伤害降低50%)，并修复自身受损的逻辑扇区（回血）。",
        // 技能冷却时间
        cooldown: 15,
        // 当前剩余冷却时间
        currentCooldown: 0,
        // 技能类型
        type: "active",
        // 技能目标类型：自身（实际效果可能影响全体）
        targetType: "self",
        // 技能消耗
        cost: 100,
        // 视觉特效ID
        visualEffect: "hex_shield",
      },
      {
        // 技能唯一标识符
        id: "skill-architect-ult",
        // 技能中文名称
        name: "系统还原",
        // 技能英文名称
        nameEn: "System Restore",
        // 技能描述
        description:
          "消耗所有能量，将全体队友分别回复最大生命和最大能量的25%。",
        // 技能冷却时间
        cooldown: 20,
        // 当前剩余冷却时间
        currentCooldown: 0,
        // 技能类型
        type: "ultimate",
        // 技能目标类型
        targetType: "ally",
        // 技能消耗
        cost: 150,
        // 视觉特效ID
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
    description: "释放高频噪声，干扰逻辑构造体的信息接收，下一道题目的答题时间减少5秒。",
    type: "debuff_player",
    cooldown: 5, // 冷却5回合
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" }, // 攻击时触发
    effect: {
      specialEffect: "reduce_time_limit",
      statusToApply: {
        effectType: "entropy_erosion",
        duration: 1,
        value: 5, // 减少5秒答题时间
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
    description: "引发虚数空间坍缩，造成1.5倍基础伤害的真实伤害，无视所有护盾和减伤效果。",
    type: "damage_single",
    cooldown: 15, // 冷却15回合
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" }, // 攻击时触发
    effect: {
      damageMultiplier: 1.5,
      specialEffect: "true_damage", // 真实伤害，无视护盾
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
    cooldown: 20, // 冷却20回合
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" }, // 攻击时触发
    effect: {
      specialEffect: "force_cooldown",
      statusToApply: {
        effectType: "logic_lock",
        duration: 3, // 强制进入3回合冷却
        value: 1, // 锁定1个技能
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
    description: "悄然吞噬系统资源，全体逻辑构造体在3回合内每回合损失5点能量。",
    type: "debuff_player",
    cooldown: 10, // 冷却10回合
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" }, // 攻击时触发
    effect: {
      specialEffect: "energy_drain",
      statusToApply: {
        effectType: "entropy_erosion",
        duration: 3, // 持续3回合
        value: 5, // 每回合损失5能量
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
    description: "进入失控递归状态，攻击力每回合增加10%，持续4回合（最高40%加成）。",
    type: "self_buff",
    cooldown: 12, // 冷却12回合
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" }, // 攻击时触发
    effect: {
      specialEffect: "stacking_damage",
      statusToApply: {
        effectType: "damage_boost",
        duration: 4, // 持续4回合
        value: 10, // 每回合+10%伤害
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
    cooldown: 8, // 冷却8回合
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" }, // 攻击时触发
    effect: {
      specialEffect: "stun_single",
      statusToApply: {
        effectType: "logic_lock",
        duration: 2, // 锁定2回合
        value: 100, // 完全锁定
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
    cooldown: 30, // 冷却30回合
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" }, // 攻击时触发
    effect: {
      specialEffect: "drain_all_energy", // 清空能量
    },
    visualEffect: "time_distortion",
  },

  // 💀 蓝屏·恐惧 - 系统崩溃 (System Crash)
  // 类型: 处决 | 触发条件: 攻击时触发 | 效果: 若玩家血量<40%，对其造成2倍伤害
  "skill-bsod-terror": {
    id: "skill-bsod-terror",
    name: "系统崩溃",
    nameEn: "System Crash",
    description: "引发严重系统错误！若任意逻辑构造体血量低于40%，对其造成2倍伤害。",
    type: "damage_single",
    cooldown: 15, // 冷却15回合
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" }, // 攻击时触发（检查目标血量作为附加条件）
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
    cooldown: 15, // 冷却15回合
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" }, // 攻击时触发
    effect: {
      specialEffect: "extend_cooldowns",
      statusToApply: {
        effectType: "entropy_erosion",
        duration: 1,
        value: 2, // 冷却+2回合
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
    cooldown: 0, // 被动技能，无冷却
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" }, // 攻击时自动触发
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
    description: "突破内存边界，对全体逻辑构造体造成0.5倍基础伤害，并有20%几率使其陷入「眩晕」1回合。",
    type: "damage_all",
    cooldown: 8, // 冷却8回合
    currentCooldown: 0,
    triggerCondition: { type: "on_attack" }, // 攻击时触发
    effect: {
      damageMultiplier: 0.5, // 0.5倍伤害
      specialEffect: "aoe_stun_chance",
      statusToApply: {
        effectType: "stunned",
        duration: 1, // 眩晕1回合
        value: 20, // 20%几率
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
    description: "释放奇点蕴含的毁灭性能量！每损失10%最大生命值时自动触发，对全体逻辑构造体造成1.5倍伤害。",
    type: "damage_all",
    cooldown: 0, // 基于生命值触发，非冷却机制
    currentCooldown: 0,
    triggerCondition: { type: "on_hp_loss_threshold", value: 10 }, // 每损失10%血量触发
    effect: {
      damageMultiplier: 1.5,
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
    cooldown: 0, // 一次性触发
    currentCooldown: 0,
    triggerCondition: { type: "hp_below", value: 40 }, // 生命值首次低于40%时触发
    effect: {
      healPercent: 50, // 恢复50%已损失生命值
      specialEffect: "heal_once_on_low_hp",
    },
    visualEffect: "entropy_reversal",
  },
};

// 4. 认知熵实体 (敌人)
// 游戏中出现的敌对单位列表
export const INITIAL_ENTROPY_ENTITIES: EntropyEntity[] = [
  {
    // 实体唯一标识符
    id: "entropy-1",
    // 实体显示名称
    name: "白噪·干扰者",
    // 实体形态/类型，决定其外观和行为模式
    form: "WHITE_NOISE",
    // 当前生命值
    hp: 150,
    // 最大生命值
    maxHp: 150,
    // 基础攻击力，对玩家造成的伤害数值
    damage: 10,
    // 该实体携带的题库，玩家攻击时需要回答这些问题
    questionBank: SAMPLE_QUESTIONS,
    // 当前受到的状态效果列表
    statusEffects: [],
    // 存活状态标识
    isDead: false,
    // 视觉故障强度 (0.0 - 1.0)，影响UI的扭曲程度
    visualGlitchIntensity: 0.2,
    // 专属技能：信号干扰
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
    // 专属技能：虚空坍缩
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
    // 专属技能：引用消解
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
    // 专属技能：资源侵蚀
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
    // 专属技能：递归压制
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
    // 专属技能：资源禁锢
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
    // 专属技能：时序混乱
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
    // 专属技能：系统崩溃
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
    // 专属技能：资源丢失
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
    // 专属技能：无限迭代
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
    // 专属技能：内存越界
    skill: ENEMY_SKILLS["skill-segfault"],
  },
  {
    // 实体唯一标识符
    id: "entropy-boss",
    // 实体显示名称
    name: "奇点·抖动",
    // 实体形态/类型
    form: "SINGULARITY",
    // 当前生命值
    hp: 800,
    // 最大生命值
    maxHp: 800,
    // 基础攻击力
    damage: 100,
    // 携带题库
    questionBank: SAMPLE_QUESTIONS,
    // 状态效果列表
    statusEffects: [],
    // 存活状态标识
    isDead: false,
    // 视觉故障强度
    visualGlitchIntensity: 0.8,
    // Boss专属技能：正熵爆发（保持单技能兼容性）
    skill: ENEMY_SKILLS["skill-singularity"],
    // Boss拥有两个技能：正熵爆发 + 逆熵回复
    skills: [
      ENEMY_SKILLS["skill-singularity"],       // 正熵爆发：每损失10%血量触发
      ENEMY_SKILLS["skill-singularity-recovery"] // 逆熵回复：血量首次低于40%时触发
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
    entropyEntities: [INITIAL_ENTROPY_ENTITIES[0]], // 1 enemy
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
    entropyEntities: [INITIAL_ENTROPY_ENTITIES[1], INITIAL_ENTROPY_ENTITIES[2]], // 2 enemies
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
      INITIAL_ENTROPY_ENTITIES[3], // entropy-4 内存·泄露者
      INITIAL_ENTROPY_ENTITIES[4], // entropy-5 栈溢出·巨像
      INITIAL_ENTROPY_ENTITIES[2], // entropy-3 空指针·虚空 (新增)
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
      INITIAL_ENTROPY_ENTITIES[5], // entropy-6 死锁·幽灵
      INITIAL_ENTROPY_ENTITIES[6], // entropy-7 竞态·幻影
      INITIAL_ENTROPY_ENTITIES[7], // entropy-8 蓝屏·恐惧
      INITIAL_ENTROPY_ENTITIES[4], // entropy-5 栈溢出·巨像 (新增)
    ],
    rewards: { exp: 250 },
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
      INITIAL_ENTROPY_ENTITIES[8],  // entropy-9 404·虚无
      INITIAL_ENTROPY_ENTITIES[9],  // entropy-10 死循环·衔尾蛇
      INITIAL_ENTROPY_ENTITIES[10], // entropy-11 段错误·粉碎者
      INITIAL_ENTROPY_ENTITIES[6],  // entropy-7 竞态·幻影 (新增)
      INITIAL_ENTROPY_ENTITIES[2],  // entropy-3 空指针·虚空 (新增)
    ],
    rewards: { exp: 250 },
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
      INITIAL_ENTROPY_ENTITIES[11], // entropy-boss 奇点·抖动
      INITIAL_ENTROPY_ENTITIES[1],  // entropy-2 虚数·崩坏体 (新增)
      INITIAL_ENTROPY_ENTITIES[8],  // entropy-9 404·虚无 (新增)
    ],
    rewards: { exp: 250 },
    missionBriefing:
      "系统核心逻辑正在发生剧烈抖动，资源调度完全失效。任务：直面奇点，重构底层调度算法，恢复系统秩序。",
  },
];

// 6. 铭文 (抽卡物品)
// 玩家可以通过抽卡获得的增益道具列表
export const INSCRIPTIONS: Inscription[] = [
  {
    // 铭文唯一标识符
    id: "inscription-genesis-compiler",
    // 铭文显示名称
    name: "创世编译器",
    // 稀有度等级：SSR / SR / R / N
    rarity: "SSR",
    // 铭文功能描述
    description:
      "传说中第一位编程者留下的神器。据说它能将混沌的熵流重新编译为有序的逻辑。装备后，在战斗开始20个回合后，所有技能伤害提升 10%，在战斗开始50个回合后，所有技能伤害提升 20%，在战斗开始80个回合后，所有技能伤害提升 30%。",
    // 铭文触发时机：造成伤害时
    trigger: "on_damage",
    // 铭文效果函数：根据回合数返回伤害倍率
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
    // 铭文图标资源ID
    icon: "genesis_compiler_icon",
  },
  {
    // 铭文唯一标识符
    id: "inscription-quantum-anchor",
    // 铭文显示名称
    name: "量子锚点",
    // 稀有度等级
    rarity: "SR",
    // 铭文功能描述
    description:
      "一枚刻印着坍缩波函数的晶片，能在时间线分叉时锁定观察者的存在。当生命值首次降至30%以下时，立即回复 50% 已损失的生命值，每场战斗仅触发一次。",
    // 铭文触发时机：受到伤害后检查
    trigger: "on_low_hp",
    // 铭文效果函数
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
    // 铭文图标资源ID
    icon: "quantum_anchor_icon",
  },
  {
    // 铭文唯一标识符
    id: "inscription-entropy-siphon",
    // 铭文显示名称
    name: "熵噬虫",
    // 稀有度等级
    rarity: "R",
    // 铭文功能描述
    description:
      "从虚数·崩坏体内核中提取的寄生程序。每次击败敌人时，窃取其残余熵值转化为能量，恢复 15 点能量值。",
    // 铭文触发时机：击败敌人时
    trigger: "on_enemy_defeat",
    // 铭文效果函数
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
    // 铭文图标资源ID
    icon: "entropy_siphon_icon",
  },
  {
    // 铭文唯一标识符
    id: "inscription-null-shield",
    // 铭文显示名称
    name: "空指针护盾",
    // 稀有度等级
    rarity: "N",
    // 铭文功能描述
    description:
      "利用空引用的虚无特性构建的薄弱屏障。战斗开始时获得一层护盾，可抵挡一次攻击的 50% 伤害。",
    // 铭文触发时机：战斗开始时
    trigger: "battle_start",
    // 铭文效果函数：为所有构造体添加护盾状态
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
    // 铭文图标资源ID
    icon: "null_shield_icon",
  },
  {
    // 铭文唯一标识符
    id: "inscription-logic-residue",
    // 铭文显示名称
    name: "逻辑残响",
    // 稀有度等级
    rarity: "N",
    // 铭文功能描述
    description:
      "前文明崩溃时残留在信息层的微弱回音。每回合结束时，有 5% 几率减少一个技能 1 回合冷却时间。",
    // 铭文触发时机：每回合结束时
    trigger: "turn_end",
    // 铭文效果函数
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
    // 铭文图标资源ID
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
};
