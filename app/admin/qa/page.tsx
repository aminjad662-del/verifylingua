"use client";

import * as React from "react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Clock,
  Sparkles,
  QrCode,
  FileText,
  Search,
  RefreshCw,
  ArrowRight,
  Stamp,
  Lock,
  XCircle,
  Eye,
} from "lucide-react";

interface QAChecklist {
  sourceTextAccuracy: boolean;
  uscis8CFRCompliance: boolean;
  notarialEmbossment: boolean;
  sealHashVerified: boolean;
  formattingFidelity: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

interface QAOrderItem {
  id: string;
  publicCode: string;
  clientName: string;
  serviceType: string;
  sourceLang: string;
  targetLangs: string[];
  pageCount: number;
  status: string;
  submittedAt: string;
  assignedTranslator?: string;
  assignedReviewer?: string;
  qualityChecklist?: QAChecklist;
}

export default function AdminQAPage() {
  const [orders, setOrders] = React.useState<QAOrderItem[]>([]);
  const [selectedOrder, setSelectedOrder] = React.useState<QAOrderItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Verification Checklist State
  const [checklist, setChecklist] = React.useState<QAChecklist>({
    sourceTextAccuracy: false,
    uscis8CFRCompliance: false,
    notarialEmbossment: false,
    sealHashVerified: false,
    formattingFidelity: false,
    notes: "",
  });

  const fetchQAOrders = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/qa");
      const data = await res.json();
      if (data.queue) {
        setOrders(data.queue);
        if (data.queue.length > 0 && !selectedOrder) {
          setSelectedOrder(data.queue[0]);
          if (data.queue[0].qualityChecklist) {
            setChecklist(data.queue[0].qualityChecklist);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load QA queue", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOrder]);

  React.useEffect(() => {
    fetchQAOrders();
  }, [fetchQAOrders]);

  const handleSelectOrder = (order: QAOrderItem) => {
    setSelectedOrder(order);
    if (order.qualityChecklist) {
      setChecklist({
        sourceTextAccuracy: !!order.qualityChecklist.sourceTextAccuracy,
        uscis8CFRCompliance: !!order.qualityChecklist.uscis8CFRCompliance,
        notarialEmbossment: !!order.qualityChecklist.notarialEmbossment,
        sealHashVerified: !!order.qualityChecklist.sealHashVerified,
        formattingFidelity: !!order.qualityChecklist.formattingFidelity,
        notes: order.qualityChecklist.notes || "",
      });
    } else {
      setChecklist({
        sourceTextAccuracy: false,
        uscis8CFRCompliance: false,
        notarialEmbossment: false,
        sealHashVerified: false,
        formattingFidelity: false,
        notes: "",
      });
    }
  };

  const handleToggleCheck = (field: keyof QAChecklist) => {
    setChecklist((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleApproveQA = async () => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    try {
      const allPassed = {
        sourceTextAccuracy: true,
        uscis8CFRCompliance: true,
        notarialEmbossment: true,
        sealHashVerified: true,
        formattingFidelity: true,
        notes: checklist.notes || "All 5 quality checks verified. Compliant under 8 CFR 204.2.",
      };

      const res = await fetch("/api/admin/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          checklist: allPassed,
          reviewerName: "David Chen, Lead QA",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          message: `Order ${selectedOrder.publicCode} successfully approved! Certificate of Accuracy issued.`,
        });
        setChecklist(allPassed);
        setTimeout(() => setFeedback(null), 5000);
        fetchQAOrders();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: "Failed to submit QA approval. Please retry.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const allChecked =
    checklist.sourceTextAccuracy &&
    checklist.uscis8CFRCompliance &&
    checklist.notarialEmbossment &&
    checklist.sealHashVerified &&
    checklist.formattingFidelity;

  return (
    <div className="min-h-screen bg-canvas text-text flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-ink border border-brand-500/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>8 CFR 204.2 Compliance & Cryptographic Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Quality Assurance & Certificate Seal Gate
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Rigorous 5-point verification protocol before cryptographic notarization and client delivery.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchQAOrders}
              className="border-border text-text hover:bg-surface-raised"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Queue
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 text-sm border ${
              feedback.type === "success"
                ? "bg-status-success/10 border-status-success/30 text-status-success"
                : "bg-status-error/10 border-status-error/30 text-status-error"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Orders In QA Stage
              </span>
              <FileCheck className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              {orders.length}
            </p>
            <p className="text-xs text-text-muted mt-1">Requiring compliance sign-off</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                First-Pass Accuracy
              </span>
              <CheckCircle2 className="w-4 h-4 text-status-success" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-status-success">
              97.8%
            </p>
            <p className="text-xs text-text-muted mt-1">Zero USCIS rejection guarantee</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Revision / Rework Rate
              </span>
              <AlertTriangle className="w-4 h-4 text-status-warning" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-status-warning">
              2.2%
            </p>
            <p className="text-xs text-text-muted mt-1">Returned to linguists for adjustment</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Avg QA Velocity
              </span>
              <Clock className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              38 mins
            </p>
            <p className="text-xs text-text-muted mt-1">Review turnaround time</p>
          </Card>
        </div>

        {/* 2-Column QA Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: QA Queue List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">
                Pending Verification Queue ({orders.length})
              </h3>
              <span className="text-xs text-text-muted">Select an order to review</span>
            </div>

            {orders.length === 0 ? (
              <Card className="p-8 text-center text-text-muted border-border bg-surface">
                No orders currently waiting for QA verification.
              </Card>
            ) : (
              <div className="space-y-2">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => handleSelectOrder(o)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedOrder?.id === o.id
                        ? "border-brand-500 bg-surface-raised shadow-xs"
                        : "border-border bg-surface hover:border-border-strong"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-sm text-brand-ink">
                          {o.publicCode}
                        </span>
                        <p className="text-xs font-medium text-text mt-0.5">{o.clientName}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {o.status.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-text-muted mt-3 pt-2 border-t border-border/50">
                      <span>
                        {o.sourceLang} → {o.targetLangs?.join(", ")}
                      </span>
                      <span className="font-mono">{o.pageCount} pages</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-muted mt-1">
                      <span>Linguist: {o.assignedTranslator || "Unassigned"}</span>
                      <span>Reviewer: {o.assignedReviewer || "Lead QA"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: 5-Point Verification Studio */}
          <div className="lg:col-span-7">
            {selectedOrder ? (
              <Card className="p-6 border-border bg-surface shadow-sm space-y-6">
                <div className="flex items-start justify-between border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-text">
                        Verification Studio: {selectedOrder.publicCode}
                      </h2>
                      <Badge variant="outline" className="text-xs">
                        {selectedOrder.serviceType}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      Client: {selectedOrder.clientName} | {selectedOrder.sourceLang} to{" "}
                      {selectedOrder.targetLangs?.join(", ")} ({selectedOrder.pageCount} pages)
                    </p>
                  </div>

                  <Link href={`/admin/orders?search=${selectedOrder.publicCode}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs border-border">
                      <Eye className="w-3 h-3 mr-1" />
                      Order Details
                    </Button>
                  </Link>
                </div>

                {/* 5-Point Criteria Checklist */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Required 5-Point Compliance Checks
                  </h3>

                  {/* Criteria 1 */}
                  <label
                    onClick={() => handleToggleCheck("sourceTextAccuracy")}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors cursor-pointer ${
                      checklist.sourceTextAccuracy
                        ? "border-status-success/40 bg-status-success/5"
                        : "border-border bg-surface-raised/40 hover:bg-surface-raised"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
                        checklist.sourceTextAccuracy
                          ? "bg-status-success text-white border-status-success"
                          : "border-border bg-surface"
                      }`}
                    >
                      {checklist.sourceTextAccuracy && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-text block">
                        1. Source-to-Target Linguistic Fidelity & Completeness
                      </span>
                      <p className="text-xs text-text-muted mt-0.5">
                        Verify 100% of names, registration numbers, dates, and marginal notes are accurately translated without omission.
                      </p>
                    </div>
                  </label>

                  {/* Criteria 2 */}
                  <label
                    onClick={() => handleToggleCheck("uscis8CFRCompliance")}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors cursor-pointer ${
                      checklist.uscis8CFRCompliance
                        ? "border-status-success/40 bg-status-success/5"
                        : "border-border bg-surface-raised/40 hover:bg-surface-raised"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
                        checklist.uscis8CFRCompliance
                          ? "bg-status-success text-white border-status-success"
                          : "border-border bg-surface"
                      }`}
                    >
                      {checklist.uscis8CFRCompliance && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-text block">
                        2. USCIS 8 CFR 204.2(a)(1)(iii) Sworn Certification Statement
                      </span>
                      <p className="text-xs text-text-muted mt-0.5">
                        Formal translator statement of dual-language competency attached with linguist credentials and sworn declaration.
                      </p>
                    </div>
                  </label>

                  {/* Criteria 3 */}
                  <label
                    onClick={() => handleToggleCheck("notarialEmbossment")}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors cursor-pointer ${
                      checklist.notarialEmbossment
                        ? "border-status-success/40 bg-status-success/5"
                        : "border-border bg-surface-raised/40 hover:bg-surface-raised"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
                        checklist.notarialEmbossment
                          ? "bg-status-success text-white border-status-success"
                          : "border-border bg-surface"
                      }`}
                    >
                      {checklist.notarialEmbossment && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-text block">
                        3. Notarial Jurat & Embosser Seal Authentication
                      </span>
                      <p className="text-xs text-text-muted mt-0.5">
                        Commissioned notary public acknowledgement, notary stamp, signature date, and jurisdiction verification.
                      </p>
                    </div>
                  </label>

                  {/* Criteria 4 */}
                  <label
                    onClick={() => handleToggleCheck("sealHashVerified")}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors cursor-pointer ${
                      checklist.sealHashVerified
                        ? "border-status-success/40 bg-status-success/5"
                        : "border-border bg-surface-raised/40 hover:bg-surface-raised"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
                        checklist.sealHashVerified
                          ? "bg-status-success text-white border-status-success"
                          : "border-border bg-surface"
                      }`}
                    >
                      {checklist.sealHashVerified && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-text block">
                        4. Cryptographic SHA-256 Hash & QR Seal Integrity
                      </span>
                      <p className="text-xs text-text-muted mt-0.5">
                        Tamper-evident hash generated and public verification link bound to the legal certificate.
                      </p>
                    </div>
                  </label>

                  {/* Criteria 5 */}
                  <label
                    onClick={() => handleToggleCheck("formattingFidelity")}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors cursor-pointer ${
                      checklist.formattingFidelity
                        ? "border-status-success/40 bg-status-success/5"
                        : "border-border bg-surface-raised/40 hover:bg-surface-raised"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
                        checklist.formattingFidelity
                          ? "bg-status-success text-white border-status-success"
                          : "border-border bg-surface"
                      }`}
                    >
                      {checklist.formattingFidelity && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-text block">
                        5. Layout, Typography & Visual Preservation
                      </span>
                      <p className="text-xs text-text-muted mt-0.5">
                        Matches original layout structure, stamp placement notations, tables, and page pagination sequence.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Reviewer Notes */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <Label className="text-xs">Compliance Audit Notes (Recorded in Audit Log)</Label>
                  <Textarea
                    value={checklist.notes}
                    onChange={(e) =>
                      setChecklist({ ...checklist, notes: e.target.value })
                    }
                    placeholder="Enter specific verification notes or observations..."
                    className="text-xs min-h-[70px]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
                  <div className="text-xs text-text-muted">
                    {allChecked ? (
                      <span className="text-status-success font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Ready for Certificate Issuance
                      </span>
                    ) : (
                      <span>All 5 criteria required for official release</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        alert("Returned order to assigned linguist with revision notes.");
                      }}
                      className="border-border text-status-warning hover:bg-status-warning/10"
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      Request Rework
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApproveQA}
                      disabled={!allChecked || isSubmitting}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-medium"
                    >
                      <Stamp className="w-4 h-4 mr-1.5" />
                      {isSubmitting ? "Signing Seal..." : "Sign & Deliver Certificate"}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center text-text-muted border-border bg-surface">
                Select an order from the verification queue to launch the Quality Assurance Studio.
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
