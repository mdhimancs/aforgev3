import React, { useState } from 'react';
import {
  Skull,
  Radio,
  Globe,
  Key,
  AlertTriangle,
  Zap,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Search,
  Crosshair
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  PRESET_STEALER_LOGS,
  PRESET_TYPOSQUAT_DOMAINS,
  PRESET_CANARY_TOKENS
} from '../data/enterprisePresets';
import { CtiStealerLogRecord, CtiTyposquatDomain, CtiCanaryTokenTrigger } from '../types';

export function DarkWebCtiView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [stealerLogs, setStealerLogs] = useState<CtiStealerLogRecord[]>(PRESET_STEALER_LOGS);
  const [typosquats, setTyposquats] = useState<CtiTyposquatDomain[]>(PRESET_TYPOSQUAT_DOMAINS);
  const [canaryTokens, setCanaryTokens] = useState<CtiCanaryTokenTrigger[]>(PRESET_CANARY_TOKENS);

  return (
    <div className={`flex flex-col flex-1 h-full overflow-y-auto ${isLight ? 'bg-slate-100/80 text-slate-800' : 'bg-slate-900 text-slate-100'}`}>
      {/* Top Banner */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${isLight ? 'bg-slate-100/90 border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-red-600 to-rose-700 rounded-xl shadow-md text-white">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Dark Web Radar & Cyber Threat Intelligence (CTI)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 uppercase">
                Stealer Logs • Phishing Kits • Honey-Tokens
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monitoring dark web forums, infostealer malware dumps, brand typosquatting, and decoy canary tokens.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-[1600px] mx-auto w-full">
        {/* KPI Cards Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Infostealer Malware Logs</span>
            <div className="text-xl font-black mt-0.5 text-rose-600 dark:text-rose-400">2 Accounts</div>
            <span className="text-[10px] text-rose-500 font-medium">RedLine & LumaStealer Dumps</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Phishing Typosquats</span>
            <div className="text-xl font-black mt-0.5 text-amber-600 dark:text-amber-400">1 Active Kit</div>
            <span className="text-[10px] text-amber-500 font-medium">Take-down Request Submitted</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Canary Honey-Tokens</span>
            <div className="text-xl font-black mt-0.5 text-rose-600 dark:text-rose-400">1 Tor Trigger</div>
            <span className="text-[10px] text-rose-500 font-medium">Decoy AWS Key accessed</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">VIP Protection</span>
            <div className="text-xl font-black mt-0.5 text-emerald-600 dark:text-emerald-400">Clean Status</div>
            <span className="text-[10px] text-emerald-600 font-medium">0 C-Suite Leaks Identified</span>
          </div>
        </div>

        {/* Infostealer Logs Table */}
        <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center gap-2 mb-2.5">
            <Skull className="w-4 h-4 text-rose-600" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              Dark Web Infostealer Credential Dumps
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`border-b text-[10px] text-slate-500 uppercase ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
                <tr>
                  <th className="px-3 py-2">Compromised Email</th>
                  <th className="px-3 py-2">Malware Family</th>
                  <th className="px-3 py-2">Target URL</th>
                  <th className="px-3 py-2">Credential Exposure</th>
                  <th className="px-3 py-2">Discovered Date</th>
                  <th className="px-3 py-2 text-right">Risk Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {stealerLogs.map((log) => (
                  <tr key={log.id} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                    <td className="px-3 py-2 font-bold text-rose-600 dark:text-rose-400">{log.leakedEmail}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{log.malwareFamily}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{log.exposedUrl}</td>
                    <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100">{log.plainOrHash}</td>
                    <td className="px-3 py-2 text-slate-500">{log.dateDiscovered}</td>
                    <td className="px-3 py-2 text-right font-bold text-rose-600">{log.riskRating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2-Column Grid: Typosquat Domain Radar & Canary Token Register */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Phishing Typosquatting Domain Radar */}
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Phishing & Brand Typosquatting Domain Radar
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className={`border-b text-[10px] text-slate-500 uppercase ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
                  <tr>
                    <th className="px-3 py-2">Domain</th>
                    <th className="px-3 py-2">Similarity</th>
                    <th className="px-3 py-2">IP / MX</th>
                    <th className="px-3 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {typosquats.map((typo) => (
                    <tr key={typo.id} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 truncate max-w-[140px]">{typo.domainName}</td>
                      <td className="px-3 py-2 font-bold text-amber-600">{typo.similarityScore}%</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-[11px]">{typo.ipAddress}</td>
                      <td className="px-3 py-2 text-right font-bold text-amber-600">{typo.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Canary Token Decoy Trigger Log */}
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <div className="flex items-center gap-2 mb-2.5">
              <Crosshair className="w-4 h-4 text-rose-600" />
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Decoy Canary Honey-Token Triggers
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className={`border-b text-[10px] text-slate-500 uppercase ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
                  <tr>
                    <th className="px-3 py-2">Canary Token</th>
                    <th className="px-3 py-2">Placement</th>
                    <th className="px-3 py-2">Trigger Source IP</th>
                    <th className="px-3 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {canaryTokens.map((ct) => (
                    <tr key={ct.id} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                      <td className="px-3 py-2 font-bold text-rose-600 truncate max-w-[130px]">{ct.tokenName}</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{ct.locationPlaced}</td>
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100">{ct.triggerSourceIp}</td>
                      <td className="px-3 py-2 text-right font-bold text-rose-600">{ct.status}</td>
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
