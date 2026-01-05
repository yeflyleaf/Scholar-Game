import { motion } from 'framer-motion';
import React from 'react';
import { useGameStore } from '../../stores/useGameStore';
import type { StarSector } from '../../types/game';

export const GrandUnificationSim: React.FC = () => {
    const { sectors, currentSector, selectSector, startBattle, setScreen } = useGameStore();

    const handleSectorClick = (sector: StarSector) => {
        if (sector.status !== 'LOCKED') {
            selectSector(sector.id);
        }
    };

    const handleStart = () => {
        if (currentSector) {
            startBattle(currentSector.id);
        }
    };

    return (
        <div className="w-full h-full bg-deep-space relative overflow-hidden flex">
            {/* Star Map Area */}
            <div className="flex-1 relative">
                <div className="absolute inset-0 bg-[url('/grid.png')] opacity-20" /> {/* Placeholder for grid */}
                
                {/* Connection Lines (Simplified for now, can be enhanced) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {sectors.map((sector, i) => (
                        // Draw lines to next sector just for visual flow in this demo
                        i < sectors.length - 1 && (
                            <line 
                                key={i}
                                x1={sector.position.x} 
                                y1={sector.position.y} 
                                x2={sectors[i+1].position.x} 
                                y2={sectors[i+1].position.y} 
                                stroke="rgba(0, 243, 255, 0.2)" 
                                strokeWidth="2"
                                strokeDasharray="5,5"
                            />
                        )
                    ))}
                </svg>

                {sectors.map((sector) => {
                    const isSelected = currentSector?.id === sector.id;
                    const isLocked = sector.status === 'LOCKED';
                    
                    return (
                        <motion.div
                            key={sector.id}
                            className={`absolute w-16 h-16 -ml-8 -mt-8 flex items-center justify-center cursor-pointer transition-all duration-300`}
                            style={{ left: sector.position.x, top: sector.position.y }}
                            onClick={() => handleSectorClick(sector)}
                            whileHover={{ scale: 1.1 }}
                        >
                            {/* Hexagon Node */}
                            <div className={`w-full h-full hex-clip flex items-center justify-center 
                                ${isLocked ? 'bg-gray-800' : 
                                  sector.status === 'HIGH_ENTROPY' ? 'bg-glitch-red' : 'bg-stable'}
                                ${isSelected ? 'ring-4 ring-white' : ''}
                                opacity-80 hover:opacity-100
                            `}>
                                <span className="text-xs font-bold text-black">
                                    {sector.difficulty}
                                </span>
                            </div>
                            
                            {/* Label */}
                            <div className="absolute top-full mt-2 whitespace-nowrap text-xs font-mono text-neon-cyan bg-black/50 px-2 rounded">
                                {sector.name}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Side Panel */}
            <motion.div 
                className="w-96 h-full fui-panel p-6 flex flex-col gap-6 z-10"
                initial={{ x: 100 }}
                animate={{ x: 0 }}
            >
                <h2 className="text-2xl font-mono text-neon-cyan border-b border-neon-cyan pb-2">
                    扇区分析
                </h2>

                {currentSector ? (
                    <div className="flex flex-col gap-4 flex-1">
                        <div>
                            <h3 className="text-xl font-bold text-white">{currentSector.name}</h3>
                            <p className="text-sm text-gray-400 font-mono mt-1">{currentSector.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/30 p-2 rounded border border-gray-700">
                                <span className="text-xs text-gray-500 block">状态</span>
                                <span className={`font-mono ${currentSector.status === 'HIGH_ENTROPY' ? 'text-glitch-red' : 'text-stable'}`}>
                                    {currentSector.status === 'HIGH_ENTROPY' ? '高熵' : 
                                     currentSector.status === 'LOCKED' ? '锁定' : 
                                     currentSector.status === 'STABLE' ? '稳定' : currentSector.status}
                                </span>
                            </div>
                            <div className="bg-black/30 p-2 rounded border border-gray-700">
                                <span className="text-xs text-gray-500 block">难度</span>
                                <span className="text-holographic-gold">{'★'.repeat(currentSector.difficulty)}</span>
                            </div>
                        </div>

                        <div className="flex-1" />

                        <button 
                            onClick={handleStart}
                            className="hex-button w-full text-lg font-bold"
                        >
                            开始潜渊
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center flex-1 text-gray-500 font-mono">
                        请选择扇区
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-700 flex gap-2">
                    <button 
                        onClick={() => setScreen('TITLE')}
                        className="hex-button flex-1 text-xs"
                    >
                        中止
                    </button>
                    <button 
                        onClick={() => setScreen('MIND_HACK')}
                        className="hex-button flex-1 text-xs text-holographic-gold border-holographic-gold"
                    >
                        思维骇入
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
