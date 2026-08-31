import React from 'react';
import { X, Plus, Zap, Brain, HardDrive, Wrench, ShieldCheck, Send } from 'lucide-react';
import { ComponentPaletteItem, NodeType } from '../types';
import { COMPONENT_PALETTE } from '../data/presetAgents';

interface AddNodeModalProps {
  onAdd: (item: ComponentPaletteItem) => void;
  onClose: () => void;
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({ onAdd, onClose }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'Brain':
        return <Brain className="w-4 h-4" />;
      case 'HardDrive':
        return <HardDrive className="w-4 h-4" />;
      case 'Wrench':
        return <Wrench className="w-4 h-4" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4" />;
      case 'Send':
        return <Send className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-sm font-bold text-white">Add Agent Node</h3>
            <p className="text-xs text-slate-400">Choose a component node to place onto your active canvas</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Component Cards */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto">
          {COMPONENT_PALETTE.map((comp) => (
            <div
              key={comp.id}
              onClick={() => {
                onAdd(comp);
                onClose();
              }}
              className="p-3.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/60 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm active:scale-95"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 ${comp.bgColor} ${comp.color} rounded-lg flex items-center justify-center`}>
                  {getIcon(comp.iconName)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white">
                    {comp.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">{comp.category}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
                <span>Click to spawn</span>
                <Plus className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-125 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex justify-end bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
