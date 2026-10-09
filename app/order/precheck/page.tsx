"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Landmark, CheckCircle2, Check, ArrowRight, Shield, GraduationCap, Scale, Car, Globe2, Briefcase, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RECEIVING_PARTIES } from "@/lib/constants";
import { calculatePricing } from "@/lib/pricing";
import { safeNavigate, safePrefetch } from "@/lib/navigation";

const AGENCY_ICONS: Record<string, React.ElementType> = {
  USCIS: Building2,
  UNIVERSITY: GraduationCap,
  COURT: Scale,
  DMV: Car,
  CONSULATE: Globe2,
  EMPLOYER: Briefcase,
};

function PreCheckContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryPages = searchParams.get("pages");
  const queryWords = searchParams.get("words");

  // Read query params with sessionStorage fallback
  const [pages] = useState<number>(() => {
    if (queryPages) {
      const p = parseInt(queryPages, 10);
      if (!isNaN(p) && p > 0) return p;
    }
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("pending_upload");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.pageCount) return Number(parsed.pageCount);
        }
      } catch {}
    }
    return 1;
  });

  const [words] = useState<number>(() => {
    if (queryWords) {
      const w = parseInt(queryWords, 10);
      if (!isNaN(w) && w > 0) return w;
    }
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("pending_upload");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.wordCount) return Number(parsed.wordCount);
        }
      } catch {}
    }
    return 250;
  });

  const pricing = calculatePricing({
    serviceType: "CERTIFIED",
    pageCount: pages,
    wordCount: words,
  });

  const [selectedAgencyId, setSelectedAgencyId] = useState<string>("USCIS");
  const [isNavigating, setIsNavigating] = useState(false);

  const selectedAgency = RECEIVING_PARTIES.find((p) => p.id === selectedAgencyId) || RECEIVING_PARTIES[0];
  const targetUrl = `/order/configure?pages=${pages}&words=${words}&notarize=${selectedAgency.requiresNotarization}`;

  useEffect(() => {
    safePrefetch(router, targetUrl);
  }, [router, targetUrl]);

  const handleContinue = () => {
    setIsNavigating(true);

    try {
      const current = sessionStorage.getItem("pending_upload");
      const parsed = current ? JSON.parse(current) : {};
      sessionStorage.setItem(
        "pending_upload",
        JSON.stringify({
          ...parsed,
          pageCount: pages,
          wordCount: words,
          receivingParty: selectedAgency.id,
          requiresNotarization: selectedAgency.requiresNotarization,
        })
      );
    } catch (e) {
      console.warn("[PreCheck] Failed to cache state in sessionStorage:", e);
    }

    safeNavigate(router, targetUrl, { fallbackTimeoutMs: 1500 });
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            Step 2 of 4
          </span>
          <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">
            Configure Receiving Authority
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Who is Receiving This Document?
        </h1>
        <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
          Different institutions have distinct legal certification requirements. We pre-configure your order
          to match your receiving authority&apos;s exact compliance rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Agency Selection & Spec Sheet */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {RECEIVING_PARTIES.map((party) => {
              const Icon = AGENCY_ICONS[party.id] || Building2;
              const isSelected = selectedAgencyId === party.id;
              return (
                <button
                  key={party.id}
                  type="button"
                  onClick={() => setSelectedAgencyId(party.id)}
                  className={cn(
                    "relative p-6 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between space-y-6 cursor-pointer overflow-hidden",
                    isSelected
                      ? "bg-white border-2 border-blue-600 shadow-[0_12px_24px_rgba(37,99,235,0.12)] -translate-y-1"
                      : "bg-white border-2 border-slate-100 hover:border-slate-300 hover:shadow-md"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 rounded-bl-full pointer-events-none" />
                  )}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm z-10">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-50 text-slate-500 border border-slate-200"
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug mb-1">
                        {party.name}
                      </h3>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase",
                        isSelected ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {party.badgeText}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* SaaS Bento Style Spec Sheet */}
          <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 relative z-10">
              <div className="space-y-1">
                <span className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-600">
                  <Shield className="w-3.5 h-3.5" />
                  Compliance Spec Sheet
                </span>
                <h3 className="text-2xl font-bold text-slate-900">
                  Requirements for {selectedAgency.name}
                </h3>
              </div>
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                Pre-Configured
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm relative z-10">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Certification Format
                </span>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <span>Certified Accuracy Certificate (8 CFR 103.2)</span>
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Notarization Jurat
                </span>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  {selectedAgency.requiresNotarization ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                      <span>Required (Added to order)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <span>Not Required</span>
                    </>
                  )}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Format Preservation
                </span>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <span>100% Mirror-Formatted</span>
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Verification Method
                </span>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <span>Public Cryptographic QR Link</span>
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 text-sm text-slate-600 leading-relaxed relative z-10">
              <strong className="text-slate-900 font-bold">Summary:</strong>{" "}
              {selectedAgency.specSummary}
            </div>

            <div className="pt-4 flex justify-end relative z-10">
              <button
                type="button"
                onClick={handleContinue}
                onMouseEnter={() => safePrefetch(router, targetUrl)}
                onFocus={() => safePrefetch(router, targetUrl)}
                disabled={isNavigating}
                className={cn(
                  "w-full sm:w-auto h-14 px-8 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-all",
                  isNavigating
                    ? "bg-blue-400 text-white cursor-wait"
                    : "bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-0.5 active:scale-95"
                )}
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading Next Step...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Configure</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sticky Rail */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
             <h3 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h3>
             
             <div className="space-y-4 mb-8">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 font-medium">Pages</span>
                 <span className="font-bold text-slate-900 tabular-nums">{pricing.pageCount}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 font-medium">Standard Delivery</span>
                 <span className="font-bold text-slate-900 tabular-nums">${pricing.basePrice.toFixed(2)}</span>
               </div>
               {pricing.notarizationFee > 0 && (
                 <div className="flex justify-between items-center text-sm text-blue-600">
                   <span className="font-semibold">Notarization</span>
                   <span className="font-bold tabular-nums">+${pricing.notarizationFee.toFixed(2)}</span>
                 </div>
               )}
             </div>

             <div className="border-t border-slate-100 pt-6 flex justify-between items-end mb-8">
               <span className="text-sm font-bold text-slate-500">Total</span>
               <div className="flex items-start gap-1">
                 <span className="text-lg font-bold text-slate-900 mt-1">$</span>
                 <span className="text-4xl font-black text-slate-900 tabular-nums tracking-tight">{pricing.total.toFixed(2)}</span>
               </div>
             </div>

             <button
               type="button"
               onClick={handleContinue}
               onMouseEnter={() => safePrefetch(router, targetUrl)}
               onFocus={() => safePrefetch(router, targetUrl)}
               disabled={isNavigating}
               className={cn(
                 "w-full py-4 rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2",
                 isNavigating
                   ? "bg-slate-700 text-slate-200 cursor-wait"
                   : "bg-slate-900 text-white hover:bg-slate-800 active:scale-95"
               )}
             >
               {isNavigating ? (
                 <>
                   <Loader2 className="w-5 h-5 animate-spin" />
                   <span>Proceeding...</span>
                 </>
               ) : (
                 <span>Continue</span>
               )}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PreCheckPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-medium">Loading requirements...</div>}>
      <PreCheckContent />
    </Suspense>
  );
}
