import React, { useRef } from 'react';
import { AgentNode } from '../types';
import { Trash2, Copy, Zap, Brain, HardDrive, Wrench, ShieldCheck, Send, AlertTriangle } from 'lucide-react';

interface NodeCardProps {
  node: AgentNode;
  isSelected: boolean;
  isValid?: boolean;
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
  isValid = true,
  onSelect,
  onDelete,
  onDuplicate,
  onStartConnect,
  onEndConnect,
  onDragStart,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const getNodeStyles = () => {
    switch (node.type) {
      case 'trigger':
        return {
          cardBg: 'bg-[#fffbeb]',
          border: 'border-amber-200/80',
          selectedBorder: 'border-amber-500 ring-1 ring-amber-400/30 shadow-[0_6px_20px_rgba(217,119,6,0.15)]',
          headerIconBg: 'bg-amber-100 border-amber-200/60',
          badge: 'text-amber-800 bg-amber-100 border-amber-200/50',
          titleColor: 'text-amber-800',
          textColor: 'text-slate-800',
          subtitleColor: 'text-amber-950 font-bold',
          previewBg: 'bg-white/90 border border-amber-200/40 text-amber-900',
          portRing: 'ring-[#fffbeb]',
        };
      case 'llm':
        return {
          cardBg: 'bg-[#f5f3ff]',
          border: 'border-violet-200/80',
          selectedBorder: 'border-violet-500 ring-1 ring-violet-400/30 shadow-[0_6px_20px_rgba(109,40,217,0.15)]',
          headerIconBg: 'bg-violet-100 border-violet-200/60',
          badge: 'text-violet-800 bg-violet-100 border-violet-200/50',
          titleColor: 'text-violet-800',
          textColor: 'text-slate-800',
          subtitleColor: 'text-violet-950 font-bold',
          previewBg: 'bg-white/90 border border-violet-200/40 text-violet-900',
          portRing: 'ring-[#f5f3ff]',
        };
      case 'memory':
        return {
          cardBg: 'bg-[#f0fdf4]',
          border: 'border-emerald-200/80',
          selectedBorder: 'border-emerald-500 ring-1 ring-emerald-400/30 shadow-[0_6px_20px_rgba(4,120,87,0.15)]',
          headerIconBg: 'bg-emerald-100 border-emerald-200/60',
          badge: 'text-emerald-800 bg-emerald-100 border-emerald-200/50',
          titleColor: 'text-emerald-800',
          textColor: 'text-slate-800',
          subtitleColor: 'text-emerald-950 font-bold',
          previewBg: 'bg-white/90 border border-emerald-200/40 text-emerald-900',
          portRing: 'ring-[#f0fdf4]',
        };
      case 'tool':
        return {
          cardBg: 'bg-[#f0f9ff]',
          border: 'border-sky-200/80',
          selectedBorder: 'border-sky-500 ring-1 ring-sky-400/30 shadow-[0_6px_20px_rgba(3,105,161,0.15)]',
          headerIconBg: 'bg-sky-100 border-sky-200/60',
          badge: 'text-sky-800 bg-sky-100 border-sky-200/50',
          titleColor: 'text-sky-800',
          textColor: 'text-slate-800',
          subtitleColor: 'text-sky-950 font-bold',
          previewBg: 'bg-white/90 border border-sky-200/40 text-sky-900',
          portRing: 'ring-[#f0f9ff]',
        };
      case 'guardrail':
        return {
          cardBg: 'bg-[#fff1f2]',
          border: 'border-rose-200/80',
          selectedBorder: 'border-rose-500 ring-1 ring-rose-400/30 shadow-[0_6px_20px_rgba(190,24,74,0.15)]',
          headerIconBg: 'bg-rose-100 border-rose-200/60',
          badge: 'text-rose-800 bg-rose-100 border-rose-200/50',
          titleColor: 'text-rose-800',
          textColor: 'text-slate-800',
          subtitleColor: 'text-rose-950 font-bold',
          previewBg: 'bg-white/90 border border-rose-200/40 text-rose-900',
          portRing: 'ring-[#fff1f2]',
        };
      case 'action':
        return {
          cardBg: 'bg-[#faf5ff]',
          border: 'border-purple-200/80',
          selectedBorder: 'border-purple-500 ring-1 ring-purple-400/30 shadow-[0_6px_20px_rgba(109,40,217,0.15)]',
          headerIconBg: 'bg-purple-100 border-purple-200/60',
          badge: 'text-purple-800 bg-purple-100 border-purple-200/50',
          titleColor: 'text-purple-800',
          textColor: 'text-slate-800',
          subtitleColor: 'text-purple-950 font-bold',
          previewBg: 'bg-white/90 border border-purple-200/40 text-purple-900',
          portRing: 'ring-[#faf5ff]',
        };
      default:
        return {
          cardBg: 'bg-[#faf8f5]',
          border: 'border-slate-200',
          selectedBorder: 'border-slate-500 ring-1 ring-slate-400/30 shadow-[0_6px_20px_rgba(71,85,105,0.15)]',
          headerIconBg: 'bg-slate-100 border-slate-200',
          badge: 'text-slate-800 bg-slate-100 border-slate-200/50',
          titleColor: 'text-slate-800',
          textColor: 'text-slate-800',
          subtitleColor: 'text-slate-900 font-bold',
          previewBg: 'bg-white/90 border border-slate-200/40 text-slate-900',
          portRing: 'ring-[#faf8f5]',
        };
    }
  };

  const getNodeIcon = () => {
    switch (node.type) {
      case 'trigger':
        return <Zap className="w-3 h-3 text-amber-600" />;
      case 'llm':
        return <Brain className="w-3 h-3 text-violet-600" />;
      case 'memory':
        return <HardDrive className="w-3 h-3 text-emerald-600" />;
      case 'tool':
        return <Wrench className="w-3 h-3 text-sky-600" />;
      case 'guardrail':
        return <ShieldCheck className="w-3 h-3 text-rose-600" />;
      case 'action':
        return <Send className="w-3 h-3 text-purple-600" />;
      default:
        return <Brain className="w-3 h-3 text-violet-600" />;
    }
  };

  const style = getNodeStyles();
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
        if ((e.target as HTMLElement).closest('.nodrag')) return;
        onSelect(node.id);
        onDragStart(node.id, e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      className={`absolute select-none cursor-move p-2.5 rounded-xl border shadow-md transition-all duration-150 ${widthClass} ${
        !isValid
          ? 'bg-rose-50/50 border-rose-400 ring-2 ring-rose-250/20 shadow-[0_4px_12px_rgba(220,38,38,0.12)]'
          : isSelected
          ? `${style.selectedBorder} z-30 scale-[1.01]`
          : isLLM
          ? `${style.cardBg} ${style.border} hover:border-violet-400/80 shadow-xs z-20`
          : `${style.cardBg} ${style.border} hover:shadow-xs z-10`
      }`}
    >
      {/* Node Header */}
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className={`p-1 rounded-lg border ${style.headerIconBg}`}>
            {getNodeIcon()}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-wider ${style.titleColor}`}>
            {node.title}
          </span>
          {!isValid && (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse shrink-0" title="Invalid connection layout" />
          )}
        </div>

        <div className="flex items-center gap-1 nodrag">
          {isLLM && (
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${style.badge}`}>
              {node.config.model?.includes('gemini') ? 'Gemini 3.7' : node.config.model || 'GPT-4o'}
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(node);
            }}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-black/5 rounded transition-all"
            title="Duplicate node"
          >
            <Copy className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
            title="Delete node"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Subtitle / context description */}
      <div className={`text-xs ${style.subtitleColor} mb-1.5 truncate`}>
        {node.subtitle || node.config.triggerEvent || node.config.contextSource || node.config.toolName || 'Active Logic'}
      </div>

      {/* LLM System Prompt Preview (Reduced Vertical Size) */}
      {isLLM && (
        <div className={`h-11 rounded p-1.5 text-[10px] italic overflow-hidden line-clamp-2 leading-relaxed ${style.previewBg}`}>
          "{node.config.systemPrompt || 'Autonomous reasoning engine...'}"
        </div>
      )}

      {/* Tool details preview */}
      {node.type === 'tool' && (
        <div className={`rounded p-1 text-[10px] font-mono truncate ${style.previewBg}`}>
          ⚡ {node.config.toolAction || node.config.endpoint || 'API Request'}
        </div>
      )}

      {/* Memory details preview */}
      {node.type === 'memory' && (
        <div className={`rounded p-1 text-[10px] font-mono truncate ${style.previewBg}`}>
          💾 {node.config.collectionName || 'embeddings_v1'} (Top {node.config.topK || 4})
        </div>
      )}

      {/* Action details preview */}
      {node.type === 'action' && (
        <div className={`rounded p-1 text-[10px] font-mono truncate ${style.previewBg}`}>
          🚀 {node.config.destination || 'External Webhook'}
        </div>
      )}

      {/* Input / Output Anchor Connection Ports */}
      <div className="mt-2 flex justify-between items-center nodrag pt-1">
        {/* Left Input Port */}
        {node.type !== 'trigger' ? (
          <div
            id={`port-in-${node.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onEndConnect(node.id, 'in');
            }}
            className={`w-3 h-3 bg-slate-300 hover:bg-indigo-500 rounded-full ring-4 ${style.portRing} border border-slate-400 cursor-crosshair transition-all hover:scale-125`}
            title="Connect Input Port"
          />
        ) : (
          <div className="w-3 h-3" />
        )}

        {/* Status Indicator */}
        <div className="flex items-center gap-1 bg-white/40 border border-slate-200/40 rounded-full px-2 py-0.5 shadow-3xs">
          <span className={`w-1.5 h-1.5 rounded-full ${
            node.status === 'running' ? 'bg-amber-500 animate-pulse' :
            node.status === 'success' ? 'bg-emerald-500' :
            node.status === 'error' ? 'bg-rose-500' : 'bg-slate-400'
          }`} />
          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider font-sans">
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
            className={`w-3 h-3 bg-indigo-500 hover:bg-indigo-400 rounded-full ring-4 ${style.portRing} cursor-crosshair transition-all hover:scale-125 shadow-sm`}
            title="Drag from Output Port to Link"
          />
        ) : (
          <div className="w-3 h-3" />
        )}
      </div>
    </div>
  );
};

