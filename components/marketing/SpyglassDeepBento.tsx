"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  QrCode,
  Stamp,
  Award,
  Lock,
  ArrowRight,
  Layers,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SpyglassDeepBento() {
  return (
    <section className="relative py-24 sm:py-32 bg-brand-ink text-white overflow-hidden border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        {/* Section Header matching "Watch. Search. Shoot." */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-brand-300 text-xs font-mono font-bold uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5 text-brand-300" />
            <span>Zero Rejection Methodology</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-display">
            Upload. Verify. Certify.
          </h2>

          <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
            Three precision layers engineered to eliminate USCIS Requests for Evidence (RFEs) and institutional delays.
          </p>
        </div>

        {/* 3 Stacked Feature Showcase Blocks inside deep dark container */}
        <div className="space-y-8">
          {/* Block 1: Left Text / Right UI Visual (1:1 Layout Preservation) */}
          <div className="p-8 sm:p-12 rounded-3xl bg-white/5 border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-300 uppercase tracking-wider">
                <FileCheck className="w-4 h-4" />
                <span>Layer 01 • Structural Mirroring</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                1:1 Layout-Preserving Typesetting
              </h3>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                Adjudicating officers reject translations when the visual structure does not match the foreign original.
                VerifyLingua mirrors every table, footnote, barcode, and embossed seal position so cross-referencing takes zero cognitive effort.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-white/80 pt-2 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Exact table coordinates, margins, and stamp placements</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full transcription of smudged or handwritten seal margins</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standardized [Seal:], [Signature:], and [Barcode:] annotations</span>
                </li>
              </ul>
            </div>

            {/* Right Visual: Side-by-Side Document Comparison Mockup */}
            <div className="lg:col-span-7 bg-brand-900/80 rounded-2xl p-4 sm:p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono pb-3 border-b border-white/10 text-white/60">
                <span className="flex items-center gap-1.5 text-white/90 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Live Layout Inspector
                </span>
                <span>Original (ES) ↔ Translation (EN)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {/* Original Document Mockup */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                    <span>ORIGINAL SOURCE</span>
                    <span className="text-amber-400">CDMX Registro</span>
                  </div>
                  <div className="text-xs font-bold text-white/90">
                    Acta de Nacimiento No. 49102
                  </div>
                  <div className="space-y-1 py-1" aria-hidden="true">
                    <div className="h-1.5 w-full bg-white/15 rounded" />
                    <div className="h-1.5 w-4/5 bg-white/15 rounded" />
                    <div className="h-1.5 w-3/4 bg-white/15 rounded" />
                  </div>
                  <div className="p-1.5 rounded border border-amber-500/30 bg-amber-950/30 text-[9px] font-mono text-amber-300 flex items-center justify-between">
                    <span>SELLO DE AGENCIA</span>
                    <Stamp className="w-3 h-3" />
                  </div>
                </div>

                {/* Certified Translation Counterpart */}
                <div className="p-3.5 rounded-xl bg-white/10 border border-brand-500/40 space-y-2 relative">
                  <div className="flex items-center justify-between text-[10px] font-mono text-brand-300 font-bold">
                    <span>CERTIFIED ENGLISH</span>
                    <span className="text-emerald-400">100% Mirror</span>
                  </div>
                  <div className="text-xs font-bold text-white">
                    Certified Birth Certificate No. 49102
                  </div>
                  <div className="space-y-1 py-1" aria-hidden="true">
                    <div className="h-1.5 w-full bg-brand-300/30 rounded" />
                    <div className="h-1.5 w-4/5 bg-brand-300/30 rounded" />
                    <div className="h-1.5 w-3/4 bg-brand-300/30 rounded" />
                  </div>
                  <div className="p-1.5 rounded border border-emerald-500/30 bg-emerald-950/30 text-[9px] font-mono text-emerald-300 flex items-center justify-between">
                    <span>[Official Seal: Civil Registry CDMX]</span>
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Block 2: Left UI Visual / Right Text (QR Ledger & Chain of Custody) */}
          <div className="p-8 sm:p-12 rounded-3xl bg-white/5 border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Visual: Interactive QR & Cryptographic Ledger */}
            <div className="lg:col-span-7 order-2 lg:order-1 bg-brand-900/80 rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono pb-3 border-b border-white/10 text-white/60">
                <span className="flex items-center gap-1.5 text-white/90 font-bold">
                  <QrCode className="w-4 h-4 text-brand-300" />
                  Consular Ledger Verification Node
                </span>
                <span className="text-emerald-400 font-bold">Active & Valid</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/40 text-[10px] block">DOCUMENT ID</span>
                  <span className="text-white font-bold">VL-2026-8941</span>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/40 text-[10px] block">LEDGER HASH</span>
                  <span className="text-brand-300 font-bold truncate block">
                    e7a9f...389c
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/40 text-[10px] block">AUDIT STATUS</span>
                  <span className="text-emerald-400 font-bold">USCIS Pre-Cleared</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 flex items-center justify-between">
                <span>Direct portal scan: Instant officer authentication without phone calls.</span>
                <Link
                  href="/verify/demo"
                  className="text-brand-300 hover:text-white font-bold underline text-xs shrink-0"
                >
                  Test Verification Node →
                </Link>
              </div>
            </div>

            {/* Right Text */}
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-300 uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Layer 02 • Cryptographic Custody</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Tamper-Proof QR Verification Ledger
              </h3>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                Every certificate issued carries an immutable digital identifier and dynamic QR code.
                Consulates, embassies, and USCIS adjudicators scan the QR code to verify the original certified PDF instantly on our public ledger.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-white/80 pt-2 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Public audit portal accessible 24/7/365</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero risk of document tampering or altered records</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Block 3: Left Text / Right UI Visual (Sworn ATA Competency & Notarization) */}
          <div className="p-8 sm:p-12 rounded-3xl bg-white/5 border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-300 uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Layer 03 • Legal Sworn Clause</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Sworn ATA Certificate of Competency
              </h3>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                Federal regulations (8 CFR § 204.2) mandate a sworn statement certifying the translator&apos;s competency in both languages.
                Every delivery includes a certified letterhead, ATA active member identifier, and optional electronic wet-ink notarization.
              </p>
              <div className="pt-2">
                <Link
                  href="/order/triage"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-ink text-sm font-bold hover:bg-white/90 transition-colors"
                >
                  <span>Start Certified Translation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Visual: Sworn Certificate Mockup */}
            <div className="lg:col-span-7 bg-brand-900/80 rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-mono font-bold text-white">
                    CERTIFICATION OF TRANSLATOR COMPETENCE
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    8 CFR § 204.2 Compliant
                  </span>
                </div>
                <p className="text-xs text-white/80 italic leading-relaxed">
                  &ldquo;I hereby certify that I am fluent in both Spanish and English, and that the above is a true, accurate, and complete translation of the official document to the best of my knowledge and belief.&rdquo;
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono text-white/60">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white">VerifyLingua Legal Certification Board</div>
                    <div className="text-[10px] text-white/40">ATA Corporate Member No. 27194</div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="text-emerald-400 font-bold">E-Notarized</div>
                    <div className="text-[10px] text-white/40">State of Delaware Reg. No. 5821</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
