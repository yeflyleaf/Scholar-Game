/**
 * Gemini API Service for generating game data
 * Uses Google's Generative AI (Gemini) API
 */

const fs = require('fs');
const path = require('path');

class GeminiService {
  constructor() {
    this.apiKey = null;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = null; 
    this.loadConfig(); // Load config on init
    
    // If model is still not set after loading config, use default
    if (!this.model) {
      this.model = 'gemini-2.5-flash';
    }

    // Rate Limiting Initialization
    this.usageFile = path.join(path.dirname(this.getConfigPath()), 'usage.json');
    this.minuteWindowStart = Date.now();
    this.requestsInMinute = 0;
    this.tokensInMinute = 0;
    this.requestsToday = 0;
    this.loadUsage();
  }

  setApiKey(key) {
    // Save to config file for persistence
    const configPath = this.getConfigPath();
    // Load existing config first
    const config = this.loadConfig();
    
    config.apiKey = key;
    this.apiKey = key;
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  setModel(model) {
    // Save to config file for persistence
    const configPath = this.getConfigPath();
    // Load existing config first (this might reset this.model, so we set it back after)
    const config = this.loadConfig();
    
    config.model = model;
    this.model = model; // Ensure in-memory model is updated to the new one
    
    console.log(`Model updated to: ${this.model}`);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  getConfigPath() {
    // 使用应用安装目录下的 data 文件夹，而不是 C 盘的 APPDATA
    // __dirname 是当前脚本所在目录 (electron/)
    const appDataFolder = path.join(__dirname, '..', 'data');
    
    if (!fs.existsSync(appDataFolder)) {
      fs.mkdirSync(appDataFolder, { recursive: true });
    }
    
    return path.join(appDataFolder, 'config.json');
  }

  loadConfig() {
    const configPath = this.getConfigPath();
    if (fs.existsSync(configPath)) {
      try {
        const data = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(data);
        this.apiKey = config.apiKey || null;
        if (config.model) {
          this.model = config.model;
        }
        return config;
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  isConfigured() {
    if (!this.apiKey) {
      this.loadConfig();
    }
    return !!this.apiKey;
  }

  getModel() {
    return this.model;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  loadUsage() {
    try {
      if (fs.existsSync(this.usageFile)) {
        const data = JSON.parse(fs.readFileSync(this.usageFile, 'utf-8'));
        const today = new Date().toDateString();
        if (data.date === today) {
          this.requestsToday = data.requests || 0;
        } else {
          this.requestsToday = 0;
          this.saveUsage();
        }
      }
    } catch (e) {
      console.error('Failed to load usage:', e);
      this.requestsToday = 0;
    }
  }

  saveUsage() {
    try {
      const data = {
        date: new Date().toDateString(),
        requests: this.requestsToday
      };
      fs.writeFileSync(this.usageFile, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to save usage:', e);
    }
  }

  checkRateLimits(estimatedTokens) {
    const now = Date.now();
    if (now - this.minuteWindowStart > 60000) {
      this.minuteWindowStart = now;
      this.requestsInMinute = 0;
      this.tokensInMinute = 0;
    }

    if (this.requestsInMinute >= 5) {
      throw new Error('速率限制：每分钟最多5次请求 (RPM Exceeded)');
    }

    if (this.tokensInMinute + estimatedTokens > 250000) {
      throw new Error('速率限制：每分钟最多250k Token (TPM Exceeded)');
    }

    this.loadUsage(); // Reload to ensure daily limit is up to date
    if (this.requestsToday >= 20) {
      throw new Error('每日配额已用完：每天最多20次请求 (RPD Exceeded)');
    }
  }

  incrementUsage(estimatedTokens) {
    this.requestsInMinute++;
    this.tokensInMinute += estimatedTokens;
    this.requestsToday++;
    this.saveUsage();
  }

  async callGemini(prompt, systemInstruction = null, retryCount = 0) {
    return this.callGeminiWithTokens(prompt, systemInstruction, 200000, retryCount);
  }

  extractJson(text) {
    // Try to extract JSON from markdown code blocks or raw JSON
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                      text.match(/(\[[\s\S]*\])/) || 
                      text.match(/(\{[\s\S]*\})/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        throw new Error('Failed to parse JSON from Gemini response');
      }
    }
    
    throw new Error('No valid JSON found in response');
  }

  /**
   * Generate questions from study content
   */
  async generateQuestions(content, options = {}) {
    let {
      count = 60,
      difficulty = 'mixed', // 1-5 or 'mixed'
      types = ['Single', 'Multi', 'TrueFalse'],
      language = 'zh-CN'
    } = options;

    // 强制至少生成60道题
    if (count < 60) {
      console.log(`Requested count ${count} is too low. Enforcing minimum of 60.`);
      count = 60;
    }

    // 分批生成逻辑：每批最多生成20道题，确保生成质量
    const BATCH_SIZE = 20;
    const batches = Math.ceil(count / BATCH_SIZE);
    let allQuestions = [];

    for (let batch = 0; batch < batches; batch++) {
      // 如果不是第一批，添加延迟以避免速率限制
      if (batch > 0) {
        console.log('Waiting 3s before next batch to avoid rate limits...');
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
          previousQuestions: allQuestions.map(q => q.text) // 传递已生成的题目文本，用于去重
        });
        
        allQuestions = allQuestions.concat(batchQuestions);
      } catch (error) {
        console.error(`Batch ${batch + 1} failed:`, error);
        // 如果是配额错误，可能需要停止后续批次，或者只返回已生成的
        if (error.message.includes('配额耗尽') || error.message.includes('Quota Exceeded')) {
           console.warn('Quota exceeded, stopping generation and returning partial results.');
           break;
        }
      }
      
      // 如果已经生成足够的题目，提前退出
      if (allQuestions.length >= count) {
        break;
      }
    }

    // 确保不超过请求的数量
    return allQuestions.slice(0, count);
  }

  /**
   * Generate a single batch of questions (internal method)
   */
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
4. 解析深度：解析必须解释"为什么选这个"，如果原资料有解释则引用，如果没有则基于逻辑补充。

【重要】必须严格生成 ${count} 道题目！确保答案准确无误！`;

    const prompt = `【逻辑重构请求 - 第${batchIndex + 1}批次】

首席智者，请生成 ${count} 道"真理验证"挑战（这是第${batchIndex + 1}批，之前已生成${existingCount}道）。

【已生成题目列表（禁止重复）】
${previousQuestions.length > 0 ? previousQuestions.map((q, i) => `${i+1}. ${q}`).join('\n') : '无'}

【知识碎片数据流（仅限使用以下内容，但需自动分析正确答案）】
${content}

【输出协议】
返回纯JSON数组，包含 ${count} 道题目：

[
  {
    "id": "q-${batchIndex}xxxx",
    "text": "题目内容",
    "type": "Single|Multi|TrueFalse",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correctOptionIndex": 0, // 必须是经过逻辑分析后的正确答案索引
    "difficulty": 1-5,
    "timeLimit": 建议秒数,
    "explanation": "详细解析（解释为什么该选项正确）",
    "tags": ["知识点标签"]
  }
]

【生成策略】
- 必须生成 ${count} 道题目
- **核心要求**：如果输入是题目，请务必**做题**，选出正确答案。如果输入是知识点，请据此出题。
- 绝对不要重复已有的题目
- 难度分布：${difficulty === 'mixed' ? '梯度渐进' : `锁定难度等级 ${difficulty}`}
- 题型配比：${types.join(', ')}

立即输出包含 ${count} 道题目的JSON数组：`;

    // 使用200k token限制以支持大量题目生成
    const response = await this.callGeminiWithTokens(prompt, systemInstruction, 200000);
    const questions = this.extractJson(response);
    
    // 验证返回的题目数量
    if (!Array.isArray(questions)) {
      console.warn('生成的题目格式错误，返回空数组');
      return [];
    }
    
    console.log(`批次${batchIndex + 1}：请求${count}道题，实际生成${questions.length}道`);
    return questions;
  }

  /**
   * Call Gemini API with custom token limit
   */
  async callGeminiWithTokens(prompt, systemInstruction = null, maxTokens = 8192, retryCount = 0) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Estimate input tokens (rough char count / 4)
    const inputContent = (prompt || '') + (systemInstruction || '');
    const estimatedTokens = Math.ceil(inputContent.length / 4);

    // Check limits before making request
    this.checkRateLimits(estimatedTokens);
    
    // Increment usage
    this.incrementUsage(estimatedTokens);

    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
    console.log(`Calling Gemini API with model: ${this.model}`);
    
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: maxTokens,
      }
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 429) {
          console.error('Gemini API Quota Exceeded:', errorText);
          
          // 如果还有重试机会
          if (retryCount < 3) {
            // 尝试解析建议的等待时间
            let waitTime = 10; // 默认10秒
            try {
              const errorJson = JSON.parse(errorText);
              // 查找 retryDelay，格式通常是 "15s" 或 "47.123s"
              const retryInfo = errorJson.error?.details?.find(d => d['@type']?.includes('RetryInfo'));
              if (retryInfo && retryInfo.retryDelay) {
                waitTime = parseFloat(retryInfo.retryDelay.replace('s', '')) + 1; // 多等1秒
              }
            } catch (e) {
              // 解析失败，使用默认指数退避
              waitTime = 10 * Math.pow(2, retryCount); 
            }
            
            console.log(`Rate limited. Retrying in ${waitTime}s... (Attempt ${retryCount + 1}/3)`);
            await this.sleep(waitTime * 1000);
            return this.callGeminiWithTokens(prompt, systemInstruction, maxTokens, retryCount + 1);
          }

          throw new Error('AI核心过载（配额耗尽），请稍后重试或检查API密钥配额。');
        }
        
        // 处理503服务过载错误 - 自动重试
        if (response.status === 503) {
          console.error('Gemini API Overloaded:', errorText);
          
          if (retryCount < 3) {
            const waitTime = 15 * Math.pow(1.5, retryCount); // 15秒, 22.5秒, 33.75秒
            console.log(`API overloaded (503). Retrying in ${waitTime.toFixed(1)}s... (Attempt ${retryCount + 1}/3)`);
            await this.sleep(waitTime * 1000);
            return this.callGeminiWithTokens(prompt, systemInstruction, maxTokens, retryCount + 1);
          }
          
          throw new Error('AI核心暂时过载，请稍后重试。');
        }
        
        throw new Error(`Gemini API error: ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      // 如果是网络错误等，也可以考虑重试，但目前主要针对429
      if (retryCount < 3 && error.message.includes('fetch failed')) {
         console.log(`Network error. Retrying... (Attempt ${retryCount + 1}/3)`);
         await this.sleep(5000);
         return this.callGeminiWithTokens(prompt, systemInstruction, maxTokens, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Generate knowledge tree structure from content
   */
  async generateKnowledgeTree(content) {
    const systemInstruction = `你是《智者计划》的星图测绘师，负责将学习资料转化为可探索的"知识星域"。

【世界观】
在智者计划的宇宙中，知识以"星图扇区"的形式存在。每个扇区都可能被"认知熵"侵蚀，玩家需要逐个攻克这些扇区来重建逻辑框架。

【扇区设计原则】
1. 层级递进：从"初始引导扇区"到"奇点抖动"，难度逐步提升
2. 前置依赖：高级扇区需要先攻克基础扇区
3. 熵状态：STABLE(稳定)、HIGH_ENTROPY(高熵警告)、LOCKED(锁定)
4. 命名风格：使用计算机/科幻术语，如"虚存的迷宫"、"并发的洪流"、"协议的废墟"`;

    const prompt = `【星图测绘请求】

请分析以下学习内容，生成知识星域结构：

${content}

返回JSON格式：
{
  "nodes": [
    {
      "id": "sector-xxx",
      "name": "扇区名称（如：初始引导扇区、虚存的迷宫）",
      "description": "扇区描述，包含熵状态和危险等级",
      "difficulty": 1-6,
      "prerequisites": ["前置扇区ID数组"],
      "position": { "x": 0-100, "y": 0-100 },
      "questionCount": 题目数量(难度x10),
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

    const response = await this.callGemini(prompt, systemInstruction);
    return this.extractJson(response);
  }

  /**
   * Generate enemy data based on topic
   */
  async generateEnemies(topic, difficulty = 3) {
    const systemInstruction = `你是《智者计划》的认知熵实体设计师。

【敌人背景】
认知熵实体是由未掌握的知识点异化而成的数据幽灵。它们窃取人类的知识碎片，将其扭曲为攻击武器。玩家必须通过正确答题来击败它们，夺回被窃取的知识。

【实体类型】
- WHITE_NOISE（白噪干扰者）：低级实体，HP约50，攻击力10，造成选项干扰
- IMAGINARY_COLLAPSE（虚数崩坏体）：中级实体，HP约120，攻击力25，可能导致时间压缩
- SINGULARITY（奇点抖动）：Boss级实体，HP约300，攻击力40，拥有"熵值暴涨"等强力技能

【命名风格】
使用"形容词·名词"格式，如"白噪·干扰者"、"虚数·崩坏体"、"递归·死循环"`;

    const prompt = `【认知熵实体生成请求】

为主题"${topic}"生成敌人数据，难度等级${difficulty}：

返回JSON格式：
[
  {
    "id": "entropy-xxx",
    "name": "实体名称（如：白噪·干扰者）",
    "form": "WHITE_NOISE|IMAGINARY_COLLAPSE|SINGULARITY",
    "hp": 血量,
    "maxHp": 最大血量,
    "damage": 攻击力,
    "visualGlitchIntensity": 0-1的故障特效强度,
    "specialAbility": {
      "name": "技能名称",
      "description": "技能描述",
      "triggerCondition": "触发条件"
    }
  }
]

根据难度${difficulty}，生成合适数量和强度的敌人。
请只返回JSON数组，不要其他内容。`;

    const response = await this.callGemini(prompt, systemInstruction);
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
    
    // For PDF, we would need a PDF parser library
    // For now, return error for unsupported formats
    throw new Error(`Unsupported file format: ${ext}. Currently supported: .txt, .md`);
  }

  /**
   * Generate complete chapter data with questions and enemies
   */
  async generateChapter(title, content, difficulty = 3) {
    const systemInstruction = `你是《智者计划：学习飞升》的星域扇区设计师。

【任务】
为首席智者设计一个完整可玩的知识扇区，包含认知熵实体（敌人）和真理验证挑战（题目）。

【设计原则】
1. 扇区描述要有科幻感，使用计算机术语
2. 认知熵实体命名使用"形容词·名词"格式
3. 题目数量 = 难度等级 x 10
4. 难度3及以上标记为HIGH_ENTROPY（高熵警告）
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
    "description": "扇区描述（科幻风格）",
    "difficulty": ${difficulty},
    "status": "${difficulty >= 3 ? 'HIGH_ENTROPY' : 'STABLE'}",
    "totalQuestions": ${difficulty * 10}
  },
  "entropyEntities": [
    {
      "id": "entropy-xxx",
      "name": "实体名称（如：白噪·干扰者）",
      "form": "WHITE_NOISE|IMAGINARY_COLLAPSE|SINGULARITY",
      "hp": 数值,
      "maxHp": 数值,
      "damage": 数值,
      "visualGlitchIntensity": 0-1
    }
  ],
  "questions": [
    {
      "id": "q-xxx",
      "text": "题目",
      "type": "Single|Multi|TrueFalse",
      "options": ["选项数组"],
      "correctOptionIndex": 正确答案索引,
      "difficulty": 1-${difficulty},
      "timeLimit": 秒数,
      "explanation": "解析",
      "tags": ["标签"]
    }
  ],
  "rewards": {
    "exp": ${difficulty * 100}
  }
}

生成${Math.max(3, difficulty)}个敌人和${difficulty * 10}道题目。
请只返回JSON，不要其他内容。`;

    const response = await this.callGemini(prompt, systemInstruction);
    return this.extractJson(response);
  }

  /**
   * 生成完整的游戏主题
   * @param {string} themeName - 主题名称
   * @param {string} content - 学习资料内容
   * @returns {Promise<Object>} 完整的游戏主题配置
   */
  async generateTheme(themeName, content) {
    const systemInstruction = `你是一个游戏内容生成专家，正在为一款教育类RPG游戏生成完整的主题配置。
游戏名为"智者计划：飞升学习"，采用赛博朋克+科幻美学风格。

根据用户提供的学习资料，你需要生成以下内容：
1. 页面标签（levelSelect, battle, mindHack）
2. 构造体（玩家角色，3个）
3. 铭文（抽卡物品，3个以上）
4. 战斗日志模板

所有内容必须：
- 与学习资料的主题相关
- 保持赛博朋克/科幻的语言风格
- 使用中文
- 具有教育意义`;

    const prompt = `用户提供的主题关键词: ${themeName}

学习资料内容:
${content.substring(0, 6000)}

请生成一个完整的游戏主题配置。
【重要】主题名称（name字段）需要你根据学习资料内容创造一个富有意境的、符合赛博朋克/科幻风格的名称，不要直接使用用户输入的"${themeName}"这个直白的名称。
例如：如果用户输入"计算机网络"，你可以生成"数据洪流·节点觉醒"或"协议圣殿"这样有意境的名称。

返回JSON格式：
{
  "name": "由AI生成的有意境的主题名称",
  "sourceContent": "基于提供的学习资料",
  "pageLabels": {
    "levelSelect": {
      "title": "根据内容起一个符合主题的标题",
      "subtitle": "英文副标题",
      "sectorAnalysis": "扇区分析的别名",
      "missionBriefing": "任务简报的别名",
      "startButton": "开始按钮文本",
      "backButton": "返回按钮文本",
      "mindHackButton": "抽卡按钮文本"
    },
    "battle": {
      "constructsLabel": "玩家角色区域标签",
      "entropyLabel": "敌人区域标签",
      "battleLogLabel": "战斗日志标签",
      "retreatButton": "撤退按钮文本",
      "turnLabel": "回合标签"
    },
    "mindHack": {
      "title": "抽卡界面标题",
      "subtitle": "英文副标题",
      "hackButton": "抽卡按钮文本",
      "hackingText": "抽卡进行中的提示文本",
      "confirmButton": "确认按钮文本",
      "backButton": "返回按钮文本",
      "warningText": "消耗警告文本"
    }
  },
  "constructs": [
    {
      "id": "construct-01",
      "model": "ARBITER",
      "name": "根据主题起名",
      "title": "英文称号",
      "description": "角色描述",
      "skills": [
        {
          "id": "skill-1",
          "name": "技能名",
          "nameEn": "英文名",
          "description": "技能效果描述"
        }
      ]
    },
    // WEAVER 和 ARCHITECT 类似
  ],
  "inscriptions": [
    {
      "id": "inscription-1",
      "name": "铭文名称（与学习内容相关的概念）",
      "rarity": "SSR|SR|R",
      "description": "铭文效果描述"
    }
  ],
  "battleLogTemplates": {
    "enterSector": "进入扇区消息模板，用{sectorName}表示扇区名",
    "entropyStatus": {
      "stable": "稳定状态文本",
      "highEntropy": "危险状态文本",
      "locked": "锁定状态文本"
    },
    "questionSource": {
      "ai": "AI题目来源标签",
      "builtin": "内置题库来源标签"
    },
    "answerCorrect": "答对消息",
    "answerWrong": "答错消息",
    "skillUsed": "使用技能消息模板，用{constructName}和{skillName}占位",
    "enemyDefeated": "击败敌人消息，用{enemyName}占位",
    "victory": "胜利消息",
    "defeat": "失败消息"
  },
  "sectors": [
    {
      "id": "sector-1",
      "name": "第1关名称（与学习主题相关，有意境）",
      "description": "英文副标题 - 简短的中文描述，难度最低"
    },
    {
      "id": "sector-2",
      "name": "第2关名称",
      "description": "英文副标题 - 简短的中文描述"
    },
    {
      "id": "sector-3",
      "name": "第3关名称",
      "description": "英文副标题 - 简短的中文描述"
    },
    {
      "id": "sector-4",
      "name": "第4关名称",
      "description": "英文副标题 - 简短的中文描述"
    },
    {
      "id": "sector-5",
      "name": "第5关名称",
      "description": "英文副标题 - 简短的中文描述"
    },
    {
      "id": "sector-boss",
      "name": "最终关名称（Boss关，最高难度）",
      "description": "英文副标题 - 简短的中文描述，体现最高挑战"
    }
  ]
}

请生成3个构造体（ARBITER、WEAVER、ARCHITECT各一个）和至少3个铭文。
【重要】sectors数组中的6个扇区名称和描述必须与"${themeName}"学习主题相关，体现从简单到困难的递进。
确保所有内容都与"${themeName}"主题相关。
请只返回JSON，不要其他内容。`;

    const response = await this.callGeminiWithTokens(prompt, systemInstruction, 200000);
    const theme = this.extractJson(response);
    
    if (theme) {
      // 添加元数据
      theme.id = `theme-${Date.now()}`;
      theme.generatedAt = Date.now();
    }
    
    return theme;
  }

  /**
   * Generate mission briefing for a sector
   */
  async generateMissionBriefing(sectorName, sectorDescription) {
    const systemInstruction = `你是《智者计划》的战术指挥官，负责向首席智者发布任务简报。
【风格要求】
1. 极简主义：不超过50个字。
2. 科幻/赛博朋克风格：使用"认知熵"、"逻辑框架"、"数据流"、"协议"等术语。
3. 紧迫感：强调任务的重要性和危险性。
4. 动态性：每次生成的简报应略有不同，反映战场的实时变化。`;

    const prompt = `【生成任务简报】
目标扇区：${sectorName}
扇区情报：${sectorDescription}

请生成一条简短的任务简报（Mission Briefing），指导玩家在该扇区的行动。
格式参考："目标：[行动目标]，通过[手段]达成[结果]。" 或 "警告：[异常现象]。任务：[具体行动]。"

请只返回简报文本，不要JSON，不要引号。`;

    const response = await this.callGemini(prompt, systemInstruction);
    return response.trim();
  }

  /**
   * Generate mission briefings for multiple sectors in one batch
   */
  async generateAllMissionBriefings(sectors) {
    const systemInstruction = `你是《智者计划》的战术指挥官，负责批量发布任务简报。
【风格要求】
1. 极简主义：每条不超过50个字。
2. 科幻/赛博朋克风格：使用"认知熵"、"逻辑框架"、"数据流"、"协议"等术语。
3. 紧迫感：强调任务的重要性和危险性。

请为每个扇区生成一条简报。`;

    const sectorsText = sectors.map((s, i) => `扇区${i+1} [ID:${s.id}]: ${s.name} - ${s.description}`).join('\n');

    const prompt = `【批量生成任务简报】
请为以下扇区生成任务简报：

${sectorsText}

请返回JSON格式，键为扇区ID，值为简报文本：
{
  "sector-id-1": "简报内容...",
  "sector-id-2": "简报内容..."
}
请只返回JSON。`;

    const response = await this.callGemini(prompt, systemInstruction);
    return this.extractJson(response);
  }
}

module.exports = { GeminiService };
