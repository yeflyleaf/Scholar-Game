// 页面：战场 (BattleField) - 核心战斗界面，包含构造体、敌人和答题区域
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useBattleSequence } from '../../hooks/useBattleSequence';
import { useGameStore } from '../../stores/useGameStore';
import type { BattleLogEntry, Construct, EntropyEntity, Skill } from '../../types/game';
import { QuestionCard } from '../molecules/QuestionCard';

// 构造体肖像组件
const ConstructCard: React.FC<{
    construct: Construct;
    onUseSkill: (constructId: string, skillId: string) => void;
    isActive: boolean;
}> = ({ construct, onUseSkill, isActive }) => {
    const hpPercent = (construct.hp / construct.maxHp) * 100;
    const energyPercent = (construct.energy / construct.maxEnergy) * 100;

    return (
        <motion.div
            className={`fui-panel p-6 relative shrink-0 ${construct.isDead ? 'opacity-40 grayscale' : ''}`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{
                boxShadow: isActive
                    ? '0 0 30px rgba(0, 243, 255, 0.4), inset 0 0 20px rgba(0, 243, 255, 0.1)'
                    : undefined,
                overflow: 'visible',
            }}
        >
            {/* 激活指示器 */}
            {isActive && (
                <motion.div
                    className="absolute -left-1 top-0 bottom-0 w-1 bg-neon-cyan"
                    layoutId="activeIndicator"
                    transition={{ duration: 0.3 }}
                />
            )}

            {/* 头部 */}
            <div className="flex justify-between items-start mb-2 gap-2">
                <div className="min-w-0 flex-1">
                    <h3 className="text-neon-cyan font-display font-bold text-sm truncate">{construct.name}</h3>
                    <span className="text-[12px] text-gray-500 font-mono truncate block">{construct.model}</span>
                </div>
                {/* 状态图标 */}
                <div className="flex gap-1 shrink-0">
                    {!construct.isDead && (
                        <div className="w-2 h-2 bg-stable rounded-full animate-pulse" />
                    )}
                </div>
            </div>

            {/* 生命值条 */}
            <div className="mb-1">
                <div className="flex justify-between text-[12px] font-mono mb-0.5">
                    <span className="text-gray-500">HP</span>
                    <span className={hpPercent < 30 ? 'text-glitch-red' : 'text-stable'}>
                        {construct.hp}/{construct.maxHp}
                    </span>
                </div>
                <div className="energy-bar h-1.5">
                    <motion.div
                        className="energy-bar-fill hp"
                        initial={{ width: 0 }}
                        animate={{ width: `${hpPercent}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* 能量条 */}
            <div className="mb-2">
                <div className="flex justify-between text-[12px] font-mono mb-0.5">
                    <span className="text-gray-500">能量</span>
                    <span className="text-holographic-gold">{construct.energy}/{construct.maxEnergy}</span>
                </div>
                <div className="energy-bar h-1">
                    <motion.div
                        className="energy-bar-fill energy"
                        initial={{ width: 0 }}
                        animate={{ width: `${energyPercent}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* 技能 - 使用网格布局 */}
            <div className="grid grid-cols-2 gap-1">
                {construct.skills.map((skill: Skill) => {
                    const canUse = !construct.isDead && skill.currentCooldown === 0 && construct.energy >= (skill.cost || 0);
                    
                    return (
                        <motion.button
                            key={skill.id}
                            onClick={() => canUse && onUseSkill(construct.id, skill.id)}
                            disabled={!canUse}
                            className={`
                                py-1.5 px-2 text-[14px] font-mono text-center
                                border transition-all duration-300
                                ${canUse
                                    ? 'border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/20 hover:border-neon-cyan'
                                    : 'border-gray-700 text-gray-600 cursor-not-allowed'
                                }
                            `}
                            title={`${skill.name}: ${skill.description}`}
                            whileHover={canUse ? { scale: 1.05 } : {}}
                            whileTap={canUse ? { scale: 0.95 } : {}}
                        >
                            {skill.currentCooldown > 0 ? (
                                <span className="text-gray-500">CD:{skill.currentCooldown}</span>
                            ) : (
                                <span className="truncate block">{skill.name}</span>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
};

// 熵实体组件
const EntropyCard: React.FC<{ entity: EntropyEntity }> = ({ entity }) => {
    const hpPercent = (entity.hp / entity.maxHp) * 100;

    if (entity.isDead) {
        return (
            <motion.div
                className="fui-panel p-4 relative overflow-hidden"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0, scale: 0.8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* 死亡特效 */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-glitch-red font-mono text-sm">已消除</span>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="fui-panel p-4 relative border-r-2 border-l-0 border-glitch-red/50"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{
                boxShadow: '0 0 30px rgba(255, 0, 60, 0.2)',
            }}
        >
            {/* 腐蚀特效遮罩 */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 60, 0.05) 2px, rgba(255, 0, 60, 0.05) 4px)',
                }}
                animate={{
                    backgroundPosition: ['0 0', '0 8px'],
                }}
                transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            {/* 头部 */}
            <div className="flex justify-between items-start mb-3 relative gap-2">
                <div className="min-w-0 flex-1">
                    <h3 className="text-glitch-red font-display font-bold text-base glitch-text truncate" data-text={entity.name}>
                        {entity.name}
                    </h3>
                    <span className="text-xs text-gray-500 font-mono truncate block">{entity.form}</span>
                </div>
                {/* 威胁指示器 */}
                <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-glitch-red/60 font-mono">威胁</span>
                    <div className="w-2 h-2 bg-glitch-red rounded-full animate-pulse" />
                </div>
            </div>

            {/* 生命值条 */}
            <div className="relative">
                <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-gray-500">完整性</span>
                    <span className="text-glitch-red">{entity.hp}/{entity.maxHp}</span>
                </div>
                <div className="energy-bar">
                    <motion.div
                        className="energy-bar-fill entropy"
                        animate={{ width: `${hpPercent}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>
        </motion.div>
    );
};

// 战斗日志组件 - 使用固定高度，不使用绝对定位避免重叠
const BattleLog: React.FC<{ logs: BattleLogEntry[] }> = ({ logs }) => {
    const { currentTheme } = useGameStore();
    const labels = currentTheme.pageLabels.battle;
    
    return (
    <motion.div 
        className="fui-panel p-3 h-full overflow-hidden flex flex-col"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
    >
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/50 shrink-0">
            <div className="w-2 h-2 bg-neon-cyan animate-pulse rounded-full" />
            <span className="text-xs font-mono text-neon-cyan">{labels.battleLogLabel}</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
            {logs.slice().reverse().slice(0, 8).map((log) => (
                <motion.div
                    key={log.id}
                    className="text-sm font-mono"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <span className="text-neon-cyan/60 mr-2 text-xs">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span className="text-gray-300">{log.message}</span>
                </motion.div>
            ))}
        </div>
    </motion.div>
    );
};

export const BattleField: React.FC = () => {
    const {
        constructs,
        entropyEntities,
        currentTurn,
        currentQuestion,
        battleLog,
        useSkill,
        setScreen,
        battleState,
        currentTheme
    } = useGameStore();
    const labels = currentTheme.pageLabels.battle;

    const {
        handleAnswerSubmit,
        statusMessage,
        isProcessing,
        selectedAnswerIndex,
        isCorrect
    } = useBattleSequence();

    return (
        <div className="w-full h-screen bg-deep-space relative overflow-hidden flex flex-col">
            {/* 背景特效 */}
            <div className="hex-grid-bg opacity-30" />
            <div className="data-stream opacity-20" />

            {/* 顶部栏 */}
            <motion.div
                className="flex justify-between items-center p-4 fui-panel m-2 rounded relative z-20"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="flex items-center gap-4">
                    <motion.button
                        onClick={() => setScreen('GRAND_UNIFICATION_SIM')}
                        className="hex-button text-xs py-2 px-4"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {labels.retreatButton}
                    </motion.button>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-mono text-sm">{labels.turnLabel}</span>
                        <span className="text-2xl font-display text-neon-cyan font-bold">{currentTurn}</span>
                    </div>
                </div>

                {/* 状态消息 */}
                <motion.div
                    className="text-xl font-display text-white glitch-text"
                    data-text={statusMessage}
                    key={statusMessage}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {statusMessage}
                </motion.div>

                {/* 处理指示器 */}
                <div className="w-32 flex justify-end">
                    {isProcessing && (
                        <motion.div
                            className="flex items-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-mono text-neon-cyan">处理中</span>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* 主战斗区域 - 使用 Grid 布局确保各区域不重叠 */}
            <div className="flex-1 grid grid-cols-[350px_1fr_350px] grid-rows-[1fr_140px] gap-3 p-4 overflow-hidden">
                {/* 左侧：构造体 - 跨两行 */}
                <motion.div
                    className="row-span-2 flex flex-col gap-1 overflow-y-auto pr-2"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="text-[25px] font-mono text-neon-cyan mb-2 flex items-center gap-2 shrink-0">
                        <div className="w-2 h-2 bg-neon-cyan rounded-full" />
                        {labels.constructsLabel}
                    </div>
                    {constructs.map((construct, index) => (
                        <ConstructCard
                            key={construct.id}
                            construct={construct}
                            onUseSkill={useSkill}
                            isActive={index === 0}
                        />
                    ))}
                </motion.div>

                {/* 中间上方：问题卡片区域 */}
                <div className="flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                        {currentQuestion && battleState === 'PLAYER_TURN' && (
                            <QuestionCard
                                question={currentQuestion}
                                onAnswer={handleAnswerSubmit}
                                disabled={isProcessing}
                                selectedIndex={selectedAnswerIndex}
                                isCorrect={isCorrect}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* 右侧：熵实体 - 跨两行 */}
                <motion.div
                    className="row-span-2 flex flex-col gap-3 overflow-y-auto pl-2"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="text-xs font-mono text-glitch-red mb-2 flex items-center gap-2 shrink-0">
                        <div className="w-2 h-2 bg-glitch-red rounded-full animate-pulse" />
                        {labels.entropyLabel}
                    </div>
                    <AnimatePresence>
                        {entropyEntities.map((entity) => (
                            <EntropyCard key={entity.id} entity={entity} />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* 中间下方：战斗日志区域 - 独立区域避免重叠 */}
                <div className="col-start-2">
                    <BattleLog logs={battleLog} />
                </div>
            </div>

            {/* 角落装饰 */}
            <div className="absolute top-16 left-4 w-12 h-12 border-t border-l border-neon-cyan/20 pointer-events-none" />
            <div className="absolute top-16 right-4 w-12 h-12 border-t border-r border-neon-cyan/20 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b border-l border-neon-cyan/20 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b border-r border-neon-cyan/20 pointer-events-none" />
        </div>
    );
};
