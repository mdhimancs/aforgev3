import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Code2,
  Globe,
  Package,
  Key,
  Layers,
  Play,
  RefreshCw,
  Download,
  FileCode,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
  Bot,
  Copy,
  Check,
  Search,
  Filter,
  ArrowRight,
  Sliders,
  Terminal,
  FileText,
  Clock,
  GitBranch,
  Flame,
  CheckCheck,
  Zap,
  Server
} from 'lucide-react';
import {
  AppSecProject,
  SastFinding,
  DastProbeTarget,
  ScaPackage,
  SecretFinding,
  IacFinding,
  SeverityLevel
} from '../types';
import { PRESET_APPSEC_PROJECTS, SAMPLE_CODE_SNIPPETS } from '../data/appsecPresets';
import { AegisShieldView } from './AegisShieldView';
import { useTheme } from '../context/ThemeContext';

type AppSecTab = 'overview' | 'aegis' | 'sast' | 'dast' | 'sca' | 'secrets_iac' | 'ai_copilot' | 'reports';

export const AppSecDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [projects, setProjects] = useState<AppSecProject[]>(PRESET_APPSEC_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(PRESET_APPSEC_PROJECTS[0].id);
  const [activeTab, setActiveTab] = useState<AppSecTab>('overview');

  // Filter states
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected item details
  const [selectedSastId, setSelectedSastId] = useState<string | null>(
    PRESET_APPSEC_PROJECTS[0].sastFindings[0]?.id || null
  );
  const [selectedDastId, setSelectedDastId] = useState<string | null>(
    PRESET_APPSEC_PROJECTS[0].dastProbes[0]?.id || null
  );
  const [selectedScaId, setSelectedScaId] = useState<string | null>(
    PRESET_APPSEC_PROJECTS[0].scaPackages[0]?.id || null
  );

  // Live SAST code scanner state
  const [customCodeInput, setCustomCodeInput] = useState<string>(SAMPLE_CODE_SNIPPETS[0].code);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [isScanningCode, setIsScanningCode] = useState<boolean>(false);
  const [liveSastResults, setLiveSastResults] = useState<SastFinding[] | null>(null);

  // Live DAST target probe state
  const [dastTargetUrl, setDastTargetUrl] = useState<string>('https://api.acme-shop.io/v1/users/usr_99812/wallet-balance');
  const [dastMethod, setDastMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [dastAuthToken, setDastAuthToken] = useState<string>('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  const [isProbingDast, setIsProbingDast] = useState<boolean>(false);
  const [dastProbeResponse, setDastProbeResponse] = useState<any | null>(null);

  // AI Remediation generator state
  const [isGeneratingFix, setIsGeneratingFix] = useState<boolean>(false);
  const [aiFixData, setAiFixData] = useState<{
    remediatedCode?: string;
    explanation?: string;
    unitTestCode?: string;
  } | null>(null);

  // Live SCA manifest scanner state
  const [manifestText, setManifestText] = useState<string>(`{
  "name": "payment-microservice",
  "version": "1.0.0",
  "dependencies": {
    "jsonwebtoken": "8.5.1",
    "lodash": "4.17.15",
    "express": "4.16.0",
    "axios": "0.21.1",
    "cookie-parser": "1.4.3"
  }
}`);
  const [manifestEcosystem, setManifestEcosystem] = useState<'npm' | 'pypi'>('npm');
  const [isScanningManifest, setIsScanningManifest] = useState<boolean>(false);
  const [customScaPackages, setCustomScaPackages] = useState<ScaPackage[] | null>(null);
  const [scaViewMode, setScaViewMode] = useState<'inventory' | 'live_manifest'>('inventory');

  // AI Security Copilot state
  const [copilotMessages, setCopilotMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: 'Hello! I am your Cybershield AppSec Copilot. I can analyze SAST/DAST findings, suggest remediation patches, evaluate supply-chain CVE impact, or generate CI/CD security quality gates. How can I assist your security review today?'
    }
  ]);
  const [copilotInput, setCopilotInput] = useState<string>('');
  const [isCopilotThinking, setIsCopilotThinking] = useState<boolean>(false);

  // Global full scan state
  const [isFullScanning, setIsFullScanning] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate high-level vulnerability metrics
  const allSast = currentProject.sastFindings;
  const allDast = currentProject.dastProbes;
  const allSca = currentProject.scaPackages.flatMap((p) => p.vulnerabilities);
  const allSecrets = currentProject.secretFindings;
  const allIac = currentProject.iacFindings;

  const totalCritical =
    allSast.filter((f) => f.severity === 'CRITICAL').length +
    allDast.filter((d) => d.status === 'vulnerable').length +
    allSca.filter((s) => s.severity === 'CRITICAL').length +
    allSecrets.filter((s) => s.severity === 'CRITICAL').length +
    allIac.filter((i) => i.severity === 'CRITICAL').length;

  const totalHigh =
    allSast.filter((f) => f.severity === 'HIGH').length +
    allSca.filter((s) => s.severity === 'HIGH').length +
    allSecrets.filter((s) => s.severity === 'HIGH').length +
    allIac.filter((i) => i.severity === 'HIGH').length;

  const totalMedium =
    allSast.filter((f) => f.severity === 'MEDIUM').length +
    allSca.filter((s) => s.severity === 'MEDIUM').length +
    allIac.filter((i) => i.severity === 'MEDIUM').length;

  const totalLow =
    allSast.filter((f) => f.severity === 'LOW').length +
    allSca.filter((s) => s.severity === 'LOW').length +
    allIac.filter((i) => i.severity === 'LOW').length;

  const totalVulnerabilities = totalCritical + totalHigh + totalMedium + totalLow;

  const isQualityGatePassed = totalCritical === 0 && totalHigh <= 1;

  // Run comprehensive scan
  const handleTriggerFullScan = () => {
    setIsFullScanning(true);
    setTimeout(() => {
      setIsFullScanning(false);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProjectId
            ? { ...p, lastScanned: 'Just now (Complete ASPM)', healthScore: Math.min(95, p.healthScore + 2) }
            : p
        )
      );
    }, 1800);
  };

  // Run live SAST code scan
  const handleRunLiveCodeScan = async () => {
    setIsScanningCode(true);
    try {
      const res = await fetch('/api/v1/appsec/scan-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: customCodeInput,
          language: SAMPLE_CODE_SNIPPETS[selectedSampleIndex]?.language || 'typescript',
          filename: 'custom_source.ts'
        })
      });
      const data = await res.json();
      if (data.findings) {
        setLiveSastResults(data.findings);
        if (data.findings.length > 0) {
          setSelectedSastId(data.findings[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to run SAST scan', err);
    } finally {
      setIsScanningCode(false);
    }
  };

  // Run live DAST target probe
  const handleRunDastProbe = async () => {
    setIsProbingDast(true);
    setDastProbeResponse(null);
    try {
      const res = await fetch('/api/v1/appsec/dast-probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: dastTargetUrl,
          method: dastMethod,
          category: 'API Security (BOLA/BFLA)',
          testPayload: dastAuthToken
        })
      });
      const data = await res.json();
      setDastProbeResponse(data.result);
    } catch (err) {
      console.error('DAST probe error', err);
    } finally {
      setIsProbingDast(false);
    }
  };

  // Generate AI remediation fix
  const handleGenerateAiFix = async (finding: SastFinding) => {
    setIsGeneratingFix(true);
    setAiFixData(null);
    try {
      const res = await fetch('/api/v1/appsec/ai-remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finding })
      });
      const data = await res.json();
      setAiFixData(data);
    } catch (err) {
      console.error('Failed to generate AI fix', err);
    } finally {
      setIsGeneratingFix(false);
    }
  };

  // Send Copilot chat
  const handleSendCopilotMessage = async () => {
    if (!copilotInput.trim()) return;
    const userMsg = copilotInput;
    setCopilotInput('');
    setCopilotMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsCopilotThinking(true);

    try {
      const res = await fetch('/api/v1/appsec/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context: {
            project: currentProject.name,
            totalCritical,
            totalHigh,
            sastFindingsCount: currentProject.sastFindings.length,
            dastProbesCount: currentProject.dastProbes.length,
            scaCount: currentProject.scaPackages.length
          }
        })
      });
      const data = await res.json();
      setCopilotMessages((prev) => [...prev, { sender: 'bot', text: data.reply || 'No advice received.' }]);
    } catch {
      setCopilotMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Encountered temporary network latency. Please check that input validation and parameter bindings are strictly enforced.'
        }
      ]);
    } finally {
      setIsCopilotThinking(false);
    }
  };

  const handleScanManifest = async () => {
    setIsScanningManifest(true);
    try {
      const res = await fetch('/api/v1/appsec/scan-dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifestText,
          ecosystem: manifestEcosystem
        })
      });
      const data = await res.json();
      if (data.packages && data.packages.length > 0) {
        setCustomScaPackages(data.packages);
        setSelectedScaId(data.packages[0].id);
      }
    } catch (err) {
      console.error("Failed to scan manifest:", err);
    } finally {
      setIsScanningManifest(false);
    }
  };

  const exportSarifReport = () => {
    const sarif = {
      $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
      version: "2.1.0",
      runs: [
        {
          tool: {
            driver: {
              name: "Cybershield AppSec Engine",
              semanticVersion: "2.4.0",
              informationUri: "https://github.com/agentforge/cybershield",
              rules: currentProject.sastFindings.map((f) => ({
                id: f.ruleId,
                name: f.title.replace(/\s+/g, ""),
                shortDescription: { text: f.title },
                fullDescription: { text: f.description },
                defaultConfiguration: {
                  level: f.severity === 'CRITICAL' || f.severity === 'HIGH' ? 'error' : f.severity === 'MEDIUM' ? 'warning' : 'note'
                },
                helpUri: "https://cwe.mitre.org",
                properties: {
                  cwe: [f.cwe],
                  owasp: f.owaspCategory
                }
              }))
            }
          },
          results: currentProject.sastFindings.map((f) => ({
            ruleId: f.ruleId,
            level: f.severity === 'CRITICAL' || f.severity === 'HIGH' ? 'error' : f.severity === 'MEDIUM' ? 'warning' : 'note',
            message: { text: `${f.title}: ${f.description}` },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: { uri: f.filePath },
                  region: {
                    startLine: f.lineNumber,
                    snippet: { text: f.codeSnippet }
                  }
                }
              }
            ]
          }))
        }
      ]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sarif, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `results-${currentProject.id}.sarif`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            LOW
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40">
            INFO
          </span>
        );
    }
  };

  const activeSastList = liveSastResults || currentProject.sastFindings;
  const activeScaList = customScaPackages || currentProject.scaPackages;
  const selectedSastFinding = activeSastList.find((f) => f.id === selectedSastId) || activeSastList[0];
  const selectedDastProbe = currentProject.dastProbes.find((d) => d.id === selectedDastId) || currentProject.dastProbes[0];
  const selectedScaPackage = activeScaList.find((p) => p.id === selectedScaId) || activeScaList[0];

  return (
    <div className={`flex flex-col flex-1 h-full overflow-hidden ${isLight ? 'bg-slate-100/80 text-slate-800' : 'bg-slate-900 text-slate-100'}`}>
      {/* Top Header & Project Selection Bar */}
      <div className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${isLight ? 'bg-slate-100/90 border-slate-200/90 shadow-xs' : 'bg-slate-900/90 border-slate-800'}`}>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Cybershield AppSec Center</h2>
              <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                SAST • DAST • SCA
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                {currentProject.repoUrl} : <span className="text-indigo-300">{currentProject.branch}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-slate-500" />
                Last Scan: {currentProject.lastScanned}
              </span>
            </div>
          </div>
        </div>

        {/* Project Selector & Scan Action */}
        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setLiveSastResults(null);
              setAiFixData(null);
            }}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleTriggerFullScan}
            disabled={isFullScanning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
          >
            {isFullScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Scan...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                <span>Run Full ASPM Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main AppSec Navigation Tabs */}
      <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 flex items-center justify-between shrink-0 overflow-x-auto pt-2">
         <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
              activeTab === 'overview'
                ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeTab === 'overview' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
            <span>Executive Overview</span>
          </button>
 
          <button
            onClick={() => setActiveTab('aegis')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
              activeTab === 'aegis'
                ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <div className="relative flex items-center">
              <Shield className={`w-4 h-4 ${activeTab === 'aegis' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className={`font-bold ${activeTab === 'aegis' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
              AEGIS Defense Shield
            </span>
            <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 text-[10px] rounded font-bold border border-emerald-300 uppercase">
              ACTIVE
            </span>
          </button>
 
          <button
            onClick={() => setActiveTab('sast')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
              activeTab === 'sast'
                ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Code2 className={`w-4 h-4 ${activeTab === 'sast' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
            <span>SAST (Static Code)</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded font-mono font-bold ${
              activeTab === 'sast' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700/80'
            }`}>
              {activeSastList.length}
            </span>
          </button>
 
          <button
            onClick={() => setActiveTab('dast')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
              activeTab === 'dast'
                ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Globe className={`w-4 h-4 ${activeTab === 'dast' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
            <span>DAST (Dynamic API)</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded font-mono font-bold ${
              activeTab === 'dast' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700/80'
            }`}>
              {currentProject.dastProbes.length}
            </span>
          </button>
 
          <button
            onClick={() => setActiveTab('sca')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
              activeTab === 'sca'
                ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Package className={`w-4 h-4 ${activeTab === 'sca' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
            <span>SCA & Dependencies</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded font-mono font-bold ${
              activeTab === 'sca' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700/80'
            }`}>
              {allSca.length} CVEs
            </span>
          </button>
 
          <button
            onClick={() => setActiveTab('secrets_iac')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
              activeTab === 'secrets_iac'
                ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Key className={`w-4 h-4 ${activeTab === 'secrets_iac' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
            <span>Secrets & IaC</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded font-mono font-bold ${
              activeTab === 'secrets_iac' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700/80'
            }`}>
              {allSecrets.length + allIac.length}
            </span>
          </button>
 
          <button
            onClick={() => setActiveTab('ai_copilot')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
              activeTab === 'ai_copilot'
                ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'ai_copilot' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'} animate-pulse`} />
            <span>AI Security Copilot</span>
          </button>
 
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
              activeTab === 'reports'
                ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'reports' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
            <span>Reports & CI/CD Gate</span>
          </button>
        </div>

        <div className="flex items-center gap-2 py-1">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
              isQualityGatePassed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isQualityGatePassed ? <CheckCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            CI/CD Quality Gate: {isQualityGatePassed ? 'PASSED' : 'BLOCKED'}
          </span>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {/* ======================================================== */}
        {/* 1. EXECUTIVE OVERVIEW SUB-TAB */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-3.5">
            {/* Top Stat Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Security Health Score */}
              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Security Health Score</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">{currentProject.healthScore}</span>
                  <span className="text-xs text-slate-500">/ 100</span>
                  <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    Grade B+
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full"
                    style={{ width: `${currentProject.healthScore}%` }}
                  />
                </div>
              </div>

              {/* Critical Findings */}
              <div className="p-4 bg-slate-900/70 border border-rose-500/30 rounded-xl relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-rose-300">Critical Severity</span>
                  <Flame className="w-4 h-4 text-rose-400" />
                </div>
                <div className="my-2">
                  <span className="text-3xl font-extrabold text-rose-400">{totalCritical}</span>
                  <span className="text-xs text-rose-300/70 ml-2">Requires immediate patch</span>
                </div>
                <p className="text-[11px] text-slate-400">SQLi, BOLA, JWT RCE, Exposed Keys</p>
              </div>

              {/* High Severity */}
              <div className="p-4 bg-slate-900/70 border border-amber-500/30 rounded-xl relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-300">High Severity</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="my-2">
                  <span className="text-3xl font-extrabold text-amber-400">{totalHigh}</span>
                  <span className="text-xs text-amber-300/70 ml-2">Fix in next release</span>
                </div>
                <p className="text-[11px] text-slate-400">SSRF, Path Traversal, CVEs</p>
              </div>

              {/* Medium / Low */}
              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Medium & Low</span>
                  <Layers className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="my-2">
                  <span className="text-3xl font-extrabold text-slate-200">{totalMedium + totalLow}</span>
                  <span className="text-xs text-slate-500 ml-2">Audited & monitored</span>
                </div>
                <p className="text-[11px] text-slate-400">CORS policies, XSS sanitization</p>
              </div>

              {/* MTTR Metric */}
              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Mean Time To Remediate</span>
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="my-2">
                  <span className="text-3xl font-extrabold text-indigo-300">2.4</span>
                  <span className="text-xs text-slate-400 ml-1">days average</span>
                </div>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> 42% faster with AI auto-fixes
                </p>
              </div>
            </div>

            {/* AppSec Scanning Pillars Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* AEGIS AI & RASP Shield Pillar */}
              <div
                onClick={() => setActiveTab('aegis')}
                className="p-5 bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/40 hover:border-indigo-400 rounded-xl transition-all cursor-pointer group shadow-lg shadow-indigo-500/5 relative overflow-hidden"
              >
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg shadow-md shadow-indigo-500/30">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">AEGIS Defense Shield</h3>
                <p className="text-xs text-slate-400 mb-3">Real-time LLM jailbreak, PII & RASP firewall</p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                  <span className="text-slate-400">Interception Rate:</span>
                  <span className="font-bold text-emerald-300">99.4% (7.8ms)</span>
                </div>
              </div>

              {/* SAST Pillar */}
              <div
                onClick={() => setActiveTab('sast')}
                className="p-5 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">SAST (Static Analysis)</h3>
                <p className="text-xs text-slate-400 mb-3">AST syntax parser & taint-analysis dataflow rules</p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                  <span className="text-slate-400">Findings:</span>
                  <span className="font-bold text-cyan-300">{allSast.length} issues</span>
                </div>
              </div>

              {/* DAST Pillar */}
              <div
                onClick={() => setActiveTab('dast')}
                className="p-5 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <Globe className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">DAST (Dynamic Testing)</h3>
                <p className="text-xs text-slate-400 mb-3">Black-box HTTP endpoint fuzzing & BOLA probes</p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                  <span className="text-slate-400">Endpoints Probed:</span>
                  <span className="font-bold text-emerald-300">{allDast.length} targets</span>
                </div>
              </div>

              {/* SCA Pillar */}
              <div
                onClick={() => setActiveTab('sca')}
                className="p-5 bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                    <Package className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-transform group-hover:translate-x-1" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">SCA & Supply Chain</h3>
                <p className="text-xs text-slate-400 mb-3">NVD CVE vulnerability scanner & SBOM generator</p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                  <span className="text-slate-400">Packages Analyzed:</span>
                  <span className="font-bold text-purple-300">{currentProject.scaPackages.length} dependencies</span>
                </div>
              </div>

              {/* Secrets & IaC Pillar */}
              <div
                onClick={() => setActiveTab('secrets_iac')}
                className="p-5 bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                    <Key className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Secrets & IaC Posture</h3>
                <p className="text-xs text-slate-400 mb-3">High-entropy credential leaks & Docker/K8s policies</p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                  <span className="text-slate-400">Hardcoded Secrets:</span>
                  <span className="font-bold text-amber-300">{allSecrets.length} detected</span>
                </div>
              </div>
            </div>

            {/* Compliance Frameworks Readiness */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                Industry Security & Compliance Mapping
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-slate-200">OWASP Top 10 (2021)</span>
                    <span className="text-xs font-bold text-amber-400">82%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '82%' }} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">A03 Injection & A01 Broken Access flags present</p>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-slate-200">SOC 2 Type II</span>
                    <span className="text-xs font-bold text-emerald-400">91%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '91%' }} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Access controls & secret rotation compliant</p>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-slate-200">PCI-DSS v4.0</span>
                    <span className="text-xs font-bold text-rose-400">64%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-400 h-full rounded-full" style={{ width: '64%' }} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Cardholder wallet BOLA probe requires fix</p>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-slate-200">NIST SP 800-53</span>
                    <span className="text-xs font-bold text-indigo-400">88%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-400 h-full rounded-full" style={{ width: '88%' }} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Supply-chain & software integrity verified</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* AEGIS DEFENSE SHIELD SUB-TAB                             */}
        {/* ======================================================== */}
        {activeTab === 'aegis' && <AegisShieldView />}

        {/* ======================================================== */}
        {/* 2. SAST (STATIC APPLICATION SECURITY TESTING) SUB-TAB */}
        {/* ======================================================== */}
        {activeTab === 'sast' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Finding List & Live Scanner Toggle */}
            <div className="lg:col-span-5 space-y-4">
              {/* Live Code Input Sandbox */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    Live SAST Code Scanner
                  </span>
                  <div className="flex items-center gap-1">
                    {SAMPLE_CODE_SNIPPETS.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedSampleIndex(idx);
                          setCustomCodeInput(sample.code);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                          selectedSampleIndex === idx
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Sample {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={customCodeInput}
                  onChange={(e) => setCustomCodeInput(e.target.value)}
                  rows={6}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="Paste JavaScript, TypeScript, or Python code to scan..."
                />

                <button
                  onClick={handleRunLiveCodeScan}
                  disabled={isScanningCode}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                >
                  {isScanningCode ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>AST Heuristics Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Scan Code with SAST Engine</span>
                    </>
                  )}
                </button>
              </div>

              {/* Finding List Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Static Findings ({activeSastList.length})
                </h4>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded px-2 py-1"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="HIGH">High Only</option>
                </select>
              </div>

              {/* Finding Items */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {activeSastList
                  .filter((f) => severityFilter === 'ALL' || f.severity === severityFilter)
                  .map((finding) => (
                    <div
                      key={finding.id}
                      onClick={() => {
                        setSelectedSastId(finding.id);
                        setAiFixData(null);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedSastId === finding.id
                          ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        {getSeverityBadge(finding.severity)}
                        <span className="text-[10px] font-mono text-slate-400">{finding.ruleId}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">{finding.title}</h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="truncate max-w-[220px]">{finding.filePath}:{finding.lineNumber}</span>
                        <span className="text-cyan-400">{finding.cwe.split(':')[0]}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right: Detailed Finding Inspector & AI Fix Generator */}
            <div className="lg:col-span-7 space-y-4">
              {selectedSastFinding ? (
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
                  {/* Finding Title & CWE Banner */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        {getSeverityBadge(selectedSastFinding.severity)}
                        <span className="text-xs font-mono text-indigo-400 font-semibold">
                          {selectedSastFinding.owaspCategory}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{selectedSastFinding.title}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedSastFinding.cwe}</p>
                    </div>

                    <button
                      onClick={() => handleGenerateAiFix(selectedSastFinding)}
                      disabled={isGeneratingFix}
                      className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 shrink-0 transition-all cursor-pointer"
                    >
                      {isGeneratingFix ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Patch...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Auto-Remediate</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Vulnerable Code Snippet */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                        {selectedSastFinding.filePath}:{selectedSastFinding.lineNumber}
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedSastFinding.codeSnippet, 'sast-snippet')}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedId === 'sast-snippet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedId === 'sast-snippet' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-3.5 bg-slate-900 rounded-xl border border-rose-500/30 text-xs font-mono text-rose-300 overflow-x-auto">
                      {selectedSastFinding.codeSnippet}
                    </pre>
                  </div>

                  {/* Taint Flow Propagation (Source -> Sanitizer -> Sink) */}
                  {selectedSastFinding.sourceSinkFlow && (
                    <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        Taint-Analysis Dataflow Flow
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
                        <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                          <span className="text-[10px] text-rose-400 block font-bold">SOURCE</span>
                          <span className="text-slate-300 text-[11px]">{selectedSastFinding.sourceSinkFlow.source}</span>
                        </div>
                        <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                          <span className="text-[10px] text-amber-400 block font-bold">SANITIZER</span>
                          <span className="text-slate-300 text-[11px]">{selectedSastFinding.sourceSinkFlow.sanitizer || 'None'}</span>
                        </div>
                        <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                          <span className="text-[10px] text-rose-400 block font-bold">SINK</span>
                          <span className="text-slate-300 text-[11px]">{selectedSastFinding.sourceSinkFlow.sink}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description & Impact */}
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-300 leading-relaxed">
                      <strong className="text-white">Analysis: </strong>
                      {selectedSastFinding.description}
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                      <strong className="text-rose-400">Security Impact: </strong>
                      {selectedSastFinding.impact}
                    </p>
                  </div>

                  {/* AI Generated Patch / Hardened Code View */}
                  {(aiFixData || selectedSastFinding.fixedCodeSnippet) && (
                    <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Remediated Secure Code Replacement
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                          Verified Safe
                        </span>
                      </div>

                      <pre className="p-3 bg-slate-900 rounded-lg border border-emerald-500/40 text-xs font-mono text-emerald-300 overflow-x-auto">
                        {aiFixData?.remediatedCode || selectedSastFinding.fixedCodeSnippet}
                      </pre>

                      {aiFixData?.explanation && (
                        <p className="text-xs text-slate-300">
                          <strong className="text-emerald-400">Why this fix is secure: </strong>
                          {aiFixData.explanation}
                        </p>
                      )}

                      {aiFixData?.unitTestCode && (
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 block mb-1">Regression Security Unit Test:</span>
                          <pre className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto">
                            {aiFixData.unitTestCode}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
                  Select a SAST finding to inspect code taint flow and generate remediations.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. DAST (DYNAMIC APPLICATION SECURITY TESTING) SUB-TAB */}
        {/* ======================================================== */}
        {activeTab === 'dast' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Active Dynamic Probe Configuration */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  Dynamic Endpoint Scanner Workbench
                </span>

                <div className="flex gap-2">
                  <select
                    value={dastMethod}
                    onChange={(e: any) => setDastMethod(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <input
                    type="text"
                    value={dastTargetUrl}
                    onChange={(e) => setDastTargetUrl(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="https://api.domain.com/v1/resource"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Authorization Header / JWT:</label>
                  <input
                    type="text"
                    value={dastAuthToken}
                    onChange={(e) => setDastAuthToken(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={handleRunDastProbe}
                  disabled={isProbingDast}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {isProbingDast ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing Dynamic Probe...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Send Dynamic Security Probe</span>
                    </>
                  )}
                </button>
              </div>

              {/* Probe Test Suite List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Automated Endpoint Test Battery ({currentProject.dastProbes.length})
                </h4>
                {currentProject.dastProbes.map((probe) => (
                  <div
                    key={probe.id}
                    onClick={() => setSelectedDastId(probe.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedDastId === probe.id
                        ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          probe.status === 'vulnerable'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {probe.status === 'vulnerable' ? 'VULNERABLE' : 'PASSED'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{probe.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">{probe.name}</h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span className="text-emerald-400">{probe.method}</span>
                      <span>HTTP {probe.responseStatus || 200} • {probe.latencyMs || 45}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: DAST Probe HTTP Inspector */}
            <div className="lg:col-span-7 space-y-4">
              {selectedDastProbe ? (
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
                  <div className="border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedDastProbe.status === 'vulnerable'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {selectedDastProbe.status === 'vulnerable' ? 'SECURITY BREACH DETECTED' : 'DEFENDED'}
                      </span>
                      <span className="text-xs font-mono text-emerald-400">{selectedDastProbe.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{selectedDastProbe.name}</h3>
                    <p className="text-xs text-slate-300 font-mono mt-1 break-all bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-emerald-400 font-bold mr-2">{selectedDastProbe.method}</span>
                      {selectedDastProbe.url}
                    </p>
                  </div>

                  {/* Vulnerability Evidence */}
                  {selectedDastProbe.evidence && (
                    <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        Exploitation Evidence:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{selectedDastProbe.evidence}</p>
                    </div>
                  )}

                  {/* HTTP Request / Response Trace */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">Payload Sent:</span>
                      <pre className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono text-amber-300 overflow-x-auto">
                        {selectedDastProbe.testPayload}
                      </pre>
                    </div>

                    {selectedDastProbe.responseSnippet && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block mb-1">Server Response Body:</span>
                        <pre className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                          {selectedDastProbe.responseSnippet}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Remediation Guide */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1.5">
                    <strong className="text-emerald-400 block">Remediation Action:</strong>
                    <p className="text-slate-300 leading-relaxed">{selectedDastProbe.remediation}</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
                  Select a dynamic endpoint probe to inspect raw HTTP traffic and evidence.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. SCA (SOFTWARE COMPOSITION ANALYSIS & SBOM) SUB-TAB */}
        {/* ======================================================== */}
        {activeTab === 'sca' && (
          <div className="space-y-6">
            {/* Top Toolbar: View Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScaViewMode('inventory')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    scaViewMode === 'inventory'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                  }`}
                >
                  Project Inventory ({currentProject.scaPackages.length})
                </button>
                <button
                  onClick={() => setScaViewMode('live_manifest')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    scaViewMode === 'live_manifest'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  <span>Live Manifest Scanner</span>
                  {customScaPackages && (
                    <span className="px-1.5 py-0.2 bg-purple-400/30 rounded text-[9px] font-mono text-purple-200">
                      {customScaPackages.length} pkgs
                    </span>
                  )}
                </button>
              </div>

              {scaViewMode === 'live_manifest' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Ecosystem:</span>
                  <select
                    value={manifestEcosystem}
                    onChange={(e: any) => {
                      const eco = e.target.value;
                      setManifestEcosystem(eco);
                      if (eco === 'npm') {
                        setManifestText(`{\n  "name": "payment-microservice",\n  "version": "1.0.0",\n  "dependencies": {\n    "jsonwebtoken": "8.5.1",\n    "lodash": "4.17.15",\n    "express": "4.16.0",\n    "axios": "0.21.1",\n    "cookie-parser": "1.4.3"\n  }\n}`);
                      } else {
                        setManifestText(`flask==1.0.2\nrequests==2.20.0\npyyaml==5.1\nsqlalchemy==1.2.0\ncryptography==3.2`);
                      }
                    }}
                    className="bg-slate-900 border border-slate-700 text-purple-300 text-xs rounded px-2.5 py-1 font-mono focus:outline-none"
                  >
                    <option value="npm">Node.js (package.json)</option>
                    <option value="pypi">Python (requirements.txt)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Live Manifest Input Box (When in Live Manifest Mode) */}
            {scaViewMode === 'live_manifest' && (
              <div className="p-4 bg-slate-900 border border-purple-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">
                      Paste {manifestEcosystem === 'npm' ? 'package.json' : 'requirements.txt'} Manifest
                    </span>
                  </div>
                  <button
                    onClick={handleScanManifest}
                    disabled={isScanningManifest}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-colors cursor-pointer"
                  >
                    {isScanningManifest ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Querying CVE & EPSS DB...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Scan Dependencies & SBOM</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  value={manifestText}
                  onChange={(e) => setManifestText(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none"
                  placeholder="Paste manifest dependencies here..."
                />
              </div>
            )}

            {/* Main SCA Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left: Package Inventory */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {scaViewMode === 'live_manifest' ? 'Scanned Packages' : 'Project Packages'} ({activeScaList.length})
                  </h4>
                  <span className="text-[11px] font-mono text-purple-400">Ecosystem: {manifestEcosystem}</span>
                </div>

                <div className="space-y-2">
                  {activeScaList.map((pkg) => {
                    const hasVuln = pkg.vulnerabilities && pkg.vulnerabilities.length > 0;
                    const highestSev = hasVuln ? pkg.vulnerabilities[0]?.severity : 'LOW';

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedScaId(pkg.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          selectedScaId === pkg.id
                            ? 'bg-slate-800/90 border-purple-500 shadow-md shadow-purple-500/10'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-white font-mono">{pkg.name}</span>
                          {hasVuln ? getSeverityBadge(highestSev) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              SECURE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>v{pkg.currentVersion} {pkg.fixVersion && `-> ${pkg.fixVersion}`}</span>
                          <span className={`text-[10px] ${pkg.licenseRisk === 'VIRAL_COPYLEFT' ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                            {pkg.license}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Dependency CVE & SBOM Inspector */}
              <div className="lg:col-span-7 space-y-4">
              {selectedScaPackage ? (
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
                  <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[10px] font-mono">
                          {selectedScaPackage.ecosystem}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {selectedScaPackage.isDirect ? 'Direct Dependency' : 'Transitive Dependency'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white font-mono">{selectedScaPackage.name}</h3>
                      <p className="text-xs text-slate-400">
                        Installed: <span className="font-mono text-slate-200">{selectedScaPackage.currentVersion}</span> • Latest:{' '}
                        <span className="font-mono text-slate-200">{selectedScaPackage.latestVersion}</span>
                      </p>
                    </div>

                    {selectedScaPackage.fixVersion && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Recommended Upgrade:</span>
                        <span className="text-xs font-bold text-emerald-400 font-mono">v{selectedScaPackage.fixVersion}</span>
                      </div>
                    )}
                  </div>

                  {/* License Risk Warning */}
                  {selectedScaPackage.licenseRisk === 'VIRAL_COPYLEFT' && (
                    <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs flex items-center gap-2 text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <strong>License Risk Warning (GPL-3.0 Copyleft): </strong>
                        Distribution of commercial software bundling this dependency may require open-sourcing the entire codebase.
                      </div>
                    </div>
                  )}

                  {/* Vulnerabilities List */}
                  {selectedScaPackage.vulnerabilities.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Known Vulnerabilities (NVD / CVE)
                      </h4>
                      {selectedScaPackage.vulnerabilities.map((vuln) => (
                        <div key={vuln.cveId} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-purple-300 font-mono">{vuln.cveId}</span>
                              {vuln.ghsaId && (
                                <span className="text-[10px] text-slate-400 font-mono">{vuln.ghsaId}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-400">CVSS {vuln.cvssScore}</span>
                              {getSeverityBadge(vuln.severity)}
                            </div>
                          </div>

                          <h5 className="text-xs font-bold text-white">{vuln.title}</h5>
                          <p className="text-xs text-slate-300 leading-relaxed">{vuln.description}</p>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400">Affected: {vuln.affectedRange}</span>
                            <span className="text-emerald-400">Patched in: &gt;= {vuln.fixedIn}</span>
                          </div>

                          {vuln.patchCommand && (
                            <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 text-[11px] font-mono text-slate-300 flex justify-between items-center">
                              <span>$ {vuln.patchCommand}</span>
                              <button
                                onClick={() => copyToClipboard(vuln.patchCommand!, 'patch-cmd')}
                                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                              >
                                {copiedId === 'patch-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                      No known CVE security advisories reported for this package version.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
                  Select a dependency to review CVE advisories, EPSS exploitability, and license risks.
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* ======================================================== */}
        {/* 5. SECRETS & CLOUD IAC SUB-TAB */}
        {/* ======================================================== */}
        {activeTab === 'secrets_iac' && (
          <div className="space-y-6">
            {/* Hardcoded Secrets Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Hardcoded Secrets & High-Entropy Credentials ({currentProject.secretFindings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentProject.secretFindings.map((sec) => (
                  <div key={sec.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      {getSeverityBadge(sec.severity)}
                      <span className="text-[10px] font-mono text-slate-400">Shannon Entropy: {sec.entropy}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{sec.title}</h4>
                    <pre className="p-2 bg-slate-900 rounded border border-amber-500/30 text-xs font-mono text-amber-300 overflow-x-auto">
                      {sec.maskedSecret}
                    </pre>
                    <div className="text-xs text-slate-400 font-mono">
                      File: {sec.filePath}:{sec.lineNumber}
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                      <strong className="text-amber-400">Action: </strong>
                      {sec.remediation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cloud & IaC Posture Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                Infrastructure as Code (Docker / K8s / Terraform) Policies ({currentProject.iacFindings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentProject.iacFindings.map((iac) => (
                  <div key={iac.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-mono">
                        {iac.framework}
                      </span>
                      {getSeverityBadge(iac.severity)}
                    </div>
                    <h4 className="text-xs font-bold text-white">{iac.title}</h4>
                    <p className="text-xs text-slate-400 font-mono">{iac.filePath} ({iac.resourceName})</p>
                    <p className="text-xs text-slate-300">{iac.description}</p>
                    <p className="text-xs text-emerald-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                      <strong className="text-emerald-400">Remediation: </strong>
                      {iac.remediation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. AI SECURITY COPILOT & REMEDIATION SUB-TAB */}
        {/* ======================================================== */}
        {activeTab === 'ai_copilot' && (
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl max-w-4xl mx-auto space-y-4 flex flex-col h-[600px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Cybershield AppSec Copilot (Gemini 3.7 Flash)</h3>
                  <p className="text-[11px] text-slate-400">Contextual vulnerability triage, secure refactoring & compliance advisory</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-mono rounded">
                LIVE REASONING
              </span>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {copilotMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 text-xs ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-xl max-w-[85%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isCopilotThinking && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                  Analyzing AppSec findings & generating secure solution...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCopilotMessage()}
                placeholder="Ask about fixing SQL injection, BOLA middleware, CycloneDX export, or SOC2 compliance..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={handleSendCopilotMessage}
                disabled={isCopilotThinking || !copilotInput.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. REPORTS & CI/CD QUALITY GATE SUB-TAB */}
        {/* ======================================================== */}
        {activeTab === 'reports' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* CI/CD Quality Gate Policy */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  CI/CD Build Quality Gate Rules
                </h3>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    isQualityGatePassed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  Policy Status: {isQualityGatePassed ? 'PASSING' : 'FAILING (PR BLOCKED)'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Enforce security thresholds in your GitHub Actions / GitLab CI pipeline to automatically reject pull requests containing unmitigated Critical vulnerabilities.
              </p>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5">
                <div className="flex justify-between">
                  <span>Rule 1: Max Critical SAST / DAST Findings Allowed</span>
                  <span className="font-bold text-rose-400">0 (Current: {totalCritical})</span>
                </div>
                <div className="flex justify-between">
                  <span>Rule 2: Max CVSS &gt;= 9.0 Dependency CVEs</span>
                  <span className="font-bold text-amber-400">0 Allowed</span>
                </div>
                <div className="flex justify-between">
                  <span>Rule 3: Shannon Entropy Secrets Gate</span>
                  <span className="font-bold text-emerald-400">Strict Block</span>
                </div>
              </div>
            </div>

            {/* GitHub Actions CI/CD YAML Snippet */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  GitHub Actions Pipeline Configuration (.github/workflows/appsec.yml)
                </h3>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `name: Cybershield AppSec Gate\non: [push, pull_request]\njobs:\n  security:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Run SAST & SCA Scan\n        run: npm run security:scan\n      - name: Upload SARIF Report\n        uses: github/codeql-action/upload-sarif@v3\n        with:\n          sarif_file: results.sarif`,
                      'ci-yaml'
                    )
                  }
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                >
                  {copiedId === 'ci-yaml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedId === 'ci-yaml' ? 'Copied YAML' : 'Copy Workflow'}
                </button>
              </div>

              <pre className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
{`name: Cybershield AppSec Gate
on: [push, pull_request]

jobs:
  appsec-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run SAST Static Code Analysis
        run: npx cybershield-cli scan --sast --fail-on-critical

      - name: Run SCA Dependency Audit & SBOM
        run: npx cybershield-cli sca --sbom cyclonedx.json

      - name: Upload SARIF to GitHub Code Scanning
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: appsec-results.sarif`}
              </pre>
            </div>

            {/* Export Actions */}
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={exportSarifReport}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold flex items-center gap-2 border border-cyan-500/30 cursor-pointer"
              >
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Export SARIF 2.1.0 (GitHub / GitLab)</span>
              </button>

              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentProject, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `appsec-report-${currentProject.id}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export JSON Audit Report</span>
              </button>

              <button
                onClick={() => {
                  const sbom = {
                    bomFormat: "CycloneDX",
                    specVersion: "1.5",
                    version: 1,
                    metadata: {
                      timestamp: new Date().toISOString(),
                      component: { name: currentProject.name, version: "1.0.0" }
                    },
                    components: currentProject.scaPackages.map((p) => ({
                      type: "library",
                      name: p.name,
                      version: p.currentVersion,
                      licenses: [{ license: { id: p.license } }]
                    }))
                  };
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sbom, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `sbom-cyclonedx-${currentProject.id}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <FileCode className="w-4 h-4" />
                <span>Export CycloneDX SBOM</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
