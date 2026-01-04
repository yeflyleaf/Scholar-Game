const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Gemini API methods
  gemini: {
    setApiKey: (apiKey) => ipcRenderer.invoke('gemini:set-api-key', apiKey),
    checkStatus: () => ipcRenderer.invoke('gemini:check-status'),
    generateQuestions: (content, options) => 
      ipcRenderer.invoke('gemini:generate-questions', { content, options }),
    generateKnowledgeTree: (content) => 
      ipcRenderer.invoke('gemini:generate-knowledge-tree', { content }),
    generateEnemies: (topic, difficulty) => 
      ipcRenderer.invoke('gemini:generate-enemies', { topic, difficulty }),
    parseDocument: (filePath) => 
      ipcRenderer.invoke('gemini:parse-document', { filePath }),
    generateChapter: (title, content, difficulty) => 
      ipcRenderer.invoke('gemini:generate-chapter', { title, content, difficulty }),
  },
  
  // File system methods
  fs: {
    readFile: (filePath) => ipcRenderer.invoke('fs:read-file', filePath),
    selectFile: (options) => ipcRenderer.invoke('fs:select-file', options),
  },
  
  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    getPlatform: () => process.platform,
  },
});
