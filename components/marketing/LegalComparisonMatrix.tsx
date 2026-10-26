"use client";

import React from "react";
import { CheckCircle2, XCircle, ShieldCheck, Scale, Award, AlertTriangle } from "lucide-react";

interface MatrixRow {
  feature: string;
  subtext: string;
  verifyLingua: string | boolean;
  traditionalAgency: string | boolean;
  uncertifiedFreelancer: string | boolean;
}

const COMPARISON_ROWS: MatrixRow[] = [
  {
    feature: "8 CFR § 103.2(b)(3) Statutory Compliance",
    subtext: "Formal competence affidavit signed by qualified linguist under penalty of perjury",
    verifyLingua: true,
    traditionalAgency: true,
    uncertifiedFreelancer: false,
  },
  {
    feature: "ATA Corporate Member Credential Seal",
    subtext: "Corporate membership credential stamp (No. 278190) recognized by all consular posts",
    verifyLingua: true,
    traditionalAgency: "Varies (Unreliable)",
    uncertifiedFreelancer: false,
  },
  {
    feature: "Tamper-Evident SHA-256 QR Seal",
    subtext: "Digital instant verification ledger for USCIS adjudicators and immigration judges",
    verifyLingua: true,
    traditionalAgency: false,
    uncertifiedFreelancer: false,
  },
  {
    feature: "1:1 Coordinate Format Preservation",
    subtext: "Preserves exact table columns, stamps, signatures, and registry folios",
    verifyLingua: true,
    traditionalAgency: "Manual / Approximate",
    uncertifiedFreelancer: false,
  },
  {
    feature: "Standard Delivery Turnaround SLA",
    subtext: "Guaranteed turnaround time for foreign civil records and court filings",
    verifyLingua: "Under 24 Hours",
    traditionalAgency: "48 to 72 Hours",
    uncertifiedFreelancer: "Unpredictable",
  },
  {
    feature: "Transparent Flat Rate per Page",
    subtext: "Transparent flat rate per standard page with no hidden certification surcharges",
    verifyLingua: "$24.95 / page",
    traditionalAgency: "$35 to $65 / page",
    uncertifiedFreelancer: "$20 to $50 / page",
  },
  {
    feature: "USCIS RFE Defense Warranty",
    subtext: "Free supplemental legal response packet dispatched within 4 hours if queried",
    verifyLingua: true,
    traditionalAgency: false,
    uncertifiedFreelancer: false,
  },
];

export function LegalComparisonMatrix() {
  const renderCell = (val: string | boolean, isPrimary = false) => {
    if (typeof val === "boolean") {
      return val ? (
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
            isPrimary
              ? "bg-court-emerald/10 text-court-emerald border border-court-emerald/25"
              : "bg-surface text-text-muted border border-border"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-court-emerald" />
        </span>
      ) : (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface text-text-subtle">
          <XCircle className="w-4 h-4 text-text-subtle" />
        </span>
      );
    }

    return (
      <span
        className={`text-xs ${
          isPrimary 
            ? "text-brand-600 font-bold" 
            : typeof val === "string" && val.includes("Varies")
            ? "text-amber-700 dark:text-amber-400 font-medium"
            : "text-text-muted font-medium"
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <section className="py-20 sm:py-28 bg-canvas border-b border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="max-w-3xl text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-raised">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-600">
              Procurement & Compliance Audit
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-brand-ink leading-tight">
            How VerifyLingua Compares for USCIS Filings
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Transparent legal translation architecture designed specifically for immigration law firms, DOJ-accredited representatives, and individual applicants.
          </p>
        </div>

        {/* Comparison Table Container */}
        <div className="rounded-2xl border border-border-strong/80 bg-surface-raised shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  <th className="py-5 px-6 font-bold w-2/5">Statutory Capability / Standard</th>
                  <th className="py-5 px-6 font-bold text-brand-600 bg-brand-50/40 dark:bg-brand-950/40 border-x border-border w-1/5">
                    <div className="flex items-center gap-1.5">
                      <span>VerifyLingua</span>
                      <span className="text-[9px] font-mono font-bold text-court-emerald bg-court-emerald/10 px-1.5 py-0.5 rounded">
                        CERTIFIED
                      </span>
                    </div>
                  </th>
                  <th className="py-5 px-6 font-bold w-1/5">Traditional Agency</th>
                  <th className="py-5 px-6 font-bold w-1/5">Uncertified Freelancer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="hover:bg-surface/60 transition-colors">
                    <td className="py-4.5 px-6">
                      <div className="font-bold text-brand-ink text-xs">{row.feature}</div>
                      <div className="text-[11px] text-text-muted mt-0.5 leading-snug">{row.subtext}</div>
                    </td>
                    <td className="py-4.5 px-6 bg-brand-50/20 dark:bg-brand-950/20 border-x border-border font-semibold">
                      {renderCell(row.verifyLingua, true)}
                    </td>
                    <td className="py-4.5 px-6">
                      {renderCell(row.traditionalAgency)}
                    </td>
                    <td className="py-4.5 px-6">
                      {renderCell(row.uncertifiedFreelancer)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}