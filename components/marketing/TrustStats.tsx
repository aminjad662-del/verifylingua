import Image from "next/image";
import { ShieldCheck, Zap, Award } from "lucide-react";

export function TrustStats() {
  return (
    <section className="py-16 md:py-24 bg-surface border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-500">
            Institutional Trust & Performance
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-brand-ink tracking-tight">
            You Don&apos;t Have to Choose Between Speed, Price, and Acceptance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stat 1 */}
          <div className="p-6 md:p-8 rounded-[var(--r-xl)] bg-surface-raised border border-border flex flex-col justify-between space-y-5 shadow-sm hover:shadow-lg hover:border-brand-500/40 hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="space-y-4">
              {/* Rich Visual Banner */}
              <div className="relative w-full h-44 rounded-[var(--r-lg)] overflow-hidden border border-border/60 bg-surface shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                <Image
                  src="/images/doc-certificate-3d.jpg"
                  alt="Official certified translation packet with gold seal"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-[var(--r-xs)] bg-brand-500 text-white text-[10px] font-mono font-bold shadow-md">
                  USCIS 8 CFR
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[var(--r-md)] bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-3xl md:text-4xl font-bold text-brand-ink tracking-tight font-mono tabular-nums">
                    100%
                  </span>
                  <span className="text-xs text-brand-500 font-bold block uppercase tracking-wider">
                    Acceptance Rate
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-lg font-bold text-brand-ink">USCIS Acceptance Guarantee</h3>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Accepted by USCIS, federal immigration judges, state courts, foreign consulates, and university credential evaluators (WES, ECE).
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs font-semibold text-brand-500 font-mono border-t border-border/60">
              Redo Free + Full Refund Guarantee
            </div>
          </div>

          {/* Stat 2 */}
          <div className="p-6 md:p-8 rounded-[var(--r-xl)] bg-surface-raised border border-border flex flex-col justify-between space-y-5 shadow-sm hover:shadow-lg hover:border-brand-500/40 hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="space-y-4">
              {/* Rich Visual Banner */}
              <div className="relative w-full h-44 rounded-[var(--r-lg)] overflow-hidden border border-border/60 bg-surface shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                <Image
                  src="/images/step-ai-triage-3d.jpg"
                  alt="Instant AI document quality inspection and OCR vision model"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-[var(--r-xs)] bg-brand-500 text-white text-[10px] font-mono font-bold shadow-md">
                  Pre-Payment OCR
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[var(--r-md)] bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-3xl md:text-4xl font-bold text-brand-ink tracking-tight font-mono tabular-nums">
                    &lt;5s
                  </span>
                  <span className="text-xs text-brand-500 font-bold block uppercase tracking-wider">
                    Instant Triage
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-lg font-bold text-brand-ink">Pre-Payment AI Document Triage</h3>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Our vision model detects blurred text, missing back-pages, and cut-off seals before you pay — eliminating post-payment delays.
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs font-semibold text-brand-500 font-mono border-t border-border/60">
              Zero Post-Payment Rejection Surprises
            </div>
          </div>

          {/* Stat 3 */}
          <div className="p-6 md:p-8 rounded-[var(--r-xl)] bg-surface-raised border border-border flex flex-col justify-between space-y-5 shadow-sm hover:shadow-lg hover:border-brand-500/40 hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="space-y-4">
              {/* Rich Visual Banner */}
              <div className="relative w-full h-44 rounded-[var(--r-lg)] overflow-hidden border border-border/60 bg-surface shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                <Image
                  src="/images/doc-passport-3d.jpg"
                  alt="Certified passport and foreign civil records delivered with public QR"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-[var(--r-xs)] bg-brand-500 text-white text-[10px] font-mono font-bold shadow-md">
                  ATA Certified
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[var(--r-md)] bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-3xl md:text-4xl font-bold text-brand-ink tracking-tight font-mono tabular-nums">
                    50,000+
                  </span>
                  <span className="text-xs text-brand-500 font-bold block uppercase tracking-wider">
                    Pages Delivered
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-lg font-bold text-brand-ink">Certified Pages Delivered</h3>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Trusted by immigration attorneys, international students, and Fortune 500 legal teams across 70+ supported language pairs.
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs font-semibold text-brand-500 font-mono border-t border-border/60">
              Public Cryptographic QR Verification
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
