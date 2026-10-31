"use client";

import React from "react";
import { CheckCircle2, XCircle, ShieldCheck, Scale, Award } from "lucide-react";

interface MatrixRow {
  feature: string;
  subtext: string;
  verifyLingua: string | boolean;
  traditionalAgency: string | boolean;
  uncertifiedFreelancer: string | boolean;
}

const COMPARISON_ROWS: MatrixRow[] = [
  {
    feature: "8 CFR § 103.2(b)(3) Compliance",
    subtext: "Formal competence affidavit signed by qualified translator under penalty of perjury",
    verifyLingua: true,
    traditionalAgency: true,
    uncertifiedFreelancer: false,
  },
  {
    feature: "ATA Corporate Member Seal",
    subtext: "Corporate membership credential stamp (No. 278190) recognized nationwide",
    verifyLingua: true,
    traditionalAgency: "Varies",
    uncertifiedFreelancer: false,
  },
  {
    feature: "Tamper-Evident SHA-256 QR Seal",
    subtext: "Digital instant verification for immigration officers and federal judges",
    verifyLingua: true,
    traditionalAgency: false,
    uncertifiedFreelancer: false,
  },
  {
    feature: "Standard Delivery SLA",
    subtext: "Deterministic promised turnaround time for foreign civil records and court filings",
    verifyLingua: "Under 24 Hours",
    traditionalAgency: "48 to 72 Hours",
    uncertifiedFreelancer: "Unpredictable",
  },
  {
    feature: "Certified Translation Rate",
    subtext: "Transparent flat rate per standard page with no hidden certification fees",
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
              ? "bg-brand-50 dark:bg-brand-950/60 text-brand-600 border border-brand-200 dark:border-brand-800"
              : "bg-surface text-text-muted border border-border"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-status-success" />
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
            : "text-text-muted font-medium"
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <section className="py-16 sm:py-24 bg-canvas border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl text-left space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-brand-ink leading-tight">
            How VerifyLingua Compares for USCIS Filings
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Transparent legal translation architecture designed specifically for immigration law firms, DOJ accredited representatives, and individual applicants.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="rounded-2xl border border-border bg-surface-raised shadow-xs overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  <th className="py-4 px-6 font-bold">Standard / Capability</th>
                  <th className="py-4 px-6 font-bold text-brand-600 bg-brand-50/50 dark:bg-brand-950/30 border-x border-border">
                    VerifyLingua
                  </th>
                  <th className="py-4 px-6 font-bold">Traditional Agency</th>
                  <th className="py-4 px-6 font-bold">Uncertified Freelancer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="hover:bg-surface/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-brand-ink text-xs">{row.feature}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">{row.subtext}</div>
                    </td>
                    <td className="py-4 px-6 bg-brand-50/20 dark:bg-brand-950/20 border-x border-border font-semibold">
                      {renderCell(row.verifyLingua, true)}
                    </td>
                    <td className="py-4 px-6">
                      {renderCell(row.traditionalAgency)}
                    </td>
                    <td className="py-4 px-6">
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