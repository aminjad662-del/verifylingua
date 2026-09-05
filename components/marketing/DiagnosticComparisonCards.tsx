"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DiagnosticComparisonCards() {
  return (
    <section className="py-16 md:py-24 bg-surface border-b border-border/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Section Heading with Editorial Subhead */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200/60 bg-brand-50 text-brand-500 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>The Reality of Certified Translation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-ink tracking-tight font-display">
            Why Standard Translations Get Rejected by USCIS.
          </h2>

          <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
            Most rejection notices aren&apos;t caused by vocabulary mistakes. They are triggered by
            unreadable scans, missing marginal notations, and misspelled passport names.
          </p>
        </div>

        {/* 2-Column Side-by-Side Diagnostic Cards (Sunsama Reference Pattern) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Column A: Traditional Agencies & Generic AI */}
          <div className="p-8 sm:p-10 rounded-[var(--r-2xl)] bg-canvas border border-status-danger/20 shadow-sm flex flex-col justify-between space-y-8 relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-status-danger/10 border border-status-danger/20 flex items-center justify-center text-status-danger">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="border-status-danger/30 text-status-danger text-xs font-mono font-bold">
                  Legacy Agency Pitfalls
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-brand-ink font-display">
                  Slow, Unpredictable &amp; Fragile
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Incumbents collect upfront payments on blurry scans, outsource to unverified freelancers,
                  and deliver plain text with destroyed table formatting.
                </p>
              </div>

              <div className="space-y-4 pt-2 divide-y divide-border/60">
                <div className="flex items-start gap-3 pt-3">
                  <XCircle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-brand-ink">Silent Transliteration Drift</p>
                    <p className="text-xs text-ink-softer">
                      Names are guessed from source phonetics rather than locked to passport MRZ data, triggering USCIS Requests for Evidence (RFEs).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3">
                  <XCircle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-brand-ink">Post-Payment Rejections</p>
                    <p className="text-xs text-ink-softer">
                      No automated scan audit. Days after payment, you get an email stating your document is too dark or illegible to translate.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3">
                  <XCircle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-brand-ink">Destroyed 1:1 Layouts</p>
                    <p className="text-xs text-ink-softer">
                      Complex academic transcripts and civil records are flattened into plain text documents without cell borders or stamps.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3">
                  <XCircle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-brand-ink">Zero Digital Proof</p>
                    <p className="text-xs text-ink-softer">
                      Static paper scans with no cryptographic ledger or live verification portal for consular adjudicators to inspect.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/15 text-xs text-ink-soft">
              <span className="font-bold text-status-danger block mb-0.5">Average Delay:</span>
              <span>2 to 6 weeks in USCIS processing queues when an RFE is triggered.</span>
            </div>
          </div>

          {/* Column B: VerifyLingua Certified Standard */}
          <div className="p-8 sm:p-10 rounded-[var(--r-2xl)] bg-surface-raised border-2 border-brand-500/30 shadow-xl shadow-brand-500/5 flex flex-col justify-between space-y-8 relative overflow-hidden">
            {/* Ambient radiant highlight */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand-500/10 blur-[80px]" aria-hidden="true" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-500 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <Badge variant="default" className="bg-brand-500 text-white text-xs font-mono font-bold">
                  The VerifyLingua Standard
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-brand-ink font-display">
                  Deterministic, Human-Certified &amp; Locked
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Engineered specifically for immigration law firms and applicants who cannot afford a single day of bureaucratic delay.
                </p>
              </div>

              <div className="space-y-4 pt-2 divide-y divide-border/60">
                <div className="flex items-start gap-3 pt-3">
                  <CheckCircle2 className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-brand-ink">Passport MRZ Name-Locking</p>
                    <p className="text-xs text-ink-soft">
                      Your exact passport name spelling and date format are locked into the translator workspace prior to certification.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3">
                  <CheckCircle2 className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-brand-ink">Pre-Payment Quality Triage</p>
                    <p className="text-xs text-ink-soft">
                      Instant 5-second computer vision audit checks resolution, glare, handwriting, and seal visibility before you pay a dime.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3">
                  <CheckCircle2 className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-brand-ink">Exact 1:1 Layout Preservation</p>
                    <p className="text-xs text-ink-soft">
                      OpenXML and PDF coordinate engines preserve your original tables, seal locations, stamps, and margins in identical formats.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3">
                  <CheckCircle2 className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-brand-ink">Cryptographic QR Verification Ledger</p>
                    <p className="text-xs text-ink-soft">
                      Each certificate is backed by an immutable SHA-256 hash and a live QR link resolving directly to our public portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-between gap-4 relative z-10">
              <div className="text-xs">
                <span className="font-bold text-brand-ink block">Guaranteed Peace of Mind</span>
                <span className="text-ink-soft">100% Acceptance or Full Refund + Free Redo</span>
              </div>
              <Button asChild size="sm" className="shrink-0 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs gap-1.5 shadow-sm">
                <Link href="/order/triage">
                  Start translation
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
