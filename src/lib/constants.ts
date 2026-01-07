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
        // 当前生命值 (Health Points)，降为0时角色无法战斗
        hp: 150,
        // 最大生命值上限
        maxHp: 150,
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
                description: "对单体造成高额逻辑伤害，并清除目标所有增益状态。",
                // 技能冷却时间（回合数）
                cooldown: 3,
                // 当前剩余冷却时间，0表示可以使用
                currentCooldown: 0,
                // 技能类型：active(主动技能) / ultimate(终极技能) / passive(被动技能)
                type: "active",
                // 技能目标类型：single_enemy(单体敌人) / all_enemies(全体敌人) / self(自身) / ally(队友)
                targetType: "single_enemy",
                // 技能消耗的资源数值（通常指能量或行动点）
                cost: 30,
                // 技能释放时的视觉特效ID
                visualEffect: "data_deletion"
            },
            {
                // 技能唯一标识符
                id: "skill-arbiter-ult",
                // 技能中文名称
                name: "最终裁定",
                // 技能英文名称
                nameEn: "Final Verdict",
                // 技能详细描述
                description: "消耗所有能量，对全体敌人造成毁灭性打击。若敌人处于逻辑死锁状态，伤害翻倍。",
                // 技能冷却时间
                cooldown: 5,
                // 当前剩余冷却时间
                currentCooldown: 0,
                // 技能类型：终极技能
                type: "ultimate",
                // 技能目标类型：全体敌人
                targetType: "all_enemies",
                // 技能消耗能量值
                cost: 100,
                // 视觉特效ID
                visualEffect: "binary_stream"
            }
        ]
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
        // 当前生命值
        hp: 120,
        // 最大生命值
        maxHp: 120,
        // 当前能量值
        energy: 100,
        // 最大能量值
        maxEnergy: 100,
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
                description: "对全体敌人造成中等伤害，并施加'逻辑死锁'（无法行动1回合）。",
                // 技能冷却时间
                cooldown: 4,
                // 当前剩余冷却时间
                currentCooldown: 0,
                // 技能类型
                type: "active",
                // 技能目标类型
                targetType: "all_enemies",
                // 技能消耗
                cost: 40,
                // 视觉特效ID
                visualEffect: "hex_shield"
            }
        ]
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
        // 当前生命值
        hp: 200,
        // 最大生命值
        maxHp: 200,
        // 当前能量值
        energy: 100,
        // 最大能量值
        maxEnergy: 100,
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
                description: "为我方全体施加护盾，并修复受损的逻辑扇区（回血）。",
                // 技能冷却时间
                cooldown: 3,
                // 当前剩余冷却时间
                currentCooldown: 0,
                // 技能类型
                type: "active",
                // 技能目标类型：自身（实际效果可能影响全体）
                targetType: "self",
                // 技能消耗
                cost: 35,
                // 视觉特效ID
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
        hp: 50,
        // 最大生命值
        maxHp: 50,
        // 基础攻击力，对玩家造成的伤害数值
        damage: 10,
        // 该实体携带的题库，玩家攻击时需要回答这些问题
        questionBank: SAMPLE_QUESTIONS.slice(0, 2),
        // 当前受到的状态效果列表
        statusEffects: [],
        // 存活状态标识
        isDead: false,
        // 视觉故障强度 (0.0 - 1.0)，影响UI的扭曲程度
        visualGlitchIntensity: 0.2
    },
    {
        // 实体唯一标识符
        id: "entropy-2",
        // 实体显示名称
        name: "虚数·崩坏体",
        // 实体形态/类型
        form: "IMAGINARY_COLLAPSE",
        // 当前生命值
        hp: 120,
        // 最大生命值
        maxHp: 120,
        // 基础攻击力
        damage: 25,
        // 携带题库
        questionBank: SAMPLE_QUESTIONS.slice(2, 4),
        // 状态效果列表
        statusEffects: [],
        // 存活状态标识
        isDead: false,
        // 视觉故障强度
        visualGlitchIntensity: 0.5
    },
    {
        // 实体唯一标识符
        id: "entropy-boss",
        // 实体显示名称
        name: "奇点·抖动",
        // 实体形态/类型
        form: "SINGULARITY",
        // 当前生命值
        hp: 300,
        // 最大生命值
        maxHp: 300,
        // 基础攻击力
        damage: 40,
        // 携带题库
        questionBank: SAMPLE_QUESTIONS.slice(4),
        // 状态效果列表
        statusEffects: [],
        // 存活状态标识
        isDead: false,
        // 视觉故障强度
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
        totalQuestions: 20,
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
        totalQuestions: 40,
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
        totalQuestions: 60,
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
        totalQuestions: 80,
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
        totalQuestions: 100,
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
        totalQuestions: 120,
        entropyEntities: [INITIAL_ENTROPY_ENTITIES[2]],
        rewards: { exp: 1000 },
        missionBriefing: "系统核心逻辑正在发生剧烈抖动，资源调度完全失效。任务：直面奇点，重构底层调度算法，恢复系统秩序。"
    }
];

// 6. 铭文 (抽卡物品)
// 玩家可以通过抽卡获得的增益道具列表
export const INSCRIPTIONS: Inscription[] = [
    {
        // 铭文唯一标识符
        id: "inscription-banker",
        // 铭文显示名称
        name: "银行家算法",
        // 稀有度等级：SSR / SR / R / N
        rarity: "SSR",
        // 铭文功能描述
        description: "前文明用来规避资源死锁的神圣逻辑。装备后，对'死锁级'崩坏兽伤害提升 50%。",
        // 铭文的具体逻辑效果函数（目前为空实现）
        effect: () => {},
        // 铭文图标资源ID
        icon: "banker_algo_icon"
    },
    {
        // 铭文唯一标识符
        id: "inscription-dijkstra",
        // 铭文显示名称
        name: "最短路径",
        // 稀有度等级
        rarity: "SR",
        // 铭文功能描述
        description: "在星图中移动时，不消耗行动力。",
        // 铭文效果函数
        effect: () => {},
        // 铭文图标资源ID
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
