"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  User,
  Bell,
  FolderLock,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("code") || "VL-CURRENT";

  const [step, setStep] = React.useState(1);

  // Step 1: Names
  const [primaryName, setPrimaryName] = React.useState("");
  const [secondaryName, setSecondaryName] = React.useState("");

  // Step 2: Notifications
  const [channel, setChannel] = React.useState<"EMAIL" | "SMS" | "WHATSAPP">("EMAIL");
  const [phone, setPhone] = React.useState("");

  // Step 3: Vault
  const [vaultOptIn, setVaultOptIn] = React.useState(true);

  const handleFinish = () => {
    router.push(`/order/${orderCode}`);
  };

  const handleSkip = () => {
    router.push(`/order/${orderCode}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      {/* Header */}
      <header className="border-b border-border bg-surface-raised/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-500 text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-brand-ink">
              Verify<span className="text-brand-500">Lingua</span>
            </span>
          </Link>

          <button
            onClick={handleSkip}
            className="text-xs font-bold text-text-muted hover:text-brand-500 transition-colors"
          >
            Skip to Order Tracker →
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 space-y-8">
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`h-2 flex-1 rounded-full transition-all ${
                  step >= s ? "bg-brand-500" : "bg-border"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step 1: Name Consistency Lock */}
        {step === 1 && (
          <Card className="p-8 md:p-10 rounded-[32px] bg-surface-raised border-2 border-brand-100 shadow-lg space-y-6">
            <div className="space-y-2">
              <Badge variant="default" className="text-xs font-mono font-bold">
                Step 1 of 3 (Highest Value)
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-ink tracking-tight">
                Confirm Exact Passport Spellings
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                USCIS checks names against machine-readable passport zones. Ensure every letter matches to prevent government delays.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                  Applicant Name (Exact Passport Spelling)
                </label>
                <Input
                  placeholder="e.g. MOHAMMED ABDULLAH AL-RASHID"
                  value={primaryName}
                  onChange={(e) => setPrimaryName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                  Parent / Spouse / Secondary Name (Optional)
                </label>
                <Input
                  placeholder="e.g. FATIMA ZAHRA AL-RASHID"
                  value={secondaryName}
                  onChange={(e) => setSecondaryName(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-border">
              <button
                onClick={handleSkip}
                className="text-xs font-bold text-text-muted hover:text-brand-ink"
              >
                Skip this step
              </button>

              <Button
                onClick={() => setStep(2)}
                className="gap-2 rounded-xl font-bold px-6"
              >
                Next: Notifications
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Notification Channel */}
        {step === 2 && (
          <Card className="p-8 md:p-10 rounded-[32px] bg-surface-raised border-2 border-brand-100 shadow-lg space-y-6">
            <div className="space-y-2">
              <Badge variant="default" className="text-xs font-mono font-bold">
                Step 2 of 3
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-ink tracking-tight">
                How Should We Reach You?
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Get real-time updates when your translation is assigned, enters review, and is certified.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { id: "EMAIL", label: "Email" },
                { id: "SMS", label: "SMS Text" },
                { id: "WHATSAPP", label: "WhatsApp" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setChannel(item.id as any)}
                  className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all ${
                    channel === item.id
                      ? "border-brand-500 bg-brand-50 text-brand-500 ring-2 ring-brand-500/20"
                      : "border-border bg-surface text-brand-ink hover:bg-surface-raised"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {channel !== "EMAIL" && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-border">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="rounded-xl font-bold"
              >
                Back
              </Button>

              <Button
                onClick={() => setStep(3)}
                className="gap-2 rounded-xl font-bold px-6"
              >
                Next: Document Vault
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Encrypted Document Vault Opt-In */}
        {step === 3 && (
          <Card className="p-8 md:p-10 rounded-[32px] bg-surface-raised border-2 border-brand-100 shadow-lg space-y-6">
            <div className="space-y-2">
              <Badge variant="default" className="text-xs font-mono font-bold">
                Step 3 of 3
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-ink tracking-tight">
                Save to Encrypted Document Vault?
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Opt in to store your original scans in a 256-bit encrypted personal vault for instant one-click re-translations for future visa filings.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-lavender-50 border border-border space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vaultOptIn}
                  onChange={(e) => setVaultOptIn(e.target.checked)}
                  className="mt-1 rounded text-brand-500 focus:ring-brand-500"
                />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-brand-ink">
                    Yes, safely encrypt and store my uploaded documents (90-day auto-purge)
                  </p>
                  <p className="text-text-muted">
                    Documents are protected with server-side AES-256 encryption. You can delete or download them at any time from your dashboard.
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-border">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="rounded-xl font-bold"
              >
                Back
              </Button>

              <Button
                onClick={handleFinish}
                className="gap-2 rounded-xl font-bold px-8 shadow-md"
              >
                Go to Live Order Tracker
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-muted">Loading onboarding...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
