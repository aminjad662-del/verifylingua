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
} from "lucide-react";

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
          <Badge variant="default" className="text-xs font-mono font-bold">
            Step 2 of 4
          </Badge>
          <span className="text-xs font-mono text-brand-500 font-bold uppercase tracking-wider">
            Acceptance Pre-Check Wizard (§2.1)
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-ink tracking-tight">
          Who is Receiving This Document?
        </h1>
        <p className="text-sm sm:text-base text-text-muted max-w-3xl leading-relaxed">
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
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? "border-brand-500 bg-brand-50/70 shadow-md ring-2 ring-brand-500/20"
                      : "border-border bg-surface-raised hover:border-brand-300 hover:bg-surface"
                  }`}
                >
                  <div className="space-y-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? "bg-brand-500 text-white"
                          : "bg-surface text-brand-500 border border-border"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-brand-ink leading-snug">
                      {party.name}
                    </h3>
                  </div>

                  <Badge
                    variant={isSelected ? "default" : "secondary"}
                    className="text-[10px] py-0 px-2 self-start"
                  >
                    {party.badgeText}
                  </Badge>
                </button>
              );
            })}
          </div>

          <Card className="p-6 md:p-8 rounded-[28px] bg-surface-raised border-2 border-brand-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500">
                  Compliance Spec Sheet
                </span>
                <h3 className="text-xl font-bold text-brand-ink">
                  Requirements for {selectedAgency.name}
                </h3>
              </div>
              <Badge variant="success" className="text-xs py-1 px-3">
                Pre-Configured
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                <span className="text-xs font-semibold text-text-muted block">
                  Certification Format
                </span>
                <p className="font-bold text-brand-ink flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                  Certified Accuracy Certificate (8 CFR 103.2)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                <span className="text-xs font-semibold text-text-muted block">
                  Notarization Jurat
                </span>
                <p className="font-bold text-brand-ink flex items-center gap-1.5">
                  {selectedAgency.requiresNotarization ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-brand-500" />
                      Required (Added to order)
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-status-success" />
                      Not Required (Standard certified suffices)
                    </>
                  )}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                <span className="text-xs font-semibold text-text-muted block">
                  Seal & Watermark Translation
                </span>
                <p className="font-bold text-brand-ink flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                  100% Mirror-Formatted
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                <span className="text-xs font-semibold text-text-muted block">
                  Verification Method
                </span>
                <p className="font-bold text-brand-ink flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                  Public Cryptographic QR Link
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-lavender-50 border border-border text-xs text-text-muted leading-relaxed">
              <strong className="text-brand-ink font-bold">Summary Specification:</strong>{" "}
              {selectedAgency.specSummary}
            </div>
          </Card>
        </div>

        {/* Right Sticky Rail */}
        <div className="lg:col-span-4">
          <StickyPriceBar
            pricing={pricing}
            onNext={handleContinue}
            nextLabel="Continue to Name Lock"
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
