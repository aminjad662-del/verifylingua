import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, UploadCloud, CheckCircle2 } from "lucide-react";

export function BottomCTA() {
  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-[36px] bg-gradient-panel border-2 border-brand-100 p-8 sm:p-12 md:p-16 text-center space-y-8 relative overflow-hidden shadow-lg">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-100 bg-surface-raised text-brand-500 text-xs font-bold uppercase tracking-wider shadow-sm">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>Zero-Risk Certified Translation</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-brand-ink tracking-tight leading-[1.02]">
              Ready to Submit Without Rejection Fear?
            </h2>

            <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              Upload your documents in seconds. Get instant pre-payment AI triage, exact delivery time, and guaranteed acceptance for only $24.95/page.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button size="lg" asChild className="h-14 px-8 rounded-2xl text-base font-bold gap-2 shadow-md">
              <Link href="/order/triage">
                Start translation
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild className="h-14 px-8 rounded-2xl text-base font-bold">
              <Link href="/pricing">
                View transparent pricing
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-text-muted">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-success" />
              <span>No account needed to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-success" />
              <span>Instant AI quality triage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-success" />
              <span>100% USCIS Acceptance Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
