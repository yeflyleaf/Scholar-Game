import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Character } from '../../types';

interface SkillBarProps {
  character: Character;
  onUseSkill: (skillId: string) => void;
  disabled?: boolean;
}

export function SkillBar({ character, onUseSkill, disabled }: SkillBarProps) {
  return (
    <div className="flex gap-2">
      {character.skills.map((skill) => {
        const isOnCooldown = skill.currentCooldown > 0;
        const isUsable = !isOnCooldown && !disabled;

        return (
          <motion.button
            key={skill.id}
            onClick={() => isUsable && onUseSkill(skill.id)}
            disabled={!isUsable}
            className={cn(
              'relative px-4 py-2 rounded border-2 font-mono text-sm transition-all',
              isUsable
                ? 'border-cyber-pink/50 bg-cyber-pink/10 text-cyber-pink hover:bg-cyber-pink/20'
                : 'border-gray-700 bg-gray-900/50 text-gray-600 cursor-not-allowed'
            )}
            whileHover={isUsable ? { scale: 1.05 } : {}}
            whileTap={isUsable ? { scale: 0.95 } : {}}
          >
            <div className="flex items-center gap-2">
              <Zap size={14} />
              <span>{skill.name}</span>
            </div>

            {/* Cooldown overlay */}
            {isOnCooldown && (
              <div className="absolute inset-0 flex items-center justify-center bg-deep-void/80 rounded">
                <span className="text-xs font-mono text-gray-500">
                  CD: {skill.currentCooldown}
                </span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
