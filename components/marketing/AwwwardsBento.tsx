"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Zap,
  Lock,
  Stamp,
  Maximize2,
  FileCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

const SPRING_CARD = { type: "spring", stiffness: 350, damping: 26, mass: 0.9 } as const;

export function AwwwardsBento() {
  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-800 text-xs font-mono font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>USCIS & FEDERAL COURT STANDARDS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Engineered for zero court rejections.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Every file translation is backed by our ATA Corporate Member accreditation and an unconditional 100% money-back USCIS acceptance guarantee.
          </p>
        </div>

        {/* Bento Grid Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: 8 CFR § 103.2 Admissibility (Col 7) */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={SPRING_CARD}
            className="md:col-span-7 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 font-bold">
                <Stamp className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                USCIS 8 CFR § 103.2(b)(3) Compliance
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Includes statutory certification affidavit of translator competence, permanent corporate registry seals, notary jurat, and cryptographic timestamp required by immigration judges and federal adjudicators.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Ready for immediate filing
              </span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-semibold">
                ATA Seal #278190
              </span>
            </div>
          </motion.div>

          {/* Card 2: Vector Layout Integrity (Col 5) */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={SPRING_CARD}
            className="md:col-span-5 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 font-bold">
                <Maximize2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Sub-Pixel Layout Lock
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tables, stamps, signatures, and multi-column forms remain in exact 1:1 coordinates. Zero overlapping text, zero collapsed margins.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="text-slate-700 font-semibold">Max deviation: &lt; 0.2mm</span>
              <span className="text-blue-600 font-bold">1:1 Geometry</span>
            </div>
          </motion.div>

          {/* Card 3: 90-Second Turnaround (Col 4) */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={SPRING_CARD}
            className="md:col-span-4 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                90-Second Turnaround
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Skip traditional 48-hour agencies. Autonomous neural processing translates and certifies multi-page records in seconds.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-mono text-amber-700 font-bold">
              ⚡ Instant Download Available
            </div>
          </motion.div>

          {/* Card 4: Cryptographic Verification (Col 4) */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={SPRING_CARD}
            className="md:col-span-4 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Public Verification Portal
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every certified PDF embeds an immutable SHA-256 hash. Government officials scan the QR code to verify validity in real-time.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-mono text-purple-700 font-bold">
              🔒 SHA-256 Tamper-Proof
            </div>
          </motion.div>

          {/* Card 5: Strict Data Security (Col 4) */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={SPRING_CARD}
            className="md:col-span-4 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Bank-Grade Vault Isolation
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                AES-256 encryption at rest and in transit. Your documents are never used for AI foundation training or external retention.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-mono text-emerald-700 font-bold">
              🛡️ Zero Data Retention Mode
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
