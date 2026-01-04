import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    Brain,
    CheckCircle,
    FileText,
    Key,
    Loader2,
    Settings,
    Sparkles,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { useGameStore } from '../../stores';
import { isElectron } from '../../types/electron';
import { CyberButton, GlitchText } from '../atoms';

export function SettingsScreen() {
  const { setScreen } = useGameStore();
  const { 
    isConfigured, 
    isLoading, 
    error, 
    setApiKey, 
    checkStatus, 
    generateChapter,
    clearError 
  } = useGemini();

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [generatedData, setGeneratedData] = useState<any>(null);

  const isElectronEnv = isElectron();

  useEffect(() => {
    if (isElectronEnv) {
      checkStatus();
    }
  }, [isElectronEnv, checkStatus]);

  const handleSaveApiKey = async () => {
    if (apiKeyInput.trim()) {
      const success = await setApiKey(apiKeyInput.trim());
      if (success) {
        setApiKeyInput('');
      }
    }
  };

  const handleGenerateChapter = async () => {
    if (!textContent.trim() || !chapterTitle.trim()) {
      return;
    }

    setGenerationStatus('loading');
    clearError();

    try {
      const data = await generateChapter(chapterTitle, textContent, difficulty);
      if (data) {
        setGeneratedData(data);
        setGenerationStatus('success');
      } else {
        setGenerationStatus('error');
      }
    } catch (e) {
      setGenerationStatus('error');
    }
  };

  const handleUseGeneratedData = () => {
    if (generatedData) {
      // TODO: Import generated data into game store
      console.log('Using generated data:', generatedData);
      setScreen('KNOWLEDGE_GRID');
    }
  };

  return (
    <div className="min-h-screen bg-deep-void overflow-y-auto">
      {/* Background */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(57,255,20,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57,255,20,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <motion.header
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CyberButton variant="secondary" size="sm" onClick={() => setScreen('TITLE')}>
            <ArrowLeft size={16} />
          </CyberButton>
          <div className="flex items-center gap-3">
            <Settings className="text-neon-green" size={28} />
            <div>
              <GlitchText intensity="low" className="text-2xl font-mono font-bold text-neon-green">
                系统配置
              </GlitchText>
              <p className="text-xs text-gray-500 font-mono">SYSTEM CONFIGURATION</p>
            </div>
          </div>
        </motion.header>

        {/* Environment Check */}
        {!isElectronEnv && (
          <motion.div
            className="mb-8 p-4 rounded-lg border border-warning-red/50 bg-warning-red/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-warning-red flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-warning-red font-mono font-bold">非 Electron 环境</p>
                <p className="text-sm text-gray-400 mt-1">
                  Gemini API 功能需要在 Electron 桌面应用中运行。当前为浏览器环境，AI生成功能不可用。
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  运行命令: <code className="bg-gray-800 px-2 py-0.5 rounded">npm run electron:dev</code>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-8">
          {/* API Key Configuration */}
          <motion.section
            className="p-6 rounded-lg border border-neon-green/30 bg-deep-void/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Key className="text-data-blue" size={20} />
              <h2 className="text-lg font-mono font-bold text-data-blue">Gemini API 配置</h2>
              {isConfigured && (
                <span className="ml-auto flex items-center gap-1 text-xs font-mono text-neon-green">
                  <CheckCircle size={14} />
                  已配置
                </span>
              )}
            </div>

            <p className="text-sm text-gray-400 mb-4">
              配置 Google Gemini API Key 以启用 AI 生成功能。获取免费 API Key：
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-data-blue hover:underline ml-1"
              >
                Google AI Studio
              </a>
            </p>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="输入 Gemini API Key..."
                  disabled={!isElectronEnv}
                  className="w-full px-4 py-3 bg-deep-void border-2 border-data-blue/30 rounded font-mono text-sm text-white placeholder-gray-600 focus:border-data-blue focus:outline-none transition-colors disabled:opacity-50"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-data-blue"
                >
                  {showApiKey ? '隐藏' : '显示'}
                </button>
              </div>
              <CyberButton
                variant="primary"
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput.trim() || isLoading || !isElectronEnv}
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : '保存'}
              </CyberButton>
            </div>

            {error && (
              <p className="mt-3 text-sm text-warning-red flex items-center gap-2">
                <XCircle size={14} />
                {error}
              </p>
            )}
          </motion.section>

          {/* Content Import & Generation */}
          <motion.section
            className="p-6 rounded-lg border border-cyber-pink/30 bg-deep-void/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Brain className="text-cyber-pink" size={20} />
              <h2 className="text-lg font-mono font-bold text-cyber-pink">AI 数据生成</h2>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              输入学习内容，AI 将自动生成题目、敌人和知识网络结构。
            </p>

            {/* Chapter Title */}
            <div className="mb-4">
              <label className="block text-xs font-mono text-gray-500 mb-2">章节标题</label>
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="例如：JavaScript 基础语法"
                disabled={!isElectronEnv || !isConfigured}
                className="w-full px-4 py-2 bg-deep-void border-2 border-cyber-pink/30 rounded font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-pink focus:outline-none transition-colors disabled:opacity-50"
              />
            </div>

            {/* Difficulty */}
            <div className="mb-4">
              <label className="block text-xs font-mono text-gray-500 mb-2">难度等级</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    disabled={!isElectronEnv || !isConfigured}
                    className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                      difficulty === level
                        ? 'bg-cyber-pink text-deep-void'
                        : 'border-2 border-cyber-pink/30 text-cyber-pink hover:bg-cyber-pink/20'
                    } disabled:opacity-50`}
                  >
                    Lv.{level}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Input */}
            <div className="mb-4">
              <label className="block text-xs font-mono text-gray-500 mb-2">学习内容</label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="粘贴或输入学习资料内容...&#10;&#10;例如：&#10;JavaScript 是一种动态类型的编程语言...&#10;变量声明可以使用 var、let 或 const..."
                rows={10}
                disabled={!isElectronEnv || !isConfigured}
                className="w-full px-4 py-3 bg-deep-void border-2 border-cyber-pink/30 rounded font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-pink focus:outline-none transition-colors resize-y disabled:opacity-50"
              />
            </div>

            <div className="flex gap-3">
              <CyberButton
                variant="secondary"
                onClick={handleGenerateChapter}
                disabled={!isElectronEnv || !isConfigured || !textContent.trim() || !chapterTitle.trim() || generationStatus === 'loading'}
                className="flex-1"
              >
                {generationStatus === 'loading' ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    AI 生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" size={18} />
                    生成游戏数据
                  </>
                )}
              </CyberButton>
            </div>

            {/* Generation Result */}
            <AnimatePresence>
              {generationStatus === 'success' && generatedData && (
                <motion.div
                  className="mt-4 p-4 rounded border border-neon-green/50 bg-neon-green/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="text-neon-green" size={18} />
                    <span className="font-mono font-bold text-neon-green">生成成功！</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm font-mono">
                    <div className="text-center p-2 bg-deep-void/50 rounded">
                      <div className="text-2xl text-data-blue">{generatedData.questions?.length || 0}</div>
                      <div className="text-gray-500 text-xs">题目</div>
                    </div>
                    <div className="text-center p-2 bg-deep-void/50 rounded">
                      <div className="text-2xl text-warning-red">{generatedData.enemies?.length || 0}</div>
                      <div className="text-gray-500 text-xs">敌人</div>
                    </div>
                    <div className="text-center p-2 bg-deep-void/50 rounded">
                      <div className="text-2xl text-cyber-pink">{generatedData.rewards?.exp || 0}</div>
                      <div className="text-gray-500 text-xs">经验值</div>
                    </div>
                  </div>

                  <CyberButton variant="primary" onClick={handleUseGeneratedData} className="w-full">
                    使用此数据开始游戏
                  </CyberButton>
                </motion.div>
              )}

              {generationStatus === 'error' && (
                <motion.div
                  className="mt-4 p-4 rounded border border-warning-red/50 bg-warning-red/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="text-warning-red" size={18} />
                    <span className="font-mono text-warning-red">生成失败</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* JSON Preview (if generated) */}
          {generatedData && (
            <motion.section
              className="p-6 rounded-lg border border-gray-700 bg-deep-void/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-gray-500" size={20} />
                <h2 className="text-lg font-mono font-bold text-gray-500">JSON 数据预览</h2>
              </div>

              <pre className="p-4 bg-gray-900 rounded border border-gray-800 overflow-x-auto text-xs font-mono text-gray-400 max-h-96 overflow-y-auto">
                {JSON.stringify(generatedData, null, 2)}
              </pre>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
}
