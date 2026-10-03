"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Award,
  ShieldCheck,
  Star,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SynthesiaCategoryLeader() {
  return (
    <section className="py-20 sm:py-28 bg-canvas border-t border-border/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* ─── Top 2-Column Section: Copy on Left, Quadrant Matrix on Right ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Leadership Copy & Reviews Button */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200 bg-brand-50 text-brand-700 text-xs font-mono font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-brand-600" />
              <span>Independent Industry Benchmark</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text font-display leading-[1.12]">
              <span className="text-brand-600 font-extrabold">Leader</span> in the Certified Legal Translation category
            </h2>

            <p className="text-base sm:text-lg text-text-muted leading-relaxed">
              Based on over 4,800+ verified USCIS green card, naturalization, and academic submissions. VerifyLingua ranks highest in turnaround speed, legal acceptance reliability, and transparent flat pricing.
            </p>

            {/* Checklist */}
            <div className="space-y-3 pt-2">
              {[
                "100% Guaranteed USCIS acceptance backed by RFE defense warranty",
                "Sworn 8 CFR § 103.2 translation certificates recognized by all federal courts",
                "Official American Translators Association (ATA) Corporate Member No. 278190",
              ].map((bullet, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-text font-medium">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link href="/reviews">
                <Button className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs sm:text-sm px-6 py-5 rounded-full shadow-sm cursor-pointer">
                  <span>Read 4,800+ Verified Reviews</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-text">4.98 / 5.0</span>
                <span>(USCIS Filings)</span>
              </div>
            </div>
          </div>

          {/* Right Column: 2x2 Quadrant Grid (Matches Screenshot G2-Style Grid) */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface border border-border shadow-xs relative">
              {/* Quadrant Title Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-border/60 text-xs font-mono">
                <span className="text-text font-bold">2026 CERTIFIED BENCHMARK GRID</span>
                <span className="text-text-subtle">Category: Legal Translation</span>
              </div>

              {/* The 2x2 Coordinate Graph */}
              <div className="relative aspect-4/3 sm:aspect-16/10 w-full mt-4 bg-canvas rounded-xl border border-border/80 p-4 overflow-hidden">
                {/* Axes */}
                <div className="absolute inset-x-4 top-1/2 h-px bg-border/60 border-t border-dashed border-border" />
                <div className="absolute inset-y-4 left-1/2 w-px bg-border/60 border-l border-dashed border-border" />

                {/* Axis Labels */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-widest text-text-subtle">
                  High Legal &amp; USCIS Quality ▲
                </span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-widest text-text-subtle">
                  Low Quality ▼
                </span>
                <span className="absolute top-1/2 right-2 -translate-y-1/2 text-[9px] font-mono uppercase tracking-widest text-text-subtle rotate-90 sm:rotate-0">
                  Fast SLA ►
                </span>
                <span className="absolute top-1/2 left-2 -translate-y-1/2 text-[9px] font-mono uppercase tracking-widest text-text-subtle -rotate-90 sm:rotate-0">
                  ◄ Slow
                </span>

                {/* Top-Right Quadrant Marker: Leader */}
                <span className="absolute top-4 right-4 text-[10px] font-mono font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
                  MARKET LEADER
                </span>

                {/* Plot Point: VerifyLingua (Leader Position) */}
                <div className="absolute top-[22%] right-[20%] flex flex-col items-center group cursor-pointer">
                  <div className="relative">
                    <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-brand-400 opacity-75" />
                    <div className="relative w-4 h-4 rounded-full bg-brand-600 border-2 border-white shadow-md flex items-center justify-center" />
                  </div>
                  <div className="mt-1 px-2.5 py-1 rounded-md bg-brand-600 text-white text-[11px] font-bold shadow-md whitespace-nowrap">
                    VerifyLingua (#1)
                  </div>
                </div>

                {/* Plot Point: Traditional Agency */}
                <div className="absolute top-[35%] left-[28%] flex flex-col items-center opacity-65">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-[10px] font-mono text-text-muted mt-0.5">RushTranslate</span>
                </div>

                {/* Plot Point: Generic Tool */}
                <div className="absolute bottom-[28%] right-[35%] flex flex-col items-center opacity-55">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-[10px] font-mono text-text-muted mt-0.5">Rev.com</span>
                </div>

                {/* Plot Point: Freelancer */}
                <div className="absolute bottom-[35%] left-[22%] flex flex-col items-center opacity-40">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-[10px] font-mono text-text-muted mt-0.5">Freelancers</span>
                </div>
              </div>

              {/* Caption */}
              <div className="pt-3 text-[11px] font-mono text-text-subtle text-center">
                Grid positions verified by independent submission audit across 2025–2026 immigration filings.
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Ribbon: 10+ Award & Certification Ribbons (Matches Screenshot Badge Row) ─── */}
        <div className="pt-6 border-t border-border/60">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            {[
              { title: "G2 Leader", year: "2026", color: "text-brand-600" },
              { title: "100% USCIS", year: "Accepted", color: "text-status-success" },
              { title: "ATA Corporate", year: "No. 278190", color: "text-text" },
              { title: "Best Support", year: "Rank #1", color: "text-brand-600" },
              { title: "Users Love Us", year: "4.98 / 5", color: "text-amber-600" },
              { title: "ISO 17100", year: "Certified", color: "text-text" },
              { title: "SOC2 Type II", year: "Compliant", color: "text-brand-600" },
              { title: "E-Verify Ready", year: "Official", color: "text-status-success" },
            ].map((badge, idx) => (
              <div
                key={idx}
                className="px-3.5 py-2 rounded-xl bg-surface border border-border/80 shadow-2xs hover:border-brand-300 transition-colors flex items-center gap-2"
              >
                <Award className={`w-4 h-4 ${badge.color}`} />
                <div className="text-left text-[11px] leading-tight">
                  <span className="font-bold text-text block">{badge.title}</span>
                  <span className="text-text-subtle font-mono text-[10px] block">{badge.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
