import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { SecurityVaultBeacon } from "@/components/auth/SecurityVaultBeacon";
import { ShieldCheck, Lock, FileCheck2, Award, Scale, Fingerprint } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Certified Account | VerifyLingua Institutional Vault",
  description:
    "Register for a secure VerifyLingua account. Cryptographic document vault for USCIS immigration applicants, law firms, and certified linguists.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-canvas text-brand-ink flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Banner & Apple-Grade Header */}
      <header className="border-b border-border/60 bg-surface/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-20">
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

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border/80 text-xs font-semibold text-text-muted">
              <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
              <span>TLS 1.3 Vault Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-ink">
              <Lock className="w-3.5 h-3.5 text-status-success" />
              <span className="hidden md:inline">256-Bit Cryptographic Vault</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Institutional Value Proposition & Trust Proofs */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:sticky lg:top-24">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-surface text-xs font-semibold text-brand-ink mb-5 shadow-xs">
              <Award className="w-3.5 h-3.5 text-accent-seal" />
              <span>ATA Corporate Member No. 278190</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-brand-ink font-display leading-[1.1]">
              Open your certified legal translation vault.
            </h1>
            <p className="mt-3.5 text-sm sm:text-base text-text-muted leading-relaxed">
              Store tamper-proof affidavits, track USCIS filings in real time, and manage certified translations
              guaranteed for acceptance by federal immigration agencies, courts, and universities.
            </p>
          </div>

          {/* Key Advantages Card */}
          <div className="space-y-4 p-6 rounded-3xl bg-surface border border-border/80 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 shrink-0 mt-0.5 border border-brand-200">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-brand-ink font-display">Permanent QR & SHA-256 Verification</h2>
                <p className="text-[12px] text-text-muted mt-0.5 leading-relaxed">
                  Immigration officers can instantly scan and verify the original signed Certificate of Accuracy.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-2xl bg-accent-seal/10 flex items-center justify-center text-accent-seal shrink-0 mt-0.5 border border-accent-seal/20">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-brand-ink font-display">100% USCIS Acceptance Guarantee</h2>
                <p className="text-[12px] text-text-muted mt-0.5 leading-relaxed">
                  Strict 8 CFR § 103.2(b)(3) certified format with free instant corrections if ever questioned.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-2xl bg-status-success/10 flex items-center justify-center text-status-success shrink-0 mt-0.5 border border-status-success/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-brand-ink font-display">Automatic Guest Order Claim</h2>
                <p className="text-[12px] text-text-muted mt-0.5 leading-relaxed">
                  Prior orders placed under your email address are automatically bound to your authenticated vault.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-2xl bg-surface-raised flex items-center justify-center text-brand-ink shrink-0 mt-0.5 border border-border/70">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-brand-ink font-display">Zero AI Training Privacy Pledge</h2>
                <p className="text-[12px] text-text-muted mt-0.5 leading-relaxed">
                  Your civil documents, passports, and court exhibits are never retained for machine learning training.
                </p>
              </div>
            </div>
          </div>

          {/* Institutional Security Beacon */}
          <SecurityVaultBeacon />
        </div>

        {/* Right Column: Apple-Grade Registration Card */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-surface border border-border/80 shadow-md p-6 sm:p-9 md:p-10">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-ink font-display">
                Create your certified vault
              </h2>
              <p className="text-sm text-text-muted mt-1.5">
                Issue tamper-evident certified translations backed by ATA credentials.
              </p>
            </div>

            <React.Suspense
              fallback={
                <div className="h-96 flex items-center justify-center text-text-muted text-sm gap-2">
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading registration vault...</span>
                </div>
              }
            >
              <RegisterForm />
            </React.Suspense>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-border/60 py-6 px-6 text-center text-xs text-text-muted bg-surface/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} VerifyLingua LLC. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/help" className="hover:text-brand-ink transition-colors">USCIS 8 CFR 103.2</Link>
            <span>•</span>
            <Link href="/help" className="hover:text-brand-ink transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/help" className="hover:text-brand-ink transition-colors">Privacy & Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
