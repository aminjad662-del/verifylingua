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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 lg:pb-12">
      {/* Minimal Focused Header - Modern SaaS Style */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white shadow-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Verify<span className="text-blue-600">Lingua</span>
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
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-blue-600 text-white ring-4 ring-blue-600/20 shadow-sm"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        )}
                      >
                        {isPassed ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : s.step}
                      </div>
                      <span
                        className={cn(
                          "text-xs tracking-tight transition-colors font-medium",
                          isCurrent
                            ? "text-slate-900 font-bold"
                            : isPassed
                            ? "text-green-600"
                            : "text-slate-400"
                        )}
                      >
                        {s.name}
                      </span>
                    </div>
                    {idx < FUNNEL_STEPS.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
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
