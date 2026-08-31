import { UploadCloud, CheckSquare, FileText, QrCode, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    step: "01",
    title: "Instant Upload & AI Vision Triage",
    description:
      "Drop your PDF or take a photo. In under 5 seconds, our vision model checks for illegible text, cropped seals, and missing pages before taking payment.",
    icon: UploadCloud,
    badge: "< 5s OCR Analysis",
  },
  {
    step: "02",
    title: "Acceptance Pre-Check Wizard",
    description:
      "Select your receiving agency (USCIS, university, court, DMV). The wizard outputs an exact compliance spec sheet and pre-configures your order.",
    icon: CheckSquare,
    badge: "Agency Pre-Configured",
  },
  {
    step: "03",
    title: "Certified Human Translation & Name-Lock",
    description:
      "A vetted professional translator translates word-for-word. Exact passport spellings are hard-locked into the workspace to prevent silent RFE mismatches.",
    icon: FileText,
    badge: "Zero Transliteration Errors",
  },
  {
    step: "04",
    title: "Signed Certificate & QR Verification",
    description:
      "Receive your signed certificate of accuracy PDF with ATA credentials, translator signature, and a public QR code for instant officer verification.",
    icon: QrCode,
    badge: "Official Legal PDF",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-canvas border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-500">
              The 4-Step Rejection-Proof Process
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-ink tracking-tight">
              How VerifyLingua Works
            </h2>
            <p className="text-base sm:text-lg text-text-muted leading-relaxed">
              We engineered the translation workflow to eliminate the points of failure where incumbent agencies cause delays and rejections.
            </p>
          </div>

          <Button size="lg" asChild className="gap-2 shrink-0">
            <Link href="/order/triage">
              Start translation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative p-8 rounded-[28px] bg-surface-raised border border-border flex flex-col justify-between space-y-8 shadow-sm hover:border-brand-500/50 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black font-mono text-brand-300">
                      {step.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-brand-ink leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="inline-block text-[11px] font-mono font-semibold text-brand-500 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                    {step.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
