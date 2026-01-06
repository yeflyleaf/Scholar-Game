const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // ========================================
  // AI Service API (new unified API)
  // ========================================
  ai: {
    // Provider management
    getProviders: () => ipcRenderer.invoke('ai:get-providers'),
    getProvidersGrouped: () => ipcRenderer.invoke('ai:get-providers-grouped'),
    setProvider: (providerId) => ipcRenderer.invoke('ai:set-provider', providerId),
    setApiKey: (apiKey) => ipcRenderer.invoke('ai:set-api-key', apiKey),
    setModel: (model) => ipcRenderer.invoke('ai:set-model', model),
    setAccountId: (accountId) => ipcRenderer.invoke('ai:set-account-id', accountId),
    checkStatus: () => ipcRenderer.invoke('ai:check-status'),
    
    // Content generation
    generateQuestions: (content, options) => 
      ipcRenderer.invoke('ai:generate-questions', { content, options }),
    generateKnowledgeTree: (content) => 
      ipcRenderer.invoke('ai:generate-knowledge-tree', { content }),
    generateEnemies: (topic, difficulty) => 
      ipcRenderer.invoke('ai:generate-enemies', { topic, difficulty }),
    parseDocument: (filePath) => 
      ipcRenderer.invoke('ai:parse-document', { filePath }),
    generateChapter: (title, content, difficulty) => 
      ipcRenderer.invoke('ai:generate-chapter', { title, content, difficulty }),
    generateTheme: (themeName, content) => 
      ipcRenderer.invoke('ai:generate-theme', { themeName, content }),
    generateMissionBriefing: (sectorName, sectorDescription) => 
      ipcRenderer.invoke('ai:generate-mission-briefing', { sectorName, sectorDescription }),
    generateAllMissionBriefings: (sectors) => 
      ipcRenderer.invoke('ai:generate-all-mission-briefings', { sectors }),
  },
  
  // ========================================
  // Gemini API (legacy, for backward compatibility)
  // ========================================
  gemini: {
    setApiKey: (apiKey) => ipcRenderer.invoke('gemini:set-api-key', apiKey),
    checkStatus: () => ipcRenderer.invoke('gemini:check-status'),
    setModel: (model) => ipcRenderer.invoke('gemini:set-model', model),
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
    generateTheme: (themeName, content) => 
      ipcRenderer.invoke('gemini:generate-theme', { themeName, content }),
    generateMissionBriefing: (sectorName, sectorDescription) => 
      ipcRenderer.invoke('gemini:generate-mission-briefing', { sectorName, sectorDescription }),
    generateAllMissionBriefings: (sectors) => 
      ipcRenderer.invoke('gemini:generate-all-mission-briefings', { sectors }),
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
