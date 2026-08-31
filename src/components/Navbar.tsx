import React, { useState } from 'react';
import { Play, Rocket, Code2, ChevronDown, Sparkles, Check, RefreshCw, ShieldAlert, LayoutGrid, ShieldCheck, Terminal, Sun, Moon, Zap, FileCheck2, Lightbulb } from 'lucide-react';
import { AgentWorkflow } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentWorkflow: AgentWorkflow;
  allWorkflows: AgentWorkflow[];
  onSelectWorkflow: (workflow: AgentWorkflow) => void;
  activeView: 'builder' | 'security_lab' | 'appsec_scanner' | 'vapt' | 'secops' | 'grc_compliance';
  onChangeView: (view: 'builder' | 'security_lab' | 'appsec_scanner' | 'vapt' | 'secops' | 'grc_compliance') => void;
  onDeploy: () => void;
  onExportCode: () => void;
  onTestRun: () => void;
  isRunningTest: boolean;
  onOpenIdeas?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentWorkflow,
  allWorkflows,
  onSelectWorkflow,
  activeView,
  onChangeView,
  onDeploy,
  onExportCode,
  onTestRun,
  isRunningTest,
  onOpenIdeas
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <nav
      id="top-navbar"
      className="h-14 border-b flex items-center justify-between px-6 bg-blue-50/50 border-blue-100 text-slate-800 backdrop-blur-md z-30 select-none transition-colors"
    >
      {/* Brand & Active Agent */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold tracking-wider">
          <span>A</span>
        </div>
        
        <div className="flex items-center">
          <span className="font-bold text-lg tracking-tight text-slate-900">
            AGENT<span className="text-blue-600">FORGE</span>
          </span>
          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            CYBER
          </span>
        </div>

        <div className="h-4 w-px mx-2 bg-slate-300"></div>

        {/* Workflow Switcher Dropdown */}
        <div className="relative">
          <button
            id="workflow-selector-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            <span className="font-mono">{currentWorkflow.name}_{currentWorkflow.version}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute left-0 mt-1.5 w-64 border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 bg-white"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Switch Agent Workflow
              </div>
              {allWorkflows.map((wf) => (
                <button
                  key={wf.id}
                  onClick={() => {
                    onSelectWorkflow(wf);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    wf.id === currentWorkflow.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate">
                    <p className="font-semibold truncate">{wf.name}_{wf.version}</p>
                    <p className="text-[11px] text-slate-500 truncate">{wf.description}</p>
                  </div>
                  {wf.id === currentWorkflow.id && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center View Mode Switcher with Visual Groups */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-[50vw] lg:max-w-[60vw] xl:max-w-[70vw] py-1 shrink-0">
        {/* GROUP 1: SOC Operations */}
        <div
          className="flex items-center p-1 rounded-xl border border-blue-200 shadow-2xs bg-blue-50/80 gap-1"
        >
          <div className="px-2 text-[10px] font-black uppercase tracking-wider text-blue-700 select-none hidden lg:block">
            SOC
          </div>
          <button
            id="tab-secops-nexus-view"
            onClick={() => onChangeView('secops')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'secops'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI SecOps Nexus</span>
            <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-700 rounded text-[9px] font-mono font-bold">
              SIEM•SOAR•XDR
            </span>
          </button>

          <button
            id="tab-grc-compliance-view"
            onClick={() => onChangeView('grc_compliance')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'grc_compliance'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>NIST & EU GRC</span>
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-700 rounded text-[9px] font-mono font-bold">
              EU AI Act•GDPR
            </span>
          </button>
        </div>

        {/* GROUP 2: Threat Hunting */}
        <div
          className="flex items-center p-1 rounded-xl border border-purple-200 shadow-2xs bg-purple-50/80 gap-1"
        >
          <div className="px-2 text-[10px] font-black uppercase tracking-wider text-purple-700 select-none hidden lg:block">
            Threat Hunting
          </div>
          <button
            id="tab-security-lab-view"
            onClick={() => onChangeView('security_lab')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'security_lab'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Red-Team Attack Lab</span>
          </button>
        </div>

        {/* GROUP 3: Vulnerability & Pen Testing */}
        <div
          className="flex items-center p-1 rounded-xl border border-rose-200 shadow-2xs bg-rose-50/80 gap-1"
        >
          <div className="px-2 text-[10px] font-black uppercase tracking-wider text-rose-700 select-none hidden lg:block">
            Vuln & PenTest
          </div>
          <button
            id="tab-vapt-workbench-view"
            onClick={() => onChangeView('vapt')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'vapt'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>PenTest & VAPT</span>
            <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-700 rounded text-[9px] font-mono font-bold">
              CVSS•PoC
            </span>
          </button>

          <button
            id="tab-appsec-scanner-view"
            onClick={() => onChangeView('appsec_scanner')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'appsec_scanner'
                ? 'bg-cyan-600 text-white shadow-2xs'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AppSec Scanner</span>
            <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-700 rounded text-[9px] font-mono font-bold">
              SAST•SCA
            </span>
          </button>
        </div>

        {/* Canvas Builder */}
        <button
          id="tab-builder-view"
          onClick={() => onChangeView('builder')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeView === 'builder'
              ? 'bg-slate-700 text-white border-slate-800 shadow-2xs'
              : 'bg-white/80 text-slate-700 border-slate-300 hover:bg-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Canvas</span>
        </button>
      </div>

      {/* Action Controls & Theme Toggle */}
      <div className="flex items-center gap-2.5">
        {/* Test Run Execution (visible in builder mode) */}
        {activeView === 'builder' && (
          <button
            id="btn-run-pipeline-test"
            onClick={onTestRun}
            disabled={isRunningTest}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              isRunningTest
                ? 'bg-amber-500/20 text-amber-600 border-amber-500/40 cursor-wait'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Simulate node execution pipeline"
          >
            {isRunningTest ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-emerald-500" />
                <span>Run Pipeline</span>
              </>
            )}
          </button>
        )}

        {/* Ideas & Roadmap Hub Button */}
        {onOpenIdeas && (
          <button
            id="btn-open-ideas-hub"
            onClick={onOpenIdeas}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
            title="Ideas & Feature Roadmap Hub"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Ideas Hub</span>
          </button>
        )}

        {/* Export Code */}
        <button
          id="btn-export-code"
          onClick={onExportCode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          title="Export as LangGraph / CrewAI / Gemini TypeScript"
        >
          <Code2 className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden sm:inline">Export Code</span>
        </button>

        {/* Deploy Agent Button */}
        <button
          id="btn-deploy-agent"
          onClick={onDeploy}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer active:scale-95"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Deploy</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          id="btn-toggle-theme"
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLight ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>

        {/* User avatar indicator */}
        <div 
          id="user-avatar-indicator"
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-900 border border-blue-400/40 flex items-center justify-center text-xs font-bold text-white shadow-xs"
          title="AI Studio User (munish.world@gmail.com)"
        >
          M
        </div>
      </div>
    </nav>
  );
};

