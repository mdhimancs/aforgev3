import React, { useState } from 'react';
import {
  ShieldAlert,
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FileCode,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Sliders,
  Sparkles,
  ArrowRight,
  Send,
  Database,
  Globe,
  Key,
  Network
} from 'lucide-react';
import {
  VaptTargetScope,
  VaptTestVector,
  VaptFinding,
  VaptAuditReport,
  SeverityLevel
} from '../types';
import {
  PRESET_VAPT_SCOPES,
  PRESET_VAPT_TEST_VECTORS,
  PRESET_VAPT_FINDINGS,
  PRESET_VAPT_REPORT
} from '../data/vaptPresets';
import { useTheme } from '../context/ThemeContext';

type VaptTab = 'workbench' | 'findings' | 'cvss_calc' | 'scope_roe' | 'compliance_report';

export const VaptCenter: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<VaptTab>('workbench');
  const [scopes, setScopes] = useState<VaptTargetScope[]>(PRESET_VAPT_SCOPES);
  const [selectedScopeId, setSelectedScopeId] = useState<string>(PRESET_VAPT_SCOPES[0].id);
  const selectedScope = scopes.find(s => s.id === selectedScopeId) || scopes[0];

  // Test Vectors & Active Probe
  const [testVectors] = useState<VaptTestVector[]>(PRESET_VAPT_TEST_VECTORS);
  const [selectedVectorId, setSelectedVectorId] = useState<string>(PRESET_VAPT_TEST_VECTORS[0].id);
  const selectedVector = testVectors.find(v => v.id === selectedVectorId) || testVectors[0];

  // Workbench Form State
  const [targetEndpointUrl, setTargetEndpointUrl] = useState<string>(
    'https://api-staging.agentforge.bank/v1/accounts/acc_9921_VICTIM/transfers'
  );
  const [httpMethod, setHttpMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [customPayload, setCustomPayload] = useState<string>(selectedVector.testPayload);
  const [authHeader, setAuthHeader] = useState<string>('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

  // Probe Execution State
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [probeResult, setProbeResult] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Findings State
  const [findings, setFindings] = useState<VaptFinding[]>(PRESET_VAPT_FINDINGS);
  const [selectedFinding, setSelectedFinding] = useState<VaptFinding | null>(PRESET_VAPT_FINDINGS[0]);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // AI Remediation State
  const [isGeneratingRemediation, setIsGeneratingRemediation] = useState<boolean>(false);
  const [remediationOutput, setRemediationOutput] = useState<any>(null);
  const [targetLanguage, setTargetLanguage] = useState<'TypeScript' | 'Python' | 'Go'>('TypeScript');

  // Interactive CVSS Calculator State
  const [cvssMetrics, setCvssMetrics] = useState({
    av: 'N', // Attack Vector: Network (N), Adjacent (A), Local (L), Physical (P)
    ac: 'L', // Attack Complexity: Low (L), High (H)
    pr: 'L', // Privileges Required: None (N), Low (L), High (H)
    ui: 'N', // User Interaction: None (N), Required (R)
    s: 'U',  // Scope: Unchanged (U), Changed (C)
    c: 'H',  // Confidentiality: High (H), Low (L), None (N)
    i: 'H',  // Integrity: High (H), Low (L), None (N)
    a: 'N',  // Availability: High (H), Low (L), None (N)
  });

  // Calculate dynamic CVSS score
  const calculateCVSS = () => {
    let score = 0;
    // Base weightings (simplified CVSS 3.1 formula)
    const avW = cvssMetrics.av === 'N' ? 0.85 : cvssMetrics.av === 'A' ? 0.62 : 0.55;
    const acW = cvssMetrics.ac === 'L' ? 0.77 : 0.44;
    const prW = cvssMetrics.pr === 'N' ? 0.85 : cvssMetrics.pr === 'L' ? 0.62 : 0.27;
    const uiW = cvssMetrics.ui === 'N' ? 0.85 : 0.62;

    const exploitability = 8.22 * avW * acW * prW * uiW;

    const cW = cvssMetrics.c === 'H' ? 0.56 : cvssMetrics.c === 'L' ? 0.22 : 0;
    const iW = cvssMetrics.i === 'H' ? 0.56 : cvssMetrics.i === 'L' ? 0.22 : 0;
    const aW = cvssMetrics.a === 'H' ? 0.56 : cvssMetrics.a === 'L' ? 0.22 : 0;

    const iss = 1 - ((1 - cW) * (1 - iW) * (1 - aW));
    const impact = cvssMetrics.s === 'U' ? 6.42 * iss : 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);

    if (impact <= 0) return 0.0;
    score = cvssMetrics.s === 'U' ? Math.min(exploitability + impact, 10) : Math.min(1.08 * (exploitability + impact), 10);
    return Math.round(score * 10) / 10;
  };

  const currentCvssScore = calculateCVSS();
  const currentCvssVector = `CVSS:3.1/AV:${cvssMetrics.av}/AC:${cvssMetrics.ac}/PR:${cvssMetrics.pr}/UI:${cvssMetrics.ui}/S:${cvssMetrics.s}/C:${cvssMetrics.c}/I:${cvssMetrics.i}/A:${cvssMetrics.a}`;

  // Execute Live VAPT Probe
  const handleLaunchProbe = async () => {
    setIsProbing(true);
    setProbeResult(null);

    try {
      const res = await fetch('/api/v1/appsec/vapt-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: targetEndpointUrl,
          httpMethod,
          testVector: selectedVector,
          customPayload,
          authHeader,
          environment: selectedScope.environment
        })
      });

      const data = await res.json();
      setProbeResult(data);

      if (data.status === 'VULNERABLE') {
        const newFinding: VaptFinding = {
          id: `vapt-fnd-${Date.now().toString().slice(-4)}`,
          title: `${selectedVector.name} on ${new URL(targetEndpointUrl.startsWith('http') ? targetEndpointUrl : 'https://' + targetEndpointUrl).pathname}`,
          category: selectedVector.category,
          severity: data.severity || selectedVector.defaultSeverity,
          cvssScore: data.cvssScore || 8.5,
          cvssVector: data.cvssVector || currentCvssVector,
          cwe: selectedVector.cwe.split(':')[0] || 'CWE-200',
          owaspId: selectedVector.owaspRef.split(' - ')[0] || 'A01:2021',
          mitreId: selectedVector.mitreTechnique.split(' - ')[0] || 'T1190',
          targetUrl: targetEndpointUrl,
          httpMethod,
          testPayloadUsed: customPayload,
          proofOfConcept: data.proofOfConcept || '',
          impact: data.impactSummary || 'Potential vulnerability detected during automated penetration test.',
          exploitChain: [
            { step: '1. Reconnaissance', actor: 'Attacker', outcome: 'Discovered dynamic endpoint parameter' },
            { step: '2. Probe Execution', actor: 'VAPT Suite', outcome: 'Injected specialized test vector payload' },
            { step: '3. Response Verification', actor: 'Backend Server', outcome: 'Server confirmed anomalous security behavior' },
          ],
          remediationGuide: data.remediationAdvice || 'Implement strict input validation and access controls.',
          patchCode: data.patchCodeSnippet || '// Secure code fix',
          status: 'VULNERABLE',
        };

        setFindings(prev => [newFinding, ...prev]);
        setSelectedFinding(newFinding);
      }
    } catch (err) {
      console.error('VAPT probe failed:', err);
    } finally {
      setIsProbing(false);
    }
  };

  // Trigger AI Remediation
  const handleGenerateRemediation = async (findingToFix: VaptFinding) => {
    setIsGeneratingRemediation(true);
    setRemediationOutput(null);

    try {
      const res = await fetch('/api/v1/appsec/vapt-remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finding: findingToFix,
          language: targetLanguage
        })
      });

      const data = await res.json();
      setRemediationOutput(data);
    } catch (err) {
      console.error('Failed to generate remediation:', err);
    } finally {
      setIsGeneratingRemediation(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredFindings = findings.filter(f => {
    if (filterSeverity === 'ALL') return true;
    return f.severity === filterSeverity;
  });

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40">INFO</span>;
    }
  };

  return (
    <div className={`flex flex-col flex-1 h-full overflow-y-auto ${isLight ? 'bg-slate-100/80 text-slate-800' : 'bg-slate-900 text-slate-100'}`}>
      {/* Top Header & Target Scope Selector */}
      <div className={`border-b px-4 py-2.5 sticky top-0 z-20 backdrop-blur-md ${isLight ? 'bg-slate-100/90 border-slate-200/90 shadow-xs' : 'border-slate-800 bg-slate-900/90'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-rose-600 to-amber-600 rounded-xl shadow-lg shadow-rose-600/20 text-white">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>VAPT & Penetration Testing Workbench</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                  PTES • OWASP ASVS v4.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated vulnerability assessment, proof-of-concept fuzzing & verifiable exploit path auditing
              </p>
            </div>
          </div>

          {/* Scope Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Target Scope:</span>
              <select
                value={selectedScopeId}
                onChange={(e) => {
                  setSelectedScopeId(e.target.value);
                  const sc = scopes.find(s => s.id === e.target.value);
                  if (sc) setTargetEndpointUrl(sc.targetUrl);
                }}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                {scopes.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                    {s.name} ({s.environment})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setActiveTab('scope_roe')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span>Scope & RoE</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-200 dark:border-slate-800 pb-0.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('workbench')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
              activeTab === 'workbench'
                ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${activeTab === 'workbench' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
            <span>Interactive Attack Workbench</span>
          </button>
 
          <button
            onClick={() => setActiveTab('findings')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
              activeTab === 'findings'
                ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${activeTab === 'findings' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
            <span>Vulnerability Tracker ({findings.length})</span>
          </button>
 
          <button
            onClick={() => setActiveTab('cvss_calc')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
              activeTab === 'cvss_calc'
                ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Sliders className={`w-3.5 h-3.5 ${activeTab === 'cvss_calc' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
            <span>CVSS v3.1 Calculator</span>
          </button>
 
          <button
            onClick={() => setActiveTab('compliance_report')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
              activeTab === 'compliance_report'
                ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <FileCode className={`w-3.5 h-3.5 ${activeTab === 'compliance_report' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
            <span>Executive VAPT Report</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-3.5 flex-1">
        {/* ======================================================== */}
        {/* TAB 1: INTERACTIVE PEN-TESTING ATTACK WORKBENCH          */}
        {/* ======================================================== */}
        {activeTab === 'workbench' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Attack Vector Catalog */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Standardized Attack Vectors ({testVectors.length})</span>
                </h3>

                <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                  {testVectors.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => {
                        setSelectedVectorId(v.id);
                        setCustomPayload(v.testPayload);
                      }}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        v.id === selectedVectorId
                          ? 'bg-rose-950/40 border-rose-500/50 shadow-md shadow-rose-900/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white truncate max-w-[200px]">
                          {v.name}
                        </span>
                        {getSeverityBadge(v.defaultSeverity)}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{v.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{v.cwe.split(':')[0]}</span>
                        <span className="text-rose-400">{v.owaspRef.split(' - ')[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live Probe Dispatcher & Telemetry Console */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Target & Probe Configuration */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">Target Probe Dispatcher</h3>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    RoE Authorized: Safe Simulated Verification Mode
                  </span>
                </div>

                {/* URL and Method */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
                  <div className="md:col-span-3">
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">HTTP Method</label>
                    <select
                      value={httpMethod}
                      onChange={(e) => setHttpMethod(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:border-rose-500 focus:outline-none"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                  <div className="md:col-span-9">
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">Target Endpoint URL</label>
                    <input
                      type="text"
                      value={targetEndpointUrl}
                      onChange={(e) => setTargetEndpointUrl(e.target.value)}
                      placeholder="https://api.example.com/v1/resource"
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs rounded-lg px-3 py-2 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Authorization Header */}
                <div className="mb-4">
                  <label className="text-[11px] text-slate-400 font-medium flex items-center justify-between mb-1">
                    <span>Authorization Header (Simulated Attacker or Client Token)</span>
                    <span className="text-[10px] text-slate-500 font-mono">Authorization: Bearer &lt;token&gt;</span>
                  </label>
                  <input
                    type="text"
                    value={authHeader}
                    onChange={(e) => setAuthHeader(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs rounded-lg px-3 py-2 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                {/* Custom Probe Payload */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                      <CodeIcon />
                      <span>Penetration Test Payload / Request Body</span>
                    </label>
                    <button
                      onClick={() => setCustomPayload(selectedVector.testPayload)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset to Vector Default
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={customPayload}
                    onChange={(e) => setCustomPayload(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs rounded-lg p-3 focus:border-rose-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Launch Button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    Vector: <strong className="text-slate-200">{selectedVector.name}</strong>
                  </div>
                  <button
                    onClick={handleLaunchProbe}
                    disabled={isProbing}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 font-bold text-xs text-white shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isProbing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Executing Active Probe...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Launch Penetration Probe</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Probe Result & Proof of Concept (PoC) Console */}
              {probeResult && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      {probeResult.status === 'VULNERABLE' ? (
                        <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            Probe Outcome: {probeResult.status}
                          </h4>
                          {getSeverityBadge(probeResult.severity)}
                        </div>
                        <p className="text-xs text-slate-400">
                          Execution Latency: <span className="font-mono text-cyan-300">{probeResult.latencyMs}ms</span> | HTTP Status: <span className="font-mono text-amber-300">{probeResult.statusCode}</span>
                        </p>
                      </div>
                    </div>

                    {probeResult.cvssScore > 0 && (
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Calculated CVSS</div>
                        <div className="text-lg font-black text-rose-400 font-mono">{probeResult.cvssScore} / 10</div>
                      </div>
                    )}
                  </div>

                  {/* Impact Summary */}
                  <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300">
                    <strong className="text-rose-300 block mb-1">Exploitation Risk & Impact:</strong>
                    {probeResult.impactSummary}
                  </div>

                  {/* Proof of Concept Trace */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-rose-400" />
                        Proof-of-Concept (PoC) HTTP Evidence Trace
                      </span>
                      <button
                        onClick={() => handleCopyCode(probeResult.proofOfConcept)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedCode ? 'Copied' : 'Copy PoC'}
                      </button>
                    </div>
                    <pre className="p-3 bg-black/80 rounded-lg text-[11px] font-mono text-emerald-300 border border-slate-800 overflow-x-auto max-h-52 leading-relaxed">
                      {probeResult.proofOfConcept}
                    </pre>
                  </div>

                  {/* Quick Remediation Action */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Recommendation: <span className="text-slate-300">{probeResult.remediationAdvice}</span>
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab('findings');
                        if (findings[0]) handleGenerateRemediation(findings[0]);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ml-3"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Patch
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: VULNERABILITY TRACKER & REMEDIATION STUDIO        */}
        {/* ======================================================== */}
        {activeTab === 'findings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Findings List */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Vulnerabilities Discovered ({filteredFindings.length})
                  </h3>
                  <div className="flex items-center gap-1 text-xs">
                    {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setFilterSeverity(sev)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          filterSeverity === sev
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                  {filteredFindings.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => {
                        setSelectedFinding(f);
                        setRemediationOutput(null);
                      }}
                      className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                        selectedFinding?.id === f.id
                          ? 'bg-slate-800 border-rose-500 shadow-md'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white truncate max-w-[220px]">
                          {f.title}
                        </span>
                        {getSeverityBadge(f.severity)}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate mb-2">{f.targetUrl}</p>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-rose-400 font-bold font-mono">CVSS {f.cvssScore}</span>
                        <span className="text-slate-500 text-[10px]">{f.owaspId} • {f.cwe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Finding Deep-Dive & AI Remediation */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {selectedFinding ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getSeverityBadge(selectedFinding.severity)}
                        <span className="text-xs font-mono text-slate-400">{selectedFinding.owaspId}</span>
                        <span className="text-xs font-mono text-slate-400">{selectedFinding.cwe}</span>
                      </div>
                      <h3 className="text-base font-bold text-white">{selectedFinding.title}</h3>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">{selectedFinding.targetUrl}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-rose-400 font-mono">{selectedFinding.cvssScore}</div>
                      <div className="text-[10px] text-slate-500 font-mono">CVSS v3.1 BASE</div>
                    </div>
                  </div>

                  {/* Exploit Chain Diagram */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Multi-Stage Attack Chain
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {selectedFinding.exploitChain.map((step, idx) => (
                        <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                          <div className="text-[10px] font-bold text-rose-400 uppercase mb-1">{step.step}</div>
                          <div className="text-xs font-semibold text-slate-200 mb-0.5">{step.actor}</div>
                          <div className="text-[11px] text-slate-400">{step.outcome}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Proof of Concept Trace */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-300">Exploitation Evidence Trace</span>
                      <button
                        onClick={() => handleCopyCode(selectedFinding.proofOfConcept)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy PoC
                      </button>
                    </div>
                    <pre className="p-3 bg-black/80 rounded-lg text-[11px] font-mono text-emerald-300 border border-slate-800 overflow-x-auto max-h-40">
                      {selectedFinding.proofOfConcept}
                    </pre>
                  </div>

                  {/* AI Remediation Patch Generator */}
                  <div className="p-4 bg-gradient-to-br from-indigo-950/40 to-purple-950/30 rounded-xl border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-white">AI-Powered Developer Remediation</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={targetLanguage}
                          onChange={(e) => setTargetLanguage(e.target.value as any)}
                          className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-2 py-1 focus:outline-none"
                        >
                          <option value="TypeScript">TypeScript</option>
                          <option value="Python">Python</option>
                          <option value="Go">Go</option>
                        </select>

                        <button
                          onClick={() => handleGenerateRemediation(selectedFinding)}
                          disabled={isGeneratingRemediation}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isGeneratingRemediation ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          <span>Generate Fix</span>
                        </button>
                      </div>
                    </div>

                    {remediationOutput ? (
                      <div className="space-y-3 animate-fadeIn">
                        <div>
                          <div className="text-[11px] font-bold text-indigo-300 mb-1">Recommended Remediation Steps:</div>
                          <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                            {remediationOutput.remediationPlan?.map((step: string, i: number) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                            <span>Secure Code Patch ({targetLanguage}):</span>
                            <button
                              onClick={() => handleCopyCode(remediationOutput.patchedCode)}
                              className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" /> Copy Code
                            </button>
                          </div>
                          <pre className="p-3 bg-black/90 rounded-lg text-[11px] font-mono text-cyan-300 border border-slate-800 max-h-48 overflow-x-auto">
                            {remediationOutput.patchedCode}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Click <strong>Generate Fix</strong> to construct context-aware patch code, WAF defense filters, and automated security unit tests for this finding.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
                  Select a vulnerability from the tracker list to view exploitation forensics and AI patch guidance.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DYNAMIC CVSS v3.1 CALCULATOR                      */}
        {/* ======================================================== */}
        {activeTab === 'cvss_calc' && (
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>CVSS v3.1 Base Score Calculator</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Standardized vulnerability risk quantification and vector string generator
                </p>
              </div>

              <div className="text-right">
                <div className={`text-3xl font-black font-mono ${currentCvssScore >= 9.0 ? 'text-rose-400' : currentCvssScore >= 7.0 ? 'text-orange-400' : currentCvssScore >= 4.0 ? 'text-amber-400' : 'text-blue-400'}`}>
                  {currentCvssScore.toFixed(1)}
                </div>
                <div className="text-xs font-bold text-slate-400">
                  {currentCvssScore >= 9.0 ? 'CRITICAL' : currentCvssScore >= 7.0 ? 'HIGH' : currentCvssScore >= 4.0 ? 'MEDIUM' : 'LOW'}
                </div>
              </div>
            </div>

            {/* Vector String Output */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-300 select-all">{currentCvssVector}</span>
              <button
                onClick={() => handleCopyCode(currentCvssVector)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Vector
              </button>
            </div>

            {/* Metric Matrices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Exploitability Metrics */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Exploitability Metrics
                </h4>

                {/* Attack Vector */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">Attack Vector (AV)</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'N', label: 'Network' },
                      { id: 'A', label: 'Adjacent' },
                      { id: 'L', label: 'Local' },
                      { id: 'P', label: 'Physical' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setCvssMetrics({ ...cvssMetrics, av: opt.id })}
                        className={`py-1.5 text-xs font-medium rounded border cursor-pointer transition-colors ${
                          cvssMetrics.av === opt.id
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attack Complexity */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">Attack Complexity (AC)</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'L', label: 'Low (L)' },
                      { id: 'H', label: 'High (H)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setCvssMetrics({ ...cvssMetrics, ac: opt.id })}
                        className={`py-1.5 text-xs font-medium rounded border cursor-pointer transition-colors ${
                          cvssMetrics.ac === opt.id
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privileges Required */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">Privileges Required (PR)</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'N', label: 'None (N)' },
                      { id: 'L', label: 'Low (L)' },
                      { id: 'H', label: 'High (H)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setCvssMetrics({ ...cvssMetrics, pr: opt.id })}
                        className={`py-1.5 text-xs font-medium rounded border cursor-pointer transition-colors ${
                          cvssMetrics.pr === opt.id
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* User Interaction */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">User Interaction (UI)</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'N', label: 'None (N)' },
                      { id: 'R', label: 'Required (R)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setCvssMetrics({ ...cvssMetrics, ui: opt.id })}
                        className={`py-1.5 text-xs font-medium rounded border cursor-pointer transition-colors ${
                          cvssMetrics.ui === opt.id
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Impact Metrics
                </h4>

                {/* Scope */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">Scope (S)</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'U', label: 'Unchanged (U)' },
                      { id: 'C', label: 'Changed (C)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setCvssMetrics({ ...cvssMetrics, s: opt.id })}
                        className={`py-1.5 text-xs font-medium rounded border cursor-pointer transition-colors ${
                          cvssMetrics.s === opt.id
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confidentiality */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">Confidentiality Impact (C)</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'H', label: 'High (H)' },
                      { id: 'L', label: 'Low (L)' },
                      { id: 'N', label: 'None (N)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setCvssMetrics({ ...cvssMetrics, c: opt.id })}
                        className={`py-1.5 text-xs font-medium rounded border cursor-pointer transition-colors ${
                          cvssMetrics.c === opt.id
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Integrity */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">Integrity Impact (I)</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'H', label: 'High (H)' },
                      { id: 'L', label: 'Low (L)' },
                      { id: 'N', label: 'None (N)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setCvssMetrics({ ...cvssMetrics, i: opt.id })}
                        className={`py-1.5 text-xs font-medium rounded border cursor-pointer transition-colors ${
                          cvssMetrics.i === opt.id
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">Availability Impact (A)</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'H', label: 'High (H)' },
                      { id: 'L', label: 'Low (L)' },
                      { id: 'N', label: 'None (N)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setCvssMetrics({ ...cvssMetrics, a: opt.id })}
                        className={`py-1.5 text-xs font-medium rounded border cursor-pointer transition-colors ${
                          cvssMetrics.a === opt.id
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SCOPE & RULES OF ENGAGEMENT (RoE)                */}
        {/* ======================================================== */}
        {activeTab === 'scope_roe' && (
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Target Scope & Rules of Engagement (RoE)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Define penetration testing boundaries, safe rate limits, and compliance constraints
                </p>
              </div>

              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                RoE STATUS: AUTHORIZED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target Application Name</label>
                  <input
                    type="text"
                    value={selectedScope.name}
                    readOnly
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target Base URL</label>
                  <input
                    type="text"
                    value={selectedScope.targetUrl}
                    readOnly
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-cyan-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Environment Classification</label>
                  <input
                    type="text"
                    value={selectedScope.environment}
                    readOnly
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Maximum Request Rate (Req/Sec)</label>
                  <input
                    type="number"
                    value={selectedScope.rateLimitReqPerSec}
                    readOnly
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Excluded Critical Paths (Out of Scope)</label>
                  <div className="space-y-1.5">
                    {selectedScope.exclusionPaths.length > 0 ? (
                      selectedScope.exclusionPaths.map((p, idx) => (
                        <div key={idx} className="p-2 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-rose-300">
                          {p}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 italic">No path exclusions configured.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: EXECUTIVE & TECHNICAL VAPT AUDIT REPORT           */}
        {/* ======================================================== */}
        {activeTab === 'compliance_report' && (
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span>Executive VAPT Attestation Report</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Compliant with NIST AI RMF • EU AI Act (2024/1689) Art. 15 • GDPR Art. 32 • PCI-DSS 4.0 Req 11.3 • SOC 2 Type II
                </p>
              </div>

              <button
                onClick={() => handleCopyCode(JSON.stringify(PRESET_VAPT_REPORT, null, 2))}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON Report
              </button>
            </div>

            {/* Report Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 font-semibold">Overall Risk Score</div>
                <div className="text-xl font-black text-rose-400 mt-1">{PRESET_VAPT_REPORT.overallRiskScore} / 100</div>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 font-semibold">EU AI Act (Art 15)</div>
                <div className="text-xs font-bold text-emerald-400 mt-2">Resilience Passed</div>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 font-semibold">NIST AI RMF (MAP-2.2)</div>
                <div className="text-xs font-bold text-indigo-300 mt-2">Threat Mapped</div>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 font-semibold">EU GDPR Art. 32</div>
                <div className="text-xs font-bold text-teal-300 mt-2">Crypto Verified</div>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 font-semibold">OWASP ASVS</div>
                <div className="text-xs font-bold text-cyan-300 mt-2">Level 2 Verified</div>
              </div>
            </div>

            {/* Findings Breakdown Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Identified Security Gaps & Exploit Vectors
              </h4>

              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Finding Title</th>
                      <th className="p-3">CVSS v3.1</th>
                      <th className="p-3">Target Endpoint</th>
                      <th className="p-3">Remediation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {findings.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-800/40">
                        <td className="p-3">{getSeverityBadge(f.severity)}</td>
                        <td className="p-3 font-semibold text-white">{f.title}</td>
                        <td className="p-3 font-mono text-rose-400 font-bold">{f.cvssScore}</td>
                        <td className="p-3 font-mono text-slate-400 truncate max-w-[200px]">{f.targetUrl}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function CodeIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
