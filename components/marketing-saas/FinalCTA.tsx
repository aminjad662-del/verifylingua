"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { springConfig } from "@/lib/motion";

export function FinalCTA() {
  return (
    <section className="w-full bg-obsidian-950 text-white py-24 sm:py-28 px-4 sm:px-6 relative overflow-hidden border-t border-white/[0.08]">
      {/* Background Architectural Grid */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />
      
      {/* Subtle Warm Brass Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/[0.05] blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs font-mono font-semibold tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>ZERO RISK • 100% USCIS MONEY-BACK GUARANTEE</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-[-0.03em] text-white leading-tight font-display">
          Ready to file your translation <br />
          <span className="text-amber-300/90 font-serif italic font-normal">
            with absolute confidence?
          </span>
        </h2>

        <p className="text-base sm:text-lg text-neutral-300 max-w-xl font-normal leading-relaxed">
          Upload any legal record now. Receive a verified, ATA-certified translation with authentic formatting in under 90 seconds.
        </p>

        <div className="pt-3 flex flex-col sm:flex-row items-center gap-3.5">
          <Link href="/order/triage">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={springConfig}
              className="h-14 px-8 rounded-full bg-white hover:bg-neutral-100 text-obsidian-950 font-bold text-sm sm:text-base shadow-[0_12px_32px_rgba(255,255,255,0.15)] flex items-center gap-3 transition-all cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Start Instant Translation</span>
              <div className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 text-obsidian-950" />
              </div>
            </motion.button>
          </Link>
          
          <Link href="/help">
            <button className="h-14 px-7 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-neutral-200 font-semibold text-sm transition-all cursor-pointer">
              Speak with Compliance Specialist
            </button>
          </Link>
        </div>

        <div className="pt-3 text-xs font-mono text-neutral-500">
          No credit card required to inspect document • 2,400+ law firms trust VerifyLingua
        </div>
      </div>
    </section>
  );
}
