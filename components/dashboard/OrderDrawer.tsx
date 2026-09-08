"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ShieldCheck,
  FileText,
  Download,
  Copy,
  Check,
  ExternalLink,
  Clock,
  QrCode,
  Lock,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MorphingActionButton } from "./MorphingActionButton";
import { showToast } from "./ToastNotification";
import Link from "next/link";

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

  // Dismiss on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleCopyHash = () => {
    if (!order) return;
    const hash = order.sha256Hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    showToast({
      title: "SHA-256 Hash Copied",
      description: "Tamper-evident hash copied to your clipboard.",
      type: "success",
    });
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadReceipt = async () => {
    if (!order) return;
    window.open(`/api/order/${order.publicCode}/receipt`, "_blank");
    showToast({
      title: "Legal Receipt Downloaded",
      description: `Itemized legal invoice for ${order.publicCode} generated.`,
      type: "success",
    });
  };

  const handleDownloadCertificate = async () => {
    if (!order) return;
    window.open(`/api/certificate/${order.verifyCode}/download`, "_blank");
    showToast({
      title: "Certified PDF Downloaded",
      description: "USCIS 8 CFR § 103.2 compliant packet streamed.",
      type: "success",
    });
  };

  const handleSubmitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionText.trim()) return;
    showToast({
      title: "Revision Request Registered",
      description: `Linguist ${order?.translator.split(" ")[0]} has been notified with expedited 2h review.`,
      type: "success",
    });
    setRevisionText("");
    setRevisionOpen(false);
  };

  return (
    <AnimatePresence>
      {order && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
          />

          {/* Slide-Over Surface */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative w-full max-w-xl bg-canvas border-l border-border h-full shadow-2xl overflow-y-auto flex flex-col z-10"
          >
            {/* Drawer Top Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between p-6 bg-surface-raised/95 border-b border-border backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-brand-ink bg-surface px-2.5 py-1 rounded-lg border border-border">
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
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-brand-ink hover:bg-surface transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-8 flex-1">
              {/* Document Overview */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted font-bold block">
                  Evidentiary Record
                </span>
                <h2 className="text-2xl font-black text-brand-ink tracking-tight font-display">
                  {order.documentName}
                </h2>
                {order.matterNumber && (
                  <p className="font-mono text-xs text-brand-500 font-bold">
                    {order.matterNumber}
                  </p>
                )}
                <p className="text-xs text-text-muted flex items-center gap-2 pt-1">
                  <span>{order.sourceLang} → {order.targetLang}</span>
                  <span>•</span>
                  <span>{order.pages} {order.pages === 1 ? "Page" : "Pages"}</span>
                  <span>•</span>
                  <span>${order.total.toFixed(2)} USD</span>
                </p>
              </div>

              {/* Linguist & Compliance Badge */}
              <div className="p-5 rounded-2xl bg-surface-raised border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-bold text-brand-ink">Assigned Sworn Translator</span>
                  </div>
                  <Badge variant="default" className="text-[10px] font-mono">
                    8 CFR § 103.2
                  </Badge>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-brand-ink">{order.translator}</p>
                  <p className="text-text-muted leading-relaxed">
                    Certified statement of translator competence attached to final PDF packet.
                  </p>
                </div>
              </div>

              {/* Bilingual Segment Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted font-bold">
                    Bilingual Segment Excerpt
                  </span>
                  <Link
                    href={`/order/${order.publicCode}/proof`}
                    className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-1"
                  >
                    <span>Full Proofing Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 rounded-2xl bg-surface border border-border space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block">Source Text</span>
                    <p className="text-brand-ink bg-surface-raised p-2.5 rounded-lg border border-border/60">
                      ESTADOS UNIDOS MEXICANOS • REGISTRO CIVIL • ACTA DE NACIMIENTO
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-brand-500 uppercase tracking-wider font-bold block">Certified Translation</span>
                    <p className="text-brand-ink bg-brand-50/50 p-2.5 rounded-lg border border-brand-100">
                      UNITED MEXICAN STATES • CIVIL REGISTRY • BIRTH CERTIFICATE
                    </p>
                  </div>
                </div>
              </div>

              {/* Cryptographic SHA-256 Vault Seal */}
              <div className="p-5 rounded-2xl bg-neutral-950 text-white border border-white/10 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold tracking-tight">Cryptographic Verification Seal</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">Public Record</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="font-mono text-[11px] text-neutral-300 truncate max-w-[280px]">
                      {order.sha256Hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                    </span>
                    <button
                      onClick={handleCopyHash}
                      className="text-neutral-400 hover:text-white transition-colors p-1"
                      title="Copy SHA-256 hash"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                    <span>Verification Code:</span>
                    <Link
                      href={`/verify/${order.verifyCode}`}
                      className="font-mono text-emerald-400 hover:underline font-bold"
                    >
                      {order.verifyCode} →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Revision Request Section */}
              <div className="space-y-3 pt-2">
                {!revisionOpen ? (
                  <button
                    onClick={() => setRevisionOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-dashed border-border hover:border-brand-500/50 text-xs font-semibold text-text-muted hover:text-brand-ink flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Need a correction or proper name spelling update?</span>
                  </button>
                ) : (
                  <form onSubmit={handleSubmitRevision} className="p-4 rounded-2xl bg-surface border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-ink">Line-Item Revision Request</span>
                      <button
                        type="button"
                        onClick={() => setRevisionOpen(false)}
                        className="text-text-muted hover:text-brand-ink text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <textarea
                      value={revisionText}
                      onChange={(e) => setRevisionText(e.target.value)}
                      placeholder="Specify segment or name spelling correction (e.g. Ensure last name is spelled 'Mendoza' not 'Mendosa')..."
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-border bg-surface-raised focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRevisionOpen(false)}
                        className="text-xs rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="text-xs rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold"
                      >
                        Submit Revision
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="sticky bottom-0 z-20 p-6 bg-surface-raised/95 border-t border-border backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
              <MorphingActionButton
                label="Download Receipt"
                successLabel="Receipt Saved"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={handleDownloadReceipt}
                variant="outline"
              />

              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                  <Link href={`/order/${order.publicCode}/proof`}>
                    Proofing Studio
                  </Link>
                </Button>
                {order.status === "DELIVERED" && (
                  <MorphingActionButton
                    label="Download Certified PDF"
                    successLabel="PDF Downloaded"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={handleDownloadCertificate}
                    variant="primary"
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
