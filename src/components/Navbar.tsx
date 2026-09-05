import React, { useState } from 'react';
import { Play, Rocket, Code2, ChevronDown, Sparkles, Check, RefreshCw, ShieldAlert, LayoutGrid, ShieldCheck, Terminal, Sun, Moon, Zap, FileCheck2, Lightbulb, BookOpen, ChevronRight, Home } from 'lucide-react';
import { AgentWorkflow } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentWorkflow: AgentWorkflow;
  allWorkflows: AgentWorkflow[];
  onSelectWorkflow: (workflow: AgentWorkflow) => void;
  activeView: 'builder' | 'security_lab' | 'appsec_scanner' | 'vapt' | 'secops' | 'grc_compliance' | 'blog';
  onChangeView: (view: 'builder' | 'security_lab' | 'appsec_scanner' | 'vapt' | 'secops' | 'grc_compliance' | 'blog') => void;
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

  const getViewName = () => {
    switch (activeView) {
      case 'secops': return 'AI SecOps Nexus';
      case 'appsec_scanner': return 'AppSec Scanner';
      case 'security_lab': return 'Red-Team Lab';
      case 'vapt': return 'PenTest & VAPT';
      case 'grc_compliance': return 'NIST & EU GRC';
      case 'builder': return 'Canvas';
      case 'blog': return 'Security Design Blog';
      default: return 'Dashboard';
    }
  };

  return (
    <nav
      id="top-navbar"
      className="flex flex-col bg-blue-50/50 text-slate-800 backdrop-blur-md z-30 select-none transition-colors border-b border-blue-100"
    >
      {/* Breadcrumb Navigation Trail */}
      <div className="flex items-center px-6 py-1.5 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800/50 text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
        <Home className="w-3 h-3 mr-1.5 text-slate-400 dark:text-slate-500" />
        <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors" onClick={() => onChangeView('secops')}>AgentForge</span>
        <ChevronRight className="w-3 h-3 mx-1 text-slate-300 dark:text-slate-600" />
        <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors">Platform Modules</span>
        <ChevronRight className="w-3 h-3 mx-1 text-slate-300 dark:text-slate-600" />
        <span className="text-slate-800 dark:text-slate-200 font-semibold">{getViewName()}</span>
      </div>

      <div className="px-6 flex flex-col pt-2 pb-1">
        {/* Row 1: Brand & Workflow Switcher on Left, Actions on Right */}
        <div className="flex items-center justify-between pb-2 border-b border-blue-100/60 dark:border-slate-800">
        {/* Brand & Active Agent / Workflow Switcher */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-black rounded-lg flex items-center justify-center shadow-lg shadow-slate-900/20 text-white font-bold tracking-wider shrink-0">
            <span>A</span>
          </div>
          
          <div className="flex items-center shrink-0">
            <span className="font-extrabold text-lg tracking-tight">
              <span className="text-slate-500 dark:text-slate-400">AGENT</span>
              <span className="text-blue-600 dark:text-blue-500">FORGE</span>
            </span>
            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-white dark:bg-slate-700 dark:text-white border border-slate-900 shadow-sm">
              CYBER
            </span>
          </div>

          {/* Workflow Switcher Dropdown */}
          <div className="relative ml-3">
            <button
              id="workflow-selector-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-blue-200 bg-blue-50/80 text-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <span className="font-mono font-semibold">{currentWorkflow.name}_{currentWorkflow.version}</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-64 border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 bg-white dark:bg-slate-900 dark:border-slate-800"
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
                        ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-950/50 dark:text-blue-300'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate">
                      <p className="font-semibold truncate">{wf.name}_{wf.version}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{wf.description}</p>
                    </div>
                    {wf.id === currentWorkflow.id && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>
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
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
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
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
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
      </div>

      {/* Row 2: View Mode Switcher Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1.5 shrink-0">
        <button
          id="tab-secops-nexus-view"
          onClick={() => onChangeView('secops')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            activeView === 'secops'
              ? 'bg-violet-600 text-white border-violet-600 shadow-2xs font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${activeView === 'secops' ? 'text-white' : 'text-slate-500'}`} />
          <span>AI SecOps Nexus</span>
        </button>

        <button
          id="tab-appsec-scanner-view"
          onClick={() => onChangeView('appsec_scanner')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            activeView === 'appsec_scanner'
              ? 'bg-cyan-600 text-white border-cyan-600 shadow-2xs font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${activeView === 'appsec_scanner' ? 'text-white' : 'text-slate-500'}`} />
          <span>AppSec Scanner</span>
        </button>

        <button
          id="tab-security-lab-view"
          onClick={() => onChangeView('security_lab')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            activeView === 'security_lab'
              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className={`w-3.5 h-3.5 ${activeView === 'security_lab' ? 'text-white' : 'text-slate-500'}`} />
          <span>Red-Team Lab</span>
        </button>

        <button
          id="tab-vapt-workbench-view"
          onClick={() => onChangeView('vapt')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            activeView === 'vapt'
              ? 'bg-amber-600 text-white border-amber-600 shadow-2xs font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Terminal className={`w-3.5 h-3.5 ${activeView === 'vapt' ? 'text-white' : 'text-slate-500'}`} />
          <span>PenTest & VAPT</span>
        </button>

        <button
          id="tab-grc-compliance-view"
          onClick={() => onChangeView('grc_compliance')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            activeView === 'grc_compliance'
              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className={`w-3.5 h-3.5 ${activeView === 'grc_compliance' ? 'text-white' : 'text-slate-500'}`} />
          <span>NIST & EU GRC</span>
        </button>

        <button
          id="tab-builder-view"
          onClick={() => onChangeView('builder')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            activeView === 'builder'
              ? 'bg-sky-600 text-white border-sky-600 shadow-2xs font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className={`w-3.5 h-3.5 ${activeView === 'builder' ? 'text-white' : 'text-slate-500'}`} />
          <span>Canvas</span>
        </button>

        <button
          id="tab-blog-view"
          onClick={() => onChangeView('blog')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            activeView === 'blog'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <BookOpen className={`w-3.5 h-3.5 ${activeView === 'blog' ? 'text-white' : 'text-slate-500'}`} />
          <span>Security Design Blog</span>
        </button>
      </div>
      </div>
    </nav>
  );
};
