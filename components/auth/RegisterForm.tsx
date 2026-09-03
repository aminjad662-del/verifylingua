"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { evaluatePasswordStrength, PasswordStrengthResult } from "@/lib/auth/password";
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

  // Live password strength calculation
  const strength: PasswordStrengthResult = React.useMemo(() => {
    return evaluatePasswordStrength(password);
  }, [password]);

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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

      // Success -> Redirect to dashboard or order funnel
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
    <div className="w-full max-w-xl mx-auto">
      {/* Account Type Tabs */}
      <div className="mb-8">
        <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-3">
          1. Select Account Scope
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setAccountType("INDIVIDUAL")}
            className={cn(
              "flex flex-col items-start p-3.5 rounded-xl border text-left transition-all",
              accountType === "INDIVIDUAL"
                ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20"
                : "border-border bg-surface hover:border-border-strong hover:bg-surface-raised"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-500 mb-2">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-brand-ink font-display">Individual</span>
            <span className="text-[11px] text-text-muted mt-0.5">USCIS, Visa & Academic</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType("LAW_FIRM")}
            className={cn(
              "flex flex-col items-start p-3.5 rounded-xl border text-left transition-all",
              accountType === "LAW_FIRM"
                ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20"
                : "border-border bg-surface hover:border-border-strong hover:bg-surface-raised"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-accent-seal/10 flex items-center justify-center text-accent-seal mb-2">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-brand-ink font-display">Law Firm</span>
            <span className="text-[11px] text-text-muted mt-0.5">Attorneys & Paralegals</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType("INSTITUTION")}
            className={cn(
              "flex flex-col items-start p-3.5 rounded-xl border text-left transition-all",
              accountType === "INSTITUTION"
                ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20"
                : "border-border bg-surface hover:border-border-strong hover:bg-surface-raised"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-text-muted mb-2">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-brand-ink font-display">Institution</span>
            <span className="text-[11px] text-text-muted mt-0.5">Universities & Evaluators</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl border border-status-danger/30 bg-status-danger/10 text-status-danger flex items-start gap-3 text-sm animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-brand-ink mb-1.5" htmlFor="register-name">
            Full Legal Name <span className="text-status-danger">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <Input
              id="register-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              className="pl-10"
              autoComplete="name"
            />
          </div>
        </div>

        {/* Company / Law Firm (Conditional) */}
        {accountType !== "INDIVIDUAL" && (
          <div>
            <label className="block text-xs font-semibold text-brand-ink mb-1.5" htmlFor="register-org">
              {accountType === "LAW_FIRM" ? "Law Firm / Practice Name" : "Organization / Institution Name"}{" "}
              <span className="text-status-danger">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <Input
                id="register-org"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={accountType === "LAW_FIRM" ? "e.g. Rostova & Partners Immigration Law" : "e.g. Global Credential Services"}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-brand-ink mb-1.5" htmlFor="register-email">
            Official Email Address <span className="text-status-danger">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <Input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@organization.com"
              className="pl-10"
              autoComplete="email"
            />
          </div>
          <p className="text-[11px] text-text-muted mt-1">
            Certificates of Accuracy and notarized copies will be issued to this email.
          </p>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-brand-ink mb-1.5" htmlFor="register-password">
            Secure Password <span className="text-status-danger">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="pl-10 pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-ink transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="mt-3 p-3 rounded-xl border border-border bg-surface-raised space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-text-muted">Password Strength:</span>
                <span
                  className={cn(
                    "font-bold",
                    strength.score <= 1 && "text-status-danger",
                    strength.score === 2 && "text-accent-seal",
                    strength.score >= 3 && "text-status-success"
                  )}
                >
                  {strength.label}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden flex gap-1">
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
                          : "bg-status-success"
                        : "bg-transparent"
                    )}
                  />
                ))}
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                <div className={cn("flex items-center gap-1.5", strength.checks.minLength ? "text-status-success" : "text-text-muted")}>
                  {strength.checks.minLength ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />}
                  8+ characters
                </div>
                <div className={cn("flex items-center gap-1.5", strength.checks.hasUppercase && strength.checks.hasLowercase ? "text-status-success" : "text-text-muted")}>
                  {strength.checks.hasUppercase && strength.checks.hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />}
                  Upper & lowercase
                </div>
                <div className={cn("flex items-center gap-1.5", strength.checks.hasNumber ? "text-status-success" : "text-text-muted")}>
                  {strength.checks.hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />}
                  Number (0-9)
                </div>
                <div className={cn("flex items-center gap-1.5", strength.checks.hasSpecial ? "text-status-success" : "text-text-muted")}>
                  {strength.checks.hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />}
                  Special symbol
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-brand-ink mb-1.5" htmlFor="register-confirm-password">
            Confirm Password <span className="text-status-danger">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <Input
              id="register-confirm-password"
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className={cn("pl-10 pr-10", passwordsMismatch && "border-status-danger focus-visible:ring-status-danger")}
              autoComplete="new-password"
            />
            {passwordsMatch && <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-status-success" />}
            {passwordsMismatch && <XCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-status-danger" />}
          </div>
          {passwordsMismatch && (
            <p className="text-[11px] text-status-danger mt-1">Passwords do not match.</p>
          )}
        </div>

        {/* Terms & Conditions Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-border text-brand-500 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-xs text-text-muted leading-relaxed">
              I certify the truthfulness of submitted personal information and accept the{" "}
              <Link href="/help" className="text-brand-500 underline font-semibold hover:text-brand-600">
                Terms of Service
              </Link>
              ,{" "}
              <Link href="/help" className="text-brand-500 underline font-semibold hover:text-brand-600">
                Privacy Policy
              </Link>
              , and USCIS 8 CFR 103.2 translation authenticity guidelines.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-sm active:scale-[0.98] transition-all"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Secure Account...
            </>
          ) : (
            <>
              Create Verified Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>

        {/* Trust Guarantees */}
        <div className="pt-4 border-t border-border flex items-center justify-center gap-6 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-status-success" />
            <span>256-Bit Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent-seal" />
            <span>USCIS & ATA Compliant</span>
          </div>
        </div>

        {/* Switch to Sign In */}
        <div className="text-center pt-2">
          <p className="text-sm text-text-muted">
            Already have an account?{" "}
            <Link
              href={`/login${callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="font-bold text-brand-500 hover:text-brand-600 hover:underline"
            >
              Sign in to your vault
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
