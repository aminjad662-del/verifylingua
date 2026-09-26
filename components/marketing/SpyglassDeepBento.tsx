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
      <div className="w-full h-10 rounded-lg border border-amber-600/20 bg-amber-50/60 dark:bg-amber-950/20 p-2 flex items-center justify-between text-[10px] font-mono text-amber-900 dark:text-amber-300">
        <span className="font-bold truncate">ACTA DE NACIMIENTO</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold shrink-0">
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
      <div className="w-full h-10 rounded-lg border border-blue-600/20 bg-blue-50/60 dark:bg-blue-950/20 p-2 flex items-center justify-between text-[10px] font-mono text-blue-900 dark:text-blue-300">
        <span className="font-bold truncate">ZEUGNIS LMU</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-bold shrink-0">
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
      <div className="w-full h-10 rounded-lg border border-indigo-600/20 bg-indigo-50/60 dark:bg-indigo-950/20 p-2 flex items-center justify-between text-[10px] font-mono text-indigo-900 dark:text-indigo-300">
        <span className="font-bold truncate">СУДОВЕ РІШЕННЯ</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 font-bold shrink-0">
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
      <div className="w-full h-10 rounded-lg border border-rose-600/20 bg-rose-50/60 dark:bg-rose-950/20 p-2 flex items-center justify-between text-[10px] font-mono text-rose-900 dark:text-rose-300">
        <span className="font-bold truncate">ACTE DE MARIAGE</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 font-bold shrink-0">
          HAGUE 1961
        </span>
      </div>
    ),
  },
];

export function SpyglassDeepBento() {
  return (
    <section className="relative py-20 sm:py-28 bg-white dark:bg-neutral-950 border-b border-neutral-200/80 dark:border-neutral-850">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: 4-Card Document Grid inside 1px Precision Shell */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="p-5 sm:p-6 rounded-2xl bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/90 dark:border-neutral-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200/70 dark:border-neutral-800 text-xs font-mono">
                <span className="flex items-center gap-2 font-bold text-neutral-950 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  PRE-VETTED LEGAL STANDARDS
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">85+ Language Pairs</span>
              </div>

              {/* 2x2 Grid of Document Cards with Visual Miniatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                {SAMPLE_DOCS.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800/90 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-150 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                        <span>{doc.flag}</span>
                        <span>{doc.tag}</span>
                      </span>
                      <span>{doc.pair}</span>
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-neutral-950 dark:text-white line-clamp-1">
                        {doc.title}
                      </h4>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                        {doc.origin}
                      </p>
                    </div>

                    {doc.visual}

                    <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-850 text-[10px] font-mono">
                      <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{doc.badge}</span>
                      </div>
                      <Stamp className="w-3 h-3 text-neutral-400" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                <span>Signed certificate & tamper-proof QR on every delivery.</span>
                <Link href="/documents" className="text-neutral-900 dark:text-white font-bold hover:underline">
                  View all 140+ →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Text */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-mono font-bold tracking-wider shadow-2xs">
              <span className="text-emerald-600 dark:text-emerald-400">02</span>
              <span className="text-neutral-300 dark:text-neutral-700">/</span>
              <span>IMMIGRATION & COURT BENCHMARK</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.08] font-display">
                Sworn certified compliance, <br />
                <span className="font-serif italic font-normal text-neutral-800 dark:text-neutral-200 block mt-1">
                  engineered instead of improvised.
                </span>
              </h2>
              <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Federal regulations (8 CFR § 204.2) and EOIR immigration courts require sworn translator competency, formal letterheads, and immutable chain-of-custody.
              </p>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Every VerifyLingua order is routed to an ATA-credentialed professional translator and independently peer-reviewed. Our digital verification ledger provides embassies and adjudicating officers with instant 24/7 online authentication.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 font-medium pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>USCIS 8 CFR § 103.2(b)(3) compliant Certificate of Translator Competency</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>State-licensed electronic notarization with wet-ink fidelity</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Immutable SHA-256 ledger hash for instant consular fraud verification</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/order/triage"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs sm:text-sm font-bold shadow-sm transition-all duration-150 active:scale-[0.97] group"
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
