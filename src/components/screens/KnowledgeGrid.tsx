import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, CheckCircle, ChevronRight, Lock, Skull } from 'lucide-react';
import { useRef } from 'react';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../../lib/constants';
import { useGameStore } from '../../stores';
import type { KnowledgeNode, NodeStatus } from '../../types';
import { CyberButton, GlitchText } from '../atoms';

export function KnowledgeGrid() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { knowledgeNodes, currentNode, selectNode, startBattle, setScreen } = useGameStore();

  // Draw connections between nodes
  const getConnections = () => {
    const connections: Array<{ from: KnowledgeNode; to: KnowledgeNode }> = [];
    
    knowledgeNodes.forEach((node) => {
      node.prerequisites.forEach((prereqId) => {
        const prereqNode = knowledgeNodes.find((n) => n.id === prereqId);
        if (prereqNode) {
          connections.push({ from: prereqNode, to: node });
        }
      });
    });
    
    return connections;
  };

  const connections = getConnections();

  const getNodeColor = (status: NodeStatus, isBoss: boolean) => {
    if (isBoss) return '#ff3333';
    switch (status) {
      case 'locked':
        return '#333333';
      case 'available':
        return '#39ff14';
      case 'completed':
        return '#00f0ff';
      default:
        return '#333333';
    }
  };

  const getNodeIcon = (status: NodeStatus, isBoss: boolean) => {
    if (isBoss) return <Skull className="w-6 h-6" />;
    switch (status) {
      case 'locked':
        return <Lock className="w-5 h-5" />;
      case 'available':
        return <AlertTriangle className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Lock className="w-5 h-5" />;
    }
  };

  const handleNodeClick = (node: KnowledgeNode) => {
    if (node.status === 'available') {
      selectNode(node.id);
    }
  };

  const handleStartBattle = () => {
    if (currentNode) {
      startBattle(currentNode.id);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-deep-void">
      {/* Background grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(57,255,20,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57,255,20,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Header */}
      <motion.header
        className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-neon-green/30 bg-deep-void/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <CyberButton variant="secondary" size="sm" onClick={() => setScreen('TITLE')}>
            <ArrowLeft size={16} className="mr-1" />
            返回
          </CyberButton>
          <div>
            <GlitchText intensity="low" className="text-xl font-mono font-bold text-neon-green">
              全息知识网络
            </GlitchText>
            <p className="text-xs text-gray-500 font-mono">THE KNOWLEDGE GRID // 赛博格里数据要塞</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-gray-500">
            已解锁: {knowledgeNodes.filter((n) => n.status !== 'locked').length} / {knowledgeNodes.length}
          </span>
          <span className="text-neon-green">
            已完成: {knowledgeNodes.filter((n) => n.isCompleted).length}
          </span>
        </div>
      </motion.header>

      {/* Main Grid Area */}
      <div className="relative flex h-[calc(100vh-80px)]">
        {/* SVG for connections and nodes */}
        <div className="flex-1 relative">
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 1 }}
          >
            {/* Connection Lines */}
            {connections.map((conn, index) => {
              const fromX = conn.from.position.x;
              const fromY = conn.from.position.y;
              const toX = conn.to.position.x;
              const toY = conn.to.position.y;
              
              const isUnlocked = conn.from.isCompleted || conn.from.status === 'completed';
              
              return (
                <motion.line
                  key={index}
                  x1={`${fromX}%`}
                  y1={`${fromY}%`}
                  x2={`${toX}%`}
                  y2={`${toY}%`}
                  stroke={isUnlocked ? '#39ff14' : '#333333'}
                  strokeWidth={isUnlocked ? 2 : 1}
                  strokeDasharray={isUnlocked ? '0' : '5,5'}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: isUnlocked ? 0.8 : 0.3 }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {knowledgeNodes.map((node, index) => {
            const nodeColor = getNodeColor(node.status, node.isBoss);
            const isSelected = currentNode?.id === node.id;
            const isClickable = node.status === 'available';

            return (
              <motion.div
                key={node.id}
                className={`absolute z-10 transform -translate-x-1/2 -translate-y-1/2 ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
                style={{
                  left: `${node.position.x}%`,
                  top: `${node.position.y}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
                whileHover={isClickable ? { scale: 1.1 } : {}}
                onClick={() => handleNodeClick(node)}
              >
                {/* Node Circle */}
                <motion.div
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                    isSelected ? 'ring-4 ring-neon-green ring-offset-2 ring-offset-deep-void' : ''
                  }`}
                  style={{
                    borderColor: nodeColor,
                    backgroundColor: `${nodeColor}20`,
                    boxShadow: node.status === 'available' ? `0 0 20px ${nodeColor}60` : 'none',
                  }}
                  animate={node.status === 'available' ? {
                    boxShadow: [
                      `0 0 20px ${nodeColor}40`,
                      `0 0 40px ${nodeColor}60`,
                      `0 0 20px ${nodeColor}40`,
                    ],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span style={{ color: nodeColor }}>
                    {getNodeIcon(node.status, node.isBoss)}
                  </span>
                </motion.div>

                {/* Node Label */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <p 
                    className="text-xs font-mono font-bold text-center"
                    style={{ color: nodeColor }}
                  >
                    {node.name}
                  </p>
                  <p className="text-[10px] text-gray-500 text-center font-mono">
                    Lv.{node.difficulty}
                  </p>
                </div>

                {/* Difficulty indicator */}
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{ 
                    backgroundColor: DIFFICULTY_COLORS[node.difficulty],
                    color: '#000',
                  }}
                >
                  {node.difficulty}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Side Panel - Node Details */}
        <motion.div
          className="w-80 border-l border-neon-green/30 bg-deep-void/90 backdrop-blur-sm p-6 overflow-y-auto"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          {currentNode ? (
            <>
              <div className="mb-6">
                <GlitchText 
                  intensity="low" 
                  className="text-xl font-mono font-bold mb-2"
                  style={{ color: DIFFICULTY_COLORS[currentNode.difficulty] }}
                >
                  {currentNode.name}
                </GlitchText>
                
                <div className="flex items-center gap-2 mb-4">
                  <span 
                    className="px-2 py-1 rounded text-xs font-mono"
                    style={{ 
                      backgroundColor: `${DIFFICULTY_COLORS[currentNode.difficulty]}20`,
                      color: DIFFICULTY_COLORS[currentNode.difficulty],
                    }}
                  >
                    {DIFFICULTY_LABELS[currentNode.difficulty]}
                  </span>
                  {currentNode.isBoss && (
                    <span className="px-2 py-1 rounded text-xs font-mono bg-warning-red/20 text-warning-red">
                      BOSS
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-400 font-mono leading-relaxed">
                  {currentNode.description}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-gray-500">知识实体:</span>
                  <span className="text-data-blue">{currentNode.questionCount}</span>
                </div>
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-gray-500">危险等级:</span>
                  <span style={{ color: DIFFICULTY_COLORS[currentNode.difficulty] }}>
                    {'★'.repeat(currentNode.difficulty)}{'☆'.repeat(5 - currentNode.difficulty)}
                  </span>
                </div>
              </div>

              {currentNode.prerequisites.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-gray-500 font-mono mb-2">前置节点:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentNode.prerequisites.map((prereqId) => {
                      const prereq = knowledgeNodes.find((n) => n.id === prereqId);
                      return (
                        <span 
                          key={prereqId}
                          className={`px-2 py-1 rounded text-xs font-mono ${
                            prereq?.isCompleted 
                              ? 'bg-neon-green/20 text-neon-green' 
                              : 'bg-gray-800 text-gray-500'
                          }`}
                        >
                          {prereq?.name || prereqId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <CyberButton
                variant="primary"
                size="lg"
                onClick={handleStartBattle}
                className="w-full"
              >
                开始入侵
                <ChevronRight className="ml-2" size={20} />
              </CyberButton>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 font-mono text-sm">
                选择一个可入侵的节点
              </p>
              <p className="text-gray-600 font-mono text-xs mt-2">
                绿色节点 = 可入侵
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500 font-mono mb-3 uppercase tracking-wider">图例</p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-600" />
                <span className="text-gray-500">锁定 (需解锁前置)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-neon-green" />
                <span className="text-neon-green">可入侵</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-data-blue" />
                <span className="text-data-blue">已完成</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning-red" />
                <span className="text-warning-red">BOSS节点</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
