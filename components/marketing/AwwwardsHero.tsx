"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Star,
  Sparkles,
  ChevronRight,
  FileUp,
  FileCheck2,
  Lock,
  Stamp,
  Award
} from "lucide-react";
import { InspectionStage } from "./InspectionStage";

const SPRING_TACTILE = { type: "spring", stiffness: 400, damping: 28, mass: 0.8 } as const;
const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] as const }
  })
};

export function AwwwardsHero() {
  const [quickInput, setQuickInput] = useState("");

  return (
    <section className="relative w-full pt-28 sm:pt-32 pb-20 sm:pb-28 overflow-hidden bg-canvas text-brand-ink border-b border-black/[0.06]">
      {/* Subtle Architectural Micro-Grid Backdrop */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(12,17,29,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(12,17,29,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />
      
      {/* Warm Ambient Notarial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[400px] bg-gradient-to-b from-amber-500/[0.04] via-amber-500/[0.01] to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Bespoke Editorial Typography & Actions */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
            
            {/* Status Pill Badge */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={FADE_UP}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-900/10 bg-amber-500/[0.08] text-amber-950 text-[11px] font-mono font-semibold tracking-wider shadow-2xs"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
              </span>
              <span>USCIS 8 CFR § 103.2 COMPLIANT</span>
              <span className="text-amber-900/30">|</span>
              <span className="text-amber-900 font-bold">100% COURT ADMISSIBLE</span>
            </motion.div>

            {/* Main Editorial Display Headline */}
            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={FADE_UP}
              className="space-y-3.5"
            >
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-[-0.03em] text-brand-ink leading-[1.07]">
                Certified translations{" "}
                <span className="font-serif italic font-normal text-amber-950/90 block mt-1.5">
                  with authentic layout preservation.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl font-normal">
                Autonomous vector-level translation engineered for immigration attorneys, federal courts, and global universities. Never retypes. Never collapses complex tables. Delivers cryptographically verifiable legal PDFs in under 90 seconds.
              </p>
            </motion.div>

            {/* High-Contrast Action Cluster (Nested Button Architecture) */}
            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={FADE_UP}
              className="flex flex-wrap items-center gap-3 pt-1 w-full sm:w-auto"
            >
              <Link href="/order/triage">
                <motion.button
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING_TACTILE}
                  className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-brand-ink hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-[0_12px_28px_-6px_rgba(12,17,29,0.35)] flex items-center gap-3 transition-all cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Upload & Translate Document</span>
                  <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </motion.button>
              </Link>
              
              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING_TACTILE}
                  className="px-5 sm:px-6 py-3.5 sm:py-4 rounded-full border border-black/[0.09] bg-white/80 hover:bg-white text-neutral-800 text-xs sm:text-sm font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Pricing ($0.30/pg)</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Quick Interactive Document Triage Input */}
            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={FADE_UP}
              className="w-full max-w-lg pt-1"
            >
              <div className="relative flex items-center bg-white border border-black/[0.08] rounded-2xl p-1.5 shadow-2xs focus-within:border-amber-600/40 focus-within:ring-2 focus-within:ring-amber-500/10 transition-all">
                <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center ml-1.5 shrink-0">
                  <FileUp className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Drop legal PDF or enter document format (e.g. Mexican Birth Certificate)..."
                  className="w-full bg-transparent px-3 py-1.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-sans"
                />
                <Link
                  href={quickInput ? `/order/triage?q=${encodeURIComponent(quickInput)}` : "/order/triage"}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-ink hover:bg-slate-800 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-2xs"
                >
                  <span>Triage</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>

            {/* Social Proof & Trust Badges */}
            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={FADE_UP}
              className="flex flex-wrap items-center gap-3.5 pt-2 text-xs font-mono text-neutral-500"
            >
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-brand-ink">4.98/5 Rating</span>
              <span className="text-neutral-300">|</span>
              <span className="text-neutral-700 font-semibold">2,400+ Law Firms</span>
              <span className="text-neutral-300">|</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% USCIS Acceptance
              </span>
            </motion.div>

          </div>

          {/* Right Column: High-Precision Interactive Inspection Stage */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <InspectionStage />
          </div>

        </div>
      </div>
    </section>
  );
}
