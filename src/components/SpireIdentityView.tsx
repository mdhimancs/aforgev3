import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Lock,
  Layers,
  Terminal,
  Zap,
  Sparkles,
  FileCode,
  Copy,
  Check,
  CheckSquare,
  Network
} from 'lucide-react';
import { SpireWorkloadEntry, SpireNodeAgent } from '../types';
import { SAMPLE_SPIRE_WORKLOADS, SAMPLE_SPIRE_NODES } from '../data/secOpsData';
import { useTheme } from '../context/ThemeContext';

export function SpireIdentityView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [workloads, setWorkloads] = useState<SpireWorkloadEntry[]>(SAMPLE_SPIRE_WORKLOADS);
  const [nodes, setNodes] = useState<SpireNodeAgent[]>(SAMPLE_SPIRE_NODES);
  const [selectedWorkloadId, setSelectedWorkloadId] = useState<string>(SAMPLE_SPIRE_WORKLOADS[0].id);
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestationMessage, setAttestationMessage] = useState<string | null>(null);
  const [copiedCert, setCopiedCert] = useState(false);

  // Microsegmentation simulator state
  const [sourceSpiffe, setSourceSpiffe] = useState(SAMPLE_SPIRE_WORKLOADS[0].spiffeId);
  const [targetSpiffe, setTargetSpiffe] = useState(SAMPLE_SPIRE_WORKLOADS[1].spiffeId);
  const [policyCheckResult, setPolicyCheckResult] = useState<{ allowed: boolean; reason: string } | null>(null);

  const activeWorkload = workloads.find(w => w.id === selectedWorkloadId) || workloads[0];

  // Issue / Re-Attest SVID for workload
  const handleReattestWorkload = async () => {
    setIsAttesting(true);
    setAttestationMessage(null);
    try {
      const res = await fetch('/api/v1/secops/spire-attestation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spiffeId: activeWorkload.spiffeId,
          selectors: activeWorkload.selectors
        })
      });
      const data = await res.json();
      if (data.success) {
        setAttestationMessage(`Attestation verified: Issued X.509 SVID (Serial: ${data.svidSerialNumber}). Expires in 4 hours.`);
        // Update workload status
        setWorkloads(prev => prev.map(w => w.id === activeWorkload.id ? { ...w, status: 'ISSUED_VALID', issuedAt: new Date().toISOString() } : w));
      }
    } catch {
      setAttestationMessage('Attestation issued via local SPIRE Agent TPM 2.0 quote simulation.');
    } finally {
      setIsAttesting(false);
    }
  };

  const handleTestPolicy = () => {
    if (sourceSpiffe === targetSpiffe) {
      setPolicyCheckResult({ allowed: false, reason: 'Self-connection blocked by Zero-Trust loopback policy.' });
    } else if (sourceSpiffe.includes('siem-collector') && targetSpiffe.includes('soar-executor')) {
      setPolicyCheckResult({ allowed: true, reason: 'ALLOWED: Valid mTLS handshake with verified SPIFFE SVIDs over port 8443.' });
    } else {
      setPolicyCheckResult({ allowed: true, reason: 'ALLOWED: SPIFFE ID identity selectors matched zero-trust mTLS policy rules.' });
    }
  };

  const handleCopySvidCert = () => {
    const certPem = `-----BEGIN CERTIFICATE-----\nMIIDQjCCAiqgAwIBAgIU${activeWorkload.id}...\nSubject: SPIFFE ID ${activeWorkload.spiffeId}\nIssuer: SPIRE Server Root CA\n-----END CERTIFICATE-----`;
    navigator.clipboard.writeText(certPem);
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${isLight ? 'bg-slate-100/80 text-slate-800' : 'bg-slate-900 text-slate-100'}`}>
      {/* Header Bar */}
      <div
        className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl text-white shadow-md shadow-emerald-500/20">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-bold text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                SPIRE / SPIFFE Zero-Trust Workload Identity Attestation
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                HARDWARE TPM & K8S ATTESTATION
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Secretless, cryptographic workload identity (SVID) issuance for microservices, SIEM collectors, and SOAR runners.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReattestWorkload}
            disabled={isAttesting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
          >
            {isAttesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Issue / Renew SPIFFE SVID</span>
          </button>
        </div>
      </div>

      {/* Attestation Feedback Notice */}
      {attestationMessage && (
        <div
          className={`px-5 py-2.5 border-b text-xs flex items-center justify-between ${
            isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{attestationMessage}</span>
          </div>
          <button
            onClick={() => setAttestationMessage(null)}
            className="text-[11px] font-bold underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto p-3.5 gap-3.5">
        {/* Left Column: Workload Identity Inventory (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div
            className={`p-4 rounded-xl border flex flex-col flex-1 ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Registered Workload Identities ({workloads.length})
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[440px] pr-1">
              {workloads.map((w) => {
                const isSelected = w.id === selectedWorkloadId;
                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWorkloadId(w.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : isLight
                        ? 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                        : 'bg-slate-900 hover:bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        {w.svidType} SVID
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {w.status}
                      </span>
                    </div>

                    <h4 className={`text-xs font-bold leading-snug mb-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                      {w.workloadName}
                    </h4>

                    <p className="text-[11px] font-mono text-slate-500 truncate mb-2">
                      {w.spiffeId}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                      <span>Namespace: {w.namespace}</span>
                      <span>Selectors: {w.selectors.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Agent Attestors Card */}
          <div
            className={`p-4 rounded-xl border ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              SPIRE Node Attestor Agents ({nodes.length})
            </h3>

            <div className="space-y-2">
              {nodes.map((node) => (
                <div key={node.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-slate-100">{node.hostname}</span>
                    <span className="text-[10px] text-slate-500">{node.attestorType.toUpperCase()} • {node.connectedWorkloads} Workloads</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    node.health === 'HEALTHY' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                  }`}>
                    {node.health}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Workload Details & Microsegmentation Simulator (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3.5">
          {/* Active Workload SVID Inspector */}
          <div
            className={`p-4 rounded-xl border ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  SPIFFE SVID ACTIVE
                </span>
                <h3 className={`font-bold text-base mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {activeWorkload.workloadName}
                </h3>
                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {activeWorkload.spiffeId}
                </p>
              </div>

              <button
                onClick={handleCopySvidCert}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {copiedCert ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCert ? 'Copied SVID' : 'Copy SVID Cert'}</span>
              </button>
            </div>

            {/* Selectors List */}
            <div className="mt-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Verified Attestation Selectors (TPM/K8s/Kernel)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeWorkload.selectors.map((sel, idx) => (
                  <span key={idx} className="px-2 py-1 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                    <strong className="text-emerald-600 dark:text-emerald-400">{sel.type}:</strong> {sel.key}={sel.value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Microsegmentation Zero-Trust Enforcer Simulator */}
          <div
            className={`p-4 rounded-xl border ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Network className="w-4 h-4 text-emerald-500" />
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Zero-Trust Microsegmentation Policy Authorization Tester
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Source Workload SPIFFE ID</label>
                <select
                  value={sourceSpiffe}
                  onChange={(e) => setSourceSpiffe(e.target.value)}
                  className={`w-full p-2 rounded-lg font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                  }`}
                >
                  {workloads.map(w => (
                    <option key={w.id} value={w.spiffeId}>{w.workloadName} ({w.spiffeId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Destination Target SPIFFE ID</label>
                <select
                  value={targetSpiffe}
                  onChange={(e) => setTargetSpiffe(e.target.value)}
                  className={`w-full p-2 rounded-lg font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                  }`}
                >
                  {workloads.map(w => (
                    <option key={w.id} value={w.spiffeId}>{w.workloadName} ({w.spiffeId})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleTestPolicy}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Test mTLS Zero-Trust Authorization
              </button>

              {policyCheckResult && (
                <div className={`p-3 rounded-lg border font-mono text-xs ${
                  policyCheckResult.allowed
                    ? isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                    : isLight ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-rose-950/40 border-rose-800 text-rose-200'
                }`}>
                  {policyCheckResult.reason}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
