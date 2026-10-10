import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, Search, Filter, Download, Plus, Check, 
  ExternalLink, AlertTriangle, X, Sparkles, Terminal, FileText, Lock, Database 
} from 'lucide-react';
import { ThreatItem, THREAT_LIBRARY_CATALOG } from '../data/threatLibraryData';
import { AttackCategory } from '../types';

interface ThreatLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectThreat: (threat: ThreatItem) => void;
}

export const ThreatLibraryModal: React.FC<ThreatLibraryModalProps> = ({
  isOpen,
  onClose,
  onInjectThreat
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'CVE' | 'TTP'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeDetailThreat, setActiveDetailThreat] = useState<ThreatItem | null>(null);
  const [injectedIds, setInjectedIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const filteredThreats = THREAT_LIBRARY_CATALOG.filter((item) => {
    const matchesSearch = 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'ALL' || item.type === selectedType;
    const matchesSeverity = selectedSeverity === 'ALL' || item.severity === selectedSeverity;
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    return matchesSearch && matchesType && matchesSeverity && matchesCategory;
  });

  const handleInject = (item: ThreatItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onInjectThreat(item);
    setInjectedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setInjectedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2500);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-medium';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300 font-medium';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-blue-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Threat Library & Adversarial Catalog</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/30 border border-blue-400/40 text-blue-200">
                  CVEs & TTPs
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Select known CVE vulnerabilities and MITRE TTP adversarial attack probes to inject as simulation inputs into SecurityAttackLab.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search CVE ID (e.g. CVE-2024-38077), TTP name, or keyword..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Types (CVE & TTP)</option>
              <option value="CVE">CVEs Only</option>
              <option value="TTP">TTPs Only</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="prompt_injection">Prompt Injection</option>
              <option value="system_prompt_leakage">System Prompt Leakage</option>
              <option value="excessive_agency">Excessive Agency</option>
              <option value="sensitive_data_exfiltration">Sensitive Data Exfiltration</option>
              <option value="insecure_output_handling">Insecure Output Handling</option>
              <option value="hallucination_and_jailbreak">Hallucination & Jailbreak</option>
            </select>
          </div>
        </div>

        {/* Content Body: Grid of Threat Cards & Detail Drawer */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredThreats.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500">
              <ShieldAlert className="w-12 h-12 text-slate-300 mb-2" />
              <p className="font-semibold text-sm">No threats found matching your query.</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing filters or adjusting search keywords.</p>
            </div>
          ) : (
            filteredThreats.map((item) => {
              const isInjected = injectedIds[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveDetailThreat(item)}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Top Row: ID, Type & Severity */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-white">
                          {item.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${getSeverityBadge(item.severity)}`}>
                          {item.severity}
                        </span>
                        {item.cvssScore && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200">
                            CVSS {item.cvssScore}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.type}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Reference / Category tag */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700">
                        {item.reference}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700">
                        {item.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Payload: {item.probePayload.slice(0, 32)}...
                    </span>

                    <button
                      onClick={(e) => handleInject(item, e)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                        isInjected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      {isInjected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Injected!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Inject into Attack Lab</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredThreats.length} of {THREAT_LIBRARY_CATALOG.length} known threats & adversarial TTPs.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close Library
          </button>
        </div>

        {/* Threat Detail Modal / Drawer */}
        {activeDetailThreat && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-600 text-white">
                    {activeDetailThreat.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${getSeverityBadge(activeDetailThreat.severity)}`}>
                    {activeDetailThreat.severity}
                  </span>
                </div>
                <button
                  onClick={() => setActiveDetailThreat(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{activeDetailThreat.name}</h3>
                  <p className="text-slate-600 mt-1 leading-relaxed text-sm">{activeDetailThreat.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-500 block mb-1">Standard Reference</span>
                    <span className="text-slate-800 font-mono">{activeDetailThreat.reference}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-500 block mb-1">Attack Category</span>
                    <span className="text-blue-700 font-semibold">{activeDetailThreat.category.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Simulation Payload (Adversarial Prompt / Vector)</span>
                  <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] whitespace-pre-wrap select-all border border-slate-800">
                    {activeDetailThreat.probePayload}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Expected Defense & Mitigation</span>
                  <p className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
                    {activeDetailThreat.expectedDefense}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Remediation Guidance</span>
                  <p className="p-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
                    {activeDetailThreat.remediationAdvice}
                  </p>
                </div>
              </div>

              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setActiveDetailThreat(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    handleInject(activeDetailThreat);
                    setActiveDetailThreat(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Inject into Security Attack Lab</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
