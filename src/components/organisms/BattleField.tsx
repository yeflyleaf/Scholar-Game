import { motion } from 'framer-motion';
import React from 'react';
import { useBattleSequence } from '../../hooks/useBattleSequence';
import { useGameStore } from '../../stores/useGameStore';
import { QuestionCard } from '../molecules/QuestionCard';

export const BattleField: React.FC = () => {
    const { 
        constructs, 
        entropyEntities, 
        currentTurn, 
        currentQuestion,
        battleLog,
        useSkill,
        setScreen,
        battleState
    } = useGameStore();

    const { 
        handleAnswerSubmit, 
        statusMessage, 
        isProcessing, 
        selectedAnswerIndex, 
        isCorrect 
    } = useBattleSequence();

    return (
        <div className="w-full h-full bg-deep-space relative overflow-hidden flex flex-col p-4">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-4 fui-panel p-2 rounded">
                <div className="flex gap-4">
                    <button onClick={() => setScreen('GRAND_UNIFICATION_SIM')} className="hex-button text-xs py-1">
                        撤退
                    </button>
                    <span className="text-neon-cyan font-mono">回合: {currentTurn}</span>
                </div>
                <div className="text-xl font-mono text-white glitch-text" data-text={statusMessage}>
                    {statusMessage}
                </div>
                <div className="w-32" /> {/* Spacer */}
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Left: Constructs */}
                <div className="w-1/4 flex flex-col gap-4 overflow-y-auto pr-2">
                    {constructs.map(construct => (
                        <motion.div 
                            key={construct.id}
                            className={`fui-panel p-4 relative ${construct.isDead ? 'opacity-50 grayscale' : ''}`}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-neon-cyan font-bold">{construct.name}</span>
                                <span className="text-xs text-gray-400">{construct.model}</span>
                            </div>
                            
                            {/* HP Bar */}
                            <div className="w-full h-2 bg-gray-800 rounded mb-1">
                                <div 
                                    className="h-full bg-stable transition-all duration-300" 
                                    style={{ width: `${(construct.hp / construct.maxHp) * 100}%` }}
                                />
                            </div>
                            <div className="text-xs text-right text-gray-400 mb-2">{construct.hp}/{construct.maxHp} HP</div>

                            {/* Energy Bar */}
                            <div className="w-full h-1 bg-gray-800 rounded mb-2">
                                <div 
                                    className="h-full bg-holographic-gold transition-all duration-300" 
                                    style={{ width: `${(construct.energy / construct.maxEnergy) * 100}%` }}
                                />
                            </div>

                            {/* Skills */}
                            <div className="flex gap-2 mt-2">
                                {construct.skills.map(skill => (
                                    <button
                                        key={skill.id}
                                        onClick={() => useSkill(construct.id, skill.id)}
                                        disabled={construct.isDead || skill.currentCooldown > 0 || construct.energy < (skill.cost || 0)}
                                        className="flex-1 bg-black/50 border border-gray-600 text-xs py-1 hover:border-neon-cyan disabled:opacity-30"
                                        title={skill.description}
                                    >
                                        {skill.currentCooldown > 0 ? `${skill.currentCooldown}` : skill.name}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Center: Question */}
                <div className="flex-1 flex items-center justify-center relative">
                    {currentQuestion && battleState === 'PLAYER_TURN' && (
                        <QuestionCard 
                            question={currentQuestion}
                            onAnswer={handleAnswerSubmit}
                            disabled={isProcessing}
                            selectedIndex={selectedAnswerIndex}
                            isCorrect={isCorrect}
                        />
                    )}
                    
                    {/* Battle Log Overlay (Bottom Center) */}
                    <div className="absolute bottom-0 w-full max-h-32 overflow-y-auto bg-black/80 p-2 font-mono text-xs text-gray-300 pointer-events-none">
                        {battleLog.slice().reverse().map(log => (
                            <div key={log.id} className="mb-1">
                                <span className="text-neon-cyan">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Entropy Entities */}
                <div className="w-1/4 flex flex-col gap-4 overflow-y-auto pl-2">
                    {entropyEntities.map(entity => (
                        <motion.div 
                            key={entity.id}
                            className={`fui-panel p-4 border-r-2 border-l-0 border-glitch-red ${entity.isDead ? 'opacity-0' : ''}`}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: entity.isDead ? 0 : 1 }}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-glitch-red font-bold glitch-text" data-text={entity.name}>{entity.name}</span>
                                <span className="text-xs text-gray-400">{entity.form}</span>
                            </div>
                            
                            {/* HP Bar */}
                            <div className="w-full h-2 bg-gray-800 rounded mb-1">
                                <div 
                                    className="h-full bg-glitch-red transition-all duration-300" 
                                    style={{ width: `${(entity.hp / entity.maxHp) * 100}%` }}
                                />
                            </div>
                            <div className="text-xs text-right text-gray-400">{entity.hp}/{entity.maxHp} HP</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
