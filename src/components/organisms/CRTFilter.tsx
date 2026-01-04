import { motion } from 'framer-motion';

export function CRTFilter() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Scanlines */}
      <div 
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.15) 2px,
            rgba(0, 0, 0, 0.15) 4px
          )`,
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* Moving scanline */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-white/5"
        animate={{
          top: ['-2px', '100vh'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 50%,
            rgba(0, 0, 0, 0.4) 100%
          )`,
        }}
      />
      
      {/* Subtle RGB shift on edges */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            linear-gradient(90deg, rgba(255,0,0,0.03) 0%, transparent 5%, transparent 95%, rgba(0,255,255,0.03) 100%)
          `,
          mixBlendMode: 'screen',
        }}
      />
      
      {/* Flicker effect */}
      <motion.div
        className="absolute inset-0 bg-white"
        animate={{
          opacity: [0, 0.02, 0, 0.01, 0],
        }}
        transition={{
          duration: 0.15,
          repeat: Infinity,
          repeatDelay: 5,
        }}
      />
      
      {/* Corner overlays for extra depth */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-black/20 to-transparent" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-black/20 to-transparent" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-black/20 to-transparent" />
    </div>
  );
}
