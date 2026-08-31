"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  FolderLock,
  FileText,
  ShieldCheck,
  Lock,
  Plus,
  ArrowRight,
  Download,
  Trash2,
  Clock,
} from "lucide-react";

const MOCK_VAULT_DOCS = [
  {
    id: "doc-1",
    name: "Acta_Nacimiento_Original_Scan.pdf",
    type: "Birth Certificate",
    size: "1.4 MB",
    uploadedAt: "August 31, 2026",
    daysRemaining: 90,
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    encryption: "AES-256-GCM",
  },
  {
    id: "doc-2",
    name: "Titulo_Universitario_Degree.pdf",
    type: "Academic Diploma",
    size: "2.1 MB",
    uploadedAt: "August 28, 2026",
    daysRemaining: 87,
    sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    encryption: "AES-256-GCM",
  },
];

export default function DocumentVaultPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <DashboardNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-mono font-bold">
                <FolderLock className="w-3.5 h-3.5 mr-1" />
                256-Bit Encrypted Vault
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-ink tracking-tight">
              Personal Document Vault
            </h1>
            <p className="text-sm text-text-muted">
              Securely stored original scans for instant one-click translation re-orders.
            </p>
          </div>

          <Button asChild size="lg" className="gap-2 rounded-2xl font-bold shadow-md">
            <Link href="/order/triage">
              <Plus className="w-5 h-5" />
              Upload New Document
            </Link>
          </Button>
        </div>

        {/* Security & Retention Banner (§11) */}
        <div className="p-6 rounded-[28px] bg-gradient-panel border border-brand-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-brand-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-brand-ink text-sm">
                Zero-Knowledge AES-256 Storage & Auto-Purge Policy
              </p>
              <p>
                Original scans are automatically purged 90 days after delivery unless extended. Decryption keys are strictly ephemeral and never stored in plaintext.
              </p>
            </div>
          </div>
          <span className="font-mono text-status-success font-bold shrink-0 bg-surface-raised px-3 py-1.5 rounded-xl border border-border">
            SSE-KMS Active
          </span>
        </div>

        {/* Vault Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_VAULT_DOCS.map((doc) => (
            <Card
              key={doc.id}
              className="p-7 rounded-[32px] bg-surface-raised border border-border hover:border-brand-500/50 hover:shadow-md transition-all space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="text-[11px] font-mono">
                    {doc.encryption}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-brand-ink truncate">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {doc.type} • {doc.size}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border space-y-1 font-mono text-[10px]">
                  <span className="text-text-muted block">SHA-256 Fingerprint:</span>
                  <span className="text-brand-ink break-all block">{doc.sha256}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock className="w-3.5 h-3.5 text-brand-500" />
                  <span>Auto-purges in <strong className="text-brand-ink font-bold">{doc.daysRemaining} days</strong></span>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                <Button asChild size="sm" className="gap-1.5 rounded-xl text-xs font-bold flex-1">
                  <Link href={`/order/triage?vaultDoc=${doc.id}`}>
                    Re-Translate
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>

                <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold" title="Download original">
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
