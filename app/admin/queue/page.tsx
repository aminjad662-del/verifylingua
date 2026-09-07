"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  FileText,
  User,
  ArrowRight,
  Filter,
  Check,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const QUEUE_ORDERS = [
  {
    id: "ord-1",
    publicCode: "VL-7X9K2",
    documentType: "Birth Certificate / Registro Civil",
    sourceLang: "Spanish",
    targetLang: "English",
    pages: 1,
    words: 240,
    status: "TRANSLATING",
    statusLabel: "In Translation",
    promisedAt: "Tomorrow at 9:00 AM EST",
    timeLeft: "18h 30m remaining",
    assignedTo: "Elena V. (You)",
    urgent: false,
    receivingParty: "USCIS",
  },
  {
    id: "ord-2",
    publicCode: "VL-9P4W8",
    documentType: "University Transcript (3 Pages)",
    sourceLang: "French",
    targetLang: "English",
    pages: 3,
    words: 720,
    status: "UNASSIGNED",
    statusLabel: "Available to Claim",
    promisedAt: "Tomorrow at 2:00 PM EST",
    timeLeft: "22h 15m remaining",
    assignedTo: "Unassigned",
    urgent: true,
    receivingParty: "University (WES)",
  },
  {
    id: "ord-3",
    publicCode: "VL-2K6M1",
    documentType: "Marriage Certificate",
    sourceLang: "Arabic",
    targetLang: "English",
    pages: 1,
    words: 180,
    status: "QA_READY",
    statusLabel: "QA Verification Ready",
    promisedAt: "Today at 6:00 PM EST",
    timeLeft: "3h 45m remaining",
    assignedTo: "Tariq A.",
    urgent: true,
    receivingParty: "USCIS",
  },
];

export default function AdminQueuePage() {
  const [filter, setFilter] = React.useState<string>("ALL");

  const filteredOrders = QUEUE_ORDERS.filter((ord) => {
    if (filter === "ALL") return true;
    if (filter === "UNASSIGNED") return ord.status === "UNASSIGNED";
    if (filter === "TRANSLATING") return ord.status === "TRANSLATING";
    if (filter === "QA_READY") return ord.status === "QA_READY";
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface-raised/95 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-500 text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-brand-ink">
                Verify<span className="text-brand-500">Lingua</span>
              </span>
            </Link>
            <Badge variant="default" className="text-[11px] font-mono">
              Translator & Admin Cockpit (§5.5)
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-xl gap-1.5 border-border">
              <Link href="/admin/shipping">
                Shipping Fulfillment
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-xl gap-1.5 border-border">
              <Link href="/translator/workbench/VL-DEMO1">
                Linguist Studio™
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted pl-2 border-l border-border">
              <span className="w-2 h-2 rounded-full bg-status-success inline-block"></span>
              <span>Elena V. (ATA No. 271892)</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Workspace Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-brand-ink tracking-tight">
              Certified Translation Queue
            </h1>
            <p className="text-sm text-text-muted">
              Claim incoming certified orders, access the side-by-side translation editor, and run USCIS QA rejection checks.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-border">
            {[
              { id: "ALL", label: "All Queue" },
              { id: "UNASSIGNED", label: "Available to Claim" },
              { id: "TRANSLATING", label: "My In-Progress" },
              { id: "QA_READY", label: "QA Check" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === tab.id
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-text-muted hover:text-brand-ink hover:bg-surface-raised"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Queue Table */}
        <Card className="p-6 md:p-8 rounded-[32px] bg-surface-raised border border-border shadow-sm space-y-6">
          <div className="space-y-4">
            {filteredOrders.map((ord) => {
              const isUnassigned = ord.status === "UNASSIGNED";
              const isQA = ord.status === "QA_READY";

              return (
                <div
                  key={ord.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                    ord.urgent
                      ? "border-status-warning/40 bg-status-warning/5"
                      : "border-border bg-surface hover:bg-surface-raised hover:border-brand-500/40"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-brand-500 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-100">
                        {ord.publicCode}
                      </span>
                      <Badge
                        variant={isUnassigned ? "secondary" : isQA ? "warning" : "default"}
                        className="text-[11px] py-0.5"
                      >
                        {ord.statusLabel}
                      </Badge>
                      <Badge variant="default" className="text-[10px] py-0">
                        {ord.receivingParty} Spec
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold text-brand-ink">
                      {ord.documentType}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted font-mono">
                      <span>{ord.sourceLang} → {ord.targetLang}</span>
                      <span>•</span>
                      <span>{ord.pages} Page ({ord.words} Words)</span>
                      <span>•</span>
                      <span className={ord.urgent ? "text-status-warning font-bold flex items-center gap-1" : "text-brand-500 font-semibold"}>
                        <Clock className="w-3.5 h-3.5" />
                        {ord.timeLeft}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isUnassigned ? (
                      <Button asChild size="sm" className="gap-1.5 rounded-xl text-xs font-bold shadow-md">
                        <Link href={`/translator/workbench/${ord.publicCode}?claim=true`}>
                          <Check className="w-3.5 h-3.5" />
                          Claim Translation ($24.95/pg)
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button asChild variant="outline" size="sm" className="gap-1 rounded-xl text-xs font-bold border-border">
                          <Link href={`/admin/orders/${ord.publicCode}`}>
                            Classic
                          </Link>
                        </Button>
                        <Button asChild size="sm" className="gap-1.5 rounded-xl text-xs font-bold shadow-sm bg-brand-500 hover:bg-brand-600 text-white">
                          <Link href={`/translator/workbench/${ord.publicCode}`}>
                            CAT Studio
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </div>
  );
}
