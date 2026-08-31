import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  AlertOctagon,
  FileCheck,
  ExternalLink,
  Layers,
  Search,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PRESET_TPCRM_VENDORS, PRESET_FOURTH_PARTY_EXPOSURES } from '../data/enterprisePresets';
import { TpcrmVendor, TpcrmFourthPartyExposure } from '../types';

export function TpcrmVendorView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [vendors, setVendors] = useState<TpcrmVendor[]>(PRESET_TPCRM_VENDORS);
  const [fourthParty, setFourthParty] = useState<TpcrmFourthPartyExposure[]>(PRESET_FOURTH_PARTY_EXPOSURES);
  const [selectedVendorId, setSelectedVendorId] = useState<string>(PRESET_TPCRM_VENDORS[0].id);

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];

  return (
    <div className={`flex flex-col flex-1 h-full overflow-y-auto ${isLight ? 'bg-slate-100/80 text-slate-800' : 'bg-slate-900 text-slate-100'}`}>
      {/* Top Banner */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${isLight ? 'bg-slate-100/90 border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-md text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Third-Party & Supply Chain Cyber Risk (TPCRM)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 uppercase">
                Vendor Scorecards • 4th-Party Graph • AI Audit
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Continuous monitoring of SaaS vendors, cloud supply chain dependencies, and fourth-party exposures.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-[1600px] mx-auto w-full">
        {/* KPI Summaries */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Active SaaS Vendors</span>
            <div className="text-xl font-black mt-0.5 text-slate-900 dark:text-slate-100">38 Monitored</div>
            <span className="text-[10px] text-emerald-600 font-medium">10 Tier-1 Critical</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Supply Chain Alerts</span>
            <div className="text-xl font-black mt-0.5 text-rose-600 dark:text-rose-400">1 Critical Alert</div>
            <span className="text-[10px] text-rose-500 font-medium">Outsourced Dev Stealer Log</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">SOC 2 / ISO Compliance</span>
            <div className="text-xl font-black mt-0.5 text-emerald-600 dark:text-emerald-400">92% Valid</div>
            <span className="text-[10px] text-amber-500 font-medium">1 Audit Expired</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">4th-Party Dependencies</span>
            <div className="text-xl font-black mt-0.5 text-indigo-600 dark:text-indigo-400">114 Sub-processors</div>
            <span className="text-[10px] text-indigo-500 font-medium">Mapped to OSINT Recon</span>
          </div>
        </div>

        {/* Vendors Directory Table & Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Vendor Table */}
          <div className={`lg:col-span-2 p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Vendor Risk Assessment Register
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b font-mono text-[10px] text-slate-500 uppercase ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <tr>
                    <th className="px-3 py-2">Vendor Name</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Tier</th>
                    <th className="px-3 py-2">Questionnaire</th>
                    <th className="px-3 py-2 text-right">Cyber Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                  {vendors.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVendorId(v.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedVendorId === v.id
                          ? isLight
                            ? 'bg-blue-50/90 font-bold'
                            : 'bg-blue-950/40 font-bold'
                          : isLight
                          ? 'hover:bg-slate-50'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100">{v.name}</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{v.category}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${v.postureTier.includes('CRITICAL') ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400' : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'}`}>
                          {v.postureTier.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{v.questionnaireStatus}</td>
                      <td className="px-3 py-2 text-right font-bold">
                        <span className={v.riskScore > 60 ? 'text-rose-600' : 'text-emerald-600'}>
                          {v.riskScore} / 100
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Security Dossier Panel */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  AI Vendor Security Dossier
                </h3>
              </div>

              <div className="p-3 rounded-lg border mb-3 bg-amber-500/10 border-amber-500/20 text-slate-800 dark:text-slate-200 text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">{selectedVendor.name}</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">{selectedVendor.aiSecuritySummary}</p>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Certifications</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVendor.certifications.map((cert) => (
                      <span key={cert} className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Shared Data Assets</span>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 text-[11px] mt-1 space-y-0.5">
                    {selectedVendor.dataSharedTypes.map((dt, i) => (
                      <li key={i}>{dt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
              Last Assessed: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedVendor.lastAssessmentDate}</span>
            </div>
          </div>
        </div>

        {/* 4th Party Exposure Register */}
        <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Fourth-Party Sub-Processor Risk Graph
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`border-b text-[10px] text-slate-500 uppercase ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
                <tr>
                  <th className="px-3 py-2">Tier-1 Vendor</th>
                  <th className="px-3 py-2">4th-Party Sub-Processor</th>
                  <th className="px-3 py-2">Shared Dependency</th>
                  <th className="px-3 py-2">Breach Status</th>
                  <th className="px-3 py-2 text-right">Impact Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {fourthParty.map((fp) => (
                  <tr key={fp.id} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                    <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100">{fp.vendorName}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{fp.subProcessorName}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{fp.sharedDependency}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${fp.breachStatus === 'STABLE' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'}`}>
                        {fp.breachStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-rose-600">{fp.impactRating}</td>
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
