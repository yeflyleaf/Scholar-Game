import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GlitchTextProps {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div';
  glitchColor?: string;
  style?: React.CSSProperties;
}

const intensityConfig = {
  low: {
    xRange: 1,
    yRange: 1,
    opacityRange: [1, 0.9, 1],
    interval: 5,
  },
  medium: {
    xRange: 2,
    yRange: 2,
    opacityRange: [1, 0.8, 0.9, 1],
    interval: 3,
  },
  high: {
    xRange: 4,
    yRange: 3,
    opacityRange: [1, 0.6, 0.8, 0.7, 1],
    interval: 1,
  },
};

export function GlitchText({
  children,
  className,
  intensity = 'medium',
  as: Component = 'span',
  glitchColor = '#ff00ff',
  style,
}: GlitchTextProps) {
  const config = intensityConfig[intensity];

  const [randomDelay1] = useState(() => Math.random() * 2);
  const [randomDelay2] = useState(() => Math.random() * 2);

  return (
    <motion.span
      className={cn('relative inline-block', className)}
      style={style}
      animate={{
        x: [0, -config.xRange, config.xRange, -config.xRange / 2, 0],
        y: [0, config.yRange / 2, -config.yRange / 2, 0],
      }}
      transition={{
        duration: 0.2,
        repeat: Infinity,
        repeatDelay: config.interval,
        ease: 'easeInOut',
      }}
    >
      {/* Main text */}
      <Component className="relative z-10">{children}</Component>
      
      {/* Glitch layer 1 - Offset left */}
      <motion.span
        className="absolute inset-0 opacity-0"
        style={{ 
          color: glitchColor,
          clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
        }}
        animate={{
          opacity: [0, 0.8, 0],
          x: [-3, 3, -3],
        }}
        transition={{
          duration: 0.15,
          repeat: Infinity,
          repeatDelay: config.interval + randomDelay1,
        }}
        aria-hidden
      >
        {children}
      </motion.span>
      
      {/* Glitch layer 2 - Offset right */}
      <motion.span
        className="absolute inset-0 opacity-0"
        style={{ 
          color: '#00f0ff',
          clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
        }}
        animate={{
          opacity: [0, 0.8, 0],
          x: [3, -3, 3],
        }}
        transition={{
          duration: 0.15,
          repeat: Infinity,
          repeatDelay: config.interval + 1 + randomDelay2,
        }}
        aria-hidden
      >
        {children}
      </motion.span>
      
      {/* Scanline overlay */}
      <motion.span
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)',
          mixBlendMode: 'overlay',
        }}
        animate={{ opacity: config.opacityRange }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          repeatDelay: config.interval / 2,
        }}
      />
    </motion.span>
  );
}
