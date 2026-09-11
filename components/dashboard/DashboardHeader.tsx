"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  FileUp,
  Search,
  ShieldCheck,
  Briefcase,
  Clock,
  CheckCircle2,
  FolderLock,
  Lock,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Button } from "@/components/ui/button";
import { OrderDetail } from "./OrderDrawer";

interface DashboardHeaderProps {
  user?: { name: string | null; email: string; organizationName?: string } | null;
  orders?: OrderDetail[];
  onTrackFiling?: () => void;
}

export function DashboardHeader({ user, orders = [], onTrackFiling }: DashboardHeaderProps) {
  const activeCount = orders.filter((o) => o.status !== "DELIVERED" && o.status !== "COMPLETED").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED" || o.status === "COMPLETED").length;
  const totalPages = orders.reduce((acc, o) => acc + (o.pages || 1), 0);
  const totalDocs = orders.length;

  const clientGreeting = user?.name
    ? `Welcome back, ${user.name}`
    : "Welcome to your Evidence Vault";

  return (
    <div className="space-y-6">
      {/* Top Application Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-border/80">
        <div className="space-y-2">
          {/* Status & Compliance Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border text-[11px] font-mono font-bold text-brand-ink">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>USCIS 8 CFR § 103.2 Vault Active</span>
            </div>
            <span className="text-text-muted text-xs hidden sm:inline">•</span>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface border border-border text-[11px] font-mono text-text-muted">
              <ShieldCheck className="w-3 h-3 text-brand-500" />
              <span>ATA Member ID: 271892</span>
            </div>
            <span className="text-text-muted text-xs hidden sm:inline">•</span>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface border border-border text-[11px] font-mono text-text-muted">
              <Lock className="w-3 h-3 text-brand-500" />
              <span>256-Bit SHA Vault</span>
            </div>
          </div>

          {/* Heading and Role context */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-brand-500 font-bold">
              Client Translation Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-brand-ink font-display">
              {clientGreeting}
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
              Track active certified translation pipelines, review evidentiary filings for USCIS and federal courts, and manage cryptographic seal verifications.
            </p>
          </div>
        </div>

        {/* Immediate Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onTrackFiling}
            className="h-10 px-3.5 rounded-xl text-xs font-bold gap-1.5 border-border bg-surface hover:bg-surface-raised text-brand-ink shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-text-muted" />
            <span>Track Filing</span>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-10 px-3.5 rounded-xl text-xs font-bold gap-1.5 border-border bg-surface hover:bg-surface-raised text-brand-ink shadow-sm"
          >
            <Link href="/order/triage">
              <FileUp className="w-3.5 h-3.5 text-brand-500" />
              <span>Upload Exhibit</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-10 px-3.5 rounded-xl text-xs font-bold gap-1.5 border-border bg-surface hover:bg-surface-raised text-brand-ink shadow-sm"
          >
            <Link href="/counsel">
              <Briefcase className="w-3.5 h-3.5 text-brand-500" />
              <span>CounselDesk™</span>
            </Link>
          </Button>

          <MagneticButton maxPull={7}>
            <Button
              asChild
              size="sm"
              className="h-10 px-4 rounded-xl font-black text-xs gap-2 bg-neutral-950 hover:bg-neutral-800 text-white shadow-sm"
            >
              <Link href="/order/triage">
                <Plus className="w-3.5 h-3.5" />
                <span>+ Start New Translation</span>
              </Link>
            </Button>
          </MagneticButton>
        </div>
      </div>

      {/* Core Quick Stats Grid - High-Density, Crisp 1px Borders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Stat 1: Active Filings */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
              Active Filings
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-brand-ink font-display tracking-tight">
              {activeCount}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              In translation & verification
            </p>
          </div>
        </div>

        {/* Stat 2: Certified & Delivered */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
              Certified & Delivered
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-brand-ink font-display tracking-tight">
              {deliveredCount}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              Sealed & ready for submission
            </p>
          </div>
        </div>

        {/* Stat 3: Encrypted Documents in Vault */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
              Encrypted Documents in Vault
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FolderLock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-brand-ink font-display tracking-tight">
              {totalPages > 0 ? `${totalPages} Pages` : `${totalDocs} Records`}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              Cryptographically signed storage
            </p>
          </div>
        </div>

        {/* Stat 4: 100% USCIS Acceptance */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
              100% USCIS Acceptance
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-brand-ink font-display tracking-tight">
              100%
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              Guaranteed 8 CFR § 103.2 compliance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
