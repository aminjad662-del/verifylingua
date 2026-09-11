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
    accent: "text-amber-800 bg-amber-500/10 border-amber-600/30 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-500/30",
    visual: (
      <div className="w-full h-12 rounded-lg border border-amber-600/20 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/30 flex items-center justify-between px-2.5 text-[9px] font-mono text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-1.5 truncate">
          <div className="w-7 h-7 rounded-full border border-amber-600/40 dark:border-amber-500/40 flex items-center justify-center shrink-0">
            <Stamp className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          </div>
          <span className="truncate font-bold">SELLO DE FE PÚBLICA</span>
        </div>
        <span className="text-[8px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 shrink-0 font-bold">
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
    accent: "text-blue-800 bg-blue-500/10 border-blue-600/30 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-500/30",
    visual: (
      <div className="w-full h-12 rounded-lg border border-blue-600/20 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/30 flex items-center justify-between px-2.5 text-[9px] font-mono text-blue-900 dark:text-blue-200">
        <div className="space-y-0.5 truncate">
          <div className="text-[8px] text-blue-700 dark:text-blue-300 font-bold truncate">NOTA MARGINAL No. 12</div>
          <div className="text-[8px] text-blue-900/70 dark:text-blue-200/70 italic truncate">&ldquo;Legitimado por matrimonio&rdquo;</div>
        </div>
        <span className="text-[8px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 shrink-0 font-bold">
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
    accent: "text-indigo-800 bg-indigo-500/10 border-indigo-600/30 dark:text-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-500/30",
    visual: (
      <div className="w-full h-12 rounded-lg border border-indigo-600/20 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center justify-between px-2.5 text-[9px] font-mono text-indigo-900 dark:text-indigo-200">
        <div className="flex items-center gap-1.5 truncate">
          <Award className="w-4 h-4 text-indigo-700 dark:text-indigo-400 shrink-0" />
          <span className="truncate font-bold text-[9px]">CONVENTION DE LA HAYE</span>
        </div>
        <span className="text-[8px] px-1 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 shrink-0 font-bold">
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
    accent: "text-emerald-800 bg-emerald-500/10 border-emerald-600/30 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-500/30",
    visual: (
      <div className="w-full h-12 rounded-lg border border-emerald-600/20 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between px-2.5 text-[9px] font-mono text-emerald-900 dark:text-emerald-200">
        <div className="flex items-center gap-2 truncate">
          <QrCode className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span className="truncate font-bold text-[9px]">PDF417 / 2D CODE</span>
        </div>
        <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 shrink-0 font-bold">
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
    accent: "text-rose-800 bg-rose-500/10 border-rose-600/30 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-500/30",
    visual: (
      <div className="w-full h-12 rounded-lg border border-rose-600/20 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/30 flex items-center justify-between px-2.5 text-[9px] font-mono text-rose-900 dark:text-rose-200">
        <div className="flex items-center gap-1.5 truncate">
          <Lock className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400 shrink-0" />
          <span className="truncate font-bold text-[9px]">DE LA TORRE MORALES</span>
        </div>
        <span className="text-[8px] px-1 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 shrink-0 font-bold">
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
    accent: "text-purple-800 bg-purple-500/10 border-purple-600/30 dark:text-purple-300 dark:bg-purple-950/40 dark:border-purple-500/30",
    visual: (
      <div className="w-full h-12 rounded-lg border border-purple-600/20 dark:border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/30 flex items-center justify-between px-2.5 text-[9px] font-mono text-purple-900 dark:text-purple-200">
        <div className="flex items-center gap-1.5 truncate">
          <BadgeCheck className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0" />
          <span className="truncate font-bold text-[9px]">ATA MEMBER NO. 27194</span>
        </div>
        <span className="text-[8px] px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 shrink-0 font-bold">
          WET-INK SEAL
        </span>
      </div>
    ),
  },
];

export function SpyglassEditorialLight() {
  return (
    <section className="relative py-24 sm:py-32 bg-canvas border-b border-border/40 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Text matching Spyglass reference */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border dark:border-white/15 bg-surface dark:bg-white/5 text-brand-ink dark:text-slate-200 text-xs font-mono font-bold tracking-wider">
              <span className="text-brand-500">01</span>
              <span>/</span>
              <span>DUAL-PAGE FORMAT FIDELITY</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-brand-ink dark:text-white leading-[1.06] font-display">
                Format fidelity is half the brief. <br />
                <span className="font-serif italic font-normal text-brand-900 dark:text-slate-300 block mt-1">
                  We preserve the rest.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-text-muted dark:text-slate-400 leading-relaxed">
                Consulates and immigration adjudicators compare foreign original documents side-by-side with translated certified copies. When tables shift or margin annotations are skipped, petitions are flagged.
              </p>
            </div>

            <p className="text-sm text-text-muted dark:text-slate-400 leading-relaxed">
              VerifyLingua preserves the exact typographical hierarchy, table coordinates, and marginalia of the original record. Every raised seal, notary stamp, and handwritten registry notation is painstakingly transcribed and annotated.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm text-brand-ink dark:text-slate-200 font-medium pt-2">
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

            <div className="pt-3">
              <Link
                href="/order/triage"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-brand-ink hover:bg-brand-900 text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 text-sm font-bold shadow transition-all active:scale-95 group"
              >
                <span>Order Certified Translation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: 6-Card Bento Collage with Rich Visual Specimens matching Spyglass */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
              {SPECIMENS.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-surface-raised dark:bg-slate-900/80 border border-border/80 dark:border-white/10 shadow-sm hover:shadow-md hover:border-brand-500/50 dark:hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-56 sm:h-60 text-left group"
                >
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-text-subtle dark:text-slate-400 block">
                      {item.tag}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-brand-ink dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-text-muted dark:text-slate-400 leading-tight line-clamp-2">
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
