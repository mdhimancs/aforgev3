import React, { useState } from 'react';
import {
  Shield,
  Activity,
  Zap,
  Terminal,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
  Send,
  Sparkles,
  Bot,
  Layers,
  ArrowRight,
  Server,
  Lock,
  Globe,
  Radio,
  User,
  Laptop,
  Cloud,
  Mail,
  RefreshCw,
  Sliders,
  ExternalLink,
  ChevronRight,
  Database,
  Cpu,
  GitFork,
  Crosshair,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  UserX,
  Bug
} from 'lucide-react';
import {
  SiemLogEvent,
  SiemHuntQuery,
  SoarPlaybook,
  XdrIncidentStory,
  AiPentestCampaign,
  SecOpsChatMessage,
  SeverityLevel
} from '../types';
import {
  SAMPLE_SIEM_LOGS,
  PRESET_SIEM_HUNT_QUERIES,
  SAMPLE_SOAR_PLAYBOOKS,
  SAMPLE_XDR_INCIDENTS,
  SAMPLE_AI_PENTEST_CAMPAIGNS
} from '../data/secOpsData';
import { useTheme } from '../context/ThemeContext';
import { CyberKillChainView } from './CyberKillChainView';
import { AttackTreeModelerView } from './AttackTreeModelerView';
import { ThreatHuntingHubView } from './ThreatHuntingHubView';
import { OsintReconView } from './OsintReconView';
import { SpireStripeHub } from './SpireStripeHub';
import { CspmCiemView } from './CspmCiemView';
import { TpcrmVendorView } from './TpcrmVendorView';
import { DspmDlpView } from './DspmDlpView';
import { GrcAuditView } from './GrcAuditView';
import { DarkWebCtiView } from './DarkWebCtiView';
import { UebaAnalyticsView } from './UebaAnalyticsView';
import { DlpSecurityView } from './DlpSecurityView';
import { IdsIpsWafView } from './IdsIpsWafView';
import { MalwareCampaignsView } from './MalwareCampaignsView';

export function AiSecOpsNexus() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Sub-tabs: 'osint' | 'spire_stripe' | 'cspm' | 'tpcrm' | 'dspm' | 'grc' | 'darkweb' | 'ueba' | 'dlp' | 'killchain' | 'attacktree' | 'threathunt' | 'siem' | 'soar' | 'xdr' | 'aipentest' | 'ids_ips_waf' | 'malware_campaigns'
  const [activeTab, setActiveTab] = useState<
    | 'osint'
    | 'spire_stripe'
    | 'cspm'
    | 'tpcrm'
    | 'dspm'
    | 'grc'
    | 'darkweb'
    | 'ueba'
    | 'dlp'
    | 'killchain'
    | 'attacktree'
    | 'threathunt'
    | 'siem'
    | 'soar'
    | 'xdr'
    | 'aipentest'
    | 'ids_ips_waf'
    | 'malware_campaigns'
  >('ids_ips_waf');

  // SIEM State
  const [siemLogs, setSiemLogs] = useState<SiemLogEvent[]>(SAMPLE_SIEM_LOGS);
  const [huntInput, setHuntInput] = useState('Detect impossible travel logins with rapid privilege escalation or shadow copy deletion');
  const [activeHuntResult, setActiveHuntResult] = useState<SiemHuntQuery>(PRESET_SIEM_HUNT_QUERIES[0]);
  const [isHunting, setIsHunting] = useState(false);
  const [logFilter, setLogFilter] = useState<'ALL' | 'ANOMALOUS' | 'AUTH' | 'EXECUTION' | 'CLOUD'>('ALL');
  const [copiedQueryType, setCopiedQueryType] = useState<string | null>(null);

  // SOAR State
  const [playbooks, setPlaybooks] = useState<SoarPlaybook[]>(SAMPLE_SOAR_PLAYBOOKS);
  const [activePlaybookId, setActivePlaybookId] = useState<string>(SAMPLE_SOAR_PLAYBOOKS[0].id);
  const [isExecutingPlaybook, setIsExecutingPlaybook] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [playbookLogs, setPlaybookLogs] = useState<string[]>([
    'SOAR Engine Initialized: Orchestrating 42 connected defensive API endpoints.',
    'Telemetry baseline verified. Ready for automated autonomous or manual containment execution.'
  ]);

  // XDR State
  const [xdrIncident, setXdrIncident] = useState<XdrIncidentStory>(SAMPLE_XDR_INCIDENTS[0]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-process');
  const [isCorrelating, setIsCorrelating] = useState(false);

  // AI PenTest State
  const [campaigns, setCampaigns] = useState<AiPentestCampaign[]>(SAMPLE_AI_PENTEST_CAMPAIGNS);
  const [activeCampaignId, setActiveCampaignId] = useState<string>(SAMPLE_AI_PENTEST_CAMPAIGNS[0].id);
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);
  const [newCampaignGoal, setNewCampaignGoal] = useState('Identify high-impact business logic and cloud IAM escalation paths');
  const [newCampaignTarget, setNewCampaignTarget] = useState('https://api.agentforge.corp/v2');
  const [fuzzPayloadInput, setFuzzPayloadInput] = useState('{"role": "user", "orgId": "ws_101"}');
  const [mutatedPayloads, setMutatedPayloads] = useState<string[]>([
    '{"role": "admin", "orgId": "ws_001_CORP_ROOT"} // BOLA Param Swap',
    '{"role": ["admin", "superadmin"], "orgId": "1\' OR 1=1--"} // Array + SQLi',
    '{"role": "user", "orgId": {"$ne": null}} // NoSQL Injection bypass',
    '{"role": "user", "orgId": "http://169.254.169.254/"} // SSRF IMDS probe'
  ]);

  // Copilot Drawer State
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);
  const [copilotInput, setCopilotInput] = useState('');
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<SecOpsChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      content: `👋 **Welcome to the AI Cyber Fusion Center!**\n\nI am your **AI SecOps Copilot**, continuously reasoning across **SIEM** (Log telemetry & NLP threat hunting), **SOAR** (Autonomous response playbooks), **XDR** (Cross-vector attack graphs), and **AI PenTesting** (Autonomous Red-Team agents).\n\nHow can I assist your defense operations today?`,
      timestamp: '11:25 AM',
      actionButtons: [
        { label: '🔍 Hunt: Impossible Travel + Privilege Abuse', action: 'hunt_travel' },
        { label: '⚡ Execute Ransomware Containment Playbook', action: 'run_ransomware' },
        { label: '🌐 Reconstruct APT Attack Story', action: 'show_xdr' },
        { label: '🎯 Plan Autonomous AI PenTest Campaign', action: 'plan_pentest' },
      ],
    },
  ]);

  const activePlaybook = playbooks.find((p) => p.id === activePlaybookId) || playbooks[0];
  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];

  // Copy helper
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQueryType(type);
    setTimeout(() => setCopiedQueryType(null), 2000);
  };

  // 1. SIEM: Execute AI Natural Language Threat Hunt
  const handleExecuteSiemHunt = async (queryText?: string) => {
    const q = queryText || huntInput;
    if (!q.trim()) return;
    setIsHunting(true);

    try {
      const res = await fetch('/api/v1/secops/siem-hunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveHuntResult({
          id: `hunt-${Date.now()}`,
          naturalQuery: q,
          generatedKql: data.generatedKql || PRESET_SIEM_HUNT_QUERIES[0].generatedKql,
          generatedSpl: data.generatedSpl || PRESET_SIEM_HUNT_QUERIES[0].generatedSpl,
          matchedCount: data.matchedLogsCount || 4,
          aiRationale: data.aiRationale || 'Correlated telemetry matches cross-system anomalous pattern.',
          threatLikelihood: data.threatLikelihood || 'CRITICAL',
        });
      }
    } catch {
      // Fallback preset
      setActiveHuntResult({
        id: `hunt-${Date.now()}`,
        naturalQuery: q,
        generatedKql: PRESET_SIEM_HUNT_QUERIES[0].generatedKql,
        generatedSpl: PRESET_SIEM_HUNT_QUERIES[0].generatedSpl,
        matchedCount: 3,
        aiRationale: 'AI correlation matched 3 active host signals with elevated risk signatures.',
        threatLikelihood: 'HIGH',
      });
    } finally {
      setIsHunting(false);
    }
  };

  // 2. SOAR: Execute Playbook Steps
  const handleExecuteSoarPlaybook = async () => {
    if (isExecutingPlaybook) return;
    setIsExecutingPlaybook(true);
    setCurrentStepIndex(0);

    setPlaybookLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ▶ Triggering Playbook: "${activePlaybook.name}" (Autonomous Gate Active)`
    ]);

    for (let i = 0; i < activePlaybook.steps.length; i++) {
      setCurrentStepIndex(i);
      const step = activePlaybook.steps[i];

      // Update step to running
      setPlaybooks((prev) =>
        prev.map((pb) =>
          pb.id === activePlaybook.id
            ? {
                ...pb,
                status: 'EXECUTING',
                steps: pb.steps.map((s, idx) => (idx === i ? { ...s, status: 'RUNNING' } : s)),
              }
            : pb
        )
      );

      // Call API
      try {
        const res = await fetch('/api/v1/secops/soar-execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playbookId: activePlaybook.id,
            stepId: step.id,
            context: { targetSystem: step.targetSystem, params: step.params },
          }),
        });
        const data = await res.json();

        await new Promise((r) => setTimeout(r, 600));

        setPlaybookLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✓ Step ${step.order} [${step.actionType}]: ${step.title} -> ${data.outputMessage || 'Success'}`
        ]);

        setPlaybooks((prev) =>
          prev.map((pb) =>
            pb.id === activePlaybook.id
              ? {
                  ...pb,
                  steps: pb.steps.map((s, idx) =>
                    idx === i
                      ? {
                          ...s,
                          status: 'COMPLETED',
                          outputMessage: data.outputMessage || 'Executed successfully',
                          executionDurationMs: data.executionDurationMs || 340,
                        }
                      : s
                  ),
                }
              : pb
          )
        );
      } catch {
        setPlaybooks((prev) =>
          prev.map((pb) =>
            pb.id === activePlaybook.id
              ? {
                  ...pb,
                  steps: pb.steps.map((s, idx) => (idx === i ? { ...s, status: 'COMPLETED' } : s)),
                }
              : pb
          )
        );
      }
    }

    setIsExecutingPlaybook(false);
    setCurrentStepIndex(-1);
    setPlaybooks((prev) =>
      prev.map((pb) => (pb.id === activePlaybook.id ? { ...pb, status: 'COMPLETED' } : pb))
    );

    setPlaybookLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🎉 Playbook Execution Complete. Threat fully neutralized and verified with 0 collateral alerts.`
    ]);
  };

  // 3. XDR: Correlate Incident
  const handleCorrelateXdr = async () => {
    setIsCorrelating(true);
    try {
      const res = await fetch('/api/v1/secops/xdr-correlate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: xdrIncident.id }),
      });
      const data = await res.json();
      if (data.success && data.attackStorySummary) {
        setXdrIncident((prev) => ({
          ...prev,
          aiExecutiveSummary: data.attackStorySummary,
          rootCause: data.rootCauseAnalysis || prev.rootCause,
          recommendedActions: data.autonomousContainmentRecommendations || prev.recommendedActions,
        }));
      }
    } catch {
      // Keep state
    } finally {
      setIsCorrelating(false);
    }
  };

  // 4. AI PenTest: Plan Campaign
  const handleGenerateAiPentest = async () => {
    setIsGeneratingCampaign(true);
    try {
      const res = await fetch('/api/v1/secops/ai-pentest-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetName: 'Custom Target Environment',
          targetUrl: newCampaignTarget,
          attackGoal: newCampaignGoal,
        }),
      });
      const data = await res.json();
      if (data.success && data.plannedSteps) {
        const newCampaign: AiPentestCampaign = {
          id: `campaign-${Date.now()}`,
          targetName: `Target: ${newCampaignTarget}`,
          goal: newCampaignGoal,
          status: 'IN_PROGRESS',
          totalSteps: data.plannedSteps.length,
          completedSteps: 2,
          vulnerabilitiesFoundCount: 2,
          aiStrategyAssessment: data.strategyAssessment || 'AI Red-Team Agent initiated autonomous recon and fuzzing pipeline.',
          steps: data.plannedSteps.map((s: any, idx: number) => ({
            stepNumber: s.step || idx + 1,
            phase: s.phase || 'Recon',
            action: s.action || 'Fuzzing endpoint',
            targetEndpoint: newCampaignTarget,
            payload: s.payload || 'test_payload',
            evasionStrategy: s.evasion || 'Adaptive jitter',
            observedResponse: idx < 2 ? 'HTTP 200 OK: Exploit confirmed' : 'PENDING_SCHEDULE',
            success: idx < 2,
            notes: 'Automated AI test step',
          })),
        };
        setCampaigns((prev) => [newCampaign, ...prev]);
        setActiveCampaignId(newCampaign.id);
      }
    } catch {
      // Fallback
    } finally {
      setIsGeneratingCampaign(false);
    }
  };

  // 5. Copilot Chat
  const handleSendCopilot = async (overrideText?: string) => {
    const text = overrideText || copilotInput;
    if (!text.trim() || isCopilotLoading) return;

    const userMsg: SecOpsChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setCopilotInput('');
    setIsCopilotLoading(true);

    try {
      const res = await fetch('/api/v1/secops/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatMessages.slice(-6).map((m) => ({ role: m.sender, content: m.content })),
          currentContext: {
            activeTab,
            selectedIncident: xdrIncident.title,
            activePlaybook: activePlaybook.name,
          },
        }),
      });
      const data = await res.json();

      const botMsg: SecOpsChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: data.reply || 'AI SecOps Copilot processed your inquiry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButtons: data.suggestedActions,
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: SecOpsChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: `**Analysis for: "${text}"**\n\n- **Identified Risk**: High priority correlation detected across telemetry feeds.\n- **Recommended Action**: Run the automated SOAR containment playbook and review the generated KQL hunting queries in the SIEM tab.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  // Filter logs
  const filteredLogs = siemLogs.filter((log) => {
    if (logFilter === 'ALL') return true;
    if (logFilter === 'ANOMALOUS') return log.isAnomalous;
    if (logFilter === 'AUTH') return log.category === 'Auth';
    if (logFilter === 'EXECUTION') return log.category === 'Execution';
    if (logFilter === 'CLOUD') return log.category === 'CloudAPI';
    return true;
  });

  return (
    <div
      className="flex flex-col flex-1 h-full w-full overflow-hidden font-sans bg-blue-50/30 text-slate-800 transition-colors"
    >
      {/* Top Banner / Tab Navigation */}
      <div
        className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-blue-100 shrink-0 bg-white shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-sm shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">
                AI Cyber Fusion Nexus
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Gemini 3.7 Core
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Exploring the usage of AI in SIEM, SOAR, XDR, and Autonomous PenTesting & VAPT
            </p>
          </div>
        </div>

        {/* Right Action: Toggle Copilot */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-copilot-drawer"
            onClick={() => setIsCopilotOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              isCopilotOpen
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-blue-500" />
            <span>{isCopilotOpen ? 'Hide AI Copilot' : 'Open AI Copilot'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Two-Level Cyber Domain & Tool Underline Tabs Selector */}
      <div
        id="fusion-center-domains-deck"
        className={`shrink-0 border-b p-3 ${
          isLight ? 'bg-slate-50 border-blue-100' : 'bg-[#161d2a] border-slate-800'
        }`}
      >
        {/* LEVEL 1: Main Cybersecurity Domain Underline Tabs */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              1. Select Cyber Command Domain
            </span>
            <span className="text-[10px] font-mono text-indigo-500 font-bold">
              Level 1 Selector
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800" style={{ scrollbarWidth: 'thin' }}>
            {[
              {
                id: 'siem_soar',
                title: 'SIEM & SOAR (SOC)',
                icon: <ShieldCheck className="w-3.5 h-3.5" />,
                apps: [
                  { id: 'ids_ips_waf', label: 'IDS/IPS/WAF Shield', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                  { id: 'siem', label: 'SIEM Log Analytics', icon: <Activity className="w-3.5 h-3.5" /> },
                  { id: 'soar', label: 'SOAR Automation', icon: <Zap className="w-3.5 h-3.5" /> },
                  { id: 'ueba', label: 'UEBA Behavior Analytics', icon: <UserX className="w-3.5 h-3.5" /> },
                ] as const,
              },
              {
                id: 'threat_intel',
                title: 'Active Threat Intel',
                icon: <Bug className="w-3.5 h-3.5" />,
                apps: [
                  { id: 'darkweb', label: 'Dark Web Scraper', icon: <Lock className="w-3.5 h-3.5" /> },
                  { id: 'osint', label: 'OSINT Surface Recon', icon: <Globe className="w-3.5 h-3.5" /> },
                  { id: 'malware_campaigns', label: 'APT Malware Feeds', icon: <Bug className="w-3.5 h-3.5" /> },
                ] as const,
              },
              {
                id: 'modeling',
                title: 'Forensic Modeling',
                icon: <Crosshair className="w-3.5 h-3.5" />,
                apps: [
                  { id: 'attacktree', label: 'Attack Tree Solver', icon: <GitFork className="w-3.5 h-3.5" /> },
                  { id: 'killchain', label: 'Cyber Kill Chain Map', icon: <Crosshair className="w-3.5 h-3.5" /> },
                  { id: 'threathunt', label: 'Threat Hunting Hub', icon: <Search className="w-3.5 h-3.5" /> },
                  { id: 'xdr', label: 'XDR Incident Story', icon: <Layers className="w-3.5 h-3.5" /> },
                ] as const,
              },
              {
                id: 'appsec',
                title: 'AppSec & VAPT',
                icon: <Terminal className="w-3.5 h-3.5" />,
                apps: [
                  { id: 'aipentest', label: 'AI Red-Team Pentest', icon: <Terminal className="w-3.5 h-3.5" /> },
                  { id: 'tpcrm', label: 'Third-Party Risk (TPCRM)', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
                ] as const,
              },
              {
                id: 'cloud_data',
                title: 'Cloud & Data Posture',
                icon: <Cloud className="w-3.5 h-3.5" />,
                apps: [
                  { id: 'cspm', label: 'CSPM & CIEM Cloud', icon: <Cloud className="w-3.5 h-3.5" /> },
                  { id: 'dspm', label: 'DSPM Data Inventory', icon: <Database className="w-3.5 h-3.5" /> },
                  { id: 'dlp', label: 'DLP Data Protection', icon: <Shield className="w-3.5 h-3.5" /> },
                ] as const,
              },
              {
                id: 'compliance',
                title: 'GRC Audits',
                icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                apps: [
                  { id: 'grc', label: 'GRC Compliance Center', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                ] as const,
              },
              {
                id: 'infrastructure',
                title: 'Infrastructure',
                icon: <CreditCard className="w-3.5 h-3.5" />,
                apps: [
                  { id: 'spire_stripe', label: 'Spire & Stripe Billing', icon: <CreditCard className="w-3.5 h-3.5" /> },
                ] as const,
              },
            ].map((group) => {
              const isGroupActive = group.apps.some((app) => app.id === activeTab);
              return (
                <button
                  key={group.id}
                  id={`btn-domain-group-${group.id}`}
                  onClick={() => setActiveTab(group.apps[0].id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                    isGroupActive
                      ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs'
                      : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
                  }`}
                  title={`Select ${group.title} domain (${group.apps[0].label})`}
                >
                  <div className={`p-1 rounded-md shrink-0 ${isGroupActive ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300' : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400'}`}>
                    {group.icon}
                  </div>
                  <span>{group.title}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    isGroupActive 
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200' 
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {group.apps.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LEVEL 2: Dynamic Sub-navigation Underline Tabs */}
        {(() => {
          const activeGroup = [
            {
              id: 'siem_soar',
              title: 'SIEM & SOAR (SOC)',
              apps: [
                { id: 'ids_ips_waf', label: 'IDS/IPS/WAF Shield', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                { id: 'siem', label: 'SIEM Log Analytics', icon: <Activity className="w-3.5 h-3.5" /> },
                { id: 'soar', label: 'SOAR Automation', icon: <Zap className="w-3.5 h-3.5" /> },
                { id: 'ueba', label: 'UEBA Behavior Analytics', icon: <UserX className="w-3.5 h-3.5" /> },
              ] as const,
            },
            {
              id: 'threat_intel',
              title: 'Active Threat Intel',
              apps: [
                { id: 'darkweb', label: 'Dark Web Scraper', icon: <Lock className="w-3.5 h-3.5" /> },
                { id: 'osint', label: 'OSINT Surface Recon', icon: <Globe className="w-3.5 h-3.5" /> },
                { id: 'malware_campaigns', label: 'APT Malware Feeds', icon: <Bug className="w-3.5 h-3.5" /> },
              ] as const,
            },
            {
              id: 'modeling',
              title: 'Forensic Modeling',
              apps: [
                { id: 'attacktree', label: 'Attack Tree Solver', icon: <GitFork className="w-3.5 h-3.5" /> },
                { id: 'killchain', label: 'Cyber Kill Chain Map', icon: <Crosshair className="w-3.5 h-3.5" /> },
                { id: 'threathunt', label: 'Threat Hunting Hub', icon: <Search className="w-3.5 h-3.5" /> },
                { id: 'xdr', label: 'XDR Incident Story', icon: <Layers className="w-3.5 h-3.5" /> },
              ] as const,
            },
            {
              id: 'appsec',
              title: 'AppSec & VAPT',
              apps: [
                { id: 'aipentest', label: 'AI Red-Team Pentest', icon: <Terminal className="w-3.5 h-3.5" /> },
                { id: 'tpcrm', label: 'Third-Party Risk (TPCRM)', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
              ] as const,
            },
            {
              id: 'cloud_data',
              title: 'Cloud & Data Posture',
              apps: [
                { id: 'cspm', label: 'CSPM & CIEM Cloud', icon: <Cloud className="w-3.5 h-3.5" /> },
                { id: 'dspm', label: 'DSPM Data Inventory', icon: <Database className="w-3.5 h-3.5" /> },
                { id: 'dlp', label: 'DLP Data Protection', icon: <Shield className="w-3.5 h-3.5" /> },
              ] as const,
            },
            {
              id: 'compliance',
              title: 'GRC Audits',
              apps: [
                { id: 'grc', label: 'GRC Compliance Center', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
              ] as const,
            },
            {
              id: 'infrastructure',
              title: 'Infrastructure',
              apps: [
                { id: 'spire_stripe', label: 'Spire & Stripe Billing', icon: <CreditCard className="w-3.5 h-3.5" /> },
              ] as const,
            },
          ].find((g) => g.apps.some((app) => app.id === activeTab)) || {
            id: 'siem_soar',
            title: 'SIEM & SOAR (SOC)',
            apps: [
              { id: 'ids_ips_waf', label: 'IDS/IPS/WAF Shield', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
              { id: 'siem', label: 'SIEM Log Analytics', icon: <Activity className="w-3.5 h-3.5" /> },
              { id: 'soar', label: 'SOAR Automation', icon: <Zap className="w-3.5 h-3.5" /> },
              { id: 'ueba', label: 'UEBA Behavior Analytics', icon: <UserX className="w-3.5 h-3.5" /> },
            ] as const,
          };

          return (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  2. Active Dashboard Tool under <strong className="text-slate-700 dark:text-slate-300 font-extrabold">{activeGroup.title}</strong>
                </span>
                <span className="text-[10px] font-mono text-blue-500 font-bold">
                  Level 2 Selector
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 border-b border-slate-200 dark:border-slate-800" style={{ scrollbarWidth: 'thin' }}>
                {activeGroup.apps.map((app) => {
                  const isAppActive = activeTab === app.id;
                  return (
                    <button
                      key={app.id}
                      id={`btn-subapp-${app.id}`}
                      onClick={() => setActiveTab(app.id as any)}
                      className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                        isAppActive
                          ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                          : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
                      }`}
                      title={`Open ${app.label} tool`}
                    >
                      <span className={`shrink-0 p-1 rounded-md ${
                        isAppActive ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300' : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400'
                      }`}>
                        {app.icon}
                      </span>
                      <span>{app.label}</span>
                      {isAppActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 ml-0.5 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center Content View with Flex Column wrapper to maintain layout */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Left / Center: Active AI Domain View */}
          {activeTab === 'ids_ips_waf' && <IdsIpsWafView />}
          {activeTab === 'malware_campaigns' && <MalwareCampaignsView />}
          {activeTab === 'killchain' && <CyberKillChainView />}
          {activeTab === 'attacktree' && <AttackTreeModelerView />}
          {activeTab === 'threathunt' && <ThreatHuntingHubView />}
          {activeTab === 'osint' && <OsintReconView />}
          {activeTab === 'spire_stripe' && <SpireStripeHub />}
          {activeTab === 'cspm' && <CspmCiemView />}
        {activeTab === 'tpcrm' && <TpcrmVendorView />}
        {activeTab === 'dspm' && <DspmDlpView />}
        {activeTab === 'grc' && <GrcAuditView />}
        {activeTab === 'darkweb' && <DarkWebCtiView />}
        {activeTab === 'ueba' && <UebaAnalyticsView />}
        {activeTab === 'dlp' && <DlpSecurityView />}

        {activeTab !== 'ids_ips_waf' &&
          activeTab !== 'killchain' &&
          activeTab !== 'attacktree' &&
          activeTab !== 'threathunt' &&
          activeTab !== 'osint' &&
          activeTab !== 'spire_stripe' &&
          activeTab !== 'cspm' &&
          activeTab !== 'tpcrm' &&
          activeTab !== 'dspm' &&
          activeTab !== 'grc' &&
          activeTab !== 'darkweb' &&
          activeTab !== 'ueba' &&
          activeTab !== 'dlp' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {/* ========================================================= */}
            {/* TAB 1: AI IN SIEM                                         */}
            {/* ========================================================= */}
            {activeTab === 'siem' && (
            <div className="space-y-3.5">
              {/* Value Metric Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className={`p-3 py-2.5 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-[#1f293b] border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>AI Noise Reduction</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      -94.2% Alerts
                    </span>
                  </div>
                  <div className="mt-1 text-xl font-black">94.2%</div>
                  <p className={`text-[10.5px] mt-0.5 leading-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    14,280 raw logs clustered into 8 actionable incidents
                  </p>
                </div>

                <div className={`p-3 py-2.5 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-[#1f293b] border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>NLP Threat Hunts</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                      KQL & SPL Auto
                    </span>
                  </div>
                  <div className="mt-1 text-xl font-black">100%</div>
                  <p className={`text-[10.5px] mt-0.5 leading-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Plain English to multi-SIEM query compilation
                  </p>
                </div>

                <div className={`p-3 py-2.5 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-[#1f293b] border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>UEBA Anomaly Engine</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                      Entropy & Travel
                    </span>
                  </div>
                  <div className="mt-1 text-xl font-black">99.1%</div>
                  <p className={`text-[10.5px] mt-0.5 leading-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Baseline deviation & impossible travel detection
                  </p>
                </div>

                <div className={`p-3 py-2.5 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-[#1f293b] border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>MTTD Acceleration</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                      3.4 min avg
                    </span>
                  </div>
                  <div className="mt-1 text-xl font-black">2.4 min</div>
                  <p className={`text-[10.5px] mt-0.5 leading-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Mean Time To Detect reduction from 4.2 hours
                  </p>
                </div>
              </div>

              {/* Natural Language Threat Hunting Engine */}
              <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#1f293b] border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-500" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">
                      AI Natural Language Threat Hunting Engine
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">
                    Auto-compiles to Microsoft Sentinel (KQL), Splunk (SPL), and Sigma YAML
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      id="input-siem-hunt"
                      type="text"
                      value={huntInput}
                      onChange={(e) => setHuntInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleExecuteSiemHunt()}
                      placeholder="e.g. Detect impossible travel logins followed by shadow copy deletion or admin privilege escalation..."
                      className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                          : 'bg-slate-900/80 border-slate-700 text-slate-100 placeholder:text-slate-500'
                      }`}
                    />
                  </div>
                  <button
                    id="btn-run-siem-hunt"
                    onClick={() => handleExecuteSiemHunt()}
                    disabled={isHunting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isHunting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Compiling...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>AI Threat Hunt</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick preset hunt pills */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-[11px] font-semibold text-slate-500">Preset Scenarios:</span>
                  {PRESET_SIEM_HUNT_QUERIES.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setHuntInput(preset.naturalQuery);
                        setActiveHuntResult(preset);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        huntInput === preset.naturalQuery
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {preset.naturalQuery.slice(0, 48)}...
                    </button>
                  ))}
                </div>

                {/* Generated Queries Display */}
                {activeHuntResult && (
                  <div className={`mt-4 p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                          {activeHuntResult.threatLikelihood} RISK
                        </span>
                        <span className="text-xs font-semibold">
                          AI Threat Correlation Rationale
                        </span>
                      </div>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                        {activeHuntResult.matchedCount} anomalous log events matched
                      </span>
                    </div>
                    <p className={`text-xs mb-3 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {activeHuntResult.aiRationale}
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {/* KQL (Sentinel) */}
                      <div className={`p-3 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-[#1a2233] border-slate-800'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400">
                            Microsoft Sentinel KQL
                          </span>
                          <button
                            onClick={() => copyToClipboard(activeHuntResult.generatedKql, 'kql')}
                            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 cursor-pointer"
                          >
                            {copiedQueryType === 'kql' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedQueryType === 'kql' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="text-[11px] font-mono p-2 rounded bg-slate-900 text-slate-200 overflow-x-auto max-h-36">
                          {activeHuntResult.generatedKql}
                        </pre>
                      </div>

                      {/* SPL (Splunk) */}
                      <div className={`p-3 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-[#1a2233] border-slate-800'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            Splunk SPL
                          </span>
                          <button
                            onClick={() => copyToClipboard(activeHuntResult.generatedSpl, 'spl')}
                            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 cursor-pointer"
                          >
                            {copiedQueryType === 'spl' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedQueryType === 'spl' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="text-[11px] font-mono p-2 rounded bg-slate-900 text-slate-200 overflow-x-auto max-h-36">
                          {activeHuntResult.generatedSpl}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Simulated Multi-Source Telemetry Feed */}
              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#1f293b] border-slate-800'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-500" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">
                      Live Multi-Vector Telemetry & AI Entropy Stream
                    </h2>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1">
                    {(['ALL', 'ANOMALOUS', 'AUTH', 'EXECUTION', 'CLOUD'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setLogFilter(filter)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          logFilter === filter
                            ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                            : isLight
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 overflow-x-auto">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-lg border flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 transition-all ${
                        log.anomalyScore > 90
                          ? isLight
                            ? 'bg-rose-50/70 border-rose-200'
                            : 'bg-rose-950/20 border-rose-900/40'
                          : isLight
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            log.anomalyScore > 90 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800">
                              {log.source}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {log.host}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              ({log.user})
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {log.timestamp.split('T')[1].replace('Z', '')} UTC
                            </span>
                          </div>
                          <p className={`text-[11px] mt-0.5 font-mono ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                            {log.rawMessage}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-bold text-slate-500">
                            AI Classification
                          </span>
                          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {log.aiClassification}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-black font-mono ${
                              log.anomalyScore > 90
                                ? 'bg-rose-500 text-white'
                                : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {log.anomalyScore} / 100
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: AI IN SOAR                                         */}
          {/* ========================================================= */}
          {activeTab === 'soar' && (
            <div className="space-y-3.5">
              {/* Playbook Header & Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {playbooks.map((pb) => (
                  <div
                    key={pb.id}
                    onClick={() => setActivePlaybookId(pb.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      activePlaybookId === pb.id
                        ? isLight
                          ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20'
                          : 'bg-amber-950/20 border-amber-500/50 ring-2 ring-amber-500/20'
                        : isLight
                        ? 'bg-white border-slate-200 hover:border-slate-300'
                        : 'bg-[#1f293b] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {pb.category}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          pb.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : pb.status === 'EXECUTING'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {pb.status}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold mt-1.5">{pb.name}</h3>
                    <p className={`text-[11px] mt-0.5 line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {pb.description}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[10.5px] text-slate-500">
                      <span>{pb.steps.length} Autonomous Steps</span>
                      <span>Threshold: {pb.confidenceThreshold}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Playbook Execution Workbench */}
              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#1f293b] border-slate-800'}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <h2 className="text-xs font-bold uppercase tracking-wider">
                        {activePlaybook.name}
                      </h2>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Trigger: <span className="font-mono text-indigo-600 dark:text-indigo-400">{activePlaybook.triggerEvent}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="btn-execute-soar-playbook"
                      onClick={handleExecuteSoarPlaybook}
                      disabled={isExecutingPlaybook}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isExecutingPlaybook ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Executing Containment Step {currentStepIndex + 1}/{activePlaybook.steps.length}...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white" />
                          <span>Dispatch Autonomous Response</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Step Pipeline Visualization */}
                <div className="space-y-3">
                  {activePlaybook.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        step.status === 'RUNNING'
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
                          : step.status === 'COMPLETED'
                          ? isLight
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-emerald-950/20 border-emerald-800/60'
                          : isLight
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                              step.status === 'COMPLETED'
                                ? 'bg-emerald-500 text-white'
                                : step.status === 'RUNNING'
                                ? 'bg-amber-500 text-white animate-pulse'
                                : 'bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold">{step.title}</span>
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-200 dark:bg-slate-800">
                                {step.actionType}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              Target API: {step.targetSystem} • Parameters: {JSON.stringify(step.params)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {step.status === 'COMPLETED' && (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{step.executionDurationMs}ms</span>
                            </span>
                          )}
                          {step.status === 'RUNNING' && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>In Flight...</span>
                            </span>
                          )}
                          {step.status === 'PENDING' && (
                            <span className="text-xs text-slate-400 font-mono">Standby</span>
                          )}
                        </div>
                      </div>

                      {step.outputMessage && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-mono text-emerald-700 dark:text-emerald-300">
                          ↳ {step.outputMessage}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Audit & Execution Logs Console */}
                <div className="mt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Cryptographic Response Audit Trail
                  </span>
                  <div className="mt-1.5 p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs max-h-36 overflow-y-auto space-y-1">
                    {playbookLogs.map((log, i) => (
                      <div key={i} className="text-slate-300">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: AI IN XDR                                         */}
          {/* ========================================================= */}
          {activeTab === 'xdr' && (
            <div className="space-y-5">
              {/* Incident Banner */}
              <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#1f293b] border-slate-800'}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-500 text-white">
                      {xdrIncident.severity}
                    </span>
                    <h2 className="text-sm font-bold">{xdrIncident.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-xdr-recorrelate"
                      onClick={handleCorrelateXdr}
                      disabled={isCorrelating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isCorrelating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Correlating Vectors...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Attack Story Synthesis</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 my-3">
                  {xdrIncident.affectedVectors.map((v) => (
                    <div
                      key={v}
                      className={`p-2 rounded-lg border text-center text-xs font-bold ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-cyan-300'
                      }`}
                    >
                      Vector: {v}
                    </div>
                  ))}
                </div>

                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  <strong>AI Executive Summary:</strong> {xdrIncident.aiExecutiveSummary}
                </p>
              </div>

              {/* Attack Graph & Multi-Vector Visual Topology */}
              <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#1f293b] border-slate-800'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      Cross-Vector Unified Attack Story Graph
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    Click node to inspect forensic artifacts
                  </span>
                </div>

                {/* Graph Node Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {xdrIncident.nodes.map((node) => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedNodeId === node.id
                          ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/20'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                          {node.type}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-500">
                          Risk {node.riskScore}
                        </span>
                      </div>
                      <div className="text-xs font-bold mt-1.5 truncate">{node.label}</div>
                      <p className={`text-[11px] mt-1 line-clamp-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {node.details}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Attack Path Connections */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    MITRE ATT&CK Technique Execution Flow
                  </span>
                  <div className="space-y-1.5">
                    {xdrIncident.edges.map((edge, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                            [{edge.techniqueId}]
                          </span>
                          <span className="font-semibold">{edge.label}</span>
                        </div>
                        <span className="text-slate-400 text-[11px] font-mono">{edge.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Containment Recommendations */}
                <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40">
                  <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-1.5">
                    Recommended Autonomous Containment Actions
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {xdrIncident.recommendedActions.map((act, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: AI IN PENTEST & VAPT                               */}
          {/* ========================================================= */}
          {activeTab === 'aipentest' && (
            <div className="space-y-5">
              {/* Campaign Creator & Strategy */}
              <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#1f293b] border-slate-800'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-rose-500" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">
                      Autonomous AI Red-Team Penetration Agent
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                    Authorized Pentest Mode
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500">Target Endpoint URL</label>
                    <input
                      id="input-pentest-target"
                      type="text"
                      value={newCampaignTarget}
                      onChange={(e) => setNewCampaignTarget(e.target.value)}
                      className={`w-full mt-1 px-3 py-2 rounded-lg text-xs border ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                      }`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-slate-500">Attack Objective & Scope</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        id="input-pentest-goal"
                        type="text"
                        value={newCampaignGoal}
                        onChange={(e) => setNewCampaignGoal(e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs border ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                        }`}
                      />
                      <button
                        id="btn-plan-pentest-chain"
                        onClick={handleGenerateAiPentest}
                        disabled={isGeneratingCampaign}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isGeneratingCampaign ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Planning...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Plan AI Exploit Chain</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Strategy Summary */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                    AI Strategy Assessment:
                  </div>
                  <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {activeCampaign.aiStrategyAssessment}
                  </p>
                </div>
              </div>

              {/* Multi-Stage Exploit Pipeline */}
              <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#1f293b] border-slate-800'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Autonomous Multi-Stage Exploit Chain Execution
                  </h3>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    {activeCampaign.vulnerabilitiesFoundCount} Confirmed Exploitations
                  </span>
                </div>

                <div className="space-y-3">
                  {activeCampaign.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className={`p-3.5 rounded-xl border transition-all ${
                        step.success
                          ? isLight
                            ? 'bg-rose-50/70 border-rose-200'
                            : 'bg-rose-950/20 border-rose-900/40'
                          : isLight
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                              step.success ? 'bg-rose-600 text-white' : 'bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {step.stepNumber}
                          </span>
                          <div>
                            <span className="text-xs font-bold">{step.action}</span>
                            <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800">
                              {step.phase}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold ${
                            step.success ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          {step.success ? 'EXPLOIT CONFIRMED' : 'SCHEDULED'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-500">Test Payload:</span>
                          <p className="text-slate-800 dark:text-slate-200 truncate">{step.payload}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Evasion Strategy:</span>
                          <p className="text-indigo-600 dark:text-indigo-400">{step.evasionStrategy}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Payload Mutation Playground */}
              <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#1f293b] border-slate-800'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      AI Dynamic Payload Mutator & Evasion Synthesizer
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    Real-time WAF & EDR bypass testing
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-500">Sample Injected Parameter:</span>
                  <input
                    type="text"
                    value={fuzzPayloadInput}
                    onChange={(e) => setFuzzPayloadInput(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-mono border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                  />
                </div>

                <div className="mt-3">
                  <span className="text-xs font-bold text-slate-500">
                    AI-Generated Obfuscation & Bypass Variants:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {mutatedPayloads.map((mut, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg border font-mono text-xs flex items-center justify-between ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-slate-200'
                        }`}
                      >
                        <span className="truncate">{mut}</span>
                        <button
                          onClick={() => copyToClipboard(mut, `mut-${i}`)}
                          className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

        </div> {/* Close Center Content View with Flex Column wrapper */}


        {/* Right Drawer: AI SecOps Copilot Assistant */}
        {isCopilotOpen && (
          <div
            className="w-96 border-l border-blue-100 flex flex-col shrink-0 bg-white shadow-xl"
          >
            {/* Copilot Header */}
            <div className="p-4 border-b border-blue-100 flex items-center justify-between bg-blue-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">AI SecOps Copilot</h3>
                  <span className="text-[10px] text-emerald-600 font-mono">● Online & Reasoning</span>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-3 rounded-2xl text-xs shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                    {/* Action buttons if any */}
                    {msg.actionButtons && msg.actionButtons.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1.5">
                        {msg.actionButtons.map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendCopilot(btn.label)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-slate-200 bg-white hover:bg-blue-50 text-blue-700 transition-all cursor-pointer"
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isCopilotLoading && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  <span>SecOps Copilot analyzing telemetry...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-blue-100 bg-slate-50">
              <div className="flex items-center gap-1.5">
                <input
                  id="input-copilot-chat"
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCopilot()}
                  placeholder="Ask SecOps Copilot anything..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  id="btn-send-copilot-chat"
                  onClick={() => handleSendCopilot()}
                  disabled={isCopilotLoading || !copilotInput.trim()}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
