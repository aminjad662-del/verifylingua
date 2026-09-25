import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Award, FileCheck2, Scale, AlertCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Terms of Service & Acceptance Guarantee — VerifyLingua",
  description:
    "VerifyLingua service terms: automated document processing, USCIS 8 CFR § 103.2 certified translations, 100% acceptance guarantee, and transparent flat-rate billing.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-soft">
      <Header />
      <main className="flex-1">
        {/* Header Hero */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-hero border-b border-border/60 text-center px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <Badge variant="default" className="gap-1.5 py-1 px-4 text-xs font-mono font-bold uppercase tracking-wider">
              <Scale className="w-4 h-4 text-brand-500" />
              USCIS 8 CFR § 103.2 Standard Terms
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-ink tracking-tight font-display">
              Terms of Service & <br />
              <span className="text-brand-500">Legal Acceptance Guarantee</span>
            </h1>

            <p className="text-base sm:text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
              Transparent, binding terms governing our layout-preserving automated document processing and ATA-certified translation workflows.
            </p>
          </div>
        </section>

        {/* Guarantee Banner */}
        <section className="py-12 border-b border-border/40 px-6 bg-brand-50/50">
          <div className="max-w-4xl mx-auto p-6 md:p-8 rounded-2xl bg-surface-raised border border-brand-200 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-brand-ink">100% USCIS Acceptance Guarantee</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                If any certified translation submitted through VerifyLingua receives an official Request for Evidence (RFE) or rejection based on translation completeness or translator certification, we will re-certify the document within 24 hours or issue a 100% refund.
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Terms */}
        <section className="py-16 md:py-20 max-w-4xl mx-auto px-6 space-y-10">
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-ink">
              1. Service Tiers & Intended Scope
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5 rounded-2xl bg-surface border border-border space-y-2">
                <span className="text-xs font-mono font-bold text-brand-500 uppercase">Tier 1: Instant</span>
                <h4 className="font-bold text-brand-ink">Automated Document Processing</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Fast, layout-preserving automated translation for contracts, operational guides, and non-official documents. Delivered in seconds to minutes in original file format.
                </p>
              </Card>

              <Card className="p-5 rounded-2xl bg-surface border border-border space-y-2">
                <span className="text-xs font-mono font-bold text-brand-500 uppercase">Tier 2: Certified</span>
                <h4 className="font-bold text-brand-ink">ATA Human Review & 8 CFR § 103.2 Affidavit</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Automated processing paired with segment-by-segment review by an ATA-credentialed translator. Includes signed Certificate of Accuracy, passport name locks, and verification QR code.
                </p>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-ink">
              2. User Warranties & Document Ownership
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              By uploading a document to VerifyLingua, you explicitly warrant that you are the lawful owner or authorized representative of the document. You confirm the file is free of malicious code, embedded exploits, or contraband. For password-protected documents, entering the password confirms your legal authorization to decrypt and translate the file.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-ink">
              3. Transparent Commercial Billing & No Hidden Charges
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              VerifyLingua operates with deterministic, upfront pricing:
            </p>
            <ul className="space-y-2 text-sm text-text-muted list-disc list-inside">
              <li><strong>Instant Page Packs:</strong> 25 pages ($9.99), 100 pages ($29.99), or monthly agency subscription ($119.00/mo).</li>
              <li><strong>Certified Orders:</strong> Flat $24.95 per page (250 words standard) with optional expedited turnaround or notarization add-ons.</li>
              <li><strong>Zero Metered Surcharges:</strong> We never charge automatic overage fees or bill hidden processing surcharges.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-ink">
              4. Deletion & Data Retention
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Pursuant to our <Link href="/privacy" className="text-brand-500 underline font-semibold">Privacy Policy</Link>, all document binaries and text segments are permanently deleted 24 hours post-completion for Instant jobs and 30 days for Certified jobs. You may initiate immediate self-serve deletion at any time.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-canvas border border-border text-center space-y-3">
            <p className="text-xs text-text-muted">
              Questions regarding these Terms of Service may be directed to legal@verifylingua.com.
            </p>
            <div className="pt-2">
              <Link
                href="/order/triage"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-ink text-white text-xs font-bold hover:bg-brand-900 transition-colors"
              >
                <span>Upload Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
