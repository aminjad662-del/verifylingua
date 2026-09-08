"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, ArrowRight, ShieldCheck, Briefcase } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
      {/* Editorial Title & Narrative */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-mono font-bold text-brand-ink">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>USCIS 8 CFR § 103.2 Vault Active</span>
          <span className="text-text-muted">•</span>
          <span className="text-text-muted font-normal">ATA Corporate Member No. 271892</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-brand-ink font-display leading-[1.08]">
          Manage official evidence <br className="hidden sm:inline" />
          <span className="italic font-normal font-serif text-text-muted">with zero rejection risk.</span>
        </h1>

        <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-2xl">
          Track certified immigration translation pipelines, launch the Interactive Proofing Studio, and export court-ready exhibit packets with tamper-proof cryptographic seals.
        </p>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center gap-3.5 shrink-0">
        <Button asChild variant="outline" size="lg" className="h-12 px-5 rounded-2xl text-xs font-bold gap-2 border-border bg-surface hover:bg-surface-raised">
          <Link href="/counsel">
            <Briefcase className="w-4 h-4 text-brand-500" />
            <span>CounselDesk™ Portal</span>
          </Link>
        </Button>

        <MagneticButton maxPull={9}>
          <Button asChild size="lg" className="h-12 px-6 rounded-2xl font-black text-xs gap-2.5 bg-neutral-950 hover:bg-neutral-800 text-white shadow-lg shadow-neutral-950/10">
            <Link href="/order/triage">
              <Plus className="w-4 h-4" />
              <span>Start New Translation</span>
            </Link>
          </Button>
        </MagneticButton>
      </div>
    </div>
  );
}
