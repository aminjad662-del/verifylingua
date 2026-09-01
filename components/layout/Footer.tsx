import Link from "next/link";
import { ShieldCheck, Lock, Globe2, FileCheck, CheckCircle, ArrowRight } from "lucide-react";
import { PRODUCT_NAME, SUPPORT_EMAIL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-brand-ink text-white border-t border-white/10 pt-16 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Top CTA & Brand Line */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/10">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Verify<span className="text-brand-300">Lingua</span>
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              The certified translation platform engineered to eliminate rejection risk for USCIS, universities, courts, and consulates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/order/triage"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-brand-500 hover:bg-brand-700 text-white text-sm font-bold shadow-sm transition-colors"
            >
              Start translation
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/verify/demo"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-sm font-medium transition-colors"
            >
              <Globe2 className="w-4 h-4 text-brand-300" />
              Public Verification Portal
            </Link>
          </div>
        </div>

        {/* 4-Column Categorized Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
          {/* Column 1: Services */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white/50 font-bold">Services</h3>
            <ul className="space-y-2.5 text-white/80">
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Certified USCIS Translation
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Notarized Translation
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Academic Evaluation (WES)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Court & Legal Translations
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Apostille Authentication
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Popular Documents */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white/50 font-bold">Popular Documents</h3>
            <ul className="space-y-2.5 text-white/80">
              <li>
                <Link href="/documents/birth-certificate" className="hover:text-white transition-colors">
                  Birth Certificate Translation
                </Link>
              </li>
              <li>
                <Link href="/documents/marriage-certificate" className="hover:text-white transition-colors">
                  Marriage Certificate
                </Link>
              </li>
              <li>
                <Link href="/documents/diploma-and-degree" className="hover:text-white transition-colors">
                  Diploma & Degree Translation
                </Link>
              </li>
              <li>
                <Link href="/documents/academic-transcript" className="hover:text-white transition-colors">
                  Academic Transcripts
                </Link>
              </li>
              <li>
                <Link href="/documents" className="text-brand-300 hover:text-white transition-colors font-medium">
                  View all 25+ documents →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Languages */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white/50 font-bold">Languages</h3>
            <ul className="space-y-2.5 text-white/80">
              <li>
                <Link href="/languages/spanish" className="hover:text-white transition-colors">
                  Spanish to English Translation
                </Link>
              </li>
              <li>
                <Link href="/languages/arabic" className="hover:text-white transition-colors">
                  Arabic to English (RTL Verified)
                </Link>
              </li>
              <li>
                <Link href="/languages/french" className="hover:text-white transition-colors">
                  French to English Translation
                </Link>
              </li>
              <li>
                <Link href="/languages/chinese" className="hover:text-white transition-colors">
                  Chinese to English Translation
                </Link>
              </li>
              <li>
                <Link href="/languages" className="text-brand-300 hover:text-white transition-colors font-medium">
                  View all 70+ languages →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Verification */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white/50 font-bold">Trust & Institutional</h3>
            <ul className="space-y-2.5 text-white/80">
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  Acceptance Pre-Check Wizard
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  Pre-Payment Document Triage
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  Name & Date Consistency Lock
                </Link>
              </li>
              <li>
                <Link href="/use-cases" className="hover:text-white transition-colors">
                  Filing Use Cases & Guidelines
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-white transition-colors">
                  USCIS Legal Knowledge Hub
                </Link>
              </li>
              <li>
                <Link href="/dev/tokens" className="hover:text-white transition-colors">
                  Design System & Tokens
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Institutional Trust Badges */}
        <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80">
            <CheckCircle className="w-4 h-4 text-status-success shrink-0" />
            <span>100% USCIS Guaranteed</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80">
            <ShieldCheck className="w-4 h-4 text-brand-300 shrink-0" />
            <span>ATA Corporate Standards</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80">
            <Lock className="w-4 h-4 text-brand-300 shrink-0" />
            <span>256-Bit SSE-KMS Vault</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80">
            <FileCheck className="w-4 h-4 text-status-info shrink-0" />
            <span>Public SHA-256 QR Code</span>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 text-xs text-white/50">
          <p>© {new Date().getFullYear()} {PRODUCT_NAME}, Inc. All rights reserved. Not affiliated with USCIS or the U.S. Federal Government.</p>
          <div className="flex items-center gap-6">
            <span>Support: {SUPPORT_EMAIL}</span>
            <Link href="/help" className="hover:text-white transition-colors">
              Privacy & Security
            </Link>
            <Link href="/help" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
