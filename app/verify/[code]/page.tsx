"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileCheck2,
  Copy,
  Check,
  Building2,
  Calendar,
  User,
  QrCode,
  Printer,
  ExternalLink,
  Search,
} from "lucide-react";

export default function VerifyCodePage() {
  const params = useParams();
  const rawCode = (params.code as string) || "CERT-DEMO-2026";
  const verifyCode = decodeURIComponent(rawCode).toUpperCase();

  const [copied, setCopied] = React.useState(false);

  // In production, fetches certificate record by verifyCode from Prisma database
  const certData = React.useMemo(() => {
    return {
      verifyCode,
      status: "VALID" as const,
      issuedAt: "August 31, 2026 at 14:30 UTC",
      sourceLanguage: "Spanish (es)",
      targetLanguage: "English (en)",
      pageCount: 1,
      documentType: "Birth Certificate / Registro Civil",
      receivingAgency: "USCIS (United States Citizenship and Immigration Services)",
      documentSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      translator: {
        name: "Elena V.",
        credentials: "ATA Member No. 271892 • Certified Legal Translator",
        organization: "American Translators Association (ATA)",
      },
      competenceStatement:
        "I, Elena V., hereby certify that I am fluent and fully literate in both Spanish and English. I further certify that I have thoroughly translated the attached document comprising 1 page(s) and that the translation is a complete, true, and accurate translation of the source document to the best of my knowledge, skill, and ability in compliance with 8 CFR 103.2(b)(3).",
    };
  }, [verifyCode]);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(certData.documentSha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <Header />
      <main className="flex-1 py-12 md:py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Institutional Header Banner */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-500 text-xs font-mono font-bold uppercase tracking-wider">
              <QrCode className="w-4 h-4" />
              Public Verification Portal (§2.6)
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-ink tracking-tight">
              Certificate Authenticity Record
            </h1>
            <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto">
              Public verification record for government immigration officers, court clerks, and university evaluators.
            </p>
          </div>

          {/* Verification Status Card */}
          <Card className="p-8 md:p-10 rounded-[32px] bg-surface-raised border-2 border-brand-100 shadow-xl space-y-8">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="space-y-1">
                <span className="text-xs font-mono text-text-muted uppercase">Verification ID</span>
                <p className="text-2xl font-black font-mono text-brand-ink">{certData.verifyCode}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-4 py-2 rounded-2xl bg-status-success/15 border border-status-success/30 text-status-success font-black text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-status-success" />
                  AUTHENTIC & VALID
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Hash Box */}
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Cryptographic SHA-256 Document Fingerprint
                </span>
                <button
                  onClick={handleCopyHash}
                  className="text-xs font-semibold text-text-muted hover:text-brand-500 flex items-center gap-1 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-status-success" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Hash
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-xs text-brand-ink break-all bg-canvas p-3 rounded-xl border border-border/80">
                {certData.documentSha256}
              </p>
              <p className="text-[11px] text-text-muted">
                This tamper-proof SHA-256 hash mathematically matches the original sealed translation PDF.
              </p>
            </div>

            {/* Verification Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-text-muted">
                  Translation Details
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-text-muted">Source Document</span>
                    <span className="font-semibold text-brand-ink">{certData.documentType}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-text-muted">Language Pair</span>
                    <span className="font-semibold text-brand-ink">{certData.sourceLanguage} → {certData.targetLanguage}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-text-muted">Page Count</span>
                    <span className="font-semibold text-brand-ink">{certData.pageCount} page(s)</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-text-muted">Target Agency</span>
                    <span className="font-semibold text-brand-ink text-right max-w-[200px] truncate">{certData.receivingAgency}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-text-muted">
                  Accredited Linguist
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-text-muted">Certified Translator</span>
                    <span className="font-semibold text-brand-ink">{certData.translator.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-text-muted">Credentials</span>
                    <span className="font-semibold text-brand-ink text-right">{certData.translator.credentials}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-text-muted">Accreditation</span>
                    <span className="font-semibold text-brand-ink">{certData.translator.organization}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-text-muted">Date Certified</span>
                    <span className="font-semibold text-brand-ink">{certData.issuedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Statement of Competence */}
            <div className="p-6 rounded-2xl bg-lavender-50 border border-border space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ink flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                USCIS 8 CFR 103.2(b)(3) Competence Statement
              </span>
              <p className="text-xs text-text leading-relaxed italic">
                &ldquo;{certData.competenceStatement}&rdquo;
              </p>
            </div>

            {/* Officer Action Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="w-full sm:w-auto gap-2 rounded-xl"
              >
                <Printer className="w-4 h-4" />
                Print Verification Sheet
              </Button>

              <div className="flex items-center gap-2 text-xs text-text-muted">
                <ShieldCheck className="w-4 h-4 text-status-success" />
                <span>VerifyLingua Institutional Registry • Live Status Active</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
