"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Clock,
  Plus,
  ArrowRight,
  QrCode,
  Download,
} from "lucide-react";

const MOCK_ORDERS = [
  {
    id: "ord-1",
    publicCode: "VL-7X9K2",
    documentName: "Acta de Nacimiento (Birth Certificate)",
    sourceLang: "Spanish",
    targetLang: "English",
    status: "TRANSLATING",
    statusLabel: "Translating",
    pages: 1,
    total: 24.95,
    promisedAt: "Tomorrow at 9:00 AM EST",
    translator: "Elena V. (ATA No. 271892)",
    verifyCode: "CERT-7X9K2-4821",
  },
  {
    id: "ord-2",
    publicCode: "VL-3M8Q1",
    documentName: "Título Universitario (Bachelor Diploma)",
    sourceLang: "Spanish",
    targetLang: "English",
    status: "DELIVERED",
    statusLabel: "Certified & Delivered",
    pages: 2,
    total: 49.90,
    promisedAt: "Delivered Aug 28, 2026",
    translator: "Carlos M. (ATA No. 194820)",
    verifyCode: "CERT-3M8Q1-9014",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <DashboardNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Welcome & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-brand-ink tracking-tight">
              Translation Dashboard
            </h1>
            <p className="text-sm text-text-muted">
              Manage your certified translation orders, track progress, and download signed certificates.
            </p>
          </div>

          <Button asChild size="lg" className="gap-2 rounded-2xl font-bold shadow-md">
            <Link href="/order/triage">
              <Plus className="w-5 h-5" />
              Start New Translation
            </Link>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-surface-raised border border-border space-y-2 shadow-sm">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              Active Translations
            </span>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-brand-ink">1</p>
              <Badge variant="default" className="text-[11px]">Guaranteed 24h</Badge>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface-raised border border-border space-y-2 shadow-sm">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              Delivered Certificates
            </span>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-brand-ink">1</p>
              <Badge variant="success" className="text-[11px]">100% USCIS Accepted</Badge>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface-raised border border-border space-y-2 shadow-sm">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              Encrypted Documents in Vault
            </span>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-brand-ink">2</p>
              <span className="text-xs font-mono text-status-success font-bold">256-bit AES</span>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <Card className="p-6 md:p-8 rounded-[32px] bg-surface-raised border border-border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-ink">
              Recent Translation Orders
            </h2>
            <span className="text-xs font-mono text-text-muted">
              Showing {MOCK_ORDERS.length} Orders
            </span>
          </div>

          <div className="space-y-4">
            {MOCK_ORDERS.map((ord) => {
              const isDelivered = ord.status === "DELIVERED";
              return (
                <div
                  key={ord.id}
                  className="p-6 rounded-2xl border border-border bg-surface hover:bg-surface-raised hover:border-brand-500/40 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-brand-500 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-100">
                        {ord.publicCode}
                      </span>
                      <Badge
                        variant={isDelivered ? "success" : "default"}
                        className="text-[11px] py-0.5"
                      >
                        {ord.statusLabel}
                      </Badge>
                      <span className="text-xs text-text-muted font-mono">
                        {ord.sourceLang} → {ord.targetLang}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-brand-ink">
                      {ord.documentName}
                    </h3>

                    <p className="text-xs text-text-muted flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-brand-500" />
                      <span>{isDelivered ? ord.promisedAt : `Guaranteed ready by: ${ord.promisedAt}`}</span>
                      <span>•</span>
                      <span>Linguist: {ord.translator}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isDelivered ? (
                      <>
                        <Button asChild size="sm" variant="outline" className="gap-1.5 rounded-xl text-xs font-bold">
                          <Link href={`/verify/${ord.verifyCode}`}>
                            <QrCode className="w-3.5 h-3.5 text-brand-500" />
                            Verify Record
                          </Link>
                        </Button>
                        <Button asChild size="sm" className="gap-1.5 rounded-xl text-xs font-bold shadow-sm">
                          <a
                            href={`/api/certificate/${ord.verifyCode}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download PDF
                          </a>
                        </Button>
                      </>
                    ) : (
                      <Button asChild size="sm" className="gap-1.5 rounded-xl text-xs font-bold shadow-sm">
                        <Link href={`/order/${ord.publicCode}`}>
                          View Live Tracker
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
