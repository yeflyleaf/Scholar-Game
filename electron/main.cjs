/**
 * Scholar Game - Electron 主进程
 * @author yeflyleaf
 * @link https://github.com/yeflyleaf
 * @description 应用程序的主入口点
 */
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { AIService } = require("./ai-service.cjs");

// 设置用户数据目录为安装目录下的 data 文件夹
// 设置用户数据目录
// 在开发环境中，使用项目根目录下的 data 文件夹
// 在生产环境中，使用可执行文件同级目录下的 data 文件夹
const userDataPath = app.isPackaged
  ? path.join(path.dirname(process.execPath), "data")
  : path.join(__dirname, "..", "data");
app.setPath("userData", userDataPath);

// 初始化 AI 服务 (替代 GeminiService)
const aiService = new AIService();

let mainWindow;

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.cjs");
  console.log("Preload path:", preloadPath);
  console.log("Starting Scholar Game by yeflyleaf...");

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 850,
    title: "智者计划: 学习飞升",
    icon: path.join(__dirname, "../src/assets/icon.ico"),
    backgroundColor: "#0a0a0a",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      webSecurity: false,
      devTools: true,
    },
    frame: false,
    autoHideMenuBar: true,
  });

  // 在开发环境中，从 Vite 开发服务器加载
  if (
    process.env.NODE_ENV === "development" ||
    process.argv.includes("--dev")
  ) {
    const url = "http://localhost:5173";
    console.log(`Loading URL: ${url}`);
    mainWindow.loadURL(url).catch((e) => {
      console.error("Failed to load URL:", e);
    });
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow
      .loadFile(path.join(__dirname, "../dist/index.html"))
      .catch((e) => {
        console.error("Failed to load file:", e);
      });
  }

  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.error("Failed to load:", errorCode, errorDescription);
    }
  );

  mainWindow.webContents.on("dom-ready", () => {
    console.log("DOM Ready");
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// 应用生命周期
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ========================================
// AI 服务的 IPC 处理程序
// ========================================

// 获取可用提供商
ipcMain.handle("ai:get-providers", async () => {
  return aiService.getProviders();
});

// 获取按区域分组的提供商
ipcMain.handle("ai:get-providers-grouped", async () => {
  return aiService.getProvidersGrouped();
});

// 设置提供商
ipcMain.handle("ai:set-provider", async (event, providerId) => {
  try {
    aiService.setProvider(providerId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 设置 API 密钥
ipcMain.handle("ai:set-api-key", async (event, apiKey) => {
  try {
    aiService.setApiKey(apiKey);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 设置模型
ipcMain.handle("ai:set-model", async (event, model) => {
  try {
    aiService.setModel(model);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 检查状态
ipcMain.handle("ai:check-status", async () => {
  return aiService.getStatus();
});

// 检查配额状态
ipcMain.handle("ai:check-quota-status", async () => {
  return {
    quotaExhausted: aiService.isQuotaExhausted(),
    quotaExhaustedTime: aiService.quotaExhaustedTime
  };
});

// 重置配额标志
ipcMain.handle("ai:reset-quota", async () => {
  aiService.resetQuotaFlag();
  return { success: true };
});

// 测试 API 连接
ipcMain.handle("ai:test-connection", async () => {
  try {
    const result = await aiService.testConnection();
    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// 生成题目
ipcMain.handle("ai:generate-questions", async (event, { content, options }) => {
  try {
    const questions = await aiService.generateQuestions(content, options);
    return { success: true, data: questions };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 生成知识树
ipcMain.handle("ai:generate-knowledge-tree", async (event, { content }) => {
  try {
    const tree = await aiService.generateKnowledgeTree(content);
    return { success: true, data: tree };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 生成敌人
ipcMain.handle("ai:generate-enemies", async (event, { topic, difficulty }) => {
  try {
    const enemies = await aiService.generateEnemies(topic, difficulty);
    return { success: true, data: enemies };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 解析文档
ipcMain.handle("ai:parse-document", async (event, { filePath }) => {
  try {
    const content = await aiService.parseDocument(filePath);
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 生成章节
ipcMain.handle(
  "ai:generate-chapter",
  async (event, { title, content, difficulty }) => {
    try {
      const chapter = await aiService.generateChapter(
        title,
        content,
        difficulty
      );
      return { success: true, data: chapter };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
);

// 生成主题
ipcMain.handle("ai:generate-theme", async (event, { themeName, content }) => {
  try {
    const theme = await aiService.generateTheme(themeName, content);
    return { success: true, data: theme };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 生成任务简报
ipcMain.handle(
  "ai:generate-mission-briefing",
  async (event, { sectorName, sectorDescription }) => {
    try {
      const briefing = await aiService.generateMissionBriefing(
        sectorName,
        sectorDescription
      );
      return { success: true, data: briefing };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
);

// 生成所有任务简报
ipcMain.handle(
  "ai:generate-all-mission-briefings",
  async (event, { sectors }) => {
    try {
      const briefings = await aiService.generateAllMissionBriefings(sectors);
      return { success: true, data: briefings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
);

// ========================================
// 旧版 Gemini IPC 处理程序 (用于向后兼容)
// ========================================

ipcMain.handle("gemini:set-api-key", async (event, apiKey) => {
  try {
    // For backward compatibility, set provider to gemini if not set
    if (!aiService.providerId || aiService.providerId === "gemini") {
      aiService.setProvider("gemini");
    }
    aiService.setApiKey(apiKey);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("gemini:check-status", async () => {
  const status = aiService.getStatus();
  return {
    configured: status.configured,
    model: status.model,
  };
});

ipcMain.handle("gemini:set-model", async (event, model) => {
  try {
    aiService.setModel(model);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(
  "gemini:generate-questions",
  async (event, { content, options }) => {
    try {
      const questions = await aiService.generateQuestions(content, options);
      return { success: true, data: questions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
);

ipcMain.handle("gemini:generate-knowledge-tree", async (event, { content }) => {
  try {
    const tree = await aiService.generateKnowledgeTree(content);
    return { success: true, data: tree };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(
  "gemini:generate-enemies",
  async (event, { topic, difficulty }) => {
    try {
      const enemies = await aiService.generateEnemies(topic, difficulty);
      return { success: true, data: enemies };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
);

ipcMain.handle("gemini:parse-document", async (event, { filePath }) => {
  try {
    const content = await aiService.parseDocument(filePath);
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(
  "gemini:generate-chapter",
  async (event, { title, content, difficulty }) => {
    try {
      const chapter = await aiService.generateChapter(
        title,
        content,
        difficulty
      );
      return { success: true, data: chapter };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
);

ipcMain.handle(
  "gemini:generate-theme",
  async (event, { themeName, content }) => {
    try {
      const theme = await aiService.generateTheme(themeName, content);
      return { success: true, data: theme };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
);

ipcMain.handle(
  "gemini:generate-mission-briefing",
  async (event, { sectorName, sectorDescription }) => {
    try {
      const briefing = await aiService.generateMissionBriefing(
        sectorName,
        sectorDescription
      );
      return { success: true, data: briefing };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
);

ipcMain.handle(
  "gemini:generate-all-mission-briefings",
  async (event, { sectors }) => {
    try {
      const briefings = await aiService.generateAllMissionBriefings(sectors);
      return { success: true, data: briefings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
);

// 窗口控制
ipcMain.handle("window:minimize", () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle("window:maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle("window:is-maximized", () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// 退出应用
ipcMain.handle("app:quit", () => {
  app.quit();
});
