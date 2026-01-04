import { AnimatePresence, motion } from 'framer-motion';
import { BattleField, KnowledgeGrid, SettingsScreen, TitleScreen } from './components';
import { useGameStore } from './stores';

function App() {
  const { currentScreen } = useGameStore();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentScreen}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {currentScreen === 'TITLE' && <TitleScreen />}
        {currentScreen === 'SETTINGS' && <SettingsScreen />}
        {currentScreen === 'KNOWLEDGE_GRID' && <KnowledgeGrid />}
        {currentScreen === 'BATTLE' && <BattleField />}
        {currentScreen === 'REWARD' && <RewardScreen />}
        {currentScreen === 'GAME_OVER' && <GameOverScreen />}
      </motion.div>
    </AnimatePresence>
  );
}

// Reward Screen - 奖励页面
function RewardScreen() {
  const { setScreen, currentNode, progress } = useGameStore();

  return (
    <div className="min-h-screen bg-deep-void flex items-center justify-center">
      <motion.div
        className="text-center p-8 max-w-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-neon-green/20 flex items-center justify-center"
          animate={{
            boxShadow: [
              '0 0 30px rgba(57,255,20,0.3)',
              '0 0 60px rgba(57,255,20,0.5)',
              '0 0 30px rgba(57,255,20,0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-4xl">🏆</span>
        </motion.div>

        <h1 className="text-3xl font-mono font-bold text-neon-green mb-4">
          节点已攻破！
        </h1>

        {currentNode && (
          <p className="text-gray-400 font-mono mb-6">
            成功入侵: {currentNode.name}
          </p>
        )}

        <div className="bg-deep-void/50 border border-neon-green/30 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-mono text-neon-green mb-3">数据下载完成</h3>
          <div className="space-y-2 text-sm font-mono text-gray-400">
            <div className="flex justify-between">
              <span>知识碎片</span>
              <span className="text-data-blue">+{currentNode?.questionCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>经验值</span>
              <span className="text-cyber-pink">+{(currentNode?.difficulty || 1) * 100}</span>
            </div>
            <div className="flex justify-between">
              <span>已完成节点</span>
              <span className="text-neon-green">{progress.completedNodes.length}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setScreen('KNOWLEDGE_GRID')}
            className="px-6 py-3 border-2 border-neon-green text-neon-green font-mono font-bold rounded hover:bg-neon-green/20 transition-colors"
          >
            返回知识网络
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Game Over Screen - 游戏结束页面
function GameOverScreen() {
  const { setScreen, resetGame, progress } = useGameStore();

  return (
    <div className="min-h-screen bg-deep-void flex items-center justify-center">
      <motion.div
        className="text-center p-8 max-w-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-warning-red/20 flex items-center justify-center"
          animate={{
            opacity: [1, 0.5, 1],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <span className="text-4xl">💀</span>
        </motion.div>

        <h1 className="text-3xl font-mono font-bold text-warning-red mb-4">
          连接中断
        </h1>

        <p className="text-gray-400 font-mono mb-6">
          神经链路崩溃，数据传输失败
        </p>

        <div className="bg-deep-void/50 border border-warning-red/30 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-mono text-warning-red mb-3">本次潜渊报告</h3>
          <div className="space-y-2 text-sm font-mono text-gray-400">
            <div className="flex justify-between">
              <span>正确答题</span>
              <span className="text-neon-green">{progress.correctAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span>总题目</span>
              <span className="text-data-blue">{progress.totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span>错题记录</span>
              <span className="text-warning-red">{progress.wrongAnswers.length}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => resetGame()}
            className="px-6 py-3 border-2 border-warning-red text-warning-red font-mono font-bold rounded hover:bg-warning-red/20 transition-colors"
          >
            重新开始
          </button>
          <button
            onClick={() => setScreen('TITLE')}
            className="px-6 py-3 border-2 border-gray-600 text-gray-400 font-mono font-bold rounded hover:bg-gray-800 transition-colors"
          >
            返回主菜单
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
