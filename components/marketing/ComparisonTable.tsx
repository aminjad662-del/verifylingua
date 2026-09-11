import { Check, X, ShieldCheck, ArrowRight, AlertTriangle, FileX, FileCheck2, QrCode, Clock, Lock, Sparkles, XCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const COMPARISON_ROWS = [
  {
    feature: "Standard Certified Flat Rate",
    verifyLingua: "$24.95 / page",
    rushTranslate: "$24.95 / page",
    immiTranslate: "$25.00 / page",
    translayte: "$31.75 / page",
    isPrice: true,
  },
  {
    feature: "Pre-Payment Document Quality Triage",
    subtext: "Detects low-res, cropped seals & handwriting issues BEFORE you pay",
    verifyLingua: true,
    rushTranslate: false,
    immiTranslate: false,
    translayte: false,
  },
  {
    feature: "Acceptance Pre-Check Wizard",
    subtext: "Pre-configures order to exact receiving agency spec (USCIS/Courts)",
    verifyLingua: true,
    rushTranslate: false,
    immiTranslate: false,
    translayte: false,
  },
  {
    feature: "Passport Name & Date Consistency Lock",
    subtext: "Hard-locks passport transliterations to prevent silent RFE rejections",
    verifyLingua: true,
    rushTranslate: false,
    immiTranslate: false,
    translayte: false,
  },
  {
    feature: "Deterministic Promised Delivery Datetime",
    subtext: "Exact time promise ('Tue 9:00 AM') with notary batch delay included",
    verifyLingua: true,
    rushTranslate: false,
    immiTranslate: false,
    translayte: false,
  },
  {
    feature: "Public Cryptographic QR Verification Portal",
    subtext: "Allows receiving officers to instantly verify SHA-256 hash & credentials",
    verifyLingua: true,
    rushTranslate: false,
    immiTranslate: false,
    translayte: false,
  },
  {
    feature: "USCIS Rejection Protection Policy",
    verifyLingua: "Free Redo + 100% Full Refund",
    rushTranslate: "Free Redo Only",
    immiTranslate: "Standard Redo",
    translayte: "Standard Redo",
    isHighlight: true,
  },
];

export function ComparisonTable() {
  return (
    <section className="py-20 md:py-32 bg-canvas border-b border-border/60 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-500 dark:text-brand-400">
            System Architecture Comparison
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-ink dark:text-white tracking-tight font-display">
            Why Traditional Translation Fails USCIS
          </h2>
          <p className="text-base sm:text-lg text-ink-soft dark:text-slate-300 leading-relaxed">
            Incumbent agencies treat immigration translation like generic copy typing. We engineered a deterministic, layout-preserving pipeline built specifically to eliminate the 6 failure points that trigger USCIS Requests for Evidence (RFEs).
          </p>
        </div>

        {/* Sunsama-Style Side-by-Side Diagnostic Module */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Traditional Agency Reality */}
          <div className="rounded-[var(--r-2xl)] border border-status-danger/25 bg-surface dark:bg-slate-900/60 dark:border-rose-500/30 p-7 sm:p-9 space-y-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-border dark:border-white/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-status-danger/10 border border-status-danger/20 text-status-danger text-xs font-mono font-bold uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Traditional Agency Reality</span>
              </div>
              <span className="text-xs font-mono text-status-danger font-bold">
                High Risk of RFE
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-brand-ink dark:text-white tracking-tight font-display">
                Manual Retyping & Layout Destruction
              </h3>
              <p className="text-sm text-text-muted dark:text-slate-400 leading-relaxed">
                Agencies farm out files to freelance generalists who retype text into blank Word templates, destroying seals, table coordinates, and margins.
              </p>
            </div>

            {/* Diagnostic Failure List */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-status-danger/[0.04] dark:bg-rose-950/20 border border-status-danger/15 dark:border-rose-500/20">
                <XCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-brand-ink dark:text-white">Scrambled Tables & Broken Margins</p>
                  <p className="text-[11px] text-text-muted dark:text-slate-400 leading-normal">
                    Complex birth registries and academic transcripts lose row/column alignment, forcing USCIS adjudicators to reject on legibility grounds.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-status-danger/[0.04] dark:bg-rose-950/20 border border-status-danger/15 dark:border-rose-500/20">
                <XCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-brand-ink dark:text-white">Transliteration Name Drift</p>
                  <p className="text-[11px] text-text-muted dark:text-slate-400 leading-normal">
                    Linguists guess surname spelling without checking your passport. A single letter mismatch between translation and passport triggers a 90-day RFE.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-status-danger/[0.04] dark:bg-rose-950/20 border border-status-danger/15 dark:border-rose-500/20">
                <XCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-brand-ink dark:text-white">Unverifiable Paper Stamp</p>
                  <p className="text-[11px] text-text-muted dark:text-slate-400 leading-normal">
                    Static ink stamps have zero digital verification. Consulates have no way to authenticate the translator without physical mail delays.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-status-danger/[0.04] dark:bg-rose-950/20 border border-status-danger/15 dark:border-rose-500/20">
                <XCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-brand-ink dark:text-white">Blind Upfront Payments</p>
                  <p className="text-[11px] text-text-muted dark:text-slate-400 leading-normal">
                    You pay upfront with zero feedback. Days later, an email arrives stating your notary seal was cut off and your deadline is missed.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border dark:border-white/10 flex items-center justify-between text-xs font-mono text-text-muted dark:text-slate-400">
              <span>Failure Mode: Bureaucratic RFE</span>
              <span className="text-status-danger font-bold">Avg. Delay: 6–12 Weeks</span>
            </div>
          </div>

          {/* Right Panel: VerifyLingua Precision Architecture */}
          <div className="rounded-[var(--r-2xl)] border-2 border-brand-500/40 bg-surface-raised dark:bg-slate-900/90 dark:border-brand-400/50 p-7 sm:p-9 space-y-6 shadow-xl relative overflow-hidden dark:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
            {/* Subtle glow badge */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-border dark:border-white/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-status-success/10 border border-status-success/30 text-status-success text-xs font-mono font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                <span>VerifyLingua Precision Architecture</span>
              </div>
              <span className="text-xs font-mono text-status-success font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                100% Acceptance
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-brand-ink dark:text-white tracking-tight font-display">
                Exact Coordinate & Layout Preservation
              </h3>
              <p className="text-sm text-text-muted dark:text-slate-400 leading-relaxed">
                Our dual OpenXML & PDF coordinate engine reconstructs translated text inside the exact original table cells, stamps, and margins.
              </p>
            </div>

            {/* Architectural Solutions List */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-status-success/[0.04] dark:bg-emerald-950/20 border border-status-success/20 dark:border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-brand-ink dark:text-white">1:1 Format Round-Trip</p>
                  <p className="text-[11px] text-text-muted dark:text-slate-400 leading-normal">
                    PDFs return as certified PDFs; DOCX returns as styled DOCX with all tables, runs, and headers intact. Scans return as high-res certified documents.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-status-success/[0.04] dark:bg-emerald-950/20 border border-status-success/20 dark:border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-brand-ink dark:text-white">Passport Transliteration Lock</p>
                  <p className="text-[11px] text-text-muted dark:text-slate-400 leading-normal">
                    You lock exact spelling to your passport MRZ line. Our system enforces this transliteration throughout all certificates and affidavits.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-status-success/[0.04] dark:bg-emerald-950/20 border border-status-success/20 dark:border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-brand-ink dark:text-white">Cryptographic QR Verification Ledger</p>
                  <p className="text-[11px] text-text-muted dark:text-slate-400 leading-normal">
                    Every certified page carries an immutable SHA-256 digital stamp and live QR link. Officers authenticate credentials in 1 click.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-status-success/[0.04] dark:bg-emerald-950/20 border border-status-success/20 dark:border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-brand-ink dark:text-white">Free Pre-Payment Clarity Triage</p>
                  <p className="text-[11px] text-text-muted dark:text-slate-400 leading-normal">
                    Our triage auditor inspects resolution, seals, and page orientation before you pay. Zero surprises, guaranteed USCIS compliance.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border dark:border-white/10 flex items-center justify-between text-xs font-mono text-text-muted dark:text-slate-400">
              <span>Standard: 8 CFR 103.2(a)(3)</span>
              <span className="text-brand-500 dark:text-brand-400 font-bold">100% Money-Back Guarantee</span>
            </div>
          </div>
        </div>

        {/* Comparison Table Container */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-brand-ink dark:text-white font-display">
                Feature-by-Feature Incumbent Matrix
              </h3>
              <p className="text-xs text-text-muted dark:text-slate-400">
                Side-by-side technical evaluation against industry incumbents.
              </p>
            </div>
            <span className="text-xs font-mono text-brand-500 dark:text-brand-400 font-bold">
              Flat $24.95 / Page Rate
            </span>
          </div>

          <div className="overflow-x-auto rounded-[var(--r-xl)] border border-border/80 dark:border-white/10 bg-surface-raised dark:bg-slate-900/80 shadow-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border dark:border-white/10 bg-surface dark:bg-slate-950/60">
                  <th className="p-5 md:p-6 text-sm md:text-base font-bold text-brand-ink dark:text-white min-w-[280px]">
                    Feature / Capability
                  </th>
                  <th className="p-5 md:p-6 text-center bg-brand-50/80 dark:bg-brand-950/50 border-x-2 border-brand-500 min-w-[200px]">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500 dark:text-brand-400">
                        Our Service
                      </span>
                      <p className="text-lg md:text-xl font-black text-brand-ink dark:text-white">VerifyLingua</p>
                    </div>
                  </th>
                  <th className="p-5 md:p-6 text-center text-sm md:text-base font-semibold text-text-muted dark:text-slate-400 min-w-[160px]">
                    RushTranslate
                  </th>
                  <th className="p-5 md:p-6 text-center text-sm md:text-base font-semibold text-text-muted dark:text-slate-400 min-w-[160px]">
                    ImmiTranslate
                  </th>
                  <th className="p-5 md:p-6 text-center text-sm md:text-base font-semibold text-text-muted dark:text-slate-400 min-w-[160px]">
                    Translayte
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border dark:divide-white/10 text-sm">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors hover:bg-brand-50/20 dark:hover:bg-white/5 ${
                      row.isHighlight ? "bg-brand-50/30 dark:bg-brand-950/20 font-semibold" : ""
                    }`}
                  >
                    <td className="p-5 md:p-6">
                      <div className="space-y-1">
                        <p className="font-bold text-brand-ink dark:text-white">{row.feature}</p>
                        {row.subtext && (
                          <p className="text-xs text-text-muted dark:text-slate-400 leading-normal">{row.subtext}</p>
                        )}
                      </div>
                    </td>

                    {/* VerifyLingua Column */}
                    <td className="p-5 md:p-6 text-center bg-brand-50/50 dark:bg-brand-950/30 border-x-2 border-brand-500 font-bold text-brand-ink dark:text-white">
                      {typeof row.verifyLingua === "boolean" ? (
                        <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-status-success text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <span className="font-mono text-brand-500 dark:text-brand-400 font-black">{row.verifyLingua}</span>
                      )}
                    </td>

                    {/* RushTranslate Column */}
                    <td className="p-5 md:p-6 text-center text-text-muted dark:text-slate-400">
                      {typeof row.rushTranslate === "boolean" ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface dark:bg-white/5 text-text-muted dark:text-slate-400 border border-border dark:border-white/10">
                          <X className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="font-mono">{row.rushTranslate}</span>
                      )}
                    </td>

                    {/* ImmiTranslate Column */}
                    <td className="p-5 md:p-6 text-center text-text-muted dark:text-slate-400">
                      {typeof row.immiTranslate === "boolean" ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface dark:bg-white/5 text-text-muted dark:text-slate-400 border border-border dark:border-white/10">
                          <X className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="font-mono">{row.immiTranslate}</span>
                      )}
                    </td>

                    {/* Translayte Column */}
                    <td className="p-5 md:p-6 text-center text-text-muted dark:text-slate-400">
                      {typeof row.translayte === "boolean" ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface dark:bg-white/5 text-text-muted dark:text-slate-400 border border-border dark:border-white/10">
                          <X className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="font-mono">{row.translayte}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center pt-2">
          <Button size="lg" asChild className="gap-2 px-8 h-14 rounded-2xl text-base font-bold shadow-md active:scale-[0.97] transition-all duration-200">
            <Link href="/order/triage">
              Start translation with 100% guarantee
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
