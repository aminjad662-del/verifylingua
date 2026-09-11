"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  FileX,
  FileCheck,
  Lock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ThreatCard {
  id: string;
  number: string;
  category: string;
  title: string;
  description: string;
  impactLabel: string;
  impactValue: string;
  protectionLabel: string;
  protectionValue: string;
}

const THREAT_CARDS: ThreatCard[] = [
  {
    id: "threat-1",
    number: "01",
    category: "TIMELINE COLLAPSE",
    title: "RFEs & Rejections Cost Months",
    description:
      "Incomplete translator certifications trigger USCIS Form I-797 Request for Evidence notices, pushing back green card, asylum, and work permit petitions by 60 to 90 days.",
    impactLabel: "Average Petition Delay",
    impactValue: "+74 Days",
    protectionLabel: "VerifyLingua SLA",
    protectionValue: "0% RFE Guarantee",
  },
  {
    id: "threat-2",
    number: "02",
    category: "REGULATORY VOID",
    title: "Unverified Translators Void Filings",
    description:
      "Notary stamps without ATA-certified competence declarations fail USCIS 8 CFR § 103.2(b)(3) requirements. Freelance machine translations risk immediate rejection at the interview window.",
    impactLabel: "Federal Risk Standard",
    impactValue: "Mandatory RFE",
    protectionLabel: "Our Compliance",
    protectionValue: "Sworn ATA Affidavit",
  },
  {
    id: "threat-3",
    number: "03",
    category: "CONSULAR TAMPERING",
    title: "Paper Dossiers Face Fraud Scrutiny",
    description:
      "Consulates and foreign embassies increasingly reject unverified paper translations suspected of alteration. Without an immutable digital audit trail, verification calls stall approvals.",
    impactLabel: "Consular Delay",
    impactValue: "Manual Audit",
    protectionLabel: "Cryptographic Proof",
    protectionValue: "SHA-256 Ledger & QR",
  },
];

export function SpyglassDarkMatrix() {
  return (
    <section className="relative py-20 sm:py-28 bg-canvas text-brand-ink dark:text-white overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6">
        {/* Dark Container Box matching Spyglass reference */}
        <div className="relative rounded-3xl p-8 sm:p-12 md:p-16 bg-brand-ink dark:bg-surface-raised text-white border border-white/10 shadow-2xl overflow-hidden space-y-12 sm:space-y-16">
          {/* Ambient lighting highlight */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-brand-500/10 dark:bg-brand-500/20 blur-[130px]" />

          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-brand-300 text-xs font-mono font-bold uppercase tracking-widest">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>The Cost of Inaccurate Translations</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-display leading-[1.06]">
              Legal translation errors are the <br className="hidden sm:inline" />
              <span className="font-serif italic font-normal text-brand-300">
                most expensive mistake in immigration.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
              A single misspelled name, omitted civil seal, or unverified translator triggers USCIS Requests for Evidence (RFEs), deportation delays, and costly legal refiling fees.
            </p>
          </div>

          {/* 3 Dark High-Density Columns Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {THREAT_CARDS.map((card) => (
              <div
                key={card.id}
                className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-500/50 hover:bg-white/8 transition-all duration-300 group shadow-lg"
              >
                <div className="space-y-4">
                  {/* Top: Monospace Number & Category Tag */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xl font-extrabold font-mono text-brand-300 group-hover:text-white transition-colors">
                      {card.number}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 font-bold">
                      {card.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors font-display">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Micro Metric Table Footer */}
                <div className="pt-6 mt-6 border-t border-white/10 space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-white/60">
                    <span className="text-[11px]">{card.impactLabel}</span>
                    <span className="text-amber-400 font-bold">{card.impactValue}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/80">
                    <span className="text-[11px] text-white/60">{card.protectionLabel}</span>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{card.protectionValue}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Bar: Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 relative z-10 text-xs sm:text-sm text-white/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-300 shrink-0" />
              <span>VerifyLingua guarantees 100% USCIS, federal court, and consular acceptance.</span>
            </div>
            <Link
              href="/order/triage"
              className="inline-flex items-center gap-2 font-bold text-brand-300 hover:text-white transition-colors underline"
            >
              <span>Protect your filing now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
