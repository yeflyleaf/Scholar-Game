import { motion } from 'framer-motion';
import React from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const MindHack: React.FC = () => {
    const { setScreen, performMindHack } = useGameStore();
    const [result, setResult] = React.useState<any>(null);

    const handleHack = () => {
        const item = performMindHack();
        setResult(item);
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-deep-space relative overflow-hidden">
            <div className="data-stream" />
            
            <h1 className="text-4xl font-mono text-neon-cyan mb-8 z-10 glitch-text" data-text="思维骇入">
                思维骇入
            </h1>

            <div className="z-10 flex flex-col items-center gap-8">
                {!result ? (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleHack}
                        className="w-64 h-64 border-2 border-neon-cyan rounded-full flex items-center justify-center relative group"
                    >
                        <div className="absolute inset-0 rounded-full border border-dashed border-neon-cyan animate-spin-slow opacity-50" />
                        <span className="text-2xl font-mono text-neon-cyan group-hover:text-white transition-colors">
                            启动<br/>骇入
                        </span>
                    </motion.button>
                ) : (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="fui-panel p-8 flex flex-col items-center gap-4 max-w-md"
                    >
                        <div className="text-6xl text-holographic-gold mb-4">
                            ⬡
                        </div>
                        <h2 className="text-2xl text-holographic-gold font-bold">{result.name}</h2>
                        <div className="px-2 py-1 bg-holographic-gold text-black font-bold text-xs rounded">
                            {result.rarity}
                        </div>
                        <p className="text-center text-gray-300 font-mono text-sm">
                            {result.description}
                        </p>
                        <button
                            onClick={() => setResult(null)}
                            className="hex-button mt-4"
                        >
                            确认接收
                        </button>
                    </motion.div>
                )}

                <button
                    onClick={() => setScreen('GRAND_UNIFICATION_SIM')}
                    className="hex-button z-10 mt-8"
                >
                    返回演练
                </button>
            </div>
        </div>
    );
};
