import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    ChevronRight,
    MessageSquare,
    Package,
    RotateCcw,
    Skull,
    Swords,
    Trophy,
    Volume2,
    VolumeX,
    Zap
} from 'lucide-react';
import { useState } from 'react';
import { useBattleSequence } from '../../hooks';
import { cn } from '../../lib/utils';
import { useGameStore } from '../../stores';
import { CyberButton, GlitchText } from '../atoms';
import { CharacterStatus, EnemyCard, QuestionCard } from '../molecules';
import { BattleLog } from './BattleLog';
import { CRTFilter } from './CRTFilter';
import { DamageIndicator } from './DamageIndicator';
import { ItemBar } from './ItemBar';

export function BattleField() {
  const [isMuted, setIsMuted] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showItems, setShowItems] = useState(false);

  const {
    party,
    enemies,
    phase,
    currentTurn,
    currentQuestion,
    damageIndicators,
    isScreenShaking,
    showGlitchEffect,
    showGoldGlow,
    showCyberpsychosis,
    correctStreak,
    items,
    battleLog,
    resetBattle,
    setScreen,
    useItem,
    useSkill: triggerSkill,
    endBattle,
  } = useGameStore();

  const {
    handleAnswerSubmit,
    statusMessage,
    isProcessing,
    selectedAnswerIndex,
    isCorrect,
    timeRemaining,
    isTimerWarning,
  } = useBattleSequence();

  // Check for flow state
  const hasFlowState = party.some((c) => 
    c.statusEffects.some((e) => e.effect === 'flow_state')
  );

  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, -2, 2, 0],
      transition: { duration: 0.5 },
    },
    idle: { x: 0 },
  };

  const handleSkillUse = (characterId: string, skillId: string) => {
    const livingEnemies = enemies.filter((e) => e.hp > 0);
    if (livingEnemies.length > 0) {
      // For now, target first enemy
      triggerSkill(characterId, skillId, livingEnemies[0].id);
    }
  };

  return (
    <motion.div
      className={cn(
        'relative min-h-screen w-full overflow-hidden bg-deep-void',
        showGlitchEffect && 'animate-glitch'
      )}
      variants={shakeVariants}
      animate={isScreenShaking ? 'shake' : 'idle'}
    >
      {/* Glitch Effect Overlay */}
      {showGlitchEffect && (
        <motion.div
          className="absolute inset-0 z-40 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.1) 2px, rgba(255,0,0,0.1) 4px)',
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            clipPath: [
              'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
              'polygon(0 10%, 100% 0, 100% 90%, 0 100%)',
              'polygon(0 0, 100% 10%, 100% 100%, 0 90%)',
              'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            ],
          }}
          transition={{ duration: 0.1, repeat: 20 }}
        />
      )}

      {/* Animated Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            perspective: '500px',
            transform: 'rotateX(60deg) translateY(-50%)',
            transformOrigin: 'center top',
          }}
        />

        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-green/30 to-transparent"
          style={{ top: '30%' }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scaleX: [0.8, 1, 0.8],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-pink/30 to-transparent"
          style={{ top: '60%' }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scaleX: [0.9, 1, 0.9],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.1) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-4 min-h-screen flex flex-col">
        {/* Top Bar */}
        <motion.header
          className="flex justify-between items-center mb-4 py-3 px-4 rounded-lg border border-neon-green/30 bg-deep-void/80 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <CyberButton variant="secondary" size="sm" onClick={() => setScreen('KNOWLEDGE_GRID')}>
              <ArrowLeft size={16} />
            </CyberButton>
            <Swords className="text-neon-green" size={24} />
            <div>
              <GlitchText intensity="low" className="text-lg font-mono font-bold text-neon-green">
                赛博丛林战斗
              </GlitchText>
              <p className="text-xs text-gray-500 font-mono">CHRONO-JUNGLE HUNT</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Combo Counter */}
            {correctStreak > 0 && (
              <motion.div
                key={correctStreak}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-pink/20 border border-cyber-pink/50"
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Zap size={14} className="text-cyber-pink" />
                <span className="text-sm font-mono text-cyber-pink">连击 x{correctStreak}</span>
              </motion.div>
            )}

            {/* Turn Counter */}
            <div className="text-center">
              <span className="text-xs text-gray-500 uppercase tracking-widest">回合</span>
              <motion.div
                key={currentTurn}
                className="text-2xl font-mono font-bold text-data-blue"
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {currentTurn}
              </motion.div>
            </div>

            {/* Phase Indicator */}
            <div className="text-center">
              <span className="text-xs text-gray-500 uppercase tracking-widest">状态</span>
              <motion.div
                key={phase}
                className={cn(
                  'text-sm font-mono font-bold uppercase',
                  phase === 'PLAYER_TURN'
                    ? 'text-neon-green'
                    : phase === 'WIN'
                    ? 'text-data-blue'
                    : phase === 'LOSE'
                    ? 'text-warning-red'
                    : 'text-gray-400'
                )}
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                {phase === 'PLAYER_TURN'
                  ? '狩猎中'
                  : phase === 'WIN'
                  ? '胜利'
                  : phase === 'LOSE'
                  ? '失败'
                  : '处理中'}
              </motion.div>
            </div>

            {/* Toggle buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowItems(!showItems)}
                className={cn(
                  'p-2 rounded transition-colors',
                  showItems ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400 hover:text-neon-green'
                )}
              >
                <Package size={20} />
              </button>
              <button
                onClick={() => setShowLog(!showLog)}
                className={cn(
                  'p-2 rounded transition-colors',
                  showLog ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400 hover:text-neon-green'
                )}
              >
                <MessageSquare size={20} />
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-gray-400 hover:text-neon-green transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
          </div>
        </motion.header>

        {/* Battle Area */}
        <div className="flex-1 grid grid-cols-[1fr_2fr_1fr] gap-4">
          {/* Left Side - Party */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-sm font-mono uppercase tracking-widest text-neon-green mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              神经代理人
            </h2>
            <AnimatePresence>
              {party.map((character, index) => (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CharacterStatus
                    character={character}
                    isActive={phase === 'PLAYER_TURN' && character.hp > 0 && !character.isDisabled}
                    showGoldGlow={showGoldGlow === character.id}
                    showCyberpsychosis={showCyberpsychosis === character.id}
                    onSkillUse={(skillId) => handleSkillUse(character.id, skillId)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Center - Question Area */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Status Message */}
            <motion.div key={statusMessage} className="text-center mb-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <GlitchText
                intensity={phase === 'ENEMY_TURN' ? 'high' : 'low'}
                className={cn(
                  'text-lg font-mono',
                  phase === 'PLAYER_TURN'
                    ? 'text-neon-green'
                    : phase === 'ENEMY_TURN'
                    ? 'text-warning-red'
                    : 'text-data-blue'
                )}
              >
                {statusMessage}
              </GlitchText>
            </motion.div>

            {/* Game Over / Victory Screen */}
            {(phase === 'WIN' || phase === 'LOSE') ? (
              <motion.div
                className="flex-1 flex flex-col items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <motion.div
                  className="mb-8"
                  animate={phase === 'WIN' ? {
                    filter: ['drop-shadow(0 0 20px #ffd700)', 'drop-shadow(0 0 40px #ffd700)', 'drop-shadow(0 0 20px #ffd700)']
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {phase === 'WIN' ? (
                    <Trophy className="w-24 h-24 text-yellow-400" />
                  ) : (
                    <Skull className="w-24 h-24 text-warning-red" />
                  )}
                </motion.div>

                <GlitchText
                  intensity="high"
                  className={cn(
                    'text-4xl font-mono font-bold mb-4',
                    phase === 'WIN' ? 'text-neon-green' : 'text-warning-red'
                  )}
                >
                  {phase === 'WIN' ? '概念体已收割' : '装甲崩溃'}
                </GlitchText>

                <p className="text-gray-400 font-mono mb-8">
                  {phase === 'WIN' 
                    ? '成功收割野生概念体，认知燃料已提取' 
                    : '神经链路崩溃，认知燃料流失'}
                </p>

                <div className="flex gap-4">
                  <CyberButton
                    variant={phase === 'WIN' ? 'primary' : 'danger'}
                    size="lg"
                    onClick={() => phase === 'WIN' ? endBattle(true) : resetBattle()}
                  >
                    {phase === 'WIN' ? (
                      <>
                        继续探索
                        <ChevronRight className="ml-2" size={20} />
                      </>
                    ) : (
                      <>
                        <RotateCcw className="mr-2" size={20} />
                        重新开始
                      </>
                    )}
                  </CyberButton>
                  
                  <CyberButton
                    variant="secondary"
                    size="lg"
                    onClick={() => setScreen('KNOWLEDGE_GRID')}
                  >
                    返回地图
                  </CyberButton>
                </div>
              </motion.div>
            ) : currentQuestion && (
              <div className="flex-1 flex flex-col justify-center">
                <QuestionCard
                  question={currentQuestion}
                  onAnswer={handleAnswerSubmit}
                  disabled={phase !== 'PLAYER_TURN' || isProcessing}
                  selectedIndex={selectedAnswerIndex}
                  isCorrect={isCorrect}
                  timeRemaining={timeRemaining}
                  isTimerWarning={isTimerWarning}
                  hasFlowState={hasFlowState}
                />
              </div>
            )}
          </motion.div>

          {/* Right Side - Enemies */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-sm font-mono uppercase tracking-widest text-warning-red mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning-red animate-pulse" />
              野生概念体
            </h2>
            <AnimatePresence>
              {enemies.map((enemy, index) => (
                <motion.div
                  key={enemy.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EnemyCard
                    enemy={enemy}
                    isTarget={phase === 'PLAYER_TURN' && enemy.hp > 0 && index === 0}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom Bar - Items */}
        <AnimatePresence>
          {showItems && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4"
            >
              <ItemBar items={items} onUseItem={useItem} disabled={phase !== 'PLAYER_TURN'} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Battle Log Sidebar */}
      <AnimatePresence>
        {showLog && (
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-80 bg-deep-void/95 border-l border-neon-green/30 p-4 z-30"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
          >
            <BattleLog entries={battleLog} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Damage Indicators */}
      <AnimatePresence>
        {damageIndicators.map((indicator) => (
          <DamageIndicator key={indicator.id} indicator={indicator} />
        ))}
      </AnimatePresence>

      {/* CRT Filter Overlay */}
      <CRTFilter />
    </motion.div>
  );
}
