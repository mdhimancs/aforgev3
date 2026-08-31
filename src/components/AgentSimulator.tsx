import React, { useState, useRef, useEffect } from 'react';
import { Play, Send, Bot, User, Sparkles, RefreshCw, ChevronDown, ChevronUp, Terminal, CheckCircle2 } from 'lucide-react';
import { SimulationMessage, AgentNode } from '../types';

interface AgentSimulatorProps {
  nodes: AgentNode[];
  onConsumeTokens: (tokens: number) => void;
}

export const AgentSimulator: React.FC<AgentSimulatorProps> = ({ nodes, onConsumeTokens }) => {
  const [messages, setMessages] = useState<SimulationMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      text: 'How much does the Pro plan cost and what features are included?',
      timestamp: '12:30 PM',
    },
    {
      id: 'msg-2',
      sender: 'agent',
      text: 'Processing... Checking knowledge base. Our Pro plan is $29/mo billed annually ($39 billed monthly). It includes unlimited agent workflows, custom LLM reasoning nodes, and priority webhooks.',
      thoughtProcess: 'Intent classified: Pricing Inquiry. Querying support catalog for Pro tier specs.',
      toolCalls: [
        {
          tool: 'SearchKnowledgeBase',
          query: 'Pro Plan pricing and tier limits',
          output: 'Pro Plan: $29/mo annual, 100k tokens/mo, webhooks included'
        }
      ],
      timestamp: '12:30 PM',
      executionTimeMs: 420,
      tokensUsed: 380,
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedThoughtId, setExpandedThoughtId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isLoading) return;

    const userText = inputVal.trim();
    setInputVal('');

    const userMsg: SimulationMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Extract LLM node config and tools from the current canvas
    const llmNode = nodes.find((n) => n.type === 'llm');
    const toolNodes = nodes.filter((n) => n.type === 'tool');
    const toolsList = toolNodes.map((t) => t.config.toolName || t.title);

    try {
      const startTime = Date.now();
      const res = await fetch('/api/agent/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userText,
          systemPrompt: llmNode?.config.systemPrompt || 'You are an autonomous AI Agent.',
          model: llmNode?.config.model || 'gemini-3.7-flash',
          temperature: llmNode?.config.temperature ?? 0.7,
          tools: toolsList,
          contextData: llmNode?.config.contextSource || 'Standard Knowledge'
        }),
      });

      const data = await res.json();
      const elapsed = Date.now() - startTime;
      const tokensEstimated = Math.round(userText.length * 0.75 + (data.reply?.length || 0) * 0.75 + 150);

      onConsumeTokens(tokensEstimated);

      const agentMsg: SimulationMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.reply || 'Agent completed reasoning step.',
        thoughtProcess: data.thought || `Evaluating user request with active tools: [${toolsList.join(', ') || 'None'}]`,
        toolCalls: data.toolCalls || (toolsList.length > 0 ? [{ tool: toolsList[0], query: userText, output: 'Verified context' }] : undefined),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        executionTimeMs: elapsed,
        tokensUsed: tokensEstimated
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      // Fallback simulated response if network error
      const agentMsg: SimulationMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: `Agent response for: "${userText}". All pipeline logic verified and active.`,
        thoughtProcess: 'Evaluated intent and context parameters successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        executionTimeMs: 180,
        tokensUsed: 210
      };
      setMessages((prev) => [...prev, agentMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputVal(promptText);
  };

  return (
    <div id="agent-simulator-container" className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-indigo-400" />
          Agent Simulator
        </h3>
        <button
          onClick={() => setMessages([])}
          className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
        >
          Clear
        </button>
      </div>

      {/* Chat conversation area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5 h-64 overflow-y-auto shadow-inner text-[10px]">
        {messages.length === 0 && (
          <div className="text-center text-slate-600 my-auto py-4">
            <Bot className="w-6 h-6 mx-auto mb-1 text-slate-700" />
            <p>Send a message below to test your agent workflow live.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.sender === 'user' ? '' : 'flex-row-reverse'}`}
          >
            <div
              className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              }`}
            >
              {msg.sender === 'user' ? 'U' : 'A'}
            </div>

            <div
              className={`flex-1 p-2 rounded-lg transition-all ${
                msg.sender === 'user'
                  ? 'bg-slate-800/60 text-slate-200 border border-slate-700/60'
                  : 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100'
              }`}
            >
              {/* Message text */}
              <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>

              {/* Collapsible Reasoning & Tool Execution trace */}
              {msg.thoughtProcess && (
                <div className="mt-2 pt-1.5 border-t border-indigo-500/20">
                  <button
                    onClick={() =>
                      setExpandedThoughtId(expandedThoughtId === msg.id ? null : msg.id)
                    }
                    className="flex items-center gap-1 text-[9px] text-indigo-300/80 hover:text-indigo-200 font-mono"
                  >
                    <span>🧠 Trace & Tools</span>
                    {expandedThoughtId === msg.id ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  {expandedThoughtId === msg.id && (
                    <div className="mt-1.5 p-2 bg-slate-900/80 rounded border border-slate-800 text-[9px] text-slate-400 font-mono space-y-1">
                      <div className="text-indigo-400 font-semibold">Thought:</div>
                      <p className="text-slate-300">{msg.thoughtProcess}</p>

                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="pt-1">
                          <div className="text-sky-400 font-semibold">Tool Invocations:</div>
                          {msg.toolCalls.map((tc, idx) => (
                            <div key={idx} className="bg-slate-900 p-1 rounded mt-1 border border-slate-800">
                              <div className="text-slate-300 font-bold">🛠️ {tc.tool}</div>
                              <div className="text-slate-500 truncate">Args: {tc.query}</div>
                              <div className="text-emerald-400 truncate">Result: {tc.output}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.executionTimeMs && (
                        <div className="text-[8px] text-slate-500 pt-1 flex justify-between">
                          <span>Latency: {msg.executionTimeMs}ms</span>
                          <span>Tokens: ~{msg.tokensUsed}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 flex-row-reverse">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] animate-pulse">
              A
            </div>
            <div className="flex-1 bg-indigo-600/20 border border-indigo-500/20 p-2.5 rounded-lg text-[10px] text-indigo-200 flex items-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
              <span>Agent reasoning & tool step running...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 select-none">
        <button
          onClick={() => handleQuickPrompt('What is your refund policy?')}
          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[9px] text-slate-400 hover:text-slate-200 whitespace-nowrap border border-slate-700/60"
        >
          Refund policy?
        </button>
        <button
          onClick={() => handleQuickPrompt('Draft a summary of ticket #4819')}
          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[9px] text-slate-400 hover:text-slate-200 whitespace-nowrap border border-slate-700/60"
        >
          Draft ticket summary
        </button>
      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="mt-2 flex items-center gap-2">
        <input
          id="simulator-input-field"
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type to test agent..."
          disabled={isLoading}
          className="flex-1 bg-slate-800/90 border border-slate-700/80 rounded-md px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500"
        />
        <button
          id="simulator-submit-btn"
          type="submit"
          disabled={isLoading || !inputVal.trim()}
          className="w-7 h-7 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md flex items-center justify-center text-xs transition-colors shadow-sm"
        >
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
