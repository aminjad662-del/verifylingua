import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Lock, Trash2, Clock, CheckCircle2, Server, EyeOff, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy & Zero Data Retention — VerifyLingua",
  description:
    "VerifyLingua automated document processing privacy commitment: 24h/30d hard retention lifecycle, named subprocessors, zero model training, and instant self-serve deletion.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-soft">
      <Header />
      <main className="flex-1">
        {/* Header Hero */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-hero border-b border-border/60 text-center px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <Badge variant="default" className="gap-1.5 py-1 px-4 text-xs font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              Stage S10 Zero-Retention Architecture
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-ink tracking-tight font-display">
              Privacy Policy & <br />
              <span className="text-brand-500">Document Deletion Lifecycle</span>
            </h1>

            <p className="text-base sm:text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
              We operate automated document processing under strict zero-data-retention agreements. Your legal documents are never used for AI model training.
            </p>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="py-16 md:py-20 border-b border-border/40 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 rounded-2xl bg-surface-raised border border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-brand-ink">Zero Model Training</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Neither VerifyLingua nor our enterprise API providers ever train, evaluate, or fine-tune models on your uploaded files or extracted text segments.
              </p>
            </Card>

            <Card className="p-6 rounded-2xl bg-surface-raised border border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-brand-ink">Automated Purging</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Source and rendered documents are purged after 24 hours (Instant tier) or 30 days (Certified tier). Database text segments are scrubbed to [PURGED].
              </p>
            </Card>

            <Card className="p-6 rounded-2xl bg-surface-raised border border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-brand-ink">Instant Self-Erasure</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Click "Delete Document" at any point in the viewer or issue a DELETE request to permanently purge all raw files and extracted text immediately.
              </p>
            </Card>
          </div>
        </section>

        {/* Retention Table & Subprocessors */}
        <section className="py-16 md:py-20 max-w-4xl mx-auto px-6 space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-ink">
              1. Document Retention Schedule (S10)
            </h2>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              In strict accordance with GDPR Article 17, CCPA, and USCIS 8 CFR § 103.2 evidentiary requirements, documents are scheduled for deterministic purging:
            </p>

            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full text-left text-sm">
                <thead className="bg-canvas border-b border-border text-xs font-mono font-bold uppercase text-brand-ink">
                  <tr>
                    <th className="py-3.5 px-4">Service Tier</th>
                    <th className="py-3.5 px-4">Retention Window</th>
                    <th className="py-3.5 px-4">Purged Data</th>
                    <th className="py-3.5 px-4">Tombstone Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-brand-ink">Instant Translation</td>
                    <td className="py-3.5 px-4 text-brand-500 font-mono font-semibold">24 Hours</td>
                    <td className="py-3.5 px-4 text-text-muted">Raw binaries, rendered files, OCR text</td>
                    <td className="py-3.5 px-4 text-text-muted font-mono text-xs">Job ID & page count only</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-brand-ink">Certified Review</td>
                    <td className="py-3.5 px-4 text-brand-500 font-mono font-semibold">30 Days</td>
                    <td className="py-3.5 px-4 text-text-muted">Source documents, previews, segment text</td>
                    <td className="py-3.5 px-4 text-text-muted font-mono text-xs">ATA certification hash & code</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-brand-ink">User Immediate Deletion</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-mono font-semibold">Instant (0s)</td>
                    <td className="py-3.5 px-4 text-text-muted">100% of binary files and text content</td>
                    <td className="py-3.5 px-4 text-text-muted font-mono text-xs">Tombstone deletion log</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-ink">
              2. Named Subprocessors
            </h2>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              VerifyLingua executes data processing solely through certified infrastructure partners operating under signed zero-data-retention agreements:
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-border bg-surface flex items-start gap-4">
                <Server className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-brand-ink">Cloudflare R2 / Amazon S3</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Transient document storage. Hardware-accelerated AES-256 encryption at rest, private bucket isolation, and signed 15-minute download URLs.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface flex items-start gap-4">
                <Lock className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-brand-ink">Google Cloud Platform (Gemini Enterprise)</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Layout-aware neural translation and low-confidence OCR correction. Enterprise zero-training and zero-data-retention guarantee.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-brand-ink">DeepL SE (Germany)</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    European translation failover provider. ISO 27001 certified data centers with strict GDPR compliance and zero persistent caching.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-brand-ink">Stripe, Inc.</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    PCI-DSS Level 1 certified payment processing. VerifyLingua never stores or accesses raw credit card numbers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-canvas border border-border text-center space-y-3">
            <h4 className="font-bold text-brand-ink">Exercise Your Right to Erasure</h4>
            <p className="text-xs sm:text-sm text-text-muted max-w-lg mx-auto">
              You can permanently delete any document immediately from your dashboard or result viewer. For formal data requests, contact our Data Protection Officer at privacy@verifylingua.com.
            </p>
            <div className="pt-2">
              <Link
                href="/order/triage"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-ink text-white text-xs font-bold hover:bg-brand-900 transition-colors"
              >
                Go to Document Processing
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
