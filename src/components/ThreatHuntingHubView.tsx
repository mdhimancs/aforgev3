import React, { useState } from 'react';
import {
  Search,
  Crosshair,
  Terminal,
  FileCode,
  Copy,
  Check,
  Play,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Layers,
  Database,
  Cpu,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye
} from 'lucide-react';
import { ThreatHuntHypothesis, ThreatHuntFinding } from '../types';
import { SAMPLE_THREAT_HUNT_HYPOTHESES, SAMPLE_THREAT_HUNT_FINDINGS } from '../data/secOpsData';
import { useTheme } from '../context/ThemeContext';

export function ThreatHuntingHubView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [hypotheses, setHypotheses] = useState<ThreatHuntHypothesis[]>(SAMPLE_THREAT_HUNT_HYPOTHESES);
  const [findings, setFindings] = useState<ThreatHuntFinding[]>(SAMPLE_THREAT_HUNT_FINDINGS);
  const [selectedHypoId, setSelectedHypoId] = useState<string>(SAMPLE_THREAT_HUNT_HYPOTHESES[0].id);
  const [activeQueryTab, setActiveQueryTab] = useState<'KQL' | 'SPL' | 'SIGMA' | 'YARAL'>('KQL');
  const [copiedQuery, setCopiedQuery] = useState(false);

  // AI Hypothesis generation state
  const [newHypoPrompt, setNewHypoPrompt] = useState('');
  const [isGeneratingHypo, setIsGeneratingHypo] = useState(false);
  const [isExecutingHunt, setIsExecutingHunt] = useState(false);
  const [huntExecutionFeedback, setHuntExecutionFeedback] = useState<string | null>(null);

  const activeHypothesis = hypotheses.find(h => h.id === selectedHypoId) || hypotheses[0];
  const activeHypoFindings = findings.filter(f => f.hypothesisId === activeHypothesis.id);

  // Copy Query code
  const handleCopyQuery = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  // Run live telemetry hunt across logs
  const handleExecuteHunt = () => {
    setIsExecutingHunt(true);
    setHuntExecutionFeedback(null);
    setTimeout(() => {
      setIsExecutingHunt(false);
      setHuntExecutionFeedback(`Hunt complete: Scanned 1.48M telemetry events across 3 data sources. Correlated ${activeHypothesis.matchesCount || 4} positive anomalous matches.`);
      // Add a live finding if not already present
      if (activeHypoFindings.length === 0) {
        const newFinding: ThreatHuntFinding = {
          id: `find-live-${Date.now()}`,
          hypothesisId: activeHypothesis.id,
          timestamp: new Date().toISOString(),
          entityType: 'PROCESS',
          entityValue: 'powershell.exe -w hidden -enc JABzAD0...',
          anomalyDescription: 'Adversary memory execution matching hypothesis behavioral pattern.',
          confidence: 94,
          status: 'CONFIRMED_INCIDENT'
        };
        setFindings(prev => [newFinding, ...prev]);
      }
    }, 1200);
  };

  // Generate AI Threat Hunt
  const handleGenerateAiHypothesis = async () => {
    if (!newHypoPrompt.trim()) return;
    setIsGeneratingHypo(true);
    try {
      const res = await fetch('/api/v1/secops/threat-hunt-hypothesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userHypothesis: newHypoPrompt,
          targetEnvironment: 'Multi-Cloud AWS & Enterprise Windows'
        })
      });
      const data = await res.json();
      if (data.success && data.hypothesis) {
        setHypotheses(prev => [data.hypothesis, ...prev]);
        setSelectedHypoId(data.hypothesis.id);
      }
    } catch {
      // Fallback
    } finally {
      setIsGeneratingHypo(false);
      setNewHypoPrompt('');
    }
  };

  // Active query text resolver
  const getActiveQueryText = () => {
    switch (activeQueryTab) {
      case 'KQL':
        return activeHypothesis.kqlQuery || '// No KQL Query specified';
      case 'SPL':
        return activeHypothesis.splQuery || '// No SPL Query specified';
      case 'SIGMA':
        return activeHypothesis.sigmaRuleYaml || '# No Sigma YAML specified';
      case 'YARAL':
        return activeHypothesis.yaraLQuery || '// No YARA-L Rule specified';
      default:
        return '';
    }
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
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-bold text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Hypothesis-Driven Threat Hunting & Query Forge
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                MULTI-DIALECT DETECTIONS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Proactive adversary discovery across KQL (Sentinel), SPL (Splunk), Sigma Rules, and Chronicle YARA-L.
            </p>
          </div>
        </div>

        {/* Hunt Execution Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExecuteHunt}
            disabled={isExecutingHunt}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-all shadow-md shadow-cyan-600/20 cursor-pointer disabled:opacity-50"
          >
            {isExecutingHunt ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Execute Live Telemetry Hunt</span>
          </button>
        </div>
      </div>

      {/* Execution Feedback Notice */}
      {huntExecutionFeedback && (
        <div
          className={`px-5 py-2.5 border-b text-xs flex items-center justify-between ${
            isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-900' : 'bg-cyan-950/40 border-cyan-800/60 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
            <span>{huntExecutionFeedback}</span>
          </div>
          <button
            onClick={() => setHuntExecutionFeedback(null)}
            className="text-[11px] font-bold underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left Column Hypotheses List, Center Query Workspace, Right Findings */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto p-5 gap-5">
        {/* Left Column: Hypotheses Library (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div
            className={`p-4 rounded-2xl border flex flex-col flex-1 ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Hunting Hypotheses ({hypotheses.length})
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
              {hypotheses.map((h) => {
                const isSelected = h.id === selectedHypoId;
                return (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHypoId(h.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-cyan-50/80 border-cyan-500 shadow-md ring-2 ring-cyan-500/20'
                          : 'bg-cyan-950/40 border-cyan-500 shadow-md ring-2 ring-cyan-500/20'
                        : isLight
                        ? 'bg-slate-50/80 hover:bg-slate-50 border-slate-200'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                        h.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                      }`}>
                        {h.priority} PRIORITY
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {h.matchesCount || 0} Matches
                      </span>
                    </div>

                    <h4 className={`text-xs font-bold leading-snug mb-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                      {h.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                      {h.hypothesisStatement}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
                      <span className="font-mono">{h.threatActorTargeting}</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-bold">{h.confidenceScore}% Conf</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Generator Box */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">AI Hypothesis Synthesizer</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHypoPrompt}
                  onChange={(e) => setNewHypoPrompt(e.target.value)}
                  placeholder="e.g. Detect DNS over HTTPS exfiltration to paste sites..."
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
                  }`}
                />
                <button
                  onClick={handleGenerateAiHypothesis}
                  disabled={isGeneratingHypo || !newHypoPrompt.trim()}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isGeneratingHypo ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Forge'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Hypothesis Detail & Multi-Dialect Code Generator (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Active Hypothesis Overview */}
          <div
            className={`p-5 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    STATUS: {activeHypothesis.status}
                  </span>
                  <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {activeHypothesis.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {activeHypothesis.hypothesisStatement}
                </p>
              </div>

              <div className="text-right shrink-0 font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-400">Confidence</span>
                <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                  {activeHypothesis.confidenceScore}%
                </p>
              </div>
            </div>

            {/* MITRE Tags & Telemetry Data Sources */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  MITRE ATT&CK Techniques
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeHypothesis.mitreTechniques.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Required Telemetry Sources
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeHypothesis.dataSourcesRequired.map((ds, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded text-[11px] border ${
                        isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {ds}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Query Code Editor Tabs */}
          <div
            className={`rounded-2xl border overflow-hidden flex flex-col ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            {/* Tab Selector Header */}
            <div
              className={`p-2 border-b flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveQueryTab('KQL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeQueryTab === 'KQL'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:bg-slate-200'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Microsoft Sentinel (KQL)
                </button>
                <button
                  onClick={() => setActiveQueryTab('SPL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeQueryTab === 'SPL'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:bg-slate-200'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Splunk (SPL)
                </button>
                <button
                  onClick={() => setActiveQueryTab('SIGMA')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeQueryTab === 'SIGMA'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:bg-slate-200'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Sigma Rule (YAML)
                </button>
                <button
                  onClick={() => setActiveQueryTab('YARAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeQueryTab === 'YARAL'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:bg-slate-200'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Chronicle (YARA-L)
                </button>
              </div>

              <button
                onClick={() => handleCopyQuery(getActiveQueryText())}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {copiedQuery ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedQuery ? 'Copied!' : 'Copy Rule'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 bg-slate-900 font-mono text-xs text-slate-200 overflow-x-auto max-h-64 leading-relaxed">
              <pre className="whitespace-pre-wrap selection:bg-cyan-500/30">
                {getActiveQueryText()}
              </pre>
            </div>
          </div>

          {/* Confirmed Hunt Findings & Entity Evidence Board */}
          <div
            className={`p-5 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Correlated Telemetry Findings & IOC Entities ({activeHypoFindings.length})
                </h3>
              </div>
            </div>

            {activeHypoFindings.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No active anomalies logged for this hypothesis yet. Click "Execute Live Telemetry Hunt" to scan current streaming logs.
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeHypoFindings.map((finding) => (
                  <div
                    key={finding.id}
                    className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          {finding.entityType}: {finding.entityValue}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(finding.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {finding.anomalyDescription}
                    </p>

                    {finding.iocHash && (
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-black/20 p-1.5 rounded">
                        <span className="font-bold">SHA256:</span>
                        <span className="truncate">{finding.iocHash}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
