"use client";

import * as React from "react";
import { useState } from "react";
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
    badge: "ATA ID 278190",
    status: "verified",
    log: "Certified translator jurat attached. Corporate registration verified and stamped."
  },
  {
    id: 7,
    name: "Cryptographic Proof Seal",
    codename: "AGENT-07 // PROOF",
    role: "Generates SHA-256 hash digest, permanent tamper-evident ledger entry, and QR audit badge.",
    icon: ShieldCheck,
    metric: "SHA-256",
    badge: "Zero-Tamper",
    status: "verified",
    log: "Cryptographic hash sealed: 89f4b1...2b1. Public verification portal URL embedded."
  },
  {
    id: 8,
    name: "Vault Delivery Gateway",
    codename: "AGENT-08 // DELIVER",
    role: "Publishes presigned 900s authenticated download URLs and syncs with CounselDesk™ portal.",
    icon: Award,
    metric: "Instant PDF",
    badge: "Court Ready",
    status: "verified",
    log: "Delivery payload assembled. AES-256 encrypted archive dispatched to user vault."
  }
];

export function AwwwardsPipeline() {
  const [selectedAgent, setSelectedAgent] = useState<number>(4);
  const activeAgent = AGENTS.find((a) => a.id === selectedAgent) || AGENTS[3];

  return (
    <section className="py-24 sm:py-28 bg-obsidian-950 text-white relative overflow-hidden border-t border-white/[0.08]">
      {/* Background Architectural Micro-Grid */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />
      
      {/* Warm Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-amber-500/[0.04] blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs font-mono font-semibold tracking-wider">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>THE 8-AGENT NEURAL PIPELINE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white leading-tight">
              Granular state elegance. <br />
              <span className="text-neutral-400 font-serif italic font-normal">
                Zero black boxes. Zero generic spinners.
              </span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-neutral-400 max-w-md font-normal leading-relaxed">
            Every legal document traverses eight dedicated, autonomous specialized AI agents. Inspect any stage in real-time with sub-millisecond telemetry.
          </p>
        </div>

        {/* Pipeline Stage Navigator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-8">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const isSelected = agent.id === selectedAgent;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer relative group flex flex-col justify-between h-30 ${
                  isSelected
                    ? "bg-neutral-800/90 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/40"
                    : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected ? "bg-amber-500 text-neutral-950 font-bold" : "bg-neutral-800 text-neutral-400 group-hover:text-neutral-200"
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  </span>
                </div>
                
                <div>
                  <div className="text-[9.5px] font-mono uppercase tracking-wider text-neutral-500 font-medium">
                    0{agent.id}
                  </div>
                  <div className={`text-xs font-bold truncate mt-0.5 ${isSelected ? "text-white" : "text-neutral-300"}`}>
                    {agent.name.split(" ")[0]}
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    layoutId="activeAgentTab"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-400 rounded-full"
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
            transition={{ duration: 0.25 }}
            className="p-5 sm:p-7 rounded-2xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Agent Overview */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                    {activeAgent.codename}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                    STATUS: ACTIVE // VERIFIED
                  </span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {activeAgent.name}
                </h3>
                
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
                  {activeAgent.role}
                </p>

                <div className="flex flex-wrap gap-3 pt-1">
                  <div className="px-3.5 py-2 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-xs">
                    <span className="text-neutral-400 block text-[10px] font-mono uppercase">Key Benchmark</span>
                    <span className="text-white font-bold font-mono text-sm">{activeAgent.metric}</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-xs">
                    <span className="text-neutral-400 block text-[10px] font-mono uppercase">Certification Seal</span>
                    <span className="text-amber-300 font-bold font-mono text-sm">{activeAgent.badge}</span>
                  </div>
                </div>
              </div>

              {/* Terminal Log Console */}
              <div className="lg:col-span-5 bg-obsidian-950 rounded-xl border border-white/[0.08] p-4 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08] mb-3 text-neutral-400">
                  <div className="flex items-center gap-2 text-[11px]">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    <span>AGENT_TELEMETRY.LOG</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 animate-pulse">● LIVE STREAM</span>
                </div>
                <div className="space-y-1.5 text-neutral-400 text-[11px] leading-relaxed">
                  <div className="text-neutral-500">[{new Date().toISOString().substring(11, 19)}] Thread active pid:28104</div>
                  <div className="text-amber-300">&gt; EXEC_TASK: {activeAgent.codename}</div>
                  <div className="text-emerald-300">&gt; VERDICT: {activeAgent.log}</div>
                  <div className="text-neutral-500">&gt; QUALITY_GATE: PASS [14/14 statutory checks verified]</div>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
