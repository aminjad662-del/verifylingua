import { Check, X, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    <section className="py-20 md:py-32 bg-canvas border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 space-y-14">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-500">
            Incumbent Comparison Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-ink tracking-tight font-display">
            See How VerifyLingua Compares
          </h2>
          <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
            We don&apos;t try to undercut on price — we match the $24.95 industry standard and win by eliminating the 6 documented failure points of incumbent agencies.
          </p>
        </div>

        {/* Comparison Table Container */}
        <div className="overflow-x-auto rounded-[var(--r-xl)] border border-border/80 bg-surface-raised shadow-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="p-5 md:p-6 text-sm md:text-base font-bold text-brand-ink min-w-[280px]">
                  Feature / Capability
                </th>
                <th className="p-5 md:p-6 text-center bg-brand-50/80 border-x-2 border-brand-500 min-w-[200px]">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500">
                      Our Service
                    </span>
                    <p className="text-lg md:text-xl font-black text-brand-ink">VerifyLingua</p>
                  </div>
                </th>
                <th className="p-5 md:p-6 text-center text-sm md:text-base font-semibold text-text-muted min-w-[160px]">
                  RushTranslate
                </th>
                <th className="p-5 md:p-6 text-center text-sm md:text-base font-semibold text-text-muted min-w-[160px]">
                  ImmiTranslate
                </th>
                <th className="p-5 md:p-6 text-center text-sm md:text-base font-semibold text-text-muted min-w-[160px]">
                  Translayte
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-sm">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors hover:bg-brand-50/20 ${
                    row.isHighlight ? "bg-brand-50/30 font-semibold" : ""
                  }`}
                >
                  <td className="p-5 md:p-6">
                    <div className="space-y-1">
                      <p className="font-bold text-brand-ink">{row.feature}</p>
                      {row.subtext && (
                        <p className="text-xs text-text-muted leading-normal">{row.subtext}</p>
                      )}
                    </div>
                  </td>

                  {/* VerifyLingua Column */}
                  <td className="p-5 md:p-6 text-center bg-brand-50/50 border-x-2 border-brand-500 font-bold text-brand-ink">
                    {typeof row.verifyLingua === "boolean" ? (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-status-success text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <span className="font-mono text-brand-500 font-black">{row.verifyLingua}</span>
                    )}
                  </td>

                  {/* RushTranslate Column */}
                  <td className="p-5 md:p-6 text-center text-text-muted">
                    {typeof row.rushTranslate === "boolean" ? (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface text-text-muted border border-border">
                        <X className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <span className="font-mono">{row.rushTranslate}</span>
                    )}
                  </td>

                  {/* ImmiTranslate Column */}
                  <td className="p-5 md:p-6 text-center text-text-muted">
                    {typeof row.immiTranslate === "boolean" ? (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface text-text-muted border border-border">
                        <X className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <span className="font-mono">{row.immiTranslate}</span>
                    )}
                  </td>

                  {/* Translayte Column */}
                  <td className="p-5 md:p-6 text-center text-text-muted">
                    {typeof row.translayte === "boolean" ? (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface text-text-muted border border-border">
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
