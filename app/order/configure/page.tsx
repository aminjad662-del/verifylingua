"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Globe2, Calendar, User, ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { POPULAR_LANGUAGES } from "@/lib/constants";
import { calculatePricing } from "@/lib/pricing";
import { safeNavigate, safePrefetch } from "@/lib/navigation";

function ConfigureContent() {
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

  const initialNotarize = searchParams.get("notarize") === "true";
  const initialSource = searchParams.get("source") || "es";
  const initialTarget = searchParams.get("target") || "en";

  const [sourceLang, setSourceLang] = useState(initialSource);
  const [targetLang, setTargetLang] = useState(initialTarget);
  const [primaryName, setPrimaryName] = useState("");
  const [parentName, setParentName] = useState("");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  const [needsNotarization, setNeedsNotarization] = useState(initialNotarize);
  const [isExpedited, setIsExpedited] = useState(false);
  const [needsHardCopy, setNeedsHardCopy] = useState(false);
  const [needsApostille, setNeedsApostille] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const pricing = calculatePricing({
    serviceType: "CERTIFIED",
    pageCount: pages,
    wordCount: words,
    isExpedited,
    needsNotarization,
    needsHardCopy,
    needsApostille,
  });

  const targetUrl = `/order/checkout?pages=${pages}&words=${words}&notarize=${needsNotarization}&expedited=${isExpedited}&hardcopy=${needsHardCopy}&apostille=${needsApostille}&source=${sourceLang}&target=${targetLang}`;

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
          sourceLang,
          targetLang,
          primaryName,
          parentName,
          dateFormat,
          needsNotarization,
          isExpedited,
          needsHardCopy,
          needsApostille,
        })
      );
    } catch (e) {
      console.warn("[Configure] Failed to cache state in sessionStorage:", e);
    }

    safeNavigate(router, targetUrl, { fallbackTimeoutMs: 1500 });
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            Step 3 of 4
          </span>
          <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">
            Translation Configuration
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Lock in your requirements.
        </h1>
        <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
          Set the exact language pair and freeze name spellings to ensure 100% compliance with government records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Config forms */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Language Pair Card */}
          <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
             <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-2xl font-bold text-slate-900">
                    Language Pair
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label htmlFor="configure-source-lang" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Source Language (Original)
                </label>
                <div className="relative">
                  <select
                    id="configure-source-lang"
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
                  >
                    {POPULAR_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.nativeName})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="configure-target-lang" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Language (Certified)
                </label>
                <div className="relative">
                  <select
                    id="configure-target-lang"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
                  >
                    <option value="en">English (USCIS Standard)</option>
                    {POPULAR_LANGUAGES.filter((l) => l.code !== "en").map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Name & Date Consistency Lock Card */}
          <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-2xl font-bold text-slate-900">
                    Glossary Lock
                  </h3>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Hard-locked glossary terms that the translator cannot deviate from.
                </p>
              </div>
              <span className="hidden sm:inline-flex px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full">
                RFE Prevention
              </span>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label htmlFor="primary-passport-name" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Applicant Full Name (Exact Passport Spelling)
                </label>
                <input
                  type="text"
                  id="primary-passport-name"
                  placeholder="e.g. MOHAMMED ABDULLAH AL-RASHID"
                  value={primaryName}
                  onChange={(e) => setPrimaryName(e.target.value)}
                  className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
                />
                <p className="text-[11px] text-slate-500 font-medium">
                  Copy letter-for-letter from machine-readable passport zone to prevent government mismatch.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="parent-passport-name" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Secondary Name (Optional)
                </label>
                <input
                  type="text"
                  id="parent-passport-name"
                  placeholder="e.g. FATIMA ZAHRA AL-RASHID"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label htmlFor="date-format-select" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Target Date Format Preference
                </label>
                <div className="relative">
                  <select
                    id="date-format-select"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard: 09/24/1992)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (International: 24/09/1992)</option>
                    <option value="MONTH_DD_YYYY">Spelled Out (September 24, 1992)</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add-On Toggles */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">
                Recommended Add-Ons
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Select additional certifications required for your legal or physical submission.
              </p>
            </div>

            <div className="space-y-4">
              <SaaSToggleRow
                title="Notarization Certificate"
                description="Official notary jurat with wet & electronic seal for courts, DMVs & foreign consulates."
                priceDelta="+$19.95"
                checked={needsNotarization}
                onCheckedChange={setNeedsNotarization}
                badge="Courts & Consulates"
              />
              <SaaSToggleRow
                title="Expedited 12-Hour Turnaround"
                description="Priority queue placement; cuts turnaround by 50% for urgent filings."
                priceDelta={`+$${pricing.expeditedFee.toFixed(2)}`}
                checked={isExpedited}
                onCheckedChange={setIsExpedited}
                badge="Fastest"
              />
              <SaaSToggleRow
                title="Physical Hard Copy by Mail"
                description="Embossed certificate on 32lb bond archival paper with USPS tracking."
                priceDelta="+$19.95"
                checked={needsHardCopy}
                onCheckedChange={setNeedsHardCopy}
              />
              <SaaSToggleRow
                title="State Apostille Authentication"
                description="Secretary of State apostille certificate for foreign legal recognition."
                priceDelta="+$75.00"
                checked={needsApostille}
                onCheckedChange={setNeedsApostille}
              />
            </div>

            <div className="pt-6 flex justify-end">
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
                    <span>Preparing Checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Checkout</span>
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
               {pricing.expeditedFee > 0 && (
                 <div className="flex justify-between items-center text-sm text-blue-600">
                   <span className="font-semibold">Expedited 12-Hr</span>
                   <span className="font-bold tabular-nums">+${pricing.expeditedFee.toFixed(2)}</span>
                 </div>
               )}
               {pricing.hardCopyFee > 0 && (
                 <div className="flex justify-between items-center text-sm text-blue-600">
                   <span className="font-semibold">Physical Hard Copy</span>
                   <span className="font-bold tabular-nums">+${pricing.hardCopyFee.toFixed(2)}</span>
                 </div>
               )}
               {pricing.apostilleFee > 0 && (
                 <div className="flex justify-between items-center text-sm text-blue-600">
                   <span className="font-semibold">Apostille</span>
                   <span className="font-bold tabular-nums">+${pricing.apostilleFee.toFixed(2)}</span>
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

function SaaSToggleRow({ title, description, priceDelta, checked, onCheckedChange, badge }: any) {
  return (
    <div 
      className={cn(
        "flex items-start justify-between p-5 rounded-2xl border-2 transition-colors cursor-pointer",
        checked ? "border-blue-600 bg-blue-50/30" : "border-slate-100 bg-white hover:border-slate-200"
      )}
      onClick={() => onCheckedChange(!checked)}
    >
      <div className="flex-1 pr-6 space-y-1">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-900">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 font-medium">{description}</p>
        <div className="text-sm font-bold text-blue-600 mt-2">{priceDelta}</div>
      </div>
      
      {/* Custom SaaS Toggle Switch */}
      <div className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors mt-1",
        checked ? "bg-blue-600" : "bg-slate-200"
      )}>
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </div>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}

export default function ConfigurePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-medium">Loading requirements...</div>}>
      <ConfigureContent />
    </Suspense>
  );
}
