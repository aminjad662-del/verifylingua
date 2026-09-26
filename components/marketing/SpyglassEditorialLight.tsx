"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Stamp,
  Award,
  ShieldCheck,
  QrCode,
  Lock,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SPECIMENS = [
  {
    id: "spec-1",
    tag: "CIVIL EMBOSSING",
    title: "Raised Registry Seals",
    desc: "100% full transcription of circular embossed ink and blind civil registry seals.",
    badge: "Transcribed [Seal:]",
    accent: "text-amber-800 dark:text-amber-300 bg-amber-500/10 border-amber-600/30",
    visual: (
      <div className="w-full h-11 rounded-lg border border-amber-600/20 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between px-2.5 text-[9px] font-mono text-amber-900 dark:text-amber-300">
        <div className="flex items-center gap-1.5 truncate">
          <div className="w-6 h-6 rounded-full border border-amber-600/40 flex items-center justify-center shrink-0">
            <Stamp className="w-3 h-3 text-amber-700 dark:text-amber-400" />
          </div>
          <span className="truncate font-bold">SELLO DE FE PÚBLICA</span>
        </div>
        <span className="text-[8px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 shrink-0 font-bold">
          100% MIRROR
        </span>
      </div>
    ),
  },
  {
    id: "spec-2",
    tag: "MARGIN NOTES",
    title: "Handwritten Marginalia",
    desc: "Subsequent amendments, marriages, and legitimacy decrees transcribed in brackets.",
    badge: "Legitimacy Verified",
    accent: "text-blue-800 dark:text-blue-300 bg-blue-500/10 border-blue-600/30",
    visual: (
      <div className="w-full h-11 rounded-lg border border-blue-600/20 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between px-2.5 text-[9px] font-mono text-blue-900 dark:text-blue-300">
        <div className="space-y-0.5 truncate">
          <div className="text-[8px] text-blue-700 dark:text-blue-400 font-bold truncate">NOTA MARGINAL No. 12</div>
          <div className="text-[8px] text-blue-900/70 dark:text-blue-300/70 italic truncate">&ldquo;Legitimado por matrimonio&rdquo;</div>
        </div>
        <span className="text-[8px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 shrink-0 font-bold">
          PRESERVED
        </span>
      </div>
    ),
  },
  {
    id: "spec-3",
    tag: "AUTHENTICATION",
    title: "Hague 1961 Apostilles",
    desc: "State department apostille certs transcribed with signatory title and convention stamp.",
    badge: "Hague Compliant",
    accent: "text-indigo-800 dark:text-indigo-300 bg-indigo-500/10 border-indigo-600/30",
    visual: (
      <div className="w-full h-11 rounded-lg border border-indigo-600/20 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between px-2.5 text-[9px] font-mono text-indigo-900 dark:text-indigo-300">
        <div className="flex items-center gap-1.5 truncate">
          <Award className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400 shrink-0" />
          <span className="truncate font-bold text-[9px]">CONVENTION DE LA HAYE</span>
        </div>
        <span className="text-[8px] px-1 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 shrink-0 font-bold">
          ACT NO. 8192
        </span>
      </div>
    ),
  },
  {
    id: "spec-4",
    tag: "BIOMETRICS",
    title: "Barcodes & QR Elements",
    desc: "Biometric codes transcribed and verified against registry databases with 1:1 coordinates.",
    badge: "1:1 Placement",
    accent: "text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border-emerald-600/30",
    visual: (
      <div className="w-full h-11 rounded-lg border border-emerald-600/20 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between px-2.5 text-[9px] font-mono text-emerald-900 dark:text-emerald-300">
        <div className="flex items-center gap-1.5 truncate">
          <QrCode className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span className="truncate font-bold text-[9px]">PDF417 / 2D CODE</span>
        </div>
        <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 shrink-0 font-bold">
          VERIFIED
        </span>
      </div>
    ),
  },
  {
    id: "spec-5",
    tag: "IDENTITY LOCK",
    title: "Dual Surname Purity",
    desc: "Paternal and maternal surnames preserved without unauthorized mergers or hyphens.",
    badge: "Passport Aligned",
    accent: "text-rose-800 dark:text-rose-300 bg-rose-500/10 border-rose-600/30",
    visual: (
      <div className="w-full h-11 rounded-lg border border-rose-600/20 bg-rose-50/50 dark:bg-rose-950/20 flex items-center justify-between px-2.5 text-[9px] font-mono text-rose-900 dark:text-rose-300">
        <div className="flex items-center gap-1.5 truncate">
          <Lock className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400 shrink-0" />
          <span className="truncate font-bold text-[9px]">DE LA TORRE MORALES</span>
        </div>
        <span className="text-[8px] px-1 py-0.5 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 shrink-0 font-bold">
          NO MERGE
        </span>
      </div>
    ),
  },
  {
    id: "spec-6",
    tag: "SWORN ATTESTATION",
    title: "ATA Signature Block",
    desc: "Sworn 8 CFR § 204.2 attestation clause on official corporate letterhead.",
    badge: "Court Admissible",
    accent: "text-purple-800 dark:text-purple-300 bg-purple-500/10 border-purple-600/30",
    visual: (
      <div className="w-full h-11 rounded-lg border border-purple-600/20 bg-purple-50/50 dark:bg-purple-950/20 flex items-center justify-between px-2.5 text-[9px] font-mono text-purple-900 dark:text-purple-300">
        <div className="flex items-center gap-1.5 truncate">
          <BadgeCheck className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400 shrink-0" />
          <span className="truncate font-bold text-[9px]">ATA MEMBER NO. 27194</span>
        </div>
        <span className="text-[8px] px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 shrink-0 font-bold">
          WET-INK SEAL
        </span>
      </div>
    ),
  },
];

export function SpyglassEditorialLight() {
  return (
    <section className="relative py-20 sm:py-28 bg-neutral-50/60 dark:bg-neutral-900/40 border-b border-neutral-200/80 dark:border-neutral-850">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Text */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-mono font-bold tracking-wider shadow-2xs">
              <span className="text-emerald-600 dark:text-emerald-400">01</span>
              <span className="text-neutral-300 dark:text-neutral-700">/</span>
              <span>DUAL-PAGE FORMAT FIDELITY</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.08] font-display">
                Format fidelity is half the brief. <br />
                <span className="font-serif italic font-normal text-neutral-800 dark:text-neutral-200 block mt-1">
                  We preserve the rest.
                </span>
              </h2>
              <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Consulates and immigration adjudicators compare foreign original documents side-by-side with translated certified copies. When tables shift or margin annotations are skipped, petitions are flagged.
              </p>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              VerifyLingua preserves the exact typographical hierarchy, table coordinates, and marginalia of the original record. Every raised seal, notary stamp, and handwritten registry notation is painstakingly transcribed and annotated.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 font-medium pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>1:1 spatial coordination matching original foreign formatting</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Standardized [Seal:], [Signature:], and [Barcode:] bracket notations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Full transcription of smudged, faint, or handwritten registry amendments</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/order/triage"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs sm:text-sm font-bold shadow-sm transition-all duration-150 active:scale-[0.97] group"
              >
                <span>Order Certified Translation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: 6-Card Bento Collage */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SPECIMENS.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200/90 dark:border-neutral-800 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-150 flex flex-col justify-between h-52 text-left group"
                >
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                      {item.tag}
                    </span>
                    <h3 className="text-xs font-bold text-neutral-950 dark:text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    {item.visual}
                    <div className={cn("px-2 py-0.5 rounded border text-[8px] font-mono font-bold truncate text-center", item.accent)}>
                      {item.badge}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
