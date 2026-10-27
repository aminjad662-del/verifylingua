"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

const JURISDICTIONS = [
  { name: "USCIS Texas Service Center", type: "I-485 & Green Cards" },
  { name: "USCIS Nebraska Service Center", type: "Employment Petitions" },
  { name: "National Visa Center (NVC)", type: "Consular Immigrant Visas" },
  { name: "Executive Office for Immigration Review (EOIR)", type: "Immigration Court" },
  { name: "WES & ECE Evaluators", type: "Foreign Degree Credentialing" },
  { name: "U.S. Department of State", type: "Passport & Consular Services" },
];

export function AcceptanceNetworkBanner() {
  return (
    <section className="py-16 md:py-24 bg-surface border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-[var(--r-2xl)] bg-surface-raised border border-border p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-xs text-center space-y-8">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-ink tracking-tight font-display">
              Filing With Confidence in All 50 States.
            </h2>

            <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
              Every VerifyLingua certified translation meets strict USCIS 8 CFR § 103.2(b)(3), National Visa Center (NVC),
              and Federal Rule of Evidence 902(11) self-authenticating foreign legal standards.
            </p>
          </div>

          {/* Institutional Jurisdiction Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {JURISDICTIONS.map((j, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-surface border border-border shadow-xs text-left flex flex-col justify-between space-y-2 hover:border-brand-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Landmark className="w-4 h-4 text-brand-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-ink leading-tight">{j.name}</p>
                  <p className="text-[10px] text-ink-softer font-mono pt-1">{j.type}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action CTA */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2 px-8 h-13 rounded-full font-bold shadow-md bg-brand-500 hover:bg-brand-600 text-white active:scale-[0.98] transition-transform">
              <Link href="/order/triage">
                Start your translation ($24.95/page)
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-13 px-6 rounded-full font-bold border-border hover:bg-surface active:scale-[0.98] transition-transform">
              <Link href="/acceptance-guarantee">
                Read our 100% USCIS Acceptance Guarantee
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
