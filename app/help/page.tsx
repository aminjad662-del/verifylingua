"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FAQSection } from "@/components/marketing/FAQSection";
import { BottomCTA } from "@/components/marketing/BottomCTA";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Mail, MessageSquare, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/constants";

export default function HelpPage() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-soft">
      <Header />
      <main className="flex-1">
        {/* Page Header */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-hero border-b border-border/60 text-center px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <Badge variant="default" className="gap-1.5 py-1 px-4 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              24/7 Compliance & Support Center
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-ink tracking-tight font-display">
              How Can We Help You?
            </h1>

            <p className="text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
              Have questions about an upcoming immigration deadline, USCIS RFE response, or receiving agency requirements? Our compliance team is here to assist.
            </p>
          </div>
        </section>

        {/* Support Channels & Contact Form */}
        <section className="py-16 md:py-24 bg-surface border-b border-border/60 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Channels */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-500">
                  Direct Assistance
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-ink">
                  Support Channels
                </h2>
                <p className="text-sm text-text-muted">
                  We reply to all inquiries in under 15 minutes during active business hours.
                </p>
              </div>

              <div className="space-y-4">
                <Card className="p-6 rounded-2xl bg-surface-raised border border-border flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-brand-ink">Email Support</h3>
                    <p className="text-xs text-text-muted">Direct compliance and billing assistance</p>
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-xs font-mono font-bold text-brand-500 hover:underline block pt-1">
                      {SUPPORT_EMAIL}
                    </a>
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl bg-surface-raised border border-border flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-brand-ink">Turnaround Guarantee</h3>
                    <p className="text-xs text-text-muted">Guaranteed 24-hour certified translation delivery</p>
                    <span className="text-xs font-mono text-status-success font-semibold block pt-1">
                      Live Queue Active • 24/7 Translation Vetting
                    </span>
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl bg-surface-raised border border-border flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-brand-ink">100% Acceptance Policy</h3>
                    <p className="text-xs text-text-muted">If rejected by USCIS, we redo it free and refund 100%.</p>
                    <Link href="/pricing" className="text-xs font-bold text-brand-500 hover:underline block pt-1">
                      Read guarantee details →
                    </Link>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-7">
              <Card className="p-8 md:p-10 rounded-[28px] bg-surface-raised border border-border shadow-sm space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500">
                    Send a Message
                  </span>
                  <h3 className="text-2xl font-black text-brand-ink tracking-tight">
                    Ask a Compliance Question
                  </h3>
                  <p className="text-xs text-text-muted">
                    We can review your document requirements before you order.
                  </p>
                </div>

                {submitted ? (
                  <div className="p-6 rounded-2xl bg-brand-50 border border-brand-100 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-status-success mx-auto" />
                    <h4 className="text-lg font-bold text-brand-ink">Message Received!</h4>
                    <p className="text-sm text-text-muted">
                      A certified compliance specialist will review your question and respond to your email shortly.
                    </p>
                    <Button size="sm" onClick={() => setSubmitted(false)} variant="outline">
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-wider text-text-muted">
                          Your Name
                        </label>
                        <Input id="contact-name" placeholder="First and last name" required />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-wider text-text-muted">
                          Email Address
                        </label>
                        <Input id="contact-email" type="email" placeholder="you@example.com" required />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-subject" className="text-xs font-bold uppercase tracking-wider text-text-muted">
                        Topic / Receiving Agency
                      </label>
                      <Input id="contact-subject" placeholder="e.g. USCIS Green Card, University WES Evaluation, Notarization" required />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-message" className="text-xs font-bold uppercase tracking-wider text-text-muted">
                        Your Question or Document Details
                      </label>
                      <textarea
                        id="contact-message"
                        rows={4}
                        placeholder="Tell us about your document, language pair, or specific agency requirements..."
                        required
                        className="w-full p-4 rounded-xl border border-border bg-surface text-base text-text focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                      />
                    </div>

                    <Button size="lg" type="submit" className="w-full h-12 rounded-xl text-base font-bold">
                      Send to Compliance Team
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </section>

        {/* Embedded FAQ */}
        <FAQSection />

        {/* Bottom CTA */}
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
