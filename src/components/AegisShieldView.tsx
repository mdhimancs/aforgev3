import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  Play,
  RefreshCw,
  Sliders,
  Terminal,
  Lock,
  Eye,
  FileCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  Cpu,
  Layers,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  Database,
  Radio,
  Server,
  Code2,
} from 'lucide-react';
import {
  AegisPolicyConfig,
  AegisThreatEvent,
  SeverityLevel,
} from '../types';
import {
  DEFAULT_AEGIS_CONFIG,
  AEGIS_PRESET_THREAT_EVENTS,
  AEGIS_ATTACK_TEMPLATES,
  AEGIS_INTEGRATION_CODE,
  AegisAttackTemplate,
} from '../data/aegisPresets';

export function AegisShieldView() {
  const [activeSubTab, setActiveSubTab] = useState<'sandbox' | 'events' | 'policies' | 'sdk'>('sandbox');
  const [config, setConfig] = useState<AegisPolicyConfig>(DEFAULT_AEGIS_CONFIG);
  const [threatEvents, setThreatEvents] = useState<AegisThreatEvent[]>(AEGIS_PRESET_THREAT_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>(AEGIS_PRESET_THREAT_EVENTS[0].id);

  // Sandbox state
  const [testPayload, setTestPayload] = useState<string>(AEGIS_ATTACK_TEMPLATES[0].payload);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(AEGIS_ATTACK_TEMPLATES[0].id);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<{
    verdict: 'BLOCKED' | 'REDACTED' | 'ALLOWED';
    threatScore: number;
    threatCategory: string;
    confidence: number;
    latencyMs: number;
    matchedRules: string[];
    sanitizedPayload: string;
    explanation: string;
    mitigationRecommendation: string;
  } | null>(null);

  // Pipeline inspection steps visualization state
  const [pipelineSteps, setPipelineSteps] = useState<Array<{ name: string; status: 'passed' | 'alert' | 'blocked' | 'idle'; detail: string }>>([
    { name: '1. Ingress Tokenizer & Entropy', status: 'idle', detail: 'Analyzes character entropy, base64 encoding & token distributions' },
    { name: '2. Vector Intent & Jailbreak Filter', status: 'idle', detail: 'Calculates cosine similarity against known adversarial clusters' },
    { name: '3. Autonomous PII & DLP Masker', status: 'idle', detail: 'Pattern-matches SSNs, API tokens, PANs & customer records' },
    { name: '4. Tool & Syscall Sandbox Jailer', status: 'idle', detail: 'Validates SQL queries, bash commands & file path parameters' },
    { name: '5. Policy Enforcement Engine', status: 'idle', detail: 'Computes multi-dimensional risk score and enforces action' },
  ]);

  // Events filter state
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventVectorFilter, setEventVectorFilter] = useState('ALL');

  // Policy command blacklist input
  const [newBlockedCommand, setNewBlockedCommand] = useState('');
  const [copiedSdkKey, setCopiedSdkKey] = useState<string | null>(null);
  const [activeSdkLang, setActiveSdkLang] = useState<'express' | 'python' | 'langchain'>('express');

  // Run live AEGIS evaluation
  const handleEvaluatePayload = async () => {
    setIsEvaluating(true);

    // Animate pipeline steps to give instant visual feedback
    setPipelineSteps([
      { name: '1. Ingress Tokenizer & Entropy', status: 'passed', detail: 'Entropy: 4.82 bits/char • Token count: 58' },
      { name: '2. Vector Intent & Jailbreak Filter', status: 'alert', detail: 'Vector intent similarity match to Adversarial Jailbreak' },
      { name: '3. Autonomous PII & DLP Masker', status: 'passed', detail: 'Scanned 0 unmasked PII entities' },
      { name: '4. Tool & Syscall Sandbox Jailer', status: 'alert', detail: 'Heuristic syscall check triggered' },
      { name: '5. Policy Enforcement Engine', status: 'blocked', detail: 'Action: BLOCKED • Policy: AEGIS-STRICT-PROMPT-DEFENSE' },
    ]);

    try {
      const res = await fetch('/api/v1/appsec/aegis-intercept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: testPayload,
          context: {
            channel: 'agent_chat',
            userRole: 'anonymous_tester',
          },
          policies: {
            promptInjectionThreshold: config.promptSensitivity,
            piiRedact: config.piiAction === 'AUTO_REDACT',
            toolExecutionGuard: config.toolSandboxing,
            raspGuard: config.raspProtection,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEvalResult(data);

        // Update pipeline step visuals according to verdict
        const isBlocked = data.verdict === 'BLOCKED';
        const isRedacted = data.verdict === 'REDACTED';

        setPipelineSteps([
          {
            name: '1. Ingress Tokenizer & Entropy',
            status: 'passed',
            detail: `Parsed ${testPayload.length} bytes in ${(data.latencyMs * 0.15).toFixed(1)}ms`,
          },
          {
            name: '2. Vector Intent & Jailbreak Filter',
            status: data.threatCategory === 'PROMPT_INJECTION' || data.threatCategory === 'JAILBREAK' ? 'blocked' : 'passed',
            detail: `Threat Category: ${data.threatCategory} (Confidence ${(data.confidence * 100).toFixed(0)}%)`,
          },
          {
            name: '3. Autonomous PII & DLP Masker',
            status: isRedacted ? 'alert' : 'passed',
            detail: isRedacted ? 'Detected & masked sensitive PII tokens' : 'No unauthorized PII leakage detected',
          },
          {
            name: '4. Tool & Syscall Sandbox Jailer',
            status: data.threatCategory === 'UNSAFE_TOOL_CALL' ? 'blocked' : 'passed',
            detail: data.threatCategory === 'UNSAFE_TOOL_CALL' ? 'Dangerous system execution intercepted' : 'Tool arguments verified safe',
          },
          {
            name: '5. Policy Enforcement Engine',
            status: isBlocked ? 'blocked' : isRedacted ? 'alert' : 'passed',
            detail: `Decision: ${data.verdict} (Risk Score: ${data.threatScore}/100 in ${data.latencyMs}ms)`,
          },
        ]);

        // Append to threat events feed if actionable
        if (isBlocked || isRedacted) {
          const newEvent: AegisThreatEvent = {
            id: `aegis-evt-${Date.now()}`,
            timestamp: 'Just now',
            source: 'AEGIS-Sandbox-Live',
            attackVector: data.threatCategory === 'PII_EXFILTRATION' ? 'PII_EXFILTRATION' : data.threatCategory === 'UNSAFE_TOOL_CALL' ? 'UNSAFE_TOOL_CALL' : 'PROMPT_INJECTION',
            severity: data.threatScore > 80 ? 'CRITICAL' : 'HIGH',
            payload: testPayload,
            sanitizedPayload: data.sanitizedPayload,
            verdict: data.verdict,
            ruleTriggered: data.matchedRules[0] || 'AEGIS-RULE-CUSTOM: Live Threat Interception',
            latencyMs: data.latencyMs,
            confidence: data.confidence,
            ipAddress: '127.0.0.1 (Local Sandbox)',
            targetEndpoint: '/api/v1/agent/evaluate',
          };
          setThreatEvents((prev) => [newEvent, ...prev]);
        }
      }
    } catch (err) {
      console.error('Failed to evaluate payload with AEGIS:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSelectTemplate = (template: AegisAttackTemplate) => {
    setSelectedTemplateId(template.id);
    setTestPayload(template.payload);
    setEvalResult(null);
  };

  const handleCopyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSdkKey(key);
    setTimeout(() => setCopiedSdkKey(null), 2000);
  };

  const handleAddBlockedCommand = () => {
    if (!newBlockedCommand.trim()) return;
    if (!config.blockedCommands.includes(newBlockedCommand.trim())) {
      setConfig((prev) => ({
        ...prev,
        blockedCommands: [...prev.blockedCommands, newBlockedCommand.trim()],
      }));
    }
    setNewBlockedCommand('');
  };

  const handleRemoveBlockedCommand = (cmd: string) => {
    setConfig((prev) => ({
      ...prev,
      blockedCommands: prev.blockedCommands.filter((c) => c !== cmd),
    }));
  };

  const selectedEvent = threatEvents.find((e) => e.id === selectedEventId) || threatEvents[0];

  const filteredEvents = threatEvents.filter((evt) => {
    const matchesSearch =
      evt.payload.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      evt.ruleTriggered.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      evt.source.toLowerCase().includes(eventSearchQuery.toLowerCase());
    const matchesVector = eventVectorFilter === 'ALL' || evt.attackVector === eventVectorFilter;
    return matchesSearch && matchesVector;
  });

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'BLOCKED':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-sm">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            BLOCKED
          </span>
        );
      case 'REDACTED':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            REDACTED & SANITIZED
          </span>
        );
      case 'ALLOWED':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            CLEAN / ALLOWED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40">
            {verdict}
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600/30 text-rose-300 border border-rose-500/50">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-600/30 text-orange-300 border border-orange-500/50">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600/30 text-amber-300 border border-amber-500/50">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/30 text-blue-300 border border-blue-500/50">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* AEGIS Master Status & Live Telemetry Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/70 border border-indigo-500/30 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-14 h-14 bg-indigo-500/30 rounded-2xl animate-ping" />
              <div className="relative p-3.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/40 text-white border border-indigo-400/40">
                <Shield className="w-7 h-7" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  AEGIS Autonomous AI & AppSec Defense Shield
                </h3>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {config.shieldStatus === 'ACTIVE' ? 'SHIELD ACTIVE & ENFORCING' : 'LEARNING MODE'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Real-time threat interception gateway for LLMs, autonomous agents, and web APIs. Proactively filters prompt injections, jailbreaks, PII exfiltration, malicious tool executions, and RASP SQLi/SSRF attacks in &lt;10ms.
              </p>
            </div>
          </div>

          {/* Quick Telemetry Indicators */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Interception Rate</div>
              <div className="text-lg font-mono font-bold text-emerald-400">99.4%</div>
            </div>

            <div className="px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Avg Latency</div>
              <div className="text-lg font-mono font-bold text-cyan-300">7.8 ms</div>
            </div>

            <div className="px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Threats Neutralized</div>
              <div className="text-lg font-mono font-bold text-indigo-300">1,482</div>
            </div>

            <div className="px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Enforced Policies</div>
              <div className="text-lg font-mono font-bold text-purple-300">64 Rules</div>
            </div>
          </div>
        </div>

        {/* AEGIS Sub-Tab Controls */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSubTab('sandbox')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'sandbox'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 shadow-2xs'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Interactive Threat Sandbox</span>
          </button>

          <button
            onClick={() => setActiveSubTab('events')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'events'
                ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 shadow-2xs'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Live Interception Stream ({threatEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('policies')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'policies'
                ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 shadow-2xs'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Guardrail Policy Tuning</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sdk')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'sdk'
                ? 'bg-cyan-100 text-cyan-900 border border-cyan-300 shadow-2xs'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 shadow-2xs'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Universal SDK Integration</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. INTERACTIVE THREAT SANDBOX SUB-TAB                    */}
      {/* ======================================================== */}
      {activeSubTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Attack Presets & Custom Payload Input */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Adversarial Attack Presets
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Click to load payload</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AEGIS_ATTACK_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedTemplateId === tmpl.id
                        ? 'bg-indigo-950/70 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate">{tmpl.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          tmpl.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-orange-500/20 text-orange-300'
                        }`}
                      >
                        {tmpl.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{tmpl.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Payload Input Box */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Target Payload / User Prompt / Tool Execution</span>
                  <span className="text-[10px] text-indigo-400 font-mono">(Live Tester)</span>
                </label>

                <button
                  onClick={handleEvaluatePayload}
                  disabled={isEvaluating || !testPayload.trim()}
                  className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Threat...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Fire Through AEGIS Shield</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                rows={6}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none"
                placeholder="Enter prompt or payload to test against AEGIS..."
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Evaluated with: Vector Classifier + DLP + Syscall Jailer
                </span>
                <span>{testPayload.length} chars</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Pipeline Inspection & Decision Box */}
          <div className="lg:col-span-6 space-y-4">
            {/* Step-by-Step Defense Pipeline Trace */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  AEGIS Multi-Stage Inspection Pipeline
                </h4>
                <span className="text-[11px] font-mono text-indigo-300">Latency &lt; 10ms</span>
              </div>

              <div className="space-y-2">
                {pipelineSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border transition-all flex items-start gap-3 ${
                      step.status === 'blocked'
                        ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                        : step.status === 'alert'
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                        : step.status === 'passed'
                        ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {step.status === 'blocked' ? (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      ) : step.status === 'alert' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : step.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px]">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{step.name}</span>
                        <span className="text-[10px] font-mono uppercase">
                          {step.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verdict & Sanitized Output Box */}
            {evalResult ? (
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  evalResult.verdict === 'BLOCKED'
                    ? 'bg-rose-950/30 border-rose-500/50'
                    : evalResult.verdict === 'REDACTED'
                    ? 'bg-amber-950/30 border-amber-500/50'
                    : 'bg-emerald-950/30 border-emerald-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">AEGIS Final Verdict:</span>
                    {getVerdictBadge(evalResult.verdict)}
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Risk: {evalResult.threatScore}/100 • {evalResult.latencyMs}ms
                  </span>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="text-[11px] font-bold text-indigo-300">Triggered Rules:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {evalResult.matchedRules.map((rule, rIdx) => (
                      <span
                        key={rIdx}
                        className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-mono"
                      >
                        {rule}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-slate-300 pt-1">
                    <span className="font-semibold text-white">Analysis: </span>
                    {evalResult.explanation}
                  </div>

                  {evalResult.verdict === 'REDACTED' && (
                    <div className="pt-2 border-t border-slate-800">
                      <div className="text-[11px] font-bold text-amber-300 mb-1">
                        Sanitized Payload (Passed to Agent / Model):
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded font-mono text-xs text-emerald-300 border border-emerald-500/30">
                        {evalResult.sanitizedPayload}
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-cyan-300 pt-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{evalResult.mitigationRecommendation}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-900/60 border border-dashed border-slate-800 rounded-xl text-center text-slate-400 space-y-2">
                <Cpu className="w-8 h-8 mx-auto text-indigo-400 opacity-60" />
                <div className="text-xs font-semibold text-slate-300">
                  Ready to Intercept
                </div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Select an attack preset or paste a custom prompt/payload, then click "Fire Through AEGIS Shield" to test active defense in real time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. LIVE INTERCEPTION STREAM SUB-TAB                     */}
      {/* ======================================================== */}
      {activeSubTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Interception Log Stream */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Intercepted Events ({filteredEvents.length})
              </h4>

              <select
                value={eventVectorFilter}
                onChange={(e) => setEventVectorFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded px-2.5 py-1 focus:outline-none"
              >
                <option value="ALL">All Threat Vectors</option>
                <option value="PROMPT_INJECTION">Prompt Injection</option>
                <option value="PII_EXFILTRATION">PII Exfiltration</option>
                <option value="UNSAFE_TOOL_CALL">Tool Abuse</option>
                <option value="RASP_SQLI">RASP SQLi</option>
                <option value="SSRF_METADATA">SSRF Metadata</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
                placeholder="Search intercepted payloads, rules, IPs..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {filteredEvents.map((evt) => {
                const isSelected = evt.id === selectedEventId;
                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(evt.severity)}
                        <span className="font-bold text-xs text-white font-mono">{evt.attackVector}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-300 font-mono line-clamp-2 bg-slate-900/60 p-1.5 rounded border border-slate-800/60 my-1.5">
                      {evt.payload}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono text-indigo-400">{evt.source}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{evt.latencyMs}ms</span>
                        {getVerdictBadge(evt.verdict)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Forensics Inspector */}
          <div className="lg:col-span-7 space-y-4">
            {selectedEvent ? (
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
                <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      {getSeverityBadge(selectedEvent.severity)}
                      <h3 className="text-base font-bold text-white font-mono">{selectedEvent.attackVector}</h3>
                      {getVerdictBadge(selectedEvent.verdict)}
                    </div>
                    <p className="text-xs text-indigo-300 font-mono flex items-center gap-2">
                      <span>{selectedEvent.ruleTriggered}</span>
                    </p>
                  </div>

                  <div className="text-right text-xs text-slate-400 space-y-0.5 font-mono">
                    <div>IP: <span className="text-slate-200">{selectedEvent.ipAddress}</span></div>
                    <div>Target: <span className="text-indigo-400">{selectedEvent.targetEndpoint}</span></div>
                    <div>Confidence: <span className="text-emerald-400">{(selectedEvent.confidence * 100).toFixed(0)}%</span></div>
                  </div>
                </div>

                {/* Raw Intercepted Payload */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-rose-400" />
                    <span>Raw Intercepted Payload:</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-rose-500/30 rounded-lg text-xs font-mono text-rose-300 whitespace-pre-wrap break-all">
                    {selectedEvent.payload}
                  </div>
                </div>

                {/* Sanitized Version (if Redacted) */}
                {selectedEvent.sanitizedPayload && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sanitized & Masked Output:</span>
                    </div>
                    <div className="p-3 bg-slate-900 border border-emerald-500/30 rounded-lg text-xs font-mono text-emerald-300 whitespace-pre-wrap break-all">
                      {selectedEvent.sanitizedPayload}
                    </div>
                  </div>
                )}

                {/* Forensics Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Detection Mechanism</span>
                    <p className="text-xs text-slate-200">
                      Hybrid AST Parser + Embedding Cosine Similarity ({selectedEvent.latencyMs}ms execution)
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Automated Defense Action</span>
                    <p className="text-xs text-slate-200">
                      Terminated TCP connection before model context was poisoned. IP rate-limited.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400">
                Select an intercepted event to inspect forensics
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. GUARDRAIL POLICY TUNING SUB-TAB                      */}
      {/* ======================================================== */}
      {activeSubTab === 'policies' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Active Defense Guardrails Configuration</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Adjust real-time filtering thresholds across prompt injection, PII redaction, tool command sandboxing, and RASP.
                  </p>
                </div>
                <button
                  onClick={() => setConfig(DEFAULT_AEGIS_CONFIG)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded font-semibold transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              {/* Policy 1: Prompt Injection & Jailbreak */}
              <div className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Prompt Injection & Jailbreak Defense</div>
                      <div className="text-[11px] text-slate-400">
                        Intersects DAN, cipher-encoded payloads, and system prompt leakage attempts.
                      </div>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={config.promptInjectionDefense}
                    onChange={(e) => setConfig({ ...config, promptInjectionDefense: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {config.promptInjectionDefense && (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Sensitivity Level:</span>
                    <div className="flex items-center gap-2">
                      {(['STRICT', 'BALANCED', 'PERMISSIVE'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setConfig({ ...config, promptSensitivity: lvl })}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            config.promptSensitivity === lvl
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Policy 2: Autonomous PII & DLP Masking */}
              <div className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Autonomous PII Masking & DLP</div>
                      <div className="text-[11px] text-slate-400">
                        Scans SSNs, credit cards, emails, and API keys. Auto-redacts before reaching LLM.
                      </div>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={config.piiMasking}
                    onChange={(e) => setConfig({ ...config, piiMasking: e.target.checked })}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                {config.piiMasking && (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Enforcement Action:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfig({ ...config, piiAction: 'AUTO_REDACT' })}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                          config.piiAction === 'AUTO_REDACT'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        Auto-Redact & Sanitize
                      </button>
                      <button
                        onClick={() => setConfig({ ...config, piiAction: 'BLOCK' })}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                          config.piiAction === 'BLOCK'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        Hard Block Request
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Policy 3: Agent Tool & Syscall Command Sandbox */}
              <div className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Agent Tool & Syscall Execution Jailer</div>
                      <div className="text-[11px] text-slate-400">
                        Intercepts dangerous bash commands, file system writes, and database drop queries.
                      </div>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={config.toolSandboxing}
                    onChange={(e) => setConfig({ ...config, toolSandboxing: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </div>

                {config.toolSandboxing && (
                  <div className="pt-2 space-y-2 border-t border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400">Blocked Command Patterns:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {config.blockedCommands.map((cmd) => (
                        <span
                          key={cmd}
                          className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-mono flex items-center gap-1.5"
                        >
                          {cmd}
                          <button
                            onClick={() => handleRemoveBlockedCommand(cmd)}
                            className="hover:text-white cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newBlockedCommand}
                        onChange={(e) => setNewBlockedCommand(e.target.value)}
                        placeholder="Add command pattern (e.g. 'mkfs', 'wget')..."
                        className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-rose-500 flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddBlockedCommand();
                        }}
                      />
                      <button
                        onClick={handleAddBlockedCommand}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded font-bold cursor-pointer"
                      >
                        Add Pattern
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Policy 4: RASP Web & API Protection */}
              <div className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Runtime Application Self-Protection (RASP)</div>
                      <div className="text-[11px] text-slate-400">
                        Real-time AST parsing for SQLi, SSRF to cloud metadata IPs, and Path Traversal.
                      </div>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={config.raspProtection}
                    onChange={(e) => setConfig({ ...config, raspProtection: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Policy Status Summary */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Policy Enforcement Status
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Guardrail Mode</span>
                  <span className="font-mono text-emerald-300 font-bold">{config.shieldStatus}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Prompt Sensitivity</span>
                  <span className="font-mono text-indigo-300">{config.promptSensitivity}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">DLP Action</span>
                  <span className="font-mono text-purple-300">{config.piiAction}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Blocked Syscalls</span>
                  <span className="font-mono text-rose-300">{config.blockedCommands.length} patterns</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">RASP AST Engine</span>
                  <span className="font-mono text-emerald-300 font-bold">
                    {config.raspProtection ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-[11px] text-indigo-200">
                Policy updates apply automatically across all connected AgentForge runtime agents and API gateways with zero container restarts.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. UNIVERSAL SDK INTEGRATION SUB-TAB                    */}
      {/* ======================================================== */}
      {activeSubTab === 'sdk' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSdkLang('express')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSdkLang === 'express'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                Node.js / Express Middleware
              </button>
              <button
                onClick={() => setActiveSdkLang('python')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSdkLang === 'python'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                Python / FastAPI Shield
              </button>
              <button
                onClick={() => setActiveSdkLang('langchain')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSdkLang === 'langchain'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                LangChain / LlamaIndex Tool Guard
              </button>
            </div>

            <button
              onClick={() => handleCopyCode(AEGIS_INTEGRATION_CODE[activeSdkLang], activeSdkLang)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-cyan-500/30 cursor-pointer"
            >
              {copiedSdkKey === activeSdkLang ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SDK Code</span>
                </>
              )}
            </button>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-indigo-300">
                {activeSdkLang === 'express'
                  ? 'server.ts / app.ts'
                  : activeSdkLang === 'python'
                  ? 'main.py / agent.py'
                  : 'agent_tools.ts'}
              </span>
              <span>Ultra-low latency runtime wrapper (&lt;10ms)</span>
            </div>

            <pre className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>{AEGIS_INTEGRATION_CODE[activeSdkLang]}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
