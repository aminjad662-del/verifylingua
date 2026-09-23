"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Mail,
  ArrowRight,
  RefreshCw,
  Lock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = React.useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle"
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = React.useState<string | null>(null);
  const [countdown, setCountdown] = React.useState(5);

  // Resend state
  const [resendEmail, setResendEmail] = React.useState("");
  const [isResending, setIsResending] = React.useState(false);
  const [resendMessage, setResendMessage] = React.useState<string | null>(null);

  // Manual token input state
  const [manualToken, setManualToken] = React.useState("");

  // Auto-verify if token in URL
  React.useEffect(() => {
    if (!token) return;

    let isMounted = true;

    async function executeVerification(tok: string) {
      setStatus("verifying");
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(tok)}`);
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.success) {
          setStatus("success");
          setVerifiedEmail(data.email || null);
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Failed to verify email address. The token may have expired.");
        }
      } catch {
        if (isMounted) {
          setStatus("error");
          setErrorMessage("Network error occurred while verifying your token. Please check your connection.");
        }
      }
    }

    executeVerification(token);

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Countdown redirect on success
  React.useEffect(() => {
    if (status !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, router]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setIsResending(true);
    setResendMessage(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResendMessage(data.message || "A new verification link has been sent to your inbox.");
      } else {
        setErrorMessage(data.error || "Failed to resend verification link. Please try again.");
      }
    } catch {
      setErrorMessage("Network error while requesting verification link.");
    } finally {
      setIsResending(false);
    }
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    router.push(`/verify-email?token=${encodeURIComponent(manualToken.trim())}`);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Double-Bezel Container */}
      <div className="p-1.5 rounded-2xl bg-surface-raised/70 border border-border/90 shadow-sm">
        <div className="bg-surface rounded-xl border border-border/60 p-6 sm:p-8 text-center">
          {/* STATE 1: VERIFYING */}
          {status === "verifying" && (
            <div className="py-8 space-y-4">
              <div className="w-12 h-12 rounded-full border-3 border-brand-500 border-t-transparent animate-spin mx-auto" />
              <h2 className="text-xl font-bold font-display text-brand-ink">
                Verifying Cryptographic Credentials...
              </h2>
              <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                Confirming token authenticity against the VerifyLingua institutional ledger.
              </p>
            </div>
          )}

          {/* STATE 2: SUCCESS */}
          {status === "success" && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, bounce: 0.15, type: "spring" }}
              className="py-4 space-y-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-status-success/10 border border-status-success/30 flex items-center justify-center text-status-success mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-success/10 text-status-success text-xs font-semibold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authenticated & Certified
                </span>
                <h2 className="text-2xl font-extrabold font-display text-brand-ink tracking-tight">
                  Email Address Verified
                </h2>
                <p className="text-xs text-text-muted mt-2 max-w-sm mx-auto leading-relaxed">
                  {verifiedEmail ? `Vault for ${verifiedEmail} is now active.` : "Your translation vault is now active."}{" "}
                  All certified USCIS filings and ATA notarizations will be securely signed.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised border border-border text-xs text-text-muted">
                <p className="font-mono text-[11px]">
                  Redirecting to client dashboard in <span className="font-bold text-brand-ink">{countdown}s</span>...
                </p>
              </div>

              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full h-11 rounded-xl font-bold gap-2 bg-brand-500 hover:bg-brand-600 text-white cursor-pointer"
              >
                <span>Enter Your Translation Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* STATE 3: ERROR / EXPIRED */}
          {status === "error" && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-4 space-y-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-status-danger/10 border border-status-danger/30 flex items-center justify-center text-status-danger mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold font-display text-brand-ink tracking-tight">
                  Verification Link Expired
                </h2>
                <p className="text-xs text-text-muted mt-2 max-w-sm mx-auto leading-relaxed">
                  {errorMessage || "This security link has expired or has already been used. Please request a new link."}
                </p>
              </div>

              {/* Resend Form */}
              <form onSubmit={handleResend} className="space-y-3 pt-2 text-left">
                <label className="block text-xs font-semibold text-brand-ink" htmlFor="resend-email-input">
                  Send new verification link to:
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <Input
                    id="resend-email-input"
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="pl-10 h-11"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isResending}
                  className="w-full h-11 rounded-xl font-bold gap-2 bg-brand-500 hover:bg-brand-600 text-white cursor-pointer"
                >
                  {isResending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending New Link...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </Button>
              </form>

              {resendMessage && (
                <div className="p-3 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs font-medium">
                  {resendMessage}
                </div>
              )}
            </motion.div>
          )}

          {/* STATE 4: IDLE (No token in URL, prompt to check inbox or enter token) */}
          {status === "idle" && (
            <div className="py-4 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-500 mx-auto">
                <Mail className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold font-display text-brand-ink tracking-tight">
                  Verify Your Email Address
                </h2>
                <p className="text-xs text-text-muted mt-2 max-w-sm mx-auto leading-relaxed">
                  We have dispatched a cryptographic verification link to your email. Click the link in the message to
                  activate your certified USCIS translation vault.
                </p>
              </div>

              {/* Manual Token Entry */}
              <form onSubmit={handleManualVerify} className="space-y-3 pt-2 text-left">
                <label className="block text-xs font-semibold text-brand-ink" htmlFor="manual-token-input">
                  Or paste verification token directly:
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <Input
                    id="manual-token-input"
                    type="text"
                    required
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Enter 64-character token"
                    className="pl-10 h-11 font-mono text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-bold gap-2 bg-brand-500 hover:bg-brand-600 text-white cursor-pointer"
                >
                  <span>Verify Token</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              {/* Resend Link accordion / prompt */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-text-muted">
                  Didn&apos;t receive the email? Check your spam folder or{" "}
                  <button
                    type="button"
                    onClick={() => setStatus("error")}
                    className="font-bold text-brand-500 hover:underline cursor-pointer"
                  >
                    request a new link
                  </button>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-canvas text-brand-ink flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-border/70 bg-surface-raised/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-brand-ink font-display">
                Verify<span className="text-brand-500">Lingua</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-text-muted">
                Certified Translations
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-brand-ink">
            <Lock className="w-3.5 h-3.5 text-status-success" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted Vault</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 md:py-16 flex items-center justify-center">
        <React.Suspense
          fallback={
            <div className="h-64 flex items-center justify-center text-text-muted text-sm gap-2">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading verification system...</span>
            </div>
          }
        >
          <VerifyEmailContent />
        </React.Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/70 py-6 px-6 text-center text-xs text-text-muted bg-surface/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} VerifyLingua LLC. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/help" className="hover:text-brand-ink transition-colors">USCIS 8 CFR 103.2</Link>
            <span>•</span>
            <Link href="/help" className="hover:text-brand-ink transition-colors">Security Overview</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
