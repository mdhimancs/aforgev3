import React from 'react';
import { AgentNode } from '../types';
import { Sliders, Brain, Sparkles, BookOpen, Layers, Terminal } from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode: AgentNode | null;
  onUpdateConfig: (nodeId: string, updatedConfig: Partial<AgentNode['config']>) => void;
  onUpdateTitle: (nodeId: string, title: string, subtitle?: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  onUpdateConfig,
  onUpdateTitle,
}) => {
  if (!selectedNode) {
    return (
      <div id="empty-properties-panel" className="p-6 text-center text-slate-500 flex flex-col items-center justify-center h-64 select-none">
        <Sliders className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
        <p className="text-xs font-medium text-slate-400">No Node Selected</p>
        <p className="text-[11px] text-slate-600 mt-1 max-w-[200px]">
          Click any component on the canvas to configure its model parameters, system prompt, and tools.
        </p>
      </div>
    );
  }

  const { type, config } = selectedNode;

  return (
    <div id="node-properties-panel" className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-indigo-400" />
          Node Properties
        </h3>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          {type}
        </span>
      </div>

      <div className="space-y-4">
        {/* Node Title & Subtitle */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Display Label
          </label>
          <input
            type="text"
            value={selectedNode.title}
            onChange={(e) => onUpdateTitle(selectedNode.id, e.target.value, selectedNode.subtitle)}
            className="w-full p-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* LLM Model Configuration */}
        {type === 'llm' && (
          <>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Model Provider
              </label>
              <select
                value={config.model || 'gemini-3.7-flash'}
                onChange={(e) => onUpdateConfig(selectedNode.id, { model: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="gemini-3.7-flash">Google / Gemini 3.7 Flash (Fast & Agentic)</option>
                <option value="gemini-3.1-pro-preview">Google / Gemini 3.1 Pro (Deep Reasoning)</option>
                <option value="gpt-4o">OpenAI / GPT-4o</option>
                <option value="claude-3-5-sonnet">Anthropic / Claude 3.5 Sonnet</option>
                <option value="deepseek-r1">DeepSeek / R1 (Reasoning)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Temperature ({config.temperature ?? 0.7})
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {(config.temperature ?? 0.7) < 0.4 ? 'Deterministic' : (config.temperature ?? 0.7) > 0.7 ? 'Creative' : 'Balanced'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.temperature ?? 0.7}
                onChange={(e) => onUpdateConfig(selectedNode.id, { temperature: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  System Prompt
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => onUpdateConfig(selectedNode.id, {
                      systemPrompt: 'You are a Tier-1 customer support triage agent. Read incoming inquiry, search product knowledge base, verify refund guidelines, and reply politely.'
                    })}
                    className="text-[9px] text-indigo-400 hover:text-indigo-300 font-mono hover:underline"
                    title="Insert Support Preset"
                  >
                    Preset: Support
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={() => onUpdateConfig(selectedNode.id, {
                      systemPrompt: 'You are an autonomous research analyst. Gather live information using web search, cite sources accurately, and structure findings into concise bullet points.'
                    })}
                    className="text-[9px] text-indigo-400 hover:text-indigo-300 font-mono hover:underline"
                    title="Insert Research Preset"
                  >
                    Preset: Analyst
                  </button>
                </div>
              </div>
              <textarea
                value={config.systemPrompt || ''}
                onChange={(e) => onUpdateConfig(selectedNode.id, { systemPrompt: e.target.value })}
                rows={4}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono leading-relaxed transition-all resize-y"
                placeholder="Describe the agent behavior, instructions, and constraints..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Knowledge Context Source
              </label>
              <input
                type="text"
                value={config.contextSource || ''}
                onChange={(e) => onUpdateConfig(selectedNode.id, { contextSource: e.target.value })}
                placeholder="e.g. Zendesk Docs, Pricing Catalog"
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>
          </>
        )}

        {/* Trigger Node Configuration */}
        {type === 'trigger' && (
          <>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Trigger Type
              </label>
              <select
                value={config.triggerType || 'email'}
                onChange={(e) => onUpdateConfig(selectedNode.id, { triggerType: e.target.value as any })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none"
              >
                <option value="email">Inbound Email (IMAP / SendGrid)</option>
                <option value="webhook">REST Webhook (HTTP POST)</option>
                <option value="chat">Interactive Chat UI</option>
                <option value="cron">Scheduled Cron Interval</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Listening Event / Filter
              </label>
              <input
                type="text"
                value={config.triggerEvent || ''}
                onChange={(e) => onUpdateConfig(selectedNode.id, { triggerEvent: e.target.value })}
                placeholder="e.g. On Inbound Email"
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>
          </>
        )}

        {/* Tool Node Configuration */}
        {type === 'tool' && (
          <>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Tool Name
              </label>
              <input
                type="text"
                value={config.toolName || ''}
                onChange={(e) => onUpdateConfig(selectedNode.id, { toolName: e.target.value })}
                placeholder="Google Search Grounding"
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Tool Action / Function
              </label>
              <input
                type="text"
                value={config.toolAction || ''}
                onChange={(e) => onUpdateConfig(selectedNode.id, { toolAction: e.target.value })}
                placeholder="query_search_engine"
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>
          </>
        )}

        {/* Memory Node Configuration */}
        {type === 'memory' && (
          <>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Vector Store / Collection
              </label>
              <input
                type="text"
                value={config.collectionName || ''}
                onChange={(e) => onUpdateConfig(selectedNode.id, { collectionName: e.target.value })}
                placeholder="kb_embeddings_v2"
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Top-K Documents ({config.topK ?? 4})
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={config.topK ?? 4}
                onChange={(e) => onUpdateConfig(selectedNode.id, { topK: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </>
        )}

        {/* Action Node Configuration */}
        {type === 'action' && (
          <>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Action Egress Type
              </label>
              <select
                value={config.actionType || 'zendesk_reply'}
                onChange={(e) => onUpdateConfig(selectedNode.id, { actionType: e.target.value as any })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none"
              >
                <option value="zendesk_reply">Draft Zendesk Reply</option>
                <option value="slack_notify">Post Slack Alert</option>
                <option value="send_email">Send SMTP Email</option>
                <option value="webhook_post">HTTP Webhook POST</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Destination Target
              </label>
              <input
                type="text"
                value={config.destination || ''}
                onChange={(e) => onUpdateConfig(selectedNode.id, { destination: e.target.value })}
                placeholder="support-inbox@company.com"
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
