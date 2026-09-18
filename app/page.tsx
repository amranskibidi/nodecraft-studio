"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import {
  Plus,
  Cpu,
  Sparkles,
  Download,
  FileText,
  FolderOpen,
  Save,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  X,
  Code,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface NodeItem {
  id: string;
  title: string;
  category: string;
  x: number;
  y: number;
  color: string;
  desc: string;
}

interface CableItem {
  id: string;
  from: string;
  to: string;
  color: string;
}

const CABLE_COLORS = [
  { id: "cyan", hex: "#06b6d4", name: "Neon Cyan" },
  { id: "emerald", hex: "#10b981", name: "Emerald" },
  { id: "violet", hex: "#8b5cf6", name: "Electric Violet" },
  { id: "amber", hex: "#f59e0b", name: "Amber Gold" },
  { id: "rose", hex: "#f43f5e", name: "Neon Rose" },
];

const CATEGORIES = [
  { id: "Graphics", color: "#06b6d4" },
  { id: "Mechanics", color: "#10b981" },
  { id: "AI", color: "#8b5cf6" },
  { id: "Audio", color: "#f59e0b" },
  { id: "Input", color: "#ec4899" },
  { id: "UI", color: "#3b82f6" },
  { id: "Custom", color: "#64748b" },
];

const DEFAULT_NODES: NodeItem[] = [
  { id: "node-1", title: "Player Input Handler", category: "Input", x: 80, y: 150, color: "#ec4899", desc: "Captures LMB Click & Weapon Switch triggers." },
  { id: "node-2", title: "Weapon Raycaster", category: "Mechanics", x: 420, y: 120, color: "#10b981", desc: "Calculates weapon spread, range & line collision." },
  { id: "node-3", title: "Damage & Health Resolver", category: "Mechanics", x: 780, y: 120, color: "#10b981", desc: "Applies headshot multiplier & subtracts armor/HP." },
  { id: "node-4", title: "Particle & Muzzle FX", category: "Graphics", x: 780, y: 320, color: "#06b6d4", desc: "Spawns muzzle flash, bullet tracers & impact sparks." },
  { id: "node-5", title: "Spatial Audio Engine", category: "Audio", x: 1140, y: 220, color: "#f59e0b", desc: "Plays 3D localized gunshot & hit marker audio." },
];

const DEFAULT_CABLES: CableItem[] = [
  { id: "c-1", from: "node-1", to: "node-2", color: "#ec4899" },
  { id: "c-2", from: "node-2", to: "node-3", color: "#10b981" },
  { id: "c-3", from: "node-2", to: "node-4", color: "#06b6d4" },
  { id: "c-4", from: "node-3", to: "node-5", color: "#f59e0b" },
];

export default function NodeCraftStudio() {
  const [nodes, setNodes] = useState<NodeItem[]>(DEFAULT_NODES);
  const [cables, setCables] = useState<CableItem[]>(DEFAULT_CABLES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; type: "in" | "out" } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [activeModal, setActiveModal] = useState<"node" | "ai" | null>(null);
  const [activeCableColor, setActiveCableColor] = useState<string>("#06b6d4");
  const [modalNodeData, setModalNodeData] = useState<NodeItem>({
    id: "",
    title: "",
    category: "Mechanics",
    x: 0,
    y: 0,
    color: "#10b981",
    desc: "",
  });
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - pan.x) / zoom;
    const canvasY = (e.clientY - rect.top - pan.y) / zoom;
    setMousePos({ x: canvasX, y: canvasY });

    if (draggingNode) {
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === draggingNode) {
            return {
              ...node,
              x: canvasX - dragOffset.x,
              y: canvasY - dragOffset.y,
            };
          }
          return node;
        })
      );
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
    setIsPanning(false);
  };

  const startDragNode = (e: React.MouseEvent, node: NodeItem) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    setSelectedNodeId(node.id);
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - pan.x) / zoom;
    const canvasY = (e.clientY - rect.top - pan.y) / zoom;

    setDraggingNode(node.id);
    setDragOffset({
      x: canvasX - node.x,
      y: canvasY - node.y,
    });
  };

  const startPanCanvas = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target === canvasRef.current || target.classList.contains("bg-grid-pattern") || target.tagName === "svg") {
      setSelectedNodeId(null);
      setIsPanning(true);
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };

  const handlePortClick = (e: React.MouseEvent, nodeId: string, type: "in" | "out") => {
    e.stopPropagation();
    if (!connectingFrom) {
      setConnectingFrom({ nodeId, type });
    } else {
      if (connectingFrom.nodeId !== nodeId) {
        const exists = cables.some(
          (c) => (c.from === connectingFrom.nodeId && c.to === nodeId) || (c.from === nodeId && c.to === connectingFrom.nodeId)
        );
        if (!exists) {
          const from = connectingFrom.type === "out" ? connectingFrom.nodeId : nodeId;
          const to = connectingFrom.type === "out" ? nodeId : connectingFrom.nodeId;
          setCables([...cables, { id: "c-" + Date.now(), from, to, color: activeCableColor }]);
        }
      }
      setConnectingFrom(null);
    }
  };

  const handleAddNode = () => {
    setModalNodeData({
      id: "node-" + Date.now(),
      title: "New Game Feature",
      category: "Mechanics",
      x: 250 - pan.x / zoom,
      y: 200 - pan.y / zoom,
      color: "#10b981",
      desc: "Describe system functionality here...",
    });
    setActiveModal("node");
  };

  const saveNodeModal = () => {
    const exists = nodes.some((n) => n.id === modalNodeData.id);
    if (exists) {
      setNodes(nodes.map((n) => (n.id === modalNodeData.id ? modalNodeData : n)));
    } else {
      setNodes([...nodes, modalNodeData]);
    }
    setActiveModal(null);
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter((n) => n.id !== id));
    setCables(cables.filter((c) => c.from !== id && c.to !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleClearAll = () => {
    if (window.confirm("Apakah kamu yakin ingin menghapus seluruh elemen di canvas?")) {
      setNodes([]);
      setCables([]);
      setSelectedNodeId(null);
    }
  };

  const getCablePath = (fromNode: { x: number; y: number }, toNode: { x: number; y: number }) => {
    const fromX = fromNode.x + 240;
    const fromY = fromNode.y + 55;
    const toX = toNode.x;
    const toY = toNode.y + 55;
    const dx = Math.abs(toX - fromX) * 0.5;

    return `M ${fromX} ${fromY} C ${fromX + dx} ${fromY}, ${toX - dx} ${toY}, ${toX} ${toY}`;
  };

  const generateAIPrompt = () => {
    let markdown = `# Game Feature Architecture Graph\n`;
    markdown += `**Created with NodeCraft Studio** | *Copyright © 2026 by amranskibidi*\n\n`;
    markdown += `## Overview\nTotal Components: ${nodes.length} | Connections: ${cables.length}\n\n`;

    markdown += `### Node List & System Specifications\n`;
    nodes.forEach((n) => {
      const connectedTo = cables
        .filter((c) => c.from === n.id)
        .map((c) => nodes.find((target) => target.id === c.to)?.title)
        .filter(Boolean);
      markdown += `- **${n.title}** [Category: ${n.category}]\n  - *Description*: ${n.desc}\n  - *Outputs To*: ${
        connectedTo.length ? connectedTo.join(", ") : "None (Terminal Node)"
      }\n\n`;
    });

    markdown += `### Full Data Pipeline Flow\n`;
    cables.forEach((c) => {
      const source = nodes.find((n) => n.id === c.from);
      const target = nodes.find((n) => n.id === c.to);
      if (source && target) {
        markdown += `- [${source.category}] \`${source.title}\` ===> [${target.category}] \`${target.title}\`\n`;
      }
    });

    markdown += `\n---\n*Please use this feature node graph to write C++ / Blueprint / C# scripts for this architecture.*`;
    return markdown;
  };

  const exportPNG = async () => {
    if (!canvasRef.current) return;
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#0f172a",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `nodecraft-game-flow-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error("Export PNG failed:", err);
    }
  };

  const exportPDF = async () => {
    if (!canvasRef.current) return;
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#0f172a",
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "px", [canvas.width / 2, canvas.height / 2]);
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`nodecraft-feature-map-${Date.now()}.pdf`);
    } catch (err) {
      console.error("Export PDF failed:", err);
    }
  };

  const saveJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, cables }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nodecraft-project-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const loadJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileReader = new FileReader();
    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.nodes && parsed.cables) {
          setNodes(parsed.nodes);
          setCables(parsed.cables);
        }
      } catch (err) {
        alert("Invalid JSON project file.");
      }
    };
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-100 overflow-hidden font-sans">
      {/* HEADER NAVBAR */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-5 flex items-center justify-between z-30 shadow-lg select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 shadow-inner">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-wide text-white">
                NodeCraft <span className="text-emerald-400 font-mono text-sm">Studio</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Next.js TSX
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Game Engine Visual Feature & Logic Architecture Mapper</p>
          </div>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddNode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg text-xs transition shadow-md shadow-emerald-500/10 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Node
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Wire Color Selector */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 px-1 font-mono">Cable:</span>
            {CABLE_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCableColor(c.hex)}
                className={`w-4 h-4 rounded-full transition-transform ${
                  activeCableColor === c.hex ? "scale-125 ring-2 ring-white" : "opacity-60 hover:opacity-100"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* AI Prompt Button */}
          <button
            onClick={() => setActiveModal("ai")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg text-xs transition shadow-md shadow-violet-500/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-200" /> AI Prompt
          </button>

          {/* Export & Save Menu */}
          <button
            onClick={exportPNG}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            title="Export HD PNG"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={exportPDF}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            title="Export PDF Document"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={saveJSON}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            title="Save Project JSON"
          >
            <Save className="w-4 h-4" />
          </button>
          <label
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer transition"
            title="Open JSON Project"
          >
            <FolderOpen className="w-4 h-4" />
            <input type="file" accept=".json" onChange={loadJSON} className="hidden" />
          </label>

          {/* TOMBOL CLEAR CANVAS (JELAS DENGAN IKON & TEKS) */}
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-lg text-xs font-semibold transition shadow-sm active:scale-95 ml-1"
            title="Hapus Semua Node & Kabel"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Canvas</span>
          </button>
        </div>
      </header>

      {/* CANVAS WORKSPACE */}
      <main
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={startPanCanvas}
        className="flex-1 relative overflow-hidden bg-grid-pattern cursor-grab active:cursor-grabbing bg-[#0f172a]"
      >
        <div
          className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          {/* SVG Connection Cables */}
          <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none z-10">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {cables.map((cable) => {
              const fromNode = nodes.find((n) => n.id === cable.from);
              const toNode = nodes.find((n) => n.id === cable.to);
              if (!fromNode || !toNode) return null;

              const path = getCablePath(fromNode, toNode);
              return (
                <g
                  key={cable.id}
                  className="group pointer-events-auto cursor-pointer"
                  onClick={() => setCables(cables.filter((c) => c.id !== cable.id))}
                >
                  <path d={path} fill="none" stroke="transparent" strokeWidth="16" />
                  <path d={path} fill="none" stroke={cable.color || "#06b6d4"} strokeWidth="4" strokeOpacity="0.4" filter="url(#glow)" />
                  <path
                    d={path}
                    fill="none"
                    stroke={cable.color || "#06b6d4"}
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    className="animate-[dash_20s_linear_infinite]"
                  />
                </g>
              );
            })}

            {connectingFrom && (
              <path
                d={getCablePath(
                  connectingFrom.type === "out"
                    ? nodes.find((n) => n.id === connectingFrom.nodeId) || mousePos
                    : mousePos,
                  connectingFrom.type === "in"
                    ? nodes.find((n) => n.id === connectingFrom.nodeId) || mousePos
                    : mousePos
                )}
                fill="none"
                stroke={activeCableColor}
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
            )}
          </svg>

          {/* Interactive Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                onMouseDown={(e) => startDragNode(e, node)}
                className={`absolute w-60 rounded-xl bg-slate-900/90 border transition-all duration-150 shadow-xl backdrop-blur-md z-20 ${
                  isSelected ? "border-emerald-400 ring-2 ring-emerald-500/20 shadow-emerald-500/10" : "border-slate-800 hover:border-slate-700"
                }`}
                style={{ left: node.x, top: node.y }}
              >
                {/* Node Header */}
                <div
                  className="px-3 py-2 rounded-t-xl flex items-center justify-between border-b border-slate-800/80 cursor-move"
                  style={{ backgroundColor: `${node.color}15` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-300">{node.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalNodeData(node);
                        setActiveModal("node");
                      }}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                    >
                      <Code className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                      className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Node Body */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-slate-100 mb-1 leading-snug">{node.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">{node.desc}</p>
                </div>

                {/* Ports */}
                <div
                  onClick={(e) => handlePortClick(e, node.id, "in")}
                  className={`absolute -left-2.5 top-[52px] w-5 h-5 rounded-full border-2 border-slate-900 bg-slate-800 hover:bg-emerald-400 hover:scale-125 transition cursor-pointer flex items-center justify-center ${
                    connectingFrom?.nodeId === node.id && connectingFrom?.type === "in" ? "bg-emerald-400 ring-4 ring-emerald-500/30" : ""
                  }`}
                  title="Connect Input Port"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 hover:bg-slate-900" />
                </div>

                <div
                  onClick={(e) => handlePortClick(e, node.id, "out")}
                  className={`absolute -right-2.5 top-[52px] w-5 h-5 rounded-full border-2 border-slate-900 bg-slate-800 hover:bg-cyan-400 hover:scale-125 transition cursor-pointer flex items-center justify-center ${
                    connectingFrom?.nodeId === node.id && connectingFrom?.type === "out" ? "bg-cyan-400 ring-4 ring-cyan-500/30" : ""
                  }`}
                  title="Connect Output Port"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 hover:bg-slate-900" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 right-6 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-2xl backdrop-blur-md z-30">
          <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono px-2 text-slate-300">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(1.8, zoom + 0.1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* MODAL EDIT NODE */}
      {activeModal === "node" && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-base text-white">Edit Game Feature Node</h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Feature Title</label>
                <input
                  type="text"
                  value={modalNodeData.title}
                  onChange={(e) => setModalNodeData({ ...modalNodeData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Combat Raycaster"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">System Category</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setModalNodeData({ ...modalNodeData, category: cat.id, color: cat.color })}
                      className={`px-2 py-1.5 rounded-lg text-left font-medium border transition ${
                        modalNodeData.category === cat.id
                          ? "bg-slate-800 border-emerald-500 text-white"
                          : "border-slate-800 text-slate-400 hover:bg-slate-800/50"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ backgroundColor: cat.color }} />
                      {cat.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Description / Spec details</label>
                <textarea
                  rows={3}
                  value={modalNodeData.desc}
                  onChange={(e) => setModalNodeData({ ...modalNodeData, desc: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  placeholder="Explain inputs, outputs, algorithms..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700">
                Cancel
              </button>
              <button onClick={saveNodeModal} className="px-4 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-lg text-xs hover:bg-emerald-600">
                Save Node
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AI PROMPT */}
      {activeModal === "ai" && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h2 className="font-bold text-base text-white">AI Context Prompt Exporter</h2>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Copy this structured feature specification markdown directly into Gemini, ChatGPT, or Claude to get instantly generated game engine code!
            </p>

            <div className="relative">
              <pre className="w-full max-h-80 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed select-text">
                {generateAIPrompt()}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateAIPrompt());
                  setCopiedText(true);
                  setTimeout(() => setCopiedText(false), 2000);
                }}
                className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium shadow-md transition"
              >
                {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedText ? "Copied!" : "Copy Prompt"}
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="h-8 border-t border-slate-800 bg-slate-950 px-5 flex items-center justify-between text-[11px] text-slate-400 z-30 select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Next.js Engine Active
          </span>
          <span>
            Nodes: <strong className="text-slate-200">{nodes.length}</strong>
          </span>
          <span>
            Connections: <strong className="text-slate-200">{cables.length}</strong>
          </span>
        </div>
        <div>
          <span className="font-mono text-slate-400">Copyright © 2026 by amranskibidi. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}