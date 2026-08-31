"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StickyPriceBar } from "@/components/order/StickyPriceBar";
import { calculatePricing } from "@/lib/pricing";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pages = parseInt(searchParams.get("pages") || "1", 10);
  const words = parseInt(searchParams.get("words") || "250", 10);

  const [guestEmail, setGuestEmail] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardExpiry, setCardExpiry] = React.useState("");
  const [cardCvc, setCardCvc] = React.useState("");
  const [cardholderName, setCardholderName] = React.useState("");

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [orderConfig, setOrderConfig] = React.useState<{
    sourceLang?: string;
    targetLang?: string;
    primaryName?: string;
    parentName?: string;
    dateFormat?: string;
    needsNotarization?: boolean;
    isExpedited?: boolean;
    needsHardCopy?: boolean;
    needsApostille?: boolean;
    fileName?: string;
  }>({});

  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem("order_config");
      const triage = sessionStorage.getItem("triage_result");
      let cfg: any = {};
      if (stored) cfg = { ...cfg, ...JSON.parse(stored) };
      if (triage) cfg = { ...cfg, ...JSON.parse(triage) };
      setOrderConfig(cfg);
      if (cfg.primaryName) setCardholderName(cfg.primaryName);
    } catch {
      // ignore
    }
  }, []);

  const pricing = React.useMemo(() => {
    return calculatePricing({
      serviceType: "CERTIFIED",
      pageCount: pages,
      wordCount: words,
      isExpedited: orderConfig.isExpedited,
      needsNotarization: orderConfig.needsNotarization,
      needsHardCopy: orderConfig.needsHardCopy,
      needsApostille: orderConfig.needsApostille,
    });
  }, [pages, words, orderConfig]);

  const handleProcessOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!guestEmail || !guestEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address to receive your certified translation.");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestEmail,
          phoneNumber,
          sourceLang: orderConfig.sourceLang || "es",
          targetLang: orderConfig.targetLang || "en",
          serviceType: "CERTIFIED",
          pageCount: pricing.pageCount,
          wordCount: pricing.wordCount,
          primaryName: orderConfig.primaryName,
          parentName: orderConfig.parentName,
          dateFormat: orderConfig.dateFormat || "MM/DD/YYYY",
          needsNotarization: orderConfig.needsNotarization,
          isExpedited: orderConfig.isExpedited,
          needsHardCopy: orderConfig.needsHardCopy,
          needsApostille: orderConfig.needsApostille,
          fileName: orderConfig.fileName || "certified_document.pdf",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment authorization failed");
      }

      sessionStorage.setItem("last_order_code", data.publicCode);
      router.push(`/order/${data.publicCode}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process order. Please check card details.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs font-mono font-bold">
            Step 4 of 4
          </Badge>
          <span className="text-xs font-mono text-brand-500 font-bold uppercase tracking-wider">
            Secure Guest Checkout (§5.2)
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-ink tracking-tight">
          Authorize Order & Start Translation
        </h1>
        <p className="text-sm sm:text-base text-text-muted max-w-3xl leading-relaxed">
          No password or upfront registration required. Your order will be assigned to a certified translator
          immediately upon payment authorization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Guest Email & Payment Form */}
        <div className="lg:col-span-8 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Guest Delivery Information */}
          <Card className="p-6 md:p-8 rounded-[28px] bg-surface-raised border border-border space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500">
                Delivery Destination
              </span>
              <h3 className="text-xl font-bold text-brand-ink">
                Where should we send your signed certified PDF?
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="checkout-email" className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                  Email Address (Primary Delivery) *
                </label>
                <Input
                  id="checkout-email"
                  type="email"
                  placeholder="name@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="checkout-phone" className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                  Mobile Number (SMS / WhatsApp Alerts)
                </label>
                <Input
                  id="checkout-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Payment Card Inputs */}
          <Card className="p-6 md:p-8 rounded-[28px] bg-surface-raised border-2 border-brand-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-500" />
                  <h3 className="text-xl font-bold text-brand-ink">
                    Payment Method
                  </h3>
                </div>
                <p className="text-xs text-text-muted">
                  All transactions are 256-bit encrypted. We never store raw card numbers.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-text-muted font-mono">
                <Lock className="w-3.5 h-3.5 text-brand-500" />
                <span>Stripe Verified</span>
              </div>
            </div>

            <form onSubmit={handleProcessOrder} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="checkout-cardholder" className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                  Cardholder Name
                </label>
                <Input
                  id="checkout-cardholder"
                  placeholder="Name on card"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="checkout-cardnum" className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                  Card Number
                </label>
                <Input
                  id="checkout-cardnum"
                  placeholder="4242 •••• •••• 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="checkout-expiry" className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                    Expiry Date
                  </label>
                  <Input
                    id="checkout-expiry"
                    placeholder="MM / YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    maxLength={5}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="checkout-cvc" className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                    CVC / CVV
                  </label>
                  <Input
                    id="checkout-cvc"
                    placeholder="CVC"
                    type="password"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  size="lg"
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-14 rounded-2xl text-base font-bold gap-2 shadow-md"
                >
                  {isProcessing ? (
                    "Authorizing Payment..."
                  ) : (
                    <>
                      Pay {formatCurrency(pricing.total)} & Start Translation
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          <div className="p-5 rounded-2xl bg-brand-50 border border-brand-100 flex items-center gap-3 text-xs text-brand-ink">
            <ShieldCheck className="w-5 h-5 text-status-success shrink-0" />
            <p className="leading-relaxed">
              <strong>100% USCIS Acceptance Guarantee:</strong> Your payment is protected by our full-refund pledge. If your translation is rejected for any translation defect, we redo it free and refund your order completely.
            </p>
          </div>
        </div>

        {/* Right Sticky Rail */}
        <div className="lg:col-span-4">
          <StickyPriceBar
            pricing={pricing}
            onNext={handleProcessOrder}
            nextLabel={`Pay ${formatCurrency(pricing.total)}`}
            disabled={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-muted">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
