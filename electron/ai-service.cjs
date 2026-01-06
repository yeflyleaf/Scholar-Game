/**
 * Unified AI Service
 * Main service that manages AI providers and handles content generation
 * Replaces the old gemini-service.cjs with multi-provider support
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { createProvider, getAvailableProviders, getProvidersGroupedByRegion } = require('./providers/index.cjs');

class AIService {
  constructor() {
    this.provider = null;
    this.providerId = null;
    this.apiKey = null;
    this.model = null;
    this.accountId = null; // For Cloudflare
    
    // Load saved config
    this.loadConfig();
    
    // Initialize provider if config exists
    if (this.providerId && this.apiKey) {
      this.initProvider();
    }
  }

  // ============================================
  // Configuration Management
  // ============================================

  getConfigPath() {
    const appDataFolder = app.getPath('userData');
    if (!fs.existsSync(appDataFolder)) {
      fs.mkdirSync(appDataFolder, { recursive: true });
    }
    return path.join(appDataFolder, 'ai-config.json');
  }

  loadConfig() {
    const configPath = this.getConfigPath();
    if (fs.existsSync(configPath)) {
      try {
        const data = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(data);
        this.providerId = config.providerId || 'gemini';
        this.apiKey = config.apiKey || null;
        this.model = config.model || null;
        this.accountId = config.accountId || null;
        return config;
      } catch (e) {
        console.error('[AIService] Failed to load config:', e);
        return {};
      }
    }
    return {};
  }

  saveConfig() {
    const configPath = this.getConfigPath();
    const config = {
      providerId: this.providerId,
      apiKey: this.apiKey,
      model: this.model,
      accountId: this.accountId,
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  initProvider() {
    if (!this.providerId) {
      console.error('[AIService] No provider ID set');
      return false;
    }

    try {
      this.provider = createProvider(this.providerId, {
        apiKey: this.apiKey,
        model: this.model,
        accountId: this.accountId,
      });
      console.log(`[AIService] Initialized provider: ${this.providerId}`);
      return true;
    } catch (e) {
      console.error('[AIService] Failed to initialize provider:', e);
      return false;
    }
  }

  // ============================================
  // Provider Management
  // ============================================

  setProvider(providerId) {
    this.providerId = providerId;
    // Reset model when switching providers
    const providers = getAvailableProviders();
    const providerInfo = providers.find(p => p.id === providerId);
    if (providerInfo) {
      this.model = providerInfo.defaultModel;
    }
    this.saveConfig();
    this.initProvider();
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.saveConfig();
    if (this.provider) {
      this.provider.setApiKey(apiKey);
    } else {
      this.initProvider();
    }
  }

  setModel(model) {
    this.model = model;
    this.saveConfig();
    if (this.provider) {
      this.provider.setModel(model);
    }
  }

  setAccountId(accountId) {
    this.accountId = accountId;
    this.saveConfig();
    if (this.provider && typeof this.provider.setAccountId === 'function') {
      this.provider.setAccountId(accountId);
    }
  }

  isConfigured() {
    return !!this.apiKey && !!this.providerId;
  }

  getStatus() {
    return {
      configured: this.isConfigured(),
      providerId: this.providerId,
      model: this.model,
      providerName: this.provider?.displayName || null,
    };
  }

  getProviders() {
    return getAvailableProviders();
  }

  getProvidersGrouped() {
    return getProvidersGroupedByRegion();
  }

  // ============================================
  // Utility Methods
  // ============================================

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  extractJson(text) {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                      text.match(/(\[[\s\S]*\])/) || 
                      text.match(/(\{[\s\S]*\})/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        throw new Error('Failed to parse JSON from AI response');
      }
    }
    throw new Error('No valid JSON found in response');
  }

  // ============================================
  // Content Generation Methods
  // ============================================

  async complete(prompt, systemInstruction = null, options = {}) {
    if (!this.provider) {
      if (!this.initProvider()) {
        throw new Error('AI provider not configured');
      }
    }
    return this.provider.complete(prompt, systemInstruction, options);
  }

  /**
   * Generate questions from study content
   */
  async generateQuestions(content, options = {}) {
    let {
      count = 60,
      difficulty = 'mixed',
      types = ['Single', 'Multi', 'TrueFalse'],
    } = options;

    if (count < 60) {
      count = 60;
    }

    const BATCH_SIZE = 20;
    const batches = Math.ceil(count / BATCH_SIZE);
    let allQuestions = [];

    for (let batch = 0; batch < batches; batch++) {
      if (batch > 0) {
        console.log('[AIService] Waiting 3s before next batch...');
        await this.sleep(3000);
      }

      const batchCount = Math.min(BATCH_SIZE, count - allQuestions.length);
      
      try {
        const batchQuestions = await this._generateQuestionBatch(content, {
          count: batchCount,
          difficulty,
          types,
          batchIndex: batch,
          existingCount: allQuestions.length,
          previousQuestions: allQuestions.map(q => q.text),
        });
        
        allQuestions = allQuestions.concat(batchQuestions);
      } catch (error) {
        console.error(`[AIService] Batch ${batch + 1} failed:`, error);
        if (error.message.includes('配额') || error.message.includes('Quota')) {
          break;
        }
      }
      
      if (allQuestions.length >= count) {
        break;
      }
    }

    return allQuestions.slice(0, count);
  }

  async _generateQuestionBatch(content, options) {
    const { count, difficulty, types, batchIndex, existingCount, previousQuestions = [] } = options;

    const systemInstruction = `你是《智者计划：学习飞升》的首席知识架构师。
【世界观背景】
宇宙是一个巨大的运行程序。每隔一个学期纪元，被称为"大过滤器"的灾难就会降临。玩家是"第13纪元"的最后一位英桀，代号"首席智者"。

【绝对限制 - 违反者将被系统抹除】
1. 内容来源：所有题目的**题干**和**选项**必须【完全基于】提供的【知识碎片数据流】。不要编造资料中不存在的概念。
2. 答案逻辑：如果输入资料是习题集（只有题目没有答案），你必须利用你的 **逻辑推理能力** 和 **内建知识** 来分析并确定正确的选项。 **绝对禁止随机指定正确答案！** 必须确保\`correctOptionIndex\`指向客观正确的选项。
3. 严禁重复：必须检查【已生成题目列表】，确保新生成的题目与已有题目不重复。
4. 数量保证：必须生成 ${count} 道题。

【题目设计准则】
1. 深度挖掘：对于知识点，从定义、应用、反例等角度出题。
2. 干扰项：错误选项应是常见误解。
3. 难度分级：1-5级难度梯度分布。
4. 解析深度：解析必须解释"为什么选这个"。

【重要】必须严格生成 ${count} 道题目！确保答案准确无误！`;

    const prompt = `【逻辑重构请求 - 第${batchIndex + 1}批次】

首席智者，请生成 ${count} 道"真理验证"挑战（这是第${batchIndex + 1}批，之前已生成${existingCount}道）。

【已生成题目列表（禁止重复）】
${previousQuestions.length > 0 ? previousQuestions.map((q, i) => `${i+1}. ${q}`).join('\n') : '无'}

【知识碎片数据流】
${content}

【输出协议】
返回纯JSON数组，包含 ${count} 道题目：

[
  {
    "id": "q-${batchIndex}xxxx",
    "text": "题目内容",
    "type": "Single|Multi|TrueFalse",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correctOptionIndex": 0,
    "difficulty": 1-5,
    "timeLimit": 建议秒数,
    "explanation": "详细解析",
    "tags": ["知识点标签"]
  }
]

【生成策略】
- 必须生成 ${count} 道题目
- 难度分布：${difficulty === 'mixed' ? '梯度渐进' : `锁定难度等级 ${difficulty}`}
- 题型配比：${types.join(', ')}

立即输出包含 ${count} 道题目的JSON数组：`;

    const response = await this.complete(prompt, systemInstruction, { maxTokens: 200000 });
    const questions = this.extractJson(response);
    
    if (!Array.isArray(questions)) {
      console.warn('[AIService] Invalid question format, returning empty array');
      return [];
    }
    
    console.log(`[AIService] Batch ${batchIndex + 1}: requested ${count}, generated ${questions.length}`);
    return questions;
  }

  /**
   * Generate knowledge tree structure from content
   */
  async generateKnowledgeTree(content) {
    const systemInstruction = `你是《智者计划》的星图测绘师，负责将学习资料转化为可探索的"知识星域"。

【扇区设计原则】
1. 层级递进：从"初始引导扇区"到"奇点抖动"，难度逐步提升
2. 前置依赖：高级扇区需要先攻克基础扇区
3. 熵状态：STABLE(稳定)、HIGH_ENTROPY(高熵警告)、LOCKED(锁定)
4. 命名风格：使用计算机/科幻术语`;

    const prompt = `【星图测绘请求】

请分析以下学习内容，生成知识星域结构：

${content}

返回JSON格式：
{
  "nodes": [
    {
      "id": "sector-xxx",
      "name": "扇区名称",
      "description": "扇区描述",
      "difficulty": 1-6,
      "prerequisites": ["前置扇区ID数组"],
      "position": { "x": 0-100, "y": 0-100 },
      "questionCount": 题目数量,
      "isBoss": 是否为Boss扇区,
      "status": "STABLE|HIGH_ENTROPY|LOCKED",
      "topics": ["涵盖的具体知识点"]
    }
  ],
  "metadata": {
    "totalNodes": 总扇区数,
    "estimatedDuration": "预计学习时长",
    "suggestedOrder": ["建议的攻克顺序ID"]
  }
}

请只返回JSON，不要其他内容。`;

    const response = await this.complete(prompt, systemInstruction);
    return this.extractJson(response);
  }

  /**
   * Generate enemy data based on topic
   */
  async generateEnemies(topic, difficulty = 3) {
    const systemInstruction = `你是《智者计划》的认知熵实体设计师。

【实体类型】
- WHITE_NOISE（白噪干扰者）：低级实体，HP约50，攻击力10
- IMAGINARY_COLLAPSE（虚数崩坏体）：中级实体，HP约120，攻击力25
- SINGULARITY（奇点抖动）：Boss级实体，HP约300，攻击力40

【命名风格】
使用"形容词·名词"格式，如"白噪·干扰者"`;

    const prompt = `【认知熵实体生成请求】

为主题"${topic}"生成敌人数据，难度等级${difficulty}：

返回JSON格式：
[
  {
    "id": "entropy-xxx",
    "name": "实体名称",
    "form": "WHITE_NOISE|IMAGINARY_COLLAPSE|SINGULARITY",
    "hp": 血量,
    "maxHp": 最大血量,
    "damage": 攻击力,
    "visualGlitchIntensity": 0-1,
    "specialAbility": {
      "name": "技能名称",
      "description": "技能描述",
      "triggerCondition": "触发条件"
    }
  }
]

请只返回JSON数组。`;

    const response = await this.complete(prompt, systemInstruction);
    return this.extractJson(response);
  }

  /**
   * Generate complete chapter data
   */
  async generateChapter(title, content, difficulty = 3) {
    const systemInstruction = `你是《智者计划：学习飞升》的星域扇区设计师。

【设计原则】
1. 扇区描述要有科幻感
2. 认知熵实体命名使用"形容词·名词"格式
3. 题目数量 = 难度等级 x 10
4. 难度3及以上标记为HIGH_ENTROPY
5. 奖励经验值 = 难度等级 x 100`;

    const prompt = `【扇区构建请求】

扇区名称：${title}
熵压等级：${difficulty}

知识碎片：
${content}

返回JSON格式：
{
  "sector": {
    "id": "sector-xxx",
    "name": "${title}",
    "description": "扇区描述",
    "difficulty": ${difficulty},
    "status": "${difficulty >= 3 ? 'HIGH_ENTROPY' : 'STABLE'}",
    "totalQuestions": ${difficulty * 10}
  },
  "entropyEntities": [],
  "questions": [],
  "rewards": {
    "exp": ${difficulty * 100}
  }
}

生成${Math.max(3, difficulty)}个敌人和${difficulty * 10}道题目。
请只返回JSON。`;

    const response = await this.complete(prompt, systemInstruction, { maxTokens: 200000 });
    return this.extractJson(response);
  }

  /**
   * Generate complete game theme
   */
  async generateTheme(themeName, content) {
    const systemInstruction = `你是一个游戏内容生成专家，为教育类RPG游戏生成主题配置。
游戏名为"智者计划：飞升学习"，采用赛博朋克+科幻美学风格。

根据学习资料生成：
1. 页面标签
2. 构造体（玩家角色，3个）
3. 铭文（抽卡物品，3个以上）
4. 战斗日志模板
5. 扇区列表（6个关卡）

所有内容必须与学习资料主题相关，保持赛博朋克风格，使用中文。`;

    const prompt = `主题关键词: ${themeName}

学习资料内容:
${content.substring(0, 6000)}

请生成完整游戏主题配置。
【重要】主题名称需要创造富有意境的科幻风格名称，不要直接使用"${themeName}"。

返回JSON格式：
{
  "name": "AI生成的意境名称",
  "sourceContent": "基于提供的学习资料",
  "pageLabels": { ... },
  "constructs": [ ... ],
  "inscriptions": [ ... ],
  "battleLogTemplates": { ... },
  "sectors": [
    {
      "id": "sector-1",
      "name": "第1关名称",
      "description": "英文副标题 - 简短中文描述"
    },
    ...
  ]
}

请只返回JSON。`;

    const response = await this.complete(prompt, systemInstruction, { maxTokens: 200000 });
    const theme = this.extractJson(response);
    
    if (theme) {
      theme.id = `theme-${Date.now()}`;
      theme.generatedAt = Date.now();
    }
    
    return theme;
  }

  /**
   * Generate mission briefing for a sector
   */
  async generateMissionBriefing(sectorName, sectorDescription) {
    const systemInstruction = `你是《智者计划》的战术指挥官，负责发布任务简报。
【风格要求】
1. 极简主义：不超过50个字
2. 科幻/赛博朋克风格
3. 紧迫感`;

    const prompt = `【生成任务简报】
目标扇区：${sectorName}
扇区情报：${sectorDescription}

请生成一条简短的任务简报。
请只返回简报文本，不要JSON，不要引号。`;

    const response = await this.complete(prompt, systemInstruction);
    return response.trim();
  }

  /**
   * Generate mission briefings for multiple sectors
   */
  async generateAllMissionBriefings(sectors) {
    const systemInstruction = `你是《智者计划》的战术指挥官，负责批量发布任务简报。
【风格要求】
1. 每条不超过50个字
2. 科幻/赛博朋克风格
3. 紧迫感`;

    const sectorList = sectors.map(s => `- ${s.id}: "${s.name}" (${s.description})`).join('\n');

    const prompt = `【批量任务简报生成】

目标扇区列表：
${sectorList}

为每个扇区生成一条任务简报，返回JSON格式：
{
  "sector-1": "简报内容",
  "sector-2": "简报内容",
  ...
}

请只返回JSON。`;

    const response = await this.complete(prompt, systemInstruction);
    return this.extractJson(response);
  }

  /**
   * Parse document content (for text files)
   */
  async parseDocument(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.txt' || ext === '.md') {
      return fs.readFileSync(filePath, 'utf-8');
    }
    
    throw new Error(`Unsupported file format: ${ext}. Currently supported: .txt, .md`);
  }
}

module.exports = { AIService };
