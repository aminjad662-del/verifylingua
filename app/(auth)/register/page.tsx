import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ShieldCheck, Lock, FileCheck2, Award, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Account | VerifyLingua Certified Translations",
  description:
    "Register for a secure VerifyLingua account. Institutional vault for USCIS immigration applicants, law firms, and certified document evaluation.",
};

export default function RegisterPage() {
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
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Value Proposition & Trust Anchors */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8 lg:sticky lg:top-24">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface text-xs font-semibold text-brand-ink mb-6">
              <Award className="w-3.5 h-3.5 text-accent-seal" />
              <span>ATA Member No. 278190 • USCIS Guaranteed</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-ink font-display leading-[1.15]">
              Open your certified translation vault.
            </h1>
            <p className="mt-4 text-base text-text-muted leading-relaxed">
              Store tamper-proof certificates, track certified translations in real time, and submit filings accepted
              by USCIS, courts, and academic institutions nationwide.
            </p>
          </div>

          {/* Key Advantages */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-500 shrink-0 mt-0.5">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-brand-ink font-display">Permanent QR & SHA-256 Verification</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Every certified translation receives a permanent public verification record for immigration officers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-accent-seal/10 flex items-center justify-center text-accent-seal shrink-0 mt-0.5">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-brand-ink font-display">Zero-Rejection USCIS Moat</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Strict 8 CFR 103.2 certification format guarantee with free instant corrections if ever questioned.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-status-success/10 flex items-center justify-center text-status-success shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-brand-ink font-display">Automatic Guest Order Linking</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Placed orders previously using this email? They will automatically sync into your new vault.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Card */}
        <div className="lg:col-span-7 bg-surface rounded-2xl border border-border-strong shadow-sm p-6 sm:p-8">
          <React.Suspense fallback={<div className="h-96 flex items-center justify-center text-text-muted text-sm">Loading registration...</div>}>
            <RegisterForm />
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
