import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ShieldCheck, Lock, Award, CheckCircle2, FileCheck2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Certified Account | VerifyLingua Institutional Vault",
  description:
    "Open your secure VerifyLingua translation vault. Certified legal translations for USCIS immigration applicants, law firms, and accredited institutions.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-canvas text-brand-ink flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Banner & Header */}
      <header className="border-b border-border/70 bg-surface/80 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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

          <div className="flex items-center gap-4">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-[11px] font-mono text-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
              <span>TLS 1.3 Vault Active</span>
            </div>
            <Link
              href="/login"
              className="text-xs font-semibold text-brand-ink hover:text-brand-500 transition-colors"
            >
              Sign In →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Split Screen Container (Runway & Acctual Reference Design) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Visual Asset & Editorial Trust Section */}
        <div className="lg:col-span-6 relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl min-h-[520px] lg:min-h-[680px] flex flex-col justify-between p-8 sm:p-10 text-white">
          {/* Background Image: Authentic Legal Documentation & Passport Desk */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/auth-desk-legal.jpg"
              alt="Authentic certified legal documentation, passport, and notary seals on executive desk"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center brightness-[0.72] contrast-[1.05]"
            />
            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
          </div>

          {/* Top Overlaid Trust Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-white/90">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>ATA Corporate Member No. 278190</span>
            </div>
            <div className="text-[11px] font-mono text-white/70">
              USCIS 8 CFR § 103.2
            </div>
          </div>

          {/* Center / Lower Overlaid Editorial Headline (Runway Reference Pattern) */}
          <div className="relative z-10 space-y-4 my-auto pt-24 lg:pt-36">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-display leading-[1.12]">
              Everything you need, to make every record official.
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-lg leading-relaxed font-normal">
              Tamper-proof certified document translations, notarized affidavits of accuracy, and guaranteed federal acceptance for USCIS filings, courts, and universities worldwide.
            </p>
          </div>

          {/* Bottom Floating Glass Card with Real Metrics */}
          <div className="relative z-10 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2.5">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium text-white/90">100% USCIS Acceptance</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium text-white/90">Cryptographic QR Verifiable</span>
              </div>
            </div>
            <p className="text-[11px] text-white/70 pt-1 border-t border-white/10">
              Trusted by 14,000+ applicants, immigration attorneys, and accredited universities across 129+ countries.
            </p>
          </div>
        </div>

        {/* Right Column: Apple-Grade Streamlined Registration Card */}
        <div className="lg:col-span-6 flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="bg-surface rounded-3xl border border-border/80 shadow-sm p-6 sm:p-10">
            {/* Header Titles */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-ink font-display">
                Create your account
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1.5">
                Open your encrypted translation vault in under 60 seconds.
              </p>
            </div>

            {/* Registration Form Component */}
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

          {/* Institutional Trust Footer (Acctual Reference Pattern) */}
          <div className="mt-6 text-center">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-2">
              Accepted by Federal & State Authorities
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-medium text-text-muted">
              <span>USCIS</span>
              <span>•</span>
              <span>U.S. Dept of State</span>
              <span>•</span>
              <span>ATA Certified</span>
              <span>•</span>
              <span>ECFMG</span>
              <span>•</span>
              <span>NACES Universities</span>
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-border/70 py-6 px-6 text-center text-xs text-text-muted bg-surface/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} VerifyLingua LLC. All rights reserved. 256-Bit TLS Secured.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/help" className="hover:text-brand-ink transition-colors">USCIS 8 CFR 103.2</Link>
            <span>•</span>
            <Link href="/help" className="hover:text-brand-ink transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/help" className="hover:text-brand-ink transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
