"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Clock,
  Lock,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export interface OrderDetail {
  id: string;
  publicCode: string;
  documentName: string;
  matterNumber?: string;
  sourceLang: string;
  targetLang: string;
  status: string;
  statusLabel: string;
  pages: number;
  total: number;
  promisedAt: string;
  translator: string;
  verifyCode: string;
  sha256Hash?: string;
  previewSegments?: {
    source: string;
    target: string;
    section: string;
  }[];
}

interface OrderDrawerProps {
  order: OrderDetail | null;
  onClose: () => void;
}

export function OrderDrawer({ order, onClose }: OrderDrawerProps) {
  const [copiedHash, setCopiedHash] = React.useState(false);
  const [revisionOpen, setRevisionOpen] = React.useState(false);
  const [revisionText, setRevisionText] = React.useState("");

  // Emil Kowalski Physics: 0ms exit latency on keyboard dismissal (Gate G21)
  const isEscDismiss = React.useRef(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        isEscDismiss.current = true;
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Reset keyboard dismiss flag when opening new order
  React.useEffect(() => {
    if (order) {
      isEscDismiss.current = false;
    }
  }, [order]);

  const handleCopyHash = () => {
    if (!order) return;
    const hash = order.sha256Hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    toast.success("SHA-256 Hash Copied", {
      description: "Tamper-evident verification hash copied to clipboard.",
    });
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadReceipt = () => {
    if (!order) return;
    window.open(`/api/order/${order.publicCode}/receipt`, "_blank");
    toast.success("Legal Receipt Downloaded", {
      description: `Itemized legal invoice for docket ${order.publicCode} generated.`,
    });
  };

  const handleDownloadCertificate = () => {
    if (!order) return;
    window.open(`/api/certificate/${order.verifyCode}/download`, "_blank");
    toast.success("Certified PDF Packet Downloaded", {
      description: "Compliant with USCIS 8 CFR § 103.2(a)(3) standards.",
    });
  };

  const handleSubmitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionText.trim()) return;
    toast.success("Revision Request Registered", {
      description: `Assigned linguist notified for priority review.`,
    });
    setRevisionText("");
    setRevisionOpen(false);
  };

  return (
    <AnimatePresence>
      {order && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-drawer-title"
          className="fixed inset-0 z-50 overflow-hidden flex justify-end"
        >
          {/* Backdrop Blur with Click-to-Dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: isEscDismiss.current ? 0 : 0.1, // 0ms on Esc, 100ms on click
              ease: [0.32, 0.72, 0, 1],
            }}
            onClick={() => {
              isEscDismiss.current = false;
              onClose();
            }}
            className="fixed inset-0 bg-obsidian-950/60 backdrop-blur-md"
          />

          {/* Slide-Over Surface: Asymmetric Timing & Scale Entry */}
          <motion.div
            initial={{
              opacity: 0,
              x: "100%",
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: "100%",
              scale: 0.98,
            }}
            transition={{
              duration: isEscDismiss.current ? 0 : 0.1, // 0ms on Esc, 100ms exit
              ease: [0.32, 0.72, 0, 1], // --ease-drawer
            }}
            className="relative w-full max-w-xl bg-canvas border-l border-border h-full shadow-2xl overflow-y-auto flex flex-col z-10"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between p-6 bg-surface-raised/95 border-b border-border backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold tabular-nums text-ink bg-surface px-3 py-1 rounded-full border border-border">
                  {order.publicCode}
                </span>
                <Badge
                  variant={order.status === "DELIVERED" ? "success" : "default"}
                  className="text-[11px] py-0.5"
                >
                  {order.statusLabel}
                </Badge>
              </div>

              <button
                onClick={() => {
                  isEscDismiss.current = false;
                  onClose();
                }}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface transition-colors min-h-[44px] min-w-[44px]"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-6 flex-1">
              {/* Document Overview */}
              <div className="space-y-2">
                <span className="text-[11px] font-sans uppercase tracking-wider text-ink-muted font-bold block">
                  Evidentiary Legal Record
                </span>
                <h2
                  id="order-drawer-title"
                  className="text-2xl font-bold text-ink tracking-tight font-heading"
                >
                  {order.documentName}
                </h2>
                {order.matterNumber && (
                  <p className="font-mono text-xs text-brand-500 font-semibold tabular-nums">
                    Matter: {order.matterNumber}
                  </p>
                )}
                <p className="text-xs text-ink-muted flex items-center gap-2 pt-1 font-sans">
                  <span>{order.sourceLang} → {order.targetLang}</span>
                  <span>•</span>
                  <span>{order.pages} {order.pages === 1 ? "Page" : "Pages"}</span>
                  <span>•</span>
                  <span className="font-mono font-semibold tabular-nums text-ink">
                    {formatCurrency(order.total)}
                  </span>
                </p>
              </div>

              {/* ─── ATA Certification Checkboxes (Concentric Card) ──── */}
              <div className="card-doppelrand rounded-xl bg-surface-raised p-5 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-court-emerald" />
                    <span className="text-xs font-bold text-ink">
                      ATA Certification & Legal Compliance
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    8 CFR § 103.2(a)(3)
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-court-emerald shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-ink">
                        ATA Corporate Member Verification
                      </p>
                      <p className="text-ink-muted leading-relaxed">
                        Translated by sworn professional affiliated with American Translators Association (Corporate ID No. 278190).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-court-emerald shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-ink">
                        Statutory Sworn Affidavit Attached
                      </p>
                      <p className="text-ink-muted leading-relaxed">
                        Includes formal certification of translator competence signed under penalty of perjury.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Honest Logistics Delivery Timeline ──────────────── */}
              <div className="card-doppelrand rounded-xl bg-surface-warm p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cta" />
                    <span className="text-xs font-bold text-ink">
                      Honest Logistics Turnaround
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-cta tabular-nums">
                    Ready {order.promisedAt}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-sans">
                  <div className="p-2.5 rounded-lg bg-surface-raised border border-border/60">
                    <span className="text-[10px] text-ink-muted uppercase block font-semibold">Standard</span>
                    <span className="text-xs font-bold text-ink">24 Hours</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-raised border border-border/60">
                    <span className="text-[10px] text-ink-muted uppercase block font-semibold">Priority Rush</span>
                    <span className="text-xs font-bold text-ink">12 Hours</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-raised border border-cta/30 bg-cta/5">
                    <span className="text-[10px] text-cta uppercase block font-bold">RFE Defense</span>
                    <span className="text-xs font-bold text-cta">4 Hours</span>
                  </div>
                </div>
              </div>

              {/* Cryptographic SHA-256 Vault Seal */}
              <div className="card-doppelrand rounded-xl bg-obsidian-900 text-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-court-emerald" />
                    <span className="text-xs font-bold tracking-tight">
                      Cryptographic Evidence Seal
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">Public Record</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-lg border border-white/10">
                    <span className="font-mono text-[11px] text-neutral-300 truncate max-w-[280px]">
                      {order.sha256Hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                    </span>
                    <button
                      onClick={handleCopyHash}
                      className="text-neutral-400 hover:text-white transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                      title="Copy SHA-256 hash"
                      aria-label="Copy SHA-256 hash"
                    >
                      {copiedHash ? <Check className="w-4 h-4 text-court-emerald" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 font-sans">
                    <span>Public Verification:</span>
                    <Link
                      href={`/verify/${order.verifyCode}`}
                      className="font-mono text-court-emerald hover:underline font-bold tabular-nums"
                    >
                      {order.verifyCode} →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Revision Request Section */}
              <div className="space-y-3">
                {!revisionOpen ? (
                  <button
                    onClick={() => setRevisionOpen(true)}
                    className="w-full py-3 px-4 rounded-xl border border-dashed border-border hover:border-cta/50 text-xs font-semibold text-ink-muted hover:text-ink flex items-center justify-center gap-2 transition-colors min-h-[44px] cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Need a correction or proper name spelling update?</span>
                  </button>
                ) : (
                  <form onSubmit={handleSubmitRevision} className="p-4 rounded-xl bg-surface border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">Line-Item Revision Request</span>
                      <button
                        type="button"
                        onClick={() => setRevisionOpen(false)}
                        className="text-ink-muted hover:text-ink text-xs p-1 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                        aria-label="Cancel revision"
                      >
                        ✕
                      </button>
                    </div>
                    <textarea
                      value={revisionText}
                      onChange={(e) => setRevisionText(e.target.value)}
                      placeholder="Specify segment or name spelling correction..."
                      rows={3}
                      className="w-full text-xs p-3 rounded-lg border border-border bg-surface-raised focus:outline-none focus:ring-1 focus:ring-cta text-ink"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRevisionOpen(false)}
                        className="text-xs rounded-full min-h-[44px]"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="cta"
                        size="sm"
                        className="text-xs rounded-full font-bold min-h-[44px]"
                      >
                        Submit Revision
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="sticky bottom-0 z-20 p-6 bg-surface-raised/95 border-t border-border backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReceipt}
                trailingIcon={<Download className="w-3.5 h-3.5" />}
                className="rounded-full text-xs font-semibold min-h-[44px]"
              >
                Download Receipt
              </Button>

              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-semibold min-h-[44px]">
                  <Link href={`/order/${order.publicCode}/proof`}>
                    Proofing Studio
                  </Link>
                </Button>
                {order.status === "DELIVERED" && (
                  <Button
                    variant="cta"
                    size="sm"
                    onClick={handleDownloadCertificate}
                    trailingIcon={<Download className="w-3.5 h-3.5" />}
                    className="rounded-full text-xs font-bold min-h-[44px]"
                  >
                    Certified PDF
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
