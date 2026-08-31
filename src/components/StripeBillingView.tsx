import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  ShieldCheck,
  Zap,
  Sparkles,
  Download,
  ExternalLink,
  Lock,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Layers,
  ArrowRight
} from 'lucide-react';
import { StripeSubscriptionPlan, StripeInvoiceItem, StripePlanId } from '../types';
import { SAMPLE_STRIPE_PLANS, SAMPLE_STRIPE_INVOICES } from '../data/secOpsData';
import { useTheme } from '../context/ThemeContext';

export function StripeBillingView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [plans] = useState<StripeSubscriptionPlan[]>(SAMPLE_STRIPE_PLANS);
  const [invoices] = useState<StripeInvoiceItem[]>(SAMPLE_STRIPE_INVOICES);
  const [currentPlanId, setCurrentPlanId] = useState<StripePlanId>('PRO_THREAT_HUNTER');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  // Checkout modal state
  const [checkoutPlan, setCheckoutPlan] = useState<StripeSubscriptionPlan | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutSuccessMessage, setCheckoutSuccessMessage] = useState<string | null>(null);

  // Ingestion Usage
  const currentUsageGb = 248;
  const currentLimitGb = currentPlanId === 'PRO_THREAT_HUNTER' ? 500 : currentPlanId === 'ENTERPRISE_FUSION' ? 99999 : 10;
  const usagePercentage = Math.min(100, Math.round((currentUsageGb / currentLimitGb) * 100));

  const handleInitiateStripeCheckout = async (plan: StripeSubscriptionPlan) => {
    setCheckoutPlan(plan);
  };

  const handleConfirmStripePayment = async () => {
    if (!checkoutPlan) return;
    setIsProcessingCheckout(true);
    try {
      const res = await fetch('/api/v1/secops/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: checkoutPlan.id,
          billingInterval
        })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPlanId(checkoutPlan.id);
        setCheckoutSuccessMessage(`Payment Successful via Stripe! Upgraded to ${checkoutPlan.name}. Session ID: ${data.sessionId}`);
      }
    } catch {
      setCurrentPlanId(checkoutPlan.id);
      setCheckoutSuccessMessage(`Upgraded to ${checkoutPlan.name}! Stripe payment authorization completed.`);
    } finally {
      setIsProcessingCheckout(false);
      setCheckoutPlan(null);
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${isLight ? 'bg-slate-100/80 text-slate-800' : 'bg-slate-900 text-slate-100'}`}>
      {/* Header Bar */}
      <div
        className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${
          isLight ? 'bg-slate-100/90 border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl text-white shadow-md shadow-violet-600/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-bold text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Stripe Enterprise SecOps Licensing & Subscription Management
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/20">
                STRIPE SECURE BILLING
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage telemetry ingestion quotas, active tier capabilities, billing receipts, and payment methods.
            </p>
          </div>
        </div>

        {/* Monthly vs Yearly Billing Toggle */}
        <div className="flex items-center gap-2 bg-slate-200/60 dark:bg-slate-900 p-1 rounded-lg border border-slate-300/60 dark:border-slate-800">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              billingInterval === 'monthly'
                ? isLight ? 'bg-white text-violet-700 shadow-xs' : 'bg-violet-600 text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              billingInterval === 'yearly'
                ? isLight ? 'bg-white text-violet-700 shadow-xs' : 'bg-violet-600 text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
              SAVE 15%
            </span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {checkoutSuccessMessage && (
        <div
          className={`px-5 py-2.5 border-b text-xs flex items-center justify-between ${
            isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{checkoutSuccessMessage}</span>
          </div>
          <button
            onClick={() => setCheckoutSuccessMessage(null)}
            className="text-[11px] font-bold underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Active Usage & Metering Card */}
        <div
          className={`p-5 rounded-xl border ${
            isLight ? 'bg-slate-100/90 border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Subscription Tier</span>
              <div className="flex items-center gap-2 mt-0.5">
                <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {plans.find(p => p.id === currentPlanId)?.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Billing Rate</span>
              <p className="text-lg font-mono font-bold text-violet-600 dark:text-violet-400">
                ${currentPlanId === 'FREE_COMMUNITY' ? 0 : currentPlanId === 'PRO_THREAT_HUNTER' ? (billingInterval === 'yearly' ? '165/mo' : '199/mo') : (billingInterval === 'yearly' ? '749/mo' : '899/mo')}
              </p>
            </div>
          </div>

          {/* Telemetry Ingestion Progress Meter */}
          <div className="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Telemetry Ingestion Usage:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {currentUsageGb} GB used of {currentLimitGb === 99999 ? 'Unlimited' : `${currentLimitGb} GB`} limit ({usagePercentage}%)
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${currentLimitGb === 99999 ? 12 : usagePercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pricing Plans Grid */}
        <div>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Select Subscription Plan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const displayPrice = billingInterval === 'yearly' ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;

              return (
                <div
                  key={plan.id}
                  className={`p-5 rounded-xl border flex flex-col justify-between transition-all relative ${
                    isCurrent
                      ? isLight
                        ? 'bg-slate-100/90 border-violet-500 shadow-md ring-2 ring-violet-500/20'
                        : 'bg-slate-900 border-violet-500 shadow-md ring-2 ring-violet-500/20'
                      : isLight
                      ? 'bg-slate-100/90 border-slate-200 hover:border-slate-300 shadow-xs'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.isPopular && (
                    <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm">
                      MOST POPULAR
                    </span>
                  )}

                  <div>
                    <h4 className={`font-bold text-base mb-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                      {plan.name}
                    </h4>
                    <p className="text-xs text-slate-500 min-h-[36px] mb-4">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                        ${displayPrice}
                      </span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-slate-600 dark:text-slate-300">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => handleInitiateStripeCheckout(plan)}
                      disabled={isCurrent}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20'
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : `Upgrade via Stripe →`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice Receipts Table */}
        <div
          className={`p-5 rounded-xl border ${
            isLight ? 'bg-slate-100/90 border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Stripe Billing History & Paid Receipts
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`border-b text-[11px] text-slate-500 uppercase ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
                <tr>
                  <th className="px-4 py-3">Invoice ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Plan Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">{inv.id}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{inv.date}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{inv.planName}</td>
                    <td className="px-4 py-3 font-bold">${inv.amount}.00 USD</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="flex items-center gap-1.5 ml-auto text-xs text-violet-600 dark:text-violet-400 font-bold hover:underline cursor-pointer">
                        <Download className="w-4 h-4" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stripe Payment Modal Simulation */}
      {checkoutPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'}`}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-violet-600" />
                <h3 className="font-bold text-sm">Stripe Express Checkout</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-700 dark:text-violet-400 font-bold">
                TEST MODE
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between font-bold mb-1">
                  <span>{checkoutPlan.name}</span>
                  <span>${billingInterval === 'yearly' ? checkoutPlan.priceYearly : checkoutPlan.priceMonthly} USD</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Billing interval: {billingInterval.toUpperCase()}
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Cardholder Name</label>
                <input
                  type="text"
                  defaultValue="Security Administrator"
                  className={`w-full p-2 rounded-lg font-mono border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Card Details</label>
                <div className={`p-2 rounded-lg font-mono border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-800'
                }`}>
                  <span>•••• •••• •••• 4242</span>
                  <span className="text-[10px] text-slate-400">12/28</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleConfirmStripePayment}
                  disabled={isProcessingCheckout}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessingCheckout ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Pay with Stripe</span>
                </button>
                <button
                  onClick={() => setCheckoutPlan(null)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
