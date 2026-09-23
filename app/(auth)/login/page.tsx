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
    <div className="min-h-screen bg-canvas text-brand-ink flex flex-col justify-between">
      {/* Top Banner & Header */}
      <div className="border-b border-border/60 bg-surface-raised/80 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 text-white shadow-sm transition-transform group-hover:scale-105">
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

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Lock className="w-3.5 h-3.5 text-status-success" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted Session</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-surface rounded-2xl border border-border-strong shadow-sm p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-ink font-display">
              Sign in to your vault
            </h1>
            <p className="text-xs text-text-muted mt-1.5">
              Access your certified translation certificates, active orders, and notarized records.
            </p>
          </div>

          <React.Suspense fallback={<div className="h-48 flex items-center justify-center text-text-muted text-sm">Loading sign in...</div>}>
            <LoginForm />
          </React.Suspense>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="border-t border-border py-6 px-6 text-center text-xs text-text-muted">
        <p>© {new Date().getFullYear()} VerifyLingua LLC. All rights reserved. Encrypted under 256-bit TLS.</p>
      </footer>
    </div>
  );
}
