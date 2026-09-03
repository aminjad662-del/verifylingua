import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ShieldCheck, ArrowRight, CheckCircle2, Award, QrCode } from "lucide-react";

export function BottomCTA() {
  return (
    <section className="py-20 md:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-[var(--r-2xl)] bg-gradient-panel border-2 border-brand-100 p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column (7/5 Asymmetrical Grid) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-100 bg-surface-raised text-brand-500 text-xs font-bold uppercase tracking-wider shadow-sm">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                <span>Zero-Risk Certified Translation</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold text-brand-ink tracking-tight leading-[1.05] font-display">
                Ready to Submit Without Rejection Fear?
              </h2>

              <p className="text-base sm:text-lg text-ink-soft max-w-xl leading-relaxed">
                Upload your documents in seconds. Get instant pre-payment AI triage, exact delivery time, and guaranteed acceptance for only $24.95/page.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <MagneticButton>
                  <Button size="lg" asChild className="h-14 px-8 rounded-2xl text-base font-bold gap-2 shadow-md active:scale-[0.97] transition-all duration-200">
                    <Link href="/order/triage">
                      Start translation
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                </MagneticButton>
                <Button variant="secondary" size="lg" asChild className="h-14 px-8 rounded-2xl text-base font-bold">
                  <Link href="/pricing">
                    View transparent pricing
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-ink-soft">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>No account needed to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>Instant AI quality triage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>100% USCIS Acceptance Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Visual Image Card Column */}
            <div className="lg:col-span-5">
              <div className="relative w-full h-72 sm:h-80 rounded-3xl overflow-hidden border-2 border-brand-100 shadow-2xl bg-white group">
                <Image
                  src="/images/doc-certificate-3d.jpg"
                  alt="Official certified translation packet with ATA seal and cryptographic verification"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-transparent to-transparent flex flex-col justify-between p-6">
                  <div className="flex justify-end">
                    <Badge variant="default" className="text-xs py-1 px-3 shadow-lg font-mono flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5" />
                      Live QR Verified
                    </Badge>
                  </div>
                  <div className="space-y-1 text-white">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Award className="w-4 h-4 text-brand-300" />
                      <span>Signed Certificate of Accuracy</span>
                    </div>
                    <p className="text-[11px] text-white/80">
                      Standard $24.95 / page • Guaranteed 24h turnaround • Redo free + 100% refund guarantee
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
