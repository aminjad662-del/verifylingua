"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export function FinalCTA() {
  return (
    <section className="w-full bg-slate-900 text-white py-24 px-6 relative overflow-hidden">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />
      
      {/* Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/15 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono font-bold tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ZERO RISK • 100% USCIS MONEY-BACK GUARANTEE</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Ready to file your translation <br />
          <span className="text-slate-400 font-serif italic font-normal">
            with absolute confidence?
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
          Upload any legal record now. Receive a verified, ATA-certified translation with authentic formatting in under 90 seconds.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/order/triage">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-[0_8px_25px_rgba(37,99,235,0.35)] flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Start Instant Translation</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
          
          <Link href="/help">
            <button className="h-14 px-6 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-colors cursor-pointer">
              Speak with Compliance Specialist
            </button>
          </Link>
        </div>

        <div className="pt-4 text-xs font-mono text-slate-500">
          No credit card required to inspect document • 2,400+ law firms trust VerifyLingua
        </div>
      </div>
    </section>
  );
}
