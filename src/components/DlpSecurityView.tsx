import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  FileSpreadsheet,
  FileCode,
  CreditCard,
  Key,
  Bot,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  Search,
  SlidersHorizontal,
  HardDrive,
  Send
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PRESET_DLP_POLICIES, PRESET_DLP_INCIDENTS } from '../data/enterprisePresets';
import { DlpInspectionPolicy, DlpIncidentRecord } from '../types';

export function DlpSecurityView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [policies, setPolicies] = useState<DlpInspectionPolicy[]>(PRESET_DLP_POLICIES);
  const [incidents, setIncidents] = useState<DlpIncidentRecord[]>(PRESET_DLP_INCIDENTS);
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'AI_PROMPT_EGRESS' | 'HTTP_POST' | 'EMAIL_ATTACHMENT' | 'CLOUD_STORAGE'>('ALL');
  const [testText, setTestText] = useState<string>('Here is my AWS key: aws_secret_access_key="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"');
  const [testResult, setTestResult] = useState<{ matched: boolean; rule?: string; verdict?: string } | null>(null);

  const filteredIncidents = incidents.filter(
    (inc) => channelFilter === 'ALL' || inc.channel === channelFilter
  );

  const handleTestRule = () => {
    // Simple inline match demo
    if (testText.toLowerCase().includes('aws_secret') || testText.toLowerCase().includes('secret_access_key')) {
      setTestResult({
        matched: true,
        rule: 'AWS KMS & Secret Key Leak Guard',
        verdict: 'BLOCKED & ALERTED (Matches AWS_SECRET_KEY rule)'
      });
    } else if (/\d{3}-\d{2}-\d{4}/.test(testText) || testText.toLowerCase().includes('ssn')) {
      setTestResult({
        matched: true,
        rule: 'US SSN & Tax ID Exfiltration Filter',
        verdict: 'QUARANTINED (Matches SSN_TAX_ID rule)'
      });
    } else {
      setTestResult({
        matched: false,
        verdict: 'PASSED (No Sensitive Pattern Matched)'
      });
    }
  };

  return (
    <div className={`flex flex-col flex-1 h-full overflow-y-auto ${isLight ? 'bg-slate-100/80 text-slate-800' : 'bg-slate-900 text-slate-100'}`}>
      {/* Top Banner */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${isLight ? 'bg-slate-100/90 border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl shadow-md text-white">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Enterprise Data Loss Prevention (DLP) & Inspection Engine
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 uppercase">
                Zero-Trust Egress • Secret Regex • PII/PCI Masking
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deep packet inspection, regex content matching, and automated data quarantine across HTTP, Cloud, Email, & AI Prompts.
            </p>
          </div>
        </div>

        {/* Channel Filter Toolbar */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Inspection Channel:</span>
          {(['ALL', 'AI_PROMPT_EGRESS', 'HTTP_POST', 'EMAIL_ATTACHMENT', 'CLOUD_STORAGE'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                channelFilter === ch
                  ? isLight
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-600 text-white'
                  : isLight
                  ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {ch.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-xs text-slate-500 font-semibold uppercase">Inspected Egress Data (24h)</span>
            <div className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">142.8 GB</div>
            <span className="text-[10px] text-emerald-600 font-medium">100% Inline Inspection</span>
          </div>

          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-xs text-slate-500 font-semibold uppercase">Blocked Exfiltration Events</span>
            <div className="text-2xl font-black mt-1 text-rose-600 dark:text-rose-400">62 Incidents</div>
            <span className="text-[10px] text-rose-500 font-medium">Secrets & Source Code</span>
          </div>

          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-xs text-slate-500 font-semibold uppercase">Active DLP Rules</span>
            <div className="text-2xl font-black mt-1 text-indigo-600 dark:text-indigo-400">4 Enforced</div>
            <span className="text-[10px] text-indigo-500 font-medium">PCI, SSN, KMS, Source Code</span>
          </div>

          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-xs text-slate-500 font-semibold uppercase">AI Prompt Egress Guard</span>
            <div className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">Active</div>
            <span className="text-[10px] text-amber-500 font-medium">Automatic Code Masking</span>
          </div>
        </div>

        {/* Real-time Interactive DLP Inspection Tester */}
        <div className={`p-5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              Interactive DLP Inspection Test Console
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs text-slate-500 font-semibold">Simulate Egress Payload Text:</label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                rows={3}
                className={`w-full p-3 rounded-lg border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              />
              <button
                onClick={handleTestRule}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Run DLP Inspection Engine</span>
              </button>
            </div>

            <div className={`p-4 rounded-lg border flex flex-col justify-between ${
              testResult
                ? testResult.matched
                  ? isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/40 border-rose-900/50'
                  : isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/40 border-emerald-900/50'
                : isLight ? 'bg-slate-200/50 border-slate-300' : 'bg-slate-900 border-slate-800'
            }`}>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">DLP Engine Verdict</span>
                {testResult ? (
                  <div>
                    <div className={`text-sm font-black mb-1 ${testResult.matched ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {testResult.verdict}
                    </div>
                    {testResult.matched && (
                      <span className="text-xs font-mono text-slate-700 dark:text-slate-300 block">
                        Triggered Rule: <strong>{testResult.rule}</strong>
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">Click 'Run DLP Inspection' to test payload.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DLP Enforced Inspection Policies Table */}
        <div className={`p-5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Enforced Enterprise DLP Rules & Inspection Policies
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`border-b text-[11px] text-slate-500 uppercase ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
                <tr>
                  <th className="px-4 py-3">Policy Identifier</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Inspection Pattern (Regex)</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Inspected Channels</th>
                  <th className="px-4 py-3 text-right">Triggers (24h)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {policies.map((pol) => (
                  <tr key={pol.id} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">{pol.policyName}</td>
                    <td className="px-4 py-3 text-emerald-600 font-bold">{pol.ruleCategory}</td>
                    <td className="px-4 py-3 text-slate-500 text-[10px] truncate max-w-xs">{pol.patternRegex}</td>
                    <td className="px-4 py-3 font-bold text-rose-600">{pol.action}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {pol.inspectedChannels.map((ch) => (
                          <span key={ch} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100">{pol.triggersLast24h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent DLP Incident Egress Log */}
        <div className={`p-5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-rose-600" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              Recent Data Loss Prevention (DLP) Incident Register ({filteredIncidents.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`border-b text-[11px] text-slate-500 uppercase ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Source User</th>
                  <th className="px-4 py-3">Egress Channel</th>
                  <th className="px-4 py-3">Destination Endpoint</th>
                  <th className="px-4 py-3">Matched Rule</th>
                  <th className="px-4 py-3">Items Count</th>
                  <th className="px-4 py-3 text-right">Enforced Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                    <td className="px-4 py-3 text-slate-500">{inc.timestamp}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">{inc.sourceUser}</td>
                    <td className="px-4 py-3 font-bold text-indigo-600">{inc.channel}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-xs">{inc.destination}</td>
                    <td className="px-4 py-3 text-rose-600 font-bold">{inc.matchedRule}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{inc.sensitiveItemCount} items</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        inc.enforcedAction === 'BLOCKED'
                          ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                      }`}>
                        {inc.enforcedAction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
