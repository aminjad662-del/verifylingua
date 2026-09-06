"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Stamp,
  FileText,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All Documents" },
  { id: "civil", label: "Civil Status" },
  { id: "academic", label: "Academic (WES / ECE)" },
  { id: "court", label: "Court & Legal" },
  { id: "corporate", label: "Corporate & Tax" },
];

const TAB_CONTENT: Record<
  string,
  {
    title: string;
    description: string;
    points: string[];
    sampleTitle: string;
    sampleOrigin: string;
    tagText: string;
  }
> = {
  all: {
    title: "140+ Official Document Standards With Guaranteed Acceptance",
    description:
      "Most agencies only translate clean printed text and skip smudged registry margins, foreign notary apostilles, or court docket annotations—leading directly to costly USCIS Requests for Evidence (RFEs).",
    points: [
      "100% complete transcription of handwritten stamps, seals, and marginalia",
      "Exact name-locking against applicant's international passport",
      "Sworn 8 CFR § 204.2(a)(1)(iii) translator statement on corporate letterhead",
      "Digital verification ledger with instantaneous QR authentication",
    ],
    sampleTitle: "Mexican Birth Certificate with Civil Registry Marginalia",
    sampleOrigin: "Registro Civil de la Ciudad de México",
    tagText: "All Seals & Marginal Notes Transcribed",
  },
  civil: {
    title: "Civil Registry & Vital Statistics (Birth, Marriage, Death)",
    description:
      "Vital records require extreme adherence to State Department Foreign Affairs Manual (FAM) reciprocity schedules. We preserve book numbers, volume indices, and civil officer notations.",
    points: [
      "Full transcription of all marginal amendments and legitimations",
      "Exact date formatting matching USCIS standards (Month DD, YYYY)",
      "Strict preservation of paternal and maternal double-surnames",
      "Guaranteed acceptance for I-130, I-485, and N-400 naturalization packets",
    ],
    sampleTitle: "Certificado de Nacimiento & Acta de Matrimonio",
    sampleOrigin: "República de Colombia • Notaría 14",
    tagText: "FAM Reciprocity Standard Verified",
  },
  academic: {
    title: "Academic Credentials for WES, ECE, Josef Silny & Universities",
    description:
      "Foreign academic evaluations require word-for-word course title precision, credit hours, and university grading scale transcriptions without unauthorized conversions.",
    points: [
      "Exact course naming without colloquial distortion",
      "Credit hours and grading scale tables mirrored 1:1",
      "Preservation of dean signatures, university seals, and matriculation codes",
      "Accepted by NACES and AICE member credential evaluation services",
    ],
    sampleTitle: "Zeugnis über die Bachelorprüfung & Transcript of Records",
    sampleOrigin: "Ludwig-Maximilians-Universität München",
    tagText: "NACES & AICE Compliant Formatting",
  },
  court: {
    title: "Judicial Decrees, Divorce Verdicts & Legal Contracts",
    description:
      "Immigration and federal courts require sworn certified translations with legal precision, docket number fidelity, and judge certification clauses.",
    points: [
      "Precise translation of jurisdictional clauses and legal statutes",
      "Custody terms, alimony stipulations, and final divorce decrees",
      "Sworn translator affidavit suitable for DOJ Executive Office for Immigration Review (EOIR)",
      "Optional state-licensed electronic notarization with wet-ink appearance",
    ],
    sampleTitle: "Sentencia Judicial de Divorcio y Patria Potestad",
    sampleOrigin: "Tribunal Superior de Justicia • Sala de Familia",
    tagText: "DOJ EOIR Certified Format",
  },
  corporate: {
    title: "Tax Returns, Bank Statements & Commercial Filings",
    description:
      "Investor visa applications (EB-5, E-2, L-1) require granular financial table typesetting, currency indications, and corporate registry validations.",
    points: [
      "1:1 tabular alignment for balance sheets and income statements",
      "Articles of Incorporation and commercial register extracts",
      "Source of funds and foreign tax assessment notices (SAT, Hacienda, Finanzamt)",
      "Corporate volume batching with dedicated legal project managers",
    ],
    sampleTitle: "Declaración Anual de Impuestos SAT / Steuerbescheid",
    sampleOrigin: "Servicio de Administración Tributaria (SAT)",
    tagText: "1:1 Tabular Alignment Verified",
  },
};

export function SpyglassEditorialLight() {
  const [activeTab, setActiveTab] = React.useState("all");
  const activeData = TAB_CONTENT[activeTab] || TAB_CONTENT.all;

  return (
    <section className="relative py-24 sm:py-32 bg-canvas border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-surface text-brand-ink text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Exhaustive Legal Rigor</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-ink font-display">
            Covering every document standard <br className="hidden sm:inline" />
            the other agencies miss
          </h2>

          <p className="text-base sm:text-lg text-text-muted leading-relaxed">
            Eliminating RFEs with complete transcription of marginalia, raised seals, and biometric stamps.
          </p>
        </div>

        {/* Filter Tab Pill Selector matching Spyglass reference */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer",
                activeTab === tab.id
                  ? "bg-brand-ink text-white shadow-md"
                  : "bg-surface text-text-muted hover:text-brand-ink border border-border/70 hover:border-brand-500/40"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Spotlight Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-surface border border-border/80 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Description & Bullet Checklist */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-ink font-display">
                {activeData.title}
              </h3>
              <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                {activeData.description}
              </p>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-brand-ink font-medium">
              {activeData.points.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/order/triage"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-ink hover:bg-brand-900 text-white text-sm font-bold shadow transition-all active:scale-95"
              >
                <span>Translate This Document</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/documents"
                className="text-xs sm:text-sm font-semibold text-brand-500 hover:text-brand-700 underline"
              >
                View all requirements →
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Inspector Callout */}
          <div className="lg:col-span-5 bg-surface-raised rounded-2xl p-6 border border-border space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-mono">
              <span className="font-bold text-brand-ink flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                Compliance Specimen
              </span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% USCIS Accepted
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-surface-warm border border-border/80 space-y-2">
                <span className="text-[10px] font-mono text-text-muted uppercase">
                  {activeData.sampleOrigin}
                </span>
                <h4 className="text-sm font-bold text-brand-ink">
                  {activeData.sampleTitle}
                </h4>
                <div className="p-2 rounded bg-surface border border-brand-200 text-[10px] font-mono font-bold text-brand-700 flex items-center gap-1.5">
                  <Stamp className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span>{activeData.tagText}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-text-muted">
                <div className="p-2 rounded bg-surface border border-border/60">
                  <span className="block text-text-subtle">ATA Certification</span>
                  <span className="font-bold text-brand-ink">Affidavit Included</span>
                </div>
                <div className="p-2 rounded bg-surface border border-border/60">
                  <span className="block text-text-subtle">Turnaround SLA</span>
                  <span className="font-bold text-brand-ink">Under 24 Hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
