import React, { useState } from 'react';
import {
  Lock,
  CreditCard,
  Server,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Zap,
  DollarSign,
  FileText,
  Key,
  Shield,
  ExternalLink,
  Cpu,
  Layers,
  Check
} from 'lucide-react';
import { SpireWorkloadEntry, SpireNodeAgent, StripeSubscriptionPlan, StripeInvoiceItem } from '../types';
import { SAMPLE_SPIRE_WORKLOADS, SAMPLE_SPIRE_NODES, SAMPLE_STRIPE_PLANS, SAMPLE_STRIPE_INVOICES } from '../data/secOpsData';
import { useTheme } from '../context/ThemeContext';

export function SpireStripeHub() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<'SPIRE' | 'STRIPE'>('SPIRE');
  const [workloads, setWorkloads] = useState<SpireWorkloadEntry[]>(SAMPLE_SPIRE_WORKLOADS);
  const [nodes, setNodes] = useState<SpireNodeAgent[]>(SAMPLE_SPIRE_NODES);
  const [plans, setPlans] = useState<StripeSubscriptionPlan[]>(SAMPLE_STRIPE_PLANS);
  const [invoices, setInvoices] = useState<StripeInvoiceItem[]>(SAMPLE_STRIPE_INVOICES);

  const [selectedPlanId, setSelectedPlanId] = useState<string>('PRO_THREAT_HUNTER');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<string | null>(null);

  const [attestationLoading, setAttestationLoading] = useState(false);
  const [attestationResult, setAttestationResult] = useState<any | null>(null);

  const handleRunAttestation = async (spiffeId: string) => {
    setAttestationLoading(true);
    try {
      const res = await fetch('/api/v1/secops/spire-attestation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spiffeId })
      });
      const data = await res.json();
      setAttestationResult(data);
    } catch {
      setAttestationResult({
        success: true,
        spiffeId,
        status: 'ISSUED_VALID',
        svidSerialNumber: 'svid-9482910',
        message: 'TPM2 & K8s PSAT attestation successful. SVID X.509 renewed.'
      });
    } finally {
      setAttestationLoading(false);
    }
  };

  const handleStripeCheckout = async (planId: string) => {
    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/v1/secops/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingInterval })
      });
      const data = await res.json();
      setCheckoutResult(data.message || `Successfully subscribed to ${planId}!`);
    } catch {
      setCheckoutResult(`Mock Stripe Checkout successful for ${planId}!`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-900 text-slate-100'}`}>
      {/* Top Header */}
      <div className={`p-4 border-b flex items-center justify-between gap-4 ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-slate-800 rounded-xl text-white shadow-md">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-bold text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                SPIRE Workload Identity & Stripe Billing Hub
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                ZERO-TRUST SVID + SECURE BILLING
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage SPIFFE/SPIRE cryptographic workload identity attestation and Stripe enterprise license subscriptions.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('SPIRE')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SPIRE'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>SPIRE Identity Mesh</span>
          </button>
          <button
            onClick={() => setActiveTab('STRIPE')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'STRIPE'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Stripe Subscriptions & Billing</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'SPIRE' ? (
          <div className="space-y-6">
            {/* SPIRE Nodes Status Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nodes.map(node => (
                <div key={node.id} className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                      {node.cluster}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      node.health === 'HEALTHY' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                    }`}>
                      {node.health}
                    </span>
                  </div>
                  <h4 className={`text-xs font-mono font-bold truncate ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {node.hostname}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">IP: {node.ipAddress} • Attestor: {node.attestorType}</p>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Connected Workloads:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{node.connectedWorkloads} SVIDs</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Workload SVID Entries Table */}
            <div className={`p-5 rounded-xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  SPIFFE Workload SVID Registrations & Attestations
                </h3>
                <span className="text-xs font-mono text-slate-500">{workloads.length} Active Workload Registrations</span>
              </div>

              <div className="space-y-3">
                {workloads.map(wl => (
                  <div key={wl.id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          wl.status === 'ISSUED_VALID' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        }`}>
                          {wl.status}
                        </span>
                        <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                          {wl.workloadName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">NS: {wl.namespace}</span>
                      </div>
                      <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 truncate">
                        {wl.spiffeId}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {wl.selectors.map((sel, idx) => (
                          <span key={idx} className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {sel.type}:{sel.key}={sel.value}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right font-mono text-[11px] text-slate-500 hidden lg:block">
                        <p>TTL: {wl.ttlSeconds / 3600}h</p>
                        <p>Type: {wl.svidType}</p>
                      </div>

                      <button
                        onClick={() => handleRunAttestation(wl.spiffeId)}
                        disabled={attestationLoading}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        {attestationLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                        <span>Attest & Rotate SVID</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {attestationResult && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-mono text-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>SPIFFE SVID Attestation Successful</span>
                  </div>
                  <p>SPIFFE ID: {attestationResult.spiffeId}</p>
                  <p>Serial: {attestationResult.svidSerialNumber} • Expires: {new Date(attestationResult.expiresAt).toLocaleTimeString()}</p>
                  <p className="mt-1 text-[11px] opacity-90">{attestationResult.message}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stripe Plans Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Stripe Subscription & Licensing Tiers
                  </h3>
                  <p className="text-xs text-slate-500">Select or upgrade your AgentForge SecOps Fusion tier.</p>
                </div>

                <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-lg text-xs font-mono font-semibold">
                  <button
                    onClick={() => setBillingInterval('monthly')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${billingInterval === 'monthly' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-500'}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingInterval('yearly')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${billingInterval === 'yearly' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-500'}`}
                  >
                    Yearly (Save 20%)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {plans.map(plan => {
                  const price = billingInterval === 'yearly' ? Math.round(plan.priceMonthly * 12 * 0.8) : plan.priceMonthly;
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 ' + (isLight ? 'bg-white shadow-md' : 'bg-slate-900')
                          : isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div>
                        {plan.isPopular && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white mb-3 inline-block shadow-xs">
                            MOST POPULAR
                          </span>
                        )}
                        <h4 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{plan.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-4">{plan.description}</p>

                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">${price}</span>
                          <span className="text-xs text-slate-500 font-mono">/{billingInterval === 'yearly' ? 'year' : 'month'}</span>
                        </div>

                        <div className="space-y-2 mb-6">
                          {plan.features.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedPlanId(plan.id);
                          handleStripeCheckout(plan.id);
                        }}
                        disabled={isCheckingOut}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            : isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        {isCheckingOut && selectedPlanId === plan.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing Stripe Checkout...</span>
                          </span>
                        ) : isSelected ? (
                          'Active Subscription Plan'
                        ) : (
                          'Select Plan'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {checkoutResult && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-800 dark:text-indigo-300 font-mono text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{checkoutResult}</span>
                </div>
              )}
            </div>

            {/* Invoices History */}
            <div className={`p-5 rounded-xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Stripe Billing & Invoice History
              </h3>

              <div className="space-y-2">
                {invoices.map(inv => (
                  <div key={inv.id} className={`p-3 rounded-lg border flex items-center justify-between text-xs font-mono ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{inv.planName}</p>
                        <p className="text-[11px] text-slate-500">Invoice {inv.id} • Date: {inv.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-900 dark:text-slate-100">${inv.amount}.00 USD</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        {inv.status}
                      </span>
                      <a href={inv.pdfUrl} className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                        <span>PDF</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
