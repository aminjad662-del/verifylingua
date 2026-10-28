"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Copy,
  Check,
  ShieldCheck
} from "lucide-react";

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
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-brand-ink leading-tight font-display">
            Engineered to Satisfy Strict Immigration Scrutiny
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Every foreign civil record is typeset to match original coordinates, certified by ATA corporate linguists, and cryptographically verified against public ledgers.
          </p>
        </div>

        {/* Asymmetric 7/5 + 5/7 Grid with Rich Background Diversity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Cell 1: 1:1 Layout & Coordinate Preservation (Col Span 7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-brand-ink">
                <Layers className="w-5 h-5 text-brand-ink" />
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
                  <span className="text-brand-ink font-semibold">ES ORIGINAL</span>
                </div>
                <div className="font-serif text-[11px] text-text-muted border-l-2 border-border-strong pl-2 space-y-0.5">
                  <div className="font-bold text-brand-ink text-[10px]">ACTA DE MATRIMONIO</div>
                  <div className="truncate">Contrayente: Alejandro Morales V.</div>
                  <div className="truncate">Registro Civil Folio: 4920-C</div>
                </div>
                <div className="pt-1 flex items-center gap-1.5 text-[10px] text-text-subtle font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-ink" />
                  <span>Physical Seal at (X:142, Y:890)</span>
                </div>
              </div>

              {/* Certified English Translation */}
              <div className="p-3.5 rounded-lg bg-surface-raised border border-border space-y-2 text-left">
                <div className="flex items-center justify-between text-[10px] font-mono text-brand-ink">
                  <span>CERTIFIED TRANSLATION</span>
                  <span className="text-brand-500 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 text-brand-500" />
                    1:1 ALIGNED
                  </span>
                </div>
                <div className="font-sans text-[11px] text-text-muted border-l-2 border-brand-500 pl-2 space-y-0.5">
                  <div className="font-bold text-brand-ink text-[10px]">MARRIAGE CERTIFICATE</div>
                  <div className="truncate">Spouse: Alejandro Morales V.</div>
                  <div className="truncate">Civil Registry Folio: 4920-C</div>
                </div>
                <div className="pt-1 flex items-center gap-1.5 text-[10px] text-brand-500 font-mono">
                  <BadgeCheck className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span>Coordinates Locked at 300 DPI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cell 2: Cryptographic SHA-256 Seal & Ledger (Col Span 5) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6 text-left">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-brand-ink">
                <QrCode className="w-5 h-5 text-brand-ink" />
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
                <span className="text-[10px] font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
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
                  {hashCopied ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-text-subtle pt-1">
                <span className="flex items-center gap-1.5 text-brand-ink">
                  <Lock className="w-3 h-3 text-brand-ink" />
                  <span>Zero-knowledge validation</span>
                </span>
                <button
                  onClick={() => setVerifiedState(!verifiedState)}
                  className="text-brand-500 hover:text-brand-600 font-semibold cursor-pointer active:scale-[0.98] transition-transform"
                >
                  {verifiedState ? "Reset check" : "Simulate adjudicator check"}
                </button>
              </div>
            </div>
          </div>

          {/* Cell 3: Sworn Translator Competence Affidavit (Col Span 5) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6 text-left">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-brand-ink">
                <Scale className="w-5 h-5 text-brand-ink" />
              </div>
              <h3 className="text-xl font-bold text-brand-ink">
                8 CFR § 103.2 Sworn Affidavit
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Every packet includes a sworn legal declaration of translator fluency, formal competence statement, and official ATA corporate seal accepted in federal tribunals.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-xs">
              <div className="font-bold text-brand-ink text-xs flex items-center justify-between">
                <span>Translator Certificate of Fluency</span>
                <span className="text-[10px] font-mono text-text-muted">ATA No. 278190</span>
              </div>
              <p className="text-[11px] text-text-muted leading-snug">
                Signed under penalty of perjury under the laws of the United States. Admissible in federal court proceedings, consular interviews, and university reviews.
              </p>
            </div>
          </div>

          {/* Cell 4: Visual Photographic Anchor - USCIS Acceptance Warranty (Col Span 7) */}
          <div className="lg:col-span-7 relative overflow-hidden rounded-2xl border border-neutral-800 shadow-md flex flex-col justify-between min-h-[300px] p-6 sm:p-8 text-white group">
            {/* Background Image Texture: Authentic Photographic Security Vault */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/trust-security-vault.jpg"
                alt="Cryptographic security vault with legal translation certificates and official seals"
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-center brightness-[0.45] contrast-[1.1] transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
            </div>

            {/* Overlaid Content */}
            <div className="relative z-10 space-y-3 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-medium text-white">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>USCIS Acceptance Warranty</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
                Comprehensive Acceptance Warranty and Free 4-Hour RFE Defense
              </h3>
              <p className="text-sm text-neutral-300 max-w-lg leading-relaxed">
                If USCIS, an immigration court, or an academic evaluator issues an inquiry regarding our translation, our senior legal staff drafts and dispatches a free supplemental response packet within 4 hours.
              </p>
            </div>

            <div className="relative z-10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-white/15">
              <span className="text-neutral-300 text-[11px] font-mono">
                Full compliance warranty • Free supplemental response or full refund
              </span>
              <Link
                href="/acceptance-guarantee"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-raised border border-border text-brand-ink font-bold hover:bg-surface transition-all active:scale-[0.98] shrink-0"
              >
                <span>Read warranty terms</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-ink" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
