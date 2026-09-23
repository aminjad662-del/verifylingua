"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
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
  Languages,
  Sparkles,
  Phone,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AccountType = "INDIVIDUAL" | "LAW_FIRM" | "TRANSLATOR";

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

  // Form state
  const [accountType, setAccountType] = React.useState<AccountType>("INDIVIDUAL");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [ataNumber, setAtaNumber] = React.useState("");
  const [languagePairs, setLanguagePairs] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  // Bot honeypot state
  const [honeypot, setHoneypot] = React.useState("");

  // UI state
  const [showComplianceDetails, setShowComplianceDetails] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client validation
    if (!name.trim()) {
      setErrorMessage("Please enter your legal full name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your official email address.");
      return;
    }

    if (accountType === "LAW_FIRM" && !companyName.trim()) {
      setErrorMessage("Please provide your law firm or practice name.");
      return;
    }

    if (accountType === "TRANSLATOR" && !ataNumber.trim()) {
      setErrorMessage("Please provide your ATA or state credential number.");
      return;
    }

    if (strength.score < 2) {
      setErrorMessage(
        strength.patternWarning ||
          "Password must meet institutional security standards (minimum 8 characters with mixed case, numbers, and symbols)."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("You must accept the Terms of Service, Privacy Policy, and USCIS 8 CFR 103.2 compliance oath.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        accountType,
        companyName: accountType === "LAW_FIRM" ? companyName.trim() : undefined,
        ataNumber: accountType === "TRANSLATOR" ? ataNumber.trim() : undefined,
        languagePairs: accountType === "TRANSLATOR" ? languagePairs.trim() : undefined,
        phone: phone.trim() ? phone.trim() : undefined,
        terms: true,
        website_security_hp: honeypot, // Honeypot field
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

      // Success -> Redirect to dashboard with notification flag
      router.push(`${callbackUrl}?registered=true&verifySent=true`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected network or server error occurred.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Scope Selector: Individual vs Law Firm vs Certified Translator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-mono uppercase tracking-wider text-text-muted">
            1. Institutional Scope
          </label>
          <span className="text-[11px] text-text-muted">Secure Role Authorization</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1 rounded-2xl bg-surface-raised/70 border border-border">
          {/* Individual */}
          <button
            type="button"
            onClick={() => setAccountType("INDIVIDUAL")}
            className={cn(
              "relative flex flex-col items-start p-3 rounded-xl text-left transition-all",
              accountType === "INDIVIDUAL"
                ? "bg-surface shadow-sm border border-border-strong text-brand-ink"
                : "text-text-muted hover:text-brand-ink hover:bg-surface/50 border border-transparent"
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                  accountType === "INDIVIDUAL" ? "bg-brand-500 text-white" : "bg-surface-raised text-text-muted"
                )}
              >
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-bold font-display">Individual</span>
            </div>
            <span className="text-[11px] text-text-muted leading-tight">USCIS, Visa & Academic Vault</span>
          </button>

          {/* Law Firm */}
          <button
            type="button"
            onClick={() => setAccountType("LAW_FIRM")}
            className={cn(
              "relative flex flex-col items-start p-3 rounded-xl text-left transition-all",
              accountType === "LAW_FIRM"
                ? "bg-surface shadow-sm border border-border-strong text-brand-ink"
                : "text-text-muted hover:text-brand-ink hover:bg-surface/50 border border-transparent"
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                  accountType === "LAW_FIRM" ? "bg-accent-seal text-white" : "bg-surface-raised text-text-muted"
                )}
              >
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-bold font-display">Law Firm</span>
            </div>
            <span className="text-[11px] text-text-muted leading-tight">Attorneys & Multi-Matter SLA</span>
          </button>

          {/* Translator */}
          <button
            type="button"
            onClick={() => setAccountType("TRANSLATOR")}
            className={cn(
              "relative flex flex-col items-start p-3 rounded-xl text-left transition-all",
              accountType === "TRANSLATOR"
                ? "bg-surface shadow-sm border border-border-strong text-brand-ink"
                : "text-text-muted hover:text-brand-ink hover:bg-surface/50 border border-transparent"
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                  accountType === "TRANSLATOR" ? "bg-status-success text-white" : "bg-surface-raised text-text-muted"
                )}
              >
                <Languages className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-bold font-display">Linguist</span>
            </div>
            <span className="text-[11px] text-text-muted leading-tight">ATA Members & Court Notaries</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            role="alert"
            className="mb-6 p-4 rounded-xl border border-status-danger/30 bg-status-danger/10 text-status-danger flex items-start gap-3 text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Anti-Bot Honeypot Field (Hidden from normal users & assistive tech) */}
        <div className="sr-only opacity-0 absolute -z-10 pointer-events-none" aria-hidden="true">
          <label htmlFor="reg-honeypot-website">Corporate URL</label>
          <input
            id="reg-honeypot-website"
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
              className="pl-10 h-11"
              autoComplete="name"
            />
          </div>
        </div>

        {/* Conditional Role-Specific Fields */}
        {accountType === "LAW_FIRM" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 overflow-hidden"
          >
            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1.5" htmlFor="register-org">
                Law Firm / Practice Name <span className="text-status-danger">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <Input
                  id="register-org"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Rostova & Partners Immigration LLP"
                  className="pl-10 h-11"
                />
              </div>
            </div>
          </motion.div>
        )}

        {accountType === "TRANSLATOR" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-brand-ink mb-1.5" htmlFor="register-ata">
                  ATA / Court Credential # <span className="text-status-danger">*</span>
                </label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <Input
                    id="register-ata"
                    type="text"
                    required
                    value={ataNumber}
                    onChange={(e) => setAtaNumber(e.target.value)}
                    placeholder="e.g. 278190"
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-ink mb-1.5" htmlFor="register-pairs">
                  Language Pairs
                </label>
                <div className="relative">
                  <Languages className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <Input
                    id="register-pairs"
                    type="text"
                    value={languagePairs}
                    onChange={(e) => setLanguagePairs(e.target.value)}
                    placeholder="e.g. Spanish -> English"
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Email Address & Live Typo Suggestion */}
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
              className="pl-10 h-11"
              autoComplete="email"
            />
          </div>

          {/* Typo Correction Prompt */}
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
            USCIS Certificates of Accuracy and SHA-256 digital seals will be cryptographically bound to this address.
          </p>
        </div>

        {/* Phone Number (Optional for 2FA readiness) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-brand-ink" htmlFor="register-phone">
              Mobile Phone <span className="text-text-muted font-normal">(Optional for 2FA & Filing Alerts)</span>
            </label>
            <span className="text-[10px] text-status-success font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Encrypted E.164
            </span>
          </div>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <Input
              id="register-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 019-2834"
              className="pl-10 h-11"
              autoComplete="tel"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-brand-ink mb-1.5" htmlFor="register-password">
            Vault Master Password <span className="text-status-danger">*</span>
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
              className="pl-10 pr-10 h-11"
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
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2.5 p-3 rounded-xl border border-border bg-surface-raised space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-text-muted">Password Security Grade:</span>
                <span
                  className={cn(
                    "font-bold font-mono tracking-tight",
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

              {/* Pattern Warning if guessable */}
              {strength.patternWarning && (
                <p className="text-[11px] text-status-danger font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {strength.patternWarning}
                </p>
              )}

              {/* Criteria Checklist with Spring Feedback */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
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
                  8+ characters
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
                  Upper & lowercase
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
                  Number (0-9)
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
                  Special symbol
                </div>
              </div>
            </motion.div>
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
              className={cn(
                "pl-10 pr-10 h-11",
                passwordsMismatch && "border-status-danger focus-visible:ring-status-danger",
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
            <p className="text-[11px] text-status-danger mt-1">Passwords do not match.</p>
          )}
        </div>

        {/* Terms of Service & USCIS Compliance Accordion */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-border text-brand-500 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-xs text-text-muted leading-relaxed">
              I certify legal accuracy and accept the{" "}
              <Link href="/help" className="text-brand-ink underline font-medium hover:text-brand-500">
                Terms of Service
              </Link>
              ,{" "}
              <Link href="/help" className="text-brand-ink underline font-medium hover:text-brand-500">
                Privacy Policy
              </Link>
              , and USCIS 8 CFR 103.2 translation authenticity guidelines.
            </span>
          </label>

          {/* Compliance Drawer Toggle */}
          <div className="mt-2 pl-6">
            <button
              type="button"
              onClick={() => setShowComplianceDetails(!showComplianceDetails)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-500 hover:text-brand-600 transition-colors"
            >
              <HelpCircle className="w-3 h-3" />
              <span>What is USCIS 8 CFR 103.2 compliance?</span>
              {showComplianceDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <AnimatePresence>
              {showComplianceDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-3 rounded-xl bg-surface-raised border border-border text-xs text-text-muted space-y-1.5 leading-relaxed"
                >
                  <p className="font-semibold text-brand-ink">
                    Federal Immigration Standard (8 CFR 103.2(b)(3)):
                  </p>
                  <p>
                    Any foreign language document submitted to USCIS must be accompanied by a complete English
                    translation verified by a competent translator as accurate, with a signed Certificate of Accuracy.
                  </p>
                  <p className="text-[11px] text-accent-seal font-medium">
                    ✓ VerifyLingua guarantees 100% acceptance with free instant RFE revisions.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl text-sm font-bold gap-2 shadow-sm active:scale-[0.985] transition-all bg-brand-500 hover:bg-brand-600 text-white cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Establishing Encrypted Vault...</span>
              </>
            ) : (
              <>
                <span>Create Certified Translation Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="pt-3 border-t border-border/80 flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
            <span>256-Bit TLS Vault</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-seal" />
            <span>ATA Corporate Member</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-brand-ink" />
            <span>Zero AI Model Training</span>
          </div>
        </div>

        {/* Switch to Sign In */}
        <div className="text-center pt-2">
          <p className="text-xs text-text-muted">
            Already registered?{" "}
            <Link
              href={`/login${callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="font-bold text-brand-ink hover:text-brand-500 hover:underline"
            >
              Sign in to your vault
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
