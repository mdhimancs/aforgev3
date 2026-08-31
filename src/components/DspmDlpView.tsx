import React, { useState } from 'react';
import {
  Database,
  ShieldAlert,
  Bot,
  UserX,
  Lock,
  Eye,
  FileSpreadsheet,
  AlertTriangle,
  Zap,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  PRESET_DSPM_STORES,
  PRESET_SHADOW_AI_ALERTS,
  PRESET_INSIDER_THREATS
} from '../data/enterprisePresets';
import { DspmDataStore, DspmShadowAiAlert, DspmInsiderThreatEvent } from '../types';

export function DspmDlpView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [dataStores, setDataStores] = useState<DspmDataStore[]>(PRESET_DSPM_STORES);
  const [shadowAiAlerts, setShadowAiAlerts] = useState<DspmShadowAiAlert[]>(PRESET_SHADOW_AI_ALERTS);
  const [insiderThreats, setInsiderThreats] = useState<DspmInsiderThreatEvent[]>(PRESET_INSIDER_THREATS);

  return (
    <div className={`flex flex-col flex-1 h-full overflow-y-auto ${isLight ? 'bg-slate-100/80 text-slate-800' : 'bg-slate-900 text-slate-100'}`}>
      {/* Top Banner */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${isLight ? 'bg-slate-100/90 border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-md text-white">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Data Security Posture (DSPM) & Shadow AI DLP
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 uppercase">
                PII Heatmap • Shadow LLM • Insider UEBA
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Locating sensitive data assets, enforcing zero-trust data loss prevention, and monitoring unapproved AI exfiltration.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-[1600px] mx-auto w-full">
        {/* KPI Cards Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Classified Data Stores</span>
            <div className="text-xl font-black mt-0.5 text-purple-600 dark:text-purple-400">18.7M Records</div>
            <span className="text-[10px] text-purple-500 font-medium">PII, PHI & Financial Tax</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Public Data Exposure</span>
            <div className="text-xl font-black mt-0.5 text-rose-600 dark:text-rose-400">1 Unencrypted S3</div>
            <span className="text-[10px] text-rose-500 font-medium">890k Audit Logs exposed</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Shadow AI DLP Alerts</span>
            <div className="text-xl font-black mt-0.5 text-amber-600 dark:text-amber-400">2 Blocked Today</div>
            <span className="text-[10px] text-amber-500 font-medium">Proprietary Code & Spreadsheets</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Insider Anomaly Score</span>
            <div className="text-xl font-black mt-0.5 text-rose-600 dark:text-rose-400">94 / 100 Risk</div>
            <span className="text-[10px] text-rose-500 font-medium">Contractor Bulk Download</span>
          </div>
        </div>

        {/* Shadow AI & LLM Exfiltration Alerts */}
        <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center gap-2 mb-2.5">
            <Bot className="w-4 h-4 text-purple-600" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              Shadow AI & Unapproved LLM Data Loss Prevention (DLP)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`border-b text-[10px] text-slate-500 uppercase ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
                <tr>
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">User Email</th>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">AI Endpoint</th>
                  <th className="px-3 py-2">Payload Type</th>
                  <th className="px-3 py-2">Payload Size</th>
                  <th className="px-3 py-2 text-right">DLP Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {shadowAiAlerts.map((alert) => (
                  <tr key={alert.id} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                    <td className="px-3 py-2 text-slate-500">{alert.timestamp}</td>
                    <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100">{alert.userEmail}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{alert.department}</td>
                    <td className="px-3 py-2 text-purple-600 font-bold">{alert.aiDestination}</td>
                    <td className="px-3 py-2 text-rose-600 font-bold">{alert.dataPayloadType}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{(alert.sizeBytes / 1024).toFixed(1)} KB</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${alert.verdict === 'BLOCKED_BY_DLP' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'}`}>
                        {alert.verdict}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2-Column Split: Data Store Register & Insider Threat UEBA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Enterprise Data Store Classification Inventory */}
          <div className={`lg:col-span-2 p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Enterprise Sensitive Data Store Register
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className={`border-b text-[10px] text-slate-500 uppercase ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
                  <tr>
                    <th className="px-3 py-2">Data Store</th>
                    <th className="px-3 py-2">Engine</th>
                    <th className="px-3 py-2">Classification</th>
                    <th className="px-3 py-2">Records</th>
                    <th className="px-3 py-2 text-right">Public Exposure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {dataStores.map((ds) => (
                    <tr key={ds.id} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 truncate max-w-[140px]">{ds.name}</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{ds.type}</td>
                      <td className="px-3 py-2 font-bold text-purple-600 dark:text-purple-400">{ds.classification}</td>
                      <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200">{ds.recordCount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-bold">
                        {ds.publicExposure ? (
                          <span className="px-2 py-0.5 rounded text-[9px] bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                            EXPOSED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                            PRIVATE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insider Threat & UEBA Anomaly Alert */}
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <div className="flex items-center gap-2 mb-2.5">
              <UserX className="w-4 h-4 text-rose-600" />
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Insider Threat UEBA
              </h3>
            </div>

            {insiderThreats.map((it) => (
              <div key={it.id} className={`p-3 rounded-lg border ${isLight ? 'bg-slate-50 border-rose-200' : 'bg-slate-900 border-rose-900/50'}`}>
                <div className="flex items-center justify-between gap-2 mb-1.5 font-mono">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{it.employeeName}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500 text-white">
                    Score: {it.anomalyScore}
                  </span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold mb-1.5 leading-tight">Trigger: {it.triggerEvent}</p>
                <div className="space-y-1 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                  <div>Downloads 24h: <strong>{it.downloadsLast24h}</strong></div>
                  <div>Baseline: <strong>{it.baselineDiff}</strong></div>
                  <div>Status: <strong>{it.status}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
