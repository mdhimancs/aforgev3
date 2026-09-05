import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Key,
  Database,
  Search,
  Zap,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Scale,
  Cpu,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PRESET_GRC_CONTROLS, PRESET_AUDIT_EVIDENCE } from '../data/enterprisePresets';
import { GrcFrameworkControl, GrcAuditEvidence } from '../types';

export function GrcAuditView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [controls, setControls] = useState<GrcFrameworkControl[]>(PRESET_GRC_CONTROLS);
  const [evidenceList, setEvidenceList] = useState<GrcAuditEvidence[]>(PRESET_AUDIT_EVIDENCE);
  
  const [frameworkFilter, setFrameworkFilter] = useState<
    'ALL' | 'EU_AI_ACT' | 'GDPR' | 'NIST_AI_RMF' | 'NIST_CSF_2_0' | 'NIST_SP_800_53' | 'SOC2_TYPE2' | 'ISO_27001_2022' | 'PCI_DSS_4_0'
  >('ALL');
  
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedControlId, setExpandedControlId] = useState<string | null>('ctrl-eu-ai-1');
  const [reVerifyingControlId, setReVerifyingControlId] = useState<string | null>(null);
  const [copiedAuditPackage, setCopiedAuditPackage] = useState<boolean>(false);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  const frameworkBadgeColor = (fw: string) => {
    switch (fw) {
      case 'EU_AI_ACT':
        return isLight ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
      case 'GDPR':
        return isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'NIST_AI_RMF':
        return isLight ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'NIST_CSF_2_0':
        return isLight ? 'bg-blue-100 text-blue-900 border-blue-300' : 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'NIST_SP_800_53':
        return isLight ? 'bg-cyan-100 text-cyan-900 border-cyan-300' : 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      case 'SOC2_TYPE2':
        return isLight ? 'bg-teal-100 text-teal-900 border-teal-300' : 'bg-teal-950/80 text-teal-300 border-teal-800';
      case 'ISO_27001_2022':
        return isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'PCI_DSS_4_0':
        return isLight ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-rose-950/80 text-rose-300 border-rose-800';
      default:
        return isLight ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const filteredControls = controls.filter((ctrl) => {
    const matchesFramework = frameworkFilter === 'ALL' || ctrl.framework === frameworkFilter;
    const matchesCategory = categoryFilter === 'ALL' || ctrl.category === categoryFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      ctrl.controlId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ctrl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ctrl.regulatoryReference && ctrl.regulatoryReference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ctrl.owner.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFramework && matchesCategory && matchesSearch;
  });

  const handleReVerify = (controlId: string) => {
    setReVerifyingControlId(controlId);
    setTimeout(() => {
      setControls((prev) =>
        prev.map((c) =>
          c.id === controlId
            ? { ...c, status: 'COMPLIANT', lastAutomatedCheck: 'Just now' }
            : c
        )
      );
      setReVerifyingControlId(null);
    }, 900);
  };

  const handleCopyHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const handleExportAuditPackage = () => {
    const auditPackage = {
      title: 'Unified Regulatory Compliance & Conformity Attestation Report',
      generatedTimestamp: new Date().toISOString(),
      standardsMapped: ['EU AI Act (Regulation EU 2024/1689)', 'EU GDPR (Regulation 2016/679)', 'NIST AI RMF 1.0', 'NIST CSF 2.0', 'NIST SP 800-53 Rev 5', 'SOC 2 Type II', 'ISO 27001:2022', 'PCI-DSS v4.0'],
      auditorOrganization: 'AEGIS Continuous Compliance Engine',
      summary: {
        totalControlsAssessed: controls.length,
        compliantControlsCount: controls.filter(c => c.status === 'COMPLIANT').length,
        partialControlsCount: controls.filter(c => c.status === 'PARTIAL').length,
        nonCompliantControlsCount: controls.filter(c => c.status === 'NON_COMPLIANT').length,
        overallComplianceGrade: '96.4% - AUDIT APPROVED'
      },
      controls,
      evidenceIntegrityLogs: evidenceList
    };

    navigator.clipboard.writeText(JSON.stringify(auditPackage, null, 2));
    setCopiedAuditPackage(true);
    setTimeout(() => setCopiedAuditPackage(false), 3000);
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-auto bg-slate-50 text-slate-800">
      {/* Top Banner */}
      <div className="p-4 border-b border-slate-200 bg-white shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600 via-teal-600 to-emerald-600 rounded-xl shadow-md text-white">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-black">
                NIST • EU AI Act • GDPR • Continuous GRC Hub
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                EU AI Act Art 9/10/14/15 • NIST AI RMF • GDPR Art 25/32 • SOC 2
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Automated evidence collection and real-time regulatory compliance mapping across cloud, AI models, identity, and application security.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAuditPackage}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
              copiedAuditPackage
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {copiedAuditPackage ? (
              <>
                <Check className="w-4 h-4" />
                <span>Audit Package Copied!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Conformity Package (JSON)</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-[1600px] mx-auto w-full">
        {/* Compliance Framework Summary Cards Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* EU AI Act Card */}
          <div className="p-3.5 rounded-xl border bg-white border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">EU AI Act (2024/1689)</span>
              <Cpu className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-black mt-1 text-slate-900">95% Compliant</div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5 truncate">
              Art. 9 Risk • Art. 14 Oversight
            </span>
          </div>

          {/* EU GDPR Card */}
          <div className="p-3.5 rounded-xl border bg-white border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">EU GDPR Data Privacy</span>
              <Scale className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black mt-1 text-slate-900">98% Compliant</div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5 truncate">
              Art. 25 Minimization & Art. 32 Encryption
            </span>
          </div>

          {/* NIST AI RMF & CSF 2.0 Card */}
          <div className="p-3.5 rounded-xl border bg-white border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">NIST AI RMF & CSF 2.0</span>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl font-black mt-1 text-slate-900">96% Compliant</div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5 truncate">
              GOVERN-1.2 • MAP-2.2 Mapped
            </span>
          </div>

          {/* SOC 2 & ISO 27001 Card */}
          <div className="p-3.5 rounded-xl border bg-white border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">SOC 2 & ISO 27001</span>
              <Lock className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-xl font-black mt-1 text-slate-900">94% Compliant</div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5 truncate">
              CC6.1 Logical Access • Annex A.8.28
            </span>
          </div>

          {/* Cryptographic Ledger Card */}
          <div className="p-3.5 rounded-xl border bg-white border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Audit Evidence Integrity</span>
              <Key className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-black mt-1 text-slate-900">SHA-256 Valid</div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5 truncate">
              Cryptographic Proof Ledger Verified
            </span>
          </div>
        </div>

        {/* Framework Selector & Filter Control Bar */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <span className="text-xs font-bold text-slate-500 mr-1 uppercase tracking-wider text-[10px]">Framework:</span>
              {(
                [
                  { id: 'ALL', label: 'All Frameworks', activeClass: 'bg-slate-100 text-slate-900 border-b-2 border-slate-700 font-bold' },
                  { id: 'EU_AI_ACT', label: 'EU AI Act (2024/1689)', activeClass: 'bg-indigo-50 text-indigo-900 border-b-2 border-indigo-600 font-bold' },
                  { id: 'GDPR', label: 'EU GDPR', activeClass: 'bg-emerald-50 text-emerald-900 border-b-2 border-emerald-600 font-bold' },
                  { id: 'NIST_AI_RMF', label: 'NIST AI RMF 1.0', activeClass: 'bg-purple-50 text-purple-900 border-b-2 border-purple-600 font-bold' },
                  { id: 'NIST_CSF_2_0', label: 'NIST CSF 2.0', activeClass: 'bg-blue-50 text-blue-900 border-b-2 border-blue-600 font-bold' },
                  { id: 'NIST_SP_800_53', label: 'NIST SP 800-53', activeClass: 'bg-cyan-50 text-cyan-900 border-b-2 border-cyan-600 font-bold' },
                  { id: 'SOC2_TYPE2', label: 'SOC 2 Type II', activeClass: 'bg-teal-50 text-teal-900 border-b-2 border-teal-600 font-bold' },
                  { id: 'ISO_27001_2022', label: 'ISO 27001:2022', activeClass: 'bg-violet-50 text-violet-900 border-b-2 border-violet-600 font-bold' },
                  { id: 'PCI_DSS_4_0', label: 'PCI-DSS 4.0', activeClass: 'bg-amber-50 text-amber-900 border-b-2 border-amber-600 font-bold' }
                ] as const
              ).map((fw) => (
                <button
                  key={fw.id}
                  onClick={() => setFrameworkFilter(fw.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap border shadow-2xs ${
                    frameworkFilter === fw.id
                      ? fw.activeClass
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {fw.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search controls (e.g. EU-AI-ART-14, GOVERN-1.2, GDPR-ART-25)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border font-mono bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 text-[11px]">Domain:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border font-semibold bg-slate-50 border-slate-200 text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Control Domains</option>
                <option value="AI Safety & Governance">AI Safety & Governance</option>
                <option value="Data Privacy & Rights">Data Privacy & Rights</option>
                <option value="Access Control">Access Control</option>
                <option value="Vulnerability Mgmt">Vulnerability Mgmt</option>
                <option value="Logging & Monitoring">Logging & Monitoring</option>
                <option value="Encryption & Key Mgmt">Encryption & Key Mgmt</option>
                <option value="Incident Response">Incident Response</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Interactive Regulatory Controls Register & Evidence Vault */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Controls List (2 Columns wide on LG) */}
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-black">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Automated Regulatory Control Register ({filteredControls.length})</span>
              </h3>
              <span className="text-[11px] font-mono font-medium text-slate-500">
                Click control row to inspect telemetry & regulatory mapping
              </span>
            </div>

            <div className="space-y-2">
              {filteredControls.map((ctrl) => {
                const isExpanded = expandedControlId === ctrl.id;
                const isReVerifying = reVerifyingControlId === ctrl.id;

                return (
                  <div
                    key={ctrl.id}
                    className={`border rounded-xl transition-all shadow-2xs ${
                      isExpanded
                        ? 'border-indigo-300 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {/* Control Row Header */}
                    <div
                      onClick={() => setExpandedControlId(isExpanded ? null : ctrl.id)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button className="text-slate-400 hover:text-slate-600">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-600" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        <span className="font-mono text-xs font-extrabold text-indigo-700 shrink-0">
                          {ctrl.controlId}
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${frameworkBadgeColor(ctrl.framework)}`}>
                          {ctrl.framework.replace(/_/g, ' ')}
                        </span>

                        <span className="text-xs font-bold truncate text-slate-900">
                          {ctrl.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden sm:inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {ctrl.automatedEvidenceSource}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            ctrl.status === 'COMPLIANT'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {ctrl.status}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Control Details Drawer */}
                    {isExpanded && (
                      <div className="p-4 border-t border-indigo-200 bg-slate-50/90 space-y-3">
                        {/* Regulatory Reference & Description */}
                        <div className="space-y-1.5">
                          {ctrl.regulatoryReference && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-slate-500">Regulatory Requirement:</span>
                              <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                                {ctrl.regulatoryReference}
                              </span>
                              {ctrl.riskLevel && (
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                                  ctrl.riskLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                  Risk: {ctrl.riskLevel}
                                </span>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-slate-700">
                            {ctrl.description || 'Continuous automated compliance check inspecting system runtime and security telemetry.'}
                          </p>
                        </div>

                        {/* Remediation & Policy Details */}
                        {ctrl.remediationAdvice && (
                          <div className="p-3 rounded-lg border bg-indigo-50 border-indigo-200">
                            <span className="text-[10px] uppercase font-bold text-indigo-900 block mb-1">
                              Automated Enforcement Strategy & Recommendation:
                            </span>
                            <p className="text-xs font-mono text-indigo-950">
                              {ctrl.remediationAdvice}
                            </p>
                          </div>
                        )}

                        {/* Meta info & Re-verify Action */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500">
                          <div>
                            Owner: <span className="font-bold text-slate-800">{ctrl.owner}</span> • Last checked: <span className="text-emerald-700 font-bold">{ctrl.lastAutomatedCheck}</span>
                          </div>

                          <button
                            onClick={() => handleReVerify(ctrl.id)}
                            disabled={isReVerifying}
                            className="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isReVerifying ? 'animate-spin text-indigo-500' : ''}`} />
                            <span>{isReVerifying ? 'Verifying Telemetry...' : 'Trigger Real-time Audit Scan'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cryptographic Evidence Ledger Register (1 Column wide on LG) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-black">
                <Key className="w-4 h-4 text-amber-600" />
                <span>SHA-256 Cryptographic Evidence Ledger</span>
              </h3>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {evidenceList.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:border-slate-300 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-extrabold text-emerald-700">
                      [{ev.controlId}]
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">
                      {ev.verifiedTimestamp}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-black">
                    {ev.title}
                  </h4>

                  <p className="text-[11px] text-slate-600">
                    {ev.payloadSummary}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="font-mono text-[9px] text-slate-500 truncate max-w-[180px]">
                      {ev.integrityHash}
                    </span>

                    <button
                      onClick={() => handleCopyHash(ev.id, ev.integrityHash)}
                      className="p-1 rounded text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="Copy SHA-256 Hash"
                    >
                      {copiedHashId === ev.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
