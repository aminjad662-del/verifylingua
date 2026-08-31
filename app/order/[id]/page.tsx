"use client";

import * as React from "react";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  QrCode,
  MessageSquare,
  Send,
} from "lucide-react";

interface OrderEventItem {
  id: string;
  type: string;
  message: string;
  actor: string;
  createdAt: string;
}

interface MessageItem {
  id: string;
  senderType: "CUSTOMER" | "TRANSLATOR" | "SYSTEM";
  senderName: string;
  body: string;
  createdAt: string;
}

function OrderTrackingContent() {
  const params = useParams();
  const publicCode = (params.id as string) || "VL-DEMO1";

  const [order] = React.useState<any>({
    publicCode,
    status: "TRANSLATING",
    sourceLang: "Spanish",
    targetLang: "English",
    serviceType: "CERTIFIED",
    pageCount: 1,
    total: 24.95,
    promisedAtFormatted: "Tomorrow at 9:00 AM EST",
    translator: {
      name: "Elena V.",
      languages: ["Spanish", "English"],
      credentials: "ATA Member No. 271892 • Certified Legal Translator",
    },
    events: [
      {
        id: "ev-1",
        type: "STATUS_CHANGE",
        message: "Order placed & payment authorized. Pre-payment document triage passed.",
        actor: "SYSTEM",
        createdAt: "Today at 2:15 PM",
      },
      {
        id: "ev-2",
        type: "ASSIGNED",
        message: "Assigned to ATA-certified native translator Elena V. Source documents decrypted.",
        actor: "SYSTEM",
        createdAt: "Today at 2:18 PM",
      },
      {
        id: "ev-3",
        type: "TRANSLATING",
        message: "Translation in progress. Passport name lock terms validated in workspace.",
        actor: "TRANSLATOR: Elena V.",
        createdAt: "Today at 2:30 PM",
      },
    ],
  });

  const [messages, setMessages] = React.useState<MessageItem[]>([
    {
      id: "m-1",
      senderType: "SYSTEM",
      senderName: "VerifyLingua Assistant",
      body: "Welcome to your live order thread! Elena V. is currently translating your document. All passport transliterations are locked.",
      createdAt: "2:18 PM",
    },
    {
      id: "m-2",
      senderType: "TRANSLATOR",
      senderName: "Elena V. (Translator)",
      body: "Hello! I have reviewed your document scan and verified all official stamps. Translation is proceeding smoothly and will be submitted for QA shortly.",
      createdAt: "2:32 PM",
    },
  ]);

  const [newMessage, setNewMessage] = React.useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: MessageItem = {
      id: `m-${Date.now()}`,
      senderType: "CUSTOMER",
      senderName: "You",
      body: newMessage.trim(),
      createdAt: "Just now",
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `m-rep-${Date.now()}`,
          senderType: "TRANSLATOR",
          senderName: "Elena V. (Translator)",
          body: "Thank you for the message! I've noted your update and it is incorporated into the draft.",
          createdAt: "Just now",
        },
      ]);
    }, 1500);
  };

  const TRACKER_STEPS = [
    { key: "RECEIVED", label: "Received", done: true },
    { key: "TRIAGED", label: "AI Triaged", done: true },
    { key: "ASSIGNED", label: "Assigned", done: true },
    { key: "TRANSLATING", label: "Translating", done: true, current: true },
    { key: "QA", label: "USCIS QA Check", done: false },
    { key: "CERTIFIED", label: "Certified & QR Issued", done: false },
    { key: "DELIVERED", label: "Delivered", done: false },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner with Public Code and Status */}
      <div className="p-6 md:p-8 rounded-[28px] bg-gradient-panel border-2 border-brand-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500 bg-surface-raised px-3 py-1 rounded-full border border-brand-100">
              Live Order Tracker (§2.5)
            </span>
            <span className="text-sm font-mono font-black text-brand-ink">
              {publicCode}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-ink tracking-tight">
            Translation in Progress — In Good Hands
          </h1>
          <p className="text-xs sm:text-sm text-text-muted">
            Promised delivery: <strong className="text-brand-ink font-bold">{order.promisedAtFormatted}</strong> (Guaranteed)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild size="sm" className="gap-2 rounded-xl">
            <Link href={`/verify/${publicCode}`}>
              <QrCode className="w-4 h-4 text-brand-500" />
              Preview Public Verification
            </Link>
          </Button>
        </div>
      </div>

      {/* 7-Stage Visual Step Tracker */}
      <Card className="p-6 md:p-8 rounded-[28px] bg-surface-raised border border-border space-y-6">
        <h3 className="text-base font-bold text-brand-ink">
          Order Lifecycle Milestones
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {TRACKER_STEPS.map((s, idx) => (
            <div
              key={s.key}
              className={`p-3.5 rounded-2xl border text-center space-y-2 transition-all ${
                s.current
                  ? "border-brand-500 bg-brand-50/80 ring-2 ring-brand-500/20"
                  : s.done
                  ? "border-border bg-surface text-brand-ink"
                  : "border-border/60 bg-surface/50 text-text-muted opacity-60"
              }`}
            >
              <div
                className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                  s.current
                    ? "bg-brand-500 text-white animate-pulse"
                    : s.done
                    ? "bg-status-success text-white"
                    : "bg-border text-text-muted"
                }`}
              >
                {s.done ? "✓" : idx + 1}
              </div>
              <p className="text-xs font-bold truncate">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Assigned Linguist & In-Thread Messaging */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 md:p-8 rounded-[28px] bg-surface-raised border border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500">
                Assigned Certified Linguist
              </span>
              <Badge variant="default" className="text-[10px]">ATA Member Verified</Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 text-xl font-bold font-mono">
                EV
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-brand-ink">{order.translator.name}</h3>
                <p className="text-xs text-text-muted">{order.translator.credentials}</p>
                <p className="text-xs text-brand-500 font-semibold">
                  Spanish → English Legal Specialist
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 md:p-8 rounded-[28px] bg-surface-raised border-2 border-brand-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-500" />
                <h3 className="text-lg font-bold text-brand-ink">
                  Direct Translation Thread
                </h3>
              </div>
              <span className="text-xs text-status-success font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-success inline-block"></span>
                Translator Active
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {messages.map((m) => {
                const isMe = m.senderType === "CUSTOMER";
                const isSys = m.senderType === "SYSTEM";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-text-muted mb-1 px-1">
                      <span className="font-bold">{m.senderName}</span>
                      <span>•</span>
                      <span>{m.createdAt}</span>
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-sm leading-relaxed max-w-md ${
                        isMe
                          ? "bg-brand-500 text-white rounded-br-none"
                          : isSys
                          ? "bg-lavender-50 text-brand-ink border border-border"
                          : "bg-surface text-brand-ink border border-border rounded-bl-none"
                      }`}
                    >
                      {m.body}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-border">
              <Input
                placeholder="Ask your translator a question or provide notes..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="h-11 rounded-xl"
              />
              <Button type="submit" size="sm" className="h-11 px-4 rounded-xl gap-1.5 shrink-0">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Event Log */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 md:p-8 rounded-[28px] bg-surface-raised border border-border space-y-4">
            <h3 className="text-base font-bold text-brand-ink">
              Timestamped Event Log
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {order.events.map((ev: OrderEventItem) => (
                <div key={ev.id} className="flex items-start gap-3 relative">
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] shrink-0 z-10">
                    ✓
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <p className="text-xs font-bold text-brand-ink">{ev.message}</p>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono">
                      <span>{ev.actor}</span>
                      <span>•</span>
                      <span>{ev.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="p-6 rounded-[28px] bg-gradient-panel border border-brand-100 space-y-3 text-xs text-text-muted">
            <div className="flex items-center gap-2 text-brand-ink font-bold">
              <ShieldCheck className="w-5 h-5 text-brand-500" />
              <span>USCIS 8 CFR 103.2(b)(3) Compliance</span>
            </div>
            <p className="leading-relaxed">
              Your Certificate of Accuracy will include an ATA statement of competence, translator signature, and cryptographic SHA-256 hash.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-muted">Loading live tracker...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
