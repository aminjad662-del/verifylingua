"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileUp,
  Scan,
  Grid,
  Languages,
  Layers,
  Stamp,
  ShieldCheck,
  Award,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Terminal,
  Activity
} from "lucide-react";

interface AgentStep {
  id: number;
  name: string;
  codename: string;
  role: string;
  icon: React.ElementType;
  metric: string;
  badge: string;
  status: "idle" | "running" | "verified";
  log: string;
}

const AGENTS: AgentStep[] = [
  {
    id: 1,
    name: "Intake & Script Sentry",
    codename: "AGENT-01 // INGEST",
    role: "Validates format, checks DPI >= 300, and verifies Core 4 LTR script matrix.",
    icon: FileUp,
    metric: "12ms",
    badge: "100% Sanitized",
    status: "verified",
    log: "Source document validated: 300 DPI, zero raster blur, non-Latin ratio < 0.02."
  },
  {
    id: 2,
    name: "Sub-Pixel Vision OCR",
    codename: "AGENT-02 // VISION",
    role: "Extracts character geometry, font sizing, baseline coordinates, and reading order.",
    icon: Scan,
    metric: "99.98% Acc",
    badge: "Vector OCR",
    status: "verified",
    log: "48 text blocks isolated. Bounding box coordinates saved with sub-pixel precision."
  },
  {
    id: 3,
    name: "Artwork & Seal Isolator",
    codename: "AGENT-03 // ASSETS",
    role: "Masks and preserves official watermarks, civil stamps, signatures, and emblems.",
    icon: Grid,
    metric: "Zero Loss",
    badge: "Protected Layer",
    status: "verified",
    log: "3 institutional stamps, 1 embossed crest, and 2 legal signatures locked to layer 0."
  },
  {
    id: 4,
    name: "Contextual Legal MT",
    codename: "AGENT-04 // SYNTHESIS",
    role: "Deep bilingual neural synthesis adhering strictly to statutory legal terminology.",
    icon: Languages,
    metric: "ATA Glossaries",
    badge: "Neural Core",
    status: "verified",
    log: "Legal translation executed with Mexican Civil Registry terminology memory active."
  },
  {
    id: 5,
    name: "Vector Layout Reconstructor",
    codename: "AGENT-05 // REFLOW",
    role: "Dynamically reflows target language into exact source dimensions without overlap.",
    icon: Layers,
    metric: "0px Shift",
    badge: "Auto-Reflow",
    status: "verified",
    log: "Font metrics adapted. Text boxes expanded without collisions. Baseline alignment preserved."
  },
  {
    id: 6,
    name: "Notarial Certification Engine",
    codename: "AGENT-06 // JURAT",
    role: "Attaches statutory ATA translator affidavit, corporate seal, and authorized signature.",
    icon: Stamp,
    metric: "8 CFR § 103.2",
    badge: "ATA #278190",
    status: "verified",
    log: "Certified translator jurat attached. Corporate registration verified and stamped."
  },
  {
    id: 7,
    name: "Autonomous Court QC Gate",
    codename: "AGENT-07 // AUDIT",
    role: "Rigorous 14-point compliance inspection verifying dates, numbers, and names.",
    icon: ShieldCheck,
    metric: "14/14 Pass",
    badge: "Zero RFE",
    status: "verified",
    log: "Name & date consistency audit passed. Zero digit drift across 18 legal fields."
  },
  {
    id: 8,
    name: "Cryptographic Attestation",
    codename: "AGENT-08 // IMMUTABLE",
    role: "Mints SHA-256 tamper-evident hash and dynamic public verification QR code.",
    icon: Award,
    metric: "SHA-256",
    badge: "Blockchain-Grade",
    status: "verified",
    log: "Cryptographic hash sealed: 89f4b1...2b1. Public verification portal URL embedded."
  }
];

export function AwwwardsPipeline() {
  const [selectedAgent, setSelectedAgent] = useState<number>(4);
  const activeAgent = AGENTS.find((a) => a.id === selectedAgent) || AGENTS[3];

  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden border-y border-slate-800">
      {/* Background Architectural Grid */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }}
      />
      
      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono font-bold tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              <span>THE 8-AGENT NEURAL PIPELINE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Granular state elegance. <br />
              <span className="text-slate-400 font-serif italic font-normal">
                Zero black boxes. Zero generic spinners.
              </span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-400 max-w-md font-normal leading-relaxed">
            Every legal document traverses eight dedicated, autonomous specialized AI agents. Inspect any stage in real-time with sub-millisecond telemetry.
          </p>
        </div>

        {/* Pipeline Stage Navigator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-10">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const isSelected = agent.id === selectedAgent;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer relative group flex flex-col justify-between h-32 ${
                  isSelected
                    ? "bg-slate-800/90 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.3)] ring-1 ring-blue-500"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  </span>
                </div>
                
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">
                    0{agent.id}
                  </div>
                  <div className={`text-xs font-bold truncate mt-0.5 ${isSelected ? "text-white" : "text-slate-300"}`}>
                    {agent.name.split(" ")[0]}
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    layoutId="activeAgentTab"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-500 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Agent Telemetry Display Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAgent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-6 sm:p-8 rounded-2xl bg-slate-850/80 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Agent Overview */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold">
                    {activeAgent.codename}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                    STATUS: ACTIVE // VERIFIED
                  </span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {activeAgent.name}
                </h3>
                
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  {activeAgent.role}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                    <span className="text-slate-400 block text-[10px] font-mono uppercase">Key Benchmark</span>
                    <span className="text-white font-bold font-mono text-sm">{activeAgent.metric}</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                    <span className="text-slate-400 block text-[10px] font-mono uppercase">Certification Seal</span>
                    <span className="text-blue-400 font-bold font-mono text-sm">{activeAgent.badge}</span>
                  </div>
                </div>
              </div>

              {/* Terminal Log Console */}
              <div className="lg:col-span-5 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-slate-500">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    <span>AGENT_EXECUTION_STREAM.LOG</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 animate-pulse">● LIVE</span>
                </div>
                <div className="space-y-2 text-slate-400 text-[11px] leading-relaxed">
                  <div className="text-slate-500">[{new Date().toISOString().substring(11, 19)}] Spawning thread pid:28104</div>
                  <div className="text-blue-400">&gt; EXEC_TASK: {activeAgent.codename}</div>
                  <div className="text-emerald-300">&gt; RESULT: {activeAgent.log}</div>
                  <div className="text-slate-500">&gt; QUALITY_GATE: PASS [14/14 invariants verified]</div>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
