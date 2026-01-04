import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface StatBarProps {
  value: number;
  max: number;
  label?: string;
  type: 'hp' | 'overload';
  showValue?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const typeStyles = {
  hp: {
    gradient: 'from-hp-green to-neon-green',
    bgGlow: 'shadow-[0_0_10px_rgba(0,255,136,0.3)]',
    lowGradient: 'from-warning-red to-orange-500',
    lowGlow: 'shadow-[0_0_10px_rgba(255,51,51,0.5)]',
    highGradient: 'from-hp-green to-neon-green', // Not used for HP
    highGlow: 'shadow-[0_0_10px_rgba(0,255,136,0.3)]', // Not used for HP
  },
  overload: {
    gradient: 'from-overload-purple to-cyber-pink',
    bgGlow: 'shadow-[0_0_10px_rgba(153,51,255,0.3)]',
    lowGradient: 'from-overload-purple to-cyber-pink', // Not used for overload
    lowGlow: 'shadow-[0_0_10px_rgba(153,51,255,0.3)]', // Not used for overload
    highGradient: 'from-overload-yellow to-warning-red',
    highGlow: 'shadow-[0_0_15px_rgba(255,255,0,0.5)]',
  },
};

const sizeStyles = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export function StatBar({
  value,
  max,
  label,
  type,
  showValue = true,
  className,
  size = 'md',
}: StatBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const styles = typeStyles[type];
  
  // Determine if bar should show warning state
  const isLowHp = type === 'hp' && percentage <= 30;
  const isHighOverload = type === 'overload' && percentage >= 70;
  
  const gradient = 
    isLowHp ? styles.lowGradient :
    isHighOverload ? styles.highGradient :
    styles.gradient;
    
  const glow = 
    isLowHp ? styles.lowGlow :
    isHighOverload ? styles.highGlow :
    styles.bgGlow;

  return (
    <div className={cn('w-full', className)}>
      {/* Label and Value */}
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
              {label}
            </span>
          )}
          {showValue && (
            <motion.span 
              key={value}
              className={cn(
                'text-xs font-mono font-bold',
                type === 'hp' ? 'text-hp-green' : 'text-overload-purple',
                isLowHp && 'text-warning-red',
                isHighOverload && 'text-overload-yellow'
              )}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              {value}/{max}
            </motion.span>
          )}
        </div>
      )}
      
      {/* Bar Container */}
      <div
        className={cn(
          'relative w-full bg-gray-900/80 overflow-hidden',
          sizeStyles[size],
          // Angled clip-path
          'clip-path-[polygon(0_0,calc(100%-4px)_0,100%_50%,calc(100%-4px)_100%,0_100%,4px_50%)]'
        )}
      >
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)',
          }}
        />
        
        {/* Animated fill */}
        <motion.div
          className={cn(
            'h-full bg-gradient-to-r',
            gradient,
            glow
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            type: 'spring', 
            stiffness: 100, 
            damping: 20,
            duration: 0.5 
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
        
        {/* Pulse effect for critical states */}
        {(isLowHp || isHighOverload) && (
          <motion.div
            className="absolute inset-0 bg-current opacity-20"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
}
