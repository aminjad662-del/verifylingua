import React from "react";
import Link from "next/link";
import {
  Lock,
  QrCode,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SunsamaFeatureBento() {
  return (
    <section className="py-20 md:py-32 bg-canvas border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200/50 bg-brand-50/80 text-brand-500 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Precision Engineering</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-ink tracking-tight font-display">
            Everything You Need, and Nothing You Don&apos;t.
          </h2>

          <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
            Every feature in VerifyLingua was engineered to solve an exact failure point documented in real USCIS rejection notices.
          </p>
        </div>

        {/* 6-Card Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bento Card 1: Passport Transliteration Lock */}
          <div className="p-7 rounded-[var(--r-xl)] bg-surface-raised border border-border/80 hover:border-brand-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              {/* Micro UI Mockup Widget */}
              <div className="p-4 rounded-xl bg-surface border border-border/80 space-y-2.5 font-mono">
                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span>MRZ Transliteration Match</span>
                  <span className="text-status-success font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Locked
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-raised border border-border text-xs text-brand-ink font-mono truncate">
                  P&lt;COLRODRIGUEZ&lt;&lt;CAMILA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <span>Target: English</span>
                  <span className="text-brand-500 font-bold">100% Spelled Match</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-ink font-display">
                    Passport Name Consistency Lock
                  </h3>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Hard-locks names and dates to official passport records. Eliminates the #1 cause of 90-day USCIS Request for Evidence (RFE) delays.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-brand-500 font-bold border-t border-border/60 pt-3 block">
              Zero Spelling Drift
            </span>
          </div>

          {/* Bento Card 2: Pre-Payment Document Quality Triage */}
          <div className="p-7 rounded-[var(--r-xl)] bg-surface-raised border border-border/80 hover:border-brand-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              {/* Micro UI Mockup Widget */}
              <div className="p-4 rounded-xl bg-surface border border-border/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-text-muted">Vision Inspection</span>
                  <Badge variant="success" className="text-[10px] py-0">Passed 300 DPI</Badge>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-text-muted">
                    <span>Resolution & Contrast</span>
                    <span className="text-brand-ink font-bold">Optimal</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-raised border border-border overflow-hidden">
                    <div className="h-full bg-status-success rounded-full" style={{ width: "95%" }} />
                  </div>
                </div>
                <div className="text-[10px] font-mono text-text-muted flex justify-between">
                  <span>Embossed Seals</span>
                  <span className="text-status-success font-bold">2 Identified</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-ink font-display">
                    Pre-Payment Document Quality Triage
                  </h3>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Our computer vision auditor inspects resolution, glare, handwriting, and cut-off seals before you pay, avoiding post-payment rejections.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-brand-500 font-bold border-t border-border/60 pt-3 block">
              &lt;5s Automated Clarity Audit
            </span>
          </div>

          {/* Bento Card 3: Cryptographic QR Ledger */}
          <div className="p-7 rounded-[var(--r-xl)] bg-surface-raised border border-border/80 hover:border-brand-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              {/* Micro UI Mockup Widget */}
              <div className="p-4 rounded-xl bg-surface border border-border/80 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-500 shrink-0">
                    <QrCode className="w-7 h-7" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-[10px] font-mono uppercase text-brand-500 font-bold block">
                      SHA-256 Ledger
                    </span>
                    <p className="text-[11px] font-mono text-brand-ink font-bold truncate">
                      8f92...a34e
                    </p>
                    <span className="text-[10px] text-text-muted font-mono block">
                      /verify/VL-8942-US
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-ink font-display">
                    Public Cryptographic QR Ledger
                  </h3>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Every certified page carries an immutable digital stamp and QR link so consular officers and clerks can authenticate credentials in 1 click.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-brand-500 font-bold border-t border-border/60 pt-3 block">
              Instant Consular Verification
            </span>
          </div>

          {/* Bento Card 4: Sworn USCIS 8 CFR 103.2 Affidavit */}
          <div className="p-7 rounded-[var(--r-xl)] bg-surface-raised border border-border/80 hover:border-brand-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              {/* Micro UI Mockup Widget */}
              <div className="p-4 rounded-xl bg-surface border border-border/80 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-brand-ink font-bold">
                  <span>8 CFR 103.2(a)(3)</span>
                  <Badge variant="default" className="text-[10px] py-0">ATA Certified</Badge>
                </div>
                <p className="text-[10px] text-text-muted italic leading-tight">
                  &ldquo;I hereby certify that I am competent to translate from Spanish into English and that the translation is accurate...&rdquo;
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-ink font-display">
                    Sworn Translator Affidavit
                  </h3>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Bound with full ATA linguist credentials, official corporate seal, physical signature, and 100% full legal liability backing.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-brand-500 font-bold border-t border-border/60 pt-3 block">
              100% Court & Consular Compliance
            </span>
          </div>

          {/* Bento Card 5: Exact 1:1 Layout & Coordinate Preservation */}
          <div className="p-7 rounded-[var(--r-xl)] bg-surface-raised border border-border/80 hover:border-brand-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              {/* Micro UI Mockup Widget */}
              <div className="p-4 rounded-xl bg-surface border border-border/80 space-y-2">
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono font-bold">
                  <div className="p-1.5 rounded-md bg-brand-50 text-brand-500 border border-brand-100">PDF</div>
                  <div className="p-1.5 rounded-md bg-brand-50 text-brand-500 border border-brand-100">DOCX</div>
                  <div className="p-1.5 rounded-md bg-brand-50 text-brand-500 border border-brand-100">PNG</div>
                  <div className="p-1.5 rounded-md bg-brand-50 text-brand-500 border border-brand-100">JPG</div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                  <span>Table Grid Alignment</span>
                  <span className="text-status-success font-bold">100% Cell-Matched</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-ink font-display">
                    Exact 1:1 Layout Preservation
                  </h3>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Dual OpenXML and coordinate engines reconstruct translated text inside the exact original table cells, stamps, and margins.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-brand-500 font-bold border-t border-border/60 pt-3 block">
              Round-Trip in Identical Format
            </span>
          </div>

          {/* Bento Card 6: Bank-Grade Vault with 90-Day Auto-Purge */}
          <div className="p-7 rounded-[var(--r-xl)] bg-surface-raised border border-border/80 hover:border-brand-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              {/* Micro UI Mockup Widget */}
              <div className="p-4 rounded-xl bg-surface border border-border/80 space-y-2 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-muted">Storage Encryption</span>
                  <span className="text-status-success font-bold">256-bit AES</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <span>Privacy Auto-Purge</span>
                  <span className="text-brand-500 font-bold">90-Day Countdown</span>
                </div>
                <div className="p-1.5 rounded-md bg-surface-raised border border-border text-[10px] text-text-muted text-center">
                  Zero Third-Party Training • SOC2 Vault
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-ink font-display">
                    Encrypted Vault & Auto-Purge
                  </h3>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Your identity documents are encrypted at rest with AES-256 and permanently deleted from our servers 90 days after delivery.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-brand-500 font-bold border-t border-border/60 pt-3 block">
              Strict Immigration Privacy
            </span>
          </div>
        </div>

        {/* Action Link */}
        <div className="text-center pt-2">
          <Button asChild size="lg" className="gap-2 px-8 h-13 rounded-2xl font-bold shadow-md active:scale-[0.975]">
            <Link href="/order/triage">
              Start certified translation ($24.95/page)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
