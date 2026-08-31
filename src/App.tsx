/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PRESET_WORKFLOWS } from './data/presetAgents';
import { AgentWorkflow, AgentNode, ComponentPaletteItem, NodeConnection } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { AgentSimulator } from './components/AgentSimulator';
import { DeployModal } from './components/DeployModal';
import { CodeExportModal } from './components/CodeExportModal';
import { AddNodeModal } from './components/AddNodeModal';
import { IdeasHubModal } from './components/IdeasHubModal';
import { SecurityAttackLab } from './components/SecurityAttackLab';
import { AppSecDashboard } from './components/AppSecDashboard';
import { VaptCenter } from './components/VaptCenter';
import { AiSecOpsNexus } from './components/AiSecOpsNexus';
import { GrcAuditView } from './components/GrcAuditView';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function AppContent() {
  const [workflows, setWorkflows] = useState<AgentWorkflow[]>(PRESET_WORKFLOWS);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(PRESET_WORKFLOWS[0].id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    PRESET_WORKFLOWS[0].nodes.find((n) => n.type === 'llm')?.id || null
  );

  // View state: 'secops' | 'vapt' | 'appsec_scanner' | 'grc_compliance' | 'security_lab' | 'builder'
  const [activeView, setActiveView] = useState<'secops' | 'vapt' | 'appsec_scanner' | 'grc_compliance' | 'security_lab' | 'builder'>('secops');

  // Modals state
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [isIdeasOpen, setIsIdeasOpen] = useState(false);

  // Test execution state
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);

  const { theme } = useTheme();
  const isLight = theme === 'light';

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId) || workflows[0];
  const selectedNode = activeWorkflow.nodes.find((n) => n.id === selectedNodeId) || null;


  // Switch workflow preset
  const handleSelectWorkflow = (wf: AgentWorkflow) => {
    setActiveWorkflowId(wf.id);
    const llm = wf.nodes.find((n) => n.type === 'llm');
    setSelectedNodeId(llm ? llm.id : wf.nodes[0]?.id || null);
  };

  // Node position updater
  const handleUpdateNodePosition = (nodeId: string, position: { x: number; y: number }) => {
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== activeWorkflowId) return wf;
        return {
          ...wf,
          nodes: wf.nodes.map((n) => (n.id === nodeId ? { ...n, position } : n)),
        };
      })
    );
  };

  // Add new component from sidebar or modal
  const handleAddComponent = (comp: ComponentPaletteItem) => {
    const newNodeId = `node-${comp.type}-${Date.now().toString().slice(-4)}`;
    // Calculate new position near center of canvas
    const offset = (activeWorkflow.nodes.length * 35) % 200;
    const position = { x: 300 + offset, y: 160 + offset };

    const newNode: AgentNode = {
      id: newNodeId,
      type: comp.type,
      title: comp.name.replace(/s$/, '') + ' Node',
      subtitle: comp.defaultConfig.contextSource || comp.defaultConfig.triggerEvent || comp.defaultConfig.toolName || comp.name,
      position,
      status: 'idle',
      config: { ...comp.defaultConfig },
    };

    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== activeWorkflowId) return wf;
        return {
          ...wf,
          nodes: [...wf.nodes, newNode],
        };
      })
    );

    setSelectedNodeId(newNodeId);
  };

  // Delete node
  const handleDeleteNode = (nodeId: string) => {
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== activeWorkflowId) return wf;
        return {
          ...wf,
          nodes: wf.nodes.filter((n) => n.id !== nodeId),
          connections: wf.connections.filter(
            (c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
          ),
        };
      })
    );
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // Duplicate node
  const handleDuplicateNode = (node: AgentNode) => {
    const dupNode: AgentNode = {
      ...node,
      id: `node-${node.type}-${Date.now().toString().slice(-4)}`,
      title: `${node.title} (Copy)`,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      status: 'idle',
    };

    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== activeWorkflowId) return wf;
        return {
          ...wf,
          nodes: [...wf.nodes, dupNode],
        };
      })
    );
    setSelectedNodeId(dupNode.id);
  };

  // Update node configuration
  const handleUpdateConfig = (nodeId: string, updatedConfig: Partial<AgentNode['config']>) => {
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== activeWorkflowId) return wf;
        return {
          ...wf,
          nodes: wf.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  config: { ...n.config, ...updatedConfig },
                }
              : n
          ),
        };
      })
    );
  };

  // Update node title & subtitle
  const handleUpdateTitle = (nodeId: string, title: string, subtitle?: string) => {
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== activeWorkflowId) return wf;
        return {
          ...wf,
          nodes: wf.nodes.map((n) =>
            n.id === nodeId ? { ...n, title, subtitle: subtitle || n.subtitle } : n
          ),
        };
      })
    );
  };

  // Add connection link
  const handleAddConnection = (fromNodeId: string, toNodeId: string) => {
    const exists = activeWorkflow.connections.some(
      (c) => c.fromNodeId === fromNodeId && c.toNodeId === toNodeId
    );
    if (exists) return;

    const newConnection: NodeConnection = {
      id: `conn-${Date.now().toString().slice(-4)}`,
      fromNodeId,
      toNodeId,
      label: 'Data Stream',
    };

    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== activeWorkflowId) return wf;
        return {
          ...wf,
          connections: [...wf.connections, newConnection],
        };
      })
    );
  };

  // Delete connection link
  const handleDeleteConnection = (connId: string) => {
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== activeWorkflowId) return wf;
        return {
          ...wf,
          connections: wf.connections.filter((c) => c.id !== connId),
        };
      })
    );
  };

  // Auto-arrange graph layout in neat horizontal pipeline
  const handleAutoArrange = () => {
    const sorted = [...activeWorkflow.nodes].sort((a, b) => {
      const order: Record<string, number> = {
        trigger: 1,
        memory: 2,
        tool: 2,
        guardrail: 2,
        llm: 3,
        action: 4,
        output: 5,
      };
      return (order[a.type] || 3) - (order[b.type] || 3);
    });

    let currentX = 60;
    const arrangedNodes = sorted.map((node, i) => {
      const pos = {
        x: currentX,
        y: 180 + (i % 2 === 1 ? 120 : -30),
      };
      currentX += node.type === 'llm' ? 320 : 260;
      return { ...node, position: pos };
    });

    setWorkflows((prev) =>
      prev.map((wf) => (wf.id === activeWorkflowId ? { ...wf, nodes: arrangedNodes } : wf))
    );
  };

  // Pipeline simulation runner (animates nodes sequence)
  const handleTestRun = async () => {
    if (isRunningPipeline || activeWorkflow.nodes.length === 0) return;
    setIsRunningPipeline(true);

    // Reset all statuses
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === activeWorkflowId
          ? { ...wf, nodes: wf.nodes.map((n) => ({ ...n, status: 'idle' })) }
          : wf
      )
    );

    // Animate sequentially through nodes
    for (let i = 0; i < activeWorkflow.nodes.length; i++) {
      const node = activeWorkflow.nodes[i];

      // Set node to running
      setWorkflows((prev) =>
        prev.map((wf) =>
          wf.id === activeWorkflowId
            ? {
                ...wf,
                nodes: wf.nodes.map((n) => (n.id === node.id ? { ...n, status: 'running' } : n)),
              }
            : wf
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Set node to success
      setWorkflows((prev) =>
        prev.map((wf) =>
          wf.id === activeWorkflowId
            ? {
                ...wf,
                nodes: wf.nodes.map((n) => (n.id === node.id ? { ...n, status: 'success' } : n)),
              }
            : wf
        )
      );
    }

    setIsRunningPipeline(false);
  };

  // Consume token usage
  const handleConsumeTokens = (tokens: number) => {
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === activeWorkflowId
          ? {
              ...wf,
              tokenUsage: Math.min(wf.tokenUsage + tokens, wf.maxTokensLimit),
            }
          : wf
      )
    );
  };

  return (
    <div
      className="flex flex-col h-screen w-screen font-sans overflow-hidden select-none bg-[#f8fafc] text-slate-800 transition-colors"
    >
      {/* Top Navbar */}
      <Navbar
        currentWorkflow={activeWorkflow}
        allWorkflows={workflows}
        onSelectWorkflow={handleSelectWorkflow}
        activeView={activeView}
        onChangeView={setActiveView}
        onDeploy={() => setIsDeployOpen(true)}
        onExportCode={() => setIsExportOpen(true)}
        onTestRun={handleTestRun}
        isRunningTest={isRunningPipeline}
        onOpenIdeas={() => setIsIdeasOpen(true)}
      />

      {/* Main App Body */}
      {activeView === 'secops' ? (
        <div className="flex flex-1 overflow-hidden">
          <AiSecOpsNexus />
        </div>
      ) : activeView === 'vapt' ? (
        <div className="flex flex-1 overflow-hidden">
          <VaptCenter />
        </div>
      ) : activeView === 'appsec_scanner' ? (
        <div className="flex flex-1 overflow-hidden">
          <AppSecDashboard />
        </div>
      ) : activeView === 'grc_compliance' ? (
        <div className="flex flex-1 overflow-hidden">
          <GrcAuditView />
        </div>
      ) : activeView === 'security_lab' ? (
        <div className="flex flex-1 overflow-hidden">
          <SecurityAttackLab workflow={activeWorkflow} />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Components & Presets */}
          <Sidebar
            onAddComponent={handleAddComponent}
            tokenUsage={activeWorkflow.tokenUsage}
            maxTokensLimit={activeWorkflow.maxTokensLimit}
            presetWorkflows={workflows}
            currentWorkflowId={activeWorkflow.id}
            onSelectPreset={handleSelectWorkflow}
          />

          {/* Center Canvas: Interactive Node Graph */}
          <Canvas
            nodes={activeWorkflow.nodes}
            connections={activeWorkflow.connections}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onUpdateNodePosition={handleUpdateNodePosition}
            onDeleteNode={handleDeleteNode}
            onDuplicateNode={handleDuplicateNode}
            onAddConnection={handleAddConnection}
            onDeleteConnection={handleDeleteConnection}
            onOpenAddModal={() => setIsAddNodeOpen(true)}
            onAutoArrange={handleAutoArrange}
          />

          {/* Right Sidebar: Properties Inspector & Agent Simulator */}
          <aside
            id="inspector-simulator-sidebar"
            className={`w-80 border-l p-5 overflow-y-auto flex flex-col justify-between ${
              isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900/50'
            }`}
          >
            <div>
              <PropertiesPanel
                selectedNode={selectedNode}
                onUpdateConfig={handleUpdateConfig}
                onUpdateTitle={handleUpdateTitle}
              />
            </div>

            <div className={`pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <AgentSimulator
                nodes={activeWorkflow.nodes}
                onConsumeTokens={handleConsumeTokens}
              />
            </div>
          </aside>
        </div>
      )}

      {/* Modals */}
      {isDeployOpen && (
        <DeployModal
          workflow={activeWorkflow}
          onClose={() => setIsDeployOpen(false)}
        />
      )}

      {isExportOpen && (
        <CodeExportModal
          workflow={activeWorkflow}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {isAddNodeOpen && (
        <AddNodeModal
          onAdd={handleAddComponent}
          onClose={() => setIsAddNodeOpen(false)}
        />
      )}

      <IdeasHubModal
        isOpen={isIdeasOpen}
        onClose={() => setIsIdeasOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

