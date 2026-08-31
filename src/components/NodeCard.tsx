import React, { useRef } from 'react';
import { AgentNode } from '../types';
import { Trash2, Copy, Zap, Brain, HardDrive, Wrench, ShieldCheck, Send } from 'lucide-react';

interface NodeCardProps {
  node: AgentNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (node: AgentNode) => void;
  onStartConnect: (fromNodeId: string, fromPort: string, e: React.MouseEvent) => void;
  onEndConnect: (toNodeId: string, toPort: string) => void;
  onDragStart: (nodeId: string, e: React.MouseEvent) => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onStartConnect,
  onEndConnect,
  onDragStart,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const getNodeIcon = () => {
    switch (node.type) {
      case 'trigger':
        return <Zap className="w-3 h-3 text-amber-400" />;
      case 'llm':
        return <Brain className="w-3 h-3 text-indigo-400" />;
      case 'memory':
        return <HardDrive className="w-3 h-3 text-emerald-400" />;
      case 'tool':
        return <Wrench className="w-3 h-3 text-sky-400" />;
      case 'guardrail':
        return <ShieldCheck className="w-3 h-3 text-rose-400" />;
      case 'action':
        return <Send className="w-3 h-3 text-purple-400" />;
      default:
        return <Brain className="w-3 h-3 text-indigo-400" />;
    }
  };

  const getBadgeColor = () => {
    switch (node.type) {
      case 'trigger':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'llm':
        return 'text-indigo-300 bg-indigo-500/20 border-indigo-500/30';
      case 'memory':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'tool':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'guardrail':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'action':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    }
  };

  const isLLM = node.type === 'llm';
  const widthClass = isLLM ? 'w-64' : 'w-52';

  return (
    <div
      ref={cardRef}
      id={`node-${node.id}`}
      style={{
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
      }}
      onMouseDown={(e) => {
        // Only trigger drag if not clicking on action buttons or ports
        if ((e.target as HTMLElement).closest('.nodrag')) return;
        onSelect(node.id);
        onDragStart(node.id, e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      className={`absolute select-none cursor-move p-4 bg-slate-900 rounded-xl shadow-2xl transition-shadow ${widthClass} ${
        isSelected
          ? 'border-2 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.3)] z-30'
          : isLLM
          ? 'border-2 border-indigo-500/70 z-20'
          : 'border-2 border-slate-700 hover:border-slate-600 z-10'
      }`}
    >
      {/* Node Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-slate-800 border border-slate-700">
            {getNodeIcon()}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {node.title}
          </span>
        </div>

        <div className="flex items-center gap-1 nodrag">
          {isLLM && (
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${getBadgeColor()}`}>
              {node.config.model?.includes('gemini') ? 'Gemini 3.7' : node.config.model || 'GPT-4o'}
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(node);
            }}
            className="p-1 text-slate-500 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
            title="Duplicate node"
          >
            <Copy className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            title="Delete node"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Subtitle / context description */}
      <div className="text-xs font-medium text-slate-200 mb-2 truncate">
        {node.subtitle || node.config.triggerEvent || node.config.contextSource || node.config.toolName || 'Active Logic'}
      </div>

      {/* LLM System Prompt Preview */}
      {isLLM && (
        <div className="h-16 bg-slate-900 rounded border border-slate-800 p-2 text-[10px] text-slate-400 italic overflow-hidden line-clamp-3 leading-relaxed">
          "{node.config.systemPrompt || 'Autonomous reasoning engine...'}"
        </div>
      )}

      {/* Tool details preview */}
      {node.type === 'tool' && (
        <div className="bg-slate-900 rounded border border-slate-800 p-1.5 text-[10px] text-sky-300 font-mono truncate">
          ⚡ {node.config.toolAction || node.config.endpoint || 'API Request'}
        </div>
      )}

      {/* Memory details preview */}
      {node.type === 'memory' && (
        <div className="bg-slate-900 rounded border border-slate-800 p-1.5 text-[10px] text-emerald-400 font-mono truncate">
          💾 {node.config.collectionName || 'embeddings_v1'} (Top {node.config.topK || 4})
        </div>
      )}

      {/* Action details preview */}
      {node.type === 'action' && (
        <div className="bg-slate-900 rounded border border-slate-800 p-1.5 text-[10px] text-purple-300 font-mono truncate">
          🚀 {node.config.destination || 'External Webhook'}
        </div>
      )}

      {/* Input / Output Anchor Connection Ports (as shown in design HTML) */}
      <div className="mt-3 flex justify-between items-center nodrag pt-1">
        {/* Left Input Port */}
        {node.type !== 'trigger' ? (
          <div
            id={`port-in-${node.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onEndConnect(node.id, 'in');
            }}
            className="w-3.5 h-3.5 bg-slate-700 hover:bg-indigo-400 rounded-full ring-4 ring-slate-900 cursor-crosshair transition-all hover:scale-125"
            title="Connect Input Port"
          />
        ) : (
          <div className="w-3.5 h-3.5" />
        )}

        {/* Status Indicator */}
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${
            node.status === 'running' ? 'bg-amber-400 animate-ping' :
            node.status === 'success' ? 'bg-emerald-400' :
            node.status === 'error' ? 'bg-rose-400' : 'bg-slate-600'
          }`} />
          <span className="text-[9px] text-slate-500 font-mono capitalize">
            {node.status}
          </span>
        </div>

        {/* Right Output Port */}
        {node.type !== 'action' ? (
          <div
            id={`port-out-${node.id}`}
            onMouseDown={(e) => {
              e.stopPropagation();
              onStartConnect(node.id, 'out', e);
            }}
            className="w-3.5 h-3.5 bg-indigo-500 hover:bg-indigo-400 rounded-full ring-4 ring-slate-900 cursor-crosshair transition-all hover:scale-125 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
            title="Drag from Output Port to Link"
          />
        ) : (
          <div className="w-3.5 h-3.5" />
        )}
      </div>
    </div>
  );
};
