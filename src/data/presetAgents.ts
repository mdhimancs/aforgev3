import { AgentWorkflow, ComponentPaletteItem } from '../types';

export const COMPONENT_PALETTE: ComponentPaletteItem[] = [
  {
    id: 'trigger-comp',
    type: 'trigger',
    name: 'Triggers',
    category: 'Ingress',
    iconName: 'Zap',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    defaultConfig: {
      triggerType: 'webhook',
      triggerEvent: 'On Inbound Event'
    }
  },
  {
    id: 'llm-comp',
    type: 'llm',
    name: 'LLM Models',
    category: 'Reasoning',
    iconName: 'Brain',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    defaultConfig: {
      model: 'gemini-3.7-flash',
      temperature: 0.7,
      topP: 0.95,
      systemPrompt: 'You are an autonomous AI Agent that analyzes user queries, utilizes available tools, and provides concise, structured responses.',
      contextSource: 'Support Knowledge Base',
      maxTokens: 2048,
      thinkingLevel: 'HIGH'
    }
  },
  {
    id: 'memory-comp',
    type: 'memory',
    name: 'Memory / Vector',
    category: 'Context',
    iconName: 'HardDrive',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    defaultConfig: {
      memoryType: 'vector',
      collectionName: 'kb_embeddings_v2',
      topK: 4
    }
  },
  {
    id: 'tool-comp',
    type: 'tool',
    name: 'External Tools',
    category: 'Actions',
    iconName: 'Wrench',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    defaultConfig: {
      toolName: 'Google Search & Grounding',
      endpoint: 'https://api.google.com/search',
      toolAction: 'query_live_web'
    }
  },
  {
    id: 'guardrail-comp',
    type: 'guardrail',
    name: 'Guardrails & Safety',
    category: 'Validation',
    iconName: 'ShieldCheck',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    defaultConfig: {
      guardrailType: 'pii',
      threshold: 0.9
    }
  },
  {
    id: 'action-comp',
    type: 'action',
    name: 'Actions / Sinks',
    category: 'Egress',
    iconName: 'Send',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    defaultConfig: {
      actionType: 'zendesk_reply',
      destination: 'support-inbox@company.com'
    }
  }
];

export const PRESET_WORKFLOWS: AgentWorkflow[] = [
  {
    id: 'agent-cs-support',
    name: 'Customer_Support',
    version: 'v2.1',
    description: 'Autonomous customer tier-1 triage, sentiment inspection, knowledge retrieval, and automated Zendesk draft response generator.',
    status: 'active',
    tokenUsage: 12400,
    maxTokensLimit: 100000,
    lastDeployed: '10 mins ago',
    nodes: [
      {
        id: 'node-trigger-1',
        type: 'trigger',
        title: 'Trigger Node',
        subtitle: 'On Inbound Email',
        position: { x: 50, y: 120 },
        status: 'idle',
        config: {
          triggerType: 'email',
          triggerEvent: 'On Inbound Email'
        }
      },
      {
        id: 'node-llm-1',
        type: 'llm',
        title: 'LLM Reasoning',
        subtitle: 'Context: Support Docs',
        position: { x: 380, y: 220 },
        status: 'idle',
        config: {
          model: 'gemini-3.7-flash',
          temperature: 0.7,
          topP: 0.95,
          systemPrompt: 'Analyze the sentiment and intent of the customer email. Check product documentation for pricing, technical resolution, or refund eligibility, and formulate a polite, resolution-oriented response draft.',
          contextSource: 'Support Knowledge Base & Pricing Catalog',
          maxTokens: 2048,
          thinkingLevel: 'HIGH'
        }
      },
      {
        id: 'node-action-1',
        type: 'action',
        title: 'Action Node',
        subtitle: 'Draft Zendesk Reply',
        position: { x: 740, y: 380 },
        status: 'idle',
        config: {
          actionType: 'zendesk_reply',
          destination: 'zendesk://tickets/draft_reply'
        }
      }
    ],
    connections: [
      {
        id: 'conn-1',
        fromNodeId: 'node-trigger-1',
        toNodeId: 'node-llm-1',
        label: 'Payload Stream'
      },
      {
        id: 'conn-2',
        fromNodeId: 'node-llm-1',
        toNodeId: 'node-action-1',
        label: 'Resolved Output'
      }
    ]
  },
  {
    id: 'agent-deep-research',
    name: 'Deep_Research_Analyst',
    version: 'v1.0',
    description: 'Autonomous market intelligence agent using Google Search grounding, multi-source synthesis, and executive markdown reports.',
    status: 'active',
    tokenUsage: 34200,
    maxTokensLimit: 100000,
    lastDeployed: '1 hour ago',
    nodes: [
      {
        id: 'node-trig-research',
        type: 'trigger',
        title: 'Trigger Node',
        subtitle: 'User Query or Webhook',
        position: { x: 60, y: 150 },
        status: 'idle',
        config: {
          triggerType: 'chat',
          triggerEvent: 'On Research Prompt'
        }
      },
      {
        id: 'node-tool-search',
        type: 'tool',
        title: 'Google Grounding',
        subtitle: 'Live Web Search',
        position: { x: 340, y: 80 },
        status: 'idle',
        config: {
          toolName: 'Google Search & Grounding',
          endpoint: 'googleSearch',
          toolAction: 'Fetch real-time authoritative web data'
        }
      },
      {
        id: 'node-llm-research',
        type: 'llm',
        title: 'LLM Reasoning',
        subtitle: 'Gemini 3.7 Flash Deep Synthesis',
        position: { x: 420, y: 280 },
        status: 'idle',
        config: {
          model: 'gemini-3.7-flash',
          temperature: 0.3,
          topP: 0.9,
          systemPrompt: 'You are an expert research analyst. Deconstruct complex industry questions, cross-reference data points gathered via search tools, and produce comprehensive executive summaries with citations.',
          contextSource: 'Live Web Grounding',
          maxTokens: 4096,
          thinkingLevel: 'HIGH'
        }
      },
      {
        id: 'node-action-slack',
        type: 'action',
        title: 'Publish Digest',
        subtitle: 'Send to Slack / Notion',
        position: { x: 760, y: 280 },
        status: 'idle',
        config: {
          actionType: 'slack_notify',
          destination: '#intelligence-briefings'
        }
      }
    ],
    connections: [
      {
        id: 'conn-r1',
        fromNodeId: 'node-trig-research',
        toNodeId: 'node-tool-search',
        label: 'Search Terms'
      },
      {
        id: 'conn-r2',
        fromNodeId: 'node-tool-search',
        toNodeId: 'node-llm-research',
        label: 'Citations Context'
      },
      {
        id: 'conn-r3',
        fromNodeId: 'node-llm-research',
        toNodeId: 'node-action-slack',
        label: 'Formatted Brief'
      }
    ]
  },
  {
    id: 'agent-code-reviewer',
    name: 'Code_Guardian_CI',
    version: 'v3.4',
    description: 'Automated GitHub pull request reviewer checking TypeScript safety, edge-case vulnerability analysis, and code quality scoring.',
    status: 'active',
    tokenUsage: 48900,
    maxTokensLimit: 100000,
    lastDeployed: '3 hours ago',
    nodes: [
      {
        id: 'node-trig-gh',
        type: 'trigger',
        title: 'GitHub Webhook',
        subtitle: 'pull_request.opened',
        position: { x: 60, y: 180 },
        status: 'idle',
        config: {
          triggerType: 'webhook',
          triggerEvent: 'pull_request.synchronize'
        }
      },
      {
        id: 'node-mem-rules',
        type: 'memory',
        title: 'Coding Standards',
        subtitle: 'Vector Embeddings (Clean Code)',
        position: { x: 360, y: 100 },
        status: 'idle',
        config: {
          memoryType: 'vector',
          collectionName: 'engineering_playbook_v2',
          topK: 6
        }
      },
      {
        id: 'node-llm-reviewer',
        type: 'llm',
        title: 'LLM Auditor',
        subtitle: 'Gemini 3.7 Flash Analysis',
        position: { x: 420, y: 310 },
        status: 'idle',
        config: {
          model: 'gemini-3.7-flash',
          temperature: 0.2,
          topP: 0.8,
          systemPrompt: 'Review git diffs for architectural antipatterns, security vulnerabilities, unhandled null/undefined checks, and performance bottlenecks. Output constructive inline comments.',
          contextSource: 'PR Git Diff & Engineering Standards',
          maxTokens: 3000
        }
      },
      {
        id: 'node-action-gh-comment',
        type: 'action',
        title: 'GitHub API',
        subtitle: 'Post PR Review & Status Check',
        position: { x: 760, y: 310 },
        status: 'idle',
        config: {
          actionType: 'webhook_post',
          destination: 'https://api.github.com/repos/:owner/:repo/pulls/comments'
        }
      }
    ],
    connections: [
      {
        id: 'conn-gh1',
        fromNodeId: 'node-trig-gh',
        toNodeId: 'node-mem-rules',
        label: 'Diff Context'
      },
      {
        id: 'conn-gh2',
        fromNodeId: 'node-mem-rules',
        toNodeId: 'node-llm-reviewer',
        label: 'Guidelines'
      },
      {
        id: 'conn-gh3',
        fromNodeId: 'node-llm-reviewer',
        toNodeId: 'node-action-gh-comment',
        label: 'Inline Reviews'
      }
    ]
  }
];
