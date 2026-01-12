import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

interface CustomAlertDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'warning' | 'info' | 'success' | 'error';
}

export const CustomAlertDialog: React.FC<CustomAlertDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = '确认',
    cancelText = '取消',
    onConfirm,
    onCancel,
    type = 'warning'
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                    />

                    {/* Dialog */}
                    <motion.div
                        className={`
                            relative w-full max-w-md p-6 rounded-lg border-2
                            ${type === 'warning' || type === 'error' ? 'border-glitch-red bg-gray-900/90' : 'border-neon-cyan bg-gray-900/90'}
                            shadow-[0_0_30px_rgba(0,0,0,0.5)]
                            overflow-hidden
                        `}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        style={{
                            clipPath: 'polygon(5% 0, 95% 0, 100% 10%, 100% 90%, 95% 100%, 5% 100%, 0 90%, 0 10%)'
                        }}
                    >
                        {/* Decorative Elements */}
                        <div className={`absolute top-0 left-0 w-full h-1 ${type === 'warning' || type === 'error' ? 'bg-glitch-red' : 'bg-neon-cyan'}`} />
                        <div className="absolute top-2 right-2 flex gap-1">
                            <div className={`w-2 h-2 rounded-full ${type === 'warning' || type === 'error' ? 'bg-glitch-red' : 'bg-neon-cyan'} opacity-50`} />
                            <div className={`w-2 h-2 rounded-full ${type === 'warning' || type === 'error' ? 'bg-glitch-red' : 'bg-neon-cyan'} opacity-30`} />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className={`text-2xl ${type === 'warning' || type === 'error' ? 'text-glitch-red' : 'text-neon-cyan'}`}>
                                    {type === 'warning' ? '⚠' : type === 'error' ? '✕' : type === 'success' ? '✓' : 'ℹ'}
                                </span>
                                <h3 className={`text-xl font-display font-bold ${type === 'warning' || type === 'error' ? 'text-glitch-red' : 'text-neon-cyan'}`}>
                                    {title}
                                </h3>
                            </div>
                            
                            <p className="text-gray-300 font-mono text-sm leading-relaxed">
                                {message}
                            </p>

                            <div className="flex gap-3 pt-4">
                                <motion.button
                                    onClick={onCancel}
                                    className="flex-1 py-2 px-4 border border-gray-600 text-gray-400 font-mono text-sm rounded hover:bg-gray-800 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {cancelText}
                                </motion.button>
                                <motion.button
                                    onClick={onConfirm}
                                    className={`
                                        flex-1 py-2 px-4 font-mono text-sm rounded font-bold
                                        ${type === 'warning' || type === 'error' 
                                            ? 'bg-glitch-red/20 border border-glitch-red text-glitch-red hover:bg-glitch-red/30' 
                                            : 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/30'}
                                    `}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {confirmText}
                                </motion.button>
                            </div>
                        </div>

                        {/* Background Grid */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" 
                             style={{ 
                                 backgroundImage: `linear-gradient(0deg, transparent 24%, ${type === 'warning' || type === 'error' ? '#ff003c' : '#00f3ff'} 25%, ${type === 'warning' || type === 'error' ? '#ff003c' : '#00f3ff'} 26%, transparent 27%, transparent 74%, ${type === 'warning' || type === 'error' ? '#ff003c' : '#00f3ff'} 75%, ${type === 'warning' || type === 'error' ? '#ff003c' : '#00f3ff'} 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, ${type === 'warning' || type === 'error' ? '#ff003c' : '#00f3ff'} 25%, ${type === 'warning' || type === 'error' ? '#ff003c' : '#00f3ff'} 26%, transparent 27%, transparent 74%, ${type === 'warning' || type === 'error' ? '#ff003c' : '#00f3ff'} 75%, ${type === 'warning' || type === 'error' ? '#ff003c' : '#00f3ff'} 76%, transparent 77%, transparent)`,
                                 backgroundSize: '30px 30px'
                             }} 
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
