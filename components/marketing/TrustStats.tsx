import { ShieldCheck, Zap, Award } from "lucide-react";

export function TrustStats() {
  return (
    <section className="py-16 md:py-24 bg-surface border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-500">
            Institutional Trust & Performance
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-brand-ink tracking-tight">
            You Don&apos;t Have to Choose Between Speed, Price, and Acceptance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stat 1 */}
          <div className="p-8 md:p-10 rounded-[28px] bg-surface-raised border border-border flex flex-col justify-between space-y-6 shadow-sm hover:border-brand-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <span className="text-5xl md:text-6xl font-black text-brand-ink tracking-tight font-mono">
                100%
              </span>
              <h3 className="text-xl font-bold text-brand-ink">USCIS Acceptance Guarantee</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Accepted by USCIS, federal immigration judges, state courts, foreign consulates, and university credential evaluators (WES, ECE).
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-brand-500 font-mono">
              Redo Free + Full Refund Guarantee
            </div>
          </div>

          {/* Stat 2 */}
          <div className="p-8 md:p-10 rounded-[28px] bg-surface-raised border border-border flex flex-col justify-between space-y-6 shadow-sm hover:border-brand-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500">
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <span className="text-5xl md:text-6xl font-black text-brand-ink tracking-tight font-mono">
                &lt;5s
              </span>
              <h3 className="text-xl font-bold text-brand-ink">Pre-Payment AI Document Triage</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Our vision model detects blurred text, missing back-pages, and cut-off seals before you pay — eliminating post-payment delays.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-brand-500 font-mono">
              Zero Post-Payment Rejection Surprises
            </div>
          </div>

          {/* Stat 3 */}
          <div className="p-8 md:p-10 rounded-[28px] bg-surface-raised border border-border flex flex-col justify-between space-y-6 shadow-sm hover:border-brand-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <span className="text-5xl md:text-6xl font-black text-brand-ink tracking-tight font-mono">
                50,000+
              </span>
              <h3 className="text-xl font-bold text-brand-ink">Certified Pages Delivered</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Trusted by immigration attorneys, international students, and Fortune 500 legal teams across 70+ supported language pairs.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-brand-500 font-mono">
              Public Cryptographic QR Verification
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
