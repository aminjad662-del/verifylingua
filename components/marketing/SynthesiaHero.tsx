"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  FileCheck2,
  Lock,
  Scale,
  Award,
  Zap,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type FilterCategory = "all" | "legal" | "speed" | "security" | "pricing";

interface MatrixRow {
  category: "legal" | "speed" | "security" | "pricing";
  feature: string;
  subtext: string;
  verifyLingua: string | boolean;
  rushTranslate: string | boolean;
  rev: string | boolean;
  generic: string | boolean;
  isPrice?: boolean;
}

const MATRIX_DATA: MatrixRow[] = [
  // Legal & Acceptance
  {
    category: "legal",
    feature: "8 CFR § 103.2(b)(3) Compliance",
    subtext: "Formal legal competence declaration with sworn translator certification",
    verifyLingua: "Guaranteed Sworn Format",
    rushTranslate: "Standard Template",
    rev: "Generic Statement",
    generic: false,
  },
  {
    category: "legal",
    feature: "ATA Corporate Member Sealed",
    subtext: "Corporate Member No. 278190 official embossed credential stamps",
    verifyLingua: true,
    rushTranslate: true,
    rev: false,
    generic: false,
  },
  {
    category: "legal",
    feature: "Tamper-Evident SHA-256 & QR Seal",
    subtext: "Immigration officers scan QR to verify original digital cryptographic hash",
    verifyLingua: true,
    rushTranslate: false,
    rev: false,
    generic: false,
  },
  {
    category: "legal",
    feature: "USCIS RFE Defense Warranty",
    subtext: "Free instant re-affidavit and legal response packet if ever questioned",
    verifyLingua: "100% Free Redo + Full Refund",
    rushTranslate: "Re-edit Only",
    rev: "No Guarantee",
    generic: false,
  },

  // Turnaround & SLA
  {
    category: "speed",
    feature: "Standard Guaranteed Turnaround",
    subtext: "Time required for certified vital records (Birth/Marriage/Court)",
    verifyLingua: "< 24 Hours Guaranteed",
    rushTranslate: "24-48 Hours Est.",
    rev: "48-72 Hours",
    generic: "3-7 Days",
    isPrice: true,
  },
  {
    category: "speed",
    feature: "Real-Time 8-Stage Telemetry",
    subtext: "Live state-machine tracker with cryptographic milestone logs",
    verifyLingua: true,
    rushTranslate: false,
    rev: false,
    generic: false,
  },
  {
    category: "speed",
    feature: "Pre-Payment Document Triage",
    subtext: "Automated scan to detect blurry seals and truncated margins before pay",
    verifyLingua: true,
    rushTranslate: false,
    rev: false,
    generic: false,
  },

  // Security & Privacy
  {
    category: "security",
    feature: "Zero AI Model Training Pledge",
    subtext: "Civil records, passports, and court exhibits are never retained for training",
    verifyLingua: "100% Zero-Retention Pledge",
    rushTranslate: "Vague Policy",
    rev: "Trained on Transcripts",
    generic: false,
  },
  {
    category: "security",
    feature: "256-Bit TLS End-to-End Vault",
    subtext: "Bank-grade cryptographic transit with ephemeral decryption",
    verifyLingua: true,
    rushTranslate: true,
    rev: true,
    generic: false,
  },

  // Pricing
  {
    category: "pricing",
    feature: "Certified Translation Rate",
    subtext: "Flat transparent cost per page (up to 250 words standard)",
    verifyLingua: "$24.95 / page",
    rushTranslate: "$24.95 / page",
    rev: "$33.00 / page",
    generic: "$45 - $90 / page",
    isPrice: true,
  },
  {
    category: "pricing",
    feature: "Notarization & Affidavit Seal",
    subtext: "Sworn notarial certificate signed under state commission",
    verifyLingua: "$19.00 / document",
    rushTranslate: "$19.95 / document",
    rev: "$25.00 / document",
    generic: "$35.00+",
    isPrice: true,
  },
];

export function SynthesiaHero() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const filteredRows =
    activeFilter === "all"
      ? MATRIX_DATA
      : MATRIX_DATA.filter((r) => r.category === activeFilter);

  const renderCellContent = (val: string | boolean, isHighlighted = false) => {
    if (typeof val === "boolean") {
      return val ? (
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${
            isHighlighted
              ? "bg-brand-50 text-brand-600 border border-brand-200"
              : "bg-surface-sunken text-text-muted border border-border"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-inherit" />
        </span>
      ) : (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-surface-sunken text-text-subtle/50">
          <XCircle className="w-4 h-4 text-inherit" />
        </span>
      );
    }
    return (
      <span
        className={`text-xs sm:text-sm font-semibold ${
          isHighlighted ? "text-brand-600 font-bold" : "text-text"
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-32 overflow-hidden bg-canvas">
      {/* ─── Atmospheric Radial Aura (Matches Synthesia hero lighting) ─── */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-96 sm:h-[32rem] opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(219, 234, 254, 0.5) 0%, rgba(241, 244, 255, 0.3) 45%, rgba(255, 255, 255, 0) 80%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-12 sm:space-y-16">
        {/* ─── Hero Headline & CTAs ─── */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200/80 bg-brand-50/70 shadow-xs backdrop-blur-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-700">
              Certified Legal Translation Alternative
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text leading-[1.08] font-display">
            Looking for a certified legal translation{" "}
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 bg-clip-text text-transparent">
              alternative?
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            Discover why top immigration attorneys, universities, and applicants
            switch to VerifyLingua for guaranteed USCIS acceptance, tamper-proof
            seals, and under 24-hour turnaround.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link href="/translate">
              <Button
                size="lg"
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm sm:text-base px-7 py-6 rounded-full shadow-md shadow-brand-500/20 transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98] cursor-pointer"
              >
                <span>Start Certified Translation</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="#guarantee">
              <Button
                size="lg"
                variant="outline"
                className="border-border bg-surface-raised hover:bg-surface text-text font-semibold text-sm sm:text-base px-6 py-6 rounded-full transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>View Acceptance Guarantee</span>
              </Button>
            </Link>
          </div>

          {/* Micro Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-mono text-text-subtle">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              USCIS 8 CFR § 103.2 Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              ATA Member No. 278190
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              100% Acceptance Guarantee
            </span>
          </div>
        </div>

        {/* ─── Floating Head-to-Head Comparison Matrix (Matches Screenshot Table) ─── */}
        <div className="relative pt-4 sm:pt-8">
          <div className="p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-surface-raised border border-border shadow-xl shadow-slate-900/5">
            <div className="bg-canvas rounded-xl sm:rounded-2xl border border-border/80 overflow-hidden">
              {/* Table Top Toolbar & Filters */}
              <div className="p-4 sm:p-6 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/40">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-text font-display flex items-center gap-2">
                    <Scale className="w-4 h-4 text-brand-500" />
                    <span>Comprehensive Verification Matrix</span>
                  </h3>
                  <p className="text-xs text-text-muted">
                    Side-by-side comparison with legacy translation bureaus and unverified tools.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {[
                    { id: "all", label: "All Features" },
                    { id: "legal", label: "Legal Acceptance" },
                    { id: "speed", label: "Speed & SLA" },
                    { id: "security", label: "Security & Privacy" },
                    { id: "pricing", label: "Pricing" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id as FilterCategory)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        activeFilter === tab.id
                          ? "bg-brand-500 text-white shadow-xs"
                          : "bg-surface text-text-muted hover:text-text hover:bg-surface-sunken"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Body */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[680px]">
                  <thead>
                    <tr className="border-b border-border/80 bg-surface/20">
                      <th className="py-4 px-5 text-xs font-mono uppercase text-text-subtle w-[36%]">
                        Specification &amp; Feature
                      </th>
                      {/* Active Column: VerifyLingua */}
                      <th className="py-4 px-4 text-xs font-mono uppercase w-[22%] bg-brand-50/50 border-x border-brand-200/80">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-brand-700">VerifyLingua</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500 text-white tracking-wider">
                            RECOMMENDED
                          </span>
                        </div>
                      </th>
                      <th className="py-4 px-4 text-xs font-mono uppercase text-text-subtle w-[14%]">
                        RushTranslate
                      </th>
                      <th className="py-4 px-4 text-xs font-mono uppercase text-text-subtle w-[14%]">
                        Rev.com
                      </th>
                      <th className="py-4 px-4 text-xs font-mono uppercase text-text-subtle w-[14%]">
                        Generic AI
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <AnimatePresence mode="popLayout">
                      {filteredRows.map((row, idx) => (
                        <motion.tr
                          key={row.feature}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15, delay: idx * 0.02 }}
                          className="hover:bg-surface/50 transition-colors"
                        >
                          {/* Feature Name & Description */}
                          <td className="py-3.5 px-5 align-middle">
                            <div className="space-y-0.5">
                              <span className="text-xs sm:text-sm font-semibold text-text block">
                                {row.feature}
                              </span>
                              <span className="text-[11px] text-text-muted leading-relaxed block">
                                {row.subtext}
                              </span>
                            </div>
                          </td>

                          {/* VerifyLingua (Highlighted Active Column) */}
                          <td className="py-3.5 px-4 align-middle bg-brand-50/30 border-x border-brand-200/60">
                            {renderCellContent(row.verifyLingua, true)}
                          </td>

                          {/* RushTranslate */}
                          <td className="py-3.5 px-4 align-middle">
                            {renderCellContent(row.rushTranslate, false)}
                          </td>

                          {/* Rev.com */}
                          <td className="py-3.5 px-4 align-middle">
                            {renderCellContent(row.rev, false)}
                          </td>

                          {/* Generic AI / Freelancers */}
                          <td className="py-3.5 px-4 align-middle">
                            {renderCellContent(row.generic, false)}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Table Footer Banner */}
              <div className="p-4 sm:p-5 bg-surface/60 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-text-muted flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-status-success" />
                  All certified translations include sworn ATA certification and tamper-evident QR at no added charge.
                </span>

                <Link
                  href="/translate"
                  className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
                >
                  <span>Start certified order for $24.95/page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
