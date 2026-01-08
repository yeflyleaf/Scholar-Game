/**
 * Scholar Game - Electron 预加载脚本
 * @author yeflyleaf
 * @link https://github.com/yeflyleaf
 */
const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露受保护的方法
contextBridge.exposeInMainWorld('electronAPI', {
  // ========================================
  // AI 服务 API (新的统一 API)
  // ========================================
  ai: {
    // 提供商管理
    getProviders: () => ipcRenderer.invoke('ai:get-providers'),
    getProvidersGrouped: () => ipcRenderer.invoke('ai:get-providers-grouped'),
    setProvider: (providerId) => ipcRenderer.invoke('ai:set-provider', providerId),
    setApiKey: (apiKey) => ipcRenderer.invoke('ai:set-api-key', apiKey),
    setModel: (model) => ipcRenderer.invoke('ai:set-model', model),
    checkStatus: () => ipcRenderer.invoke('ai:check-status'),
    checkQuotaStatus: () => ipcRenderer.invoke('ai:check-quota-status'),
    resetQuota: () => ipcRenderer.invoke('ai:reset-quota'),
    testConnection: () => ipcRenderer.invoke('ai:test-connection'),
    
    // 内容生成
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
  // Gemini API (旧版，用于向后兼容)
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
  
  // 文件系统方法
  fs: {
    readFile: (filePath) => ipcRenderer.invoke('fs:read-file', filePath),
    selectFile: (options) => ipcRenderer.invoke('fs:select-file', options),
  },
  
  // 应用信息
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    getPlatform: () => process.platform,
    quit: () => ipcRenderer.invoke('app:quit'),
  },
  
  // 窗口控制
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  },
});
