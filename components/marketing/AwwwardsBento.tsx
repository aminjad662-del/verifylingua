"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Zap,
  Lock,
  Stamp,
  Maximize2,
  FileCheck2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  QrCode,
  FileText
} from "lucide-react";
import Link from "next/link";
import { springConfig } from "@/lib/motion";

export function AwwwardsBento() {
  return (
    <section className="py-24 sm:py-28 bg-obsidian-900 border-t border-white/[0.08] relative overflow-hidden text-white">
      {/* Background Architectural Grid */}
      <div 
        className="absolute inset-0 opacity-[0.25] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs font-mono font-semibold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>USCIS &amp; FEDERAL COURT STANDARDS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-[-0.03em] leading-tight">
            Engineered for zero court rejections.
          </h2>
          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal">
            Every file translation is backed by our ATA Corporate Member accreditation and an unconditional 100% money-back USCIS acceptance guarantee.
          </p>
        </div>

        {/* Bento Grid Architecture with Double-Bezel Framing */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 text-left">
          
          {/* Card 1: 8 CFR § 103.2 Admissibility (Col 7) */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={springConfig}
            className="md:col-span-7 rounded-2xl p-1.5 bg-obsidian-950 border border-white/[0.08] shadow-2xs group"
          >
            <div className="rounded-xl p-6 sm:p-8 bg-obsidian-900/90 border border-white/[0.06] flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 font-bold">
                  <Stamp className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  USCIS 8 CFR § 103.2(b)(3) Compliance
                </h3>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  Includes statutory certification affidavit of translator competence, permanent corporate registry seals, notary jurat, and cryptographic timestamp required by immigration judges and federal adjudicators.
                </p>
              </div>

              <div className="pt-5 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-neutral-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ready for immediate filing
                </span>
                <span className="bg-white/5 px-2.5 py-1 rounded-md text-neutral-300 font-semibold border border-white/[0.08]">
                  ATA Seal ID 278190
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Vector Layout Integrity (Col 5) */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={springConfig}
            className="md:col-span-5 rounded-2xl p-1.5 bg-obsidian-950 border border-white/[0.08] shadow-2xs group"
          >
            <div className="rounded-xl p-6 sm:p-8 bg-obsidian-900/90 border border-white/[0.06] flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 text-white flex items-center justify-center border border-white/[0.08] font-bold">
                  <Maximize2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Sub-Pixel Layout Lock
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Tables, stamps, signatures, and multi-column forms remain in exact 1:1 coordinates. Zero overlapping text, zero collapsed margins.
                </p>
              </div>

              <div className="pt-5 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-neutral-400">
                <span className="text-neutral-300 font-semibold">Max deviation: &lt; 0.1mm</span>
                <span className="text-amber-400 font-bold">1:1 Geometry</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: 90-Second Turnaround (Col 4) */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={springConfig}
            className="md:col-span-4 rounded-2xl p-1.5 bg-obsidian-950 border border-white/[0.08] shadow-2xs"
          >
            <div className="rounded-xl p-6 bg-obsidian-900/90 border border-white/[0.06] flex flex-col justify-between h-full space-y-5">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 font-bold">
                  <Zap className="w-4.5 h-4.5 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  90-Second Turnaround
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Skip traditional 48-hour agencies. Autonomous neural processing translates and certifies multi-page records in seconds.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] text-xs font-mono text-amber-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant PDF Download</span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Cryptographic Verification (Col 4) */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={springConfig}
            className="md:col-span-4 rounded-2xl p-1.5 bg-obsidian-950 border border-white/[0.08] shadow-2xs"
          >
            <div className="rounded-xl p-6 bg-obsidian-900/90 border border-white/[0.06] flex flex-col justify-between h-full space-y-5">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 text-white flex items-center justify-center border border-white/[0.08] font-bold">
                  <QrCode className="w-4.5 h-4.5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Public Verification Portal
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Every certified PDF embeds an immutable SHA-256 hash. Government officials scan the QR code to verify validity in real-time.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] text-xs font-mono text-neutral-300 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SHA-256 Tamper-Proof</span>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Strict Data Security (Col 4) */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={springConfig}
            className="md:col-span-4 rounded-2xl p-1.5 bg-obsidian-950 border border-white/[0.08] shadow-2xs"
          >
            <div className="rounded-xl p-6 bg-obsidian-900/90 border border-white/[0.06] flex flex-col justify-between h-full space-y-5">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 font-bold">
                  <Lock className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Bank-Grade Vault Isolation
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  AES-256 encryption at rest and in transit. Your documents are never used for AI foundation training or external retention.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Data Retention Mode</span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
