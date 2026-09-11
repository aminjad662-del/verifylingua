"use client";

import * as React from "react";
import { HelpCircle, Mail, MessageSquare, ShieldCheck, Send, CheckCircle2 } from "lucide-react";

export default function ClientSupportPage() {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
  };

  const faqs = [
    {
      q: "What is the USCIS 100% Acceptance Guarantee?",
      a: "All certified translations strictly comply with 8 CFR 103.2. If USCIS or any official body rejects our translation due to formatting or certification, we issue a 100% immediate refund and free expedited re-issuance.",
    },
    {
      q: "How does layout preservation work for complex tables?",
      a: "Our OpenXML engine for DOCX and coordinate-aware vector engine for PDF detect table bounding boxes, cell spans, and margins, reflowing target text with dynamic font scaling to prevent cell clipping.",
    },
    {
      q: "What is the difference between Automated and Certified mode?",
      a: "Automated mode delivers instant layout-preserving machine translations for internal review. Certified mode includes ATA-accredited human linguist review, signed certificates of accuracy, and cryptographic QR verification seals.",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-text">
            Enterprise Client Support
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Priority technical assistance, USCIS RFE defense, and translation verification.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-raised border border-border text-xs font-mono text-brand-600">
          <ShieldCheck className="w-4 h-4" />
          <span>Priority SLA: 15 Min</span>
        </div>
      </div>

      {/* Ticket Form */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <h2 className="text-xs font-mono font-extrabold uppercase tracking-wider text-text">
          Open Priority Support Request
        </h2>

        {submitted ? (
          <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-emerald-900">Support Ticket Received</p>
            <p className="text-[11px] text-emerald-700">
              Your request has been routed to our dedicated engineering and linguist triage desk.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-text-muted">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Urgent: RFE packet review for Matter No. 2026-USCIS"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-surface border border-border focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-text-muted">
                Detailed Message
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry or attach specific document details..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-surface border border-border focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Frequently Answered Questions */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <h2 className="text-xs font-mono font-extrabold uppercase tracking-wider text-text">
          Frequently Answered Questions
        </h2>

        <div className="divide-y divide-border">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3.5 space-y-1 text-xs">
              <p className="font-bold text-text">{faq.q}</p>
              <p className="text-text-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
