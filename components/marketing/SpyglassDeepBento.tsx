"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Stamp,
  Award,
  ArrowRight,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_DOCS = [
  {
    id: "sample-1",
    tag: "CIVIL STATUS",
    title: "Mexican Birth Certificate",
    origin: "CDMX Registro Civil No. 49102",
    pair: "ES → EN",
    badge: "USCIS 8 CFR Ready",
    seal: "REGISTRO CIVIL SELLO",
    flag: "🇲🇽",
    visual: (
      <div className="w-full h-10 rounded border border-amber-600/20 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/30 p-2 flex items-center justify-between text-[9px] font-mono text-amber-900 dark:text-amber-200">
        <span className="font-bold truncate">ACTA DE NACIMIENTO</span>
        <span className="text-[8px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold shrink-0">
          SEAL OK
        </span>
      </div>
    ),
  },
  {
    id: "sample-2",
    tag: "ACADEMIC",
    title: "German University Transcript",
    origin: "LMU München Prüfungsamt",
    pair: "DE → EN",
    badge: "WES & ECE Approved",
    seal: "PRÜFUNGSAMT SIEGEL",
    flag: "🇩🇪",
    visual: (
      <div className="w-full h-10 rounded border border-blue-600/20 dark:border-blue-500/30 bg-blue-50/60 dark:bg-blue-950/30 p-2 flex items-center justify-between text-[9px] font-mono text-blue-900 dark:text-blue-200">
        <span className="font-bold truncate">ZEUGNIS LMU</span>
        <span className="text-[8px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold shrink-0">
          180 ECTS
        </span>
      </div>
    ),
  },
  {
    id: "sample-3",
    tag: "JUDICIAL",
    title: "Ukrainian Divorce Verdict",
    origin: "Ministry of Justice Kyiv",
    pair: "UK → EN",
    badge: "DOJ Court Sworn",
    seal: "МІНІСТЕРСТВО ЮСТИЦІЇ",
    flag: "🇺🇦",
    visual: (
      <div className="w-full h-10 rounded border border-indigo-600/20 dark:border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-950/30 p-2 flex items-center justify-between text-[9px] font-mono text-indigo-900 dark:text-indigo-200">
        <span className="font-bold truncate">СУДОВЕ РІШЕННЯ</span>
        <span className="text-[8px] px-1 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-bold shrink-0">
          SWORN
        </span>
      </div>
    ),
  },
  {
    id: "sample-4",
    tag: "VITAL RECORD",
    title: "French Marriage Certificate",
    origin: "Mairie de Paris • Cour d'Appel",
    pair: "FR → EN",
    badge: "Hague Apostille",
    seal: "APOSTILLE LA HAYE",
    flag: "🇫🇷",
    visual: (
      <div className="w-full h-10 rounded border border-rose-600/20 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-950/30 p-2 flex items-center justify-between text-[9px] font-mono text-rose-900 dark:text-rose-200">
        <span className="font-bold truncate">ACTE DE MARIAGE</span>
        <span className="text-[8px] px-1 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-bold shrink-0">
          HAGUE 1961
        </span>
      </div>
    ),
  },
];

export function SpyglassDeepBento() {
  return (
    <section className="relative py-24 sm:py-32 bg-surface dark:bg-canvas border-b border-border/40 dark:border-white/10 transition-colors duration-200 overflow-hidden">
      {/* Warm ruby atmospheric glow matching Slice 2 */}
      <div className="pointer-events-none absolute inset-0 dark-radial-ruby opacity-0 dark:opacity-100 transition-opacity duration-300" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: 4-Card Document Grid inside Muted Container matching Spyglass reference */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-raised dark:bg-slate-900/90 border border-border/80 dark:border-white/10 shadow-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border dark:border-white/10 text-xs font-mono">
                <span className="flex items-center gap-2 font-bold text-brand-ink dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Pre-Vetted Legal Document Standards
                </span>
                <span className="text-text-subtle dark:text-slate-400">85+ Language Pairs</span>
              </div>

              {/* 2x2 Grid of Document Cards with Visual Miniatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {SAMPLE_DOCS.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-surface dark:bg-slate-950/80 border border-border/70 dark:border-white/10 hover:border-brand-500/50 dark:hover:border-white/25 transition-all space-y-3 shadow-sm hover:shadow"
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono text-text-subtle dark:text-slate-400">
                      <span className="font-bold text-brand-500 flex items-center gap-1">
                        <span>{doc.flag}</span>
                        <span>{doc.tag}</span>
                      </span>
                      <span>{doc.pair}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-brand-ink dark:text-white line-clamp-1">
                        {doc.title}
                      </h4>
                      <p className="text-[10px] text-text-muted dark:text-slate-400 truncate">
                        {doc.origin}
                      </p>
                    </div>

                    {doc.visual}

                    <div className="flex items-center justify-between pt-1 border-t border-border/50 dark:border-white/10 text-[9px] font-mono">
                      <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{doc.badge}</span>
                      </div>
                      <Stamp className="w-3 h-3 text-text-subtle dark:text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[11px] font-mono text-text-muted dark:text-slate-400 flex items-center justify-between">
                <span>All documents delivered with signed certificate & tamper-proof QR.</span>
                <Link href="/documents" className="text-brand-500 font-bold hover:underline">
                  View all 140+ →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Text matching Spyglass reference */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border dark:border-white/15 bg-surface-raised dark:bg-white/5 text-brand-ink dark:text-slate-200 text-xs font-mono font-bold tracking-wider">
              <span className="text-brand-500">02</span>
              <span>/</span>
              <span>IMMIGRATION & COURT BENCHMARK</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-brand-ink dark:text-white leading-[1.06] font-display">
                Sworn certified compliance, <br />
                <span className="font-serif italic font-normal text-brand-900 dark:text-slate-300 block mt-1">
                  engineered instead of improvised.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-text-muted dark:text-slate-400 leading-relaxed">
                Federal regulations (8 CFR § 204.2) and EOIR immigration courts require sworn translator competency, formal letterheads, and immutable chain-of-custody.
              </p>
            </div>

            <p className="text-sm text-text-muted dark:text-slate-400 leading-relaxed">
              Every VerifyLingua order is routed to an ATA-credentialed professional translator and independently peer-reviewed. Our digital verification ledger provides embassies and adjudicating officers with instant 24/7 online authentication.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm text-brand-ink dark:text-slate-200 font-medium pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>USCIS 8 CFR § 103.2(b)(3) compliant Certificate of Translator Competency</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Optional state-licensed electronic notarization with wet-ink fidelity</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Immutable SHA-256 ledger hash for instant consular fraud verification</span>
              </li>
            </ul>

            <div className="pt-3">
              <Link
                href="/order/triage"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-brand-ink hover:bg-brand-900 text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 text-sm font-bold shadow transition-all active:scale-95 group"
              >
                <span>Start Certified Translation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
