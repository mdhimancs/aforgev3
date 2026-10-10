import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, Flame, AlertTriangle, CheckCircle2, 
  X, Filter, BarChart3, Terminal, Cpu, Database, Wrench, Shield, ArrowRight, Sparkles, Layers
} from 'lucide-react';
import { AgentWorkflow, TestExecutionResult, AgentNode } from '../types';

interface SimulationHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: AgentWorkflow;
  testResults: Record<string, TestExecutionResult>;
}

export const SimulationHeatmapModal: React.FC<SimulationHeatmapModalProps> = ({
  isOpen,
  onClose,
  workflow,
  testResults,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  if (!isOpen) return null;

  const resultsList = Object.values(testResults) as TestExecutionResult[];
  const failedResults = resultsList.filter((r) => r.status === 'failed');

  // Map each node in the workflow to simulated vulnerability frequency based on test results
  const getNodeVulnerabilityStats = (node: AgentNode) => {
    // Determine relevance based on node type
    let baseVulnerabilityScore = 15; // default low risk
    let matchedFailures: TestExecutionResult[] = [];

    if (node.type === 'llm') {
      matchedFailures = failedResults.filter(
        (r) => r.category === 'prompt_injection' || r.category === 'system_prompt_leakage'
      );
      baseVulnerabilityScore = Math.min(92, 35 + matchedFailures.length * 18);
    } else if (node.type === 'tool' || node.type === 'action') {
      matchedFailures = failedResults.filter(
        (r) => r.category === 'excessive_agency' || r.category === 'sensitive_data_exfiltration'
      );
      baseVulnerabilityScore = Math.min(88, 25 + matchedFailures.length * 20);
    } else if (node.type === 'guardrail') {
      // Guardrails generally mitigate, but can have bypasses
      matchedFailures = failedResults.filter((r) => !r.guardrailTriggered && r.status === 'failed');
      baseVulnerabilityScore = Math.min(65, 15 + matchedFailures.length * 12);
    } else if (node.type === 'memory') {
      matchedFailures = failedResults.filter((r) => r.category === 'sensitive_data_exfiltration');
      baseVulnerabilityScore = Math.min(75, 20 + matchedFailures.length * 15);
    } else {
      matchedFailures = failedResults.slice(0, 1);
      baseVulnerabilityScore = 10;
    }

    const riskLevel = 
      baseVulnerabilityScore >= 75 ? 'CRITICAL' :
      baseVulnerabilityScore >= 50 ? 'HIGH' :
      baseVulnerabilityScore >= 25 ? 'MEDIUM' : 'LOW';

    return {
      score: baseVulnerabilityScore,
      riskLevel,
      matchedFailures,
    };
  };

  const nodesWithStats = workflow.nodes.map((node) => ({
    node,
    stats: getNodeVulnerabilityStats(node),
  }));

  const filteredNodes = filterSeverity === 'all'
    ? nodesWithStats
    : nodesWithStats.filter((item) => item.stats.riskLevel === filterSeverity);

  const selectedItem = workflow.nodes.find((n) => n.id === selectedNodeId);
  const selectedStats = selectedItem ? getNodeVulnerabilityStats(selectedItem) : null;

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'llm': return <Cpu className="w-4 h-4 text-indigo-600" />;
      case 'tool': return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'guardrail': return <Shield className="w-4 h-4 text-teal-600" />;
      case 'memory': return <Database className="w-4 h-4 text-purple-600" />;
      case 'action': return <Terminal className="w-4 h-4 text-rose-600" />;
      default: return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-5xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 border border-rose-200 rounded-xl text-rose-700">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-black flex items-center gap-2">
                Workflow Simulation Vulnerability Heatmap
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Adverse Hotspot Analysis
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mapping adversarial testsuite failures and CVE probes across workflow nodes for <span className="font-semibold text-slate-800">{workflow.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Summary Bar */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Filter Severity:
            </span>
            {['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-lg font-mono font-bold text-[11px] transition-colors cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
            <span>Total Nodes: <strong className="text-slate-900">{workflow.nodes.length}</strong></span>
            <span>Failed Probes: <strong className="text-rose-600">{failedResults.length}</strong></span>
          </div>
        </div>

        {/* Content Body: Grid of Nodes + Inspector Pane */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left / Main Grid: Nodes Heatmap Cards */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNodes.map(({ node, stats }) => {
                const isSelected = selectedNodeId === node.id;
                const isCriticalOrHigh = stats.riskLevel === 'CRITICAL' || stats.riskLevel === 'HIGH';

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'ring-2 ring-indigo-600 bg-white shadow-md'
                        : isCriticalOrHigh
                        ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300 hover:bg-rose-50/60'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
                            {getNodeTypeIcon(node.type)}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-black">{node.title}</h3>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{node.type}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            stats.riskLevel === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : stats.riskLevel === 'HIGH'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : stats.riskLevel === 'MEDIUM'
                              ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {stats.riskLevel} RISK ({stats.score}%)
                        </span>
                      </div>

                      {/* Heatbar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3 mb-2">
                        <div
                          className={`h-full transition-all duration-500 ${
                            stats.score >= 75
                              ? 'bg-rose-600'
                              : stats.score >= 50
                              ? 'bg-amber-500'
                              : stats.score >= 25
                              ? 'bg-yellow-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${stats.score}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-mono mt-2">
                      <span>Vulnerabilities Triggered: {stats.matchedFailures.length}</span>
                      <span className="text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
                        Inspect Node <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Inspector: Details of Selected Node Vulnerability Hotspot */}
          <div className="w-96 bg-white border-l border-slate-200 p-6 overflow-y-auto flex flex-col">
            {selectedItem && selectedStats ? (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-700 border border-indigo-200">
                      {getNodeTypeIcon(selectedItem.type)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-black">{selectedItem.title}</h3>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{selectedItem.type} node</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700">Hotspot Risk Score</span>
                    <span className="text-xs font-mono font-bold text-rose-700">{selectedStats.score}% ({selectedStats.riskLevel})</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    This node is frequently targeted during adversarial probes due to its centrality in prompt handling or tool execution permissions.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    Associated Test Failures ({selectedStats.matchedFailures.length})
                  </h4>
                  {selectedStats.matchedFailures.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedStats.matchedFailures.map((failure, idx) => (
                        <div key={idx} className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-rose-900">{failure.name}</span>
                            <span className="text-[10px] font-mono text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                              {failure.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-rose-950 font-mono line-clamp-2">
                            {failure.probePayload}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                      No adversarial vulnerabilities currently triggered for this node.
                    </div>
                  )}
                </div>

                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Mitigation Recommendation
                  </h4>
                  <p className="text-xs text-indigo-950 leading-relaxed">
                    {selectedItem.type === 'llm'
                      ? 'Apply rigorous system prompt boundary enforcements, instruction wrappers, and secondary validator guardrails.'
                      : selectedItem.type === 'tool' || selectedItem.type === 'action'
                      ? 'Implement strict parameter sanitization, explicit human approval loops, and least-privilege token access policies.'
                      : 'Ensure all runtime memory queries and state writes are encrypted and scoped to authorized user tenants.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                <h4 className="text-xs font-bold text-slate-700">Select a Workflow Node</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Click any node card on the left to inspect its vulnerability hotspot metrics and failed adversarial test vectors.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Heatmap
          </button>
        </div>

      </div>
    </div>
  );
};
