"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { evaluatePasswordStrength, PasswordStrengthResult } from "@/lib/auth/password";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token") || "";

  const [token, setToken] = React.useState(urlToken);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Live password strength calculation
  const strength: PasswordStrengthResult = React.useMemo(() => {
    return evaluatePasswordStrength(password);
  }, [password]);

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token.trim()) {
      setErrorMessage("Password reset token is missing. Please check your reset link.");
      return;
    }

    if (strength.score < 2) {
      setErrorMessage(
        strength.patternWarning ||
          "Password must meet institutional security requirements (at least 8 characters, mixed case, numbers)."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset",
          token: token.trim(),
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password. The link may have expired.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?resetSuccess=true");
      }, 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
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
            Password Reset Complete
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-sm mx-auto leading-relaxed">
            Your vault master password has been updated securely with OWASP-compliant scrypt encryption.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-raised border border-border/80 text-xs text-text-muted">
          <p>Redirecting to vault sign-in...</p>
        </div>

        <Link href="/login?resetSuccess=true" className="block pt-2">
          <Button className="w-full h-12 rounded-2xl font-semibold gap-2 text-sm bg-brand-500 hover:bg-brand-600 text-white cursor-pointer active:scale-[0.985] transition-all">
            <span>Sign In Now</span>
            <ArrowRight className="w-4 h-4" />
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
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            role="alert"
            className="p-4 rounded-2xl border border-status-danger/30 bg-status-danger/10 text-status-danger flex items-start gap-2.5 text-xs sm:text-sm font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Token Input if not in URL */}
      {!urlToken && (
        <div>
          <label className="block text-[13px] font-semibold text-brand-ink mb-1.5" htmlFor="reset-token">
            Security Reset Token <span className="text-status-danger">*</span>
          </label>
          <div className="relative">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <Input
              id="reset-token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste 64-character token"
              className="pl-10 h-12 rounded-2xl text-[14px] bg-canvas border-border/80 focus-visible:ring-brand-500/20 focus-visible:border-brand-500"
            />
          </div>
        </div>
      )}

      {/* New Password */}
      <div>
        <label className="block text-[13px] font-semibold text-brand-ink mb-1.5" htmlFor="reset-new-password">
          New Vault Password <span className="text-status-danger">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <Input
            id="reset-new-password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="pl-10 pr-10 h-12 rounded-2xl text-[14px] bg-canvas border-border/80 focus-visible:ring-brand-500/20 focus-visible:border-brand-500"
            autoComplete="new-password"
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

        {/* Live Password Strength Indicator */}
        {password.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2.5 p-3.5 rounded-2xl border border-border/80 bg-surface-raised/70 space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-text-muted">Password Security Grade:</span>
              <span
                className={cn(
                  "font-bold text-xs",
                  strength.score <= 1 && "text-status-danger",
                  strength.score === 2 && "text-accent-seal",
                  strength.score === 3 && "text-brand-500",
                  strength.score >= 4 && "text-status-success"
                )}
              >
                {strength.label}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-border/60 rounded-full overflow-hidden flex gap-1">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "h-full flex-1 transition-all duration-300 rounded-full",
                    step <= strength.score
                      ? strength.score <= 1
                        ? "bg-status-danger"
                        : strength.score === 2
                        ? "bg-accent-seal"
                        : strength.score === 3
                        ? "bg-brand-500"
                        : "bg-status-success"
                      : "bg-transparent"
                  )}
                />
              ))}
            </div>

            {/* Criteria Checklist */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div
                className={cn(
                  "flex items-center gap-1.5 transition-colors",
                  strength.checks.minLength ? "text-status-success font-medium" : "text-text-muted"
                )}
              >
                {strength.checks.minLength ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />
                )}
                <span>8+ characters</span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1.5 transition-colors",
                  strength.checks.hasUppercase && strength.checks.hasLowercase
                    ? "text-status-success font-medium"
                    : "text-text-muted"
                )}
              >
                {strength.checks.hasUppercase && strength.checks.hasLowercase ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />
                )}
                <span>Upper & lowercase</span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1.5 transition-colors",
                  strength.checks.hasNumber ? "text-status-success font-medium" : "text-text-muted"
                )}
              >
                {strength.checks.hasNumber ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />
                )}
                <span>Number (0-9)</span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1.5 transition-colors",
                  strength.checks.hasSpecial ? "text-status-success font-medium" : "text-text-muted"
                )}
              >
                {strength.checks.hasSpecial ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />
                )}
                <span>Special symbol</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-[13px] font-semibold text-brand-ink mb-1.5" htmlFor="reset-confirm-password">
          Confirm New Password <span className="text-status-danger">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <Input
            id="reset-confirm-password"
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className={cn(
              "pl-10 pr-10 h-12 rounded-2xl text-[14px] bg-canvas border-border/80 focus-visible:ring-brand-500/20",
              passwordsMismatch && "border-status-danger focus-visible:ring-status-danger/20",
              passwordsMatch && "border-status-success/70"
            )}
            autoComplete="new-password"
          />
          {passwordsMatch && (
            <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-status-success" />
          )}
          {passwordsMismatch && (
            <XCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-status-danger" />
          )}
        </div>
        {passwordsMismatch && (
          <p className="text-[11px] text-status-danger mt-1.5 px-1 font-medium">Passwords do not match.</p>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-2xl text-sm font-semibold gap-2 bg-brand-500 hover:bg-brand-600 text-white cursor-pointer active:scale-[0.985] transition-all shadow-xs"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Updating Master Password...</span>
            </>
          ) : (
            <>
              <span>Update Vault Password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/forgot-password"
          className="text-xs text-text-muted hover:text-brand-ink transition-colors font-medium"
        >
          Need a new reset link?
        </Link>
      </div>
    </form>
  );
}
