import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { ShieldCheck, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Set New Password | VerifyLingua Certified Translations",
  description:
    "Set a new master password for your VerifyLingua certified translation vault.",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-canvas text-brand-ink flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-border/70 bg-surface-raised/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
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

          <div className="flex items-center gap-2 text-xs font-semibold text-brand-ink">
            <Lock className="w-3.5 h-3.5 text-status-success" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted Vault</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 md:py-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Double-Bezel Card Container */}
          <div className="p-1.5 rounded-2xl bg-surface-raised/70 border border-border/90 shadow-sm">
            <div className="bg-surface rounded-xl border border-border/60 p-6 sm:p-8">
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-extrabold font-display text-brand-ink tracking-tight">
                  Set New Vault Password
                </h1>
                <p className="text-xs text-text-muted mt-1.5">
                  Choose a strong password meeting federal encryption standards to protect your translation vault.
                </p>
              </div>

              <React.Suspense
                fallback={
                  <div className="h-48 flex items-center justify-center text-text-muted text-sm gap-2">
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading password reset...</span>
                  </div>
                }
              >
                <ResetPasswordForm />
              </React.Suspense>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/70 py-6 px-6 text-center text-xs text-text-muted bg-surface/50">
        <p>© {new Date().getFullYear()} VerifyLingua LLC. All rights reserved. Encrypted under 256-bit TLS.</p>
      </footer>
    </div>
  );
}
