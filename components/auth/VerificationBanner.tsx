"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, ArrowRight, RefreshCw, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerificationBannerProps {
  email?: string;
  isVerified?: boolean;
}

function VerificationBannerInner({ email, isVerified }: VerificationBannerProps) {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  const verifySent = searchParams.get("verifySent") === "true";

  const [dismissed, setDismissed] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [resendStatus, setResendStatus] = React.useState<"idle" | "success" | "error">("idle");

  // Don't show if verified or explicitly dismissed
  if (isVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    if (!email || isResending) return;

    setIsResending(true);
    setResendStatus("idle");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setResendStatus("success");
      } else {
        setResendStatus("error");
      }
    } catch {
      setResendStatus("error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full bg-surface-raised border-b border-border/80 px-4 py-3"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent-seal/10 text-accent-seal flex items-center justify-center shrink-0 border border-accent-seal/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-brand-ink font-display mr-2">
                {justRegistered ? "Welcome to VerifyLingua!" : "Vault Identity Unconfirmed"}
              </span>
              <span className="text-text-muted">
                USCIS 8 CFR 103.2 requires email verification to issue certified tamper-proof affidavits.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {resendStatus === "success" ? (
              <span className="text-status-success font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verification link sent!
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || !email}
                className="text-text-muted hover:text-brand-ink transition-colors flex items-center gap-1 font-medium cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
                <span>Resend email</span>
              </button>
            )}

            <Link href="/verify-email">
              <Button size="sm" className="h-8 rounded-lg text-xs font-bold gap-1 bg-brand-500 hover:bg-brand-600 text-white cursor-pointer">
                <span>Confirm Email</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-text-muted hover:text-brand-ink p-1 rounded-md transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function VerificationBanner(props: VerificationBannerProps) {
  return (
    <React.Suspense fallback={null}>
      <VerificationBannerInner {...props} />
    </React.Suspense>
  );
}
