"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MagneticButton } from "@/components/ui/magnetic-button";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Award,
  QrCode,
  Lock,
  Clock,
  Sparkles,
  FileCheck,
} from "lucide-react";

export function BottomCTA() {
  return (
    <section className="py-20 md:py-32 bg-surface dark:bg-canvas relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Outer Split Card with Soft Radiant Ambient Light */}
        <div className="rounded-[var(--r-2xl)] bg-gradient-panel dark:bg-slate-900/90 border-2 border-brand-100/90 dark:border-white/15 p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-2xl">
          {/* Ambient Radiant Glow */}
          <div
            className="pointer-events-none absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-brand-500/10 dark:bg-brand-500/20 blur-[120px] -z-10"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column (7/5 Asymmetrical Grid) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-200/80 bg-surface-raised dark:bg-white/5 dark:border-white/15 text-brand-500 dark:text-brand-300 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                <ShieldCheck className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                <span>Zero-Risk Certified Translation</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-brand-ink dark:text-white tracking-tight leading-[1.02] font-display">
                Ready to File Without <br />
                <span className="text-brand-500 dark:text-brand-400">Rejection Fear?</span>
              </h2>

              <p className="text-base sm:text-lg text-ink-soft dark:text-slate-300 max-w-xl leading-relaxed">
                Upload your document now. Get instant pre-payment AI clarity triage, exact guaranteed delivery time,
                and official ATA human certification for only $24.95/page.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <MagneticButton>
                  <Button
                    size="lg"
                    asChild
                    className="h-14 px-8 rounded-full text-base font-bold gap-3 shadow-lg active:scale-[0.97] transition-all duration-200 bg-brand-500 hover:bg-brand-600 text-white"
                  >
                    <Link href="/order/triage">
                      <span>Start translation</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                </MagneticButton>

                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="h-14 px-8 rounded-full text-base font-bold border-border dark:border-white/20 dark:text-white hover:bg-surface dark:hover:bg-white/10"
                >
                  <Link href="/pricing">View transparent pricing</Link>
                </Button>
              </div>

              {/* Trust & Guarantee Micro-Checks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-brand-ink dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>No account needed to start triage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>USCIS 100% Acceptance Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>Guaranteed 24-hour delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>Full refund + free redo warranty</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup Workspace Column (Synthesia Style) */}
            <div className="lg:col-span-5">
              <div className="relative w-full rounded-3xl overflow-hidden border-2 border-brand-200/80 dark:border-white/15 shadow-2xl bg-white dark:bg-slate-950 group">
                {/* Visual Image Header */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                  <Image
                    src="/images/doc-certificate-3d.jpg"
                    alt="Official certified translation packet with ATA seal and cryptographic verification"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/20 to-transparent flex flex-col justify-between p-5">
                    <div className="flex justify-end">
                      <Badge
                        variant="default"
                        className="text-xs py-1 px-3 shadow-lg font-mono flex items-center gap-1.5 bg-brand-500 text-white"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Live QR Verified
                      </Badge>
                    </div>

                    <div className="space-y-1 text-white">
                      <div className="flex items-center gap-2 text-xs font-bold font-mono">
                        <Award className="w-4 h-4 text-brand-300" />
                        <span>Signed Certificate of Accuracy Attached</span>
                      </div>
                      <p className="text-[11px] text-white/80">
                        Packet #VL-USCIS-9842 • Full Legal Liability Protection
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-Card Specs Bar */}
                <div className="p-4 bg-surface-raised dark:bg-slate-900 border-t border-border/70 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-ink-soft dark:text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
                    <span>256-Bit Vault Encrypted</span>
                  </div>
                  <span className="font-bold text-brand-500 dark:text-brand-400">$24.95 / Page Flat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
