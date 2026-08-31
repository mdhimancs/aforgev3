import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Zap,
  Layers,
  ChevronRight,
  Play,
  RefreshCw,
  Search,
  Crosshair,
  ArrowRight,
  Lock,
  ExternalLink,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { KillChainStageInfo, KillChainCampaign, KillChainPhase } from '../types';
import { SAMPLE_KILL_CHAIN_STAGES, SAMPLE_KILL_CHAIN_CAMPAIGNS } from '../data/secOpsData';
import { useTheme } from '../context/ThemeContext';

export function CyberKillChainView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [stages, setStages] = useState<KillChainStageInfo[]>(SAMPLE_KILL_CHAIN_STAGES);
  const [campaigns, setCampaigns] = useState<KillChainCampaign[]>(SAMPLE_KILL_CHAIN_CAMPAIGNS);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(SAMPLE_KILL_CHAIN_CAMPAIGNS[0].id);
  const [selectedPhase, setSelectedPhase] = useState<KillChainPhase>('COMMAND_AND_CONTROL');
  const [isSimulatingBlock, setIsSimulatingBlock] = useState(false);
  const [aiAnalysisPrompt, setAiAnalysisPrompt] = useState('Scattered Spider MFA Fatigue and Okta Session Hijacking Incursion');
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);

  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];
  const activeStageInfo = stages.find(s => s.phase === selectedPhase) || stages[5];

  // Intercept & block a specific kill-chain phase
  const handleBlockPhase = (phase: KillChainPhase) => {
    setIsSimulatingBlock(true);
    setTimeout(() => {
      setStages(prev => prev.map(s => {
        if (s.phase === phase) {
          return {
            ...s,
            status: 'BLOCKED',
            blockedAttacksCount: s.blockedAttacksCount + 1,
            activeAttacksCount: Math.max(0, s.activeAttacksCount - 1),
            observedAlerts: [`[BLOCKED BY SOAR RULE] ${new Date().toLocaleTimeString()}: Intercepted downstream progression.`, ...s.observedAlerts]
          };
        }
        return s;
      }));

      setCampaigns(prev => prev.map(c => {
        if (c.id === selectedCampaignId) {
          return {
            ...c,
            status: 'INTERCEPTED',
            interceptionPoint: phase,
            stagesState: {
              ...c.stagesState,
              [phase]: {
                ...c.stagesState[phase],
                status: 'BLOCKED',
                details: `Autonomous SOAR defense mechanism severed attack chain at ${phase}.`
              }
            }
          };
        }
        return c;
      }));
      setIsSimulatingBlock(false);
    }, 600);
  };

  // AI Campaign Analysis
  const handleRunAiAnalysis = async () => {
    if (!aiAnalysisPrompt.trim()) return;
    setIsAnalyzingAi(true);
    try {
      const res = await fetch('/api/v1/secops/kill-chain-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: aiAnalysisPrompt,
          threatActor: 'Scattered Spider / UNC3944',
          environment: 'Enterprise Identity & Multi-Cloud'
        })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAiAnalysisResult(data.analysis);
      }
    } catch {
      setAiAnalysisResult({
        campaignName: aiAnalysisPrompt,
        threatActor: 'Scattered Spider / UNC3944',
        optimalInterceptionPhase: 'DELIVERY',
        interceptionRationale: 'Intercepting MFA push fatigue at the Delivery / Credential stage prevents initial foothold in Okta and halts AWS IAM role assumption.',
        stagesBreakdown: [
          { phase: 'RECONNAISSANCE', risk: 'MEDIUM', keyTechnique: 'T1589.001 Employee Helpdesk OSINT', defense: 'Strict Out-of-Band Identity Verification' },
          { phase: 'WEAPONIZATION', risk: 'HIGH', keyTechnique: 'T1588 Evilginx AiTM Reverse Proxy', defense: 'FIDO2 Hardware Key Enforcement' },
          { phase: 'DELIVERY', risk: 'CRITICAL', keyTechnique: 'T1566.002 SMS Phishing / MFA Fatigue', defense: 'Number Matching & Geofencing Rules' },
          { phase: 'EXPLOITATION', risk: 'CRITICAL', keyTechnique: 'T1078.004 Cloud Identity Hijack', defense: 'Automated Token Quorum Revocation' },
          { phase: 'COMMAND_AND_CONTROL', risk: 'CRITICAL', keyTechnique: 'T1071 C2 Over Legitimate SaaS (Slack/AnyDesk)', defense: 'CASB App Governance & Egress Firewall' }
        ]
      });
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Phase color helper
  const getPhaseBadge = (phase: KillChainPhase, status?: string) => {
    if (status === 'BLOCKED') return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (status === 'PASSED') return 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30';
    if (status === 'IN_PROGRESS') return 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30 animate-pulse';
    return isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header Banner */}
      <div
        className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-rose-500 to-amber-600 rounded-xl text-white shadow-lg shadow-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-bold text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Lockheed Martin Cyber Kill Chain® & Defense-in-Depth Interceptor
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                7-PHASE FRAMEWORK
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-phase adversary progression analysis with automated left-of-boom early interception and MITRE ATT&CK mapping.
            </p>
          </div>
        </div>

        {/* Campaign Switcher & Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-500">Tracked Campaign:</span>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium focus:outline-none transition-colors ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.threatActor})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleBlockPhase(selectedPhase)}
            disabled={isSimulatingBlock || activeStageInfo.status === 'BLOCKED'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm ${
              activeStageInfo.status === 'BLOCKED'
                ? 'bg-slate-600 opacity-60 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer'
            }`}
          >
            {isSimulatingBlock ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>Block Phase {activeStageInfo.stageNumber}</span>
          </button>
        </div>
      </div>

      {/* 7-Stage Horizontal Pipeline Ribbon */}
      <div
        className={`px-4 py-3 border-b overflow-x-auto select-none ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800/80'
        }`}
      >
        <div className="flex items-center gap-2 min-w-[900px]">
          {stages.map((st, idx) => {
            const isSelected = st.phase === selectedPhase;
            const campaignStageState = activeCampaign.stagesState[st.phase];
            const isBlocked = campaignStageState?.status === 'BLOCKED' || st.status === 'BLOCKED';

            return (
              <React.Fragment key={st.phase}>
                <button
                  onClick={() => setSelectedPhase(st.phase)}
                  className={`flex-1 flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? isLight
                        ? 'bg-white border-rose-500 shadow-md ring-2 ring-rose-500/20'
                        : 'bg-slate-900 border-rose-500 shadow-md ring-2 ring-rose-500/20'
                      : isLight
                      ? 'bg-white/80 hover:bg-white border-slate-200'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-500">STAGE 0{st.stageNumber}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${getPhaseBadge(st.phase, campaignStageState?.status || st.status)}`}>
                      {isBlocked ? 'BLOCKED' : campaignStageState?.status || st.status}
                    </span>
                  </div>

                  <p className={`text-xs font-bold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    {st.title.replace(/^\d+\.\s*/, '')}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                    <span>{st.activeAttacksCount} active</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{st.blockedAttacksCount} blocked</span>
                  </div>

                  {/* Top Progress bar indicator */}
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isBlocked
                          ? 'bg-emerald-500'
                          : st.riskScore > 80
                          ? 'bg-rose-500'
                          : st.riskScore > 50
                          ? 'bg-amber-500'
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${st.riskScore}%` }}
                    />
                  </div>
                </button>

                {idx < stages.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Split Grid: Stage Details & Threat Intel / AI Predictor */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto p-5 gap-5">
        {/* Left Column: Active Stage Deep-Dive */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Active Stage Card */}
          <div
            className={`p-5 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    STAGE #{activeStageInfo.stageNumber} OF 7
                  </span>
                  <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {activeStageInfo.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {activeStageInfo.shortDescription}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-500">Stage Risk Score</span>
                <p className={`text-2xl font-black font-mono ${
                  activeStageInfo.riskScore > 80 ? 'text-rose-500' : activeStageInfo.riskScore > 50 ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {activeStageInfo.riskScore}/100
                </p>
              </div>
            </div>

            {/* Campaign-Specific Artifact in This Stage */}
            {activeCampaign.stagesState[activeStageInfo.phase] && (
              <div
                className={`mt-4 p-3.5 rounded-xl border text-xs ${
                  activeCampaign.stagesState[activeStageInfo.phase].status === 'BLOCKED'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-rose-500" />
                    Observed in Campaign: {activeCampaign.name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {activeCampaign.stagesState[activeStageInfo.phase].timestamp}
                  </span>
                </div>
                <p className="mb-2">{activeCampaign.stagesState[activeStageInfo.phase].details}</p>
                <div className="flex items-center gap-2 text-[11px] font-mono bg-black/10 dark:bg-black/40 p-2 rounded-lg">
                  <span className="text-slate-500 font-bold">Artifact/IOC:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 truncate">
                    {activeCampaign.stagesState[activeStageInfo.phase].iocOrArtifact}
                  </span>
                </div>
              </div>
            )}

            {/* MITRE ATT&CK Techniques in this Stage */}
            <div className="mt-5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Detected MITRE ATT&CK® Techniques & D3FEND Countermeasures
              </h4>
              <div className="space-y-2.5">
                {activeStageInfo.techniques.map((tech) => (
                  <div
                    key={tech.mitreId}
                    className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          {tech.mitreId}
                        </span>
                        <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                          {tech.name}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        tech.status === 'PREVENTED'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : tech.status === 'DETECTED'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                          : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse'
                      }`}>
                        {tech.status} ({tech.detectionConfidence}% Conf)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span><strong>D3FEND Countermeasure:</strong> {tech.d3fendCountermeasure}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">Sensor: {tech.telemetrySource}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Defense-in-Depth Controls */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Active Defensive Baseline Controls
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeStageInfo.primaryDefenses.map((def, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      isLight ? 'bg-indigo-50/70 border-indigo-200 text-indigo-800' : 'bg-indigo-950/40 border-indigo-800/40 text-indigo-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{def}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Early-Interception Advisor & Kill-Chain Simulation */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* AI Kill Chain Optimizer Card */}
          <div
            className={`p-5 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-500">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                AI Threat Campaign Decomposition
              </h3>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Enter any threat actor or attack technique to map out optimal early-interception points.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiAnalysisPrompt}
                onChange={(e) => setAiAnalysisPrompt(e.target.value)}
                placeholder="e.g. Lazarus Group Cryptominers via npm supply chain..."
                className={`flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              />
              <button
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzingAi}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer shrink-0 disabled:opacity-60 flex items-center gap-1.5"
              >
                {isAnalyzingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Analyze</span>
              </button>
            </div>

            {/* AI Analysis Output */}
            {aiAnalysisResult && (
              <div
                className={`mt-4 p-4 rounded-xl border text-xs space-y-3 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    Optimal Interception Point:
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    STAGE #{stages.find(s => s.phase === aiAnalysisResult.optimalInterceptionPhase)?.stageNumber || 3}: {aiAnalysisResult.optimalInterceptionPhase}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {aiAnalysisResult.interceptionRationale}
                </p>

                {aiAnalysisResult.stagesBreakdown && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Stage-by-Stage Disruption:
                    </span>
                    {aiAnalysisResult.stagesBreakdown.map((sb: any, i: number) => (
                      <div key={i} className="flex items-start justify-between text-[11px] py-1 border-b border-slate-100 dark:border-slate-900">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 w-32 shrink-0 truncate">
                          {sb.phase}
                        </span>
                        <span className="text-slate-500 truncate flex-1 px-2">{sb.defense}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${
                          sb.risk === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'
                        }`}>
                          {sb.risk}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Left-of-Boom Metrics Card */}
          <div
            className={`p-5 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <h3 className={`font-bold text-sm mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Left-of-Boom Interception Ratio
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span>Pre-Exploitation Block Rate (Stages 1-3)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">89.4%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '89.4%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span>Pre-C2 Interception Rate (Stages 4-5)</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">94.1%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '94.1%' }} />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500">Mean Dwell Time</span>
                  <p className="font-bold text-sm text-indigo-600 dark:text-indigo-400 font-mono">4.2 Minutes</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Total Attacks Severed</span>
                  <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">326 / 344</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
