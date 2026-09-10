import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Scale,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "100% USCIS Acceptance Guarantee & 8 CFR 103.2 Charter | VerifyLingua",
  description:
    "Comprehensive legal guarantee and 8 CFR 103.2 compliance charter. Free revisions, 100% money-back refund guarantee, and ATA Member No. 278190 standards.",
};

export default function AcceptanceGuaranteePage() {
  return (
    <div className="min-h-screen bg-canvas text-brand-ink selection:bg-brand-100 selection:text-brand-ink">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-surface-raised/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border text-brand-ink hover:bg-brand-50 hover:border-brand-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
              <span className="font-bold tracking-tight text-sm font-display">VerifyLingua</span>
              <span className="text-xs text-ink-muted">/ Legal &amp; Compliance</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs font-mono bg-trust/10 text-trust border-trust/30 gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>8 CFR § 103.2(b)(3) Certified</span>
            </Badge>
            <Button asChild size="sm" className="font-bold">
              <Link href="/order/triage">Get Certified Translation</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="border-b border-border/80 bg-surface-raised py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <Badge variant="secondary" className="text-xs font-mono uppercase tracking-wider text-brand-500 bg-brand-50 border-brand-200">
            Federal Compliance Policy &amp; Warranty
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-ink tracking-tight font-display leading-[1.15]">
            100% USCIS Acceptance Guarantee &amp; Compliance Charter
          </h1>
          <p className="text-base sm:text-lg text-ink-soft leading-relaxed max-w-3xl">
            VerifyLingua guarantees that all certified translations meet or exceed the exact regulatory standards mandated by the United States Citizenship and Immigration Services (USCIS), the Department of State (DOS), and federal courts nationwide.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Section 1: The Guarantee Statement */}
        <Card className="p-6 sm:p-8 border-trust/30 bg-trust-surface/40 space-y-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-trust/15 text-trust flex items-center justify-center shrink-0 border border-trust/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-brand-ink">
                Our Ironclad Acceptance &amp; Refund Pledge
              </h2>
              <p className="text-sm text-ink-soft leading-relaxed">
                If any certified translation produced by VerifyLingua is rejected, contested, or issued a Request for Evidence (RFE) by USCIS or any U.S. government authority due to translation accuracy, formatting non-compliance, or translator certification deficiency, we commit to:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
              <div className="flex items-center gap-2 text-trust font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Full Money-Back Refund</span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Immediate, full reimbursement to your original payment method upon submission of the official Form I-797E notice identifying a translation defect.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
              <div className="flex items-center gap-2 text-brand-500 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>Priority Emergency Re-issuance</span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Free expedited re-translation, revised sworn affidavit, and senior ATA linguist re-certification dispatched in under 4 hours via our RFE Defense Shield.
              </p>
            </div>
          </div>
        </Card>

        {/* Section 2: Statutory Compliance Reference */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-brand-ink flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-brand-500" />
              <span>Federal Immigration Standard: 8 CFR § 103.2(b)(3)</span>
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              Federal regulations strictly define the requirements for foreign language documents submitted to immigration authorities:
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface-raised border border-border font-mono text-xs sm:text-sm text-ink leading-relaxed space-y-2">
            <p className="text-ink-muted italic">
              &ldquo;Any document containing foreign language submitted to USCIS shall be accompanied by a full English language translation which the translator has certified as complete and accurate, and by the translator&apos;s certification that he or she is competent to translate from the foreign language into English.&rdquo;
            </p>
            <p className="text-right text-[11px] font-bold text-brand-500">
              — Title 8, Code of Federal Regulations § 103.2(b)(3)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1.5">
              <span className="text-xs font-mono font-bold text-brand-500 uppercase">Requirement 1</span>
              <h3 className="text-sm font-bold text-brand-ink">Completeness</h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Every seal, stamp, marginalia annotation, and watermarked seal is translated or noted with standard brackets (e.g. [Official Seal: Republic of Colombia]).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1.5">
              <span className="text-xs font-mono font-bold text-brand-500 uppercase">Requirement 2</span>
              <h3 className="text-sm font-bold text-brand-ink">Competence Affidavit</h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Each certified translation includes an explicit sworn affidavit specifying the translator&apos;s credentials, fluency, address, and ATA corporate membership.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1.5">
              <span className="text-xs font-mono font-bold text-brand-500 uppercase">Requirement 3</span>
              <h3 className="text-sm font-bold text-brand-ink">Layout Mirroring</h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Our engine preserves the exact spatial geometry, column structure, and tabular alignment of the original document so adjudicators can cross-reference with zero friction.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Certified Tier vs. Automated Machine Translations */}
        <section className="space-y-6 pt-4 border-t border-border/80">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-brand-ink flex items-center gap-2.5">
              <FileCheck2 className="w-5 h-5 text-brand-500" />
              <span>Service Tiers: Certified vs. Automated Machine Translations</span>
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              To protect customers and comply with truth-in-advertising and legal ethics guidelines, VerifyLingua enforces strict separation between service tiers:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Certified Tier */}
            <div className="p-6 rounded-2xl bg-surface-raised border-2 border-brand-500/40 space-y-4 shadow-sm relative">
              <div className="flex items-center justify-between">
                <Badge className="bg-brand-500 text-white font-mono text-xs font-bold">
                  Certified Translation
                </Badge>
                <span className="text-xs font-mono text-trust font-bold">Official USCIS Ready</span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Fully human-reviewed and certified by qualified translators. Carries our official ATA Member No. 278190 seal, sworn 8 CFR § 103.2 affidavit of accuracy, and cryptographic tamper-evident verification QR code.
              </p>
              <ul className="text-xs space-y-2 text-brand-ink">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-trust shrink-0" />
                  <span>Eligible for 100% USCIS Acceptance Guarantee</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-trust shrink-0" />
                  <span>Includes Notarization &amp; Wet-Ink shipping options</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-trust shrink-0" />
                  <span>Backed by 4-Hour RFE Defense Shield</span>
                </li>
              </ul>
            </div>

            {/* Automated Tier */}
            <div className="p-6 rounded-2xl bg-surface-raised border border-border space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs font-mono border-border text-ink-muted">
                  Automated Preview Tier
                </Badge>
                <span className="text-xs font-mono text-ink-muted">Working Draft</span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Instant machine translation designed for document review, internal comprehension, and reference. <strong>Not certified for government, court, or USCIS submission.</strong>
              </p>
              <ul className="text-xs space-y-2 text-ink-muted">
                <li className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-ink-muted shrink-0" />
                  <span>Watermarked as Uncertified Machine Translation</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-ink-muted shrink-0" />
                  <span>Affidavit &amp; ATA seal intentionally withheld</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-ink-muted shrink-0" />
                  <span>Can be upgraded to Certified tier anytime with 1 click</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: Consumer Protection & Legal Disclaimers */}
        <Card className="p-6 rounded-xl bg-surface border border-border/80 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-ink-muted shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-brand-ink">Regulatory Disclaimers &amp; Scope Limits</h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                VerifyLingua is a professional language translation and document certification service. We are not an immigration law firm, an attorney, or a representative of the Department of Homeland Security or USCIS. Our guarantee strictly warrants that the translation document format, textual completeness, and certification affidavit comply with USCIS regulations under 8 CFR § 103.2(b)(3). Our guarantee does not warrant or influence the adjudication outcome of underlying visa petitions, asylum requests, naturalization applications, or adjustments of status, which remain subject to sole government officer discretion.
              </p>
            </div>
          </div>
        </Card>

        {/* Section 5: Emergency RFE Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-surface-raised to-brand-50/50 border border-brand-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[11px] font-mono uppercase bg-status-danger-bg text-status-danger border-status-danger/30">
                Received an RFE?
              </Badge>
              <span className="text-xs font-semibold text-brand-500 font-mono">Guaranteed &lt; 4h Turnaround</span>
            </div>
            <h3 className="text-lg font-bold font-display text-brand-ink">
              USCIS RFE Defense Shield
            </h3>
            <p className="text-xs text-ink-soft max-w-xl">
              If an immigration officer has issued an inquiry or Form I-797E regarding an existing translation, our senior linguists will dispatch an amended re-affidavit packet at zero charge.
            </p>
          </div>

          <Button asChild className="shrink-0 font-bold gap-2">
            <Link href="/defense/rfe">
              <span>Submit RFE Notice</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
