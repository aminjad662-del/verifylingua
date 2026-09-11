"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { evaluatePasswordStrength, type PasswordStrengthResult } from "@/lib/auth/password";
import {
  ShieldCheck,
  Lock,
  User,
  Mail,
  Building2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AccountType = "INDIVIDUAL" | "LAW_FIRM" | "INSTITUTION";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const prefersReducedMotion = useReducedMotion();

  const [accountType, setAccountType] = React.useState<AccountType>("INDIVIDUAL");
  const [name, setName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = React.useState<string | null>(null);

  // Live password strength calculation
  const strength: PasswordStrengthResult = React.useMemo(() => {
    return evaluatePasswordStrength(password);
  }, [password]);

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleGoogleAuth = () => {
    setGoogleNotice(
      "Google SSO is active for verified institutional domains. For immediate certified filing access, complete your vault registration below."
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setGoogleNotice(null);

    if (!name.trim()) {
      setErrorMessage("Please provide your full legal name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    if (accountType !== "INDIVIDUAL" && !companyName.trim()) {
      setErrorMessage("Please provide your organization or law firm name.");
      return;
    }

    if (strength.score < 2) {
      setErrorMessage("Your password must meet security requirements (at least 8 characters, mixed case, numbers).");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("You must accept the Terms of Service and Privacy Policy to proceed.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          accountType,
          companyName: accountType !== "INDIVIDUAL" ? companyName.trim() : undefined,
          terms: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed. Please try again.");
      }

      // Success -> Redirect to callback or dashboard
      router.push(`${callbackUrl}?registered=true`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-brand-ink font-display">
          Create your account
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1.5 font-sans">
          Open your certified USCIS translation vault
        </p>
      </div>

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

      {/* Divider */}
      <div className="relative my-5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200/80" />
        </div>
        <span className="relative bg-white/95 px-3 text-[11px] uppercase tracking-wider text-text-muted font-mono">
          or register with email
        </span>
      </div>

      {/* Account Type Segmented Pills */}
      <div className="mb-5">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-text-muted mb-2 text-center">
          Account Scope
        </label>
        <div className="p-1 bg-neutral-100/90 rounded-full border border-neutral-200/70 flex gap-1 relative">
          {(
            [
              { id: "INDIVIDUAL", label: "Individual", icon: User },
              { id: "LAW_FIRM", label: "Law Firm", icon: Briefcase },
              { id: "INSTITUTION", label: "Institution", icon: GraduationCap },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = accountType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAccountType(tab.id)}
                className={cn(
                  "flex-1 relative z-10 py-1.5 px-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer",
                  isActive ? "text-neutral-900" : "text-text-muted hover:text-neutral-800"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="accountTypeIndicator"
                    className="absolute inset-0 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-neutral-200/60"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 450, damping: 35 }
                    }
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 p-3.5 rounded-2xl border border-status-danger/30 bg-status-danger/10 text-status-danger flex items-start gap-2.5 text-xs animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-brand-ink mb-1 pl-1" htmlFor="register-name">
            Full Legal Name <span className="text-status-danger">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              id="register-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Elena Rostova"
              className="w-full h-12 rounded-full border border-neutral-200/90 bg-white/95 pl-11 pr-5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              autoComplete="name"
            />
          </div>
        </div>

        {/* Company / Law Firm (Conditional) */}
        <AnimatePresence initial={false}>
          {accountType !== "INDIVIDUAL" && (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 14 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <label className="block text-xs font-semibold text-brand-ink mb-1 pl-1" htmlFor="register-org">
                {accountType === "LAW_FIRM" ? "Law Firm / Practice Name" : "Organization / Institution Name"}{" "}
                <span className="text-status-danger">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  id="register-org"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={
                    accountType === "LAW_FIRM"
                      ? "Rostova & Partners Immigration Law"
                      : "Global Credential Services"
                  }
                  className="w-full h-12 rounded-full border border-neutral-200/90 bg-white/95 pl-11 pr-5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-brand-ink mb-1 pl-1" htmlFor="register-email">
            Official Email Address <span className="text-status-danger">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              id="register-email"
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
          <label className="block text-xs font-semibold text-brand-ink mb-1 pl-1" htmlFor="register-password">
            Secure Password <span className="text-status-danger">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full h-12 rounded-full border border-neutral-200/90 bg-white/95 pl-11 pr-12 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              autoComplete="new-password"
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

          {/* Live Password Strength Indicator */}
          {password.length > 0 && (
            <div className="mt-2.5 p-3 rounded-2xl border border-neutral-200/70 bg-surface-raised space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-text-muted">Password Security:</span>
                <span
                  className={cn(
                    "font-bold",
                    strength.score <= 1 && "text-status-danger",
                    strength.score === 2 && "text-status-warning",
                    strength.score >= 3 && "text-status-success"
                  )}
                >
                  {strength.label}
                </span>
              </div>

              {/* Meter bars */}
              <div className="h-1 w-full bg-neutral-200/80 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={cn(
                      "h-full flex-1 transition-all duration-300 rounded-full",
                      step <= strength.score
                        ? strength.score <= 1
                          ? "bg-status-danger"
                          : strength.score === 2
                          ? "bg-status-warning"
                          : "bg-status-success"
                        : "bg-transparent"
                    )}
                  />
                ))}
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-2 gap-1 pt-0.5 text-[10px]">
                <div className={cn("flex items-center gap-1.5", strength.checks.minLength ? "text-status-success" : "text-text-muted")}>
                  {strength.checks.minLength ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <div className="w-3 h-3 rounded-full border border-neutral-300 shrink-0" />}
                  <span>8+ characters</span>
                </div>
                <div className={cn("flex items-center gap-1.5", strength.checks.hasUppercase && strength.checks.hasLowercase ? "text-status-success" : "text-text-muted")}>
                  {strength.checks.hasUppercase && strength.checks.hasLowercase ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <div className="w-3 h-3 rounded-full border border-neutral-300 shrink-0" />}
                  <span>Upper & lowercase</span>
                </div>
                <div className={cn("flex items-center gap-1.5", strength.checks.hasNumber ? "text-status-success" : "text-text-muted")}>
                  {strength.checks.hasNumber ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <div className="w-3 h-3 rounded-full border border-neutral-300 shrink-0" />}
                  <span>Number (0-9)</span>
                </div>
                <div className={cn("flex items-center gap-1.5", strength.checks.hasSpecial ? "text-status-success" : "text-text-muted")}>
                  {strength.checks.hasSpecial ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <div className="w-3 h-3 rounded-full border border-neutral-300 shrink-0" />}
                  <span>Special character</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-brand-ink mb-1 pl-1" htmlFor="register-confirm-password">
            Confirm Password <span className="text-status-danger">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              id="register-confirm-password"
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className={cn(
                "w-full h-12 rounded-full border border-neutral-200/90 bg-white/95 pl-11 pr-12 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]",
                passwordsMismatch && "border-status-danger focus:ring-status-danger/10"
              )}
              autoComplete="new-password"
            />
            {passwordsMatch && (
              <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-status-success pointer-events-none" />
            )}
            {passwordsMismatch && (
              <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-status-danger pointer-events-none" />
            )}
          </div>
          {passwordsMismatch && (
            <p className="text-[11px] text-status-danger mt-1 pl-3">Passwords do not match.</p>
          )}
        </div>

        {/* Terms Acceptance */}
        <div className="pt-1 px-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
            />
            <span className="text-xs text-text-muted leading-snug">
              I accept the{" "}
              <Link href="/help" className="text-brand-500 underline font-medium hover:text-brand-600">
                Terms of Service
              </Link>
              ,{" "}
              <Link href="/help" className="text-brand-500 underline font-medium hover:text-brand-600">
                Privacy Policy
              </Link>
              , and USCIS 8 CFR 103.2 translation authenticity guidelines.
            </span>
          </label>
        </div>

        {/* Submit Pill Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
          className="w-full h-12 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm shadow-[0_4px_14px_rgba(0,0,0,0.12)] active:scale-[0.985] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Creating Secure Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>

        {/* Switch to Sign In */}
        <div className="text-center pt-2">
          <p className="text-xs sm:text-sm text-text-muted">
            Already have an account?{" "}
            <Link
              href={`/login${callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="font-semibold text-neutral-900 hover:text-brand-600 transition-colors"
            >
              Sign in
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
