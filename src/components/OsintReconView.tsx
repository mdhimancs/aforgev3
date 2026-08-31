import React, { useState } from 'react';
import {
  Globe,
  Search,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Database,
  Key,
  Terminal,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Layers,
  Cpu,
  User,
  Users,
  Lock,
  FileText,
  Copy,
  Check,
  Zap,
  CheckCircle2,
  Server,
  Activity,
  Shield,
  Eye,
  Crosshair,
  Filter
} from 'lucide-react';
import {
  OsintInvestigationReport,
  OsintRiskLevel,
  OsintSubdomain,
  OsintDnsRecord,
  OsintBreachRecord,
  OsintPortExposure,
  OsintEmployeeFootprint
} from '../types';
import { SAMPLE_OSINT_REPORT } from '../data/secOpsData';
import { useTheme } from '../context/ThemeContext';

export function OsintReconView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [report, setReport] = useState<OsintInvestigationReport>(SAMPLE_OSINT_REPORT);
  const [targetInput, setTargetInput] = useState('agentforge.corp');
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SUBDOMAINS' | 'DNS_WHOIS' | 'BREACHES' | 'PORTS' | 'EMPLOYEES' | 'GRAPH' | 'DOSSIER'>('OVERVIEW');
  const [copiedText, setCopiedText] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Perform OSINT Scan
  const handleRunOsintScan = async () => {
    if (!targetInput.trim()) return;
    setIsScanning(true);
    try {
      const res = await fetch('/api/v1/secops/osint-recon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: targetInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setReport(prev => ({
          ...prev,
          target: data.target || targetInput.trim(),
          overallThreatScore: data.threatScore || 78,
          riskLevel: data.riskLevel || 'HIGH',
          summary: data.summary || prev.summary,
          aiExecutiveDossier: data.aiExecutiveDossier || prev.aiExecutiveDossier,
          scanTimestamp: new Date().toISOString()
        }));
      }
    } catch {
      // Keep existing data as fallback
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopyDossier = () => {
    navigator.clipboard.writeText(report.aiExecutiveDossier);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const getRiskBadge = (risk: OsintRiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30">MEDIUM</span>;
      case 'LOW':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">LOW</span>;
    }
  };

  const filteredSubdomains = report.subdomains.filter(s =>
    s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.ip.includes(filterQuery) ||
    (s.technologies && s.technologies.some(t => t.toLowerCase().includes(filterQuery.toLowerCase())))
  );

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${isLight ? 'bg-slate-100/80 text-slate-800' : 'bg-slate-900 text-slate-100'}`}>
      {/* Header Bar */}
      <div
        className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${
          isLight ? 'bg-slate-100/90 border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-slate-700 rounded-xl text-white shadow-md shadow-indigo-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-bold text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                OSINT Threat Intelligence & Attack Surface Recon
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                PASSIVE RECON + DARK WEB
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuous external asset discovery, WHOIS/DNS audit, leaked credentials, certificate logs, and open ports.
            </p>
          </div>
        </div>

        {/* Recon Input Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunOsintScan()}
              placeholder="Domain, IP or Org e.g. acme.com..."
              className={`pl-9 pr-3 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
              }`}
            />
          </div>

          <button
            onClick={handleRunOsintScan}
            disabled={isScanning || !targetInput.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
          >
            {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Execute Recon Scan</span>
          </button>
        </div>
      </div>

      {/* Primary KPI & Overview Summary Banner */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${isLight ? 'bg-slate-100/80 border-slate-200/80' : 'bg-slate-900/60 border-slate-800'}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-slate-300 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Target Domain</span>
            <span className="font-mono text-sm font-bold text-indigo-700 dark:text-indigo-400">{report.target}</span>
          </div>

          <div className="flex items-center gap-3 pr-4 border-r border-slate-300 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Threat Score</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-base text-rose-600 dark:text-rose-400">
              <span>{report.overallThreatScore}/100</span>
              {getRiskBadge(report.riskLevel)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Discovered Assets</span>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold">
              <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{report.subdomains.length} Subdomains</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400">{report.portExposures.length} Ports</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">{report.breachRecords.length} Leaks</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Last Scan: {new Date(report.scanTimestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className={`px-4 pt-2 border-b flex items-center gap-1 overflow-x-auto ${isLight ? 'bg-slate-200/50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        {[
          { id: 'OVERVIEW', label: 'Attack Surface Summary', icon: Activity },
          { id: 'SUBDOMAINS', label: `Subdomains (${report.subdomains.length})`, icon: Server },
          { id: 'DNS_WHOIS', label: `DNS & WHOIS (${report.dnsRecords.length})`, icon: Database },
          { id: 'BREACHES', label: `Breaches & Leaks (${report.breachRecords.length})`, icon: ShieldAlert },
          { id: 'PORTS', label: `Port Exposures (${report.portExposures.length})`, icon: Crosshair },
          { id: 'EMPLOYEES', label: `Exposed Staff (${report.employeeFootprint.length})`, icon: Users },
          { id: 'DOSSIER', label: 'AI Executive Dossier', icon: FileText }
        ].map(tab => {
          const IconComponent = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                isSelected
                  ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                  : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5">
        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-3.5">
            {/* Summary Box */}
            <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Reconnaissance Findings Summary
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {report.summary}
              </p>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-500">Exposed Subdomains</span>
                  <Server className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {report.subdomains.length}
                </div>
                <span className="text-[11px] text-slate-500">1 takeover risk flagged</span>
              </div>

              <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-500">Vulnerable Ports</span>
                  <Crosshair className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                  {report.portExposures.filter(p => p.risk === 'CRITICAL' || p.risk === 'HIGH').length}
                </div>
                <span className="text-[11px] text-slate-500">CVE-2023-27997 Fortinet</span>
              </div>

              <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-500">Dark Web Breaches</span>
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                  {report.breachRecords.length}
                </div>
                <span className="text-[11px] text-slate-500">1.42M credentials dumped</span>
              </div>

              <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-500">Breached Employees</span>
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
                  {report.employeeFootprint.filter(e => e.pwnedStatus !== 'SAFE').length}
                </div>
                <span className="text-[11px] text-slate-500">Lead DevOps exposed</span>
              </div>
            </div>

            {/* Key Subdomains Preview Table */}
            <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Critical Exposed Asset Perimeter
                </h3>
                <button
                  onClick={() => setActiveTab('SUBDOMAINS')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  View All Subdomains →
                </button>
              </div>

              <div className="space-y-2">
                {report.subdomains.map((sub, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-3 ${
                      sub.cveRisk
                        ? isLight ? 'bg-rose-50/60 border-rose-200' : 'bg-rose-950/20 border-rose-800/40'
                        : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Server className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                            {sub.name}
                          </span>
                          {sub.isTakeoverVulnerable && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                              SUBDOMAIN TAKEOVER RISK
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {sub.ip} • {sub.cloudProvider || 'On-Prem'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {sub.cveRisk && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          {sub.cveRisk}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        HTTP {sub.httpStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBDOMAINS TAB */}
        {activeTab === 'SUBDOMAINS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter subdomains by name, IP, technology..."
                  className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <span className="text-xs font-mono text-slate-500">
                Showing {filteredSubdomains.length} of {report.subdomains.length} subdomains
              </span>
            </div>

            <div className={`rounded-xl border overflow-hidden ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
              <table className="w-full text-left text-xs">
                <thead className={`border-b font-mono text-[11px] text-slate-500 uppercase ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <tr>
                    <th className="px-3 py-1.5">Subdomain Host</th>
                    <th className="px-3 py-1.5">IP Address</th>
                    <th className="px-3 py-1.5">Hosting / Cloud</th>
                    <th className="px-3 py-1.5">Discovered Stack</th>
                    <th className="px-3 py-1.5">Security Risk</th>
                    <th className="px-3 py-1.5 text-right">HTTP Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                  {filteredSubdomains.map((sub, idx) => (
                    <tr key={idx} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                      <td className="px-3 py-1.5 font-bold text-slate-900 dark:text-slate-100">
                        {sub.name}
                        {sub.isTakeoverVulnerable && (
                          <span className="block text-[9px] text-rose-600 font-normal">⚠️ Vulnerable to CNAME takeover</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400">{sub.ip}</td>
                      <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400">{sub.cloudProvider || 'On-Prem'}</td>
                      <td className="px-3 py-1.5">
                        <div className="flex flex-wrap gap-1">
                          {sub.technologies.map((t, i) => (
                            <span key={i} className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-1.5">
                        {sub.cveRisk ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-bold">
                            {sub.cveRisk}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Clean</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-right font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          sub.httpStatus === 200 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        }`}>
                          {sub.httpStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DNS & WHOIS TAB */}
        {activeTab === 'DNS_WHOIS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left WHOIS Box */}
            <div className={`lg:col-span-5 p-4 rounded-xl border space-y-3 ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                WHOIS Registration Intelligence
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Registrar</span>
                  <span className="font-bold">{report.whois.registrar}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Registrant Org</span>
                  <span className="font-bold">{report.whois.registrantOrg}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Creation Date</span>
                  <span>{new Date(report.whois.creationDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Expiration Date</span>
                  <span>{new Date(report.whois.expirationDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">ASN Network</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{report.whois.asn} ({report.whois.asnOrg})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">DNSSEC Enforcement</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Enabled</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Abuse Contact</span>
                  <span>{report.whois.abuseContact}</span>
                </div>
              </div>
            </div>

            {/* Right DNS Records Audit */}
            <div className={`lg:col-span-7 p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                DNS Records & Email Security Audit
              </h3>

              <div className="space-y-2.5">
                {report.dnsRecords.map((dns, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-400">
                          {dns.type}
                        </span>
                        <span className="text-xs font-bold">{dns.name}</span>
                      </div>
                      {dns.risk && getRiskBadge(dns.risk)}
                    </div>

                    <p className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate mb-1">
                      {dns.value}
                    </p>

                    {dns.securityAssessment && (
                      <p className="text-[11px] text-slate-500 italic">
                        Assessment: {dns.securityAssessment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BREACHES TAB */}
        {activeTab === 'BREACHES' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${isLight ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-amber-950/30 border-amber-800/60 text-amber-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <h4 className="text-xs font-bold">Dark Web Credential Breach Warning</h4>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Found corporate accounts associated with dark web paste repositories and RedLine stealer malware dumps. Password resets should be mandated immediately for all compromised users.
              </p>
            </div>

            <div className="space-y-3">
              {report.breachRecords.map((br) => (
                <div
                  key={br.id}
                  className={`p-4 rounded-xl border ${
                    isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                          {br.sourceBreach}
                        </h4>
                        {getRiskBadge(br.riskRating)}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        Breach Date: {br.breachDate} • {br.recordCount.toLocaleString()} total leaked accounts
                      </span>
                    </div>

                    <span className="text-xs font-mono text-slate-400">
                      ID: {br.id}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                    {br.darkWebMentions}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Exposed Email Sample:</span>
                    {br.sampleExposedEmails.map((email, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PORTS TAB */}
        {activeTab === 'PORTS' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Open Network Service Ports & Banner Vulnerabilities
              </h3>

              <div className="space-y-2.5">
                {report.portExposures.map((p, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      p.risk === 'CRITICAL'
                        ? isLight ? 'bg-rose-50/60 border-rose-200' : 'bg-rose-950/20 border-rose-800'
                        : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">
                        {p.port}/{p.protocol}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                            {p.service} ({p.product} {p.version || ''})
                          </span>
                          {getRiskBadge(p.risk)}
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                          Banner: {p.banner}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.cves.map((cve, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                          {cve}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EMPLOYEES TAB */}
        {activeTab === 'EMPLOYEES' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Employee OSINT & Credential Compromise Exposure
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {report.employeeFootprint.map((emp) => (
                  <div
                    key={emp.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      emp.pwnedStatus === 'BREACHED'
                        ? isLight ? 'bg-rose-50/60 border-rose-200' : 'bg-rose-950/20 border-rose-800'
                        : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {emp.department}
                        </span>
                        {getRiskBadge(emp.riskLevel)}
                      </div>

                      <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                        {emp.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mb-1">{emp.role}</p>
                      <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-3">{emp.email}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Leaked Passwords:</span>
                        <span className="font-bold text-rose-600">{emp.leakedPassCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GitHub Repos Exposed:</span>
                        <span>{emp.githubReposExposed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DOSSIER TAB */}
        {activeTab === 'DOSSIER' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    AI-Synthesized Executive Recon Dossier
                  </h3>
                </div>

                <button
                  onClick={handleCopyDossier}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy Dossier'}</span>
                </button>
              </div>

              <div className="p-4 rounded-lg bg-slate-900 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {report.aiExecutiveDossier}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
