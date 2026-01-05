// ============================
// Project Scholar: The Study Ascension - Constants & Config
// ============================

import type {
    Construct,
    EntropyEntity,
    Inscription,
    Question,
    StarSector,
} from "../types/game";

// 1. Visual Aesthetics - 视觉美学
export const COLORS = {
    // Core Palette
    coldWhite: "#F0F8FF",
    deepSpaceBlue: "#0B0E14",
    glitchRed: "#FF003C",
    holographicGold: "#D4AF37",
    neonCyan: "#00F3FF",
    
    // UI Elements
    hexBorder: "rgba(0, 243, 255, 0.3)",
    hexFill: "rgba(11, 14, 20, 0.85)",
    
    // Status
    stable: "#39FF14",
    highEntropy: "#FF003C",
    locked: "#4A4A4A",
} as const;

// 2. Construct Definitions - 逻辑构造体
export const INITIAL_CONSTRUCTS: Construct[] = [
    {
        id: "construct-01",
        model: "ARBITER",
        name: "裁决者",
        title: "The Arbiter",
        hp: 150,
        maxHp: 150,
        energy: 100,
        maxEnergy: 100,
        isDead: false,
        statusEffects: [],
        skills: [
            {
                id: "skill-arbiter-1",
                name: "强制中断",
                nameEn: "Force Interrupt",
                description: "对单体造成高额逻辑伤害，并清除目标所有增益状态。",
                cooldown: 3,
                currentCooldown: 0,
                type: "active",
                targetType: "single_enemy",
                cost: 30,
                visualEffect: "data_deletion"
            },
            {
                id: "skill-arbiter-ult",
                name: "最终裁定",
                nameEn: "Final Verdict",
                description: "消耗所有能量，对全体敌人造成毁灭性打击。若敌人处于逻辑死锁状态，伤害翻倍。",
                cooldown: 5,
                currentCooldown: 0,
                type: "ultimate",
                targetType: "all_enemies",
                cost: 100,
                visualEffect: "binary_stream"
            }
        ]
    },
    {
        id: "construct-02",
        model: "WEAVER",
        name: "织网者",
        title: "The Weaver",
        hp: 120,
        maxHp: 120,
        energy: 100,
        maxEnergy: 100,
        isDead: false,
        statusEffects: [],
        skills: [
            {
                id: "skill-weaver-1",
                name: "链路封锁",
                nameEn: "Link Blockade",
                description: "对全体敌人造成中等伤害，并施加'逻辑死锁'（无法行动1回合）。",
                cooldown: 4,
                currentCooldown: 0,
                type: "active",
                targetType: "all_enemies",
                cost: 40,
                visualEffect: "hex_shield"
            }
        ]
    },
    {
        id: "construct-03",
        model: "ARCHITECT",
        name: "虚构者",
        title: "The Architect",
        hp: 200,
        maxHp: 200,
        energy: 100,
        maxEnergy: 100,
        isDead: false,
        statusEffects: [],
        skills: [
            {
                id: "skill-architect-1",
                name: "哈希重构",
                nameEn: "Hash Rebuild",
                description: "为我方全体施加护盾，并修复受损的逻辑扇区（回血）。",
                cooldown: 3,
                currentCooldown: 0,
                type: "active",
                targetType: "self", // Affects team via logic
                cost: 35,
                visualEffect: "hex_shield"
            }
        ]
    }
];

// 3. Sample Questions - 样本题目
export const SAMPLE_QUESTIONS: Question[] = [
    {
        id: "q1",
        text: "在操作系统中，死锁产生的必要条件不包括？",
        type: "Single",
        options: ["互斥条件", "请求与保持条件", "不剥夺条件", "时间片轮转条件"],
        correctOptionIndex: 3,
        difficulty: 1,
        timeLimit: 30,
        explanation: "死锁的四个必要条件是：互斥、请求与保持、不剥夺、循环等待。时间片轮转是调度算法。",
        tags: ["OS", "Deadlock"]
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
        tags: ["Network", "TCP"]
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
        tags: ["DataStructure", "Tree"]
    }
];

// 4. Entropy Entities - 认知熵实体 (Enemies)
export const INITIAL_ENTROPY_ENTITIES: EntropyEntity[] = [
    {
        id: "entropy-1",
        name: "白噪·干扰者",
        form: "WHITE_NOISE",
        hp: 50,
        maxHp: 50,
        damage: 10,
        questionBank: SAMPLE_QUESTIONS.slice(0, 1),
        statusEffects: [],
        isDead: false,
        visualGlitchIntensity: 0.2
    },
    {
        id: "entropy-2",
        name: "虚数·崩坏体",
        form: "IMAGINARY_COLLAPSE",
        hp: 120,
        maxHp: 120,
        damage: 25,
        questionBank: SAMPLE_QUESTIONS.slice(1, 2),
        statusEffects: [],
        isDead: false,
        visualGlitchIntensity: 0.5
    },
    {
        id: "entropy-boss",
        name: "奇点·抖动",
        form: "SINGULARITY",
        hp: 300,
        maxHp: 300,
        damage: 40,
        questionBank: SAMPLE_QUESTIONS.slice(2),
        statusEffects: [],
        isDead: false,
        visualGlitchIntensity: 0.8
    }
];

// 5. Star Sectors - 星图关卡
export const STAR_SECTORS: StarSector[] = [
    {
        id: "sector-1",
        name: "初始引导扇区",
        description: "Boot Sector - 这里的逻辑尚且稳定，适合进行基础演练。",
        status: "STABLE",
        difficulty: 1,
        position: { x: 100, y: 300 },
        totalQuestions: 5,
        entropyEntities: [INITIAL_ENTROPY_ENTITIES[0]],
        rewards: { exp: 100 }
    },
    {
        id: "sector-2",
        name: "虚存的迷宫",
        description: "Labyrinth of Virtual Memory - 页面置换算法失效，小心缺页中断。",
        status: "HIGH_ENTROPY",
        difficulty: 3,
        position: { x: 300, y: 150 },
        totalQuestions: 10,
        entropyEntities: [INITIAL_ENTROPY_ENTITIES[1]],
        rewards: { exp: 300 }
    },
    {
        id: "sector-boss",
        name: "奇点·抖动",
        description: "Singularity: Thrashing - 系统的最终防线，必须在此重构底层逻辑。",
        status: "LOCKED",
        difficulty: 5,
        position: { x: 600, y: 300 },
        totalQuestions: 15,
        entropyEntities: [INITIAL_ENTROPY_ENTITIES[2]],
        rewards: { exp: 1000 }
    }
];

// 6. Inscriptions - 铭文 (Gacha Items)
export const INSCRIPTIONS: Inscription[] = [
    {
        id: "inscription-banker",
        name: "银行家算法",
        rarity: "SSR",
        description: "前文明用来规避资源死锁的神圣逻辑。装备后，对'死锁级'崩坏兽伤害提升 50%。",
        effect: () => {}, // Implemented in logic
        icon: "banker_algo_icon"
    },
    {
        id: "inscription-dijkstra",
        name: "最短路径",
        rarity: "SR",
        description: "在星图中移动时，不消耗行动力。",
        effect: () => {},
        icon: "dijkstra_icon"
    }
];

// 7. Game Config
export const GAME_CONFIG = {
    entropyThreshold: 100, // Max entropy before game over
    baseDamage: 30,
    comboThreshold: 3, // For "Flow State" or special moves
    gachaCost: 100, // Cost to pull Mind Hack
} as const;
