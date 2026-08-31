import React, { useState } from 'react';
import {
  UserCheck,
  UserX,
  Activity,
  AlertTriangle,
  Zap,
  Shield,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  RefreshCw,
  Globe,
  Clock,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PRESET_UEBA_PROFILES, PRESET_UEBA_ANOMALIES } from '../data/enterprisePresets';
import { UebaEntityRiskProfile, UebaAnomalyEvent } from '../types';

export function UebaAnalyticsView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [profiles, setProfiles] = useState<UebaEntityRiskProfile[]>(PRESET_UEBA_PROFILES);
  const [anomalies, setAnomalies] = useState<UebaAnomalyEvent[]>(PRESET_UEBA_ANOMALIES);
  const [entityFilter, setEntityFilter] = useState<'ALL' | 'CONTRACTOR' | 'SERVICE_ACCOUNT' | 'EMPLOYEE' | 'PRIVILEGED_ADMIN'>('ALL');
  const [selectedEntityId, setSelectedEntityId] = useState<string>(PRESET_UEBA_PROFILES[0].id);

  const filteredProfiles = profiles.filter(
    (p) => entityFilter === 'ALL' || p.entityType === entityFilter
  );

  const selectedProfile = profiles.find((p) => p.id === selectedEntityId) || profiles[0];

  const handleIsolateEntity = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'ISOLATED', riskScore: Math.min(100, p.riskScore + 5) } : p))
    );
  };

  const handleResetBaseline = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'MONITORING', activeAlertsCount: 0, riskScore: 10 } : p))
    );
  };

  return (
    <div className={`flex flex-col flex-1 h-full overflow-y-auto ${isLight ? 'bg-slate-100/80 text-slate-800' : 'bg-slate-900 text-slate-100'}`}>
      {/* Header Banner */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${isLight ? 'bg-slate-100/90 border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-rose-600 to-amber-600 rounded-xl shadow-md text-white">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                User & Entity Behavior Analytics (UEBA)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 uppercase">
                Peer Baseline • Impossible Travel • Insider Threat
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI-driven entity profiling, anomalous data egress detection, and zero-trust identity isolation.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Entity Category:</span>
          {(['ALL', 'CONTRACTOR', 'SERVICE_ACCOUNT', 'PRIVILEGED_ADMIN', 'EMPLOYEE'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setEntityFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                entityFilter === cat
                  ? isLight
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-600 text-white'
                  : isLight
                  ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-[1600px] mx-auto w-full">
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Monitored User Identities</span>
            <div className="text-xl font-black mt-0.5 text-slate-900 dark:text-slate-100">1,240 Users</div>
            <span className="text-[10px] text-emerald-600 font-medium">98% Normal Baseline</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">High-Risk Profiles</span>
            <div className="text-xl font-black mt-0.5 text-rose-600 dark:text-rose-400">2 Critical</div>
            <span className="text-[10px] text-rose-500 font-medium">+520% Peer Baseline Spike</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Automated Isolations</span>
            <div className="text-xl font-black mt-0.5 text-amber-600 dark:text-amber-400">1 Workstation</div>
            <span className="text-[10px] text-amber-500 font-medium">CrowdStrike EDR Active</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Service Accounts</span>
            <div className="text-xl font-black mt-0.5 text-indigo-600 dark:text-indigo-400">342 SVIDs</div>
            <span className="text-[10px] text-indigo-500 font-medium">SPIFFE Identity Attested</span>
          </div>
        </div>

        {/* Entity Risk Profiles Table & Detail Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Profile Table */}
          <div className={`lg:col-span-2 p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Entity Risk Behavior Register ({filteredProfiles.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b font-mono text-[10px] text-slate-500 uppercase ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <tr>
                    <th className="px-3 py-2">Identity Name</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Peer Deviation</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                  {filteredProfiles.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedEntityId(p.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedEntityId === p.id
                          ? isLight
                            ? 'bg-rose-50/90 font-bold'
                            : 'bg-rose-950/40 font-bold'
                          : isLight
                          ? 'hover:bg-slate-50'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">{p.entityName}</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{p.entityType}</td>
                      <td className="px-3 py-2 text-amber-600 font-bold text-[11px]">{p.peerGroupBaselineDiff}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          p.status === 'ISOLATED'
                            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                            : p.status === 'REQUIRE_REAUTH'
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-bold">
                        <span className={p.riskScore > 70 ? 'text-rose-600' : 'text-emerald-600'}>
                          {p.riskScore} / 100
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Entity SOC Action Panel */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  Entity Defense Control
                </h3>
              </div>

              <div className="p-3 rounded-lg border mb-3 bg-rose-500/10 border-rose-500/20 text-slate-800 dark:text-slate-200 text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">{selectedProfile.entityName}</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] mb-1">
                  Role: <strong>{selectedProfile.entityType}</strong> ({selectedProfile.department})
                </p>
                <div className="text-[11px] font-mono text-rose-600 font-bold">
                  Deviation: {selectedProfile.peerGroupBaselineDiff}
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Risk Score:</span>
                  <span className="font-bold text-rose-600">{selectedProfile.riskScore} / 100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Unresolved Alerts:</span>
                  <span className="font-bold text-amber-600">{selectedProfile.activeAlertsCount} Alerts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Primary Anomaly:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">{selectedProfile.lastAnomalyType}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                onClick={() => handleIsolateEntity(selectedProfile.id)}
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Isolate Identity & Terminate</span>
              </button>

              <button
                onClick={() => handleResetBaseline(selectedProfile.id)}
                className="w-full py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recalibrate ML Baseline</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Behavioral Anomaly Stream */}
        <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center gap-2 mb-2.5">
            <Activity className="w-4 h-4 text-amber-500" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              Real-time Entity Behavioral Anomaly Log
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`border-b text-[10px] text-slate-500 uppercase ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
                <tr>
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">Entity Identity</th>
                  <th className="px-3 py-2">Anomaly Description</th>
                  <th className="px-3 py-2">Source IP & Geo</th>
                  <th className="px-3 py-2">Automated SOAR Action</th>
                  <th className="px-3 py-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {anomalies.map((anom) => (
                  <tr key={anom.id} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                    <td className="px-3 py-2 text-slate-500">{anom.timestamp}</td>
                    <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100">{anom.entityName}</td>
                    <td className="px-3 py-2 text-rose-600 font-bold">{anom.anomalyTitle}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{anom.sourceIp} ({anom.location})</td>
                    <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400 font-bold">{anom.mitigationAction}</td>
                    <td className="px-3 py-2 text-right font-bold text-rose-600">{anom.riskScore}</td>
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
