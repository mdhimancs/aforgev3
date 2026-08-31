import React, { useRef, useState, useEffect } from 'react';
import { AgentNode, NodeConnection } from '../types';
import { NodeCard } from './NodeCard';
import { ZoomIn, ZoomOut, Maximize2, Plus, Sparkles, Wand2, Trash2 } from 'lucide-react';

interface CanvasProps {
  nodes: AgentNode[];
  connections: NodeConnection[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onUpdateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (node: AgentNode) => void;
  onAddConnection: (fromNodeId: string, toNodeId: string) => void;
  onDeleteConnection: (connId: string) => void;
  onOpenAddModal: () => void;
  onAutoArrange: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  connections,
  selectedNodeId,
  onSelectNode,
  onUpdateNodePosition,
  onDeleteNode,
  onDuplicateNode,
  onAddConnection,
  onDeleteConnection,
  onOpenAddModal,
  onAutoArrange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Connecting nodes state
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; port: string } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle global mouse move for node dragging and connecting
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentMouseX = (e.clientX - rect.left - pan.x) / zoom;
      const currentMouseY = (e.clientY - rect.top - pan.y) / zoom;

      setMousePos({ x: currentMouseX, y: currentMouseY });

      if (draggingNodeId) {
        const newX = Math.max(20, Math.round(currentMouseX - dragOffset.x));
        const newY = Math.max(20, Math.round(currentMouseY - dragOffset.y));
        onUpdateNodePosition(draggingNodeId, { x: newX, y: newY });
      } else if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingNodeId(null);
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNodeId, dragOffset, isPanning, panStart, pan, zoom, onUpdateNodePosition]);

  // Start node dragging
  const handleDragStart = (nodeId: string, e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentMouseX = (e.clientX - rect.left - pan.x) / zoom;
    const currentMouseY = (e.clientY - rect.top - pan.y) / zoom;

    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setDraggingNodeId(nodeId);
      setDragOffset({
        x: currentMouseX - node.position.x,
        y: currentMouseY - node.position.y,
      });
    }
  };

  // Connection handlers
  const handleStartConnect = (fromNodeId: string, fromPort: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnectingFrom({ nodeId: fromNodeId, port: fromPort });
  };

  const handleEndConnect = (toNodeId: string, _toPort: string) => {
    if (connectingFrom && connectingFrom.nodeId !== toNodeId) {
      onAddConnection(connectingFrom.nodeId, toNodeId);
    }
    setConnectingFrom(null);
  };

  // Calculate Node Anchor coordinates
  const getNodeAnchor = (node: AgentNode, type: 'in' | 'out') => {
    const width = node.type === 'llm' ? 256 : 208;
    // Approximating the height of the card
    const height = node.type === 'llm' ? 180 : 130;
    
    if (type === 'out') {
      return {
        x: node.position.x + width - 14,
        y: node.position.y + height - 20,
      };
    } else {
      return {
        x: node.position.x + 14,
        y: node.position.y + height - 20,
      };
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <main
      ref={containerRef}
      id="agent-canvas-container"
      onMouseDown={(e) => {
        // Pan canvas if clicking directly on the canvas background
        if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
          setIsPanning(true);
          setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
          onSelectNode(null);
          setConnectingFrom(null);
        }
      }}
      className="flex-1 relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:24px_24px] overflow-hidden cursor-default select-none"
    >
      {/* Floating Toolbar Top-Right */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl">
        <button
          id="btn-add-node-canvas"
          onClick={onOpenAddModal}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
          title="Add Component Node"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Node</span>
        </button>

        <button
          id="btn-auto-arrange"
          onClick={onAutoArrange}
          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="Auto-organize graph layout"
        >
          <Wand2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1"></div>

        <button
          id="btn-zoom-in"
          onClick={handleZoomIn}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          id="btn-zoom-out"
          onClick={handleZoomOut}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          id="btn-reset-view"
          onClick={handleResetView}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset View (100%)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Canvas Workspace Layer with Zoom & Pan */}
      <div
        id="canvas-transformed-workspace"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: '3000px',
          height: '2000px',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {/* SVG Bezier Connection Lines */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="conn-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Existing Connections */}
          {connections.map((conn) => {
            const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
            const toNode = nodes.find((n) => n.id === conn.toNodeId);
            if (!fromNode || !toNode) return null;

            const start = getNodeAnchor(fromNode, 'out');
            const end = getNodeAnchor(toNode, 'in');

            // Compute smooth cubic bezier control points
            const dx = Math.abs(end.x - start.x) * 0.55;
            const pathD = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;

            return (
              <g key={conn.id} className="pointer-events-auto group cursor-pointer">
                {/* Wider invisible path for easy hover/clicking */}
                <path
                  d={pathD}
                  stroke="transparent"
                  strokeWidth="20"
                  fill="none"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this connection line?')) {
                      onDeleteConnection(conn.id);
                    }
                  }}
                />

                {/* Visible stylized path matching design */}
                <path
                  d={pathD}
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  fill="none"
                  className="group-hover:stroke-indigo-400 group-hover:stroke-[3.5] transition-all"
                  filter="url(#glow)"
                />

                {/* Animated pulse dot travelling along the link */}
                <circle r="3.5" fill="#a5b4fc">
                  <animateMotion path={pathD} dur="2.5s" repeatCount="indefinite" />
                </circle>

                {/* Connection Label Pill */}
                {conn.label && (
                  <foreignObject
                    x={(start.x + end.x) / 2 - 45}
                    y={(start.y + end.y) / 2 - 12}
                    width="90"
                    height="24"
                    className="overflow-visible pointer-events-none"
                  >
                    <div className="bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded text-[9px] text-slate-400 font-mono text-center shadow-lg truncate backdrop-blur-sm">
                      {conn.label}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}

          {/* Active drawing connection line */}
          {connectingFrom && (
            (() => {
              const fromNode = nodes.find((n) => n.id === connectingFrom.nodeId);
              if (!fromNode) return null;
              const start = getNodeAnchor(fromNode, 'out');
              const dx = Math.abs(mousePos.x - start.x) * 0.5;
              const pathD = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${mousePos.x - dx} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`;

              return (
                <path
                  d={pathD}
                  stroke="#818cf8"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  fill="none"
                />
              );
            })()
          )}
        </svg>

        {/* Render Graph Nodes */}
        {nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            onSelect={onSelectNode}
            onDelete={onDeleteNode}
            onDuplicate={onDuplicateNode}
            onStartConnect={handleStartConnect}
            onEndConnect={handleEndConnect}
            onDragStart={handleDragStart}
          />
        ))}
      </div>

      {/* Empty State Banner if no nodes */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center max-w-sm backdrop-blur-md">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-200 mb-1">Canvas is Ready</h4>
            <p className="text-xs text-slate-400 mb-4">
              Select an agent component from the left sidebar or pick a prebuilt blueprint to get started.
            </p>
          </div>
        </div>
      )}
    </main>
  );
};
