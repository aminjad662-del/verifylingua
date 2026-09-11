"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { FAQSection } from "@/components/marketing/FAQSection";
import { BottomCTA } from "@/components/marketing/BottomCTA";
import { InstitutionalAcceptanceStack } from "@/components/marketing/InstitutionalAcceptanceStack";
import { AcceptanceNetworkBanner } from "@/components/marketing/AcceptanceNetworkBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ToggleRow } from "@/components/ui/toggle-row";
import { ShieldCheck, CheckCircle2, ArrowRight, Clock, FileText } from "lucide-react";
import { PRICING_CONFIG } from "@/lib/constants";
import { calculatePricing, formatDeliveryDate } from "@/lib/pricing";

export default function PricingPage() {
  const [serviceType, setServiceType] = React.useState<"CERTIFIED" | "STANDARD">("CERTIFIED");
  const [pageCount, setPageCount] = React.useState(2);
  const [wordCount, setWordCount] = React.useState(500);
  const [isExpedited, setIsExpedited] = React.useState(false);
  const [needsNotarization, setNeedsNotarization] = React.useState(false);
  const [needsHardCopy, setNeedsHardCopy] = React.useState(false);
  const [needsApostille, setNeedsApostille] = React.useState(false);

  const pricing = React.useMemo(() => {
    return calculatePricing({
      serviceType,
      pageCount: serviceType === "CERTIFIED" ? pageCount : Math.ceil(wordCount / 250),
      wordCount: serviceType === "STANDARD" ? wordCount : pageCount * 250,
      isExpedited,
      needsNotarization,
      needsHardCopy,
      needsApostille,
    });
  }, [serviceType, pageCount, wordCount, isExpedited, needsNotarization, needsHardCopy, needsApostille]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-soft">
      <Header />
      <main className="flex-1">
        {/* Pricing Header */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-hero dark:bg-canvas border-b border-border/60 dark:border-white/10 text-center px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <Badge variant="default" className="gap-1.5 py-1 px-4 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              100% Transparent Flat-Rate Pricing
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-ink dark:text-white tracking-tight font-display">
              Simple, Deterministic Pricing. <br />
              <span className="text-brand-500 dark:text-brand-400">Zero Hidden Surcharges.</span>
            </h1>

            <p className="text-lg text-ink-soft dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              We match the $24.95/page industry benchmark and include pre-payment AI document triage,
              passport name-locking, and public QR verification at no extra cost.
            </p>
          </div>
        </section>

        {/* Interactive Pricing Calculator */}
        <section className="py-16 md:py-24 bg-surface dark:bg-canvas border-b border-border/60 dark:border-white/10 px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-500 dark:text-brand-400">
                Interactive Cost & Delivery Estimator
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-ink dark:text-white">
                Calculate Your Exact Quote & Turnaround
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Form Controls */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="p-6 md:p-8 space-y-6 rounded-[28px] bg-surface-raised dark:bg-slate-900/80 border border-border dark:border-white/10 shadow-sm">
                  {/* Service Type Switcher */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-brand-ink dark:text-white">Select Translation Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setServiceType("CERTIFIED")}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          serviceType === "CERTIFIED"
                            ? "border-brand-500 bg-brand-50/70 dark:bg-brand-500/20 dark:border-brand-400 text-brand-ink dark:text-white shadow-sm"
                            : "border-border bg-surface dark:bg-white/5 dark:border-white/10 text-text-muted dark:text-slate-400 hover:border-brand-300 dark:hover:border-white/20"
                        }`}
                      >
                        <p className="font-bold text-sm text-brand-ink dark:text-white">Certified Translation</p>
                        <p className="text-xs text-text-muted dark:text-slate-400 pt-0.5">$24.95 / page (250 words)</p>
                        <Badge variant="default" className="mt-2 text-[10px] py-0">USCIS & Legal Standard</Badge>
                      </button>

                      <button
                        type="button"
                        onClick={() => setServiceType("STANDARD")}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          serviceType === "STANDARD"
                            ? "border-brand-500 bg-brand-50/70 dark:bg-brand-500/20 dark:border-brand-400 text-brand-ink dark:text-white shadow-sm"
                            : "border-border bg-surface dark:bg-white/5 dark:border-white/10 text-text-muted dark:text-slate-400 hover:border-brand-300 dark:hover:border-white/20"
                        }`}
                      >
                        <p className="font-bold text-sm text-brand-ink dark:text-white">Standard Translation</p>
                        <p className="text-xs text-text-muted dark:text-slate-400 pt-0.5">$0.10 / word (250 min)</p>
                        <Badge variant="secondary" className="mt-2 text-[10px] py-0">Business / Informal</Badge>
                      </button>
                    </div>
                  </div>

                  {/* Page Count / Word Count Input */}
                  {serviceType === "CERTIFIED" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label htmlFor="pricing-page-count" className="text-sm font-bold text-brand-ink dark:text-white">
                          Document Page Count
                        </label>
                        <span className="text-sm font-mono font-bold text-brand-500 dark:text-brand-400">
                          {pageCount} {pageCount === 1 ? "Page" : "Pages"} (~{pageCount * 250} words)
                        </span>
                      </div>
                      <input
                        id="pricing-page-count"
                        type="range"
                        min="1"
                        max="20"
                        value={pageCount}
                        onChange={(e) => setPageCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-lavender-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                      />
                      <div className="flex justify-between text-xs text-text-muted dark:text-slate-400 font-mono">
                        <span>1 page</span>
                        <span>5 pages</span>
                        <span>10 pages</span>
                        <span>20+ pages</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="pricing-word-count" className="text-sm font-bold text-brand-ink dark:text-white">
                          Word Count
                        </label>
                        <span className="text-sm font-mono font-bold text-brand-500 dark:text-brand-400">
                          {wordCount} words
                        </span>
                      </div>
                      <input
                        id="pricing-word-count"
                        type="number"
                        min="250"
                        step="50"
                        value={wordCount}
                        onChange={(e) => setWordCount(Math.max(250, parseInt(e.target.value) || 250))}
                        className="w-full h-12 px-4 rounded-xl border border-border dark:border-white/15 bg-surface dark:bg-slate-800 text-base font-semibold text-brand-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  )}

                  {/* Add-On Switches */}
                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-bold text-brand-ink dark:text-white">Add-On Options (§5.2)</label>

                    <ToggleRow
                      id="pricing-notarization"
                      title="Notarization Certificate"
                      description="Official notary jurat with seal for courts, DMVs & foreign consulates."
                      priceDelta={19.95}
                      checked={needsNotarization}
                      onCheckedChange={setNeedsNotarization}
                      badge="Courts & Consulates"
                    />

                    <ToggleRow
                      id="pricing-expedited"
                      title="Expedited 12-Hour Turnaround"
                      description="Priority translator assignment; cuts delivery time by 50%."
                      priceDelta={`+$${(pricing.basePrice * 0.6).toFixed(2)}`}
                      checked={isExpedited}
                      onCheckedChange={setIsExpedited}
                      badge="Fastest"
                    />

                    <ToggleRow
                      id="pricing-hardcopy"
                      title="Physical Hard Copy by Mail"
                      description="Embossed certificate on 32lb bond archival paper with USPS tracking."
                      priceDelta={19.95}
                      checked={needsHardCopy}
                      onCheckedChange={setNeedsHardCopy}
                    />

                    <ToggleRow
                      id="pricing-apostille"
                      title="State Apostille Authentication"
                      description="Secretary of State apostille certificate for foreign legal recognition."
                      priceDelta={75.00}
                      checked={needsApostille}
                      onCheckedChange={setNeedsApostille}
                    />
                  </div>
                </Card>
              </div>

              {/* Right Sticky Summary Card */}
              <div className="lg:col-span-5 sticky top-28">
                <Card className="p-6 md:p-8 rounded-[28px] border-2 border-brand-500 bg-surface-raised dark:bg-slate-900 shadow-xl space-y-6 dark:border-brand-400 dark:shadow-[0_0_40px_rgba(30,58,138,0.3)]">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500 dark:text-brand-400">
                      Live Guaranteed Quote
                    </span>
                    <h3 className="text-2xl font-black text-brand-ink dark:text-white tracking-tight">
                      Order Summary
                    </h3>
                  </div>

                  <div className="space-y-3 border-y border-border dark:border-white/10 py-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted dark:text-slate-400">Base Translation ({pricing.pageCount} pages)</span>
                      <span className="font-mono font-bold text-brand-ink dark:text-white">${pricing.basePrice.toFixed(2)}</span>
                    </div>

                    {isExpedited && (
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted dark:text-slate-400">Expedited Delivery (+60%)</span>
                        <span className="font-mono font-bold text-brand-ink dark:text-white">+${pricing.expeditedFee.toFixed(2)}</span>
                      </div>
                    )}

                    {needsNotarization && (
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted dark:text-slate-400">Notarization Certificate</span>
                        <span className="font-mono font-bold text-brand-ink dark:text-white">+${pricing.notarizationFee.toFixed(2)}</span>
                      </div>
                    )}

                    {needsHardCopy && (
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted dark:text-slate-400">Physical Hard Copy & Postage</span>
                        <span className="font-mono font-bold text-brand-ink dark:text-white">+${pricing.hardCopyFee.toFixed(2)}</span>
                      </div>
                    )}

                    {needsApostille && (
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted dark:text-slate-400">State Apostille Authentication</span>
                        <span className="font-mono font-bold text-brand-ink dark:text-white">+${pricing.apostilleFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Guaranteed Delivery Time (§2.4) */}
                  <div className="p-4 rounded-2xl bg-lavender-50 border border-border/80 dark:bg-brand-950/40 dark:border-brand-500/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-500 dark:text-brand-400 uppercase tracking-wide">
                      <Clock className="w-4 h-4" />
                      <span>Deterministic Promised Delivery</span>
                    </div>
                    <p suppressHydrationWarning className="text-lg font-black text-brand-ink dark:text-white font-mono">
                      {pricing.promisedAtFormatted}
                    </p>
                    <p className="text-[11px] text-text-muted dark:text-slate-400">
                      Factor in our 2x/day notary batch schedule & timezone calibration.
                    </p>
                  </div>

                  {/* Total & Action */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-brand-ink dark:text-white">Total Investment</span>
                      <span className="text-3xl font-black text-brand-ink dark:text-white font-mono">
                        ${pricing.total.toFixed(2)}
                      </span>
                    </div>

                    <Button size="lg" asChild className="w-full h-14 rounded-2xl text-base font-bold gap-2 shadow-md">
                      <Link href={`/order/triage?pages=${pricing.pageCount}&expedited=${isExpedited}&notarization=${needsNotarization}`}>
                        Start translation
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </Button>

                    <div className="text-center space-y-1">
                      <p className="text-xs text-status-success font-bold flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        100% USCIS Acceptance Guarantee
                      </p>
                      <p className="text-[11px] text-text-muted">
                        Rejected by USCIS? Free redo + full 100% refund.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Institutional Acceptance Directory */}
        <InstitutionalAcceptanceStack />

        {/* Acceptance Network Across 50 States */}
        <AcceptanceNetworkBanner />

        {/* Incumbent Comparison Matrix */}
        <ComparisonTable />

        {/* Pricing FAQ */}
        <FAQSection />

        {/* Bottom CTA */}
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
