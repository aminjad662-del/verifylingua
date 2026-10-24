"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  ShieldCheck, 
  FileCheck2, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  Lock,
  Building2,
  Award
} from "lucide-react";

interface SampleDoc {
  id: string;
  title: string;
  sourceLang: string;
  targetLang: string;
  caseType: string;
  sealCode: string;
  pages: number;
  deliveryTime: string;
}

const sampleDocs: SampleDoc[] = [
  {
    id: "doc-1",
    title: "Birth Certificate (Acta de Nacimiento)",
    sourceLang: "Spanish",
    targetLang: "English",
    caseType: "USCIS Form I-485",
    sealCode: "USCIS-CERT-9042",
    pages: 2,
    deliveryTime: "Under 12h",
  },
  {
    id: "doc-2",
    title: "Marriage Record (Acte de Mariage)",
    sourceLang: "French",
    targetLang: "English",
    caseType: "Consular Green Card",
    sealCode: "USCIS-CERT-8814",
    pages: 3,
    deliveryTime: "Under 8h",
  },
  {
    id: "doc-3",
    title: "University Degree & Transcript",
    sourceLang: "German",
    targetLang: "English",
    caseType: "H-1B / EB-2 NIW",
    sealCode: "USCIS-CERT-7201",
    pages: 4,
    deliveryTime: "Under 16h",
  },
  {
    id: "doc-4",
    title: "Police Clearance Record",
    sourceLang: "Portuguese",
    targetLang: "English",
    caseType: "N-400 Naturalization",
    sealCode: "USCIS-CERT-6549",
    pages: 1,
    deliveryTime: "Under 6h",
  },
];

export function SynthesiaDarkPreFooter() {
  const [activeDoc, setActiveDoc] = useState<string>("doc-1");

  return (
    <section className="relative w-full bg-obsidian-950 text-white py-24 sm:py-32 overflow-hidden border-t border-obsidian-border selection:bg-brand-500/30 selection:text-white">
      {/* Subtle atmospheric radial depth */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(37,99,235,0.15),transparent_70%)]"
        aria-hidden="true" 
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Top Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-obsidian-card border border-obsidian-border text-xs font-sans font-semibold uppercase tracking-wider text-brand-300 mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          <span>Ready to Accelerate Your Immigration Filings?</span>
        </div>

        {/* Main Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl leading-[1.12]">
          Produce certified translations{" "}
          <span className="text-brand-400 font-extrabold">
            faster & flawlessly
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-300/85 max-w-2xl leading-relaxed font-sans">
          Join over 2,400 immigration attorneys, corporate paralegals, and visa petitioners who rely on VerifyLingua for guaranteed USCIS acceptance and 8 CFR § 103.2 statutory precision.
        </p>

        {/* Call to Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/translate"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm sm:text-base shadow-[0_4px_20px_rgba(37,99,235,0.35)] transition-transform duration-150 ease-out active:scale-[0.97] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Start Your Translation Today</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/pricing"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-obsidian-card hover:bg-obsidian-elevated border border-obsidian-border text-slate-200 font-semibold text-sm sm:text-base transition-transform duration-150 ease-out active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Building2 className="w-4 h-4 text-brand-400" />
            <span>Firm & Enterprise Plans</span>
          </Link>
        </div>

        {/* Feature Highlights Strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs text-slate-400 font-sans">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% USCIS Acceptance Guaranteed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>24h Standard Turnaround</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ATA Member Accredited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero AI Model Training</span>
          </div>
        </div>

        {/* Interactive Verified Sample Document Strip */}
        <div className="mt-16 w-full max-w-5xl">
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 font-sans">
              <FileCheck2 className="w-4 h-4 text-brand-400" />
              <span>Click a civil record type to inspect its certified output:</span>
            </div>
            <span className="hidden sm:inline text-xs font-sans text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
              USCIS 8 CFR § 103.2 READY
            </span>
          </div>

          {/* Document selection cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
            {sampleDocs.map((doc) => {
              const isSelected = activeDoc === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setActiveDoc(doc.id)}
                  className={`p-4 rounded-xl border transition-[transform,border-color,background-color] duration-150 ease-out text-left relative overflow-hidden group cursor-pointer active:scale-[0.98] ${
                    isSelected
                      ? "bg-obsidian-elevated border-brand-500 ring-1 ring-brand-500/50 shadow-xs"
                      : "bg-obsidian-card border-obsidian-border hover:border-slate-700/80 hover:bg-obsidian-card/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-sans tracking-wider uppercase text-brand-400 font-semibold">
                      {doc.sourceLang} → {doc.targetLang}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans font-medium">
                      {doc.deliveryTime}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors line-clamp-1 font-sans">
                    {doc.title}
                  </h4>
                  
                  <div className="mt-3 pt-3 border-t border-obsidian-border flex items-center justify-between text-xs font-sans">
                    <span className="text-slate-400 text-[11px]">{doc.caseType}</span>
                    <span className="text-[10px] font-sans text-emerald-400 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active document detail preview bar */}
          {activeDoc && (
            <div className="mt-4 p-4 rounded-xl bg-obsidian-card/90 border border-obsidian-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-brand-400" />
                </div>
                <div className="text-left font-sans">
                  <div className="font-semibold text-white">
                    {sampleDocs.find(d => d.id === activeDoc)?.title}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Cryptographic Seal: <span className="font-mono text-brand-300">{sampleDocs.find(d => d.id === activeDoc)?.sealCode}</span></span>
                    <span>•</span>
                    <span>Format: Dual-Column Court-Mirror</span>
                  </div>
                </div>
              </div>

              <Link
                href="/translate"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/40 text-brand-300 hover:text-white font-medium transition-transform duration-150 ease-out active:scale-[0.97] shrink-0 text-xs font-sans cursor-pointer"
              >
                <span>Translate This Document</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
