"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Lock, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const FUNNEL_STEPS = [
  { path: "/order/triage", name: "Triage", step: 1 },
  { path: "/order/precheck", name: "Configure", step: 2 },
  { path: "/order/configure", name: "Lock", step: 3 },
  { path: "/order/checkout", name: "Checkout", step: 4 },
];

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // If on order details tracking page e.g. /order/VL-1234 or proofing studio
  const isOrderDetails = (pathname.match(/^\/order\/[a-zA-Z0-9_-]+$/) || pathname.includes("/proof") || pathname.includes("/tracker")) && !FUNNEL_STEPS.some(s => s.path === pathname);

  const currentStep = FUNNEL_STEPS.find((s) => pathname.startsWith(s.path))?.step || 1;

  return (
    <div className="min-h-screen flex flex-col bg-sand text-ink pb-20 lg:pb-12">
      {/* Minimal Focused Header */}
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-sand/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-ink text-sand shadow-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-trust" />
            </div>
            <span className="text-xl font-black tracking-tight text-ink font-display">
              Verify<span className="text-cta">Lingua</span>
            </span>
          </Link>

          {/* Step Progress Indicators (Hidden on small mobile) */}
          {!isOrderDetails && (
            <div className="hidden md:flex items-center gap-2">
              {FUNNEL_STEPS.map((s, idx) => {
                const isPassed = currentStep > s.step;
                const isCurrent = currentStep === s.step;
                return (
                  <React.Fragment key={s.step}>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold transition-all",
                          isPassed
                            ? "bg-trust text-white"
                            : isCurrent
                            ? "bg-cta text-white ring-2 ring-cta/20 shadow-sm"
                            : "bg-surface-raised text-ink-muted border border-border"
                        )}
                      >
                        {isPassed ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : s.step}
                      </div>
                      <span
                        className={cn(
                          "text-xs tracking-tight transition-colors",
                          isCurrent
                            ? "text-ink font-bold"
                            : isPassed
                            ? "text-trust font-medium"
                            : "text-ink-muted"
                        )}
                      >
                        {s.name}
                      </span>
                    </div>
                    {idx < FUNNEL_STEPS.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-ink/20" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
            <Lock className="w-3.5 h-3.5 text-trust" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Funnel Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
