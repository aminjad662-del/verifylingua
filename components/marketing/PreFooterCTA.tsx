"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, CheckCircle2, QrCode, FileText } from "lucide-react";

export function PreFooterCTA() {
  return (
    <section className="py-24 sm:py-32 bg-surface border-b border-border/80 relative overflow-hidden">
      {/* Background ambient architectural lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-9">
        
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border bg-surface-raised shadow-xs">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
            USCIS 8 CFR § 103.2(b)(3) GUARANTEED
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-brand-ink leading-[1.08]">
            Ready to submit <span className="font-serif italic font-normal text-brand-700">court-ready</span> certified translations?
          </h2>
          <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto">
            Upload your foreign birth certificates, marriage licenses, or academic transcripts now for sworn ATA certification and tamper-evident sealing in under 24 hours.
          </p>
        </div>

        {/* Action Buttons with Emil Kowalski press physics */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link
            href="/order/triage"
            className="h-12 px-8 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all duration-150 active:scale-[0.975] cursor-pointer group"
          >
            <span>Start Certified Translation</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/counsel"
            className="h-12 px-7 rounded-xl border border-border bg-surface-raised hover:bg-surface text-text font-semibold text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all duration-150 active:scale-[0.975] cursor-pointer"
          >
            <span>Institutional Law Firm Portal</span>
          </Link>
        </div>

        {/* Micro Trust Strip */}
        <div className="pt-6 border-t border-border/60 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-text-muted font-medium">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-court-emerald shrink-0" />
            <span>100% USCIS Acceptance Guarantee</span>
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-court-emerald shrink-0" />
            <span>ATA Corporate Member No. 278190</span>
          </span>
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-court-emerald shrink-0" />
            <span>Zero-Knowledge Privacy Vault</span>
          </span>
        </div>

      </div>
    </section>
  );
}