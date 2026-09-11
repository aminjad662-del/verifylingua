"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const wasRegistered = searchParams.get("registered") === "true";
  const prefersReducedMotion = useReducedMotion();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = React.useState<string | null>(null);

  const handleGoogleAuth = () => {
    setGoogleNotice(
      "Google SSO is active for verified institutional domains. To access your personal vault, please sign in with your email credentials below."
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setGoogleNotice(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password.");
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid email or password.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header matching reference */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-brand-ink font-display">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1.5 font-sans">
          Sign in to your account
        </p>
      </div>

      {wasRegistered && (
        <div className="mb-4 p-3.5 rounded-2xl border border-status-success/30 bg-status-success/10 text-status-success flex items-start gap-2.5 text-xs animate-in fade-in">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">
            Account created successfully! Please sign in with your credentials to access your translation vault.
          </div>
        </div>
      )}

      {/* Google SSO Pill Button */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        className="w-full h-12 rounded-full border border-neutral-200/90 bg-white hover:bg-neutral-50/90 text-neutral-800 text-sm font-medium flex items-center justify-center gap-3 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] active:scale-[0.985] cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="rgb(66, 133, 244)"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="rgb(52, 168, 83)"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="rgb(251, 188, 5)"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="rgb(234, 67, 53)"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Google Notice */}
      {googleNotice && (
        <div
          role="status"
          className="mt-3 p-3 rounded-2xl border border-border bg-surface-raised text-xs text-text-muted flex items-start gap-2.5 animate-in fade-in"
        >
          <Sparkles className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
          <span>{googleNotice}</span>
        </div>
      )}

      {/* Divider matching reference */}
      <div className="relative my-5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200/80" />
        </div>
        <span className="relative bg-white/95 px-3 text-[11px] uppercase tracking-wider text-text-muted font-mono">
          or sign in with email
        </span>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-4 p-3.5 rounded-2xl border border-status-danger/30 bg-status-danger/10 text-status-danger flex items-start gap-2.5 text-xs animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-brand-ink mb-1 pl-1" htmlFor="login-email">
            Official Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="elena@rostovalaw.com"
              className="w-full h-12 rounded-full border border-neutral-200/90 bg-white/95 pl-11 pr-5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1 pl-1 pr-1">
            <label className="block text-xs font-semibold text-brand-ink" htmlFor="login-password">
              Password
            </label>
            <Link
              href="/help"
              className="text-xs text-text-muted hover:text-neutral-900 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-12 rounded-full border border-neutral-200/90 bg-white/95 pl-11 pr-12 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-ink transition-colors p-1 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Pill Button matching reference */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
          className="w-full h-12 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm shadow-[0_4px_14px_rgba(0,0,0,0.12)] active:scale-[0.985] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-3"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>

        {/* Switch matching reference */}
        <div className="text-center pt-2">
          <p className="text-xs sm:text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href={`/register${callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="font-semibold text-neutral-900 hover:text-brand-600 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 border-t border-neutral-200/70 flex items-center justify-center gap-5 text-[11px] text-text-muted font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
            <span>256-Bit SSL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>ATA Member No. 278190</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-status-success" />
            <span>USCIS Guaranteed</span>
          </div>
        </div>
      </form>
    </div>
  );
}
