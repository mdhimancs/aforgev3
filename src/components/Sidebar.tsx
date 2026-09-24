import React, { useState } from 'react';
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
  Cpu,
  Search
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const getPaletteItemStyles = (type: string) => {
    switch (type) {
      case 'trigger':
        return {
          cardBg: 'bg-[#fffbeb] hover:bg-[#fffdf5]',
          border: 'border-amber-200/80 hover:border-amber-400',
          iconBg: 'bg-amber-100 text-amber-700 border border-amber-200/50',
          titleColor: 'text-amber-900',
          categoryColor: 'text-amber-700/60',
          plusBg: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
        };
      case 'llm':
        return {
          cardBg: 'bg-[#f5f3ff] hover:bg-[#faf5ff]',
          border: 'border-violet-200/80 hover:border-violet-400',
          iconBg: 'bg-violet-100 text-violet-700 border border-violet-200/50',
          titleColor: 'text-violet-900',
          categoryColor: 'text-violet-700/60',
          plusBg: 'bg-violet-100 text-violet-700 hover:bg-violet-200',
        };
      case 'memory':
        return {
          cardBg: 'bg-[#f0fdf4] hover:bg-[#f5fbf7]',
          border: 'border-emerald-200/80 hover:border-emerald-400',
          iconBg: 'bg-emerald-100 text-emerald-700 border border-emerald-200/50',
          titleColor: 'text-emerald-900',
          categoryColor: 'text-emerald-700/60',
          plusBg: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
        };
      case 'tool':
        return {
          cardBg: 'bg-[#f0f9ff] hover:bg-[#f5faff]',
          border: 'border-sky-200/80 hover:border-sky-400',
          iconBg: 'bg-sky-100 text-sky-700 border border-sky-200/50',
          titleColor: 'text-sky-900',
          categoryColor: 'text-sky-700/60',
          plusBg: 'bg-sky-100 text-sky-700 hover:bg-sky-200',
        };
      case 'guardrail':
        return {
          cardBg: 'bg-[#fff1f2] hover:bg-[#fff5f6]',
          border: 'border-rose-200/80 hover:border-rose-400',
          iconBg: 'bg-rose-100 text-rose-700 border border-rose-200/50',
          titleColor: 'text-rose-900',
          categoryColor: 'text-rose-700/60',
          plusBg: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
        };
      case 'action':
        return {
          cardBg: 'bg-[#faf5ff] hover:bg-[#fdf9ff]',
          border: 'border-purple-200/80 hover:border-purple-400',
          iconBg: 'bg-purple-100 text-purple-700 border border-purple-200/50',
          titleColor: 'text-purple-900',
          categoryColor: 'text-purple-700/60',
          plusBg: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
        };
      default:
        return {
          cardBg: 'bg-white hover:bg-slate-50',
          border: 'border-slate-200 hover:border-slate-300',
          iconBg: 'bg-slate-100 text-slate-700 border border-slate-200',
          titleColor: 'text-slate-800',
          categoryColor: 'text-slate-500',
          plusBg: 'bg-slate-100 text-slate-500 hover:bg-slate-200',
        };
    }
  };

  const usagePercent = Math.min(Math.round((tokenUsage / maxTokensLimit) * 100), 100);

  const filteredComponents = COMPONENT_PALETTE.filter(
    (comp) =>
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside id="agent-components-sidebar" className="w-64 border-r border-slate-200/60 bg-white/45 p-4 flex flex-col gap-6 overflow-y-auto select-none">
      {/* Component Library */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Agent Components
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Click to Add</span>
        </div>

        {/* Stateful Search Bar */}
        <div className="relative mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter nodes..."
            className="w-full bg-white border border-slate-200 rounded-md pl-8 pr-12 py-1.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 transition-all shadow-3xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 hover:text-slate-700 font-mono font-bold cursor-pointer"
            >
              CLEAR
            </button>
          )}
        </div>

        <div className="space-y-2">
          {filteredComponents.map((comp) => {
            const style = getPaletteItemStyles(comp.type);
            return (
              <div
                key={comp.id}
                id={`palette-item-${comp.type}`}
                onClick={() => onAddComponent(comp)}
                className={`group p-2.5 rounded-lg border cursor-pointer transition-all duration-150 flex items-center justify-between shadow-xs active:scale-[0.98] ${style.cardBg} ${style.border}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded flex items-center justify-center text-xs shadow-inner ${style.iconBg}`}>
                    {getIcon(comp.iconName)}
                  </div>
                  <div>
                    <span className={`text-xs font-bold block transition-colors ${style.titleColor}`}>
                      {comp.name}
                    </span>
                    <span className={`text-[9px] font-mono uppercase tracking-wider font-extrabold block mt-0.5 ${style.categoryColor}`}>
                      {comp.category}
                    </span>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${style.plusBg}`}>
                  <Plus className="w-3 h-3" />
                </div>
              </div>
            );
          })}

          {filteredComponents.length === 0 && (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg">
              <p className="text-[11px] text-slate-400 font-medium">No matching components</p>
            </div>
          )}
        </div>
      </div>

      {/* Preset Blueprints */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
                className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                    : 'bg-white/50 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {preset.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 border border-slate-200/60">
                    {preset.version}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Usage Stats Panel (matching design theme) */}
      <div className="mt-auto p-4 bg-indigo-50/40 border border-indigo-100/80 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Usage Stats
          </p>
          <span className="text-[10px] text-slate-500 font-mono">{usagePercent}%</span>
        </div>
        <p className="text-xl font-bold text-indigo-900 tracking-tight">
          {(tokenUsage / 1000).toFixed(1)}k <span className="text-xs text-slate-500 font-normal">tokens</span>
        </p>
        <div className="w-full bg-slate-200/80 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${usagePercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
          <span>Gemini 3.7 Flash</span>
          <span>Max 100k</span>
        </div>
      </div>
    </aside>
  );
};
