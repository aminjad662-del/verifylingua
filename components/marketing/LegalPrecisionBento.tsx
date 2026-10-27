"use client";

import React, { useState } from "react";
import { 
  FileCheck2, 
  QrCode, 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  Lock,
  Layers,
  ArrowRight,
  BadgeCheck,
  Search,
  Copy,
  Check
} from "lucide-react";
import Link from "next/link";

export function LegalPrecisionBento() {
  const [hashCopied, setHashCopied] = useState(false);
  const [verifiedState, setVerifiedState] = useState(false);

  const copyHash = () => {
    navigator.clipboard?.writeText("7d4a98f1c830b201a4e89b210459c31e89b21d01");
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
  };

  return (
    <section className="py-16 sm:py-24 bg-canvas border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl text-left space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-brand-ink leading-tight">
            Engineered to Satisfy Strict Immigration Scrutiny
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Every foreign civil record is typeset to match original coordinates, certified by ATA corporate linguists, and cryptographically verified against public ledgers.
          </p>
        </div>

        {/* Asymmetric 7/5 + 5/7 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Cell 1: 1:1 Layout & Coordinate Preservation (Col Span 7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-800 flex items-center justify-center text-brand-600">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-brand-ink">
                1:1 Coordinate and Layout Preservation
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Adjudicators cross-reference original documents by eye. We preserve exact table columns, stamps, signatures, and registry folios so officers never question authenticity or suspect omitted clauses.
              </p>
            </div>

            {/* Authentic Side-by-Side Legal Coordinate Comparison */}
            <div className="p-4 rounded-xl bg-surface border border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Foreign Source Record */}
              <div className="p-3.5 rounded-lg bg-surface-raised border border-border space-y-2 text-left">
                <div className="flex items-center justify-between text-[10px] font-mono text-text-subtle">
                  <span>FOREIGN RECORD</span>
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">ES ORIGINAL</span>
                </div>
                <div className="font-serif text-[11px] text-text-muted border-l-2 border-amber-500/40 pl-2 space-y-0.5">
                  <div className="font-bold text-text text-[10px]">ACTA DE MATRIMONIO</div>
                  <div className="truncate">Contrayente: Alejandro Morales V.</div>
                  <div className="truncate">Registro Civil Folio: 4920-C</div>
                </div>
                <div className="pt-1 flex items-center gap-1.5 text-[10px] text-text-subtle font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Physical Seal at (X:142, Y:890)</span>
                </div>
              </div>

              {/* Certified English Translation */}
              <div className="p-3.5 rounded-lg bg-brand-50/40 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 space-y-2 text-left">
                <div className="flex items-center justify-between text-[10px] font-mono text-brand-700 dark:text-brand-300">
                  <span>CERTIFIED TRANSLATION</span>
                  <span className="text-status-success font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    1:1 ALIGNED
                  </span>
                </div>
                <div className="font-sans text-[11px] text-text-muted border-l-2 border-brand-500/50 pl-2 space-y-0.5">
                  <div className="font-bold text-brand-ink text-[10px]">MARRIAGE CERTIFICATE</div>
                  <div className="truncate">Spouse: Alejandro Morales V.</div>
                  <div className="truncate">Civil Registry Folio: 4920-C</div>
                </div>
                <div className="pt-1 flex items-center gap-1.5 text-[10px] text-brand-700 dark:text-brand-300 font-mono">
                  <BadgeCheck className="w-3.5 h-3.5 text-status-success shrink-0" />
                  <span>Coordinates Locked at 300 DPI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cell 2: Cryptographic SHA-256 Seal & Ledger (Col Span 5) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6 text-left">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-800 flex items-center justify-center text-brand-600">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-brand-ink">
                Tamper-Evident SHA-256 Seal
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Officers scan the embedded QR code to verify the immutable cryptographic digest against our public verification ledger, eliminating forgery concerns.
              </p>
            </div>

            {/* Interactive Hash Validator */}
            <div className="p-4 rounded-xl bg-surface border border-border space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-subtle text-[10px]">PUBLIC LEDGER STATUS</span>
                <span className="text-[10px] font-bold text-status-success bg-status-success/10 px-2 py-0.5 rounded border border-status-success/30">
                  {verifiedState ? "BLOCK NO. 8492 VERIFIED" : "IMMUTABLE DIGEST"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-raised border border-border text-[11px] text-text-muted gap-2">
                <span className="truncate">7d4a98f1c830b201a4e89b210459c31e...</span>
                <button
                  onClick={copyHash}
                  className="p-1 rounded hover:bg-surface text-text-muted hover:text-brand-ink transition-colors cursor-pointer shrink-0"
                  title="Copy SHA-256 hash"
                >
                  {hashCopied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-text-subtle pt-1">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-status-success" />
                  <span>Zero-knowledge validation</span>
                </span>
                <button
                  onClick={() => setVerifiedState(!verifiedState)}
                  className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer"
                >
                  {verifiedState ? "Reset check" : "Simulate adjudicator check"}
                </button>
              </div>
            </div>
          </div>

          {/* Cell 3: Sworn Translator Competence Affidavit (Col Span 5) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6 text-left">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-brand-ink">
                8 CFR § 103.2 Sworn Affidavit
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Every packet includes a sworn legal declaration of translator fluency, formal competence statement, and official ATA corporate seal accepted in federal tribunals.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-xs">
              <div className="font-bold text-amber-950 dark:text-amber-200 text-xs flex items-center justify-between">
                <span>Translator Certificate of Fluency</span>
                <span className="text-[10px] font-mono text-amber-800 dark:text-amber-400">ATA No. 278190</span>
              </div>
              <p className="text-[11px] text-amber-900 dark:text-amber-300 leading-snug">
                Signed under penalty of perjury under the laws of the United States. Admissible in federal court proceedings, consular interviews, and university reviews.
              </p>
            </div>
          </div>

          {/* Cell 4: Zero-Risk Acceptance & 4-Hour RFE Defense Warranty (Col Span 7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6 text-left">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-court-emerald/10 border border-court-emerald/25 flex items-center justify-center text-court-emerald">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-brand-ink">
                100% Acceptance and Free RFE Defense
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                If USCIS, an immigration court, or a university issues an inquiry regarding our translation, our senior legal staff drafts and dispatches a free supplemental response packet within 4 hours.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-brand-ink">Sovereign Compliance Guarantee</span>
                <p className="text-text-muted text-[11px]">
                  Free expedited re-certification response packet or 100% full refund on request.
                </p>
              </div>
              <Link
                href="/acceptance-guarantee"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 shrink-0 transition-colors"
              >
                <span>Read full warranty policy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}