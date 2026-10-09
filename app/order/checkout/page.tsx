"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, ShieldCheck, Lock, AlertCircle, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculatePricing } from "@/lib/pricing";
import { safeNavigate } from "@/lib/navigation";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pages = parseInt(searchParams.get("pages") || "1", 10);
  const words = parseInt(searchParams.get("words") || "250", 10);
  const isExpedited = searchParams.get("expedited") === "true";
  const needsNotarization = searchParams.get("notarize") === "true";
  const needsHardCopy = searchParams.get("hardcopy") === "true";
  const needsApostille = searchParams.get("apostille") === "true";

  const pricing = calculatePricing({
    serviceType: "CERTIFIED",
    pageCount: pages,
    wordCount: words,
    isExpedited,
    needsNotarization,
    needsHardCopy,
    needsApostille,
  });

  const [guestEmail, setGuestEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleProcessOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!guestEmail || !cardNumber || !cardExpiry || !cardCvc || !cardholderName) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestEmail,
          pageCount: pages,
          primaryName: cardholderName,
          needsNotarization,
          isExpedited,
          needsHardCopy,
          needsApostille,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errMsg = err.error || err.message || "Failed to process payment authorization.";
        if (res.status >= 500 || err.error === "DATABASE_INSERT_FAILED") {
          if (typeof window !== "undefined") {
            alert(
              `Order Error (500): ${errMsg}\n\nThe order could not be saved to the database. Please try again.`
            );
          }
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      const trackerId = data.publicCode || data.jobId || data.id || data.orderId;
      if (!trackerId || trackerId === "undefined" || trackerId === "null") {
        if (typeof window !== "undefined") {
          alert("Order Error: Server returned an invalid tracking ID without confirmed database persistence.");
        }
        throw new Error("Invalid tracking ID received from server.");
      }

      try {
        await fetch("/api/translations/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: trackerId,
            userId: data.userId || guestEmail,
            sourcePath: data.sourcePath || `source_documents/order_${trackerId}.pdf`,
            sourceLang: searchParams.get("source") || "es",
            targetLang: searchParams.get("target") || "en",
            docType: "certified_translation",
          }),
        });
      } catch {}

      safeNavigate(router, `/tracker/${trackerId}`, { fallbackTimeoutMs: 1500 });
    } catch (err: any) {
      setErrorMsg(err.message || "Payment processing failed. Please verify card details.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            Step 4 of 4
          </span>
          <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">
            Secure Checkout
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Authorize Order & Start Translation
        </h1>
        <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
          No password or upfront registration required. Your order will be assigned to a certified translator
          immediately upon payment authorization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Guest Email & Payment Form */}
        <div className="lg:col-span-8 space-y-8">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Guest Delivery Information */}
          <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 relative z-10">
              <div className="space-y-1">
                <span className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-600">
                  <Mail className="w-3.5 h-3.5" />
                  Delivery Destination
                </span>
                <h3 className="text-2xl font-bold text-slate-900">
                  Where should we send your signed PDF?
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label htmlFor="checkout-email" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address *
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  placeholder="name@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="checkout-phone" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Mobile Number (Optional SMS Alerts)
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Payment Card Inputs */}
          <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-6 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h3 className="text-2xl font-bold text-slate-900">
                    Payment Method
                  </h3>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  All transactions are 256-bit encrypted. We never store raw card numbers.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                <Lock className="w-3.5 h-3.5" />
                <span>Stripe Verified</span>
              </div>
            </div>

            <form onSubmit={handleProcessOrder} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label htmlFor="checkout-cardholder" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Cardholder Name
                </label>
                <input
                  id="checkout-cardholder"
                  type="text"
                  placeholder="Name on card"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="checkout-cardnum" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Card Number
                </label>
                <input
                  id="checkout-cardnum"
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 transition-colors tracking-widest font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="checkout-expiry" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Expiry Date
                  </label>
                  <input
                    id="checkout-expiry"
                    type="text"
                    placeholder="MM / YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    maxLength={5}
                    className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 transition-colors text-center font-mono tracking-widest"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="checkout-cvc" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    CVC / CVV
                  </label>
                  <input
                    id="checkout-cvc"
                    type="password"
                    placeholder="***"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    maxLength={4}
                    className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 transition-colors text-center font-mono tracking-widest"
                    required
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-16 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(37,99,235,0.25)] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authorizing Payment...
                    </span>
                  ) : (
                    <>
                      Pay ${pricing.total.toFixed(2)} & Start Translation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4 text-sm text-slate-700 shadow-sm">
            <div className="p-2 bg-green-100 text-green-700 rounded-lg shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="leading-relaxed font-medium">
              <strong className="text-slate-900 font-bold block mb-1">100% USCIS Acceptance Guarantee</strong>
              Your payment is protected by our full-refund pledge. If your translation is rejected for any translation defect, we redo it free and refund your order completely.
            </p>
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
               onClick={handleProcessOrder}
               disabled={isProcessing}
               className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg active:scale-95 disabled:opacity-70 disabled:active:scale-100"
             >
               {isProcessing ? "Processing..." : `Pay $${pricing.total.toFixed(2)}`}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-medium">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
