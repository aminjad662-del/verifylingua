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
  Award,
  Crosshair,
  ShieldCheck,
  Check,
  Copy
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

interface CoordinateZone {
  id: string;
  name: string;
  coords: string;
  foreignText: string;
  translatedText: string;
  dpi: string;
}

const ZONES: CoordinateZone[] = [
  {
    id: "seal",
    name: "Civil Registry Embossed Seal",
    coords: "X: 142px · Y: 890px",
    foreignText: "SELLO DEL REGISTRO CIVIL DE GUADALAJARA, JALISCO",
    translatedText: "OFFICIAL SEAL OF THE CIVIL REGISTRY OF GUADALAJARA, JALISCO",
    dpi: "300 DPI Vector Overlay",
  },
  {
    id: "sign",
    name: "Registrar Signature & Folio",
    coords: "X: 380px · Y: 920px",
    foreignText: "Firma autógrafa del Oficial del Registro Civil Lic. E. Navarro",
    translatedText: "Handwritten signature of Civil Registry Official Lic. E. Navarro",
    dpi: "Exact Spatial Matching",
  },
  {
    id: "marginal",
    name: "Marginal Endorsement Note",
    coords: "X: 512px · Y: 110px",
    foreignText: "Anotación marginal: Legitimación y reconocimiento posterior",
    translatedText: "Marginal annotation: Subsequent legitimation and legal acknowledgment",
    dpi: "Preserved Coordinate Margin",
  },
];

export function LegalPrecisionBento() {
  const [selectedZone, setSelectedZone] = useState<CoordinateZone>(ZONES[0]);
  const [copiedHash, setCopiedHash] = useState(false);
  const [verifyingHash, setVerifyingHash] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(true);

  const handleVerify = () => {
    setVerifyingHash(true);
    setTimeout(() => {
      setVerifyingHash(false);
      setVerifiedSuccess(true);
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("7d4a98f1c830b201a4e89b210459c31e89b21d01");
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <section className="py-20 sm:py-28 bg-canvas border-b border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-raised">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-600">
                Precision Engineering Standard
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-brand-ink leading-tight">
              Engineered to Satisfy Strict Immigration Scrutiny
            </h2>
            <p className="text-base text-text-muted leading-relaxed">
              Every certified document is typeset to match original foreign coordinates, validated by certified linguists, and cryptographically verified against immutable public ledgers.
            </p>
          </div>

          <div className="shrink-0 text-left md:text-right font-mono text-xs text-text-muted">
            <span className="block text-[10px] uppercase text-text-subtle">Audit Standard</span>
            <span className="font-bold text-brand-ink">ISO 17100 · 8 CFR § 103.2</span>
          </div>
        </div>

        {/* Asymmetric Bento Grid (7/5 + 5/7 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Bento Cell 1: Interactive 1:1 Layout & Coordinate Calibrator (Col Span 7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-800 flex items-center justify-center text-brand-600">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-surface border border-border text-brand-ink">
                  COORDINATE ENGINE v4.2
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-brand-ink">
                1:1 Coordinate and Spatial Preservation
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Adjudicators cross-reference original documents by eye. We preserve exact table columns, stamps, signatures, and registry folios so officers never question authenticity or suspect missing clauses.
              </p>
            </div>

            {/* Interactive Zone Selector */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap gap-2">
                {ZONES.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      selectedZone.id === zone.id
                        ? "bg-brand-600 text-white border-brand-600 shadow-2xs"
                        : "bg-surface border-border text-text-muted hover:text-brand-ink hover:bg-surface-raised"
                    }`}
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>{zone.name}</span>
                  </button>
                ))}
              </div>

              {/* Side-by-side Aligned Inspector */}
              <div className="p-4 rounded-xl bg-canvas border border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Foreign Source Record */}
                <div className="p-3.5 rounded-lg bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-text-subtle">
                    <span>SOURCE RECORD (ES)</span>
                    <span className="text-amber-700 dark:text-amber-400 font-bold">ACTUAL COORDINATE</span>
                  </div>
                  <div className="font-serif text-[11px] text-text-muted border-l-2 border-amber-500/50 pl-2 space-y-1">
                    <div className="font-bold text-text text-[11px] leading-snug">
                      {selectedZone.foreignText}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-text-subtle pt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{selectedZone.coords}</span>
                  </div>
                </div>

                {/* Certified English Translation */}
                <div className="p-3.5 rounded-lg bg-brand-50/40 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-brand-700 dark:text-brand-300">
                    <span>CERTIFIED ENGLISH</span>
                    <span className="text-court-emerald font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      1:1 MATCH
                    </span>
                  </div>
                  <div className="font-sans text-[11px] text-text-muted border-l-2 border-brand-500/50 pl-2 space-y-1">
                    <div className="font-bold text-brand-ink text-[11px] leading-snug">
                      {selectedZone.translatedText}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-brand-700 dark:text-brand-300 pt-1 flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-court-emerald" />
                    <span>{selectedZone.dpi}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Cell 2: Live Tamper-Evident Cryptographic SHA-256 Seal (Col Span 5) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-800 flex items-center justify-center text-brand-600">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-court-emerald bg-court-emerald/10 px-2 py-0.5 rounded border border-court-emerald/25">
                  LIVE VALIDATOR
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-brand-ink">
                Tamper-Evident SHA-256 Seal
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Officers scan the embedded QR code to verify the immutable cryptographic digest against our public verification ledger, eliminating forgery concerns.
              </p>
            </div>

            {/* Cryptographic Validator Mock Console */}
            <div className="p-4 rounded-xl bg-canvas border border-border space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-text-subtle uppercase">IMMUTABLE BLOCK CHECKSUM</span>
                <button
                  onClick={handleVerify}
                  disabled={verifyingHash}
                  className="px-2 py-0.5 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 text-[10px] font-semibold border border-brand-200 transition-colors cursor-pointer"
                >
                  {verifyingHash ? "Validating..." : "Test Hash"}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between gap-2">
                <span className="text-text truncate text-[11px]">
                  7d4a98f1c830b201a4e89b210459c31e89b21d01
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-surface-raised text-text-muted hover:text-brand-ink transition-colors cursor-pointer shrink-0"
                  title="Copy SHA-256 Hash"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-court-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-text-subtle pt-1">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-court-emerald" />
                  <span>Zero-knowledge validation</span>
                </span>
                <span className="text-court-emerald font-semibold flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  Valid Certificate
                </span>
              </div>
            </div>
          </div>

          {/* Bento Cell 3: Sworn Translator Competence Affidavit (Col Span 5) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <Scale className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded border border-amber-500/30">
                  8 CFR § 103.2
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-brand-ink">
                Sworn Translator Competence Affidavit
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Every packet includes a sworn legal declaration of translator fluency, formal competence statement, and official ATA corporate seal accepted in federal tribunals.
              </p>
            </div>

            {/* Embossed Certificate Preview */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2.5 text-xs">
              <div className="font-bold text-amber-950 dark:text-amber-200 text-xs flex items-center justify-between">
                <span>Formal Translator Affidavit</span>
                <span className="text-[10px] font-mono text-amber-800 dark:text-amber-400">ATA No. 278190</span>
              </div>
              <p className="text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed font-sans">
                Signed under penalty of perjury under the laws of the United States. Admissible in federal court proceedings, consular interviews, and university reviews.
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 text-[10px] font-mono text-amber-800 dark:text-amber-400">
                <span>Legal Verification: ACTIVE</span>
                <span>Sworn Court Standard</span>
              </div>
            </div>
          </div>

          {/* Bento Cell 4: 100% Acceptance & 4-Hour RFE Defense Warranty (Col Span 7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-court-emerald/10 border border-court-emerald/25 flex items-center justify-center text-court-emerald">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-court-emerald bg-court-emerald/10 px-2.5 py-0.5 rounded border border-court-emerald/30">
                  4-HOUR DISPATCH SLA
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-brand-ink">
                100% Acceptance and Free RFE Defense
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                If USCIS, an immigration court, or a university issues an inquiry regarding our translation, our senior legal staff drafts and dispatches a free supplemental response packet within 4 hours.
              </p>
            </div>

            {/* SLA Guarantee Box */}
            <div className="p-4 rounded-xl bg-canvas border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-court-emerald" />
                  <span className="font-bold text-brand-ink">Sovereign Warranty Protection</span>
                </div>
                <p className="text-text-muted text-[11px]">
                  Free supplemental re-certification response packet or 100% full refund on request.
                </p>
              </div>
              <Link
                href="/acceptance-guarantee"
                className="h-9 px-4 rounded-lg bg-surface hover:bg-surface-raised border border-border text-brand-600 hover:text-brand-700 font-semibold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors"
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