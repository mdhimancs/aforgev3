import React, { useState } from 'react';
import {
  Cloud,
  Shield,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Layers,
  Server,
  Key,
  Database,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  FileCode
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  PRESET_CSPM_ASSETS,
  PRESET_TOXIC_COMBINATIONS,
  PRESET_CIEM_ENTITLEMENTS
} from '../data/enterprisePresets';
import { CspmCloudAsset, CspmToxicCombination, CiemRoleEntitlement } from '../types';

export function CspmCiemView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [assets, setAssets] = useState<CspmCloudAsset[]>(PRESET_CSPM_ASSETS);
  const [toxicCombos, setToxicCombos] = useState<CspmToxicCombination[]>(PRESET_TOXIC_COMBINATIONS);
  const [entitlements, setEntitlements] = useState<CiemRoleEntitlement[]>(PRESET_CIEM_ENTITLEMENTS);

  const [providerFilter, setProviderFilter] = useState<'ALL' | 'AWS' | 'GCP' | 'Azure' | 'Kubernetes'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAssets = assets.filter(
    (a) => providerFilter === 'ALL' || a.provider === providerFilter
  );

  return (
    <div className={`flex flex-col flex-1 h-full overflow-y-auto ${isLight ? 'bg-slate-100/80 text-slate-800' : 'bg-slate-900 text-slate-100'}`}>
      {/* Top Banner */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${isLight ? 'bg-slate-100/90 border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md text-white">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Cloud Security Posture (CSPM) & CIEM Entitlements
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 uppercase">
                Multi-Cloud • Drift • Least-Privilege
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Continuous infrastructure compliance, toxic combination detection, and IAM entitlement scoping.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Cloud Provider:</span>
          {(['ALL', 'AWS', 'GCP', 'Kubernetes'] as const).map((prov) => (
            <button
              key={prov}
              onClick={() => setProviderFilter(prov)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                providerFilter === prov
                  ? isLight
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-600 text-white'
                  : isLight
                  ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {prov}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="p-4 space-y-4 max-w-[1600px] mx-auto w-full">
        {/* KPI Cards Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Total Monitored Assets</span>
            <div className="text-xl font-black mt-0.5 text-blue-600 dark:text-blue-400">428</div>
            <span className="text-[10px] text-emerald-600 font-medium">AWS, GCP & EKS Clusters</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Toxic Combinations</span>
            <div className="text-xl font-black mt-0.5 text-rose-600 dark:text-rose-400">2 Critical</div>
            <span className="text-[10px] text-rose-500 font-medium">Public S3 + Admin IAM</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">CIEM Over-Privileged</span>
            <div className="text-xl font-black mt-0.5 text-amber-600 dark:text-amber-400">84% Unused</div>
            <span className="text-[10px] text-amber-500 font-medium">324 Excessive Permissions</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">SPIRE Workload Bridge</span>
            <div className="text-xl font-black mt-0.5 text-emerald-600 dark:text-emerald-400">100% Attested</div>
            <span className="text-[10px] text-emerald-600 font-medium">SPIFFE SVID Verified</span>
          </div>
        </div>

        {/* Toxic Combinations Alert Section */}
        <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              Toxic Combination Analysis (Attack Path Correlation)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {toxicCombos.map((tc) => (
              <div
                key={tc.id}
                className={`p-3.5 rounded-lg border flex flex-col justify-between ${
                  isLight ? 'bg-slate-50 border-rose-200' : 'bg-slate-900 border-rose-900/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                      {tc.severity}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{tc.affectedAsset}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">{tc.title}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2 leading-tight">{tc.vectorSummary}</p>

                  <div className="space-y-1 mb-2.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Exploit Chain Path:</span>
                    {tc.vectorChain.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                        <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-2.5 rounded border font-mono text-[11px] relative ${isLight ? 'bg-slate-200/60 border-slate-300' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Remediation HCL</span>
                    <button
                      onClick={() => handleCopyCode(tc.id, tc.remediationTerraform)}
                      className="flex items-center gap-1 text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      {copiedId === tc.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === tc.id ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="text-[10px] overflow-x-auto text-slate-800 dark:text-slate-200 leading-tight">{tc.remediationTerraform}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Cloud Asset & CIEM Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cloud Asset Inventory Table */}
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Multi-Cloud Asset Posture ({filteredAssets.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b font-mono text-[10px] text-slate-500 uppercase ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <tr>
                    <th className="px-3 py-2">Asset Name</th>
                    <th className="px-3 py-2">Provider</th>
                    <th className="px-3 py-2">Drift</th>
                    <th className="px-3 py-2 text-right">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 truncate max-w-[140px]">
                        {asset.name}
                      </td>
                      <td className="px-3 py-2 font-bold text-blue-600 dark:text-blue-400">{asset.provider}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            asset.driftStatus === 'IN_SYNC'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {asset.driftStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-bold">
                        <span className={asset.riskScore > 70 ? 'text-rose-600' : 'text-emerald-600'}>
                          {asset.riskScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CIEM IAM Scoping Table */}
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              CIEM IAM Least-Privilege Entitlements
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className={`border-b text-[10px] text-slate-500 uppercase ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
                  <tr>
                    <th className="px-3 py-2">Identity</th>
                    <th className="px-3 py-2">Perms (Used/Assigned)</th>
                    <th className="px-3 py-2">Excessive %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {entitlements.map((ent) => (
                    <tr key={ent.id} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">{ent.identityName}</td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300 text-[11px]">
                        <span className="text-emerald-600 font-bold">{ent.usedPermissionsCount}</span> / {ent.assignedPermissionsCount}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${ent.overprivilegedScore > 50 ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'}`}>
                          {ent.overprivilegedScore}%
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
    </div>
  );
}
