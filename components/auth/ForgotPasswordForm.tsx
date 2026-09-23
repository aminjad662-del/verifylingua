"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

// Email typo map
const EMAIL_TYPO_MAP: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "outlok.com": "outlook.com",
};

export function ForgotPasswordForm() {
  const renderTimestampRef = React.useRef<number>(Date.now());

  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Email typo suggestion calculation
  const suggestedEmail = React.useMemo(() => {
    if (!email.includes("@")) return null;
    const [local, domain] = email.split("@");
    if (!domain) return null;
    const correction = EMAIL_TYPO_MAP[domain.toLowerCase()];
    return correction ? `${local}@${correction}` : null;
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your official email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          email: email.trim().toLowerCase(),
          formRenderTimestamp: renderTimestampRef.current,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to request password reset. Please try again.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, bounce: 0.15, type: "spring" }}
        className="text-center py-4 space-y-5"
      >
        <div className="w-14 h-14 rounded-2xl bg-status-success/10 border border-status-success/30 flex items-center justify-center text-status-success mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold font-display text-brand-ink tracking-tight">
            Reset Link Dispatched
          </h2>
          <p className="text-xs text-text-muted mt-2 max-w-sm mx-auto leading-relaxed">
            If an account exists for <span className="font-semibold text-brand-ink">{email}</span>, we have sent a
            cryptographic password reset link valid for 1 hour.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-raised border border-border text-[11px] text-text-muted leading-normal">
          <p>
            Please check your inbox and spam folder. If you don&apos;t receive it within a few minutes, verify your email
            spelling and try again.
          </p>
        </div>

        <Link href="/login" className="block">
          <Button variant="outline" className="w-full h-11 rounded-xl font-bold gap-2 text-xs cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Vault Sign In</span>
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            role="alert"
            className="p-3.5 rounded-xl border border-status-danger/30 bg-status-danger/10 text-status-danger flex items-start gap-2.5 text-xs font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label className="block text-xs font-semibold text-brand-ink mb-1.5" htmlFor="forgot-email">
          Registered Email Address <span className="text-status-danger">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <Input
            id="forgot-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@organization.com"
            className="pl-10 h-11"
            autoComplete="email"
          />
        </div>

        {suggestedEmail && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 flex items-center gap-1.5 text-xs text-text-muted"
          >
            <span>Did you mean:</span>
            <button
              type="button"
              onClick={() => setEmail(suggestedEmail)}
              className="font-bold text-brand-500 hover:underline cursor-pointer"
            >
              {suggestedEmail}
            </button>
          </motion.div>
        )}

        <p className="text-[11px] text-text-muted mt-1.5">
          Enter the email associated with your certified translation vault.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 rounded-xl text-sm font-bold gap-2 bg-brand-500 hover:bg-brand-600 text-white cursor-pointer active:scale-[0.985] transition-all"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Dispatching Security Link...</span>
          </>
        ) : (
          <>
            <span>Send Password Reset Link</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-brand-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </form>
  );
}
