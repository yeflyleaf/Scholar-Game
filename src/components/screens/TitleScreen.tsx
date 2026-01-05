import { motion } from 'framer-motion';
import React from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const TitleScreen: React.FC = () => {
    const { setScreen } = useGameStore();

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-deep-space relative overflow-hidden">
            {/* Background Effects */}
            <div className="data-stream opacity-20" />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="z-10 flex flex-col items-center gap-2"
            >
                <h2 className="text-neon-cyan font-mono tracking-[0.5em] text-sm">Project Scholar</h2>
                <h1 className="text-6xl md:text-8xl font-bold text-white glitch-text mb-4" data-text="学习飞升">
                    学习飞升
                </h1>
                <p className="text-gray-400 font-mono italic">
                    为世界上所有的不挂科而战！
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="z-10 mt-16 flex flex-col gap-4"
            >
                <button
                    onClick={() => setScreen('GRAND_UNIFICATION_SIM')}
                    className="hex-button w-64 text-xl"
                >
                    开始链接
                </button>
                
                <button
                    onClick={() => setScreen('SETTINGS')}
                    className="hex-button w-64 text-sm opacity-80"
                >
                    系统配置
                </button>
            </motion.div>
        </div>
    );
};
