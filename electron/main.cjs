const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { GeminiService } = require('./gemini-service.cjs');

// 设置用户数据目录为安装目录下的 data 文件夹
// 确保所有数据（包括缓存、会话等）都存在安装目录下，而不是 C 盘
const userDataPath = path.join(__dirname, '..', 'data');
app.setPath('userData', userDataPath);

// Initialize Gemini service
const gemini = new GeminiService();

let mainWindow;

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.cjs');
  console.log('Preload path:', preloadPath);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 850,
    title: '赛博学神：神经潜渊',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      webSecurity: false, // Disable for debugging
      devTools: true,
    },
    // Cyberpunk style window
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
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
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
// IPC Handlers for Gemini API
// ========================================

// Set API Key
ipcMain.handle('gemini:set-api-key', async (event, apiKey) => {
  try {
    gemini.setApiKey(apiKey);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Check if API is configured
ipcMain.handle('gemini:check-status', async () => {
  return { 
    configured: gemini.isConfigured(),
    model: gemini.getModel()
  };
});

// Set Model
ipcMain.handle('gemini:set-model', async (event, model) => {
  try {
    gemini.setModel(model);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Generate questions from text content
ipcMain.handle('gemini:generate-questions', async (event, { content, options }) => {
  try {
    const questions = await gemini.generateQuestions(content, options);
    return { success: true, data: questions };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Generate knowledge tree structure from content
ipcMain.handle('gemini:generate-knowledge-tree', async (event, { content }) => {
  try {
    const tree = await gemini.generateKnowledgeTree(content);
    return { success: true, data: tree };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Generate enemy data based on topic
ipcMain.handle('gemini:generate-enemies', async (event, { topic, difficulty }) => {
  try {
    const enemies = await gemini.generateEnemies(topic, difficulty);
    return { success: true, data: enemies };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Parse uploaded document (PDF/Text)
ipcMain.handle('gemini:parse-document', async (event, { filePath }) => {
  try {
    const content = await gemini.parseDocument(filePath);
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Generate complete chapter data
ipcMain.handle('gemini:generate-chapter', async (event, { title, content, difficulty }) => {
  try {
    const chapter = await gemini.generateChapter(title, content, difficulty);
    return { success: true, data: chapter };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Generate complete game theme
ipcMain.handle('gemini:generate-theme', async (event, { themeName, content }) => {
  try {
    const theme = await gemini.generateTheme(themeName, content);
    return { success: true, data: theme };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
