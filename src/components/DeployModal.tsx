import React, { useState } from 'react';
import { X, Check, Copy, Globe, Terminal, Shield, Rocket, Play, RefreshCw, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AgentWorkflow } from '../types';

interface DeployModalProps {
  workflow: AgentWorkflow;
  onClose: () => void;
}

export const DeployModal: React.FC<DeployModalProps> = ({ workflow, onClose }) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [env, setEnv] = useState<'production' | 'staging'>('production');
  const [testInput, setTestInput] = useState('Customer asking about enterprise volume pricing and SLAs');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResponse, setTestResponse] = useState<any | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://api.agentforge.ai';
  const endpointUrl = `${baseUrl}/api/v1/agents/${workflow.id}/run`;
  const webhookUrl = `${baseUrl}/api/v1/webhooks/${workflow.id}/inbound`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleSendTestRequest = async () => {
    setIsSendingTest(true);
    setTestResponse(null);
    try {
      const res = await fetch(`/api/v1/agents/${workflow.id}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer af_live_secret_key'
        },
        body: JSON.stringify({
          input: testInput,
          context: { priority: 'high', environment: env }
        })
      });
      const data = await res.json();
      setTestResponse({
        httpStatus: res.status,
        data
      });
    } catch (err: any) {
      setTestResponse({
        httpStatus: 500,
        error: err.message || 'Failed to reach endpoint'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const curlSnippet = `curl -X POST "${endpointUrl}" \\
  -H "Authorization: Bearer af_live_secret_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "${testInput.replace(/'/g, "'\\''")}",
    "context": {"priority": "high", "environment": "${env}"}
  }'`;

  const embedSnippet = `<script src="${baseUrl}/widget.js" 
  data-agent-id="${workflow.id}" 
  data-theme="dark" 
  defer>
</script>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Deploy Agent: {workflow.name}</h3>
              <p className="text-xs text-slate-400">Live Production REST API, Webhooks & Test Workbench</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Status Alert */}
          <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
              <div>
                <p className="text-xs font-semibold text-emerald-300">Live Agent Endpoint Online</p>
                <p className="text-[11px] text-slate-400">Engine: Gemini 3.7 Flash • Dynamic Server Route Active</p>
              </div>
            </div>

            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setEnv('production')}
                className={`px-2.5 py-0.5 rounded transition-all ${env === 'production' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'}`}
              >
                Production
              </button>
              <button
                onClick={() => setEnv('staging')}
                className={`px-2.5 py-0.5 rounded transition-all ${env === 'staging' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'}`}
              >
                Staging
              </button>
            </div>
          </div>

          {/* Interactive Endpoint Tester */}
          <div className="p-4 bg-slate-900/70 border border-indigo-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-indigo-400" />
                Live Endpoint Test Workbench
              </label>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                POST /api/v1/agents/{workflow.id}/run
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter sample input query..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                onClick={handleSendTestRequest}
                disabled={isSendingTest}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 shrink-0"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Send Test Request</span>
                  </>
                )}
              </button>
            </div>

            {testResponse && (
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    {testResponse.httpStatus === 200 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    HTTP Status: <span className={testResponse.httpStatus === 200 ? 'text-emerald-400' : 'text-rose-400'}>{testResponse.httpStatus} OK</span>
                  </span>
                  {testResponse.data?.metrics && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Latency: {testResponse.data.metrics.latencyMs}ms • Model: {testResponse.data.metrics.model}
                    </span>
                  )}
                </div>
                <pre className="p-2.5 bg-slate-900 rounded border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-36">
                  {JSON.stringify(testResponse.data || testResponse.error, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* cURL Invocation */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                cURL Execution Command
              </label>
              <button
                onClick={() => copyToClipboard(curlSnippet, 'curl')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                {copiedTab === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedTab === 'curl' ? 'Copied' : 'Copy cURL'}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
              {curlSnippet}
            </pre>
          </div>

          {/* Inbound Webhook */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                Inbound Webhook URL (SendGrid / Stripe / Zendesk)
              </label>
              <button
                onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                {copiedTab === 'webhook' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedTab === 'webhook' ? 'Copied' : 'Copy URL'}
              </button>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 truncate">
              {webhookUrl}
            </div>
          </div>

          {/* Embed Script */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Embeddable Web Chat Widget
              </label>
              <button
                onClick={() => copyToClipboard(embedSnippet, 'embed')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                {copiedTab === 'embed' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedTab === 'embed' ? 'Copied' : 'Copy Tag'}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
              {embedSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex justify-end gap-2 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

