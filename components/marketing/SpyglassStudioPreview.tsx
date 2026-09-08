"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  QrCode,
  ArrowRight,
  Eye,
  FileCheck,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SpyglassStudioPreview() {
  return (
    <section className="relative py-24 sm:py-32 bg-brand-ink text-white overflow-hidden border-b border-white/10">
      {/* Subtle ambient spotlight */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-brand-500/10 blur-[150px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Editorial Headline & CounselDesk Description matching Spyglass reference */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-brand-300 text-xs font-mono font-bold uppercase tracking-widest">
              <Eye className="w-3.5 h-3.5 text-brand-300" />
              <span>Interactive Proofing Studio™</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight text-white font-display leading-[1.06]">
                The translation is half the motion. <br />
                <span className="font-serif italic font-normal text-brand-300 block mt-1">
                  The CounselDesk™ studio proves it.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                Attorneys and filers review translations side-by-side with original scans, inspect locked legal names, verify ATA credentials, and download tamper-proof certified dossiers.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-white/90 font-medium pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bilingual segment review with locked legal terms & names</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Court-admissible certificate preview with ATA Member No. 27194</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant QR node verification for consular adjudicators</span>
              </li>
            </ul>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/counsel"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 group"
              >
                <span>Open CounselDesk™ Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/order/VL-DEMO1/proof"
                className="text-xs sm:text-sm text-white/60 hover:text-white font-mono transition-colors underline"
              >
                Live Interactive Demo →
              </Link>
            </div>
          </div>

          {/* Right Column: High-Density Dark Software Studio Preview Window */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-brand-900/90 shadow-2xl overflow-hidden text-left">
              {/* Top Window Titlebar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-white/70 truncate">
                    Matter_A8291_BirthCert_CDMX.pdf
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Sealed
                  </span>
                </div>
              </div>

              {/* Studio Workspace Layout */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Segment Workbench */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono text-white/60">
                  <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                    <Terminal className="w-3.5 h-3.5 text-brand-300" />
                    Bilingual Segment Review
                  </span>
                  <span className="text-emerald-400 font-bold text-[10px]">100% Match Confidence</span>
                </div>

                {/* Segment 1 */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] font-mono text-white/50">
                    <span>SEGMENT 01 • DOCUMENT TITLE</span>
                    <span className="text-brand-300">LOCKED LEGAL TERM</span>
                  </div>
                  <div className="text-[11px] text-white/70 font-mono">
                    <span className="text-amber-400">ES:</span> COPIA CERTIFICADA DE ACTA DE NACIMIENTO
                  </div>
                  <div className="text-[11px] text-white font-mono font-bold">
                    <span className="text-emerald-400">EN:</span> CERTIFIED COPY OF BIRTH CERTIFICATE
                  </div>
                </div>

                {/* Segment 2 */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] font-mono text-white/50">
                    <span>SEGMENT 02 • OFFICIAL SEAL</span>
                    <span className="text-amber-400">100% SEAL MIRROR</span>
                  </div>
                  <div className="text-[11px] text-white/70 font-mono">
                    <span className="text-amber-400">ES:</span> [SELLO: REGISTRO CIVIL DE LA CIUDAD DE MÉXICO]
                  </div>
                  <div className="text-[11px] text-white font-mono font-bold">
                    <span className="text-emerald-400">EN:</span> [Official Seal: Civil Registry of Mexico City]
                  </div>
                </div>

                {/* Segment 3 */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] font-mono text-white/50">
                    <span>SEGMENT 03 • NAME INTEGRITY</span>
                    <span className="text-emerald-400">PASSPORT LOCKED</span>
                  </div>
                  <div className="text-[11px] text-white/70 font-mono">
                    <span className="text-amber-400">ES:</span> NOMBRE DEL REGISTRADO: JUAN CARLOS DE LA TORRE MORALES
                  </div>
                  <div className="text-[11px] text-white font-mono font-bold">
                    <span className="text-emerald-400">EN:</span> REGISTERED PERSON: JUAN CARLOS DE LA TORRE MORALES
                  </div>
                </div>

                {/* Micro Certificate Footer Bar */}
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-white/70">
                    <QrCode className="w-6 h-6 text-brand-300 p-0.5 rounded bg-white/10 shrink-0" />
                    <div>
                      <div className="text-white font-bold text-[10px]">Consular Ledger Node</div>
                      <div className="text-white/40 text-[8px]">SHA256: 9e4f...a812</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    ATA Member No. 27194
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
