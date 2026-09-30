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
  Search,
  Sparkles,
  FileCheck2,
  Lock,
  ChevronRight
} from "lucide-react";
import { InspectionStage } from "./InspectionStage";

const SPRING_TACTILE = { type: "spring", stiffness: 400, damping: 28, mass: 0.8 } as const;
const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const }
  })
};

export function AwwwardsHero() {
  const [quickInput, setQuickInput] = useState("");

  return (
    <section className="relative w-full pt-28 pb-20 overflow-hidden bg-white text-slate-900 border-b border-slate-200/80">
      {/* Subtle Structural 1px Grid Backdrop */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage: "linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)",
          backgroundSize: "64px 64px"
        }}
      />
      
      {/* Subtle Radial Atmosphere (Calibrated High-Density Navy Accent) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-blue-50/80 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Bespoke Editorial Typography & Actions */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
            
            {/* Status Pill Badge */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={FADE_UP}
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/60 backdrop-blur-md text-blue-900 text-[11px] font-mono font-semibold tracking-wider shadow-xs"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
              </span>
              <span>USCIS 8 CFR § 103.2 COMPLIANT</span>
              <span className="text-blue-300">|</span>
              <span className="text-blue-700 font-bold">100% COURT ADMISSIBLE</span>
            </motion.div>

            {/* Main Editorial Display Headline */}
            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={FADE_UP}
              className="space-y-3"
            >
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
                Certified translations <br />
                <span className="font-serif italic font-normal text-slate-700 block mt-1">
                  with authentic layout preservation.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
                Autonomous vector-level translation engineered for immigration, federal courts, and global universities. Never retypes. Never collapses tables. Delivers cryptographically verifiable legal PDFs in under 90 seconds.
              </p>
            </motion.div>

            {/* High-Contrast Action Cluster */}
            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={FADE_UP}
              className="flex flex-wrap items-center gap-3 pt-2 w-full sm:w-auto"
            >
              <Link href="/order/triage">
                <motion.button
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING_TACTILE}
                  className="px-7 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-[0_8px_20px_rgba(37,99,235,0.25)] flex items-center gap-2.5 transition-colors cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Upload & Translate Document</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING_TACTILE}
                  className="px-6 py-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <span>Explore Pricing ($0.30/pg)</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Quick Interactive Search / Drop Pre-check */}
            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={FADE_UP}
              className="w-full max-w-lg pt-1"
            >
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Drop file or check document format (e.g. Mexican Birth Certificate)..."
                  className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <Link
                  href={quickInput ? `/order/triage?q=${encodeURIComponent(quickInput)}` : "/order/triage"}
                  className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
                >
                  Inspect
                </Link>
              </div>
            </motion.div>

            {/* Social Proof & Guarantees */}
            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={FADE_UP}
              className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-slate-500"
            >
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-slate-900">4.98/5 Rating</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-700 font-semibold">2,400+ Law Firms</span>
              <span className="text-slate-300">|</span>
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
