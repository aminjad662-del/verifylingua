"use client";

import * as React from "react";
import { Lock, CheckCircle2, ShieldCheck, History, Award, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LockedTermItem {
  term: string;
  kind: string;
  matched: boolean;
}

export interface AuditEventItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
}

export interface ComplianceInspectorRailProps {
  lockedTerms: LockedTermItem[];
  assignedTranslator?: {
    name?: string;
    credentials?: string;
    notaryCommission?: string;
  };
  auditEvents?: AuditEventItem[];
  publicCode: string;
}

export function ComplianceInspectorRail({
  lockedTerms,
  assignedTranslator,
  auditEvents = [],
  publicCode,
}: ComplianceInspectorRailProps) {
  const [activeTab, setActiveTab] = React.useState<"locks" | "credentials" | "audit">("locks");

  const defaultAuditTrail: AuditEventItem[] = [
    {
      id: "ev-1",
      timestamp: "10:14:02 AM",
      actor: "OCR Engine (300 DPI)",
      action: "Spatial vector extraction completed with 99.4% confidence",
    },
    {
      id: "ev-2",
      timestamp: "10:14:05 AM",
      actor: "Glossary Agent",
      action: `Locked ${lockedTerms.length} USCIS vital identity terms`,
    },
    {
      id: "ev-3",
      timestamp: "10:14:12 AM",
      actor: "CAT Workspace",
      action: "Assigned to Certified Legal Linguist for human verification",
    },
    ...auditEvents,
  ];

  return (
    <div className="rounded-[var(--r-xl)] bg-surface-raised/60 border border-border/80 p-1.5 md:p-2 shadow-xs flex flex-col space-y-3">
      {/* Tab Switcher */}
      <div className="grid grid-cols-3 gap-1 bg-surface p-1 rounded-xl border border-border">
        <button
          onClick={() => setActiveTab("locks")}
          className={cn(
            "min-h-[44px] flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] touch-manipulation",
            activeTab === "locks"
              ? "bg-surface-raised text-brand-ink shadow-2xs border border-border"
              : "text-text-muted hover:text-brand-ink"
          )}
        >
          <Lock className="w-3.5 h-3.5 text-signal-accent" />
          <span className="hidden sm:inline">Locks</span>
        </button>

        <button
          onClick={() => setActiveTab("credentials")}
          className={cn(
            "min-h-[44px] flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] touch-manipulation",
            activeTab === "credentials"
              ? "bg-surface-raised text-brand-ink shadow-2xs border border-border"
              : "text-text-muted hover:text-brand-ink"
          )}
        >
          <Award className="w-3.5 h-3.5 text-court-emerald" />
          <span className="hidden sm:inline">Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={cn(
            "min-h-[44px] flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] touch-manipulation",
            activeTab === "audit"
              ? "bg-surface-raised text-brand-ink shadow-2xs border border-border"
              : "text-text-muted hover:text-brand-ink"
          )}
        >
          <History className="w-3.5 h-3.5 text-brand-500" />
          <span className="hidden sm:inline">Audit</span>
        </button>
      </div>

      {/* Tab 1: Identity Locks */}
      {activeTab === "locks" && (
        <div className="rounded-[calc(var(--r-xl)-0.375rem)] md:rounded-[calc(var(--r-xl)-0.5rem)] bg-surface border border-border/40 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border text-xs font-mono">
            <span className="font-bold text-brand-ink">USCIS Identity Locks</span>
            <span className="text-[10px] text-court-emerald font-bold bg-court-emerald/10 px-2 py-0.5 rounded border border-court-emerald/30">
              Active ({lockedTerms.length})
            </span>
          </div>

          <div className="space-y-2">
            {lockedTerms.map((item, idx) => (
              <div
                key={`${item.term}-${idx}`}
                className="p-2.5 rounded-xl bg-surface-raised border border-border text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-text-subtle">
                  <span className="font-bold text-signal-accent">{item.kind}</span>
                  <span className="flex items-center gap-1 text-court-emerald font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    LOCKED
                  </span>
                </div>
                <p className="font-mono font-bold text-brand-ink text-xs truncate select-all">
                  {item.term}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-text-subtle leading-relaxed pt-1">
            Entities protected against spelling, accent, or formatting deviations under 8 CFR § 204.2.
          </p>
        </div>
      )}

      {/* Tab 2: Certifier Credentials */}
      {activeTab === "credentials" && (
        <div className="rounded-[calc(var(--r-xl)-0.375rem)] md:rounded-[calc(var(--r-xl)-0.5rem)] bg-surface border border-border/40 p-4 space-y-3.5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border flex items-center justify-center font-mono font-bold text-brand-ink text-sm shrink-0 shadow-2xs">
              {assignedTranslator?.name?.split(" ").map((n) => n[0]).join("") || "ATA"}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-brand-ink text-xs truncate">
                {assignedTranslator?.name || "Elena Volkova"}
              </h4>
              <p className="text-[11px] text-text-muted truncate">
                {assignedTranslator?.credentials || "ATA Member No. 271892"}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-surface-raised border border-border space-y-0.5">
              <span className="text-[10px] text-text-subtle uppercase block">Notary Commission</span>
              <span className="font-bold text-brand-ink text-xs">
                {assignedTranslator?.notaryCommission || "State of Florida • Commission No. GG-918231"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-raised border border-border space-y-0.5">
              <span className="text-[10px] text-text-subtle uppercase block">Statutory Mandate</span>
              <span className="font-bold text-brand-ink text-xs">
                8 CFR § 204.2(a)(1)(iii)(B) Sworn Standard
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Immutable Audit Trail */}
      {activeTab === "audit" && (
        <div className="rounded-[calc(var(--r-xl)-0.375rem)] md:rounded-[calc(var(--r-xl)-0.5rem)] bg-surface border border-border/40 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border text-xs font-mono">
            <span className="font-bold text-brand-ink">Audit Event Trail</span>
            <span className="text-[10px] text-text-subtle font-mono">{publicCode}</span>
          </div>

          <div className="space-y-2.5">
            {defaultAuditTrail.map((ev) => (
              <div
                key={ev.id}
                className="p-2 rounded-xl bg-surface-raised border border-border text-xs space-y-0.5"
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-text-subtle">
                  <span className="font-bold text-brand-ink">{ev.actor}</span>
                  <span>{ev.timestamp}</span>
                </div>
                <p className="text-[11px] text-text-muted leading-tight">{ev.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
