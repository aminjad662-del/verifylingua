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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-brand-300 text-xs font-mono font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-brand-300" />
            <span>USCIS & Federal Court Guaranteed</span>
          </div>

          {/* Headline matching 'Stop screenshotting at midnight' */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white font-display leading-[1.04]">
              Stop translating <br />
              <span className="font-serif italic font-normal text-brand-300 block mt-1">
                at midnight.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
              Upload your legal documents now. Receive certified, court-ready translations with notarized affidavit in as fast as 12 hours.
            </p>
          </div>

          {/* Magnetic Stark White Button matching Spyglass */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/order/triage"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full bg-white hover:bg-white/90 text-brand-ink text-base font-bold shadow-xl transition-all duration-200 active:scale-95 group"
            >
              <span>Start Certified Translation</span>
              <ArrowRight className="w-5 h-5 text-brand-ink group-hover:translate-x-1 transition-transform" />
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

      {/* Massive Subtle Watermark Typography matching Spyglass reference in lowercase */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none pt-12 -mb-8 sm:-mb-14 text-center">
        <span className="block text-[6rem] sm:text-[10rem] md:text-[15rem] lg:text-[18rem] font-black tracking-tighter lowercase text-brand-ink/[0.04] leading-none whitespace-nowrap font-display">
          verifylingua
        </span>
      </div>
    </section>
  );
}
