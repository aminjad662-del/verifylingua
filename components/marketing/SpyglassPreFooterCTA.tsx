"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function SpyglassPreFooterCTA() {
  return (
    <section className="relative pt-16 pb-0 overflow-hidden bg-canvas">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Obsidian Dark Pill Container matching Spyglass reference */}
        <div className="relative rounded-3xl p-10 sm:p-16 md:p-20 bg-brand-ink text-white border border-white/10 text-center space-y-8 overflow-hidden shadow-2xl">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/20 blur-[120px]" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/5 text-brand-300 text-xs font-mono font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-brand-300" />
            <span>USCIS & Federal Court Guaranteed</span>
          </div>

          {/* Headline matching "Stop screen recording at midnight" */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.05]">
              Stop worrying about USCIS rejection notices at midnight.
            </h2>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              Upload your documents now. Receive sworn certified translations with guaranteed legal acceptance in as fast as 12 hours.
            </p>
          </div>

          {/* Magnetic Stark White Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/order/triage"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white hover:bg-white/90 text-brand-ink text-base font-bold shadow-lg transition-transform active:scale-95"
            >
              <span>Start Certified Translation</span>
              <ArrowRight className="w-5 h-5 text-brand-ink" />
            </Link>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono text-white/60">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              100% Guaranteed Acceptance
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-300" />
              256-Bit Encrypted & HIPAA Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Dual Human ATA Certification
            </span>
          </div>
        </div>
      </div>

      {/* Massive Subtle Watermark Typography matching Spyglass reference */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none pt-12 -mb-6 sm:-mb-10 text-center">
        <span className="block text-[6rem] sm:text-[10rem] md:text-[15rem] lg:text-[18rem] font-black tracking-tighter uppercase text-brand-ink/[0.04] leading-none whitespace-nowrap font-display">
          verifylingua
        </span>
      </div>
    </section>
  );
}
