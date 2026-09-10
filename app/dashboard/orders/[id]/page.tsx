"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  ArrowLeft,
  Download,
  Send,
  RotateCcw,
  Check,
  DollarSign,
  Lock,
  MessageSquare,
  QrCode,
  Sparkles,
  ExternalLink,
  Award,
} from "lucide-react";

const LIFECYCLE_STEPS = [
  { id: "SUBMITTED", label: "Submitted" },
  { id: "UNDER_REVIEW", label: "Intake Review" },
  { id: "SCHEDULED", label: "Scheduled" },
  { id: "IN_TRANSLATION", label: "In Translation" },
  { id: "QUALITY_REVIEW", label: "QA Review" },
  { id: "CLIENT_REVIEW", label: "Client Review" },
  { id: "COMPLETED", label: "Completed" },
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.id as string) || "VL-7X9K2";

  const [order, setOrder] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"timeline" | "files" | "messages" | "invoices">("timeline");

  // Messaging state
  const [newMessage, setNewMessage] = React.useState("");
  const [sendingMsg, setSendingMsg] = React.useState(false);

  // Revision Modal state
  const [isRevisionModalOpen, setIsRevisionModalOpen] = React.useState(false);
  const [revisionNotes, setRevisionNotes] = React.useState("");
  const [submittingRevision, setSubmittingRevision] = React.useState(false);

  // Approval state
  const [approving, setApproving] = React.useState(false);

  const fetchOrder = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (err) {
      console.warn("Failed to fetch order:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !order) return;

    setSendingMsg(true);
    try {
      const res = await fetch(`/api/dashboard/orders/${order.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: newMessage.trim(),
          senderName: order.clientName,
        }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchOrder();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleApprove = async () => {
    if (!order) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/dashboard/orders/${order.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: order.clientName }),
      });
      if (res.ok) {
        fetchOrder();
      }
    } catch (err) {
      console.error("Failed to approve order:", err);
    } finally {
      setApproving(false);
    }
  };

  const handleSubmitRevision = async () => {
    if (!revisionNotes.trim() || !order) return;
    setSubmittingRevision(true);
    try {
      const res = await fetch(`/api/dashboard/orders/${order.id}/revision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: revisionNotes.trim(), clientName: order.clientName }),
      });
      if (res.ok) {
        setIsRevisionModalOpen(false);
        setRevisionNotes("");
        fetchOrder();
      }
    } catch (err) {
      console.error("Failed to submit revision:", err);
    } finally {
      setSubmittingRevision(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas text-text">
        <DashboardNav />
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 flex items-center justify-center">
          <p className="text-xs font-mono text-text-muted animate-pulse">Loading order details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas text-text">
        <DashboardNav />
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 text-center space-y-4">
          <p className="text-sm font-bold text-brand-ink">Order not found</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStepIndex = LIFECYCLE_STEPS.findIndex((s) => s.id === order.status);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <DashboardNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs font-mono text-text-muted hover:text-brand-ink flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Orders
          </Link>
          <Badge variant="outline" className="text-xs font-mono">
            Matter: {order.matterNumber || "Standard Filing"}
          </Badge>
        </div>

        {/* Order Header Summary Banner */}
        <div className="p-6 rounded-3xl border border-border bg-surface-raised space-y-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-black font-mono text-brand-ink">
                  {order.publicCode}
                </span>
                <Badge
                  variant={
                    order.status === "COMPLETED"
                      ? "success"
                      : order.status === "CLIENT_REVIEW" || order.status === "QUOTE_SENT"
                      ? "warning"
                      : "default"
                  }
                  className="text-xs font-mono font-bold uppercase"
                >
                  {order.status.replace(/_/g, " ")}
                </Badge>
                {order.priority === "URGENT" && (
                  <Badge variant="danger" className="text-[10px] font-mono">
                    RUSH PRIORITY
                  </Badge>
                )}
              </div>

              <p className="text-xs text-text-muted">
                {order.sourceLang} ? {order.targetLangs?.join(", ")} ? {order.serviceType} ? {order.pageCount} page(s) ({order.wordCount} words)
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {order.status === "CLIENT_REVIEW" && (
                <>
                  <Button
                    onClick={handleApprove}
                    disabled={approving}
                    size="sm"
                    className="rounded-xl font-bold bg-status-success text-white hover:bg-emerald-600 gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Approve Translation
                  </Button>
                  <Button
                    onClick={() => setIsRevisionModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl font-bold border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Request Revision
                  </Button>
                </>
              )}

              {order.status === "COMPLETED" && order.deliveredFiles?.length > 0 && (
                <Button asChild size="sm" className="rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white gap-1.5">
                  <a href={order.deliveredFiles[0].certifiedPdfUrl} download>
                    <Download className="w-4 h-4" />
                    Download Official Certificate
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* 14-State Stepper Bar */}
          <div className="pt-4 border-t border-border/80">
            <div className="hidden sm:grid grid-cols-7 gap-2">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex > idx || order.status === "COMPLETED";
                const isCurrent = order.status === step.id;
                return (
                  <div key={step.id} className="space-y-1.5 text-center">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPassed
                          ? "bg-status-success"
                          : isCurrent
                          ? "bg-brand-500 ring-2 ring-brand-500/20"
                          : "bg-border"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-mono block ${
                        isCurrent
                          ? "font-bold text-brand-ink"
                          : isPassed
                          ? "text-status-success"
                          : "text-text-muted"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-border/60">
            <div>
              <span className="text-text-muted font-mono text-[11px]">Assigned PM:</span>
              <p className="font-bold text-brand-ink mt-0.5">{order.assignedPM || "Marcus Vance"}</p>
            </div>
            <div>
              <span className="text-text-muted font-mono text-[11px]">Assigned Linguist:</span>
              <p className="font-bold text-brand-ink mt-0.5 truncate">
                {order.assignedTranslator || "ATA Linguist Assigned"}
              </p>
            </div>
            <div>
              <span className="text-text-muted font-mono text-[11px]">Guaranteed Delivery:</span>
              <p className="font-bold text-brand-ink mt-0.5">
                {new Date(order.promisedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <span className="text-text-muted font-mono text-[11px]">Total / Payment:</span>
              <p className="font-bold text-brand-ink mt-0.5 font-mono">
                ${order.total.toFixed(2)} ({order.invoices[0]?.status || "PAID"})
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="border-b border-border flex items-center gap-6 text-xs font-mono">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`pb-3 font-semibold transition-colors relative ${
              activeTab === "timeline" ? "text-brand-ink border-b-2 border-brand-500 font-bold" : "text-text-muted hover:text-brand-ink"
            }`}
          >
            Activity Timeline ({order.timeline?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`pb-3 font-semibold transition-colors relative ${
              activeTab === "files" ? "text-brand-ink border-b-2 border-brand-500 font-bold" : "text-text-muted hover:text-brand-ink"
            }`}
          >
            Documents &amp; Deliveries ({(order.uploadedFiles?.length || 0) + (order.deliveredFiles?.length || 0)})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`pb-3 font-semibold transition-colors relative ${
              activeTab === "messages" ? "text-brand-ink border-b-2 border-brand-500 font-bold" : "text-text-muted hover:text-brand-ink"
            }`}
          >
            Secure Messages ({order.messages?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`pb-3 font-semibold transition-colors relative ${
              activeTab === "invoices" ? "text-brand-ink border-b-2 border-brand-500 font-bold" : "text-text-muted hover:text-brand-ink"
            }`}
          >
            Invoices &amp; Receipts ({order.invoices?.length || 0})
          </button>
        </div>

        {/* TAB 1: TIMELINE */}
        {activeTab === "timeline" && (
          <div className="rounded-2xl border border-border bg-surface-raised p-6 space-y-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              Live Production Milestones &amp; Audit Trail
            </h3>
            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
              {order.timeline?.map((evt: any) => (
                <div key={evt.id} className="flex items-start gap-4 relative">
                  <div className="w-7 h-7 rounded-full bg-surface border-2 border-brand-500 flex items-center justify-center text-brand-500 shrink-0 z-10">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <p className="text-xs font-bold text-brand-ink">{evt.title}</p>
                      <span className="text-[11px] font-mono text-text-muted">
                        {new Date(evt.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">{evt.description}</p>
                    <span className="text-[10px] font-mono text-text-muted block">
                      Actor: {evt.actor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: DOCUMENTS */}
        {activeTab === "files" && (
          <div className="space-y-6">
            {/* Delivered Files */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-500" />
                Delivered Official Translations &amp; Certificates
              </h3>

              {order.deliveredFiles?.length === 0 ? (
                <div className="p-6 rounded-2xl border border-border bg-surface text-center text-xs font-mono text-text-muted">
                  Final certified files will be published here upon QA approval.
                </div>
              ) : (
                order.deliveredFiles?.map((df: any) => (
                  <div
                    key={df.id}
                    className="p-5 rounded-2xl border border-status-success/30 bg-status-success/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-ink">{df.name}</span>
                        <Badge variant="success" className="text-[10px] font-mono">
                          USCIS CERTIFIED
                        </Badge>
                      </div>
                      <p className="text-[11px] font-mono text-text-muted">
                        Verify Code: <strong className="text-brand-ink">{df.verifyCode}</strong> ? SHA-256: {df.sha256.substring(0, 16)}...
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" className="rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white gap-1.5 shadow-sm">
                        <a href={df.certifiedPdfUrl} download>
                          <Download className="w-3.5 h-3.5" />
                          Download PDF
                        </a>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Original Uploaded Files */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Original Uploaded Documents
              </h3>

              {order.uploadedFiles?.map((uf: any) => (
                <div
                  key={uf.id}
                  className="p-4 rounded-xl border border-border bg-surface flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-brand-ink">{uf.name}</p>
                    <p className="text-[11px] font-mono text-text-muted">
                      {(uf.sizeBytes / 1024 / 1024).toFixed(2)} MB ? SHA-256: {uf.sha256.substring(0, 16)}...
                    </p>
                  </div>
                  <Badge variant="default" className="text-[10px] font-mono">
                    {uf.scanStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SECURE MESSAGING */}
        {activeTab === "messages" && (
          <div className="rounded-2xl border border-border bg-surface-raised overflow-hidden flex flex-col shadow-sm">
            <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ink">
                  Direct Order Communication Channel
                </h3>
                <p className="text-[11px] text-text-muted">
                  Message your assigned Project Manager and translation team directly.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                SSL / TLS Encrypted
              </Badge>
            </div>

            {/* Messages Stream */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto bg-canvas/40">
              {order.messages?.length === 0 ? (
                <p className="text-center text-xs font-mono text-text-muted py-6">
                  No messages yet. Start a conversation below.
                </p>
              ) : (
                order.messages?.map((msg: any) => {
                  const isMe = msg.senderRole === "CLIENT";
                  const isSys = msg.senderRole === "SYSTEM";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
                    >
                      <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
                        <span className="font-bold text-brand-ink">{msg.senderName}</span>
                        <span>?</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                          isMe
                            ? "bg-brand-500 text-white rounded-br-xs"
                            : isSys
                            ? "bg-surface border border-border text-text font-mono text-[11px]"
                            : "bg-surface border border-border text-text rounded-bl-xs"
                        }`}
                      >
                        {msg.body}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-surface flex gap-3">
              <input
                type="text"
                placeholder="Type a message or instruction for your linguist..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 h-11 px-4 rounded-xl border border-border bg-canvas text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Button
                type="submit"
                disabled={sendingMsg || !newMessage.trim()}
                className="rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white gap-2 px-5"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </Button>
            </form>
          </div>
        )}

        {/* TAB 4: INVOICES */}
        {activeTab === "invoices" && (
          <div className="rounded-2xl border border-border bg-surface-raised p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              Invoices &amp; Payment Receipts
            </h3>

            {order.invoices?.map((inv: any) => (
              <div
                key={inv.id}
                className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-ink">{inv.invoiceNumber}</span>
                    <Badge variant={inv.status === "PAID" ? "success" : "warning"} className="text-[10px] font-mono">
                      {inv.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-text-muted font-mono">
                    Issued: {new Date(inv.issuedAt).toLocaleDateString()} ? Due: {new Date(inv.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono font-black text-sm text-brand-ink">${inv.amount.toFixed(2)} USD</span>
                  <Button asChild variant="outline" size="sm" className="rounded-lg h-8 gap-1.5 text-xs">
                    <Link href={`/dashboard/billing`}>
                      <FileText className="w-3.5 h-3.5" />
                      View Invoice
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REVISION REQUEST MODAL */}
        {isRevisionModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-surface-raised rounded-3xl border border-border p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  Request Translation Revision
                </h3>
                <button
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="text-text-muted hover:text-brand-ink text-xs font-mono p-1"
                >
                  ?
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-text-muted leading-relaxed">
                  Specify the exact adjustments needed (e.g. spelling of proper nouns, transliteration of names, or stamp transcription). Revisions are processed with priority turnaround.
                </p>
                <Textarea
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Example: On Page 1, line 4, please spell the surname as 'Saitoh' instead of 'Saito' to match the US visa petition..."
                  className="h-28 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={submittingRevision || !revisionNotes.trim()}
                  onClick={handleSubmitRevision}
                  className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                >
                  {submittingRevision ? "Submitting..." : "Submit Revision Request"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
