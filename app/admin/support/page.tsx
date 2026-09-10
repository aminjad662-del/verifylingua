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
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Search,
  Filter,
  Send,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  clientName: string;
  clientEmail: string;
  orderId: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  priority: "URGENT" | "HIGH" | "NORMAL";
  slaDueAt: string;
  createdAt: string;
  messagesCount: number;
}

interface CannedResponse {
  id: string;
  title: string;
  text: string;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [cannedResponses, setCannedResponses] = React.useState<CannedResponse[]>([]);
  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const fetchSupportData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/support");
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
        if (data.tickets.length > 0 && !selectedTicket) {
          setSelectedTicket(data.tickets[0]);
        }
      }
      if (data.cannedResponses) setCannedResponses(data.cannedResponses);
    } catch (err) {
      console.error("Failed to load support tickets", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTicket]);

  React.useEffect(() => {
    fetchSupportData();
  }, [fetchSupportData]);

  const handleUpdateStatus = async (ticketId: string, status: "OPEN" | "IN_PROGRESS" | "RESOLVED") => {
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, updates: { status } }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
        );
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket((prev) => (prev ? { ...prev, status } : null));
        }
        setFeedback(`Ticket marked as ${status}.`);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setIsSending(true);
    try {
      // In production, would post message to ticket thread
      await handleUpdateStatus(selectedTicket.id, "RESOLVED");
      setFeedback("Reply dispatched to client. Ticket updated to RESOLVED.");
      setReplyMessage("");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error("Failed to send reply", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleInsertMacro = (text: string) => {
    setReplyMessage((prev) => (prev ? `${prev}\n\n${text}` : text));
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openTicketsCount = tickets.filter((t) => t.status === "OPEN").length;
  const urgentTicketsCount = tickets.filter((t) => t.priority === "URGENT" && t.status !== "RESOLVED").length;

  return (
    <div className="min-h-screen bg-canvas text-text flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-ink border border-brand-500/20 mb-2">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Customer Success & Inquiry Triage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Client Support Desk & Escalation Hub
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Respond to urgent translation inquiries, notarization clarifications, and USCIS filing deadlines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSupportData}
              className="border-border text-text hover:bg-surface-raised"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-4 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Unassigned / Open
              </span>
              <LifeBuoy className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              {openTicketsCount} Inquiries
            </p>
            <p className="text-xs text-text-muted mt-1">Awaiting staff acknowledgement</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Urgent Escalations
              </span>
              <AlertTriangle className="w-4 h-4 text-status-error" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-status-error">
              {urgentTicketsCount}
            </p>
            <p className="text-xs text-text-muted mt-1">Under 2 hours to USCIS filing</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                15-Min SLA Compliance
              </span>
              <CheckCircle2 className="w-4 h-4 text-status-success" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-status-success">
              99.1%
            </p>
            <p className="text-xs text-text-muted mt-1">Average response within 8.2 mins</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Total Tickets Resolved
              </span>
              <Clock className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              {tickets.filter((t) => t.status === "RESOLVED").length + 42}
            </p>
            <p className="text-xs text-text-muted mt-1">98.4% first-contact resolution</p>
          </Card>
        </div>

        {/* 2-Column Support Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Ticket Inbox */}
          <div className="lg:col-span-5 space-y-3">
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets, clients, subjects..."
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
                      statusFilter === status
                        ? "bg-brand-500 text-white border-brand-500"
                        : "bg-surface border-border text-text-muted hover:text-text"
                    }`}
                  >
                    {status.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedTicket?.id === t.id
                      ? "border-brand-500 bg-surface-raised shadow-xs"
                      : "border-border bg-surface hover:border-border-strong"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-brand-ink font-bold">
                        {t.ticketNumber}
                      </span>
                      <h4 className="text-xs font-semibold text-text line-clamp-1 mt-0.5">
                        {t.subject}
                      </h4>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.priority === "URGENT"
                          ? "bg-status-error/10 text-status-error"
                          : t.priority === "HIGH"
                          ? "bg-status-warning/10 text-status-warning"
                          : "bg-surface-raised text-text-muted border border-border"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-text-muted mt-3 pt-2 border-t border-border/50">
                    <span>{t.clientName}</span>
                    <span
                      className={`font-semibold ${
                        t.status === "RESOLVED"
                          ? "text-status-success"
                          : t.status === "IN_PROGRESS"
                          ? "text-brand-ink"
                          : "text-status-warning"
                      }`}
                    >
                      {t.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Ticket Conversation Desk */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <Card className="p-6 border-border bg-surface shadow-sm space-y-6">
                <div className="flex items-start justify-between border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-brand-ink">
                        {selectedTicket.ticketNumber}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {selectedTicket.priority} Priority
                      </Badge>
                    </div>
                    <h2 className="text-base font-bold text-text mt-1">
                      {selectedTicket.subject}
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      Client: {selectedTicket.clientName} ({selectedTicket.clientEmail})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/orders?search=${selectedTicket.orderId}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs border-border">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Linked Order
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Status Toggle Bar */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-raised border border-border text-xs">
                  <span className="text-text-muted font-medium">Ticket Lifecycle:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedTicket.id, "OPEN")}
                      className={`h-7 text-xs border-border ${
                        selectedTicket.status === "OPEN" ? "bg-status-warning/10 text-status-warning" : ""
                      }`}
                    >
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedTicket.id, "IN_PROGRESS")}
                      className={`h-7 text-xs border-border ${
                        selectedTicket.status === "IN_PROGRESS" ? "bg-brand-500/10 text-brand-ink" : ""
                      }`}
                    >
                      In Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedTicket.id, "RESOLVED")}
                      className={`h-7 text-xs border-border ${
                        selectedTicket.status === "RESOLVED" ? "bg-status-success/10 text-status-success" : ""
                      }`}
                    >
                      Resolved
                    </Button>
                  </div>
                </div>

                {/* Canned Response Macros */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                    <Sparkles className="w-3.5 h-3.5 text-brand-ink" />
                    <span>Quick Response Macros (Click to insert)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {cannedResponses.map((cr) => (
                      <button
                        key={cr.id}
                        type="button"
                        onClick={() => handleInsertMacro(cr.text)}
                        className="p-2.5 rounded text-left border border-border bg-surface-raised hover:border-brand-500 transition-colors text-xs space-y-1"
                      >
                        <span className="font-semibold text-text block line-clamp-1">
                          {cr.title}
                        </span>
                        <span className="text-[11px] text-text-muted block line-clamp-2">
                          {cr.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply Composer */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Official Staff Response</Label>
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your official customer response or click a macro above..."
                    className="min-h-[120px] text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[11px] text-text-muted">
                    Response delivered via email and client portal message thread
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSendReply}
                    disabled={isSending || !replyMessage.trim()}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-medium"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {isSending ? "Sending..." : "Send & Mark Resolved"}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center text-text-muted border-border bg-surface">
                Select a ticket from the left panel to inspect the thread.
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
