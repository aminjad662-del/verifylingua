"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StickyPriceBar } from "@/components/order/StickyPriceBar";
import { RECEIVING_PARTIES } from "@/lib/constants";
import { calculatePricing } from "@/lib/pricing";
import {
  Building2,
  GraduationCap,
  Scale,
  Car,
  Globe2,
  Briefcase,
  CheckCircle2,
  Check,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AGENCY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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

  const pages = parseInt(searchParams.get("pages") || "1", 10);
  const words = parseInt(searchParams.get("words") || "250", 10);

  const [selectedAgencyId, setSelectedAgencyId] = React.useState("USCIS");

  const selectedAgency = React.useMemo(() => {
    return (
      RECEIVING_PARTIES.find((p) => p.id === selectedAgencyId) ||
      RECEIVING_PARTIES[0]
    );
  }, [selectedAgencyId]);

  const pricing = React.useMemo(() => {
    return calculatePricing({
      serviceType: "CERTIFIED",
      pageCount: pages,
      wordCount: words,
      needsNotarization: selectedAgency.requiresNotarization,
      isExpedited: false,
    });
  }, [pages, words, selectedAgency]);

  const handleContinue = () => {
    try {
      sessionStorage.setItem("receiving_party", selectedAgencyId);
    } catch {
      // ignore
    }
    router.push(
      `/order/configure?agency=${selectedAgencyId}&pages=${pages}&words=${words}&notarize=${selectedAgency.requiresNotarization ? "true" : "false"}`
    );
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs font-mono font-bold bg-ink text-sand">
            Step 2 of 4
          </Badge>
          <span className="text-xs font-mono text-cta font-bold uppercase tracking-wider">
            Configure Receiving Authority (§2.1)
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight font-serif">
          Who is Receiving This Document?
        </h1>
        <p className="text-sm sm:text-base text-ink-muted max-w-3xl leading-relaxed">
          Different institutions have distinct legal certification requirements. We pre-configure your order
          to match your receiving authority&apos;s exact compliance rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Agency Selection & Spec Sheet */}
        <div className="lg:col-span-8 space-y-6">
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
                    "relative p-5 rounded-2xl text-left transition-all flex flex-col justify-between space-y-4 cursor-pointer",
                    isSelected
                      ? "border-[2.5px] border-ink bg-surface-raised shadow-lg ring-1 ring-ink/10 -translate-y-1"
                      : "border border-border/80 bg-surface-raised/70 hover:border-ink/30 hover:bg-surface-raised"
                  )}
                >
                  {isSelected && (
                    <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-trust text-white flex items-center justify-center shadow-md ring-2 ring-surface-raised z-10">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-ink text-sand shadow-sm"
                          : "bg-surface text-ink-muted border border-border"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-ink leading-snug">
                      {party.name}
                    </h3>
                  </div>

                  <Badge
                    variant={isSelected ? "default" : "secondary"}
                    className={cn(
                      "text-[10px] py-0 px-2 self-start",
                      isSelected ? "bg-ink text-sand" : "text-ink-muted"
                    )}
                  >
                    {party.badgeText}
                  </Badge>
                </button>
              );
            })}
          </div>

          <Card className="p-6 md:p-8 rounded-[28px] bg-surface-raised border border-border/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cta">
                  Compliance Spec Sheet
                </span>
                <h3 className="text-xl font-bold text-ink font-serif">
                  Requirements for {selectedAgency.name}
                </h3>
              </div>
              <Badge variant="success" className="text-xs py-1 px-3 bg-trust-bg text-trust border border-trust-border">
                Pre-Configured
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                <span className="text-xs font-semibold text-ink-muted block">
                  Certification Format
                </span>
                <p className="font-bold text-ink flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-trust" />
                  Certified Accuracy Certificate (8 CFR 103.2)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                <span className="text-xs font-semibold text-ink-muted block">
                  Notarization Jurat
                </span>
                <p className="font-bold text-ink flex items-center gap-1.5">
                  {selectedAgency.requiresNotarization ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-cta" />
                      Required (Added to order)
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-trust" />
                      Not Required (Standard certified suffices)
                    </>
                  )}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                <span className="text-xs font-semibold text-ink-muted block">
                  Seal & Watermark Translation
                </span>
                <p className="font-bold text-ink flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-trust" />
                  100% Mirror-Formatted
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                <span className="text-xs font-semibold text-ink-muted block">
                  Verification Method
                </span>
                <p className="font-bold text-ink flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-trust" />
                  Public Cryptographic QR Link
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sand border border-border/80 text-xs text-ink-muted leading-relaxed">
              <strong className="text-ink font-bold">Summary Specification:</strong>{" "}
              {selectedAgency.specSummary}
            </div>

            {/* Proximity Principle Action Button */}
            <div className="pt-2 flex justify-end">
              <Button
                variant="cta"
                size="lg"
                onClick={handleContinue}
                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-cta hover:bg-cta-hover active:bg-cta-active text-white font-bold gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <span>Continue to Lock</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Sticky Rail */}
        <div className="lg:col-span-4">
          <StickyPriceBar
            pricing={pricing}
            onNext={handleContinue}
            nextLabel="Continue to Lock"
          />
        </div>
      </div>
    </div>
  );
}

export default function PreCheckPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-muted">Loading agency precheck...</div>}>
      <PreCheckContent />
    </Suspense>
  );
}
