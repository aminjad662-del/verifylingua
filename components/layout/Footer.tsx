import Link from "next/link";
import { ShieldCheck, Lock, Globe2, FileCheck, CheckCircle, ArrowRight, Activity } from "lucide-react";
import { PRODUCT_NAME, SUPPORT_EMAIL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-obsidian-950 text-white border-t border-white/[0.08] pt-16 pb-12 px-4 sm:px-6 w-full overflow-hidden relative">
      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Top CTA & Brand Line */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/[0.08]">
          <div className="space-y-3 max-w-xl text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white border border-white/10">
                <ShieldCheck className="w-5 h-5 text-amber-statutory" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-sans">
                Verify<span className="text-amber-statutory">Lingua</span>
              </span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              The certified translation platform engineered to eliminate rejection risk for USCIS, federal courts, universities, and consulates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="/order/triage"
              className="inline-flex items-center justify-center gap-2.5 h-12 px-6 rounded-full bg-white hover:bg-neutral-100 text-obsidian-950 text-sm font-bold shadow-sm transition-all cursor-pointer group"
            >
              <span>Start translation</span>
              <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 text-obsidian-950" />
              </div>
            </Link>
            <Link
              href="/verify/demo"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors"
            >
              <Globe2 className="w-4 h-4 text-amber-400" />
              Public Verification Portal
            </Link>
          </div>
        </div>

        {/* 4-Column Categorized Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
          {/* Column 1: Services */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">Services & Enterprise</h3>
            <ul className="space-y-2.5 text-neutral-400">
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Certified USCIS Translation
                </Link>
              </li>
              <li>
                <Link href="/counsel" className="hover:text-white transition-colors font-medium text-amber-400">
                  CounselDesk™ Law Firm Portal
                </Link>
              </li>
              <li>
                <Link href="/defense/rfe" className="hover:text-white transition-colors font-medium text-amber-300">
                  USCIS RFE Defense Shield
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Notarized & Court Translation
                </Link>
              </li>
              <li>
                <Link href="/admin/shipping" className="hover:text-white transition-colors">
                  Physical Mail & FedEx Overnight
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Academic Evaluation (WES)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Popular Documents */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">Popular Documents</h3>
            <ul className="space-y-2.5 text-neutral-400">
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
                <Link href="/documents" className="text-amber-400 hover:text-white transition-colors font-medium">
                  View all 25+ documents →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Languages */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">Languages</h3>
            <ul className="space-y-2.5 text-neutral-400">
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
                <Link href="/languages" className="text-amber-400 hover:text-white transition-colors font-medium">
                  View all 70+ languages →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Verification */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">Trust & Institutional</h3>
            <ul className="space-y-2.5 text-neutral-400">
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
                <Link href="/order/VL-DEMO1/proof" className="hover:text-white transition-colors">
                  Interactive Proofing Studio™
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
            </ul>
          </div>
        </div>

        {/* Institutional Trust Badges */}
        <div className="pt-8 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-neutral-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% USCIS Guaranteed</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>ATA Corporate Standards</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-neutral-300">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>256-Bit SSE-KMS Vault</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-neutral-300">
            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Public SHA-256 QR Code</span>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-800 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} {PRODUCT_NAME}, Inc. All rights reserved. Not affiliated with USCIS or the U.S. Federal Government.</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
