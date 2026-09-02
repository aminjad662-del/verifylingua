"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleRow } from "@/components/ui/toggle-row";
import { StickyPriceBar } from "@/components/order/StickyPriceBar";
import { POPULAR_LANGUAGES } from "@/lib/constants";
import { calculatePricing } from "@/lib/pricing";
import {
  Lock,
  Globe2,
  Calendar,
  User,
} from "lucide-react";

function ConfigureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pages = parseInt(searchParams.get("pages") || "1", 10);
  const words = parseInt(searchParams.get("words") || "250", 10);
  const initialNotarize = searchParams.get("notarize") === "true";
  const initialSource = searchParams.get("source") || "es";
  const initialTarget = searchParams.get("target") || "en";

  const [sourceLang, setSourceLang] = React.useState(initialSource);
  const [targetLang, setTargetLang] = React.useState(initialTarget);

  const [primaryName, setPrimaryName] = React.useState("");
  const [parentName, setParentName] = React.useState("");
  const [dateFormat, setDateFormat] = React.useState("MM/DD/YYYY");

  const [needsNotarization, setNeedsNotarization] = React.useState(initialNotarize);
  const [isExpedited, setIsExpedited] = React.useState(false);
  const [needsHardCopy, setNeedsHardCopy] = React.useState(false);
  const [needsApostille, setNeedsApostille] = React.useState(false);

  const pricing = React.useMemo(() => {
    return calculatePricing({
      serviceType: "CERTIFIED",
      pageCount: pages,
      wordCount: words,
      isExpedited,
      needsNotarization,
      needsHardCopy,
      needsApostille,
    });
  }, [pages, words, isExpedited, needsNotarization, needsHardCopy, needsApostille]);

  const handleContinue = () => {
    try {
      sessionStorage.setItem(
        "order_config",
        JSON.stringify({
          sourceLang,
          targetLang,
          primaryName,
          parentName,
          dateFormat,
          needsNotarization,
          isExpedited,
          needsHardCopy,
          needsApostille,
          pages,
          words,
          total: pricing.total,
        })
      );
    } catch {
      // ignore
    }

    router.push(
      `/order/checkout?pages=${pages}&words=${words}&total=${pricing.total}`
    );
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs font-mono font-bold">
            Step 3 of 4
          </Badge>
          <span className="text-xs font-mono text-brand-500 font-bold uppercase tracking-wider">
            Language & Name Consistency Lock (§2.3)
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-ink tracking-tight font-display">
          Lock In Passport Spellings & Options
        </h1>
        <p className="text-sm sm:text-base text-ink-soft max-w-3xl leading-relaxed">
          USCIS rejects translations when foreign names differ by even one letter from your passport.
          We lock your exact transliteration into the translator workspace to prevent silent RFEs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-8 space-y-6">
          {/* Language Pair Selector */}
          <Card className="p-6 md:p-8 rounded-[28px] bg-surface-raised border border-border space-y-4">
            <h3 className="text-lg font-bold text-brand-ink flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-brand-500" />
              Language Pair
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="configure-source-lang" className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Source Language (Document)
                </label>
                <select
                  id="configure-source-lang"
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl border border-border bg-surface text-sm font-semibold text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {POPULAR_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="configure-target-lang" className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Target Language (Certified Translation)
                </label>
                <select
                  id="configure-target-lang"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl border border-border bg-surface text-sm font-semibold text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="en">English (USCIS / Standard)</option>
                  {POPULAR_LANGUAGES.filter((l) => l.code !== "en").map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Name & Date Consistency Lock Card (§2.3) */}
          <Card className="p-6 md:p-8 rounded-[28px] bg-surface-raised border-2 border-brand-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-brand-500" />
                  <h3 className="text-lg font-bold text-brand-ink">
                    Passport Name & Date Consistency Lock
                  </h3>
                </div>
                <p className="text-xs text-text-muted">
                  Hard-locked glossary terms that the translator cannot deviate from.
                </p>
              </div>
              <Badge variant="default" className="text-xs py-0.5">
                RFE Prevention
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="primary-passport-name" className="text-xs font-bold uppercase tracking-wider text-brand-ink flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-500" />
                  Applicant Full Name (Exact Passport Spelling)
                </label>
                <Input
                  id="primary-passport-name"
                  placeholder="e.g. MOHAMMED ABDULLAH AL-RASHID"
                  value={primaryName}
                  onChange={(e) => setPrimaryName(e.target.value)}
                  className="font-medium"
                />
                <p className="text-[11px] text-text-muted">
                  Copy letter-for-letter from machine-readable passport zone to prevent government mismatch.
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="parent-passport-name" className="text-xs font-bold uppercase tracking-wider text-brand-ink flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-500" />
                  Parent / Spouse / Secondary Name (Optional)
                </label>
                <Input
                  id="parent-passport-name"
                  placeholder="e.g. FATIMA ZAHRA AL-RASHID"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="font-medium"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label htmlFor="date-format-select" className="text-xs font-bold uppercase tracking-wider text-brand-ink flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-500" />
                  Target Date Format Preference
                </label>
                <select
                  id="date-format-select"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl border border-border bg-surface text-sm font-semibold text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard: e.g. 09/24/1992)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (International: e.g. 24/09/1992)</option>
                  <option value="MONTH_DD_YYYY">Spelled Out (e.g. September 24, 1992)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Add-On Toggle Rows (§5.2) */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-brand-ink">
                Recommended Add-Ons
              </h3>
              <p className="text-xs text-text-muted">
                Select additional certifications required for your legal or physical submission.
              </p>
            </div>

            <div className="space-y-3">
              <ToggleRow
                id="conf-notarization"
                title="Notarization Certificate"
                description="Official notary jurat with wet & electronic seal for courts, DMVs & foreign consulates."
                priceDelta={19.95}
                checked={needsNotarization}
                onCheckedChange={setNeedsNotarization}
                badge="Courts & Consulates"
              />

              <ToggleRow
                id="conf-expedited"
                title="Expedited 12-Hour Turnaround"
                description="Priority queue placement; cuts turnaround by 50% for urgent filings."
                priceDelta={`+$${pricing.expeditedFee.toFixed(2)}`}
                checked={isExpedited}
                onCheckedChange={setIsExpedited}
                badge="Fastest"
              />

              <ToggleRow
                id="conf-hardcopy"
                title="Physical Hard Copy by Mail"
                description="Embossed certificate on 32lb bond archival paper with USPS tracking."
                priceDelta={19.95}
                checked={needsHardCopy}
                onCheckedChange={setNeedsHardCopy}
              />

              <ToggleRow
                id="conf-apostille"
                title="State Apostille Authentication"
                description="Secretary of State apostille certificate for foreign legal recognition."
                priceDelta={75.00}
                checked={needsApostille}
                onCheckedChange={setNeedsApostille}
              />
            </div>
          </div>
        </div>

        {/* Right Sticky Rail */}
        <div className="lg:col-span-4">
          <StickyPriceBar
            pricing={pricing}
            onNext={handleContinue}
            nextLabel="Continue to Checkout"
          />
        </div>
      </div>
    </div>
  );
}

export default function ConfigurePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-muted">Loading options...</div>}>
      <ConfigureContent />
    </Suspense>
  );
}
