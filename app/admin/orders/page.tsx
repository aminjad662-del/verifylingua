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
  FileCheck2,
  Kanban,
  Table as TableIcon,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Settings2,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const KANBAN_COLUMNS = [
  { id: "SUBMITTED", title: "New Intake" },
  { id: "QUOTE_SENT", title: "Quote Sent" },
  { id: "SCHEDULED", title: "Scheduled" },
  { id: "IN_TRANSLATION", title: "In Translation" },
  { id: "QUALITY_REVIEW", title: "QA Verification" },
  { id: "CLIENT_REVIEW", title: "Client Review" },
  { id: "REVISION_REQUESTED", title: "Revision Req" },
  { id: "COMPLETED", title: "Delivered & Done" },
];

export default function AdminOrdersManagementPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [viewMode, setViewMode] = React.useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [priorityFilter, setPriorityFilter] = React.useState("ALL");
  const [loading, setLoading] = React.useState(true);

  // Manual Order Creation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [newClientName, setNewClientName] = React.useState("");
  const [newClientEmail, setNewClientEmail] = React.useState("");
  const [newServiceType, setNewServiceType] = React.useState("CERTIFIED");
  const [newSourceLang, setNewSourceLang] = React.useState("Spanish");
  const [newTargetLang, setNewTargetLang] = React.useState("English");
  const [newPageCount, setNewPageCount] = React.useState(2);
  const [newNotes, setNewNotes] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  // Status Changer & Assignment Drawer State
  const [selectedOrderForEdit, setSelectedOrderForEdit] = React.useState<any | null>(null);
  const [editStatus, setEditStatus] = React.useState("");
  const [editPM, setEditPM] = React.useState("");
  const [editTranslator, setEditTranslator] = React.useState("");
  const [internalNote, setInternalNote] = React.useState("");
  const [savingEdit, setSavingEdit] = React.useState(false);

  const fetchOrders = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.warn("Failed to fetch admin orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: newServiceType,
          sourceLang: newSourceLang,
          targetLangs: [newTargetLang],
          clientName: newClientName || "Direct Phone Intake",
          clientEmail: newClientEmail || "intake@client.com",
          pageCount: Number(newPageCount) || 1,
          wordCount: (Number(newPageCount) || 1) * 250,
          notes: newNotes,
        }),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewClientName("");
        setNewClientEmail("");
        setNewNotes("");
        fetchOrders();
      }
    } catch (err) {
      console.error("Failed to create order:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleSaveOrderEdit = async () => {
    if (!selectedOrderForEdit) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrderForEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus || selectedOrderForEdit.status,
          assignments: {
            pm: editPM || selectedOrderForEdit.assignedPM,
            translator: editTranslator || selectedOrderForEdit.assignedTranslator,
          },
          internalNote: internalNote.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSelectedOrderForEdit(null);
        setInternalNote("");
        fetchOrders();
      }
    } catch (err) {
      console.error("Failed to update order:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.publicCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.sourceLang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.targetLangs?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || o.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <AdminNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-text-muted mb-1">
              <FileCheck2 className="w-3.5 h-3.5 text-brand-500" />
              <span>PRODUCTION &amp; WORKFLOW PIPELINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-ink tracking-tight font-mono">
              Order Workflow Management
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              Live Kanban pipeline and full data table with status overrides and linguist assignments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center rounded-xl border border-border bg-surface p-0.5 text-xs font-mono">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === "kanban" ? "bg-brand-500 text-white font-bold" : "text-text-muted hover:text-brand-ink"
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === "table" ? "bg-brand-500 text-white font-bold" : "text-text-muted hover:text-brand-ink"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                Table
              </button>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white gap-1.5 text-xs h-9 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Order Manually
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl border border-border bg-surface flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search code, client, language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-3 rounded-xl border border-border bg-surface-raised text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-500 w-full"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-border bg-surface-raised text-xs font-mono text-text focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="QUOTE_SENT">Quote Sent</option>
              <option value="IN_TRANSLATION">In Translation</option>
              <option value="QUALITY_REVIEW">Quality Review</option>
              <option value="CLIENT_REVIEW">Client Review</option>
              <option value="REVISION_REQUESTED">Revision Requested</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-border bg-surface-raised text-xs font-mono text-text focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Rush Urgent</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>

          <span className="text-xs font-mono text-text-muted">
            Showing {filteredOrders.length} order(s)
          </span>
        </div>

        {/* KANBAN BOARD VIEW */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map((col) => {
              const colOrders = filteredOrders.filter((o) => o.status === col.id);
              return (
                <div
                  key={col.id}
                  className="rounded-2xl border border-border bg-surface/50 p-4 space-y-3 flex flex-col min-h-[500px]"
                >
                  <div className="flex items-center justify-between border-b border-border/80 pb-2">
                    <span className="font-mono text-xs font-bold uppercase text-brand-ink">
                      {col.title}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] font-mono text-text-muted font-bold">
                      {colOrders.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {colOrders.length === 0 ? (
                      <div className="h-32 border border-dashed border-border rounded-xl flex items-center justify-center text-[11px] font-mono text-text-muted">
                        Empty column
                      </div>
                    ) : (
                      colOrders.map((ord) => (
                        <Card
                          key={ord.id}
                          className="p-3.5 rounded-xl border border-border bg-surface-raised hover:border-brand-500/50 hover:shadow-sm transition-all space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-brand-ink">
                              {ord.publicCode}
                            </span>
                            {ord.priority === "URGENT" && (
                              <Badge variant="danger" className="text-[9px] font-mono py-0 px-1.5">
                                RUSH
                              </Badge>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-text truncate">{ord.clientName}</p>
                            <p className="text-[11px] font-mono text-text-muted">
                              {ord.sourceLang} ? {ord.targetLangs?.[0]} ({ord.pageCount}p)
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted pt-1 border-t border-border/60">
                            <span>${ord.total.toFixed(2)}</span>
                            <button
                              onClick={() => {
                                setSelectedOrderForEdit(ord);
                                setEditStatus(ord.status);
                                setEditPM(ord.assignedPM || "");
                                setEditTranslator(ord.assignedTranslator || "");
                              }}
                              className="text-brand-500 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Settings2 className="w-3 h-3" />
                              Manage
                            </button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === "table" && (
          <div className="rounded-2xl border border-border bg-surface-raised overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-surface text-[11px] font-mono text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Code</th>
                    <th className="p-4">Client / Org</th>
                    <th className="p-4">Pair</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Assigned PM</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-center">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-surface/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-brand-ink">
                        {ord.publicCode}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-text">{ord.clientName}</p>
                        <p className="text-[11px] text-text-muted">{ord.clientEmail}</p>
                      </td>
                      <td className="p-4 font-mono">
                        {ord.sourceLang} ? {ord.targetLangs?.[0]}
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-brand-50 text-brand-600 font-mono text-[10px] font-semibold border border-brand-100">
                          {ord.serviceType}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            ord.status === "COMPLETED"
                              ? "success"
                              : ord.status === "CLIENT_REVIEW" || ord.status === "QUOTE_SENT"
                              ? "warning"
                              : "default"
                          }
                          className="text-[10px] font-mono"
                        >
                          {ord.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            ord.priority === "URGENT"
                              ? "bg-red-50 text-red-600 border border-red-200"
                              : "bg-surface text-text-muted"
                          }`}
                        >
                          {ord.priority}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-text-muted text-[11px]">
                        {ord.assignedPM || "Unassigned"}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-brand-ink">
                        ${ord.total.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedOrderForEdit(ord);
                            setEditStatus(ord.status);
                            setEditPM(ord.assignedPM || "");
                            setEditTranslator(ord.assignedTranslator || "");
                          }}
                          className="text-brand-500 hover:text-brand-600 font-mono text-xs font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MANUAL ORDER CREATION MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-surface-raised rounded-3xl border border-border p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-mono font-bold text-sm text-brand-ink uppercase">
                  Manual Order Intake Form
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-text-muted hover:text-brand-ink text-xs font-mono p-1"
                >
                  ?
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <Label>Client Full Name</Label>
                  <Input
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Maria Delgado"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Client Email Address</Label>
                  <Input
                    required
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="e.g. maria.delgado@firm.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Service Type</Label>
                    <select
                      value={newServiceType}
                      onChange={(e) => setNewServiceType(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-border bg-surface text-xs text-text"
                    >
                      <option value="CERTIFIED">Certified (USCIS)</option>
                      <option value="NOTARIZED">Notarized Translation</option>
                      <option value="LEGAL">Legal &amp; Court</option>
                      <option value="MEDICAL">Medical &amp; Clinical</option>
                      <option value="STANDARD">Standard</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label>Page Count</Label>
                    <Input
                      type="number"
                      min={1}
                      value={newPageCount}
                      onChange={(e) => setNewPageCount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Source Language</Label>
                    <Input
                      value={newSourceLang}
                      onChange={(e) => setNewSourceLang(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Target Language</Label>
                    <Input
                      value={newTargetLang}
                      onChange={(e) => setNewTargetLang(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Intake &amp; Internal Notes</Label>
                  <Textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Enter matter reference, special instructions, or courier address..."
                    className="h-20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    size="sm"
                    className="rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white"
                  >
                    {creating ? "Submitting..." : "Generate Order"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ORDER EDIT & ASSIGNMENT DRAWER */}
        {selectedOrderForEdit && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-surface-raised rounded-3xl border border-border p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="font-mono font-bold text-sm text-brand-ink uppercase">
                    Manage Order {selectedOrderForEdit.publicCode}
                  </h3>
                  <p className="text-[11px] text-text-muted">{selectedOrderForEdit.clientName} ({selectedOrderForEdit.serviceType})</p>
                </div>
                <button
                  onClick={() => setSelectedOrderForEdit(null)}
                  className="text-text-muted hover:text-brand-ink font-mono text-xs p-1"
                >
                  ?
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <Label>Change Lifecycle Status</Label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-xs font-mono font-bold text-text"
                  >
                    <option value="SUBMITTED">SUBMITTED (Intake)</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW (Triage)</option>
                    <option value="QUOTE_SENT">QUOTE_SENT</option>
                    <option value="SCHEDULED">SCHEDULED (Accepted)</option>
                    <option value="IN_TRANSLATION">IN_TRANSLATION</option>
                    <option value="QUALITY_REVIEW">QUALITY_REVIEW</option>
                    <option value="CLIENT_REVIEW">CLIENT_REVIEW</option>
                    <option value="REVISION_REQUESTED">REVISION_REQUESTED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Assign Project Manager</Label>
                    <Input
                      value={editPM}
                      onChange={(e) => setEditPM(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Assign Linguist</Label>
                    <Input
                      value={editTranslator}
                      onChange={(e) => setEditTranslator(e.target.value)}
                      placeholder="e.g. Elena V. (ATA ID 271892)"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Add Confidential Staff Note (Invisible to Client)</Label>
                  <Textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Enter notes on apostille tracking, scan legibility, or rate adjustments..."
                    className="h-20 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrderForEdit(null)}
                  className="rounded-xl"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  disabled={savingEdit}
                  onClick={handleSaveOrderEdit}
                  className="rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
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
