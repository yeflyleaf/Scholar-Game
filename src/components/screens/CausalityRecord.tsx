import { motion } from 'framer-motion';
import React from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const CausalityRecord: React.FC = () => {
    const { setScreen, battleState, currentSector, resetBattle } = useGameStore();
    const isVictory = battleState === 'VICTORY';

    const handleContinue = () => {
        resetBattle();
        setScreen('GRAND_UNIFICATION_SIM');
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-deep-space relative">
            <div className="absolute inset-0 bg-black/80 z-0" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 fui-panel p-12 max-w-2xl w-full flex flex-col items-center gap-6"
            >
                <h1 className={`text-5xl font-mono font-bold glitch-text ${isVictory ? 'text-neon-cyan' : 'text-glitch-red'}`} 
                    data-text={isVictory ? "逻辑重构完成" : "致命错误"}>
                    {isVictory ? "逻辑重构完成" : "致命错误"}
                </h1>

                <div className="w-full h-px bg-gray-700 my-4" />

                <div className="text-center space-y-2 font-mono">
                    <p className="text-xl text-white">
                        {isVictory 
                            ? `扇区 ${currentSector?.name} 已稳定。` 
                            : "连接丢失。观察者，世界已回归虚无。"}
                    </p>
                    {isVictory && (
                        <p className="text-neon-cyan">
                            熵值降低: 15%
                        </p>
                    )}
                </div>

                <div className="flex gap-4 mt-8">
                    <button
                        onClick={handleContinue}
                        className="hex-button"
                    >
                        {isVictory ? "继续" : "重启系统"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
