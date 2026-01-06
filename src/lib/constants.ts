// ============================
// 学者计划：飞升学习 - 常量与配置
// ============================

import type {
    Construct,
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
                targetType: "self",
                cost: 35,
                visualEffect: "hex_shield"
            }
        ]
    }
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
    },
    {
        id: "q4",
        text: "数据库事务的ACID特性中，I代表什么？",
        type: "Single",
        options: ["Isolation (隔离性)", "Integrity (完整性)", "Identity (一致性)", "Immediate (即时性)"],
        correctOptionIndex: 0,
        difficulty: 2,
        timeLimit: 30,
        explanation: "ACID代表Atomicity(原子性), Consistency(一致性), Isolation(隔离性), Durability(持久性)。",
        tags: ["Database", "Transaction"]
    },
    {
        id: "q5",
        text: "快速排序在最坏情况下的时间复杂度是？",
        type: "Single",
        options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
        correctOptionIndex: 2,
        difficulty: 3,
        timeLimit: 30,
        explanation: "快速排序平均时间复杂度为O(n log n)，但在最坏情况下（如数组已有序）为O(n^2)。",
        tags: ["Algorithm", "Sorting"]
    },
    {
        id: "q6",
        text: "CPU缓存（Cache）的主要作用是？",
        type: "Single",
        options: ["增加硬盘容量", "解决CPU与内存速度不匹配问题", "提高CPU主频", "防止数据丢失"],
        correctOptionIndex: 1,
        difficulty: 2,
        timeLimit: 25,
        explanation: "Cache位于CPU和主存之间，用于缓解CPU速度快而内存速度慢的矛盾。",
        tags: ["Architecture", "Hardware"]
    }
];

// 4. 认知熵实体 (敌人)
export const INITIAL_ENTROPY_ENTITIES: EntropyEntity[] = [
    {
        id: "entropy-1",
        name: "白噪·干扰者",
        form: "WHITE_NOISE",
        hp: 50,
        maxHp: 50,
        damage: 10,
        questionBank: SAMPLE_QUESTIONS.slice(0, 2),
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
        questionBank: SAMPLE_QUESTIONS.slice(2, 4),
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
        questionBank: SAMPLE_QUESTIONS.slice(4),
        statusEffects: [],
        isDead: false,
        visualGlitchIntensity: 0.8
    }
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
        totalQuestions: 10,
        entropyEntities: [INITIAL_ENTROPY_ENTITIES[0]],
        rewards: { exp: 100 },
        missionBriefing: "目标：渗透认知熵侵蚀区域，通过知识验证重建逻辑框架。"
    },
    {
        id: "sector-2",
        name: "虚存的迷宫",
        description: "Labyrinth of Virtual Memory - 页面置换算法失效，小心缺页中断。",
        status: "STABLE",
        difficulty: 2,
        position: { x: 25, y: 20 },
        totalQuestions: 20,
        entropyEntities: [INITIAL_ENTROPY_ENTITIES[1]],
        rewards: { exp: 200 },
        missionBriefing: "检测到页面置换逻辑异常。任务：修复缺页中断处理程序，恢复内存映射一致性。"
    },
    {
        id: "sector-3",
        name: "并发的洪流",
        description: "Concurrency Torrent - 线程同步机制紊乱，竞态条件频发。",
        status: "STABLE",
        difficulty: 3,
        position: { x: 40, y: 80 },
        totalQuestions: 30,
        entropyEntities: [INITIAL_ENTROPY_ENTITIES[1]],
        rewards: { exp: 300 },
        missionBriefing: "线程同步锁失效，数据竞争正在破坏核心数据结构。任务：重新建立互斥机制，消除竞态条件。"
    },
    {
        id: "sector-4",
        name: "协议的废墟",
        description: "Protocol Ruins - 握手失败，连接超时，数据包大量丢失。",
        status: "HIGH_ENTROPY",
        difficulty: 4,
        position: { x: 55, y: 30 },
        totalQuestions: 40,
        entropyEntities: [INITIAL_ENTROPY_ENTITIES[1]],
        rewards: { exp: 500 },
        missionBriefing: "传输层协议握手序列被熵噪声干扰。任务：重建连接状态机，确保数据包可靠传输。"
    },
    {
        id: "sector-5",
        name: "算法的深渊",
        description: "Algorithm Abyss - 递归深度过大，栈溢出警告。",
        status: "HIGH_ENTROPY",
        difficulty: 5,
        position: { x: 70, y: 70 },
        totalQuestions: 50,
        entropyEntities: [INITIAL_ENTROPY_ENTITIES[2]],
        rewards: { exp: 700 },
        missionBriefing: "检测到无限递归循环，堆栈空间即将耗尽。任务：优化递归算法，引入尾递归或迭代方案，防止栈溢出。"
    },
    {
        id: "sector-boss",
        name: "奇点·抖动",
        description: "Singularity: Thrashing - 系统的最终防线，必须在此重构底层逻辑。",
        status: "HIGH_ENTROPY",
        difficulty: 6,
        position: { x: 85, y: 50 },
        totalQuestions: 60,
        entropyEntities: [INITIAL_ENTROPY_ENTITIES[2]],
        rewards: { exp: 1000 },
        missionBriefing: "系统核心逻辑正在发生剧烈抖动，资源调度完全失效。任务：直面奇点，重构底层调度算法，恢复系统秩序。"
    }
];

// 6. 铭文 (抽卡物品)
export const INSCRIPTIONS: Inscription[] = [
    {
        id: "inscription-banker",
        name: "银行家算法",
        rarity: "SSR",
        description: "前文明用来规避资源死锁的神圣逻辑。装备后，对'死锁级'崩坏兽伤害提升 50%。",
        effect: () => {},
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

// 7. 游戏配置
export const GAME_CONFIG = {
    entropyThreshold: 100,
    baseDamage: 30,
    comboThreshold: 3,
    gachaCost: 100,
} as const;

// 8. 默认主题配置 - 当没有AI生成主题时使用
export const DEFAULT_THEME: GameTheme = {
    id: 'default-cyber-scholar',
    name: '智者计划：默认主题',
    generatedAt: 0,
    sourceContent: '内置默认主题',

    pageLabels: {
        levelSelect: {
            title: '大统一理论演练',
            subtitle: 'GRAND UNIFICATION SIMULATION',
            sectorAnalysis: '扇区分析',
            missionBriefing: '协议部署简报',
            startButton: '开始潜渊',
            backButton: '中止链接',
            mindHackButton: '思维骇入',
        },
        battle: {
            constructsLabel: '逻辑构造体',
            entropyLabel: '认知熵实体',
            battleLogLabel: '战斗日志',
            retreatButton: '撤退',
            turnLabel: '回合',
        },
        mindHack: {
            title: '思维骇入',
            subtitle: 'MIND HACK // QUANTUM RETRIEVAL SYSTEM',
            hackButton: '启动骇入',
            hackingText: '正在穿透量子屏障...',
            confirmButton: '确认接收',
            backButton: '返回星图',
            warningText: '警告：每次骇入将消耗 100 能量单位',
        },
    },

    constructs: [
        {
            id: 'construct-01',
            model: 'ARBITER',
            name: '裁决者',
            title: 'The Arbiter',
            description: '专注于高伤害输出的逻辑构造体，擅长清除状态和终结打击。',
            skills: [
                {
                    id: 'skill-arbiter-1',
                    name: '强制中断',
                    nameEn: 'Force Interrupt',
                    description: '对单体造成高额逻辑伤害，并清除目标所有增益状态。',
                },
                {
                    id: 'skill-arbiter-ult',
                    name: '最终裁定',
                    nameEn: 'Final Verdict',
                    description: '消耗所有能量，对全体敌人造成毁灭性打击。若敌人处于逻辑死锁状态，伤害翻倍。',
                },
            ],
        },
        {
            id: 'construct-02',
            model: 'WEAVER',
            name: '织网者',
            title: 'The Weaver',
            description: '擅长控制和群体作战的逻辑构造体，可以施加逻辑死锁。',
            skills: [
                {
                    id: 'skill-weaver-1',
                    name: '链路封锁',
                    nameEn: 'Link Blockade',
                    description: '对全体敌人造成中等伤害，并施加"逻辑死锁"（无法行动1回合）。',
                },
            ],
        },
        {
            id: 'construct-03',
            model: 'ARCHITECT',
            name: '虚构者',
            title: 'The Architect',
            description: '防御型逻辑构造体，专注于为团队提供护盾和恢复。',
            skills: [
                {
                    id: 'skill-architect-1',
                    name: '哈希重构',
                    nameEn: 'Hash Rebuild',
                    description: '为我方全体施加护盾，并修复受损的逻辑扇区（回血）。',
                },
            ],
        },
    ],

    inscriptions: [
        {
            id: 'inscription-banker',
            name: '银行家算法',
            rarity: 'SSR',
            description: '前文明用来规避资源死锁的神圣逻辑。装备后，对"死锁级"崩坏兽伤害提升 50%。',
        },
        {
            id: 'inscription-dijkstra',
            name: '最短路径',
            rarity: 'SR',
            description: '在星图中移动时，不消耗行动力。',
        },
        {
            id: 'inscription-mutex',
            name: '互斥锁',
            rarity: 'R',
            description: '每回合开始时，有30%几率使一个敌人陷入逻辑死锁。',
        },
    ],

    battleLogTemplates: {
        enterSector: '进入扇区: {sectorName}',
        entropyStatus: {
            stable: '稳定',
            highEntropy: '高熵警报',
            locked: '已锁定',
        },
        questionSource: {
            ai: '🤖 AI动态生成',
            builtin: '📚 内置题库',
        },
        answerCorrect: '逻辑验证成功！熵值降低。',
        answerWrong: '逻辑错误！熵值上升！',
        skillUsed: '{constructName} 对目标使用了 {skillName}！',
        enemyDefeated: '{enemyName} 已被消解！',
        victory: '所有题目已完成！逻辑框架重建成功！',
        defeat: '逻辑构造体全灭，撤退失败...',
    },
};
