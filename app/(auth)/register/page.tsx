import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Account | VerifyLingua Certified Translations",
  description:
    "Register for a secure VerifyLingua account. Institutional vault for USCIS immigration applicants, law firms, and certified document evaluation.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-neutral-50/50 flex flex-col justify-between selection:bg-brand-500/20 selection:text-brand-ink">
      {/* Dynamic Emerald Glass Ribbon Background Wave */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <img
          src="/images/auth-glass-wave.jpg"
          alt="Emerald fluid glass ribbon"
          className="w-full h-full object-cover object-center opacity-85 scale-105"
        />
        {/* Ambient radial lighting layer for optimal text contrast */}
        <div className="absolute inset-0 bg-radial from-white/30 via-white/10 to-transparent" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-500 text-white shadow-sm transition-transform group-hover:scale-105">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold tracking-tight text-neutral-900 font-display">
            Verify<span className="text-brand-500">Lingua</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <Link href="/services" className="hover:text-neutral-900 transition-colors">
            Services
          </Link>
          <Link href="/uscis-translation-requirements" className="hover:text-neutral-900 transition-colors">
            USCIS Standards
          </Link>
          <Link href="/pricing" className="hover:text-neutral-900 transition-colors">
            Pricing
          </Link>
          <Link href="/faq" className="hover:text-neutral-900 transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/order"
            className="h-10 px-5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center justify-center shadow-sm transition-all active:scale-[0.985]"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Container with Floating Frosted Glass Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <div className="w-full max-w-[480px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_32px_80px_-16px_rgba(20,40,28,0.14),0_0_0_1px_rgba(255,255,255,0.85)] rounded-[32px] p-6 sm:p-9 relative">
          <React.Suspense
            fallback={
              <div className="h-96 flex items-center justify-center text-text-muted text-sm font-sans">
                Loading registration...
              </div>
            }
          >
            <RegisterForm />
          </React.Suspense>
        </div>
      </main>

      {/* Minimal Clean Footer */}
      <footer className="relative z-20 py-5 px-6 text-center text-xs text-neutral-500 font-sans">
        <p>© {new Date().getFullYear()} VerifyLingua LLC. All rights reserved. Encrypted under 256-bit TLS.</p>
      </footer>
    </div>
  );
}
