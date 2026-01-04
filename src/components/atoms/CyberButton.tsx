import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CyberButtonProps {
  variant?: 'primary' | 'danger' | 'secondary';
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary: {
    base: 'border-neon-green text-neon-green hover:bg-neon-green/20',
    glow: 'hover:shadow-[0_0_20px_rgba(57,255,20,0.5)]',
    activeGlow: 'shadow-[0_0_30px_rgba(57,255,20,0.8)]',
  },
  danger: {
    base: 'border-warning-red text-warning-red hover:bg-warning-red/20',
    glow: 'hover:shadow-[0_0_20px_rgba(255,51,51,0.5)]',
    activeGlow: 'shadow-[0_0_30px_rgba(255,51,51,0.8)]',
  },
  secondary: {
    base: 'border-data-blue text-data-blue hover:bg-data-blue/20',
    glow: 'hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]',
    activeGlow: 'shadow-[0_0_30px_rgba(0,240,255,0.8)]',
  },
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-4 text-base',
};

export function CyberButton({
  variant = 'primary',
  onClick,
  children,
  disabled = false,
  className,
  size = 'md',
}: CyberButtonProps) {
  const styles = variantStyles[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base styles
        'relative font-mono font-bold uppercase tracking-wider',
        'border-2 bg-transparent backdrop-blur-sm',
        'transition-all duration-300',
        'overflow-hidden',
        // Clip path for angled corners
        'clip-path-[polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]',
        // Variant styles
        styles.base,
        styles.glow,
        // Size styles
        sizeStyles[size],
        // Disabled styles
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:shadow-none',
        className
      )}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Glitch effect overlay */}
      <motion.span
        className="absolute inset-0 bg-current opacity-0"
        animate={{
          opacity: [0, 0.1, 0, 0.05, 0],
          x: [0, -2, 2, -1, 0],
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      />
      
      {/* Corner decorations */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current opacity-60" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current opacity-60" />
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
      
      {/* Scanline effect */}
      <motion.span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
        }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.button>
  );
}
