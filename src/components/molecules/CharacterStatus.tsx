import { motion } from 'framer-motion';
import { Cpu, Database, Shield, Skull, Zap } from 'lucide-react';
import { ROLE_COLORS } from '../../lib/constants';
import { cn } from '../../lib/utils';
import type { Character, CharacterRole } from '../../types';
import { StatBar } from '../atoms';

interface CharacterStatusProps {
  character: Character;
  isActive?: boolean;
  showGoldGlow?: boolean;
  showCyberpsychosis?: boolean;
  onSkillUse?: (skillId: string) => void;
  className?: string;
}

const RoleIcon = ({ role }: { role: CharacterRole }) => {
  const iconProps = { size: 20, className: 'text-current' };

  switch (role) {
    case 'LogicEngine':
      return <Cpu {...iconProps} />;
    case 'Archivist':
      return <Database {...iconProps} />;
    case 'Firewall':
      return <Shield {...iconProps} />;
  }
};

const ArchetypeLabel = ({ archetype }: { archetype: string }) => {
  const labels: Record<string, string> = {
    'DPS': '输出',
    'Tank/Control': '坦克/控制',
    'Support/Healer': '辅助/治疗',
  };
  return <span>{labels[archetype] || archetype}</span>;
};

export function CharacterStatus({
  character,
  isActive,
  showGoldGlow,
  showCyberpsychosis,
  onSkillUse,
  className,
}: CharacterStatusProps) {
  const isDead = character.hp <= 0;
  const isDisabled = character.isDisabled;
  const roleColor = ROLE_COLORS[character.role];
  const isOverloadCritical = character.overload >= 80;
  const hasFlowState = character.statusEffects.some((e) => e.effect === 'flow_state');
  const hasCyberpsychosis = character.statusEffects.some((e) => e.effect === 'cyberpsychosis');

  return (
    <motion.div
      className={cn(
        'relative p-4 rounded-lg border-2 bg-deep-void/80 backdrop-blur-sm',
        'transition-all duration-300',
        isDead ? 'opacity-50 grayscale' : '',
        isDisabled ? 'opacity-70' : '',
        isActive && !isDead ? 'ring-2 ring-neon-green ring-offset-2 ring-offset-deep-void' : '',
        className
      )}
      style={{ borderColor: hasCyberpsychosis ? '#ff0000' : hasFlowState ? '#ffd700' : roleColor }}
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: isDead ? 0.5 : 1,
        x: 0,
        scale: isActive && !isDead ? 1.02 : 1,
      }}
      whileHover={!isDead ? { scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Gold Glow Effect (灵光一现) */}
      {showGoldGlow && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none z-20"
          style={{
            boxShadow: '0 0 30px #ffd700, inset 0 0 30px rgba(255,215,0,0.3)',
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      {/* Cyberpsychosis Glitch Effect */}
      {showCyberpsychosis && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none z-20 overflow-hidden"
          style={{
            background: 'linear-gradient(45deg, transparent 40%, rgba(255,0,0,0.2) 50%, transparent 60%)',
          }}
          animate={{
            clipPath: [
              'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
              'polygon(0 20%, 100% 0, 100% 80%, 0 100%)',
              'polygon(0 0, 100% 20%, 100% 100%, 0 80%)',
              'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            ],
          }}
          transition={{ duration: 0.2, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {/* Role Icon */}
        <motion.div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${roleColor}20`,
            color: roleColor,
            boxShadow: `0 0 10px ${roleColor}40`,
          }}
          animate={
            !isDead
              ? {
                  boxShadow: [
                    `0 0 10px ${roleColor}40`,
                    `0 0 20px ${roleColor}60`,
                    `0 0 10px ${roleColor}40`,
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
        >
          <RoleIcon role={character.role} />
        </motion.div>

        {/* Name and Role */}
        <div className="flex-1">
          <h3 className="font-mono font-bold text-sm tracking-wide" style={{ color: roleColor }}>
            {character.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest">
              <ArchetypeLabel archetype={character.archetype} />
            </span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex flex-col gap-1">
          {isDead && (
            <motion.span
              className="px-2 py-1 bg-warning-red/20 text-warning-red text-xs font-mono uppercase rounded"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              离线
            </motion.span>
          )}
          {isDisabled && !isDead && (
            <motion.span
              className="px-2 py-1 bg-warning-red/20 text-warning-red text-xs font-mono uppercase rounded"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              禁用
            </motion.span>
          )}
          {hasFlowState && (
            <motion.span
              className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-mono uppercase rounded"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              心流
            </motion.span>
          )}
        </div>
      </div>

      {/* Passive Ability Indicator */}
      {character.passiveAbility.isActive && (
        <motion.div
          className="mb-3 px-2 py-1 rounded bg-cyber-pink/20 border border-cyber-pink/50"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="flex items-center gap-2 text-xs font-mono text-cyber-pink">
            <Zap size={12} />
            <span>{character.passiveAbility.name} 激活!</span>
            {character.passiveAbility.stacks && (
              <span className="ml-auto">x{character.passiveAbility.stacks}</span>
            )}
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="space-y-2">
        <StatBar value={character.hp} max={character.maxHp} label="HP" type="hp" size="sm" />
        <StatBar
          value={character.overload}
          max={100}
          label="过载"
          type="overload"
          size="sm"
        />
      </div>

      {/* Overload Warning */}
      {isOverloadCritical && !isDead && (
        <motion.div
          className="mt-2 text-xs font-mono text-warning-red flex items-center gap-1"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Skull size={12} />
          <span>过载临界!</span>
        </motion.div>
      )}

      {/* Skills */}
      {character.skills.length > 0 && onSkillUse && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 font-mono mb-2">技能</p>
          <div className="space-y-1">
            {character.skills.map((skill) => {
              const isOnCooldown = skill.currentCooldown > 0;
              return (
                <button
                  key={skill.id}
                  onClick={() => !isOnCooldown && !isDead && onSkillUse(skill.id)}
                  disabled={isOnCooldown || isDead}
                  className={cn(
                    'w-full px-2 py-1 rounded text-xs font-mono text-left',
                    'border transition-all',
                    isOnCooldown || isDead
                      ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                      : 'border-cyber-pink/50 text-cyber-pink hover:bg-cyber-pink/20 cursor-pointer'
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span>{skill.name}</span>
                    {isOnCooldown && (
                      <span className="text-gray-500">CD: {skill.currentCooldown}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Effects */}
      {character.statusEffects.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {character.statusEffects.map((effect) => (
            <motion.span
              key={effect.id}
              className={cn(
                'px-2 py-0.5 text-xs font-mono rounded',
                effect.type === 'buff'
                  ? 'bg-neon-green/20 text-neon-green'
                  : 'bg-warning-red/20 text-warning-red'
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              {effect.name} ({effect.duration})
            </motion.span>
          ))}
        </div>
      )}

      {/* Corner decorations */}
      <div
        className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2"
        style={{ borderColor: roleColor }}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2"
        style={{ borderColor: roleColor }}
      />

      {/* Glowing edge effect */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          boxShadow: `inset 0 0 20px ${roleColor}20`,
        }}
        animate={{
          boxShadow: [
            `inset 0 0 20px ${roleColor}20`,
            `inset 0 0 30px ${roleColor}30`,
            `inset 0 0 20px ${roleColor}20`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
}
