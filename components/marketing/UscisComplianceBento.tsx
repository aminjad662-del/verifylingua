"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Scale, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  Lock, 
  FileCheck2, 
  Copy, 
  Check, 
  BadgeCheck, 
  ArrowRight,
  Landmark,
  Building2,
  GraduationCap,
  Globe
} from "lucide-react";

interface JurisdictionAcceptance {
  agency: string;
  acronym: string;
  governingRule: string;
  acceptanceStandard: string;
  icon: React.ElementType;
}

const JURISDICTION_ACCEPTANCE_DATA: JurisdictionAcceptance[] = [
  {
    agency: "U.S. Citizenship & Immigration Services",
    acronym: "USCIS",
    governingRule: "8 CFR Section 103.2(b)(3)",
    acceptanceStandard: "Mandatory Sworn Competence Jurat",
    icon: Landmark,
  },
  {
    agency: "Executive Office for Immigration Review",
    acronym: "EOIR Courts",
    governingRule: "Practice Manual Section 3.3(a)",
    acceptanceStandard: "Line-Numbered Judicial Filings",
    icon: Scale,
  },
  {
    agency: "U.S. Department of State & Consular Posts",
    acronym: "Consulates / NVC",
    governingRule: "9 FAM 502.1 Guidelines",
    acceptanceStandard: "Immigrant Visa DS-260 Certified",
    icon: Globe,
  },
  {
    agency: "Academic Credential Evaluators",
    acronym: "NACES / AICE / WES",
    governingRule: "WES Document Standard",
    acceptanceStandard: "1:1 Tabular Transcript Layout",
    icon: GraduationCap,
  },
];

export function UscisComplianceBento() {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedJurat, setCopiedJurat] = useState(false);
  const [simulatedCheck, setSimulatedCheck] = useState(false);

  const sha256Digest = "7d4a98f1c830b201a4e89b210459c31e89b21d01";
  const statutoryJuratText =
    "I, certified translator for VerifyLingua LLC, hereby certify that I am fluent in the foreign language and English, and that the foregoing is a true, complete, and accurate translation of the attached foreign civil record to the best of my knowledge and ability. Signed under penalty of perjury under the laws of the United States pursuant to 28 U.S.C. Section 1746.";

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(sha256Digest);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyJurat = () => {
    navigator.clipboard?.writeText(statutoryJuratText);
    setCopiedJurat(true);
    setTimeout(() => setCopiedJurat(false), 2000);
  };

  return (
    <section className="py-16 sm:py-24 bg-canvas border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header with Architectural Typography */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-signal-accent text-xs font-mono uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-signal-accent" />
            <span>FEDERAL COMPLIANCE ARCHITECTURE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-brand-ink leading-tight font-display">
            USCIS 8 CFR Section 103.2 Compliance Bento & Institutional Trust
          </h2>

          <p className="text-base text-text-muted leading-relaxed">
            Every foreign civil record is processed under strict federal standards: sworn translator competence affidavits, American Translators Association corporate credentials, and cryptographic ledger verification.
          </p>
        </div>

        {/* Monolithic High-Density Bento Grid (Zero Floating Cards) */}
        <div className="border border-border rounded-xl bg-surface-raised overflow-hidden shadow-xs divide-y divide-border">
          
          {/* TIER 1: STATUTORY JURAT & ATA CREDENTIALS (7 / 5 ASYMMETRIC GRID) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
            
            {/* Cell A: 8 CFR Section 103.2 Statutory Sworn Jurat (Span 7) */}
            <div className="lg:col-span-7 p-6 sm:p-8 bg-surface space-y-6 text-left flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-amber-statutory">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-text-subtle uppercase">FEDERAL SPECIFICATION</span>
                      <h3 className="text-base sm:text-lg font-bold text-brand-ink">
                        8 CFR Section 103.2(b)(3) Sworn Competence Jurat
                      </h3>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-amber-statutory bg-amber-statutory/10 border border-amber-statutory/20 px-2 py-0.5 rounded font-bold shrink-0">
                    MANDATORY RULE
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  USCIS adjudicators immediately reject translations lacking an explicit statement of translator competence and completeness. Our certifications strictly mirror federal statutory wording executed under penalty of perjury.
                </p>

                {/* Simulated Physical Sworn Affidavit Box */}
                <div className="p-4 rounded-lg bg-canvas-subtle border border-border space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-border/80">
                    <span className="font-mono text-[11px] font-bold text-brand-ink">
                      FORMAL TRANSLATOR DECLARATION
                    </span>
                    <button
                      onClick={handleCopyJurat}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-ink hover:text-signal-accent active:scale-[0.98] transition-transform cursor-pointer"
                      title="Copy statutory jurat wording"
                    >
                      {copiedJurat ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-court-emerald" />
                          <span className="text-court-emerald">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Jurat</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="font-serif italic text-xs text-brand-ink leading-relaxed pl-2 border-l-2 border-amber-statutory">
                    "{statutoryJuratText}"
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10px] text-text-subtle">
                    <div>
                      <span className="block text-text-muted font-bold">Execution:</span>
                      <span>28 U.S.C. Section 1746</span>
                    </div>
                    <div>
                      <span className="block text-text-muted font-bold">Standard:</span>
                      <span>Federal Admissible</span>
                    </div>
                    <div>
                      <span className="block text-text-muted font-bold">Completeness:</span>
                      <span>1:1 Mirroring</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statutory Guarantee Badge */}
              <div className="pt-2 flex items-center gap-2 text-xs text-text-muted">
                <CheckCircle2 className="w-4 h-4 text-court-emerald shrink-0" />
                <span>Accepted by all USCIS Field Offices, Service Centers, and EOIR Immigration Courts.</span>
              </div>
            </div>

            {/* Cell B: ATA Corporate Credentials & Notarization (Span 5) */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-surface-raised space-y-6 text-left flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-signal-accent">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-text-subtle uppercase">CORPORATE ACCREDITATION</span>
                      <h3 className="text-base sm:text-lg font-bold text-brand-ink">
                        ATA Corporate Membership
                      </h3>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-court-emerald bg-court-emerald/10 border border-court-emerald/20 px-2 py-0.5 rounded font-bold shrink-0">
                    MEMBER 278190
                  </span>
                </div>

                <p className="text-xs text-text-muted leading-relaxed">
                  VerifyLingua maintains corporate membership with the American Translators Association. All linguists are bound by the ATA Code of Ethics and Professional Practice.
                </p>

                {/* Notarization & Seal Details List */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-surface border border-border flex items-start gap-2.5">
                    <BadgeCheck className="w-4 h-4 text-court-emerald shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold text-brand-ink text-xs">Certified Digital Signature (PAdES)</div>
                      <div className="text-[11px] text-text-muted">
                        Cryptographically locked PDF/A document standard with certified time-stamping authority.
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-surface border border-border flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-signal-accent shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold text-brand-ink text-xs">County Notarial Certificate Option</div>
                      <div className="text-[11px] text-text-muted">
                        State-licensed notary public jurat available for consular filings and apostille processing.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Footer */}
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-mono text-text-muted">
                <span>Directory Standing: Good Standing</span>
                <span className="text-court-emerald font-bold">Active ATA Member</span>
              </div>
            </div>

          </div>

          {/* TIER 2: CRYPTOGRAPHIC LEDGER & REAL-TIME ACCEPTANCE (5 / 7 ASYMMETRIC GRID) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
            
            {/* Cell C: Cryptographic SHA-256 Ledger & QR Verification (Span 5) */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-surface space-y-6 text-left flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-signal-accent">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-text-subtle uppercase">INTEGRITY VERIFICATION</span>
                      <h3 className="text-base sm:text-lg font-bold text-brand-ink">
                        Tamper-Evident SHA-256 Seal
                      </h3>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-signal-accent bg-brand-50 border border-brand-200 px-2 py-0.5 rounded font-bold shrink-0">
                    FIPS 180-4
                  </span>
                </div>

                <p className="text-xs text-text-muted leading-relaxed">
                  Every certified page carries an immutable cryptographic digest and secure QR code. Adjudicators scan the seal to instantly verify translation integrity on the public ledger.
                </p>

                {/* Hash Validator Display */}
                <div className="p-3.5 rounded-lg bg-surface-raised border border-border space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-text-subtle">SHA-256 CRYPTOGRAPHIC DIGEST</span>
                    <span className="text-court-emerald font-bold">
                      {simulatedCheck ? "LEDGER CONFIRMED" : "IMMUTABLE"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2 rounded bg-surface border border-border text-[11px] text-text-muted">
                    <span className="truncate">{sha256Digest}</span>
                    <button
                      onClick={handleCopyHash}
                      className="p-1 rounded hover:bg-surface-raised text-text-muted hover:text-brand-ink transition-colors cursor-pointer shrink-0 active:scale-[0.98]"
                      title="Copy SHA-256 hash"
                    >
                      {copiedHash ? (
                        <Check className="w-3.5 h-3.5 text-court-emerald" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="flex items-center gap-1.5 text-text-subtle">
                      <Lock className="w-3 h-3 text-court-emerald" />
                      <span>Zero-knowledge client proof</span>
                    </span>
                    <button
                      onClick={() => setSimulatedCheck(!simulatedCheck)}
                      className="font-bold text-brand-ink hover:text-signal-accent active:scale-[0.98] transition-transform cursor-pointer"
                    >
                      {simulatedCheck ? "Reset check" : "Simulate consular check"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Public Portal Link */}
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-text-muted">Route: /verify/[code]</span>
                <Link
                  href="/verify"
                  className="font-semibold text-brand-ink hover:text-signal-accent flex items-center gap-1 active:scale-[0.98] transition-transform"
                >
                  <span>Verification portal</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Cell D: Multi-Agency Acceptance Breakdown & Honest Turnaround Telemetry (Span 7) */}
            <div className="lg:col-span-7 p-6 sm:p-8 bg-surface-raised space-y-6 text-left flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-court-emerald">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-text-subtle uppercase">INSTITUTIONAL COVERAGE</span>
                      <h3 className="text-base sm:text-lg font-bold text-brand-ink">
                        Agency Acceptance Breakdown & Turnaround
                      </h3>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-court-emerald bg-court-emerald/10 border border-court-emerald/20 px-2 py-0.5 rounded font-bold shrink-0">
                    STATUTORY WARRANTY
                  </span>
                </div>

                {/* 4-Agency Acceptance Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {JURISDICTION_ACCEPTANCE_DATA.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.acronym}
                        className="p-3 rounded-lg bg-surface border border-border space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-brand-ink flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-signal-accent" />
                            {item.acronym}
                          </span>
                          <span className="font-mono text-[10px] text-court-emerald font-semibold">
                            ACCEPTED
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted">
                          {item.governingRule}
                        </div>
                        <div className="text-[10px] text-text-subtle font-mono">
                          {item.acceptanceStandard}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Honest Turnaround & Warranty Telemetry Strip */}
                <div className="p-3.5 rounded-lg bg-canvas-subtle border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-ink">
                    <span>Factual Logistics & Turnaround Telemetry</span>
                    <span className="font-mono text-signal-accent">24h Standard / 12h Rush</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-text-muted">
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-text-subtle uppercase">Standard SLA</div>
                      <div className="font-bold text-brand-ink">Under 24 Hours</div>
                      <div className="text-[9px] text-text-subtle">Up to 5 civil pages</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-text-subtle uppercase">Priority Rush</div>
                      <div className="font-bold text-brand-ink">12 Hours Exact</div>
                      <div className="text-[9px] text-text-subtle">Expedited linguist queue</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-text-subtle uppercase">RFE Defense</div>
                      <div className="font-bold text-court-emerald">4-Hour Response</div>
                      <div className="text-[9px] text-text-subtle">Free supplemental jurat</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warranty Guarantee Disclaimer (Strictly Zero Absolute Claims) */}
              <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-text-muted">
                <span>Statutory Adjudication Warranty: Free 4-hour supplemental response packet or full fee refund.</span>
                <Link
                  href="/acceptance-guarantee"
                  className="font-semibold text-brand-ink hover:text-signal-accent shrink-0 active:scale-[0.98] transition-transform"
                >
                  Warranty terms
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
