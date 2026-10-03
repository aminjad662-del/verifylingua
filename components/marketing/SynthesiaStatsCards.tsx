"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Clock, ShieldCheck } from "lucide-react";

const STAT_CARDS = [
  {
    metric: "+$10K",
    label: "Average Annual Law Firm Savings",
    description:
      "Immigration practices save over $10,000 annually by switching from hourly retainer translation agencies to our $24.95 transparent flat-rate model.",
    linkText: "View legal firm case study",
    href: "/register",
    icon: TrendingUp,
  },
  {
    metric: "90%",
    label: "Reduction in Delivery Turnaround",
    description:
      "Standard delivery in under 24 hours guaranteed, compared to 5 to 7 business days from legacy translation bureaus.",
    linkText: "Explore turnaround SLAs",
    href: "/translate",
    icon: Clock,
  },
  {
    metric: "100%",
    label: "First-Pass USCIS Acceptance",
    description:
      "Zero fatal formatting rejections across 4,800+ filings. Backed by our sworn RFE Defense Shield and 100% refund guarantee.",
    linkText: "Read acceptance warranty",
    href: "#guarantee",
    icon: ShieldCheck,
  },
];

export function SynthesiaStatsCards() {
  return (
    <section className="py-20 sm:py-28 bg-surface/40 border-t border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text font-display">
            You don&apos;t have to choose between cost, time, and quality
          </h2>
          <p className="text-base sm:text-lg text-text-muted leading-relaxed">
            VerifyLingua eliminates the traditional legal agency compromise through automated quality triage and certified ATA linguist precision.
          </p>
        </div>

        {/* 3 Large Stat Cards (Matches Screenshot Stats Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {STAT_CARDS.map((card, idx) => (
            <div
              key={idx}
              className="p-8 sm:p-10 rounded-2xl sm:rounded-3xl bg-surface-raised border border-border hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between space-y-8 group"
            >
              <div className="space-y-4">
                {/* Metric with Blue Accent (Matches screenshot blue bold font) */}
                <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-600 font-display tracking-tight block">
                  {card.metric}
                </span>

                <h3 className="text-base sm:text-lg font-bold text-text font-display">
                  {card.label}
                </h3>

                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border/60">
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <span>{card.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
