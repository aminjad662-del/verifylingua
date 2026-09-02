import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HowItWorks as HowItWorksSection } from "@/components/marketing/HowItWorks";
import { RejectionMoatSection } from "@/components/marketing/RejectionMoatSection";
import { BottomCTA } from "@/components/marketing/BottomCTA";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, QrCode, Lock, Clock, FileCheck2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-soft">
      <Header />
      <main className="flex-1">
        {/* Page Header */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-hero border-b border-border/60 text-center px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <Badge variant="default" className="gap-1.5 py-1 px-4 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              Engineered for 100% USCIS Acceptance
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-ink tracking-tight font-display">
              The Architecture Behind <br />
              <span className="text-brand-500">Rejection-Proof Translations.</span>
            </h1>

            <p className="text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
              Discover how our pre-payment AI vision triage, passport name-locking, and public verification portal guarantee your application succeeds on the first attempt.
            </p>
          </div>
        </section>

        {/* 4-Step Flow */}
        <HowItWorksSection />

        {/* 6 Rejection Moats */}
        <RejectionMoatSection />

        {/* Detailed Timeline Breakdown */}
        <section className="py-20 md:py-28 bg-surface border-b border-border/60 px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-500">
                Deterministic Turnaround Schedule
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-ink">
                How We Deliver in 24 Hours or Less
              </h2>
              <p className="text-base text-text-muted max-w-xl mx-auto">
                Unlike competitors who promise vague &ldquo;24-hour turnaround&rdquo; and miss deadlines due to notary batching, our timing is calibrated to the minute.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-3xl bg-surface-raised border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-brand-500 bg-brand-50 px-2.5 py-1 rounded-md">
                    Stage 1
                  </span>
                  <Clock className="w-5 h-5 text-text-muted" />
                </div>
                <h3 className="text-xl font-bold text-brand-ink">0–2 Hours: Triage & Assignment</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Vision model verifies legibility. Document is matched and assigned to a vetted ATA-accredited native translator for your specific language pair.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-surface-raised border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-brand-500 bg-brand-50 px-2.5 py-1 rounded-md">
                    Stage 2
                  </span>
                  <FileCheck2 className="w-5 h-5 text-text-muted" />
                </div>
                <h3 className="text-xl font-bold text-brand-ink">2–18 Hours: Translation & Name-Lock QA</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Linguist translates complete document including seals, stamps, and watermarks. Automated consistency checker blocks delivery if passport spelling deviates.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-surface-raised border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-brand-500 bg-brand-50 px-2.5 py-1 rounded-md">
                    Stage 3
                  </span>
                  <QrCode className="w-5 h-5 text-text-muted" />
                </div>
                <h3 className="text-xl font-bold text-brand-ink">18–24 Hours: Certification & QR Issue</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Certificate of Accuracy is generated with translator signature, ATA member seal, SHA-256 hash, and instant QR verification link.
                </p>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button size="lg" asChild className="gap-2 px-8 h-14 rounded-2xl text-base font-bold shadow-md">
                <Link href="/order/triage">
                  Start your certified translation
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
