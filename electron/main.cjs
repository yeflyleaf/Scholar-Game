/**
 * Scholar Game - Electron Main Process
 * Author: yeflyleaf
 * Description: Main entry point for the application
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { AIService } = require('./ai-service.cjs');

// 设置用户数据目录为安装目录下的 data 文件夹
const userDataPath = path.join(__dirname, '..', 'data');
app.setPath('userData', userDataPath);

// Initialize AI service (replaces GeminiService)
const aiService = new AIService();

let mainWindow;

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.cjs');
  console.log('Preload path:', preloadPath);
  console.log('Starting Scholar Game by yeflyleaf...');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 850,
    title: '智者计划: 学习飞升',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      webSecurity: false,
      devTools: true,
    },
    frame: true,
    autoHideMenuBar: true,
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    const url = 'http://localhost:5173';
    console.log(`Loading URL: ${url}`);
    mainWindow.loadURL(url).catch(e => {
      console.error('Failed to load URL:', e);
    });
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch(e => {
      console.error('Failed to load file:', e);
    });
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM Ready');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ========================================
// IPC Handlers for AI Service
// ========================================

// Get available providers
ipcMain.handle('ai:get-providers', async () => {
  return aiService.getProviders();
});

// Get providers grouped by region
ipcMain.handle('ai:get-providers-grouped', async () => {
  return aiService.getProvidersGrouped();
});

// Set provider
ipcMain.handle('ai:set-provider', async (event, providerId) => {
  try {
    aiService.setProvider(providerId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Set API Key
ipcMain.handle('ai:set-api-key', async (event, apiKey) => {
  try {
    aiService.setApiKey(apiKey);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Set Model
ipcMain.handle('ai:set-model', async (event, model) => {
  try {
    aiService.setModel(model);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Set Account ID (for Cloudflare)
ipcMain.handle('ai:set-account-id', async (event, accountId) => {
  try {
    aiService.setAccountId(accountId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Check status
ipcMain.handle('ai:check-status', async () => {
  return aiService.getStatus();
});

// Generate questions
ipcMain.handle('ai:generate-questions', async (event, { content, options }) => {
  try {
    const questions = await aiService.generateQuestions(content, options);
    return { success: true, data: questions };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Generate knowledge tree
ipcMain.handle('ai:generate-knowledge-tree', async (event, { content }) => {
  try {
    const tree = await aiService.generateKnowledgeTree(content);
    return { success: true, data: tree };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Generate enemies
ipcMain.handle('ai:generate-enemies', async (event, { topic, difficulty }) => {
  try {
    const enemies = await aiService.generateEnemies(topic, difficulty);
    return { success: true, data: enemies };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Parse document
ipcMain.handle('ai:parse-document', async (event, { filePath }) => {
  try {
    const content = await aiService.parseDocument(filePath);
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Generate chapter
ipcMain.handle('ai:generate-chapter', async (event, { title, content, difficulty }) => {
  try {
    const chapter = await aiService.generateChapter(title, content, difficulty);
    return { success: true, data: chapter };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Generate theme
ipcMain.handle('ai:generate-theme', async (event, { themeName, content }) => {
  try {
    const theme = await aiService.generateTheme(themeName, content);
    return { success: true, data: theme };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Generate mission briefing
ipcMain.handle('ai:generate-mission-briefing', async (event, { sectorName, sectorDescription }) => {
  try {
    const briefing = await aiService.generateMissionBriefing(sectorName, sectorDescription);
    return { success: true, data: briefing };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Generate all mission briefings
ipcMain.handle('ai:generate-all-mission-briefings', async (event, { sectors }) => {
  try {
    const briefings = await aiService.generateAllMissionBriefings(sectors);
    return { success: true, data: briefings };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ========================================
// Legacy Gemini IPC Handlers (for backward compatibility)
// ========================================

ipcMain.handle('gemini:set-api-key', async (event, apiKey) => {
  try {
    // For backward compatibility, set provider to gemini if not set
    if (!aiService.providerId || aiService.providerId === 'gemini') {
      aiService.setProvider('gemini');
    }
    aiService.setApiKey(apiKey);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('gemini:check-status', async () => {
  const status = aiService.getStatus();
  return { 
    configured: status.configured,
    model: status.model 
  };
});

ipcMain.handle('gemini:set-model', async (event, model) => {
  try {
    aiService.setModel(model);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('gemini:generate-questions', async (event, { content, options }) => {
  try {
    const questions = await aiService.generateQuestions(content, options);
    return { success: true, data: questions };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('gemini:generate-knowledge-tree', async (event, { content }) => {
  try {
    const tree = await aiService.generateKnowledgeTree(content);
    return { success: true, data: tree };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('gemini:generate-enemies', async (event, { topic, difficulty }) => {
  try {
    const enemies = await aiService.generateEnemies(topic, difficulty);
    return { success: true, data: enemies };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('gemini:parse-document', async (event, { filePath }) => {
  try {
    const content = await aiService.parseDocument(filePath);
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('gemini:generate-chapter', async (event, { title, content, difficulty }) => {
  try {
    const chapter = await aiService.generateChapter(title, content, difficulty);
    return { success: true, data: chapter };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('gemini:generate-theme', async (event, { themeName, content }) => {
  try {
    const theme = await aiService.generateTheme(themeName, content);
    return { success: true, data: theme };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('gemini:generate-mission-briefing', async (event, { sectorName, sectorDescription }) => {
  try {
    const briefing = await aiService.generateMissionBriefing(sectorName, sectorDescription);
    return { success: true, data: briefing };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('gemini:generate-all-mission-briefings', async (event, { sectors }) => {
  try {
    const briefings = await aiService.generateAllMissionBriefings(sectors);
    return { success: true, data: briefings };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
