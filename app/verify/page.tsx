"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QrCode, Search, ShieldCheck, ArrowRight, Lock } from "lucide-react";

export default function VerifySearchPage() {
  const router = useRouter();
  const [code, setCode] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const cleanCode = code.trim().toUpperCase();
    router.push(`/verify/${encodeURIComponent(cleanCode)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <Header />
      <main className="flex-1 py-16 md:py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-8 text-center">
          <Badge variant="default" className="gap-1.5 py-1 px-4 text-xs font-bold uppercase tracking-wider mx-auto">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            Institutional Public Registry (§2.6)
          </Badge>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black text-brand-ink tracking-tight">
              Verify Translation Authenticity
            </h1>
            <p className="text-base text-text-muted max-w-xl mx-auto leading-relaxed">
              Immigration officers, academic evaluators, and courts can instantly authenticate any signed VerifyLingua certificate by entering its unique code or scanning the QR stamp.
            </p>
          </div>

          <Card className="p-8 md:p-10 rounded-[32px] bg-surface-raised border-2 border-brand-100 shadow-xl max-w-xl mx-auto text-left space-y-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="verify-code-input" className="text-xs font-bold uppercase tracking-wider text-brand-ink flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-brand-500" />
                  Certificate Verification Code
                </label>
                <Input
                  id="verify-code-input"
                  placeholder="e.g. CERT-7X9K2-4821 or VL-7X9K2"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-14 text-base font-mono uppercase font-bold pl-4 rounded-xl border-2 border-border focus:border-brand-500"
                  required
                />
                <p className="text-[11px] text-text-muted">
                  Located directly below the QR code on your official Certificate of Accuracy PDF.
                </p>
              </div>

              <Button size="lg" type="submit" className="w-full h-12 rounded-xl text-base font-bold gap-2">
                <Search className="w-4 h-4" />
                Look Up Certificate
              </Button>
            </form>

            <div className="p-4 rounded-2xl bg-lavender-50 border border-border text-xs text-text-muted flex items-start gap-3">
              <Lock className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <p>
                Public records show cryptographic hash matching, translator credentials, and validity status without exposing private applicant identification data.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
