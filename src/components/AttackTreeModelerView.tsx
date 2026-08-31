import React, { useState } from 'react';
import {
  GitFork,
  DollarSign,
  Percent,
  AlertOctagon,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Target,
  FileCode,
  Layers,
  ArrowDownRight,
  Crosshair,
  TrendingUp,
  Cpu,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FolderTree
} from 'lucide-react';
import { AttackTreeScenario, AttackTreeNode, ThreatActorTier } from '../types';
import { SAMPLE_ATTACK_TREES } from '../data/secOpsData';
import { useTheme } from '../context/ThemeContext';

export function AttackTreeModelerView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [trees, setTrees] = useState<AttackTreeScenario[]>(SAMPLE_ATTACK_TREES);
  const [selectedTreeId, setSelectedTreeId] = useState<string>(SAMPLE_ATTACK_TREES[0].id);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('root');
  const [highlightCriticalPath, setHighlightCriticalPath] = useState<boolean>(true);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  // AI Generator state
  const [customGoal, setCustomGoal] = useState('');
  const [customAsset, setCustomAsset] = useState('');
  const [threatActorTier, setThreatActorTier] = useState<ThreatActorTier>('CYBERCRIME_SYNDICATE');
  const [isGeneratingTree, setIsGeneratingTree] = useState(false);

  const activeTree = trees.find(t => t.id === selectedTreeId) || trees[0];
  const activeNode = activeTree.nodes[selectedNodeId] || activeTree.nodes['root'];

  // Toggle node expansion
  const toggleCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Toggle Mitigation status of a node to simulate defensive improvement
  const toggleNodeMitigation = (nodeId: string) => {
    setTrees(prev => prev.map(t => {
      if (t.id === selectedTreeId) {
        const node = t.nodes[nodeId];
        if (!node) return t;
        const newStatus = node.mitigationStatus === 'ACTIVE' ? 'DEFICIENT' : 'ACTIVE';
        const newProb = newStatus === 'ACTIVE' ? Math.max(5, node.probability - 50) : Math.min(95, node.probability + 40);
        return {
          ...t,
          nodes: {
            ...t.nodes,
            [nodeId]: {
              ...node,
              mitigationStatus: newStatus,
              probability: newProb
            }
          }
        };
      }
      return t;
    }));
  };

  // Generate Attack Tree with AI
  const handleGenerateAiTree = async () => {
    if (!customGoal.trim()) return;
    setIsGeneratingTree(true);
    try {
      const res = await fetch('/api/v1/secops/attack-tree-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rootGoal: customGoal,
          targetAsset: customAsset || 'Cloud Production Workload',
          threatActorTier: threatActorTier
        })
      });
      const data = await res.json();
      if (data.success && data.tree) {
        setTrees(prev => [data.tree, ...prev]);
        setSelectedTreeId(data.tree.id);
        setSelectedNodeId('root');
      }
    } catch {
      // Fallback
    } finally {
      setIsGeneratingTree(false);
      setCustomGoal('');
      setCustomAsset('');
    }
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (nodeId: string, depth: number = 0) => {
    const node = activeTree.nodes[nodeId];
    if (!node) return null;

    const isSelected = selectedNodeId === nodeId;
    const isCollapsed = collapsedNodes[nodeId];
    const isCritical = highlightCriticalPath && node.isCriticalPath;
    const hasChildren = node.childrenIds && node.childrenIds.length > 0;

    return (
      <div key={nodeId} className="flex flex-col">
        <div
          onClick={() => setSelectedNodeId(nodeId)}
          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none mb-2 ${
            isSelected
              ? isLight
                ? 'bg-indigo-50/90 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                : 'bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
              : isCritical
              ? isLight
                ? 'bg-rose-50/60 hover:bg-rose-50 border-rose-300'
                : 'bg-rose-950/20 hover:bg-rose-950/40 border-rose-800/60'
              : isLight
              ? 'bg-white hover:bg-slate-50 border-slate-200'
              : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800'
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => toggleCollapse(nodeId, e)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-slate-500"
              >
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              </div>
            )}

            {/* Node Type Badge (AND / OR / LEAF) */}
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 border ${
                node.nodeType === 'OR'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                  : node.nodeType === 'AND'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}
            >
              {node.nodeType}
            </span>

            <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              {node.label}
            </span>

            {isCritical && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0 border border-rose-500/30">
                CRITICAL PATH
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            {/* Probability Badge */}
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <span className="text-slate-400">Prob:</span>
              <span className={`font-bold ${
                node.probability > 70 ? 'text-rose-500' : node.probability > 40 ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                {node.probability}%
              </span>
            </div>

            {/* Attacker Cost */}
            {node.attackerCost && (
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-500">
                <span>Cost:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{node.attackerCost}</span>
              </div>
            )}

            {/* Mitigation Status Indicator */}
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                node.mitigationStatus === 'ACTIVE'
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                  : node.mitigationStatus === 'PARTIAL'
                  ? 'bg-amber-500'
                  : 'bg-rose-500 animate-pulse'
              }`}
              title={`Mitigation Status: ${node.mitigationStatus}`}
            />
          </div>
        </div>

        {/* Render child nodes if expanded */}
        {!isCollapsed && hasChildren && (
          <div className="flex flex-col border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-1">
            {node.childrenIds!.map((childId) => renderTreeNode(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header Bar */}
      <div
        className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-bold text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Bruce Schneier Attack Tree Modeling & Choke-Point Analyzer
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                AND/OR DECISIONAL GRAPH
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Probabilistic adversary path traversal, minimum cost economics, and defensive choke-point identification.
            </p>
          </div>
        </div>

        {/* Tree Selector & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-500">Scenario:</span>
            <select
              value={selectedTreeId}
              onChange={(e) => {
                setSelectedTreeId(e.target.value);
                setSelectedNodeId('root');
              }}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium focus:outline-none transition-colors ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {trees.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.rootGoal.length > 40 ? t.rootGoal.slice(0, 40) + '...' : t.rootGoal}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setHighlightCriticalPath(!highlightCriticalPath)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              highlightCriticalPath
                ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                : isLight
                ? 'bg-slate-100 text-slate-600 border-slate-300'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{highlightCriticalPath ? 'Critical Path: ON' : 'Critical Path: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Scenario Metrics Banner */}
      <div
        className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-4 text-xs ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/80 border-slate-800/80 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-500" />
            <span><strong>Target Asset:</strong> {activeTree.targetAsset}</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span><strong>Threat Tier:</strong> {activeTree.threatActorTier}</span>
          </div>
        </div>

        <div className="flex items-center gap-5 font-mono">
          <div>
            <span className="text-slate-400">Total Min Attacker Cost: </span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{activeTree.totalAttackerCostMin}</span>
          </div>
          <div>
            <span className="text-slate-400">Overall Breach Probability: </span>
            <span className={`font-bold ${
              activeTree.overallCompromiseProbability > 70 ? 'text-rose-500' : 'text-amber-500'
            }`}>
              {activeTree.overallCompromiseProbability}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Tree Graph Left, Node Inspector & AI Generator Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto p-5 gap-5">
        {/* Left Column: Visual Tree Graph */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div
            className={`p-5 rounded-2xl border flex-1 ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-indigo-500" />
                <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Decomposition Tree Hierarchy
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> OR (Any Path)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> AND (All Steps)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> LEAF (Atomic)</span>
              </div>
            </div>

            {/* Tree nodes renderer */}
            <div className="space-y-1">
              {renderTreeNode('root')}
            </div>

            {/* Recommended Choke Point Box */}
            {activeTree.recommendedChokePoint && (
              <div
                className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${
                  isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block mb-1">
                    Optimal Defensive Choke-Point
                  </span>
                  <p className="text-xs leading-relaxed">
                    {activeTree.recommendedChokePoint}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Node Inspector & AI Attack Tree Synthesizer */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Node Inspector Card */}
          <div
            className={`p-5 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase">
                  NODE INSPECTOR • {activeNode.nodeType} NODE
                </span>
                <h3 className={`font-bold text-base mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {activeNode.label}
                </h3>
              </div>

              <button
                onClick={() => toggleNodeMitigation(activeNode.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  activeNode.mitigationStatus === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                }`}
              >
                {activeNode.mitigationStatus === 'ACTIVE' ? 'Shielded' : 'Vulnerable'} (Toggle)
              </button>
            </div>

            {activeNode.description && (
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                {activeNode.description}
              </p>
            )}

            {/* Metrics Triad */}
            <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <span className="text-[10px] text-slate-500 font-medium block">Probability</span>
                <span className="text-sm font-bold font-mono text-rose-500">{activeNode.probability}%</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <span className="text-[10px] text-slate-500 font-medium block">Attacker Cost</span>
                <span className="text-sm font-bold font-mono text-amber-500">{activeNode.attackerCost || '$0'}</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <span className="text-[10px] text-slate-500 font-medium block">Detection Risk</span>
                <span className="text-sm font-bold font-mono text-emerald-500">{activeNode.detectionRisk || 50}%</span>
              </div>
            </div>

            {/* Security Mapping Details */}
            <div className="space-y-2.5 text-xs">
              {activeNode.mitreTechnique && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-medium">MITRE ATT&CK:</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{activeNode.mitreTechnique}</span>
                </div>
              )}

              {activeNode.cweCvss && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-medium">CWE / CVSS:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{activeNode.cweCvss}</span>
                </div>
              )}

              {activeNode.mitigationControl && (
                <div className="pt-2">
                  <span className="text-slate-500 font-bold block mb-1">Recommended Defensive Control:</span>
                  <div className={`p-2.5 rounded-lg border text-xs ${
                    activeNode.mitigationStatus === 'ACTIVE'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                    {activeNode.mitigationControl}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Attack Tree Synthesizer */}
          <div
            className={`p-5 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-500">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                AI Attack Tree Generator
              </h3>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Automatically synthesize an AND/OR attack tree for any system objective or asset.
            </p>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Adversary Goal</label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. Hijack Kubernetes Cluster Admin / Compromise Supply Chain CI/CD..."
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Asset</label>
                  <input
                    type="text"
                    value={customAsset}
                    onChange={(e) => setCustomAsset(e.target.value)}
                    placeholder="e.g. EKS Master Node / GitHub Actions"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Threat Actor Tier</label>
                  <select
                    value={threatActorTier}
                    onChange={(e) => setThreatActorTier(e.target.value as ThreatActorTier)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
                    }`}
                  >
                    <option value="CYBERCRIME_SYNDICATE">Cybercrime Syndicate</option>
                    <option value="NATION_STATE_APT">Nation State APT</option>
                    <option value="MALICIOUS_INSIDER">Malicious Insider</option>
                    <option value="SCRIPT_KIDDIE">Opportunistic</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateAiTree}
                disabled={isGeneratingTree || !customGoal.trim()}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGeneratingTree ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Synthesize Attack Tree Graph</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
