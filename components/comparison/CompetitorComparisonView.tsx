"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { type CompetitorProfile, COMPETITORS } from "@/lib/comparisons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { DarkProductHowItWorks } from "@/components/marketing/DarkProductHowItWorks";
import {
  Check,
  X,
  Minus,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  QrCode,
  Award,
  ChevronRight,
} from "lucide-react";

export function CompetitorComparisonView({ profile }: { profile: CompetitorProfile }) {
  const otherCompetitors = Object.values(COMPETITORS).filter(
    (c) => c.slug !== profile.slug
  );

  return (
    <div className="space-y-20 md:space-y-28">
      {/* 1. Comparison Hero */}
      <section className="pt-12 md:pt-20 pb-12 bg-gradient-hero border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 space-y-8 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-xs text-text-muted font-medium">
            <Link href="/" className="hover:text-brand-ink transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Compare</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-500 font-semibold">{profile.name}</span>
          </nav>

          <div className="max-w-4xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-100 bg-surface-raised text-brand-500 text-xs font-bold uppercase tracking-wider shadow-sm font-mono">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Independent Comparison Matrix</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-ink tracking-tight leading-[1.05] font-display">
              {profile.headline}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-ink-soft max-w-2xl mx-auto leading-relaxed">
              {profile.subheadline}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <MagneticButton>
              <Button size="lg" asChild className="h-14 px-8 rounded-2xl text-base font-bold gap-2 shadow-md">
                <Link href="/order/triage">
                  Start translation ($24.95/page)
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </MagneticButton>
            <Button variant="secondary" size="lg" asChild className="h-14 px-8 rounded-2xl text-base font-bold">
              <Link href="/pricing">
                View transparent pricing
              </Link>
            </Button>
          </div>

          {/* Quick Metrics Comparison Bar */}
          <div className="max-w-3xl mx-auto pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-surface-raised border border-border/80 shadow-sm text-center space-y-1">
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
                Standard Page Rate
              </span>
              <p className="text-xl font-black text-brand-ink font-mono">
                {profile.pricingComparison.verifylinguaRate}
              </p>
              <span className="text-[11px] text-brand-500 font-semibold block">
                vs. {profile.pricingComparison.competitorRate}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-raised border border-border/80 shadow-sm text-center space-y-1">
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
                Turnaround Guarantee
              </span>
              <p className="text-xl font-black text-brand-ink font-mono">
                {profile.pricingComparison.verifylinguaSpeed}
              </p>
              <span className="text-[11px] text-brand-500 font-semibold block">
                vs. {profile.pricingComparison.competitorSpeed}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-raised border border-border/80 shadow-sm text-center space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
                Notarization Jurat
              </span>
              <p className="text-xl font-black text-brand-ink font-mono">
                {profile.pricingComparison.notarizationCost}
              </p>
              <span className="text-[11px] text-brand-500 font-semibold block">
                vs. {profile.pricingComparison.notarizationCompetitorCost}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Comprehensive Multi-Category Comparison Table Matrix */}
      <section className="max-w-7xl mx-auto px-6 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-500">
            Side-by-Side Breakdown
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-ink tracking-tight font-display">
            VerifyLingua vs. {profile.name} Feature Matrix
          </h2>
          <p className="text-base text-ink-soft leading-relaxed">
            Detailed breakdown across legal compliance, AI pre-triage, turnaround guarantees, and institutional acceptance.
          </p>
        </div>

        <div className="overflow-x-auto rounded-[32px] border border-border/80 bg-surface-raised shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="p-6 text-sm font-bold text-brand-ink min-w-[300px]">
                  Feature & Legal Capability
                </th>
                <th className="p-6 text-center bg-brand-50/90 border-x-2 border-brand-500 min-w-[240px]">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-500">
                      Our Standard
                    </span>
                    <p className="text-xl font-black text-brand-ink font-display">VerifyLingua</p>
                  </div>
                </th>
                <th className="p-6 text-center text-sm font-bold text-text-muted min-w-[200px]">
                  <p className="text-lg font-bold text-text-muted">{profile.name}</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {profile.categories.map((cat, catIdx) => (
                <React.Fragment key={catIdx}>
                  {/* Category Header Row */}
                  <tr className="bg-lavender-50/70 border-y border-border/80">
                    <td
                      colSpan={3}
                      className="px-6 py-3.5 text-xs font-mono font-black uppercase tracking-wider text-brand-700"
                    >
                      {cat.categoryName}
                    </td>
                  </tr>

                  {/* Feature Rows */}
                  {cat.features.map((feat, featIdx) => (
                    <tr
                      key={featIdx}
                      className="border-b border-border/60 hover:bg-brand-50/20 transition-colors"
                    >
                      <td className="p-6 align-top">
                        <div className="space-y-1">
                          <p className="font-bold text-brand-ink text-sm sm:text-base">
                            {feat.name}
                          </p>
                          <p className="text-xs text-ink-soft leading-relaxed max-w-lg">
                            {feat.description}
                          </p>
                        </div>
                      </td>

                      {/* VerifyLingua Column */}
                      <td className="p-6 align-top text-center bg-brand-50/40 border-x-2 border-brand-500">
                        <div className="flex flex-col items-center justify-center space-y-1.5">
                          {feat.verifylingua === "supported" ? (
                            <div className="w-7 h-7 rounded-full bg-status-success/15 border border-status-success/30 flex items-center justify-center text-status-success">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          ) : (
                            <span className="text-sm font-bold font-mono text-brand-ink">
                              {feat.verifylingua}
                            </span>
                          )}
                          {feat.verifylinguaNote && (
                            <span className="text-[11px] font-semibold text-brand-700 leading-tight">
                              {feat.verifylinguaNote}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Competitor Column */}
                      <td className="p-6 align-top text-center">
                        <div className="flex flex-col items-center justify-center space-y-1.5">
                          {feat.competitor === "supported" ? (
                            <div className="w-6 h-6 rounded-full bg-status-success/10 flex items-center justify-center text-status-success">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          ) : feat.competitor === "unsupported" ? (
                            <div className="w-6 h-6 rounded-full bg-status-danger/10 flex items-center justify-center text-status-danger">
                              <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          ) : feat.competitor === "partial" ? (
                            <div className="w-6 h-6 rounded-full bg-status-warning/10 flex items-center justify-center text-status-warning">
                              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          ) : (
                            <span className="text-sm font-semibold font-mono text-text-muted">
                              {feat.competitor}
                            </span>
                          )}
                          {feat.competitorNote && (
                            <span className="text-[11px] text-text-muted leading-tight">
                              {feat.competitorNote}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Three-Stat Proof Band */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 sm:p-12 rounded-[32px] bg-surface-raised border border-border/80 shadow-md space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-brand-ink font-display">
              Why Immigrants & Law Firms Choose Us Over {profile.name}
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              We eliminated the primary failure points of incumbent agencies while holding the industry $24.95 standard rate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profile.keyAdvantages.map((adv, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <span className="text-2xl font-black text-brand-500 font-mono">
                    {adv.metric}
                  </span>
                  <h4 className="text-lg font-bold text-brand-ink leading-snug">
                    {adv.title}
                  </h4>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    {adv.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Dark "How It Works" Band with Embedded Real Product-UI Mockup */}
      <DarkProductHowItWorks />

      {/* 5. Directory: See other competitor comparisons */}
      {otherCompetitors.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-brand-ink font-display">
              See How VerifyLingua Compares to Other Providers
            </h3>
            <p className="text-xs text-ink-soft">
              Honest, transparent breakdowns of rates, turnaround times, and verification methods.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {otherCompetitors.map((comp) => (
              <Link
                key={comp.slug}
                href={`/compare/${comp.slug}`}
                className="p-5 rounded-2xl bg-surface-raised border border-border/80 hover:border-brand-500/50 hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <p className="font-bold text-brand-ink group-hover:text-brand-500 transition-colors">
                    VerifyLingua vs. {comp.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {comp.tagline}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. Final Bottom CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="rounded-[36px] bg-gradient-panel border-2 border-brand-100 p-8 sm:p-12 md:p-16 text-center space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-5xl font-black text-brand-ink tracking-tight leading-[1.05] font-display">
            Ready for a Modern, Zero-Risk Certified Translation?
          </h2>
          <p className="text-base sm:text-lg text-ink-soft max-w-xl mx-auto leading-relaxed">
            Upload your documents now. Get instant AI scan triage, locked delivery time, and 100% guaranteed USCIS acceptance for $24.95/page.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <MagneticButton>
              <Button size="lg" asChild className="h-14 px-8 rounded-2xl text-base font-bold gap-2 shadow-md">
                <Link href="/order/triage">
                  Start translation
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
}
