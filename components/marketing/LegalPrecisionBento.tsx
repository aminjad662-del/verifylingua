"use client";

import React from "react";
import { 
  FileCheck2, 
  QrCode, 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  Lock,
  Layers,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export function LegalPrecisionBento() {
  return (
    <section className="py-16 sm:py-24 bg-canvas border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl text-left space-y-3">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
            Precision Translation Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-ink leading-tight">
            Engineered to Satisfy Strict Immigration Scrutiny
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Every legal document is typeset to match original foreign coordinates, certified by ATA corporate linguists, and cryptographically verified.
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Bento Cell 1: 1:1 Layout & Coordinate Preservation (Col Span 7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-brand-ink">
                1:1 Coordinate & Layout Preservation
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Adjudicators cross-reference original documents by eye. We preserve exact table columns, stamps, signatures, and registry folios so officers never question authenticity.
              </p>
            </div>

            {/* Visual Micro-Comparison Widget */}
            <div className="p-4 rounded-xl bg-surface border border-border grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-surface-raised border border-border space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-text-subtle">
                  <span>FOREIGN RECORD</span>
                  <span className="text-amber-600 font-semibold">ES ORIGINAL</span>
                </div>
                <div className="h-1.5 w-3/4 bg-slate-200 rounded" />
                <div className="h-1.5 w-full bg-slate-200 rounded" />
                <div className="h-1.5 w-1/2 bg-slate-200 rounded" />
                <div className="pt-2 flex items-center gap-1.5 text-[10px] text-text-subtle font-mono">
                  <div className="w-4 h-4 rounded-full border border-amber-400 bg-amber-50 flex items-center justify-center text-[8px] font-bold text-amber-700">
                    S
                  </div>
                  <span>Registry Seal No. 04</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-brand-50/50 border border-brand-200 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-brand-700">
                  <span>CERTIFIED TRANSLATION</span>
                  <span className="text-status-success font-semibold">1:1 MATCH</span>
                </div>
                <div className="h-1.5 w-3/4 bg-brand-200 rounded" />
                <div className="h-1.5 w-full bg-brand-200 rounded" />
                <div className="h-1.5 w-1/2 bg-brand-200 rounded" />
                <div className="pt-2 flex items-center gap-1.5 text-[10px] text-brand-700 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                  <span>Aligned Coordinate Seal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Cell 2: Cryptographic QR & SHA-256 Ledger (Col Span 5) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-brand-ink">
                Tamper-Evident SHA-256 Seal
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Officers scan the embedded QR code to verify the immutable cryptographic digest against our public verification ledger.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-subtle text-[10px]">DIGEST STATUS</span>
                <span className="text-[10px] font-bold text-status-success bg-green-50 px-2 py-0.5 rounded border border-green-200">
                  VERIFIED ORIGINAL
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-raised border border-border text-[11px] text-text-muted truncate">
                7d4a98f1c830b201a4e89b210459c31e
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-text-subtle">
                <Lock className="w-3 h-3 text-status-success" />
                <span>Zero digital tampering guaranteed</span>
              </div>
            </div>
          </div>

          {/* Bento Cell 3: Sworn Translator Competence Affidavit (Col Span 5) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-brand-ink">
                8 CFR § 103.2 Sworn Affidavit
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Every packet includes a sworn legal declaration of translator fluency, formal competence statement, and official ATA corporate seal.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs">
              <div className="font-bold text-amber-950 text-xs">
                Translator Competence Certificate
              </div>
              <p className="text-[11px] text-amber-900 leading-snug">
                Signed under penalty of perjury under the laws of the United States. Admissible in federal court and consular interviews.
              </p>
              <div className="text-[10px] font-mono text-amber-800 pt-1">
                Corporate Member No. 278190
              </div>
            </div>
          </div>

          {/* Bento Cell 4: Zero-Risk USCIS RFE Defense Warranty (Col Span 7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-status-success">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-brand-ink">
                100% Acceptance & RFE Defense Warranty
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                If USCIS, an immigration court, or a university issues an inquiry regarding our translation, our senior legal staff drafts and dispatches a free supplemental response packet within 4 hours.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-brand-ink">Comprehensive Guarantee</span>
                <p className="text-text-muted text-[11px]">
                  Free supplemental re-affidavit packet or 100% full refund on request.
                </p>
              </div>
              <Link
                href="/acceptance-guarantee"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 shrink-0"
              >
                <span>Read Full Warranty</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
