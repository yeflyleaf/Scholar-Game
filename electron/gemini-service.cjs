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
    this.model = 'gemini-2.0-flash';
  }

  setApiKey(key) {
    this.apiKey = key;
    // Save to config file for persistence
    const configPath = this.getConfigPath();
    const config = this.loadConfig();
    config.apiKey = key;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  getConfigPath() {
    const userDataPath = process.env.APPDATA || 
      (process.platform === 'darwin' 
        ? `${process.env.HOME}/Library/Application Support` 
        : `${process.env.HOME}/.config`);
    const appFolder = path.join(userDataPath, 'CyberScholar');
    
    if (!fs.existsSync(appFolder)) {
      fs.mkdirSync(appFolder, { recursive: true });
    }
    
    return path.join(appFolder, 'config.json');
  }

  loadConfig() {
    const configPath = this.getConfigPath();
    if (fs.existsSync(configPath)) {
      try {
        const data = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(data);
        this.apiKey = config.apiKey || null;
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

  async callGemini(prompt, systemInstruction = null) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
    
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
        maxOutputTokens: 8192,
      }
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
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
    const {
      count = 10,
      difficulty = 'mixed', // 1-5 or 'mixed'
      types = ['Single', 'Multi', 'TrueFalse'],
      language = 'zh-CN'
    } = options;

    const systemInstruction = `你是一个专业的教育AI助手，负责将学习资料转化为游戏化的题目。
你需要生成高质量的选择题，用于一款赛博朋克风格的学习RPG游戏《赛博学神：神经潜渊》。

要求：
1. 题目应该准确反映学习内容的核心知识点
2. 选项应该有明确的区分度，避免模糊
3. 难度从1-5分级（1=简单，5=极难）
4. 每道题都要有详细的解析
5. 题目类型：Single(单选), Multi(多选), TrueFalse(判断)
6. 回答时间建议：简单题20秒，中等30秒，困难45秒，极难60秒`;

    const prompt = `请根据以下学习内容生成 ${count} 道题目。

学习内容：
${content}

要求生成的题目格式为JSON数组：
[
  {
    "id": "唯一ID",
    "text": "题目内容",
    "type": "Single|Multi|TrueFalse",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correctOptionIndex": 0, // 单选为数字，多选为数组如[0,2]
    "difficulty": 1-5,
    "timeLimit": 秒数,
    "explanation": "详细解析",
    "tags": ["知识点标签"]
  }
]

难度分布：${difficulty === 'mixed' ? '混合分布' : `全部为难度${difficulty}`}
题目类型：${types.join(', ')}

请只返回JSON数组，不要其他内容。`;

    const response = await this.callGemini(prompt, systemInstruction);
    return this.extractJson(response);
  }

  /**
   * Generate knowledge tree structure from content
   */
  async generateKnowledgeTree(content) {
    const systemInstruction = `你是一个知识结构分析专家，负责将学习资料转化为知识树结构。
这是为游戏《赛博学神：神经潜渊》生成的知识网络地图。

节点应该：
1. 有清晰的层级关系（基础 -> 进阶 -> 高级）
2. 互相之间有合理的前置依赖
3. 每个节点对应一个章节或知识模块`;

    const prompt = `请分析以下学习内容，生成知识树结构：

${content}

返回JSON格式：
{
  "nodes": [
    {
      "id": "node-xxx",
      "name": "节点名称",
      "description": "节点描述，包含知识实体数量和危险等级",
      "difficulty": 1-5,
      "prerequisites": ["前置节点ID数组"],
      "position": { "x": 0-100, "y": 0-100 }, // 百分比位置
      "questionCount": 预计题目数量,
      "isBoss": 是否为Boss节点,
      "topics": ["涵盖的具体知识点"]
    }
  ],
  "metadata": {
    "totalNodes": 总节点数,
    "estimatedDuration": "预计学习时长",
    "suggestedOrder": ["建议的学习顺序ID"]
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
    const systemInstruction = `你是一个游戏设计师，负责为学习RPG游戏生成敌人数据。
敌人是"数据幽灵"——由未掌握的知识点异化而成的防御程序。

敌人类型：
- Minion: 普通防御程式，对应单选/判断题，血量低
- Elite: 逻辑门卫，对应多选题，血量中等，有特殊能力
- Boss: 本章领主，对应综合案例分析，血量高，有强力技能`;

    const prompt = `请为主题"${topic}"生成敌人数据，难度等级${difficulty}：

返回JSON格式：
[
  {
    "id": "enemy-xxx",
    "name": "敌人名称（富有创意的赛博朋克风格）",
    "type": "Minion|Elite|Boss",
    "hp": 血量,
    "maxHp": 最大血量,
    "damage": 攻击力,
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
    const systemInstruction = `你是一个游戏关卡设计师，负责生成完整的游戏章节数据。
这是为《赛博学神：神经潜渊》生成的一个完整可玩章节。`;

    const prompt = `请为以下章节生成完整的游戏数据：

章节标题：${title}
难度等级：${difficulty}

学习内容：
${content}

返回JSON格式：
{
  "chapter": {
    "id": "chapter-xxx",
    "title": "${title}",
    "description": "章节描述",
    "difficulty": ${difficulty},
    "estimatedTime": "预计时长"
  },
  "enemies": [
    {
      "id": "enemy-xxx",
      "name": "敌人名称",
      "type": "Minion|Elite|Boss",
      "hp": 数值,
      "maxHp": 数值,
      "damage": 数值,
      "specialAbility": null 或 { "name": "", "description": "", "triggerCondition": "" }
    }
  ],
  "questions": [
    {
      "id": "q-xxx",
      "text": "题目",
      "type": "Single|Multi|TrueFalse",
      "options": ["选项数组"],
      "correctOptionIndex": 正确答案索引,
      "difficulty": 1-5,
      "timeLimit": 秒数,
      "explanation": "解析",
      "tags": ["标签"]
    }
  ],
  "rewards": {
    "exp": 经验值,
    "items": ["可能获得的道具ID"]
  }
}

生成至少5个敌人和15道题目。
请只返回JSON，不要其他内容。`;

    const response = await this.callGemini(prompt, systemInstruction);
    return this.extractJson(response);
  }
}

module.exports = { GeminiService };
