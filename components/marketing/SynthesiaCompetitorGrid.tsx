"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Scale, CheckCircle2, ShieldCheck, ExternalLink } from "lucide-react";

interface CompetitorCard {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  keyWin: string;
}

const COMPETITOR_CARDS: CompetitorCard[] = [
  {
    name: "RushTranslate",
    slug: "rushtranslate",
    tagline: "Speed & Verification",
    description: "VerifyLingua includes free tamper-evident QR verification and full RFE money-back warranty that RushTranslate does not match.",
    keyWin: "Tamper-evident QR included free",
  },
  {
    name: "Rev.com",
    slug: "rev",
    tagline: "USCIS Legal Specialization",
    description: "Rev focuses on audio/video captions. VerifyLingua is 100% purpose-built for immigration, court, and consular legal compliance.",
    keyWin: "100% USCIS certified formatting",
  },
  {
    name: "Stepes",
    slug: "stepes",
    tagline: "Transparent Pricing",
    description: "Avoid Stepes' enterprise minimums and quoting delays. Enjoy our transparent $24.95 flat rate with instant checkout.",
    keyWin: "Flat $24.95 with zero minimums",
  },
  {
    name: "TransPerfect",
    slug: "transperfect",
    tagline: "Agile Turnaround",
    description: "Enterprise bureaus take days to respond to RFEs. VerifyLingua delivers certified vital records in under 24 hours guaranteed.",
    keyWin: "Under 24h delivery SLA",
  },
  {
    name: "RapidTranslate",
    slug: "rapidtranslate",
    tagline: "Authentication Security",
    description: "Get real SHA-256 digital seals and ATA Member No. 278190 credentials verified by direct public officer scanning.",
    keyWin: "Cryptographic hash audit trail",
  },
  {
    name: "Tomedes",
    slug: "tomedes",
    tagline: "Civil Registry Expertise",
    description: "Pre-payment triage detects handwritten seals and unreadable registry stamps before you spend a single dollar.",
    keyWin: "Pre-payment scan triage",
  },
  {
    name: "GTS Translation",
    slug: "gts",
    tagline: "Instant Self-Service",
    description: "No sales forms or wait times. Upload your PDF or photo and receive live pricing with instant linguist assignment.",
    keyWin: "Instant online portal checkout",
  },
  {
    name: "Day Translations",
    slug: "daytranslations",
    tagline: "Zero Hidden Fees",
    description: "Notarization and certified affidavit packets for a simple flat fee, without unexpected rush fee penalties.",
    keyWin: "Clear, predictable invoice billing",
  },
  {
    name: "Local Notaries & Freelancers",
    slug: "freelancers",
    tagline: "Institutional Liability",
    description: "Freelancers cannot provide corporate ATA membership or sworn institutional RFE defense warranties.",
    keyWin: "Full legal warranty & liability backing",
  },
];

export function SynthesiaCompetitorGrid() {
  return (
    <section className="py-20 sm:py-28 bg-surface/30 border-t border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200 bg-brand-50 text-brand-700 text-xs font-sans font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-brand-600" />
            <span>Honest Market Comparisons</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text font-display">
            See how VerifyLingua compares to other translation services
          </h2>

          <p className="text-base sm:text-lg text-text-muted leading-relaxed font-sans">
            Direct, factual comparisons to help immigration attorneys and applicants make the right certified choice.
          </p>
        </div>

        {/* 3x3 Grid (Matches Screenshot 3x3 Competitor Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {COMPETITOR_CARDS.map((card, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-2xl bg-surface-raised border border-border hover:border-brand-300 hover:shadow-[0_8px_24px_-4px_rgba(37,99,235,0.08)] hover:-translate-y-1 transition-[transform,border-color,box-shadow] duration-200 ease-out flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-lg font-bold text-text font-display">
                    vs. {card.name}
                  </span>
                  <span className="text-[10px] font-sans text-brand-700 bg-brand-50 border border-brand-200/70 px-2.5 py-0.5 rounded-full font-semibold">
                    {card.tagline}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans">
                  {card.description}
                </p>

                <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/60 px-2.5 py-1.5 rounded-lg font-medium font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                  <span>{card.keyWin}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60">
                <Link
                  href="/translate"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-transform duration-150 ease-out active:scale-[0.97]"
                >
                  <span>Compare with {card.name}</span>
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
