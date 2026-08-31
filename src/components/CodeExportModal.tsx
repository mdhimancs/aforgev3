import React, { useState } from 'react';
import { X, Check, Copy, Code2, FileJson, Terminal } from 'lucide-react';
import { AgentWorkflow } from '../types';

interface CodeExportModalProps {
  workflow: AgentWorkflow;
  onClose: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ workflow, onClose }) => {
  const [tab, setTab] = useState<'gemini' | 'langgraph' | 'crewai' | 'json'>('gemini');
  const [copied, setCopied] = useState(false);

  const llmNode = workflow.nodes.find((n) => n.type === 'llm');
  const toolNodes = workflow.nodes.filter((n) => n.type === 'tool');

  // Generate Gemini TypeScript code
  const geminiCode = `import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

export async function runAgentWorkflow(inputPayload: string) {
  const systemInstruction = \`${llmNode?.config.systemPrompt || 'You are an autonomous AI Agent.'}
Context Source: ${llmNode?.config.contextSource || 'None'}\`;

  const response = await ai.models.generateContent({
    model: "${llmNode?.config.model || 'gemini-3.7-flash'}",
    contents: inputPayload,
    config: {
      systemInstruction,
      temperature: ${llmNode?.config.temperature ?? 0.7},
      ${toolNodes.length > 0 ? `// Registered Agent Tools: ${toolNodes.map(t => t.config.toolName).join(', ')}` : ''}
    }
  });

  return {
    output: response.text,
    status: "success"
  };
}
`;

  // Generate LangGraph Python code
  const langgraphCode = `from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, START, END
from langchain_google_genai import ChatGoogleGenerativeAI

class AgentState(TypedDict):
    messages: list[str]
    context: str

# 1. Initialize Reasoning LLM
llm = ChatGoogleGenerativeAI(
    model="${llmNode?.config.model || 'gemini-3.7-flash'}",
    temperature=${llmNode?.config.temperature ?? 0.7}
)

def reason_node(state: AgentState):
    sys_prompt = """${llmNode?.config.systemPrompt || 'Autonomous agent logic.'}"""
    response = llm.invoke(sys_prompt + "\\n" + state["messages"][-1])
    return {"messages": [response.content]}

# 2. Build Graph Workflow
builder = StateGraph(AgentState)
builder.add_node("reason", reason_node)
builder.add_edge(START, "reason")
builder.add_edge("reason", END)

agent_app = builder.compile()
`;

  // Generate CrewAI Python code
  const crewaiCode = `from crewai import Agent, Task, Crew, Process
from crewai.llm import LLM

# Configure Gemini LLM
gemini_llm = LLM(
    model="gemini/gemini-3.7-flash",
    temperature=${llmNode?.config.temperature ?? 0.7}
)

# Define Agent
specialist_agent = Agent(
    role="${workflow.name}",
    goal="${workflow.description}",
    backstory="""${llmNode?.config.systemPrompt || 'Specialized workflow agent.'}""",
    llm=gemini_llm,
    verbose=True
)

# Define Execution Task
workflow_task = Task(
    description="Process inbound payload with high fidelity context.",
    expected_output="Structured resolution output according to workflow rules.",
    agent=specialist_agent
)

crew = Crew(
    agents=[specialist_agent],
    tasks=[workflow_task],
    process=Process.sequential
)
`;

  const getCodeContent = () => {
    switch (tab) {
      case 'gemini':
        return geminiCode;
      case 'langgraph':
        return langgraphCode;
      case 'crewai':
        return crewaiCode;
      case 'json':
        return JSON.stringify(workflow, null, 2);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Export Agent Workflow Code</h3>
              <p className="text-xs text-slate-400">Ready-to-use production SDK code for TypeScript & Python</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-800 bg-slate-900/30">
          <button
            onClick={() => setTab('gemini')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'gemini'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            Gemini TypeScript SDK
          </button>

          <button
            onClick={() => setTab('langgraph')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'langgraph'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            LangGraph (Python)
          </button>

          <button
            onClick={() => setTab('crewai')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'crewai'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            CrewAI (Python)
          </button>

          <button
            onClick={() => setTab('json')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'json'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5 text-emerald-400" />
            JSON Spec
          </button>
        </div>

        {/* Code View */}
        <div className="p-6 relative">
          <button
            onClick={handleCopy}
            className="absolute top-8 right-8 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors shadow-md"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard' : 'Copy Code'}
          </button>

          <pre className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-[380px] leading-relaxed">
            <code>{getCodeContent()}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex justify-between items-center bg-slate-900/50">
          <span className="text-[11px] text-slate-500 font-mono">
            {workflow.nodes.length} Nodes • Ready to run
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
