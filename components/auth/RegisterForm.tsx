"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
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
  Check,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
  FileCheck2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Common email typo domains detection for instant UX polish
const EMAIL_TYPO_MAP: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "iclud.com": "icloud.com",
};

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Form Render Timestamp for Bot Velocity Guard
  const renderTimestampRef = React.useRef<number>(Date.now());

  // Form fields
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  // Optional Corporate / Law Firm details
  const [isCorporateAccount, setIsCorporateAccount] = React.useState(false);
  const [companyName, setCompanyName] = React.useState("");

  // Bot honeypot state
  const [honeypot, setHoneypot] = React.useState("");

  // Submission UI state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [ssoLoading, setSsoLoading] = React.useState<"google" | "apple" | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Email typo suggestion calculation
  const suggestedEmail = React.useMemo(() => {
    if (!email.includes("@")) return null;
    const [local, domain] = email.split("@");
    if (!domain) return null;
    const correction = EMAIL_TYPO_MAP[domain.toLowerCase()];
    return correction ? `${local}@${correction}` : null;
  }, [email]);

  // Real-time password strength calculation
  const strength: PasswordStrengthResult = React.useMemo(() => {
    return evaluatePasswordStrength(password);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
    if (!name.trim()) {
      setErrorMessage("Please enter your legal full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid official email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (strength.score < 2) {
      setErrorMessage(
        strength.patternWarning ||
          "Password is too weak. Please combine uppercase, lowercase, numbers, and symbols."
      );
      return;
    }

    if (isCorporateAccount && !companyName.trim()) {
      setErrorMessage("Please enter your organization or law firm name.");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        accountType: isCorporateAccount ? "LAW_FIRM" : "INDIVIDUAL",
        companyName: isCorporateAccount ? companyName.trim() : undefined,
        terms: true,
        website_security_hp: honeypot, // Honeypot field for bot defense
        formRenderTimestamp: renderTimestampRef.current, // Velocity protection
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed. Please try again.");
      }

      // Success -> Redirect to dashboard with notification flags
      router.push(`${callbackUrl}?registered=true&verifySent=true`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected network or server error occurred.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSsoClick = (provider: "google" | "apple") => {
    setSsoLoading(provider);
    let url = `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    if (email.trim() && email.includes("@")) {
      url += `&email=${encodeURIComponent(email.trim().toLowerCase())}`;
    }
    if (name.trim()) {
      url += `&name=${encodeURIComponent(name.trim())}`;
    }
    setTimeout(() => {
      window.location.href = url;
    }, 150);
  };

  return (
    <div className="w-full">
      {/* Quick SSO Buttons (Apple HIG & Runway reference pattern) */}
      <div className="space-y-2.5 mb-6">
        {/* Google SSO Button */}
        <button
          type="button"
          onClick={() => handleSsoClick("google")}
          disabled={isSubmitting || ssoLoading !== null}
          className="w-full h-[46px] rounded-xl border border-border/80 bg-surface hover:bg-surface-raised active:scale-[0.985] transition-all flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-brand-ink shadow-2xs cursor-pointer group"
        >
          {ssoLoading === "google" ? (
            <div className="w-4 h-4 border-2 border-brand-ink border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Apple SSO Button */}
        <button
          type="button"
          onClick={() => handleSsoClick("apple")}
          disabled={isSubmitting || ssoLoading !== null}
          className="w-full h-[46px] rounded-xl border border-border/80 bg-surface hover:bg-surface-raised active:scale-[0.985] transition-all flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-brand-ink shadow-2xs cursor-pointer group"
        >
          {ssoLoading === "apple" ? (
            <div className="w-4 h-4 border-2 border-brand-ink border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 shrink-0 fill-current text-brand-ink" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.94-12.04-14.58-6.19-9.5-10.9-19.98-14.13-31.44-3.23-11.46-4.85-22.35-4.85-32.68 0-14.65 3.84-26.65 11.52-36.01 7.68-9.36 17.1-14.12 28.26-14.28 5.43 0 11.22 1.48 17.37 4.44 6.15 2.96 10.13 4.49 11.95 4.59 1.42 0 5.46-1.58 12.12-4.74 6.66-3.16 12.44-4.53 17.34-4.12 15.34 1.15 26.68 6.89 34.02 17.22-13.43 8.16-20.03 19.34-19.8 33.54.23 11.22 4.44 20.67 12.63 28.35 4.09 3.86 8.76 6.78 14.02 8.75-2.88 8.65-6.42 17.07-10.63 25.26zM119.22 33.36c0-7.85 2.82-15.32 8.46-22.41 5.64-7.09 12.59-11.45 20.85-13.08.31 1.77.47 3.42.47 4.95 0 7.73-3 15.34-9.01 22.83-6.01 7.49-13.01 11.89-21 13.2-0.12-1.89-.18-3.72-.18-5.49z" />
            </svg>
          )}
          <span>Continue with Apple</span>
        </button>
      </div>

      {/* Elegant OR Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/80" />
        </div>
        <div className="relative px-3 bg-surface text-[11px] font-medium uppercase tracking-wider text-text-muted">
          or continue with email
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            role="alert"
            className="mb-5 p-3.5 rounded-xl border border-status-danger/30 bg-status-danger/10 text-status-danger flex items-start gap-2.5 text-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Anti-Bot Honeypot Field */}
        <div className="sr-only opacity-0 absolute -z-10 pointer-events-none" aria-hidden="true">
          <label htmlFor="reg-honeypot-hp">Website Domain</label>
          <input
            id="reg-honeypot-hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {/* Legal Name */}
        <div>
          <label className="block text-xs font-semibold text-brand-ink mb-1.5" htmlFor="register-name">
            Legal Full Name <span className="text-status-danger">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              <User className="w-4 h-4" />
            </div>
            <Input
              id="register-name"
              type="text"
              required
              autoComplete="name"
              placeholder="e.g. Maria Gonzalez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="pl-10 h-[46px] rounded-xl border-border/80 bg-surface hover:border-border-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm transition-all"
            />
          </div>
          <p className="text-[11px] text-text-muted mt-1">
            Matches your passport or civil document for certified certification affidavits.
          </p>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-brand-ink mb-1.5" htmlFor="register-email">
            Official Email Address <span className="text-status-danger">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              <Mail className="w-4 h-4" />
            </div>
            <Input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="pl-10 h-[46px] rounded-xl border-border/80 bg-surface hover:border-border-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm transition-all"
            />
          </div>

          {/* Smart Email Typo Suggestion */}
          {suggestedEmail && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 flex items-center gap-1.5 text-xs text-brand-ink bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span>Did you mean</span>
              <button
                type="button"
                onClick={() => setEmail(suggestedEmail)}
                className="font-bold underline text-brand-600 hover:text-brand-700 cursor-pointer"
              >
                {suggestedEmail}
              </button>
              <span>?</span>
            </motion.div>
          )}
        </div>

        {/* Master Vault Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-brand-ink" htmlFor="register-password">
              Master Vault Password <span className="text-status-danger">*</span>
            </label>
            {password.length > 0 && (
              <span
                className={cn(
                  "text-[11px] font-bold",
                  strength.score <= 1
                    ? "text-status-danger"
                    : strength.score === 2
                    ? "text-amber-600"
                    : "text-status-success"
                )}
              >
                {strength.label} Security
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              <Lock className="w-4 h-4" />
            </div>
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="pl-10 pr-10 h-[46px] rounded-xl border-border/80 bg-surface hover:border-border-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-brand-ink transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Real-time Apple-style Password Strength Progress Bar */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      step < strength.score
                        ? strength.score <= 1
                          ? "bg-status-danger"
                          : strength.score === 2
                          ? "bg-amber-500"
                          : "bg-status-success"
                        : "bg-surface-raised border border-border/60"
                    )}
                  />
                ))}
              </div>

              {/* Requirement Checklist */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-text-muted">
                <span
                  className={cn(
                    "flex items-center gap-1 transition-colors",
                    strength.checks.minLength ? "text-status-success font-medium" : "text-text-muted"
                  )}
                >
                  <Check className="w-3 h-3" /> 8+ chars
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1 transition-colors",
                    strength.checks.hasUppercase && strength.checks.hasLowercase
                      ? "text-status-success font-medium"
                      : "text-text-muted"
                  )}
                >
                  <Check className="w-3 h-3" /> Upper & lowercase
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1 transition-colors",
                    strength.checks.hasNumber || strength.checks.hasSpecial
                      ? "text-status-success font-medium"
                      : "text-text-muted"
                  )}
                >
                  <Check className="w-3 h-3" /> Number or symbol
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Optional Corporate / Law Firm Accordion Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsCorporateAccount(!isCorporateAccount)}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-ink hover:text-brand-500 transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-text-muted" />
            <span>Registering a Law Firm or Corporate Account?</span>
            {isCorporateAccount ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {isCorporateAccount && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-2.5 pt-2 border-t border-border/60"
              >
                <label className="block text-xs font-semibold text-brand-ink mb-1" htmlFor="register-company">
                  Organization or Law Firm Name <span className="text-status-danger">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <Input
                    id="register-company"
                    type="text"
                    placeholder="e.g. Fragomen, Del Rey, Bernsen & Loewy"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-9 h-10 rounded-xl border-border/80 bg-surface text-sm"
                  />
                </div>
                <p className="text-[11px] text-text-muted mt-1">
                  Enables multi-matter case management, consolidated invoicing, and client dossiers.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Terms and USCIS 8 CFR Compliance Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 w-4 h-4 rounded text-brand-500 border-border focus:ring-brand-500/20 cursor-pointer"
            />
            <span className="text-xs text-text-muted leading-relaxed">
              I agree to the{" "}
              <Link href="/help" className="font-semibold text-brand-ink hover:underline">
                Terms of Service
              </Link>
              ,{" "}
              <Link href="/help" className="font-semibold text-brand-ink hover:underline">
                Privacy Policy
              </Link>
              , and acknowledge the{" "}
              <span className="text-brand-ink font-semibold">USCIS 8 CFR § 103.2(b)(3)</span> certified accuracy standard.
            </span>
          </label>
        </div>

        {/* Tactile Apple-Grade Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl text-sm font-bold gap-2 shadow-sm active:scale-[0.985] transition-all bg-brand-ink hover:bg-neutral-800 text-white cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Certified Account...</span>
              </>
            ) : (
              <>
                <span>Create Certified Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Security & Vault Guarantee Badges */}
        <div className="pt-3 border-t border-border/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-status-success" />
            <span>256-Bit TLS 1.3 Vault</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-accent-seal" />
            <span>ATA Member No. 278190</span>
          </div>
          <div className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-brand-500" />
            <span>Passkeys & SSO Ready</span>
          </div>
        </div>

        {/* Automatic Guest Order Import Notice */}
        <div className="p-3 rounded-xl bg-surface-raised border border-border/60 text-[11px] text-text-muted flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
          <span>
            <strong className="text-brand-ink">Automatic Order Binding:</strong> Any previous translation orders placed with this email address will be automatically linked to your authenticated vault.
          </span>
        </div>

        {/* Switch to Sign In */}
        <div className="text-center pt-2">
          <p className="text-xs text-text-muted">
            Already have an account?{" "}
            <Link
              href={`/login${callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="font-bold text-brand-ink hover:text-brand-500 hover:underline transition-colors"
            >
              Sign in to your vault
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
