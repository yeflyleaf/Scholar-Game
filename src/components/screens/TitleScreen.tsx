import { motion } from 'framer-motion';
import { Brain, ChevronRight, Database, Settings, Shield, Terminal, Wifi, Zap } from 'lucide-react';
import { useState } from 'react';
import { NARRATIVE } from '../../lib/constants';
import { useGameStore } from '../../stores';
import { CyberButton, GlitchText } from '../atoms';

export function TitleScreen() {
  const { setScreen, startBattle } = useGameStore();

  const handleStartGame = () => {
    setScreen('KNOWLEDGE_GRID');
  };

  const handleQuickPlay = () => {
    startBattle();
  };

  const handleSettings = () => {
    setScreen('SETTINGS');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-deep-void flex flex-col items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Matrix rain effect */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <MatrixColumn key={i} index={i} />
          ))}
        </div>

        {/* Radial gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,0,255,0.08)_0%,transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,240,255,0.08)_0%,transparent_40%)]" />
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Logo/Title Area */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          {/* Glowing brain icon */}
          <motion.div
            className="relative w-32 h-32 mx-auto mb-6"
            animate={{
              filter: [
                'drop-shadow(0 0 20px rgba(57,255,20,0.5))',
                'drop-shadow(0 0 40px rgba(57,255,20,0.8))',
                'drop-shadow(0 0 20px rgba(57,255,20,0.5))',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className="w-full h-full text-neon-green" strokeWidth={1} />
            
            {/* Orbiting elements */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 text-cyber-pink" />
            </motion.div>
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            >
              <Shield className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 text-data-blue" />
            </motion.div>
          </motion.div>

          {/* Main Title */}
          <GlitchText
            intensity="medium"
            className="text-5xl md:text-7xl font-mono font-bold text-neon-green mb-2"
          >
            赛博学神
          </GlitchText>
          
          <motion.h2
            className="text-xl md:text-2xl font-mono text-cyber-pink tracking-[0.3em]"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            神经潜渊
          </motion.h2>
          
          <p className="text-xs md:text-sm font-mono text-gray-500 mt-2 tracking-widest">
            CYBER SCHOLAR: NEURAL DIVE
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.div
          className="mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm md:text-base font-mono text-gray-400 leading-relaxed">
            {NARRATIVE.worldBackground}
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <CyberButton
            variant="primary"
            size="lg"
            onClick={handleStartGame}
            className="min-w-[200px]"
          >
            <Terminal className="mr-2" size={20} />
            登舰出发
            <ChevronRight className="ml-2" size={20} />
          </CyberButton>

          <CyberButton
            variant="secondary"
            size="lg"
            onClick={handleQuickPlay}
            className="min-w-[200px]"
          >
            <Zap className="mr-2" size={20} />
            快速狩猎
          </CyberButton>

          <CyberButton
            variant="secondary"
            size="lg"
            onClick={handleSettings}
            className="min-w-[200px]"
          >
            <Settings className="mr-2" size={20} />
            系统配置
          </CyberButton>
        </motion.div>

        {/* Stats/Info Bar */}
        <motion.div
          className="mt-12 flex justify-center gap-8 text-xs font-mono text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex items-center gap-2">
            <Wifi size={14} className="text-neon-green" />
            <span>飞船状态: 待命</span>
          </div>
          <div className="flex items-center gap-2">
            <Database size={14} className="text-data-blue" />
            <span>目标: 思维号</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom decoration */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-neon-green/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-neon-green/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-neon-green/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-neon-green/30" />

      {/* Version info */}
      <div className="absolute bottom-4 right-8 text-xs font-mono text-gray-600">
        v1.0.0 // 收割者协议
      </div>
    </div>
  );
}

function MatrixColumn({ index }: { index: number }) {
  const [randomDuration] = useState(() => 10 + Math.random() * 10);
  const [randomDelay] = useState(() => Math.random() * 5);
  const [chars] = useState(() => 
    Array.from({ length: 20 }, () => String.fromCharCode(0x30a0 + Math.random() * 96))
  );
  
  return (
    <motion.div
      className="absolute text-neon-green font-mono text-xs"
      style={{
        left: `${index * 5}%`,
        top: -100,
      }}
      animate={{
        y: ['0vh', '110vh'],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: randomDelay,
        ease: 'linear',
      }}
    >
      {chars.map((char, j) => (
        <div key={j} className="my-1">
          {char}
        </div>
      ))}
    </motion.div>
  );
}
