import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { DamageIndicator as DamageIndicatorType } from '../../types';

interface DamageIndicatorProps {
  indicator: DamageIndicatorType;
}

export function DamageIndicator({ indicator }: DamageIndicatorProps) {
  const colors: Record<string, { text: string; glow: string }> = {
    damage: {
      text: '#ff3333',
      glow: 'rgba(255, 51, 51, 0.5)',
    },
    heal: {
      text: '#00ff88',
      glow: 'rgba(0, 255, 136, 0.5)',
    },
    overload: {
      text: '#9933ff',
      glow: 'rgba(153, 51, 255, 0.5)',
    },
    critical: {
      text: '#ffd700',
      glow: 'rgba(255, 215, 0, 0.5)',
    },
    shield: {
      text: '#4488ff',
      glow: 'rgba(68, 136, 255, 0.5)',
    },
    miss: {
      text: '#888888',
      glow: 'rgba(136, 136, 136, 0.3)',
    },
  };

  const style = colors[indicator.type] || colors.damage;
  
  const getPrefix = () => {
    switch (indicator.type) {
      case 'heal':
        return '+';
      case 'overload':
        return '⚡';
      case 'critical':
        return '💥';
      case 'shield':
        return '🛡️';
      case 'miss':
        return '';
      default:
        return '-';
    }
  };

  const displayText = indicator.text || `${getPrefix()}${indicator.value}`;

  return (
    <motion.div
      className={cn(
        'absolute pointer-events-none z-50',
        'font-mono font-bold',
        indicator.type === 'critical' ? 'text-3xl' : 'text-2xl',
        'flex flex-col items-center justify-center'
      )}
      style={{
        left: `${indicator.x}%`,
        top: `${indicator.y}%`,
        color: indicator.color || style.text,
        textShadow: `0 0 10px ${style.glow}, 0 0 20px ${style.glow}`,
      }}
      initial={{
        opacity: 1,
        scale: 0.5,
        y: 0,
      }}
      animate={{
        opacity: [1, 1, 0],
        scale: indicator.type === 'critical' ? [0.5, 1.5, 1.2] : [0.5, 1.2, 1],
        y: -60,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        type: 'tween',
        duration: 1.2,
        ease: 'easeOut',
        times: [0, 0.3, 1],
      }}
    >
      {/* Main text/number */}
      <motion.span
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          type: 'tween',
          duration: 0.3,
          times: [0, 0.5, 1],
        }}
      >
        {displayText}
      </motion.span>

      {/* Sub text for special effects */}
      {indicator.text && indicator.value > 0 && (
        <motion.span
          className="text-sm mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {indicator.value}
        </motion.span>
      )}

      {/* Sparkle effect */}
      <motion.span
        className="absolute"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0, 1.5, 2],
        }}
        transition={{
          type: 'tween',
          duration: 0.5,
          delay: 0.1,
        }}
        style={{
          width: indicator.type === 'critical' ? 60 : 40,
          height: indicator.type === 'critical' ? 60 : 40,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${style.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Extra ring for critical hits */}
      {indicator.type === 'critical' && (
        <motion.span
          className="absolute"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 2, 3],
          }}
          transition={{
            type: 'tween',
            duration: 0.8,
          }}
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '2px solid #ffd700',
          }}
        />
      )}
    </motion.div>
  );
}
