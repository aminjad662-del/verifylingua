"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export function PreFooterCTA() {
  return (
    <section className="py-20 sm:py-28 bg-surface border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface-raised shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
            USCIS 8 CFR § 103.2 Compliant
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-ink leading-tight">
            Ready to submit court-ready translations?
          </h2>
          <p className="text-base sm:text-lg text-text-muted leading-relaxed">
            Upload your foreign birth certificates, marriage decrees, or academic records now for sworn ATA certification and tamper-evident sealing under 24 hours.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link
            href="/order/triage"
            className="h-12 px-7 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span>Start Certified Translation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/counsel"
            className="h-12 px-6 rounded-xl border border-border bg-surface-raised hover:bg-surface text-text font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>Institutional Firm Portal</span>
          </Link>
        </div>

        {/* Micro Trust Strip */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
            100% USCIS Acceptance Guarantee
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
            ATA Corporate Member No. 278190
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
            Zero-Knowledge Privacy Vault
          </span>
        </div>

      </div>
    </section>
  );
}
