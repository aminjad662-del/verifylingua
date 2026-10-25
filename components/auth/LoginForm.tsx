"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const wasRegistered = searchParams.get("registered") === "true";
  const resetSuccess = searchParams.get("resetSuccess") === "true";
  const oauthError = searchParams.get("error");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [ssoLoading, setSsoLoading] = React.useState<"google" | "apple" | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(
    oauthError === "oauth_callback_failed" ? "OAuth sign-in could not be completed. Please try again or use your password." : null
  );

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

  const handleSsoClick = (provider: "google" | "apple") => {
    setSsoLoading(provider);
    let url = `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    if (email.trim() && email.includes("@")) {
      url += `&email=${encodeURIComponent(email.trim().toLowerCase())}`;
    }
    setTimeout(() => {
      window.location.href = url;
    }, 150);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {wasRegistered && (
        <div className="mb-6 p-4 rounded-xl border border-status-success/30 bg-status-success/10 text-status-success flex items-start gap-3 text-sm animate-in fade-in">
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">
            Account created successfully! Please sign in with your credentials to access your translation vault.
          </div>
        </div>
      )}

      {resetSuccess && (
        <div className="mb-6 p-4 rounded-xl border border-status-success/30 bg-status-success/10 text-status-success flex items-start gap-3 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">
            Master password updated successfully! Please sign in with your new credentials.
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl border border-status-danger/30 bg-status-danger/10 text-status-danger flex items-start gap-3 text-sm animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Quick SSO Buttons (Apple HIG standard) */}
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
          or sign in with email
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-brand-ink mb-1.5" htmlFor="login-email">
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
              className="pl-10 h-[46px] rounded-xl border-border/80 bg-surface hover:border-border-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm"
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-brand-ink" htmlFor="login-password">
              Master Vault Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-brand-500 hover:text-brand-600 hover:underline cursor-pointer"
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
              placeholder="Enter your master password"
              className="pl-10 pr-10 h-[46px] rounded-xl border-border/80 bg-surface hover:border-border-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-ink transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl text-sm font-bold gap-2 shadow-sm active:scale-[0.985] transition-all bg-brand-ink hover:bg-neutral-800 text-white cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none mt-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying Vault Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Vault</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-text-muted">
            Don&apos;t have an account yet?{" "}
            <Link
              href={`/register${callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="font-bold text-brand-500 hover:text-brand-600 hover:underline"
            >
              Create verified account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
