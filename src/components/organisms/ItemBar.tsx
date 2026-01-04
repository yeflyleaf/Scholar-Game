import { motion } from 'framer-motion';
import { Code, Eye, Package, ShieldCheck, SkipForward } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CyberItem } from '../../types';

interface ItemBarProps {
  items: CyberItem[];
  onUseItem: (itemId: string) => void;
  disabled?: boolean;
}

const ItemIcon = ({ icon }: { icon: string }) => {
  const icons: Record<string, React.ReactNode> = {
    'skip-forward': <SkipForward size={18} />,
    'code': <Code size={18} />,
    'shield-check': <ShieldCheck size={18} />,
    'eye': <Eye size={18} />,
  };
  return <>{icons[icon] || <Package size={18} />}</>;
};

export function ItemBar({ items, onUseItem, disabled }: ItemBarProps) {
  return (
    <motion.div
      className="p-4 rounded-lg border border-neon-green/30 bg-deep-void/80 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Package size={16} className="text-neon-green" />
        <h3 className="text-sm font-mono text-neon-green uppercase tracking-widest">赛博道具</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => {
          const isAvailable = item.quantity > 0 && !disabled;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => isAvailable && onUseItem(item.id)}
              disabled={!isAvailable}
              className={cn(
                'relative flex-shrink-0 p-3 rounded-lg border-2 transition-all min-w-[120px]',
                isAvailable
                  ? 'border-data-blue/50 bg-data-blue/10 hover:bg-data-blue/20 hover:border-data-blue cursor-pointer'
                  : 'border-gray-700 bg-gray-900/50 cursor-not-allowed opacity-50'
              )}
              whileHover={isAvailable ? { scale: 1.05 } : {}}
              whileTap={isAvailable ? { scale: 0.95 } : {}}
            >
              {/* Icon */}
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center mb-2 mx-auto',
                isAvailable ? 'bg-data-blue/20 text-data-blue' : 'bg-gray-800 text-gray-600'
              )}>
                <ItemIcon icon={item.icon} />
              </div>

              {/* Name */}
              <p className={cn(
                'text-xs font-mono font-bold text-center mb-1',
                isAvailable ? 'text-data-blue' : 'text-gray-600'
              )}>
                {item.name}
              </p>

              {/* Description */}
              <p className="text-[10px] text-gray-500 text-center line-clamp-2">
                {item.description}
              </p>

              {/* Quantity Badge */}
              <div className={cn(
                'absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold',
                item.quantity > 0 ? 'bg-neon-green text-deep-void' : 'bg-gray-700 text-gray-500'
              )}>
                {item.quantity}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-4 text-gray-500 font-mono text-sm">
          没有可用道具
        </div>
      )}
    </motion.div>
  );
}
