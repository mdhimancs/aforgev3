import React, { useState, useRef, useEffect } from 'react';
import { Play, Rocket, Code2, ChevronDown, Sparkles, Check, RefreshCw, ShieldAlert, LayoutGrid, ShieldCheck, Terminal, Sun, Moon, Zap, FileCheck2, Lightbulb, BookOpen, ChevronRight, Home, Palette, Eye } from 'lucide-react';
import { AgentWorkflow, ThemeMode } from '../types';
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
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme, toggleTheme } = useTheme();
  const isLight = theme !== 'dark';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    if (themeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [themeMenuOpen]);

  const lightThemeOptions: { id: ThemeMode; label: string; tag: string; bgTone: string; borderTone: string; description: string }[] = [
    {
      id: 'mission',
      label: 'Daylight Mission',
      tag: 'Aviation Slate',
      bgTone: '#f1f5f9',
      borderTone: '#0284c7',
      description: 'Cool Slate 100 base, anti-glare for live flight & satellite overflights',
    },
    {
      id: 'editorial',
      label: 'Editorial Analyst',
      tag: 'Warm Paper',
      bgTone: '#f8f7f4',
      borderTone: '#78716c',
      description: 'Warm Alabaster paper, zero blue-light strain for long intel reading',
    },
    {
      id: 'nordic',
      label: 'Nordic Frost',
      tag: 'Ice Minimal',
      bgTone: '#f8fafc',
      borderTone: '#6366f1',
      description: 'Clean Scandinavian ice gray with maximum contrast for data grids',
    },
    {
      id: 'sage',
      label: 'Sage Laboratory',
      tag: 'Eye-Rest Green',
      bgTone: '#f2f5f3',
      borderTone: '#10b981',
      description: 'Gentle botanical sage mist, lowest ocular fatigue during long shifts',
    },
    {
      id: 'light',
      label: 'Pure Light (Default)',
      tag: 'Standard',
      bgTone: '#ffffff',
      borderTone: '#3b82f6',
      description: 'Classic high-contrast crisp light interface',
    },
  ];

  const currentThemeLabel = 
    theme === 'dark' ? 'Night Mode' :
    theme === 'mission' ? 'Daylight Mission' :
    theme === 'editorial' ? 'Editorial Analyst' :
    theme === 'nordic' ? 'Nordic Frost' :
    theme === 'sage' ? 'Sage Laboratory' : 'Pure Light';

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

  const getNavbarThemeClass = () => {
    switch (theme) {
      case 'mission':
        return 'bg-slate-100/90 border-slate-300 text-slate-900';
      case 'editorial':
        return 'bg-[#f4f2ee]/95 border-[#e2dfd5] text-stone-900';
      case 'nordic':
        return 'bg-slate-50/95 border-slate-200 text-slate-800';
      case 'sage':
        return 'bg-[#ebf0ed]/95 border-[#d0dbd4] text-emerald-950';
      case 'dark':
        return 'bg-[#0f172a]/95 border-slate-800 text-slate-200';
      default:
        return 'bg-white/95 border-slate-200 text-slate-800';
    }
  };

  return (
    <nav
      id="top-navbar"
      className={`flex flex-col backdrop-blur-md z-30 select-none transition-colors border-b ${getNavbarThemeClass()}`}
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

          {/* Eye-Comfort Theme Selector Dropdown */}
          <div className="relative" ref={themeMenuRef}>
            <button
              id="btn-theme-selector"
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-300 bg-white/90 hover:bg-slate-50 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all shadow-2xs cursor-pointer"
              title="Change website theme & eye-comfort mode"
            >
              <Palette className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline font-semibold">{currentThemeLabel}</span>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${themeMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {themeMenuOpen && (
              <div
                id="theme-selector-dropdown"
                className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                    <Eye className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Eye-Comfort Themes</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold">
                    Anti-Glare
                  </span>
                </div>

                <div className="space-y-1">
                  {lightThemeOptions.map((opt) => {
                    const isSelected = theme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        id={`btn-theme-${opt.id}`}
                        onClick={() => {
                          setTheme(opt.id);
                          setThemeMenuOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-all cursor-pointer flex items-start gap-2.5 border ${
                          isSelected
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-600 text-slate-900 dark:text-slate-100 shadow-2xs'
                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {/* Theme color preview swatch */}
                        <div
                          className="w-5 h-5 rounded-md shrink-0 mt-0.5 border shadow-2xs flex items-center justify-center"
                          style={{ backgroundColor: opt.bgTone, borderColor: opt.borderTone }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-slate-800" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[12px] truncate">{opt.label}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                              {opt.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                            {opt.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Night / Dark Mode Option */}
                <div className="pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    id="btn-theme-dark"
                    onClick={() => {
                      setTheme('dark');
                      setThemeMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-between border ${
                      theme === 'dark'
                        ? 'bg-slate-800 text-white border-slate-700 shadow-2xs'
                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center">
                        <Moon className="w-3 h-3 text-amber-400" />
                      </div>
                      <div>
                        <span className="font-bold text-[12px]">Night Mode</span>
                        <p className="text-[10px] text-slate-400 leading-tight">Dark room / low-luminance monitoring</p>
                      </div>
                    </div>
                    {theme === 'dark' && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                  </button>
                </div>
              </div>
            )}
          </div>

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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-2xs ${
            activeView === 'secops'
              ? 'bg-violet-50/80 dark:bg-violet-950/30 text-violet-950 dark:text-violet-200 border-violet-500 dark:border-violet-400 border-b-2 border-b-violet-600 dark:border-b-violet-400 font-bold'
              : 'bg-white/90 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${activeView === 'secops' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500'}`} />
          <span>AI SecOps Nexus</span>
        </button>

        <button
          id="tab-appsec-scanner-view"
          onClick={() => onChangeView('appsec_scanner')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-2xs ${
            activeView === 'appsec_scanner'
              ? 'bg-cyan-50/80 dark:bg-cyan-950/30 text-cyan-950 dark:text-cyan-200 border-cyan-500 dark:border-cyan-400 border-b-2 border-b-cyan-600 dark:border-b-cyan-400 font-bold'
              : 'bg-white/90 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${activeView === 'appsec_scanner' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500'}`} />
          <span>AppSec Scanner</span>
        </button>

        <button
          id="tab-security-lab-view"
          onClick={() => onChangeView('security_lab')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-2xs ${
            activeView === 'security_lab'
              ? 'bg-rose-50/80 dark:bg-rose-950/30 text-rose-950 dark:text-rose-200 border-rose-500 dark:border-rose-400 border-b-2 border-b-rose-600 dark:border-b-rose-400 font-bold'
              : 'bg-white/90 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300'
          }`}
        >
          <ShieldAlert className={`w-3.5 h-3.5 ${activeView === 'security_lab' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`} />
          <span>Red-Team Lab</span>
        </button>

        <button
          id="tab-vapt-workbench-view"
          onClick={() => onChangeView('vapt')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-2xs ${
            activeView === 'vapt'
              ? 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 border-amber-500 dark:border-amber-400 border-b-2 border-b-amber-600 dark:border-b-amber-400 font-bold'
              : 'bg-white/90 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300'
          }`}
        >
          <Terminal className={`w-3.5 h-3.5 ${activeView === 'vapt' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`} />
          <span>PenTest & VAPT</span>
        </button>

        <button
          id="tab-grc-compliance-view"
          onClick={() => onChangeView('grc_compliance')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-2xs ${
            activeView === 'grc_compliance'
              ? 'bg-blue-50/80 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 border-blue-500 dark:border-blue-400 border-b-2 border-b-blue-600 dark:border-b-blue-400 font-bold'
              : 'bg-white/90 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300'
          }`}
        >
          <FileCheck2 className={`w-3.5 h-3.5 ${activeView === 'grc_compliance' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
          <span>NIST & EU GRC</span>
        </button>

        <button
          id="tab-builder-view"
          onClick={() => onChangeView('builder')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-2xs ${
            activeView === 'builder'
              ? 'bg-sky-50/80 dark:bg-sky-950/30 text-sky-950 dark:text-sky-200 border-sky-500 dark:border-sky-400 border-b-2 border-b-sky-600 dark:border-b-sky-400 font-bold'
              : 'bg-white/90 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300'
          }`}
        >
          <LayoutGrid className={`w-3.5 h-3.5 ${activeView === 'builder' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500'}`} />
          <span>Canvas</span>
        </button>

        <button
          id="tab-blog-view"
          onClick={() => onChangeView('blog')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-2xs ${
            activeView === 'blog'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 border-emerald-500 dark:border-emerald-400 border-b-2 border-b-emerald-600 dark:border-b-emerald-400 font-bold'
              : 'bg-white/90 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300'
          }`}
        >
          <BookOpen className={`w-3.5 h-3.5 ${activeView === 'blog' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`} />
          <span>Security Design Blog</span>
        </button>
      </div>
      </div>
    </nav>
  );
};
