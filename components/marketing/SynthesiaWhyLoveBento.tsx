"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileCheck2,
  ShieldCheck,
  QrCode,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Scale,
  Award,
  Lock,
  Stamp,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SynthesiaWhyLoveBento() {
  const [activeTab, setActiveTab] = useState<"passport" | "birth" | "marriage">("birth");

  return (
    <section className="py-20 sm:py-32 bg-surface/50 border-t border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200/80 bg-brand-50/80 text-brand-700 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Proven Legal Results</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text font-display">
            Why customers love VerifyLingua
          </h2>

          <p className="text-base sm:text-lg text-text-muted leading-relaxed">
            Everything you need to translate, certify, and submit vital civil documents
            with zero rejection risk and complete transparency.
          </p>
        </div>

        {/* 3-Card Bento Stack (Matches Screenshot Bento Layout) */}
        <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
          {/* ─── Card 1 (Top Wide): Tamper-Evident QR Verification ─── */}
          <div className="rounded-2xl sm:rounded-3xl bg-surface-raised border border-border p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shadow-xs">
                <QrCode className="w-6 h-6" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-text font-display tracking-tight">
                Instant tamper-evident verification
              </h3>

              <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                Immigration officers, university registrars, and consular staff scan the
                embedded secure QR code to verify original SHA-256 digital seals in under 2
                seconds, eliminating fraud concerns.
              </p>

              <div className="pt-2">
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <span>Test public verification portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Interactive Mock (Document preview + verified badge) */}
            <div className="lg:col-span-7">
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface border border-border/80 shadow-xs space-y-3">
                {/* Header bar */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
                    <span className="text-xs font-mono font-bold text-text">
                      CERTIFICATE_ACCURACY_SEAL.PDF
                    </span>
                  </div>
                  <Badge variant="outline" className="border-status-success/30 text-status-success bg-status-success-bg text-[10px] font-mono font-bold">
                    OFFICIALLY VERIFIED
                  </Badge>
                </div>

                {/* Document Body preview */}
                <div className="bg-canvas rounded-lg border border-border p-4 sm:p-6 space-y-4 text-xs font-mono text-text-muted">
                  <div className="flex items-center justify-between text-text">
                    <span className="font-bold uppercase tracking-wider text-[11px]">
                      Sworn Affidavit of Translator Competence
                    </span>
                    <span className="text-[10px] text-text-subtle">
                      USCIS 8 CFR § 103.2(b)(3)
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed text-text/80 font-sans border-l-2 border-brand-500 pl-3 py-0.5">
                    &quot;I, certified linguist under ATA Corporate Member No. 278190, declare that I am fluent in Spanish and English and that the attached translation is complete and accurate to the best of my knowledge and ability.&quot;
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60 text-[10px]">
                    <div>
                      <span className="text-text-subtle block">ISSUED BY:</span>
                      <span className="font-bold text-text">VerifyLingua LLC</span>
                    </div>
                    <div>
                      <span className="text-text-subtle block">ATA ID:</span>
                      <span className="font-bold text-text">No. 278190</span>
                    </div>
                    <div>
                      <span className="text-text-subtle block">HASH (SHA-256):</span>
                      <span className="font-bold text-brand-600 truncate block">9f8e...4a12</span>
                    </div>
                    <div>
                      <span className="text-text-subtle block">STATUS:</span>
                      <span className="font-bold text-status-success">100% Guaranteed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Card 2 (Middle Split): Team Work & Legal Firm Management ─── */}
          <div className="rounded-2xl sm:rounded-3xl bg-surface-raised border border-border p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Visual: Team collaboration badges & stickers */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-brand-50/60 via-lavender-50 to-surface border border-brand-100 relative overflow-hidden space-y-4">
                {/* Floating sticker effect */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-500 text-white shadow-xs">
                    Firm Portal Active
                  </span>
                  <span className="text-[10px] font-mono text-text-subtle">
                    Multi-Matter Assignment
                  </span>
                </div>

                <div className="bg-canvas rounded-xl p-4 border border-border shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text">Matter #IMMI-2026-8910</span>
                    <Badge variant="outline" className="text-[10px] text-brand-600 border-brand-200">
                      I-485 Packet
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs">
                      MV
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-text block">Marcus Vance, Esq.</span>
                      <span className="text-[11px] text-text-muted">Paralegal: Assigned to Elena R.</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-text-muted font-mono">
                    <span>3 Documents Sealed</span>
                    <span className="text-status-success font-bold">Ready for e-filing</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-brand-700">
                  <Users className="w-4 h-4 text-brand-600" />
                  <span>Team work makes the legal filing seamless</span>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-text font-display tracking-tight">
                Collaborative multi-matter firm management
              </h3>

              <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                Assign paralegals to specific client matters, batch-upload passports and
                marriage certificates, and receive consolidated billing with custom firm
                references on every invoice.
              </p>

              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <span>Open immigration firm account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* ─── Card 3 (Bottom Wide): Guaranteed USCIS Acceptance & RFE Defense ─── */}
          <div className="rounded-2xl sm:rounded-3xl bg-surface-raised border border-border p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-status-success-bg border border-status-success/30 flex items-center justify-center text-status-success shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-text font-display tracking-tight">
                100% USCIS Acceptance or 100% Full Refund
              </h3>

              <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                Every certified document is backed by our full RFE Defense Shield. If an
                immigration officer ever questions formatting, our senior compliance team
                issues instant revisions and sworn supplemental affidavits at zero charge.
              </p>

              <div className="pt-2">
                <Link
                  href="/translate"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <span>Start certified order</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Visual: RFE Resolution Packet */}
            <div className="lg:col-span-7">
              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-surface border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-bold text-text">USCIS RFE DEFENSE SHIELD</span>
                  </div>
                  <span className="text-[10px] font-mono text-status-success bg-status-success-bg px-2 py-0.5 rounded-full font-bold">
                    WARRANTY INCLUDED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-canvas border border-border space-y-1">
                    <span className="text-[10px] text-text-subtle font-mono block">FIRST-PASS ACCEPT:</span>
                    <span className="text-lg font-bold text-text">100%</span>
                    <span className="text-[10px] text-text-muted block">Zero fatal rejections</span>
                  </div>
                  <div className="p-3 rounded-lg bg-canvas border border-border space-y-1">
                    <span className="text-[10px] text-text-subtle font-mono block">REMEDY SPEED:</span>
                    <span className="text-lg font-bold text-brand-600">&lt; 4 Hours</span>
                    <span className="text-[10px] text-text-muted block">Instant re-affidavit</span>
                  </div>
                  <div className="p-3 rounded-lg bg-canvas border border-border space-y-1">
                    <span className="text-[10px] text-text-subtle font-mono block">REFUND POLICY:</span>
                    <span className="text-lg font-bold text-status-success">100% Full</span>
                    <span className="text-[10px] text-text-muted block">No questions asked</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-brand-50/50 border border-brand-200/60 text-xs text-brand-800 flex items-center justify-between">
                  <span>Cites 8 CFR § 204.2(a)(1)(iii)(B) Sworn Authenticity Regulations</span>
                  <ExternalLink className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
