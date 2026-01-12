// 页面：战场 (BattleField) - 核心战斗界面，包含构造体、敌人和答题区域
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useBattleSequence } from "../../hooks/useBattleSequence";
import { useGameStore } from "../../stores/useGameStore";
import type {
  AnsweredQuestion,
  BattleLogEntry,
  Construct,
  EnemySkill,
  EntropyEntity,
  Skill,
} from "../../types/game";
import { QuestionCard } from "../molecules/QuestionCard";

// 技能类型映射
const SKILL_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "主动技能", color: "text-neon-cyan" },
  ultimate: { label: "终极技能", color: "text-holographic-gold" },
  passive: { label: "被动技能", color: "text-stable" },
  damage_all: { label: "范围伤害", color: "text-glitch-red" },
  damage_single: { label: "单体伤害", color: "text-orange-400" },
  debuff_player: { label: "玩家减益", color: "text-purple-400" },
  self_buff: { label: "自身增益", color: "text-green-400" },
  heal_self: { label: "自我恢复", color: "text-emerald-400" },
  special: { label: "特殊效果", color: "text-yellow-400" },
};

// 计算 tooltip 位置的 hook，确保不超出窗口边界
const useTooltipPosition = (
  triggerRef: React.RefObject<HTMLDivElement | null>,
  isVisible: boolean,
  preferredWidth: number,
  estimatedHeight: number = 200
) => {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    arrowLeft: preferredWidth / 2,
    placement: "top" as "top" | "bottom",
  });

  useEffect(() => {
    if (!isVisible || !triggerRef.current) return;

    // 使用 requestAnimationFrame 避免级联渲染
    const rafId = requestAnimationFrame(() => {
      if (!triggerRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const padding = 8; // 距离窗口边缘的最小距离

      // 计算水平居中位置
      let x = triggerRect.left + triggerRect.width / 2 - preferredWidth / 2;

      // 确保不超出左边界
      if (x < padding) {
        x = padding;
      }
      // 确保不超出右边界
      if (x + preferredWidth > window.innerWidth - padding) {
        x = window.innerWidth - preferredWidth - padding;
      }

      // 计算垂直位置，优先显示在上方
      let y = triggerRect.top - estimatedHeight - 8;
      let placement: "top" | "bottom" = "top";

      // 如果上方空间不足，显示在下方
      if (y < padding) {
        y = triggerRect.bottom + 8;
        placement = "bottom";

        // 如果下方也不够，还是显示在上方但调整位置
        if (y + estimatedHeight > window.innerHeight - padding) {
          y = Math.max(padding, window.innerHeight - estimatedHeight - padding);
          placement = "top";
        }
      }

      // 计算箭头的相对位置
      const triggerCenterX = triggerRect.left + triggerRect.width / 2;
      let arrowLeft = triggerCenterX - x;
      // 确保箭头不会太靠边
      arrowLeft = Math.max(16, Math.min(arrowLeft, preferredWidth - 16));

      setPosition({ x, y, arrowLeft, placement });
    });

    return () => cancelAnimationFrame(rafId);
  }, [isVisible, triggerRef, preferredWidth, estimatedHeight]);

  return position;
};

// 技能悬浮提示组件（玩家技能）- 使用 Portal
const PlayerSkillTooltip: React.FC<{
  skill: Skill;
  children: React.ReactNode;
}> = ({ skill, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const typeInfo = SKILL_TYPE_LABELS[skill.type] || {
    label: skill.type,
    color: "text-gray-400",
  };
  const tooltipWidth = 256; // w-64 = 16rem = 256px

  const position = useTooltipPosition(triggerRef, isHovered, tooltipWidth, 180);

  const tooltipContent = isHovered && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="fixed pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        width: tooltipWidth,
        zIndex: 99999,
      }}
    >
      <div className="fui-panel p-3 border border-neon-cyan/50 shadow-lg shadow-neon-cyan/20 bg-deep-space">
        {/* 技能名称 */}
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-neon-cyan font-display font-bold text-sm">
            {skill.name}
          </h4>
          <span className={`text-[10px] font-mono ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
        </div>
        {skill.nameEn && (
          <div className="text-[10px] text-gray-500 font-mono mb-2">
            {skill.nameEn}
          </div>
        )}

        {/* 技能属性 */}
        <div className="flex gap-3 mb-2 text-[11px] font-mono">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">消耗:</span>
            <span className="text-holographic-gold">{skill.cost || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">冷却:</span>
            <span className="text-neon-cyan">{skill.cooldown}回合</span>
          </div>
        </div>

        {/* 技能描述 */}
        <div className="text-xs text-gray-300 leading-relaxed border-t border-gray-700/50 pt-2">
          {skill.description}
        </div>

        {/* 当前冷却状态 */}
        {skill.currentCooldown > 0 && (
          <div className="mt-2 text-[10px] font-mono text-glitch-red">
            ⏳ 剩余冷却：{skill.currentCooldown} 回合
          </div>
        )}
      </div>
      {/* 箭头 */}
      <div
        className={`absolute w-2 h-2 bg-deep-space border-neon-cyan/50 transform rotate-45 ${
          position.placement === "top"
            ? "-bottom-1 border-r border-b"
            : "-top-1 border-l border-t"
        }`}
        style={{ left: position.arrowLeft }}
      />
    </motion.div>
  );

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <AnimatePresence>{tooltipContent}</AnimatePresence>,
          document.body
        )}
    </div>
  );
};

// 敌人技能悬浮提示组件 - 使用 Portal
const EnemySkillTooltip: React.FC<{
  skill: EnemySkill;
  enemyDamage: number;
  children: React.ReactNode;
}> = ({ skill, enemyDamage, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const typeInfo = SKILL_TYPE_LABELS[skill.type] || {
    label: skill.type,
    color: "text-gray-400",
  };
  const tooltipWidth = 288; // w-72 = 18rem = 288px

  const position = useTooltipPosition(triggerRef, isHovered, tooltipWidth, 280);

  // 根据技能效果生成效果说明
  const getEffectDescription = () => {
    const effects: string[] = [];

    if (skill.effect.damageMultiplier && skill.effect.damageMultiplier > 0) {
      const damage = Math.floor(enemyDamage * skill.effect.damageMultiplier);
      effects.push(
        `💥 造成 ${damage} 点伤害 (${skill.effect.damageMultiplier}倍)`
      );
    }
    if (skill.effect.healPercent) {
      effects.push(`💚 恢复 ${skill.effect.healPercent}% 生命值`);
    }
    if (skill.effect.statusToApply) {
      const status = skill.effect.statusToApply;
      if (
        status.effectType === "entropy_erosion" &&
        skill.effect.specialEffect === "reduce_time_limit"
      ) {
        effects.push(`⚡ 损失 ${status.value} 点能量`);
      } else if (
        status.effectType === "entropy_erosion" &&
        skill.effect.specialEffect === "energy_drain"
      ) {
        effects.push(
          `💧 每回合损失 ${status.value} 能量，持续 ${status.duration} 回合`
        );
      } else if (status.effectType === "logic_lock") {
        effects.push(`🔒 逻辑死锁 ${status.duration} 回合`);
      } else if (status.effectType === "damage_boost") {
        effects.push(
          `📈 攻击力 +${status.value}，持续 ${status.duration} 回合`
        );
      } else if (status.effectType === "stunned") {
        effects.push(`💫 ${status.value}% 几率眩晕 ${status.duration} 回合`);
      }
    }
    if (skill.effect.specialEffect === "true_damage") {
      effects.push(`💀 真实伤害，无视护盾`);
    }
    if (skill.effect.specialEffect === "force_cooldown") {
      effects.push(`🔄 强制技能进入冷却`);
    }
    if (skill.effect.specialEffect === "drain_all_energy") {
      effects.push(`⚡ 清空目标全部能量`);
    }
    if (skill.effect.specialEffect === "execute_low_hp") {
      effects.push(`☠️ 对低血量目标额外伤害`);
    }
    if (skill.effect.specialEffect === "extend_cooldowns") {
      effects.push(`📋 延长所有技能冷却`);
    }
    if (skill.effect.specialEffect === "aoe_stun_chance") {
       effects.push(`💥 造成 40 点伤害`);
    }
    if (skill.effect.specialEffect === "scaling_damage_by_hp_lost") {
       effects.push(`💥 造成 50 点伤害`);
    }

    return effects;
  };

  const effectList = getEffectDescription();

  const tooltipContent = isHovered && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="fixed pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        width: tooltipWidth,
        zIndex: 99999,
      }}
    >
      <div className="fui-panel p-3 border border-glitch-red/50 shadow-lg shadow-glitch-red/20 bg-deep-space">
        {/* 技能名称 */}
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-glitch-red font-display font-bold text-sm">
            {skill.name}
          </h4>
          <span className={`text-[10px] font-mono ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
        </div>
        {skill.nameEn && (
          <div className="text-[10px] text-gray-500 font-mono mb-2">
            {skill.nameEn}
          </div>
        )}

        {/* 触发条件和冷却 */}
        <div className="flex gap-3 mb-2 text-[11px] font-mono">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">触发:</span>
            <span className="text-orange-400">
              {skill.triggerCondition?.type === "on_attack"
                ? "攻击时"
                : skill.triggerCondition?.type === "hp_below"
                ? `<${skill.triggerCondition.value}%HP`
                : skill.triggerCondition?.type === "on_hp_loss_threshold"
                ? `每损${skill.triggerCondition.value}%HP`
                : "特殊"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">冷却:</span>
            <span
              className={
                skill.cooldown === 0 ? "text-glitch-red" : "text-neon-cyan"
              }
            >
              {skill.cooldown === 0 ? "无" : `${skill.cooldown}回合`}
            </span>
          </div>
        </div>

        {/* 技能描述 */}
        <div className="text-xs text-gray-300 leading-relaxed border-t border-gray-700/50 pt-2 mb-2">
          {skill.description}
        </div>

        {/* 具体效果列表 */}
        {effectList.length > 0 && (
          <div className="border-t border-gray-700/50 pt-2">
            <div className="text-[10px] text-gray-500 mb-1">技能效果:</div>
            <div className="space-y-1">
              {effectList.map((effect, idx) => (
                <div key={idx} className="text-[11px] text-gray-300 font-mono">
                  {effect}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 当前冷却状态 */}
        {skill.currentCooldown > 0 && (
          <div className="mt-2 text-[10px] font-mono text-yellow-500 border-t border-gray-700/50 pt-2">
            ⏳ 剩余冷却：{skill.currentCooldown} 回合
          </div>
        )}
      </div>
      {/* 箭头 */}
      <div
        className={`absolute w-2 h-2 bg-deep-space border-glitch-red/50 transform rotate-45 ${
          position.placement === "top"
            ? "-bottom-1 border-r border-b"
            : "-top-1 border-l border-t"
        }`}
        style={{ left: position.arrowLeft }}
      />
    </motion.div>
  );

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <AnimatePresence>{tooltipContent}</AnimatePresence>,
          document.body
        )}
    </div>
  );
};

// 构造体肖像组件
const ConstructCard: React.FC<{
  construct: Construct;
  onUseSkill: (constructId: string, skillId: string) => void;
  isActive: boolean;
  onSelect: (id: string) => void;
  isHighlighted?: boolean;
  isShaking?: boolean;
}> = ({ construct, onUseSkill, isActive, onSelect, isHighlighted, isShaking }) => {
  const hpPercent = (construct.hp / construct.maxHp) * 100;
  const energyPercent = (construct.energy / construct.maxEnergy) * 100;

  return (
    <motion.div
      className={`fui-panel p-6 relative shrink-0 ${
        construct.isDead
          ? "opacity-40 grayscale cursor-not-allowed"
          : "cursor-pointer"
      } ${isShaking ? "shake-effect" : ""} ${isHighlighted ? "highlight-effect" : ""}`}
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      onClick={() => !construct.isDead && onSelect(construct.id)}
      whileHover={!construct.isDead ? { scale: 1.02 } : {}}
      whileTap={!construct.isDead ? { scale: 0.98 } : {}}
      style={{
        boxShadow: isActive
          ? "0 0 30px rgba(0, 243, 255, 0.4), inset 0 0 20px rgba(0, 243, 255, 0.1)"
          : !construct.isDead
          ? "0 0 10px rgba(0, 243, 255, 0.1)"
          : undefined,
        overflow: "visible",
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
          <h3 className="text-neon-cyan font-display font-bold text-sm truncate">
            {construct.name}
          </h3>
          <span className="text-[12px] text-gray-500 font-mono truncate block">
            {construct.model}
          </span>
        </div>
        {/* 状态指示器 - 显示出战状态 */}
        <div className="flex items-center gap-1 shrink-0">
          {!construct.isDead && (
            <>
              {isActive ? (
                <span className="text-xs text-neon-cyan font-mono">
                  ⚔️ 出战中
                </span>
              ) : (
                <span className="text-xs text-gray-500 font-mono hover:text-neon-cyan/70">
                  点击出战
                </span>
              )}
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isActive ? "bg-neon-cyan" : "bg-stable"
                }`}
              />
            </>
          )}
        </div>
      </div>

      {/* 生命值条 */}
      <div className="mb-1">
        <div className="flex justify-between text-[12px] font-mono mb-0.5">
          <span className="text-gray-500">HP</span>
          <span className={hpPercent < 30 ? "text-glitch-red" : "text-stable"}>
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
          <span className="text-holographic-gold">
            {construct.energy}/{construct.maxEnergy}
          </span>
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

      {/* 攻击力 */}
      <div className="mb-2 flex items-center gap-2 text-[12px] font-mono">
        <span className="text-gray-500">攻击力</span>
        <span className="text-orange-400 font-bold">{construct.attack}</span>
      </div>

      {/* 技能 - 使用网格布局 */}
      <div className="grid grid-cols-2 gap-1">
        {construct.skills.map((skill: Skill) => {
          const canUse =
            !construct.isDead &&
            skill.currentCooldown === 0 &&
            construct.energy >= (skill.cost || 0);

          return (
            <PlayerSkillTooltip key={skill.id} skill={skill}>
              <motion.button
                onClick={() => canUse && onUseSkill(construct.id, skill.id)}
                disabled={!canUse}
                className={`
                                    py-1.5 px-2 text-[14px] font-mono text-center
                                    border transition-all duration-300 w-full
                                    ${
                                      canUse
                                        ? "border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/20 hover:border-neon-cyan"
                                        : "border-gray-700 text-gray-600 cursor-not-allowed"
                                    }
                                `}
                whileHover={canUse ? { scale: 1.05 } : {}}
                whileTap={canUse ? { scale: 0.95 } : {}}
              >
                {skill.currentCooldown > 0 ? (
                  <span className="text-gray-500">
                    CD:{skill.currentCooldown}
                  </span>
                ) : (
                  <span className="truncate block">{skill.name}</span>
                )}
              </motion.button>
            </PlayerSkillTooltip>
          );
        })}
      </div>
    </motion.div>
  );
};

// 熵实体组件
const EntropyCard: React.FC<{
  entity: EntropyEntity;
  isSelected: boolean;
  onSelect: (id: string) => void;
  hasMultipleEnemies: boolean;
  isHighlighted?: boolean;
  isShaking?: boolean;
}> = ({ entity, isSelected, onSelect, hasMultipleEnemies, isHighlighted, isShaking }) => {
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
      className={`fui-panel p-4 relative border-r-2 border-l-0 ${
        isSelected
          ? "border-neon-cyan border-2 bg-neon-cyan/10"
          : "border-glitch-red/50"
      } ${
        hasMultipleEnemies ? "cursor-pointer hover:border-neon-cyan/70" : ""
      } ${isShaking ? "shake-effect" : ""} ${isHighlighted ? "highlight-effect" : ""}`}
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      onClick={() => hasMultipleEnemies && onSelect(entity.id)}
      whileHover={hasMultipleEnemies ? { scale: 1.02 } : {}}
      whileTap={hasMultipleEnemies ? { scale: 0.98 } : {}}
      style={{
        boxShadow: isSelected
          ? "0 0 30px rgba(0, 243, 255, 0.4), inset 0 0 15px rgba(0, 243, 255, 0.1)"
          : "0 0 30px rgba(255, 0, 60, 0.2)",
      }}
    >
      {/* 腐蚀特效遮罩 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 60, 0.05) 2px, rgba(255, 0, 60, 0.05) 4px)",
        }}
        animate={{
          backgroundPosition: ["0 0", "0 8px"],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* 头部 */}
      <div className="flex justify-between items-start mb-3 relative gap-2">
        <div className="min-w-0 flex-1">
          <h3
            className={`font-display font-bold text-base glitch-text truncate ${
              isSelected ? "text-neon-cyan" : "text-glitch-red"
            }`}
            data-text={entity.name}
          >
            {entity.name}
          </h3>
          <span className="text-xs text-gray-500 font-mono truncate block">
            {entity.form}
          </span>
        </div>
        {/* 威胁/锁定指示器 */}
        <div className="flex items-center gap-1 shrink-0">
          {isSelected ? (
            <>
              <span className="text-xs text-neon-cyan font-mono">🎯 锁定</span>
              <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
            </>
          ) : (
            <>
              <span className="text-xs text-glitch-red/60 font-mono">威胁</span>
              <div className="w-2 h-2 bg-glitch-red rounded-full animate-pulse" />
            </>
          )}
        </div>
      </div>

      {/* 生命值条 */}
      <div className="relative mb-2">
        <div className="flex justify-between text-xs font-mono mb-1">
          <span className="text-gray-500">完整性</span>
          <span className="text-glitch-red">
            {entity.hp}/{entity.maxHp}
          </span>
        </div>
        <div className="energy-bar">
          <motion.div
            className="energy-bar-fill entropy"
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* 攻击力 */}
      <div className="mb-2 flex items-center gap-2 text-[12px] font-mono">
        <span className="text-gray-500">攻击力</span>
        <span className="text-orange-400 font-bold">{entity.damage}</span>
      </div>

      {/* 敌人技能显示 */}
      {entity.skill && (
        <EnemySkillTooltip skill={entity.skill} enemyDamage={entity.damage}>
          <div className="mt-2 pt-2 border-t border-gray-700/50 cursor-help">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-[10px] text-gray-500 shrink-0">技能</span>
                <span
                  className={`text-xs font-mono truncate ${
                    entity.skill.currentCooldown === 0
                      ? "text-glitch-red animate-pulse"
                      : "text-gray-400"
                  }`}
                >
                  {entity.skill.name}
                </span>
              </div>
              <div className="shrink-0">
                {entity.skill.cooldown === 0 ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-glitch-red/20 text-glitch-red border border-glitch-red/30 rounded">
                    常驻
                  </span>
                ) : entity.skill.currentCooldown === 0 ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-glitch-red/20 text-glitch-red border border-glitch-red/30 rounded animate-pulse">
                    就绪
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-800 text-gray-400 border border-gray-600 rounded">
                    CD:{entity.skill.currentCooldown}
                  </span>
                )}
              </div>
            </div>
            {/* 技能类型标签 */}
            <div className="flex gap-1 mt-1">
              <span
                className={`text-[9px] font-mono px-1 py-0.5 rounded ${
                  entity.skill.type === "damage_all"
                    ? "bg-glitch-red/10 text-glitch-red/80"
                    : entity.skill.type === "damage_single"
                    ? "bg-orange-500/10 text-orange-400/80"
                    : entity.skill.type === "debuff_player"
                    ? "bg-purple-500/10 text-purple-400/80"
                    : entity.skill.type === "self_buff"
                    ? "bg-green-500/10 text-green-400/80"
                    : entity.skill.type === "heal_self"
                    ? "bg-emerald-500/10 text-emerald-400/80"
                    : "bg-gray-600/10 text-gray-400/80"
                }`}
              >
                {entity.skill.type === "damage_all"
                  ? "范围伤害"
                  : entity.skill.type === "damage_single"
                  ? "单体伤害"
                  : entity.skill.type === "debuff_player"
                  ? "玩家减益"
                  : entity.skill.type === "self_buff"
                  ? "自身增益"
                  : entity.skill.type === "heal_self"
                  ? "自我恢复"
                  : entity.skill.type === "special"
                  ? "特殊效果"
                  : entity.skill.type}
              </span>
              <span className="text-[9px] text-gray-600 italic">
                悬浮查看详情
              </span>
            </div>
          </div>
        </EnemySkillTooltip>
      )}

      {/* Boss多技能显示 */}
      {entity.skills && entity.skills.length > 1 && (
        <div className="mt-1 pt-1 border-t border-gray-700/30">
          <div className="text-[9px] text-gray-500 mb-1">额外技能</div>
          {entity.skills.slice(1).map((skill, idx) => (
            <EnemySkillTooltip
              key={skill.id || idx}
              skill={skill}
              enemyDamage={entity.damage}
            >
              <div className="flex items-center justify-between gap-1 text-[10px] py-0.5 cursor-help hover:bg-gray-800/30 rounded px-1 -mx-1">
                <span className="text-gray-400 truncate">{skill.name}</span>
                <span className="text-gray-500 shrink-0">
                  {skill.triggerCondition?.type === "hp_below"
                    ? `<${skill.triggerCondition.value}%HP`
                    : skill.triggerCondition?.type === "on_hp_loss_threshold"
                    ? `每损${skill.triggerCondition.value}%HP`
                    : "特殊"}
                </span>
              </div>
            </EnemySkillTooltip>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// 战斗日志组件 - 使用固定高度，不使用绝对定位避免重叠
const BattleLog: React.FC<{ logs: BattleLogEntry[]; showAll?: boolean }> = ({
  logs,
  showAll = false,
}) => {
  const { currentTheme } = useGameStore();
  const labels = currentTheme.pageLabels.battle;

  const displayLogs = showAll
    ? logs.slice().reverse()
    : logs.slice().reverse().slice(0, 8);

  return (
    <motion.div
      className="fui-panel p-3 h-full overflow-hidden flex flex-col"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/50 shrink-0">
        <div className="w-2 h-2 bg-neon-cyan animate-pulse rounded-full" />
        <span className="text-xs font-mono text-neon-cyan">
          {labels.battleLogLabel}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {displayLogs.map((log) => (
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

// 错题本组件
const MistakesBook: React.FC<{ answeredQuestions: AnsweredQuestion[] }> = ({
  answeredQuestions,
}) => {
  // 辅助函数：获取选项文本
  const getOptionText = (
    options: string[],
    indexOrIndices: number | number[]
  ): string => {
    if (Array.isArray(indexOrIndices)) {
      return indexOrIndices
        .map((i) => `${String.fromCharCode(65 + i)}. ${options[i]}`)
        .join("\n");
    }
    return `${String.fromCharCode(65 + indexOrIndices)}. ${
      options[indexOrIndices]
    }`;
  };

  return (
    <motion.div
      className="fui-panel p-3 h-full overflow-hidden flex flex-col"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/50 shrink-0">
        <div className="w-2 h-2 bg-glitch-red animate-pulse rounded-full" />
        <span className="text-xs font-mono text-glitch-red">
          错题本 / 答题记录
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {answeredQuestions.length === 0 ? (
          <div className="text-gray-500 text-xs text-center mt-10 font-mono">
            暂无答题记录
          </div>
        ) : (
          answeredQuestions
            .slice()
            .reverse()
            .map((record, idx) => (
              <div
                key={idx}
                className={`p-3 rounded border ${
                  record.isCorrect
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-glitch-red/30 bg-glitch-red/5"
                }`}
              >
                <div className="text-xs text-gray-200 mb-2 font-bold font-display leading-relaxed">
                  {record.question.text}
                </div>
                
                <div className="space-y-1.5">
                  {/* 如果答错了，显示用户的错误选择 */}
                  {!record.isCorrect && (
                    <div className="text-[11px] font-mono border-l-2 border-glitch-red pl-2 py-0.5 bg-glitch-red/10">
                      <div className="text-glitch-red font-bold mb-0.5">您的选择:</div>
                      <div className="text-gray-300 whitespace-pre-wrap">
                        {getOptionText(record.question.options, record.userAnswer)}
                      </div>
                    </div>
                  )}

                  {/* 显示正确答案 (无论对错都显示，或者只在错的时候显示？通常错题本只关注错题，但这里是答题记录，所以对的也可以显示) */}
                  {/* 如果答对了，只显示"回答正确"，如果答错了，显示正确答案 */}
                  {record.isCorrect ? (
                     <div className="text-[11px] font-mono border-l-2 border-green-500 pl-2 py-0.5 bg-green-500/10">
                        <div className="text-green-400 font-bold mb-0.5 flex items-center gap-1">
                            <span>✔</span> 回答正确
                        </div>
                        <div className="text-gray-300 whitespace-pre-wrap">
                            {getOptionText(record.question.options, record.userAnswer)}
                        </div>
                     </div>
                  ) : (
                    <div className="text-[11px] font-mono border-l-2 border-green-500 pl-2 py-0.5 bg-green-500/10">
                      <div className="text-green-400 font-bold mb-0.5">正确答案:</div>
                      <div className="text-gray-300 whitespace-pre-wrap">
                        {getOptionText(
                          record.question.options,
                          record.question.correctOptionIndex
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
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
    currentTheme,
    selectedTargetId,
    setSelectedTarget,
    activeConstructId,
    setActiveConstruct,
    answeredQuestions,
    highlightedEntityId,
    shakingEntityIds,
  } = useGameStore();
  const labels = currentTheme.pageLabels.battle;

  // 计算存活的敌人数量
  const aliveEnemies = entropyEntities.filter((e) => !e.isDead);
  const hasMultipleEnemies = aliveEnemies.length > 1;

  // 如果当前选中的敌人已死亡，自动选择第一个存活敌人
  React.useEffect(() => {
    if (selectedTargetId) {
      const selectedEnemy = entropyEntities.find(
        (e) => e.id === selectedTargetId
      );
      if (!selectedEnemy || selectedEnemy.isDead) {
        const firstAlive = aliveEnemies[0];
        setSelectedTarget(firstAlive?.id || null);
      }
    } else if (aliveEnemies.length === 1) {
      // 只有一个敌人时自动选中
      setSelectedTarget(aliveEnemies[0].id);
    }
  }, [entropyEntities, selectedTargetId, aliveEnemies, setSelectedTarget]);

  // 计算存活的构造体
  const aliveConstructs = constructs.filter((c) => !c.isDead);

  // 如果当前选中的出战角色已死亡或未选择，自动选择第一个存活角色
  React.useEffect(() => {
    if (activeConstructId) {
      const activeConstruct = constructs.find(
        (c) => c.id === activeConstructId
      );
      if (!activeConstruct || activeConstruct.isDead) {
        // 当前选中角色死亡，切换到第一个存活角色
        const firstAlive = aliveConstructs[0];
        if (firstAlive) {
          setActiveConstruct(firstAlive.id);
        }
      }
    } else if (aliveConstructs.length > 0) {
      // 没有选中任何角色，默认选择第一个存活角色
      setActiveConstruct(aliveConstructs[0].id);
    }
  }, [constructs, activeConstructId, aliveConstructs, setActiveConstruct]);

  const {
    handleAnswerSubmit,
    statusMessage,
    isProcessing,
    selectedAnswerIndex,
    isCorrect,
    timeRemaining,
    isTimedOut,
    isPaused,
    togglePause,
  } = useBattleSequence();

  return (
    <div className="w-full h-screen bg-deep-space relative overflow-hidden flex flex-col">
      {/* 背景特效 */}
      <div className="hex-grid-bg opacity-30" />
      <div className="data-stream opacity-20" />

      {/* 暂停遮罩 */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-8 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* 左侧：战斗日志 */}
            <div className="w-1/4 h-3/4 min-w-[300px] max-w-[400px]">
              <BattleLog logs={battleLog} showAll={true} />
            </div>

            {/* 中间：暂停菜单 */}
            <motion.div
              className="fui-panel p-8 text-center min-w-[300px]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-4xl font-display text-holographic-gold mb-4">
                ⏸ 游戏暂停
              </div>
              <div className="text-gray-400 font-mono text-sm mb-6">
                倒计时已暂停
              </div>
              <motion.button
                onClick={togglePause}
                className="px-8 py-3 bg-holographic-gold/20 border-2 border-holographic-gold text-holographic-gold font-mono text-lg rounded hover:bg-holographic-gold/30 transition-all w-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ▶ 继续游戏
              </motion.button>
              <div className="mt-4 text-xs text-gray-600 font-mono">
                按空格键也可以继续
              </div>
            </motion.div>

            {/* 右侧：错题本 */}
            <div className="w-1/4 h-3/4 min-w-[300px] max-w-[400px]">
              <MistakesBook answeredQuestions={answeredQuestions} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 顶部栏 */}
      <motion.div
        className="flex justify-between items-center p-4 fui-panel m-2 rounded relative z-20"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => setScreen("GRAND_UNIFICATION_SIM")}
            className="hex-button text-xs py-2 px-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {labels.retreatButton}
          </motion.button>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-mono text-sm">
              {labels.turnLabel}
            </span>
            <span className="text-2xl font-display text-neon-cyan font-bold">
              {currentTurn}
            </span>
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

        {/* 处理指示器 和 暂停按钮 */}
        <div className="flex items-center gap-3">
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

          {/* 暂停按钮 */}
          <motion.button
            onClick={togglePause}
            className={`
                            px-4 py-2 text-sm font-mono rounded border transition-all duration-300
                            ${
                              isPaused
                                ? "bg-holographic-gold/20 border-holographic-gold text-holographic-gold hover:bg-holographic-gold/30"
                                : "bg-gray-800/50 border-gray-600 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan"
                            }
                        `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPaused ? "▶ 继续" : "⏸ 暂停"}
          </motion.button>
        </div>
      </motion.div>

      {/* 主战斗区域 - 使用 Grid 布局确保各区域不重叠 */}
      <div className="flex-1 grid grid-cols-[350px_1fr_350px] grid-rows-[1fr] gap-3 p-4 overflow-hidden">
        {/* 左侧：构造体 - 跨两行 */}
        <motion.div
          className="flex flex-col gap-1 overflow-y-auto pr-2"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-[25px] font-mono text-neon-cyan mb-2 flex items-center gap-2 shrink-0">
            <div className="w-2 h-2 bg-neon-cyan rounded-full" />
            {labels.constructsLabel}
          </div>
          {constructs.map((construct) => (
            <ConstructCard
              key={construct.id}
              construct={construct}
              onUseSkill={useSkill}
              isActive={activeConstructId === construct.id}
              onSelect={setActiveConstruct}
              isHighlighted={highlightedEntityId === construct.id}
              isShaking={shakingEntityIds.includes(construct.id)}
            />
          ))}
        </motion.div>

        {/* 中间上方：问题卡片区域 */}
        <div className="flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {currentQuestion && battleState === "PLAYER_TURN" && (
              <QuestionCard
                question={currentQuestion}
                onAnswer={handleAnswerSubmit}
                disabled={isProcessing}
                selectedIndex={selectedAnswerIndex}
                isCorrect={isCorrect}
                timeRemaining={timeRemaining}
                isTimedOut={isTimedOut}
              />
            )}
          </AnimatePresence>
        </div>

        {/* 右侧：熵实体 - 跨两行 */}
        <motion.div
          className="flex flex-col gap-3 overflow-y-auto pl-2"
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
              <EntropyCard
                key={entity.id}
                entity={entity}
                isSelected={selectedTargetId === entity.id}
                onSelect={(id) => setSelectedTarget(id)}
                hasMultipleEnemies={hasMultipleEnemies}
                isHighlighted={highlightedEntityId === entity.id}
                isShaking={shakingEntityIds.includes(entity.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>


      </div>

      {/* 角落装饰 */}
      <div className="absolute top-16 left-4 w-12 h-12 border-t border-l border-neon-cyan/20 pointer-events-none" />
      <div className="absolute top-16 right-4 w-12 h-12 border-t border-r border-neon-cyan/20 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b border-l border-neon-cyan/20 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b border-r border-neon-cyan/20 pointer-events-none" />
    </div>
  );
};
