"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Globe2, FileCheck, CheckCircle, ArrowRight, Scale, Building2 } from "lucide-react";
import { PRODUCT_NAME } from "@/lib/constants";
import { useTranslationModal } from "@/components/translation/TranslationModalContext";

export function Footer() {
  const { openModal } = useTranslationModal();

  return (
    <footer className="bg-surface text-text border-t border-border pt-16 pb-12 px-4 sm:px-6 w-full overflow-hidden relative">
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Top CTA & Brand Line */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-border">
          <div className="space-y-3 max-w-xl text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-raised border border-border text-brand-ink shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-brand-ink" />
              </div>
              <span className="text-2xl font-black tracking-tight text-brand-ink font-display">
                Verify<span className="text-brand-500">Lingua</span>
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed font-sans">
              The certified translation platform engineered to eliminate rejection risk for USCIS, federal courts, universities, and consulates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="/translate"
              className="inline-flex items-center justify-center gap-2.5 h-12 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-xs transition-transform duration-150 ease-out active:scale-[0.98] cursor-pointer group"
            >
              <span>Start translation</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/verify"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-surface-raised hover:bg-surface border border-border text-brand-ink text-sm font-semibold transition-transform duration-150 ease-out active:scale-[0.98]"
            >
              <Globe2 className="w-4 h-4 text-brand-500" />
              <span>Public Verification Portal</span>
            </Link>
          </div>
        </div>

        {/* 4-Column Categorized Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-sm font-sans text-left">
          {/* Column 1: Services */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-brand-ink font-bold font-sans">Services & Enterprise</h3>
            <ul className="space-y-2.5 text-text-muted text-xs">
              <li>
                <Link href="/pricing" className="hover:text-brand-ink transition-colors">
                  Certified USCIS Translation
                </Link>
              </li>
              <li>
                <Link href="/counsel" className="hover:text-brand-ink transition-colors font-medium text-brand-500">
                  CounselDesk Immigration Portal
                </Link>
              </li>
              <li>
                <Link href="/acceptance-guarantee" className="hover:text-brand-ink transition-colors font-medium text-brand-500">
                  USCIS Acceptance Guarantee
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-brand-ink transition-colors">
                  Notarized & Court Translation
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-brand-ink transition-colors">
                  Academic Evaluation (WES)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Popular Documents */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-brand-ink font-bold font-sans">Popular Documents</h3>
            <ul className="space-y-2.5 text-text-muted text-xs">
              <li>
                <Link href="/documents/birth-certificate" className="hover:text-brand-ink transition-colors">
                  Birth Certificate Translation
                </Link>
              </li>
              <li>
                <Link href="/documents/marriage-certificate" className="hover:text-brand-ink transition-colors">
                  Marriage Certificate
                </Link>
              </li>
              <li>
                <Link href="/documents/academic-diploma" className="hover:text-brand-ink transition-colors">
                  Diploma & Degree Translation
                </Link>
              </li>
              <li>
                <Link href="/documents/academic-transcript" className="hover:text-brand-ink transition-colors">
                  Academic Transcripts
                </Link>
              </li>
              <li>
                <Link href="/documents" className="text-brand-500 hover:text-brand-600 transition-colors font-medium">
                  View all 25+ documents →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Languages */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-brand-ink font-bold font-sans">Languages</h3>
            <ul className="space-y-2.5 text-text-muted text-xs">
              <li>
                <Link href="/languages/spanish" className="hover:text-brand-ink transition-colors">
                  Spanish to English Translation
                </Link>
              </li>
              <li>
                <Link href="/languages/arabic" className="hover:text-brand-ink transition-colors">
                  Arabic to English (RTL Verified)
                </Link>
              </li>
              <li>
                <Link href="/languages/french" className="hover:text-brand-ink transition-colors">
                  French to English Translation
                </Link>
              </li>
              <li>
                <Link href="/languages/chinese" className="hover:text-brand-ink transition-colors">
                  Chinese to English Translation
                </Link>
              </li>
              <li>
                <Link href="/languages" className="text-brand-500 hover:text-brand-600 transition-colors font-medium">
                  View all 70+ languages →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Institutional */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-brand-ink font-bold font-sans">Trust & Legal</h3>
            <ul className="space-y-2.5 text-text-muted text-xs">
              <li>
                <Link href="/how-it-works" className="hover:text-brand-ink transition-colors">
                  Pre-Flight Document Triage
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-brand-ink transition-colors">
                  Name & Date Consistency Lock
                </Link>
              </li>
              <li>
                <Link href="/use-cases" className="hover:text-brand-ink transition-colors">
                  Filing Use Cases & Guidelines
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-brand-ink transition-colors">
                  USCIS Legal Knowledge Hub
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Dedicated Statutory Regulatory & Compliance Block */}
        <div className="p-6 rounded-2xl bg-canvas border border-border grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-text-muted text-left">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-brand-ink font-bold font-sans">
              <Scale className="w-4 h-4 text-brand-500 shrink-0" />
              <span>8 CFR § 103.2(b)(3) Adherence</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Every translation includes a formal sworn translator competence affidavit admissible before USCIS, EOIR courts, and federal agencies nationwide.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-brand-ink font-bold font-sans">
              <ShieldCheck className="w-4 h-4 text-amber-statutory shrink-0" />
              <span>ATA Corporate Member No. 278190</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Accredited corporate member of the American Translators Association. Workflows conform to ASTM F2575-14 legal translation quality guidelines.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-brand-ink font-bold font-sans">
              <Building2 className="w-4 h-4 text-court-emerald shrink-0" />
              <span>Delaware & California Notice</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              VerifyLingua Technologies, Inc. (DE File No. 7491823). Operations: 555 California St, Suite 300, San Francisco, CA 94104.
            </p>
          </div>
        </div>

        {/* Dense Tabular Monospace Technical Metadata Ledger */}
        <div className="border border-border rounded-xl bg-surface-raised p-4 font-mono text-[11px] text-text-muted flex flex-wrap items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-4 flex-wrap">
            <span>ATA ID: 278190</span>
            <span className="text-border-strong">•</span>
            <span>ENCRYPTION: FIPS 140-2 / TLS 1.3</span>
            <span className="text-border-strong">•</span>
            <span>PUBLIC ROUTE: /verify</span>
            <span className="text-border-strong">•</span>
            <span>VAULT: 24H ZERO-RETENTION PURGE</span>
          </div>
          <div className="flex items-center gap-2 text-court-emerald font-bold">
            <span className="w-2 h-2 rounded-full bg-court-emerald animate-pulse" />
            <span>ALL STATUTORY PROTOCOLS ACTIVE</span>
          </div>
        </div>

        {/* Institutional Trust Badges */}
        <div className="pt-8 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-raised border border-border text-xs text-text-muted shadow-2xs">
            <CheckCircle className="w-4 h-4 text-court-emerald shrink-0" />
            <span>USCIS Acceptance Warranty</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-raised border border-border text-xs text-text-muted shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-amber-statutory shrink-0" />
            <span>ATA Corporate Standards</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-raised border border-border text-xs text-text-muted shadow-2xs">
            <Lock className="w-4 h-4 text-brand-ink shrink-0" />
            <span>256-Bit SSE-KMS Vault</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-raised border border-border text-xs text-text-muted shadow-2xs">
            <FileCheck className="w-4 h-4 text-court-emerald shrink-0" />
            <span>Public SHA-256 QR Code</span>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border text-xs text-text-muted">
          <p>© {new Date().getFullYear()} {PRODUCT_NAME}, Inc. All rights reserved. Not affiliated with USCIS or the U.S. Federal Government.</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-court-emerald font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-court-emerald animate-pulse" />
              <span>All Systems Operational</span>
            </div>
            <Link href="/privacy" className="hover:text-brand-ink transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-brand-ink transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
