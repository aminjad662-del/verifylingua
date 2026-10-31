"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Clock, 
  Scale,
  UploadCloud
} from "lucide-react";
import { DocumentInspectionStage } from "@/components/marketing/DocumentInspectionStage";

interface JurisdictionInfo {
  id: string;
  name: string;
  agency: string;
  statute: string;
  spec: string;
  sla: string;
  affidavitWording: string;
}

const JURISDICTIONS: JurisdictionInfo[] = [
  {
    id: "uscis",
    name: "USCIS Immigration Petitions",
    agency: "U.S. Citizenship & Immigration Services",
    statute: "8 CFR Section 103.2(b)(3)",
    spec: "Mandatory Sworn Translator Competence Affidavit",
    sla: "Under 24 Hours Deterministic SLA",
    affidavitWording: "I certify that I am competent to translate from the foreign language into English, and that the translation is true and accurate to the best of my abilities.",
  },
  {
    id: "eoir",
    name: "EOIR Immigration Courts",
    agency: "Executive Office for Immigration Review",
    statute: "EOIR Practice Manual Section 3.3(a)",
    spec: "Court-Admissible Jurat & Line-Numbered Folios",
    sla: "Priority Same-Day Dispatch",
    affidavitWording: "Sworn under penalty of perjury under the laws of the United States. Admissible in federal removal and asylum proceedings.",
  },
  {
    id: "consular",
    name: "U.S. Consular Posts & Embassies",
    agency: "Department of State / Consular Affairs",
    statute: "9 FAM 502.1 / DS-260 Guidelines",
    spec: "Apostille & Civil Registry Verification",
    sla: "Under 24 Hours Worldwide",
    affidavitWording: "Certified corporate linguist affidavit accepted across all U.S. Embassies, Consulates, and National Visa Center (NVC) filings.",
  },
  {
    id: "academic",
    name: "Academic Credentials & WES",
    agency: "NACES & AICE Evaluators",
    statute: "WES Document Submission Policy",
    spec: "Grade Mark Sheet & Syllabus 1:1 Layout",
    sla: "Under 24 Hours",
    affidavitWording: "Certified academic transcript and diploma translation formatted to preserve original university grading scales and seals.",
  },
];

export function SovereignLegalConsole() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>("uscis");

  const currentJurisdiction = JURISDICTIONS.find((j) => j.id === selectedJurisdiction) || JURISDICTIONS[0];

  return (
    <div className="w-full bg-canvas text-text">
      
      {/* 1. TOP STATUTORY JURISDICTION BAR */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-court-emerald animate-pulse shrink-0" />
              <span className="font-mono text-[11px] text-text-muted">STATUTORY FILING TARGET:</span>
              <span className="font-semibold text-brand-ink">{currentJurisdiction.name}</span>
            </div>

            {/* Jurisdiction Switcher Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {JURISDICTIONS.map((j) => (
                <button
                  key={j.id}
                  onClick={() => setSelectedJurisdiction(j.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer active:scale-[0.98] ${
                    selectedJurisdiction === j.id
                      ? "bg-brand-500 text-white shadow-2xs font-semibold"
                      : "text-text-muted hover:text-brand-ink hover:bg-surface-raised"
                  }`}
                >
                  {j.id === "uscis" && "USCIS"}
                  {j.id === "eoir" && "EOIR Courts"}
                  {j.id === "consular" && "Consulates"}
                  {j.id === "academic" && "WES / Academic"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE SOVEREIGN DOCKET & INTAKE HERO */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-border">
        {/* Subtle architectural hairline grid background */}
        <div 
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Authoritative Legal Copy & Intake Hub */}
            <div className="lg:col-span-6 space-y-7 text-left">
              
              {/* Institutional Accreditation Pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border bg-surface-raised text-text-muted text-xs font-medium shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-signal-accent shrink-0" />
                <span className="font-mono text-[11px] text-text-subtle">ATA Corporate Member No. 278190</span>
                <span className="w-1 h-1 rounded-full bg-border-strong" />
                <span className="font-mono text-[11px] text-court-emerald font-semibold">{currentJurisdiction.statute}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-bold tracking-tight text-brand-ink leading-[1.08] font-display">
                Certified Legal Translations for Federal Adjudication
              </h1>

              {/* Subheadline (under 20 words per taste-skill) */}
              <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl">
                Sworn translator competence affidavits, 1:1 coordinate typesetting, and cryptographic verification accepted by all immigration judges and consular posts.
              </p>

              {/* Live Statutory Specification Notice */}
              <div className="p-4 rounded-xl bg-surface border border-border/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-mono text-[10px] text-text-subtle">
                  <span>JURISDICTION REQUIREMENT</span>
                  <span className="text-brand-ink font-bold">{currentJurisdiction.agency}</span>
                </div>
                <div className="font-semibold text-brand-ink text-xs">
                  {currentJurisdiction.spec}
                </div>
                <p className="text-[11px] text-text-muted font-serif italic">
                  "{currentJurisdiction.affidavitWording}"
                </p>
              </div>

              {/* Interactive Direct Intake & Commercial Bar */}
              <div className="space-y-3 pt-1">
                <div className="p-5 rounded-2xl bg-surface-raised border border-border shadow-xs space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-ink text-sm">Instant Certified Intake</span>
                    <span className="font-mono text-xs font-bold text-signal-accent bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                      $24.95 / standard page
                    </span>
                  </div>

                  {/* Drag-and-Drop Intake Dropzone */}
                  <Link
                    href="/translate"
                    className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-border hover:border-signal-accent bg-surface/60 hover:bg-brand-50/30 transition-all text-center group cursor-pointer"
                  >
                    <UploadCloud className="w-8 h-8 text-signal-accent group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-xs font-bold text-brand-ink group-hover:text-signal-accent transition-colors">
                      Upload Foreign Civil Record (PDF, JPG, PNG)
                    </span>
                    <span className="text-[11px] text-text-muted mt-0.5">
                      Birth certificate, marriage act, passport, or academic transcript
                    </span>
                  </Link>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <Link
                      href="/translate"
                      className="flex-1 h-11 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-[0.98]"
                    >
                      <span>Proceed to certified triage</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/counsel"
                      className="h-11 px-4 rounded-xl border border-border bg-surface hover:bg-surface-raised text-text font-semibold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98]"
                    >
                      <Scale className="w-3.5 h-3.5 text-signal-accent" />
                      <span>Law firm portal</span>
                    </Link>
                  </div>
                </div>

                {/* Micro Institutional Guarantees */}
                <div className="grid grid-cols-3 gap-2 text-[11px] text-text-muted pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-court-emerald shrink-0" />
                    <span>Acceptance Warranty</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-court-emerald shrink-0" />
                    <span>{currentJurisdiction.sla}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-court-emerald shrink-0" />
                    <span>Ephemeral Vault</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: The Living Legal Inspection Docket Stage */}
            <div className="lg:col-span-6">
              <DocumentInspectionStage />
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

export default SovereignLegalConsole;
