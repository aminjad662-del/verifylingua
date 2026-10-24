import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { ShieldCheck, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In | VerifyLingua Certified Translations",
  description: "Sign in to access your certified translation vault, certificates of accuracy, and active USCIS orders.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-canvas text-brand-ink flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Banner & Header */}
      <header className="border-b border-border/60 bg-surface/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-brand-500 text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-brand-ink font-display">
                Verify<span className="text-brand-500">Lingua</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
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

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 md:py-16">
        <div className="w-full max-w-md bg-surface rounded-3xl border border-border/80 shadow-md p-6 sm:p-9">
          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-4 border border-brand-200">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-ink font-display">
              Sign in to your vault
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1.5 leading-relaxed">
              Access your certified translation certificates, active orders, and notarized records.
            </p>
          </div>

          <React.Suspense fallback={<div className="h-48 flex items-center justify-center text-text-muted text-sm">Loading sign in...</div>}>
            <LoginForm />
          </React.Suspense>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="border-t border-border/60 py-6 px-6 text-center text-xs text-text-muted bg-surface/50">
        <p>© {new Date().getFullYear()} VerifyLingua LLC. All rights reserved. Encrypted under 256-bit TLS.</p>
      </footer>
    </div>
  );
}
