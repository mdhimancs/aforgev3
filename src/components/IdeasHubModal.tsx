import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, Plus, Search, Filter, Edit3, Trash2, CheckSquare, Square, 
  Download, Tag, X, Sparkles, RotateCcw, FileText, CheckCircle2, 
  Clock, AlertCircle, Save, Copy, Check, ChevronRight
} from 'lucide-react';

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface IdeaItem {
  id: string;
  title: string;
  category: 'AI SecOps / SOAR' | 'Red-Team Attack Lab' | 'Threat Hunting' | 'GRC & Compliance' | 'Workflow Builder' | 'General / Custom';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Planned' | 'In Progress' | 'Completed';
  description: string;
  tags: string[];
  actionItems: ActionItem[];
  updatedAt: string;
}

const DEFAULT_IDEAS: IdeaItem[] = [
  {
    id: 'idea-iam-nhi',
    title: 'Non-Human Identity (NHI) & AI Agent Governance Engine',
    category: 'AI SecOps / SOAR',
    priority: 'High',
    status: 'In Progress',
    description: 'Enterprise governance platform for non-human identities (API keys, service accounts, OAuth tokens, AI Agent tools). Automated discovery, toxic combination detection, and blast radius privilege right-sizing.',
    tags: ['NHI', 'IAM', 'AI Agent Governance', 'OAuth', 'Blast Radius'],
    updatedAt: new Date().toISOString().split('T')[0],
    actionItems: [
      { id: 'nhi-1', text: 'Multi-Cloud Service Account & API key automated discovery collector', completed: true },
      { id: 'nhi-2', text: 'Toxic privilege combination detection matrix (e.g. S3 Read + Lambda Admin + Public IP)', completed: true },
      { id: 'nhi-3', text: 'Automated agentic tool invocation audit & just-in-time token scoping', completed: false }
    ]
  },
  {
    id: 'idea-iam-itdr',
    title: 'Identity Threat Detection & Response (ITDR) & Attack Path Graph Solver',
    category: 'Threat Hunting',
    priority: 'High',
    status: 'Planned',
    description: 'Continuous identity posture management (ISPM) and ITDR solver that maps cross-cloud Identity attack paths (Entra ID, Okta, AWS IAM, GCP). Automatically detects lateral movement paths and revokes hijacked sessions.',
    tags: ['ITDR', 'ISPM', 'Entra ID', 'Okta', 'Graph Theory', 'Attack Paths'],
    updatedAt: new Date().toISOString().split('T')[0],
    actionItems: [
      { id: 'itdr-1', text: 'Cross-cloud Identity Graph visualizer with Dijkstra shortest-path to Domain Admin', completed: true },
      { id: 'itdr-2', text: 'Real-time MFA fatigue & impossible travel session kill-switch webhook', completed: false },
      { id: 'itdr-3', text: 'Dormant privilege & over-provisioned admin account auto-disabler', completed: false }
    ]
  },
  {
    id: 'idea-crq-board',
    title: 'Cyber Risk Quantification (CRQ) & Board Financial Risk Exposure Engine',
    category: 'GRC & Compliance',
    priority: 'High',
    status: 'In Progress',
    description: 'Translates raw vulnerabilities & IAM misconfigurations into dollar-value Annual Loss Expectancy (ALE) using Monte Carlo simulations & FAIR framework. Generates SEC-ready 10-K compliance & CISO board decks.',
    tags: ['CRQ', 'FAIR Model', 'Monte Carlo', 'Board Metrics', 'SEC Disclosure'],
    updatedAt: new Date().toISOString().split('T')[0],
    actionItems: [
      { id: 'crq-1', text: 'Monte Carlo loss distribution simulator ($ Min/Max/Likely breach impact)', completed: true },
      { id: 'crq-2', text: 'SEC Regulation S-K Item 106 material risk calculator', completed: true },
      { id: 'crq-3', text: 'Automated executive board slide deck PDF generator', completed: false }
    ]
  },
  {
    id: 'idea-jit-ciem',
    title: 'Dynamic Zero-Trust JIT Access Engine (CIEM Auto-Tuner)',
    category: 'AI SecOps / SOAR',
    priority: 'High',
    status: 'Planned',
    description: 'Cloud Infrastructure Entitlement Management (CIEM) tool that eliminates standing privileges. Uses AI to analyze historical telemetry and automatically downscope broad IAM roles to dynamic Just-In-Time access.',
    tags: ['CIEM', 'JIT Access', 'Zero Standing Privileges', 'AWS IAM', 'Azure RBAC'],
    updatedAt: new Date().toISOString().split('T')[0],
    actionItems: [
      { id: 'jit-1', text: 'Telemetric usage analysis engine (compares granted vs. executed API permissions)', completed: true },
      { id: 'jit-2', text: 'Slack/Teams biometric-gated JIT access request workflow', completed: false },
      { id: 'jit-3', text: 'Emergency Break-Glass automated audit trail generator', completed: false }
    ]
  },
  {
    id: 'idea-1',
    title: 'Autonomous Incident Triage & Enrichment Agent',
    category: 'AI SecOps / SOAR',
    priority: 'High',
    status: 'Planned',
    description: 'Automated SIEM alert triage using Gemini to extract IOCs, query threat intelligence feeds (VirusTotal, AlienVault OTX), correlate against MITRE ATT&CK techniques, and generate executive summaries.',
    tags: ['SOAR', 'Gemini AI', 'MITRE ATT&CK', 'SIEM'],
    updatedAt: new Date().toISOString().split('T')[0],
    actionItems: [
      { id: 'a1', text: 'Implement automated IOC extractor regex & Gemini parser', completed: true },
      { id: 'a2', text: 'Connect Threat Intel API proxies for automated scoring', completed: false },
      { id: 'a3', text: 'Build interactive incident timeline visualizer', completed: false }
    ]
  },
  {
    id: 'idea-2',
    title: 'Self-Healing Security Infrastructure (Auto-Patching)',
    category: 'AI SecOps / SOAR',
    priority: 'High',
    status: 'In Progress',
    description: 'Dynamically generates Suricata IDS signatures, Cloudflare WAF rules, and YARA-L threat rules upon detecting novel attack vectors, deploying them with human-in-the-loop validation.',
    tags: ['WAF', 'YARA-L', 'Suricata', 'Auto-Patch'],
    updatedAt: new Date().toISOString().split('T')[0],
    actionItems: [
      { id: 'b1', text: 'Create YARA-L & Sigma rule generator UI', completed: true },
      { id: 'b2', text: 'Add direct webhook integrations for Cloudflare WAF rule deployment', completed: false },
      { id: 'b3', text: 'Add rollback mechanism for false positive mitigation', completed: false }
    ]
  },
  {
    id: 'idea-3',
    title: 'OWASP LLM Top 10 Automated Jailbreak Suite',
    category: 'Red-Team Attack Lab',
    priority: 'High',
    status: 'Completed',
    description: 'Automated testing harness evaluating AI model vulnerability to Direct/Indirect Prompt Injection, System Prompt Leakage, Excessive Agency, and Data Poisoning.',
    tags: ['OWASP LLM', 'Jailbreak', 'Red-Team', 'PenTesting'],
    updatedAt: new Date().toISOString().split('T')[0],
    actionItems: [
      { id: 'c1', text: 'Build Red-Team Attack Lab execution harness', completed: true },
      { id: 'c2', text: 'Integrate 12+ attack vector templates (DAN, Cipher, Grandma, System Leak)', completed: true },
      { id: 'c3', text: 'Add custom attack payload upload support (.csv / .json)', completed: false }
    ]
  },
  {
    id: 'idea-4',
    title: 'Interactive Bruce Schneier Attack Tree Graph Solver',
    category: 'Threat Hunting',
    priority: 'Medium',
    status: 'In Progress',
    description: 'Visual graph editor for AND/OR attack trees. Automatically calculates critical choke points, minimum cost of attack, and optimal defense investment allocations.',
    tags: ['Attack Trees', 'Bruce Schneier', 'Graph Solver', 'Choke-Point'],
    updatedAt: new Date().toISOString().split('T')[0],
    actionItems: [
      { id: 'd1', text: 'Implement canvas graph rendering for attack nodes', completed: true },
      { id: 'd2', text: 'Add automated choke-point path finding algorithm (Dijkstra / Min-Cut)', completed: false },
      { id: 'd3', text: 'Export attack tree models as Cypher / Mermaid JS', completed: false }
    ]
  },
  {
    id: 'idea-5',
    title: 'EU AI Act & NIST AI RMF Automated Auditor',
    category: 'GRC & Compliance',
    priority: 'High',
    status: 'In Progress',
    description: 'Automated compliance questionnaire and evidence collector scoring AI systems against EU AI Act Article 10/14 mandates and NIST AI RMF 1.0 (GOVERN, MAP, MEASURE, MANAGE).',
    tags: ['EU AI Act', 'NIST AI RMF', 'Compliance', 'Audit'],
    updatedAt: new Date().toISOString().split('T')[0],
    actionItems: [
      { id: 'e1', text: 'Create GRC audit dashboard with compliance gauges', completed: true },
      { id: 'e2', text: 'Generate downloadable PDF executive compliance reports', completed: false },
      { id: 'e3', text: 'Add automated evidence document scanner using Gemini Multimodal', completed: false }
    ]
  },
  {
    id: 'idea-6',
    title: 'Multi-Agent Swarm Orchestrator',
    category: 'Workflow Builder',
    priority: 'High',
    status: 'Completed',
    description: 'Visual node-based graph builder for multi-agent workflows with memory, guardrails, LLMs, and tool nodes. Exports directly to LangGraph, CrewAI, and Gemini SDKs.',
    tags: ['Swarm', 'LangGraph', 'CrewAI', 'DAG Builder'],
    updatedAt: new Date().toISOString().split('T')[0],
    actionItems: [
      { id: 'f1', text: 'Interactive node canvas with drag-and-drop connections', completed: true },
      { id: 'f2', text: 'Dynamic properties inspector for node parameters', completed: true },
      { id: 'f3', text: 'Code exporter for Python & TypeScript', completed: true }
    ]
  }
];

const LOCAL_STORAGE_KEY = 'agentforge_ideas_roadmap_v1';

interface IdeasHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IdeasHubModal: React.FC<IdeasHubModalProps> = ({ isOpen, onClose }) => {
  const [ideas, setIdeas] = useState<IdeaItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved ideas:', e);
    }
    return DEFAULT_IDEAS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  
  // Edit / Create modal internal state
  const [editingIdea, setEditingIdea] = useState<IdeaItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<IdeaItem['category']>('AI SecOps / SOAR');
  const [formPriority, setFormPriority] = useState<IdeaItem['priority']>('High');
  const [formStatus, setFormStatus] = useState<IdeaItem['status']>('Draft');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formActionItems, setFormActionItems] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [newActionText, setNewActionText] = useState('');

  // Save to localStorage whenever ideas change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ideas));
    } catch (e) {
      console.error('Error saving ideas to localStorage:', e);
    }
  }, [ideas]);

  if (!isOpen) return null;

  // Toggle action item completed status
  const handleToggleActionItem = (ideaId: string, actionId: string) => {
    setIdeas((prev) =>
      prev.map((item) => {
        if (item.id !== ideaId) return item;
        return {
          ...item,
          actionItems: item.actionItems.map((act) =>
            act.id === actionId ? { ...act, completed: !act.completed } : act
          ),
          updatedAt: new Date().toISOString().split('T')[0]
        };
      })
    );
  };

  // Open form to create a new idea
  const handleOpenCreateForm = () => {
    setEditingIdea(null);
    setFormTitle('');
    setFormCategory('AI SecOps / SOAR');
    setFormPriority('High');
    setFormStatus('Draft');
    setFormDescription('');
    setFormTags('');
    setFormActionItems([
      { id: `act-${Date.now()}-1`, text: 'Define initial architecture', completed: false }
    ]);
    setIsFormOpen(true);
  };

  // Open form to edit an existing idea
  const handleOpenEditForm = (idea: IdeaItem) => {
    setEditingIdea(idea);
    setFormTitle(idea.title);
    setFormCategory(idea.category);
    setFormPriority(idea.priority);
    setFormStatus(idea.status);
    setFormDescription(idea.description);
    setFormTags(idea.tags.join(', '));
    setFormActionItems([...idea.actionItems]);
    setIsFormOpen(true);
  };

  // Delete an idea
  const handleDeleteIdea = (ideaId: string) => {
    if (confirm('Are you sure you want to delete this idea?')) {
      setIdeas((prev) => prev.filter((item) => item.id !== ideaId));
    }
  };

  // Reset to default preset ideas
  const handleResetToDefaults = () => {
    if (confirm('Reset ideas to default preset list? Your custom edits will be restored.')) {
      setIdeas(DEFAULT_IDEAS);
    }
  };

  // Save form (Create or Update)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const parsedTags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingIdea) {
      // Update existing
      setIdeas((prev) =>
        prev.map((item) =>
          item.id === editingIdea.id
            ? {
                ...item,
                title: formTitle,
                category: formCategory,
                priority: formPriority,
                status: formStatus,
                description: formDescription,
                tags: parsedTags,
                actionItems: formActionItems,
                updatedAt: new Date().toISOString().split('T')[0]
              }
            : item
        )
      );
    } else {
      // Create new
      const newIdea: IdeaItem = {
        id: `idea-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        priority: formPriority,
        status: formStatus,
        description: formDescription,
        tags: parsedTags,
        actionItems: formActionItems,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setIdeas((prev) => [newIdea, ...prev]);
    }

    setIsFormOpen(false);
  };

  // Add bullet point to form action items
  const handleAddFormActionItem = () => {
    if (!newActionText.trim()) return;
    setFormActionItems((prev) => [
      ...prev,
      { id: `act-${Date.now()}`, text: newActionText.trim(), completed: false }
    ]);
    setNewActionText('');
  };

  // Remove bullet point from form
  const handleRemoveFormActionItem = (id: string) => {
    setFormActionItems((prev) => prev.filter((a) => a.id !== id));
  };

  // Export as Markdown
  const handleExportMarkdown = () => {
    let md = `# 💡 AgentForge Ideas & Feature Roadmap\n\n`;
    ideas.forEach((item) => {
      md += `### ${item.title}\n`;
      md += `- **Category**: ${item.category}\n`;
      md += `- **Priority**: ${item.priority} | **Status**: ${item.status}\n`;
      md += `- **Description**: ${item.description}\n`;
      if (item.tags.length > 0) {
        md += `- **Tags**: ${item.tags.join(', ')}\n`;
      }
      if (item.actionItems.length > 0) {
        md += `- **Action Items**:\n`;
        item.actionItems.forEach((act) => {
          md += `  - [${act.completed ? 'x' : ' '}] ${act.text}\n`;
        });
      }
      md += `\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AgentForge_Ideas_Roadmap_${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy all ideas as JSON
  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(ideas, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter ideas
  const filteredIdeas = ideas.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['All', 'AI SecOps / SOAR', 'Red-Team Attack Lab', 'Threat Hunting', 'GRC & Compliance', 'Workflow Builder', 'General / Custom'];
  const statuses = ['All', 'Draft', 'Planned', 'In Progress', 'Completed'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Ideas, Feature Notes & Roadmap
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {ideas.length} Ideas Saved
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Store, update, and track your security, agent, and feature ideas with auto-persistence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefaults}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1.5"
              title="Reset to default ideas preset"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>Export .MD</span>
            </button>

            <button
              onClick={handleCopyJSON}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleOpenCreateForm}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Idea</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas, keywords, tags..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
          {filteredIdeas.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
              <Lightbulb className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Ideas Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                No matching ideas found for your filters. Create a new idea or adjust your search query.
              </p>
              <button
                onClick={handleOpenCreateForm}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Idea</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 truncate">
                        {idea.category}
                      </span>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Priority Badge */}
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            idea.priority === 'High'
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                              : idea.priority === 'Medium'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                          }`}
                        >
                          {idea.priority}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            idea.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : idea.status === 'In Progress'
                              ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                              : idea.status === 'Planned'
                              ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                              : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                          }`}
                        >
                          {idea.status}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {idea.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-3">
                      {idea.description}
                    </p>

                    {/* Tags */}
                    {idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {idea.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Items Bullet List */}
                    {idea.actionItems.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                          <span>Action Plan</span>
                          <span>
                            {idea.actionItems.filter((a) => a.completed).length}/{idea.actionItems.length}
                          </span>
                        </div>
                        {idea.actionItems.map((action) => (
                          <div
                            key={action.id}
                            onClick={() => handleToggleActionItem(idea.id, action.id)}
                            className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer group/item select-none"
                          >
                            {action.completed ? (
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-blue-500 mt-0.5 shrink-0" />
                            )}
                            <span className={action.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                              {action.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[10px] font-mono text-slate-400">
                      Updated: {idea.updatedAt}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditForm(idea)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Edit Idea"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 transition-colors"
                        title="Delete Idea"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit / Create Form Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden p-6 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>{editingIdea ? 'Edit Feature Idea' : 'Add New Feature Idea'}</span>
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Idea Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Real-Time Autonomous Threat Hunter"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                  >
                    <option value="AI SecOps / SOAR">AI SecOps / SOAR</option>
                    <option value="Red-Team Attack Lab">Red-Team Attack Lab</option>
                    <option value="Threat Hunting">Threat Hunting</option>
                    <option value="GRC & Compliance">GRC & Compliance</option>
                    <option value="Workflow Builder">Workflow Builder</option>
                    <option value="General / Custom">General / Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the architectural concept, goal, or technical implementation details..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. Gemini, SOAR, KQL, WAF"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Action Items Checklist
                </label>
                <div className="space-y-1.5 mb-2 max-h-32 overflow-y-auto pr-1">
                  {formActionItems.map((act) => (
                    <div key={act.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={act.completed}
                        onChange={(e) =>
                          setFormActionItems((prev) =>
                            prev.map((a) => (a.id === act.id ? { ...a, completed: e.target.checked } : a))
                          )
                        }
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={act.text}
                        onChange={(e) =>
                          setFormActionItems((prev) =>
                            prev.map((a) => (a.id === act.id ? { ...a, text: e.target.value } : a))
                          )
                        }
                        className="flex-1 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFormActionItem(act.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    placeholder="Add bullet point action step..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFormActionItem}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Add Step
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingIdea ? 'Update Idea' : 'Save New Idea'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
