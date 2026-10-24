import React from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, Building2, GraduationCap, Landmark, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const INSTITUTION_ROWS = [
  {
    id: "uscis",
    category: "Federal Immigration & Courts",
    icon: Landmark,
    description: "Form I-485 adjustment of status, I-130 family petitions, N-400 naturalization, and EOIR deportation defense.",
    agencies: [
      { name: "USCIS", type: "Federal" },
      { name: "EOIR Courts", type: "Judicial" },
      { name: "Dept of State", type: "Consular" },
      { name: "NVC", type: "Visa Center" },
    ],
    statute: "8 CFR 103.2(b)(3)",
    acceptanceRate: "100% Guaranteed",
  },
  {
    id: "academic",
    category: "Academic Credential Evaluators",
    icon: GraduationCap,
    description: "Foreign university transcripts, diplomas, syllabus records, and course-by-course equivalence evaluations.",
    agencies: [
      { name: "WES", type: "Evaluator" },
      { name: "ECE", type: "Evaluator" },
      { name: "Josef Silny", type: "Evaluator" },
      { name: "AACRAO", type: "Association" },
    ],
    statute: "WES Document Standard",
    acceptanceRate: "100% Guaranteed",
  },
  {
    id: "state",
    category: "State Governments, DMVs & Vital Records",
    icon: Building2,
    description: "REAL ID driver licensing, legal name changes, vital statistics registration, and county probate proceedings.",
    agencies: [
      { name: "State DMVs", type: "State Agency" },
      { name: "Vital Statistics", type: "Registry" },
      { name: "Social Security", type: "Federal" },
      { name: "Probate Courts", type: "State Court" },
    ],
    statute: "State Bar & DMV Rule 2.14",
    acceptanceRate: "100% Guaranteed",
  },
  {
    id: "consulates",
    category: "Foreign Consulates & International Embassies",
    icon: Globe,
    description: "Dual citizenship applications, Golden Visa filings, consular birth registrations, and cross-border legalizations.",
    agencies: [
      { name: "Spanish Consulate", type: "Schengen" },
      { name: "Italian Consulate", type: "Jure Sanguinis" },
      { name: "French Consulate", type: "European" },
      { name: "Canadian IRCC", type: "Commonwealth" },
    ],
    statute: "Hague Apostille Convention",
    acceptanceRate: "100% Guaranteed",
  },
];

export function InstitutionalAcceptanceStack() {
  return (
    <section className="py-20 md:py-32 bg-surface border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200/50 bg-brand-50/80 text-brand-500 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <span>Universal Institutional Acceptance</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-ink tracking-tight font-display">
            All Your Receiving Institutions, Accepted.
          </h2>

          <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
            Every document is certified to the precise legal standard of your receiving agency — with sworn affidavits, ATA translator credentials, and live digital verification.
          </p>
        </div>

        {/* Tabular Institutional Rows (Sunsama Integration Style) */}
        <div className="space-y-4">
          {INSTITUTION_ROWS.map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.id}
                className="p-6 md:p-8 rounded-[var(--r-xl)] bg-surface-raised border border-border/80 hover:border-brand-500/40 hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Category & Description */}
                <div className="space-y-2 lg:max-w-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-brand-ink font-display">
                        {row.category}
                      </h3>
                      <span className="text-xs font-mono font-semibold text-brand-500">
                        {row.statute}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed pl-13">
                    {row.description}
                  </p>
                </div>

                {/* Agency Pill Badges */}
                <div className="flex flex-wrap items-center gap-2 lg:justify-center">
                  {row.agencies.map((agency, i) => (
                    <div
                      key={i}
                      className="px-3.5 py-2 rounded-xl bg-surface border border-border/80 flex items-center gap-2 shadow-2xs hover:border-brand-500/30 transition-colors"
                    >
                      <span className="text-xs font-bold text-brand-ink font-mono">
                        {agency.name}
                      </span>
                      <span className="text-[10px] text-text-muted uppercase font-medium">
                        {agency.type}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Acceptance Guarantee Status */}
                <div className="flex items-center gap-3 shrink-0 lg:flex-col lg:items-end">
                  <Badge variant="success" className="gap-1.5 py-1 px-3 text-xs font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{row.acceptanceRate}</span>
                  </Badge>
                  <span className="text-[11px] text-text-muted font-mono">
                    Free Redo + Refund
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Link */}
        <div className="text-center pt-2">
          <Button asChild size="lg" className="gap-2 px-8 h-13 rounded-2xl font-bold shadow-md active:scale-[0.975]">
            <Link href="/order/precheck">
              Check acceptance for your institution
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
