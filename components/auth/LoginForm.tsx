"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const wasRegistered = searchParams.get("registered") === "true";
  const resetSuccess = searchParams.get("resetSuccess") === "true";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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
    <div className="w-full max-w-md mx-auto">
      {wasRegistered && (
        <div className="mb-6 p-4 rounded-2xl border border-status-success/30 bg-status-success/10 text-status-success flex items-start gap-3 text-xs sm:text-sm font-medium animate-in fade-in">
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            Account created successfully! Sign in to access your certified translation vault.
          </div>
        </div>
      )}

      {resetSuccess && (
        <div className="mb-6 p-4 rounded-2xl border border-status-success/30 bg-status-success/10 text-status-success flex items-start gap-3 text-xs sm:text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            Master password updated successfully! Please sign in with your new credentials.
          </div>
        </div>
      )}

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="alert"
            className="mb-6 p-4 rounded-2xl border border-status-danger/30 bg-status-danger/10 text-status-danger flex items-start gap-3 text-xs sm:text-sm font-medium"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[13px] font-semibold text-brand-ink mb-1.5" htmlFor="login-email">
            Official Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <Input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@organization.com"
              className="pl-10 h-12 rounded-2xl text-[14px] bg-canvas border-border/80 focus-visible:ring-brand-500/20 focus-visible:border-brand-500"
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <label className="block text-[13px] font-semibold text-brand-ink" htmlFor="login-password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-brand-500 hover:text-brand-600 hover:underline cursor-pointer transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="pl-10 pr-10 h-12 rounded-2xl text-[14px] bg-canvas border-border/80 focus-visible:ring-brand-500/20 focus-visible:border-brand-500"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-ink transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl text-sm font-semibold gap-2 shadow-xs active:scale-[0.985] transition-all duration-200 bg-brand-500 hover:bg-brand-600 text-white cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Vault</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-text-muted">
            Don&apos;t have an account yet?{" "}
            <Link
              href={`/register${callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="font-semibold text-brand-500 hover:text-brand-600 hover:underline transition-colors"
            >
              Create certified account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
