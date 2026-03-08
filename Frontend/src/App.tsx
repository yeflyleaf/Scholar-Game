/**
 * Scholar Game - Application Root Component
 * @author yeflyleaf
 * @link https://github.com/yeflyleaf
 */
// 应用程序入口 (App) - 处理屏幕路由切换
import { AnimatePresence, motion } from 'framer-motion';
import {
    BattleField,
    CausalityRecord,
    GrandUnificationSim,
    MindHack,
    SettingsScreen,
    TitleScreen
} from './components';
import { useGameStore } from './stores';

function App() {
  const { currentScreen } = useGameStore();

  return (
    <>
      {/* 可拖动的标题栏区域 */}
      <div className="title-bar-drag-region" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          className="w-full h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentScreen === 'TITLE' && <TitleScreen />}
          {currentScreen === 'GRAND_UNIFICATION_SIM' && <GrandUnificationSim />}
          {currentScreen === 'MIND_HACK' && <MindHack />}
          {currentScreen === 'BATTLE' && <BattleField />}
          {currentScreen === 'CAUSALITY_RECORD' && <CausalityRecord />}
          {currentScreen === 'SETTINGS' && <SettingsScreen />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default App;

