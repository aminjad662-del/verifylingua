"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  FileCheck,
  ShieldAlert,
  Truck,
  ArrowRight,
  Download,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MorphingActionButton } from "./MorphingActionButton";
import { showToast } from "./ToastNotification";

export function LegalToolkitBento() {
  const handleDownloadAllInvoices = async () => {
    window.open("/api/invoices/download-all", "_blank");
    showToast({
      title: "Consolidated Invoices Downloaded",
      description: "YTD 2026 legal invoicing ledger generated for IOLTA reconciliation.",
      type: "success",
    });
  };

  return (
    <section aria-labelledby="toolkit-heading" className="space-y-6 pt-6">
      <div className="space-y-1">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">
          Law Firm & Institutional Suite
        </span>
        <h2 id="toolkit-heading" className="text-xl sm:text-2xl font-black text-brand-ink tracking-tight font-display">
          Plus the rest of the <span className="italic font-normal font-serif text-text-muted">evidentiary toolkit.</span>
        </h2>
        <p className="text-xs sm:text-sm text-text-muted">
          Enterprise tools engineered to eliminate paralegal formatting hours, streamline IOLTA disbursements, and safeguard filings against RFEs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: IOLTA Client Invoicing */}
        <div className="p-6 sm:p-7 rounded-3xl bg-surface border border-border hover:border-neutral-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-raised border border-border flex items-center justify-center text-brand-ink">
              <Briefcase className="w-5 h-5 text-brand-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-brand-ink">
                IOLTA Trust Accounting & Disbursement Ledger
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Generate itemized single-case billing slips tagged with Client Name and Alien Registration Number (A-Number) for clean trust account reconciliation.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="font-mono text-xs text-text-muted">YTD 2026 Invoices</span>
            <MorphingActionButton
              label="Download Consolidated PDF"
              successLabel="Ledger Exported"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownloadAllInvoices}
              variant="outline"
              size="sm"
            />
          </div>
        </div>

        {/* Card 2: Court Exhibit Compiler */}
        <div className="p-6 sm:p-7 rounded-3xl bg-surface border border-border hover:border-neutral-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-raised border border-border flex items-center justify-center text-brand-ink">
              <FileCheck className="w-5 h-5 text-status-success" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-brand-ink">
                USCIS & EOIR Court Exhibit Packet Compiler
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                1-click compilation of certified translations with Exhibit Cover Tabs (Exhibit A, B, C), 2-hole top punch margins, and sworn 8 CFR statements.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="font-mono text-xs text-text-muted">CounselDesk™ Suite</span>
            <Button asChild size="sm" variant="outline" className="h-9 rounded-xl text-xs font-bold gap-1.5 border-border">
              <Link href="/counsel">
                <span>Open Law Firm Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Card 3: Automated RFE Defense Shield */}
        <div className="p-6 sm:p-7 rounded-3xl bg-surface border border-border hover:border-neutral-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-raised border border-border flex items-center justify-center text-brand-ink">
              <ShieldAlert className="w-5 h-5 text-status-warning" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-brand-ink">
                USCIS Form I-797E RFE Defense Shield
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Upload any government Request for Evidence notice. Our automated parser extracts the objection and issues a compliant Supplemental Sworn Re-Affidavit in under 4 hours.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="font-mono text-xs text-status-warning font-bold">4-Hour Emergency SLA</span>
            <Button asChild size="sm" variant="outline" className="h-9 rounded-xl text-xs font-bold gap-1.5 border-border">
              <Link href="/defense/rfe">
                <span>RFE Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Card 4: Physical Mail Fulfillment */}
        <div className="p-6 sm:p-7 rounded-3xl bg-surface border border-border hover:border-neutral-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-raised border border-border flex items-center justify-center text-brand-ink">
              <Truck className="w-5 h-5 text-brand-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-brand-ink">
                USPS Certified & FedEx Priority Overnight
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Physical embossed raised seals and wet-ink notarial stamps dispatched on legal parchment with DPV-standard address verification and live barcode tracking.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="font-mono text-xs text-text-muted">Tracking & Dispatch</span>
            <Button asChild size="sm" variant="outline" className="h-9 rounded-xl text-xs font-bold gap-1.5 border-border">
              <Link href="/admin/shipping">
                <span>Shipping Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
