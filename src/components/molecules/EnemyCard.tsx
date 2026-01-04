import { motion } from 'framer-motion';
import { AlertTriangle, Bug, Skull, Zap } from 'lucide-react';
import { ENEMY_TYPE_COLORS } from '../../lib/constants';
import { cn } from '../../lib/utils';
import type { Enemy, EnemyType } from '../../types';
import { StatBar } from '../atoms';

interface EnemyCardProps {
  enemy: Enemy;
  isTarget?: boolean;
  onSelect?: () => void;
  className?: string;
}

const EnemyIcon = ({ type }: { type: EnemyType }) => {
  const iconProps = { size: 32, className: 'text-current' };

  switch (type) {
    case 'Minion':
      return <Bug {...iconProps} />;
    case 'Elite':
      return <Zap {...iconProps} />;
    case 'Boss':
      return <Skull {...iconProps} />;
  }
};

const EnemyTypeLabel: Record<EnemyType, string> = {
  Minion: '普通防御程式',
  Elite: '逻辑门卫',
  Boss: '本章领主',
};

export function EnemyCard({ enemy, isTarget, onSelect, className }: EnemyCardProps) {
  const isDead = enemy.hp <= 0;
  const isStunned = enemy.isStunned;
  const enemyColor = ENEMY_TYPE_COLORS[enemy.type];
  const isLowHp = enemy.hp <= enemy.maxHp * 0.3;

  return (
    <motion.div
      className={cn(
        'relative p-4 rounded-lg border-2 bg-deep-void/80 backdrop-blur-sm cursor-pointer',
        'transition-all duration-300',
        isDead ? 'opacity-30 grayscale pointer-events-none' : '',
        isTarget ? 'ring-2 ring-warning-red ring-offset-2 ring-offset-deep-void' : '',
        isStunned ? 'opacity-70' : '',
        className
      )}
      style={{ borderColor: enemyColor }}
      onClick={onSelect}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isDead ? 0.3 : isStunned ? 0.7 : 1,
        scale: isDead ? 0.9 : 1,
      }}
      whileHover={!isDead ? { scale: 1.05 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Enemy Icon with breathing animation */}
      <motion.div
        className="flex justify-center mb-3"
        animate={
          !isDead && !isStunned
            ? {
                scale: [1, 1.05, 1],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <motion.div
          className="w-16 h-16 rounded-full flex items-center justify-center relative"
          style={{
            backgroundColor: `${enemyColor}20`,
            color: enemyColor,
            boxShadow: `0 0 20px ${enemyColor}40`,
          }}
          animate={
            !isDead
              ? {
                  boxShadow: [
                    `0 0 20px ${enemyColor}40`,
                    `0 0 40px ${enemyColor}60`,
                    `0 0 20px ${enemyColor}40`,
                  ],
                }
              : {}
          }
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <EnemyIcon type={enemy.type} />
          
          {/* Stunned indicator */}
          {isStunned && (
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <span className="text-xs">💫</span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Type Badge */}
      {enemy.type === 'Boss' && (
        <motion.div
          className="absolute top-2 right-2 px-2 py-0.5 rounded bg-warning-red/20 border border-warning-red/50"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <span className="text-xs font-mono text-warning-red uppercase tracking-wider">
            BOSS
          </span>
        </motion.div>
      )}

      {/* Name */}
      <h3
        className="text-center font-mono font-bold text-sm tracking-wide mb-1"
        style={{ color: enemyColor }}
      >
        {enemy.name}
      </h3>

      <span className="block text-center text-xs text-gray-500 uppercase tracking-widest mb-3">
        {EnemyTypeLabel[enemy.type]}
      </span>

      {/* HP Bar */}
      <StatBar value={enemy.hp} max={enemy.maxHp} type="hp" size="sm" />

      {/* Stats */}
      <div className="mt-3 flex justify-between text-xs font-mono">
        <span className="text-warning-red flex items-center gap-1">
          <Zap size={12} />
          攻击: {enemy.damage}
        </span>
        {isStunned && (
          <span className="text-yellow-500">
            眩晕: {enemy.stunDuration}回合
          </span>
        )}
      </div>

      {/* Special Ability */}
      {enemy.specialAbility && !isDead && (
        <motion.div
          className="mt-3 pt-2 border-t border-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start gap-2 text-xs">
            <AlertTriangle size={12} className="text-warning-red mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-warning-red font-mono font-bold">{enemy.specialAbility.name}</span>
              <p className="text-gray-500 mt-0.5">{enemy.specialAbility.description}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Low HP Warning */}
      {isLowHp && !isDead && (
        <motion.div
          className="mt-2 text-center"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <span className="text-xs font-mono text-warning-red">⚠ 即将崩溃</span>
        </motion.div>
      )}

      {/* Dead overlay */}
      {isDead && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-deep-void/80 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-warning-red font-mono text-lg uppercase tracking-widest">
            已清除
          </span>
        </motion.div>
      )}

      {/* Stunned overlay */}
      {isStunned && !isDead && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-yellow-500/10 rounded-lg pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <span className="text-yellow-500 font-mono text-sm uppercase tracking-widest">
            眩晕中
          </span>
        </motion.div>
      )}

      {/* Glowing effect */}
      {!isDead && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{
            boxShadow: [
              `inset 0 0 15px ${enemyColor}20`,
              `inset 0 0 25px ${enemyColor}30`,
              `inset 0 0 15px ${enemyColor}20`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
