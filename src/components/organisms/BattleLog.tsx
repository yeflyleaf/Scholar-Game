import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import type { BattleLogEntry } from '../../types';

interface BattleLogProps {
  entries: BattleLogEntry[];
}

const entryColors: Record<BattleLogEntry['type'], string> = {
  info: 'text-gray-400',
  damage: 'text-warning-red',
  heal: 'text-hp-green',
  overload: 'text-overload-purple',
  system: 'text-data-blue',
  skill: 'text-cyber-pink',
  critical: 'text-yellow-400',
  cyberpsychosis: 'text-warning-red',
  optimization: 'text-yellow-400',
};

const entryIcons: Record<BattleLogEntry['type'], string> = {
  info: '›',
  damage: '⚔',
  heal: '♥',
  overload: '⚡',
  system: '◆',
  skill: '★',
  critical: '✦',
  cyberpsychosis: '☠',
  optimization: '✨',
};

export function BattleLog({ entries }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-mono text-neon-green uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
        战斗日志
      </h3>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(57,255,20,0.3) transparent',
        }}
      >
        {entries.map((entry, index) => (
          <motion.div
            key={entry.id}
            className={cn(
              'px-3 py-2 rounded bg-deep-void/50 border border-gray-800 font-mono text-xs',
              entryColors[entry.type]
            )}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02 }}
          >
            <span className="mr-2">{entryIcons[entry.type]}</span>
            {entry.message}
          </motion.div>
        ))}

        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-600 font-mono text-xs">
            等待战斗开始...
          </div>
        )}
      </div>

      {/* Stats footer */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-xs font-mono text-gray-500">
        <div className="flex justify-between">
          <span>总条目</span>
          <span>{entries.length}</span>
        </div>
      </div>
    </div>
  );
}
