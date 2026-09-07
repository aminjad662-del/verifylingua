"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileWarning,
  Download,
  UploadCloud,
  ArrowLeft,
  Clock,
  ExternalLink,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

function RFEDefenseContent() {
  const [publicCode, setPublicCode] = React.useState("");
  const [rfeReceiptNumber, setRfeReceiptNumber] = React.useState("");
  const [serviceCenter, setServiceCenter] = React.useState("Texas Service Center (TSC)");
  const [objectionType, setObjectionType] = React.useState("COMPETENCE_AFFIDAVIT_OMISSION");
  const [officerNotes, setOfficerNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [defenseResult, setDefenseResult] = React.useState<any>(null);

  const handleSubmitDefense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicCode.trim() || !rfeReceiptNumber.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/defense/rfe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicCode: publicCode.trim().toUpperCase(),
          rfeReceiptNumber: rfeReceiptNumber.trim().toUpperCase(),
          serviceCenter,
          rfeObjectionType: objectionType,
          officerNotes: officerNotes.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDefenseResult(data);
      }
    } catch (err) {
      console.error("Error submitting defense", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col selection:bg-brand-100 selection:text-brand-ink">
      {/* Top Header */}
      <header className="bg-surface-raised border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border text-brand-ink hover:bg-brand-50 hover:border-brand-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <Badge variant="outline" className="text-xs font-mono uppercase bg-status-danger-bg text-status-danger border-status-danger/30">
              Emergency Legal Defense
            </Badge>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-ink tracking-tight font-display flex items-center gap-2.5">
              <ShieldAlert className="w-7 h-7 text-status-danger shrink-0" />
              <span>USCIS Request for Evidence (RFE) Defense Shield</span>
            </h1>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Did a USCIS adjudicator or consular officer issue an RFE or Notice of Intent to Deny regarding a translation? Submit your Form I-797E notice below. Our senior ATA legal team will compile and dispatch an official Supplemental Re-Affidavit Packet in under 4 hours—100% free under our Acceptance Guarantee.
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {defenseResult ? (
          <Card className="p-6 sm:p-8 rounded-[28px] bg-surface-raised border-2 border-status-success/40 shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-status-success-bg border border-status-success/30 text-status-success">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-sm">
                  Official USCIS RFE Defense Packet Issued (Zero Charge)
                </h3>
                <p className="text-xs opacity-90 font-mono">
                  Defense Case ID: {defenseResult.defenseCaseId} • Digital SHA-256 Registered
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                <span className="text-[10px] text-text-muted uppercase font-bold block">
                  USCIS Case Metadata
                </span>
                <p><span className="text-text-muted">Order Code:</span> <span className="font-bold text-brand-ink">{defenseResult.publicCode}</span></p>
                <p><span className="text-text-muted">Receipt Number:</span> <span className="font-bold text-brand-ink">{defenseResult.rfeReceiptNumber}</span></p>
                <p><span className="text-text-muted">Service Center:</span> <span className="font-bold text-brand-ink">{defenseResult.serviceCenter}</span></p>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                <span className="text-[10px] text-text-muted uppercase font-bold block">
                  Legal Remedy Applied
                </span>
                <p className="font-bold text-brand-ink">{defenseResult.remedy.title}</p>
                <p className="text-[11px] text-text-muted">{defenseResult.remedy.legalRemedy}</p>
                <Badge variant="outline" className="text-[10px] bg-brand-50 text-brand-700 border-brand-200">
                  {defenseResult.remedy.regulationCite}
                </Badge>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-sunken border border-border space-y-2 text-xs">
              <h4 className="font-bold text-brand-ink flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-brand-500" />
                <span>Enclosed Defense Exhibits:</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-text-muted font-mono text-[11px]">
                <li>Formal Attorney Cover Letter addressed to {defenseResult.serviceCenter}</li>
                <li>Sworn Supplemental Affidavit of Competence signed by Elena Volkova (ATA Member 271892)</li>
                <li>Tamper-Proof Verification QR Code linking to Live Consular Ledger</li>
                <li>Verbatim bracketed transcription of faint civil registry seals and apostilles</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setDefenseResult(null)}
                className="rounded-xl text-xs"
              >
                Submit Another Notice
              </Button>
              <Button
                onClick={() => window.open(defenseResult.downloadDefensePacketUrl, "_blank")}
                className="h-11 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Certified RFE Response Packet</span>
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 rounded-[28px] bg-surface-raised border border-border shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-brand-ink font-display">
                  Submit Form I-797E Notice of Action
                </h3>
                <p className="text-xs text-text-muted">
                  Provide your initial VerifyLingua order code and the details from your USCIS letter.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-mono bg-status-success-bg text-status-success border-status-success/30">
                100% Free Service
              </Badge>
            </div>

            <form onSubmit={handleSubmitDefense} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-text-muted uppercase text-[10px] font-bold">
                    VerifyLingua Order Code
                  </label>
                  <Input
                    placeholder="e.g. VL-8921-XQ"
                    value={publicCode}
                    onChange={(e) => setPublicCode(e.target.value)}
                    required
                    className="h-10 text-xs rounded-xl font-mono uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-text-muted uppercase text-[10px] font-bold">
                    USCIS Receipt Number (Top Right of Notice)
                  </label>
                  <Input
                    placeholder="e.g. LIN2690184910 or IOE9182390192"
                    value={rfeReceiptNumber}
                    onChange={(e) => setRfeReceiptNumber(e.target.value)}
                    required
                    className="h-10 text-xs rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-text-muted uppercase text-[10px] font-bold">
                    USCIS Service Center
                  </label>
                  <select
                    value={serviceCenter}
                    onChange={(e) => setServiceCenter(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-brand-ink focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-xs"
                  >
                    <option value="Texas Service Center (TSC)">Texas Service Center (TSC)</option>
                    <option value="Nebraska Service Center (NSC)">Nebraska Service Center (NSC)</option>
                    <option value="California Service Center (CSC)">California Service Center (CSC)</option>
                    <option value="Potomac Service Center (YSC)">Potomac Service Center (YSC)</option>
                    <option value="Vermont Service Center (VSC)">Vermont Service Center (VSC)</option>
                    <option value="National Benefits Center (NBC)">National Benefits Center (NBC)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-text-muted uppercase text-[10px] font-bold">
                    Adjudicator Objection Category
                  </label>
                  <select
                    value={objectionType}
                    onChange={(e) => setObjectionType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-brand-ink focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-xs"
                  >
                    <option value="COMPETENCE_AFFIDAVIT_OMISSION">
                      Competence Statement / 8 CFR § 204.2 Certification
                    </option>
                    <option value="NAME_SPELLING_MISMATCH">
                      Name Spelling Discrepancy vs. G-28 / Passport
                    </option>
                    <option value="ILLEGIBLE_SEAL_MARGINALIA">
                      Illegible Civil Registry Seal / Notary Marginalia
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-text-muted uppercase text-[10px] font-bold">
                  Officer Notes / Text from RFE Notice
                </label>
                <textarea
                  rows={3}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Paste the relevant paragraph from your Form I-797E notice..."
                  className="w-full p-3 rounded-xl bg-surface border border-border text-brand-ink text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-brand-50/80 border border-brand-200 flex items-center gap-3 text-xs text-brand-ink">
                <Clock className="w-5 h-5 text-brand-500 shrink-0" />
                <div>
                  <p className="font-bold">Guaranteed Response Under 4 Hours</p>
                  <p className="text-text-muted">
                    We know RFE deadlines are critical. Your amended defense packet will be prioritized immediately.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={submitting || !publicCode.trim() || !rfeReceiptNumber.trim()}
                  className="h-11 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs gap-2 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{submitting ? "Compiling Defense Packet..." : "Generate Free RFE Defense Packet"}</span>
                </Button>
              </div>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function RFEDefensePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-muted">Loading RFE Defense Shield...</div>}>
      <RFEDefenseContent />
    </Suspense>
  );
}
