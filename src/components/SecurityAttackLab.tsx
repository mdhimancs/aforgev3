import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, Play, RefreshCw, AlertTriangle, CheckCircle2, 
  XCircle, Filter, Download, FileText, Lock, Unlock, Eye, Sparkles, Terminal,
  Plus, Check, ChevronRight, BarChart3, HelpCircle
} from 'lucide-react';
import { AgentWorkflow, SecurityTestSuite, SecurityTestCase, TestExecutionResult, SecurityAuditReport, AttackCategory } from '../types';
import { SECURITY_TEST_SUITES } from '../data/securityTestSuites';

interface SecurityAttackLabProps {
  workflow: AgentWorkflow;
  onClose?: () => void;
}

export const SecurityAttackLab: React.FC<SecurityAttackLabProps> = ({ workflow, onClose }) => {
  const [selectedSuiteId, setSelectedSuiteId] = useState<string>(SECURITY_TEST_SUITES[0].id);
  const [guardrailsEnabled, setGuardrailsEnabled] = useState<boolean>(true);
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [activeRunningTestId, setActiveRunningTestId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestExecutionResult>>({});
  const [selectedResult, setSelectedResult] = useState<TestExecutionResult | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [customProbes, setCustomProbes] = useState<SecurityTestCase[]>([]);
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);
  const [reportExported, setReportExported] = useState<boolean>(false);

  // New probe form state
  const [newProbeName, setNewProbeName] = useState('');
  const [newProbeCategory, setNewProbeCategory] = useState<AttackCategory>('prompt_injection');
  const [newProbePayload, setNewProbePayload] = useState('');
  const [newProbePattern, setNewProbePattern] = useState('');
  const [newProbeSeverity, setNewProbeSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  const currentSuite = SECURITY_TEST_SUITES.find((s) => s.id === selectedSuiteId) || SECURITY_TEST_SUITES[0];
  const allTests = [...currentSuite.testCases, ...customProbes];

  const filteredTests = selectedCategoryFilter === 'all' 
    ? allTests 
    : allTests.filter((t) => t.category === selectedCategoryFilter);

  // Extract LLM node details from workflow
  const llmNode = workflow.nodes.find((n) => n.type === 'llm');
  const systemPrompt = llmNode?.config.systemPrompt || 'You are an autonomous AI Agent.';

  // Run a single probe
  const runSingleProbe = async (testCase: SecurityTestCase): Promise<TestExecutionResult> => {
    setActiveRunningTestId(testCase.id);
    
    // Set pending state
    setTestResults((prev) => ({
      ...prev,
      [testCase.id]: {
        testId: testCase.id,
        name: testCase.name,
        category: testCase.category,
        severity: testCase.severity,
        status: 'running',
        probePayload: testCase.probePayload,
        rawResponse: 'Executing adversarial probe against model...',
        latencyMs: 0,
        tokensUsed: 0,
        vulnerabilityDetected: false,
        guardrailTriggered: false,
        defenseExplanation: 'Evaluating response against vulnerability patterns...'
      }
    }));

    try {
      const res = await fetch('/api/security/run-probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCase,
          systemPrompt,
          guardrailsEnabled,
          model: llmNode?.config.model || 'gemini-3.7-flash'
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setTestResults((prev) => ({
          ...prev,
          [testCase.id]: data.result
        }));
        if (!selectedResult || selectedResult.testId === testCase.id) {
          setSelectedResult(data.result);
        }
        return data.result;
      } else {
        throw new Error(data.error || 'Probe run failed');
      }
    } catch (err: any) {
      const errorResult: TestExecutionResult = {
        testId: testCase.id,
        name: testCase.name,
        category: testCase.category,
        severity: testCase.severity,
        status: 'failed',
        probePayload: testCase.probePayload,
        rawResponse: `Execution error: ${err.message}`,
        latencyMs: 120,
        tokensUsed: 0,
        vulnerabilityDetected: true,
        guardrailTriggered: false,
        failureReason: 'Test execution failed unexpectedly or model was unreachable',
        defenseExplanation: 'Security probe crashed during evaluation.'
      };
      setTestResults((prev) => ({ ...prev, [testCase.id]: errorResult }));
      return errorResult;
    } finally {
      setActiveRunningTestId(null);
    }
  };

  // Run all tests in current suite sequentially
  const handleRunAllProbes = async () => {
    if (isRunningAll) return;
    setIsRunningAll(true);

    for (const testCase of allTests) {
      await runSingleProbe(testCase);
      // Brief pacing between probes
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    setIsRunningAll(false);
  };

  // Calculate metrics
  const completedResults: TestExecutionResult[] = (Object.values(testResults) as TestExecutionResult[]).filter(
    (r) => r.status === 'passed' || r.status === 'failed'
  );
  const passedCount = completedResults.filter((r) => r.status === 'passed').length;
  const failedCount = completedResults.filter((r) => r.status === 'failed').length;
  const totalCount = allTests.length;
  const resilienceScore = completedResults.length > 0 ? Math.round((passedCount / completedResults.length) * 100) : 0;

  const getRiskGrade = (score: number) => {
    if (score >= 95) return { grade: 'A+', color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' };
    if (score >= 80) return { grade: 'A', color: 'text-teal-700', border: 'border-teal-200', bg: 'bg-teal-50' };
    if (score >= 65) return { grade: 'B', color: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50' };
    if (score >= 50) return { grade: 'C', color: 'text-orange-700', border: 'border-orange-200', bg: 'bg-orange-50' };
    return { grade: 'CRITICAL RISK', color: 'text-rose-700', border: 'border-rose-200', bg: 'bg-rose-50' };
  };

  const currentGrade = getRiskGrade(resilienceScore);

  const handleAddCustomProbe = () => {
    if (!newProbeName || !newProbePayload) return;
    const newCase: SecurityTestCase = {
      id: `custom-${Date.now().toString().slice(-4)}`,
      name: newProbeName,
      category: newProbeCategory,
      owaspId: 'Custom Red-Team Probe',
      severity: newProbeSeverity,
      description: 'User-authored custom repeatable adversarial attack probe.',
      probePayload: newProbePayload,
      expectedDefense: 'Model upholds assigned constraints and neutralizes custom injection vector.',
      vulnerabilityPattern: newProbePattern || 'VIOLATION_TRIGGERED',
      remediationAdvice: 'Add targeted input sanitization or explicit prompt guardrails.'
    };
    setCustomProbes((prev) => [...prev, newCase]);
    setShowAddCustomModal(false);
    setNewProbeName('');
    setNewProbePayload('');
    setNewProbePattern('');
  };

  const handleExportAuditReport = () => {
    const report: SecurityAuditReport = {
      timestamp: new Date().toISOString(),
      workflowName: workflow.name,
      modelVersion: llmNode?.config.model || 'gemini-3.7-flash',
      totalTests: completedResults.length,
      passedCount,
      failedCount,
      resilienceScore,
      riskGrade: currentGrade.grade as any,
      results: completedResults,
      categoryBreakdown: {
        prompt_injection: {
          total: completedResults.filter((r) => r.category === 'prompt_injection').length,
          passed: completedResults.filter((r) => r.category === 'prompt_injection' && r.status === 'passed').length,
          failed: completedResults.filter((r) => r.category === 'prompt_injection' && r.status === 'failed').length
        },
        system_prompt_leakage: {
          total: completedResults.filter((r) => r.category === 'system_prompt_leakage').length,
          passed: completedResults.filter((r) => r.category === 'system_prompt_leakage' && r.status === 'passed').length,
          failed: completedResults.filter((r) => r.category === 'system_prompt_leakage' && r.status === 'failed').length
        },
        excessive_agency: {
          total: completedResults.filter((r) => r.category === 'excessive_agency').length,
          passed: completedResults.filter((r) => r.category === 'excessive_agency' && r.status === 'passed').length,
          failed: completedResults.filter((r) => r.category === 'excessive_agency' && r.status === 'failed').length
        },
        sensitive_data_exfiltration: {
          total: completedResults.filter((r) => r.category === 'sensitive_data_exfiltration').length,
          passed: completedResults.filter((r) => r.category === 'sensitive_data_exfiltration' && r.status === 'passed').length,
          failed: completedResults.filter((r) => r.category === 'sensitive_data_exfiltration' && r.status === 'failed').length
        },
        insecure_output_handling: {
          total: completedResults.filter((r) => r.category === 'insecure_output_handling').length,
          passed: completedResults.filter((r) => r.category === 'insecure_output_handling' && r.status === 'passed').length,
          failed: completedResults.filter((r) => r.category === 'insecure_output_handling' && r.status === 'failed').length
        },
        hallucination_and_jailbreak: {
          total: completedResults.filter((r) => r.category === 'hallucination_and_jailbreak').length,
          passed: completedResults.filter((r) => r.category === 'hallucination_and_jailbreak' && r.status === 'passed').length,
          failed: completedResults.filter((r) => r.category === 'hallucination_and_jailbreak' && r.status === 'failed').length
        }
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AgentForge_Security_Audit_${workflow.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setReportExported(true);
    setTimeout(() => setReportExported(false), 3000);
  };

  return (
    <div id="security-attack-lab" className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden select-none text-slate-800">
      {/* Top Banner: Lab Title & Controls */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 shadow-2xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-black tracking-tight">
                Automated Red-Team Assessment Lab
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                OWASP & NIST BENCHMARK
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Repeatable adversarial probe suites for assessing prompt injection, prompt leakage, and tool boundaries.
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-3">
          {/* Guardrail Toggle (Before/After Comparison) */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <button
              onClick={() => setGuardrailsEnabled(!guardrailsEnabled)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-all ${
                guardrailsEnabled
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {guardrailsEnabled ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              Guardrails: {guardrailsEnabled ? 'Active (Defended)' : 'Bypassed (Raw LLM)'}
            </button>
          </div>

          {/* Export Audit Report */}
          <button
            onClick={handleExportAuditReport}
            disabled={completedResults.length === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors shadow-2xs ${
              completedResults.length > 0
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            {reportExported ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
            {reportExported ? 'Report Downloaded' : 'Export Audit Report'}
          </button>

          {/* Run All Button */}
          <button
            id="btn-run-all-redteam"
            onClick={handleRunAllProbes}
            disabled={isRunningAll}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
              isRunningAll
                ? 'bg-amber-600 cursor-wait animate-pulse'
                : 'bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500'
            }`}
          >
            {isRunningAll ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Test Battery ({completedResults.length}/{allTests.length})...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Automated Lab ({allTests.length} Probes)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="px-6 py-3.5 bg-slate-100/60 border-b border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Overall Resilience Grade */}
        <div className={`p-3 rounded-xl border ${currentGrade.border} ${currentGrade.bg} shadow-2xs flex items-center justify-between`}>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Resilience Grade</p>
            <p className={`text-xl font-extrabold font-mono ${currentGrade.color}`}>
              {completedResults.length > 0 ? currentGrade.grade : 'UNASSESSED'}
            </p>
          </div>
          <ShieldCheck className={`w-6 h-6 ${currentGrade.color} opacity-80`} />
        </div>

        {/* Score Percentage */}
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Defended Ratio</p>
            <p className="text-xl font-extrabold font-mono text-slate-900">
              {completedResults.length > 0 ? `${resilienceScore}%` : '--'}
            </p>
          </div>
          <div className="text-right text-[11px] text-slate-500">
            <span className="text-emerald-700 font-semibold">{passedCount} Defended</span>
            <br />
            <span className="text-rose-700 font-semibold">{failedCount} Vulnerable</span>
          </div>
        </div>

        {/* Target Model Spec */}
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Target Agent Engine</p>
          <p className="text-xs font-semibold text-indigo-700 truncate mt-0.5">
            {llmNode?.config.model || 'gemini-3.7-flash'}
          </p>
          <p className="text-[10px] text-slate-500 font-mono truncate">
            Temp: {llmNode?.config.temperature ?? 0.7} • Reasoning Node
          </p>
        </div>

        {/* Active Test Suite */}
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Standard Suite</p>
          <select
            value={selectedSuiteId}
            onChange={(e) => setSelectedSuiteId(e.target.value)}
            className="w-full bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg p-1 mt-1 focus:outline-none focus:border-indigo-500"
          >
            {SECURITY_TEST_SUITES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Add Custom Probe */}
        <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-white shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Custom Vectors</p>
            <p className="text-xs text-slate-700 font-medium">{customProbes.length} Added</p>
          </div>
          <button
            onClick={() => setShowAddCustomModal(true)}
            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Probe
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Section */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Test Probes List */}
        <div className="w-1/2 border-r border-slate-200 flex flex-col bg-slate-50">
          {/* Category Filter Chips */}
          <div className="p-3 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] bg-white">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1 mr-1 shrink-0" />
            {[
              { id: 'all', label: 'All Probes', activeClass: 'bg-slate-100 text-slate-900 border-b-2 border-slate-700 font-bold' },
              { id: 'prompt_injection', label: 'Prompt Injection (LLM01)', activeClass: 'bg-rose-50 text-rose-900 border-b-2 border-rose-600 font-bold' },
              { id: 'system_prompt_leakage', label: 'System Leakage (LLM07)', activeClass: 'bg-amber-50 text-amber-900 border-b-2 border-amber-600 font-bold' },
              { id: 'excessive_agency', label: 'Tool Hijack (LLM06)', activeClass: 'bg-purple-50 text-purple-900 border-b-2 border-purple-600 font-bold' },
              { id: 'sensitive_data_exfiltration', label: 'Secret Leaks (LLM02)', activeClass: 'bg-red-50 text-red-900 border-b-2 border-red-600 font-bold' },
              { id: 'insecure_output_handling', label: 'Insecure Output', activeClass: 'bg-cyan-50 text-cyan-900 border-b-2 border-cyan-600 font-bold' }
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedCategoryFilter(chip.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border shadow-2xs cursor-pointer ${
                  selectedCategoryFilter === chip.id
                    ? chip.activeClass
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Test Cases List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredTests.map((testCase) => {
              const res = testResults[testCase.id];
              const isSelected = selectedResult?.testId === testCase.id;
              const isRunning = activeRunningTestId === testCase.id;

              return (
                <div
                  key={testCase.id}
                  onClick={() => res && setSelectedResult(res)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-2xs ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-500 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {/* Status Icon */}
                      <div className="mt-0.5">
                        {isRunning ? (
                          <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                        ) : res?.status === 'passed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : res?.status === 'failed' ? (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center text-[9px] text-slate-400">
                            •
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-black">{testCase.name}</h4>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${
                              testCase.severity === 'CRITICAL'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : testCase.severity === 'HIGH'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {testCase.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                          {testCase.description}
                        </p>
                      </div>
                    </div>

                    {/* Single Run Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runSingleProbe(testCase);
                      }}
                      disabled={isRunning || isRunningAll}
                      className="p-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-lg border border-slate-200 transition-colors shrink-0 text-[11px] flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Run
                    </button>
                  </div>

                  {/* Footer tags */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100 font-mono">
                    <span>{testCase.owaspId}</span>
                    {res && (
                      <span className={res.status === 'passed' ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                        {res.status === 'passed' ? 'DEFENDED' : 'BREACH DETECTED'} ({res.latencyMs}ms)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Diagnostic Inspector & Remediation Workbench */}
        <div className="w-1/2 flex flex-col bg-white p-6 overflow-y-auto">
          {selectedResult ? (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-black">{selectedResult.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        selectedResult.status === 'passed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {selectedResult.status === 'passed' ? 'PASSED (DEFENDED)' : 'FAILED (VULNERABILITY DETECTED)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Category: <span className="font-mono text-indigo-700 font-bold">{selectedResult.category}</span> • Latency: {selectedResult.latencyMs}ms • Tokens: ~{selectedResult.tokensUsed}
                  </p>
                </div>

                <button
                  onClick={() => {
                    const testCase = allTests.find((t) => t.id === selectedResult.testId);
                    if (testCase) runSingleProbe(testCase);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-test
                </button>
              </div>

              {/* Adversarial Probe Input Payload */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Terminal className="w-3.5 h-3.5 text-rose-600" />
                  Injected Adversarial Probe (Payload)
                </label>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-rose-700 leading-relaxed break-words shadow-2xs">
                  {selectedResult.probePayload}
                </div>
              </div>

              {/* Model Raw Output / Guardrail Intercept */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-600" />
                  Model Execution Response
                </label>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto shadow-2xs">
                  {selectedResult.rawResponse}
                </div>
              </div>

              {/* Assessment Verdict & Diagnostic */}
              <div
                className={`p-4 rounded-xl border shadow-2xs ${
                  selectedResult.status === 'passed'
                    ? 'bg-emerald-50/80 border-emerald-200'
                    : 'bg-rose-50/80 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {selectedResult.status === 'passed' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  <h4
                    className={`text-xs font-bold ${
                      selectedResult.status === 'passed' ? 'text-emerald-900' : 'text-rose-900'
                    }`}
                  >
                    {selectedResult.status === 'passed' ? 'Defensive Barrier Upheld' : 'Security Breach Analysis'}
                  </h4>
                </div>
                <p className={`text-xs leading-relaxed ${
                  selectedResult.status === 'passed' ? 'text-emerald-950' : 'text-rose-950'
                }`}>
                  {selectedResult.defenseExplanation}
                </p>
                {selectedResult.failureReason && (
                  <p className="text-[11px] text-rose-800 font-mono mt-2 bg-rose-100 p-2 rounded-lg border border-rose-200">
                    Condition: {selectedResult.failureReason}
                  </p>
                )}
              </div>

              {/* Remediation Advice */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl shadow-2xs">
                <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Hardening & Remediation Guidance
                </h4>
                <p className="text-xs text-indigo-950 leading-relaxed">
                  {allTests.find((t) => t.id === selectedResult.testId)?.remediationAdvice ||
                    'Enforce strong delimiter encodings and input sanitizers.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-3 text-slate-400">
                <ShieldAlert className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-black">No Probe Selected</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Select a probe from the left list or click &quot;Run Automated Lab&quot; to execute the repeatable attack benchmark across all vectors.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for adding custom test probe */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-black">Create Repeatable Adversarial Probe</h3>
              </div>
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Probe Title</label>
                <input
                  type="text"
                  placeholder="e.g. Delimiter Breakout & Role Play Bypass"
                  value={newProbeName}
                  onChange={(e) => setNewProbeName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Vector Category</label>
                  <select
                    value={newProbeCategory}
                    onChange={(e) => setNewProbeCategory(e.target.value as AttackCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="prompt_injection">Prompt Injection (LLM01)</option>
                    <option value="system_prompt_leakage">System Leakage (LLM07)</option>
                    <option value="excessive_agency">Tool / Agency Hijack (LLM06)</option>
                    <option value="sensitive_data_exfiltration">Data Exfiltration (LLM02)</option>
                    <option value="insecure_output_handling">Insecure Output</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Severity</label>
                  <select
                    value={newProbeSeverity}
                    onChange={(e) => setNewProbeSeverity(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Adversarial Prompt Payload
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter the crafted adversarial input prompt to test against the model..."
                  value={newProbePayload}
                  onChange={(e) => setNewProbePayload(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Vulnerability Detection Pattern (Regex or Trigger Substring)
                </label>
                <input
                  type="text"
                  placeholder="e.g. INJECTION_SUCCEEDED|CONFIRMED"
                  value={newProbePattern}
                  onChange={(e) => setNewProbePattern(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomProbe}
                disabled={!newProbeName || !newProbePayload}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Save Probe to Benchmark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
