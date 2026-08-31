import React from 'react';
import {
  Zap,
  Brain,
  HardDrive,
  Wrench,
  ShieldCheck,
  Send,
  Plus,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { ComponentPaletteItem, AgentWorkflow, NodeType } from '../types';
import { COMPONENT_PALETTE } from '../data/presetAgents';

interface SidebarProps {
  onAddComponent: (item: ComponentPaletteItem) => void;
  tokenUsage: number;
  maxTokensLimit: number;
  presetWorkflows: AgentWorkflow[];
  currentWorkflowId: string;
  onSelectPreset: (wf: AgentWorkflow) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onAddComponent,
  tokenUsage,
  maxTokensLimit,
  presetWorkflows,
  currentWorkflowId,
  onSelectPreset
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-3.5 h-3.5" />;
      case 'Brain':
        return <Brain className="w-3.5 h-3.5" />;
      case 'HardDrive':
        return <HardDrive className="w-3.5 h-3.5" />;
      case 'Wrench':
        return <Wrench className="w-3.5 h-3.5" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'Send':
        return <Send className="w-3.5 h-3.5" />;
      default:
        return <Cpu className="w-3.5 h-3.5" />;
    }
  };

  const usagePercent = Math.min(Math.round((tokenUsage / maxTokensLimit) * 100), 100);

  return (
    <aside id="agent-components-sidebar" className="w-64 border-r border-slate-800 bg-slate-900/30 p-4 flex flex-col gap-6 overflow-y-auto select-none">
      {/* Component Library */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Agent Components
          </h3>
          <span className="text-[10px] text-slate-600 font-mono">Click to Add</span>
        </div>

        <div className="space-y-2">
          {COMPONENT_PALETTE.map((comp) => (
            <div
              key={comp.id}
              id={`palette-item-${comp.type}`}
              onClick={() => onAddComponent(comp)}
              className="group p-2.5 bg-slate-800/80 hover:bg-slate-700/90 rounded-lg border border-slate-700/80 hover:border-indigo-500/50 cursor-pointer transition-all duration-150 flex items-center justify-between shadow-sm active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 ${comp.bgColor} ${comp.color} rounded flex items-center justify-center text-xs shadow-inner`}>
                  {getIcon(comp.iconName)}
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white block">
                    {comp.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {comp.category}
                  </span>
                </div>
              </div>

              <div className="w-5 h-5 rounded-full bg-slate-700/50 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 text-slate-500 flex items-center justify-center transition-colors">
                <Plus className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preset Blueprints */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Prebuilt Blueprints
        </h3>

        <div className="space-y-2">
          {presetWorkflows.map((preset) => {
            const isSelected = preset.id === currentWorkflowId;
            return (
              <button
                key={preset.id}
                id={`preset-btn-${preset.id}`}
                onClick={() => onSelectPreset(preset)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-300' : 'text-slate-300'}`}>
                    {preset.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-900/80 rounded text-slate-400 border border-slate-800">
                    {preset.version}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Usage Stats Panel (matching design theme) */}
      <div className="mt-auto p-4 bg-indigo-900/10 border border-indigo-500/20 rounded-xl shadow-inner">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Usage Stats
          </p>
          <span className="text-[10px] text-slate-500 font-mono">{usagePercent}%</span>
        </div>
        <p className="text-xl font-semibold text-white tracking-tight">
          {(tokenUsage / 1000).toFixed(1)}k <span className="text-xs text-slate-500 font-normal">tokens</span>
        </p>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-indigo-500 h-full rounded-full shadow-[0_0_8px_rgba(99,102,241,0.7)] transition-all duration-500"
            style={{ width: `${usagePercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
          <span>Gemini 3.7 Flash</span>
          <span>Max 100k</span>
        </div>
      </div>
    </aside>
  );
};
