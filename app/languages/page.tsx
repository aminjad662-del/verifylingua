"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomCTA } from "@/components/marketing/BottomCTA";
import { POPULAR_LANGUAGES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Globe2, Search, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LanguagesPage() {
  const [search, setSearch] = React.useState("");

  const filteredLanguages = React.useMemo(() => {
    return POPULAR_LANGUAGES.filter((lang) =>
      lang.name.toLowerCase().includes(search.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      lang.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <Header />
      <main className="flex-1">
        {/* Page Header */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-hero border-b border-border/60 text-center px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <Badge variant="default" className="gap-1.5 py-1 px-4 text-xs font-bold uppercase tracking-wider">
              <Globe2 className="w-4 h-4 text-brand-500" />
              70+ Supported Language Pairs
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-ink tracking-tight">
              Certified Translation Languages
            </h1>

            <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              Every language is translated by native, accredited linguists with specialized support for complex Right-to-Left (RTL) scripts, non-Latin alphabets, and legal seal formatting.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto pt-4 relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input
                type="text"
                placeholder="Search language e.g. Spanish, Arabic, Chinese..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 rounded-2xl border-2 border-border bg-surface-raised text-base shadow-sm focus:border-brand-500"
              />
            </div>
          </div>
        </section>

        {/* RTL Notice Banner */}
        <section className="py-8 bg-lavender-50 border-b border-border/60 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-mono">Specialized RTL Engineering</Badge>
                <span className="text-sm font-bold text-brand-ink">Arabic, Persian, Hebrew & Urdu Support</span>
              </div>
              <p className="text-xs text-text-muted">
                Right-to-Left documents are precisely mirror-formatted to preserve visual layout fidelity without reversing critical dates, serial numbers, or passport transliterations.
              </p>
            </div>

            <Button size="sm" asChild className="shrink-0 gap-1.5">
              <Link href="/order/triage?source=ar">
                Translate Arabic Document
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Languages Grid */}
        <section className="py-16 md:py-24 bg-surface border-b border-border/60 px-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-muted">
                Showing {filteredLanguages.length} Supported Languages
              </span>
              <span className="text-xs font-mono text-brand-500 font-bold">
                24-Hour Certified Turnaround
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className="p-6 rounded-3xl bg-surface-raised border border-border hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase font-bold text-brand-500 bg-brand-50 px-2 py-0.5 rounded-md">
                        {lang.code.toUpperCase()}
                      </span>
                      {lang.dir === "rtl" && (
                        <Badge variant="secondary" className="text-[10px] py-0">RTL Script</Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-brand-ink leading-tight">
                        {lang.name}
                      </h3>
                      <p className="text-sm font-medium text-text-muted" dir={lang.dir}>
                        {lang.nativeName}
                      </p>
                    </div>

                    <div className="space-y-1 pt-1 text-xs text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                        <span>USCIS & Court Certified</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                        <span>ATA Member Certified</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-mono text-text-muted">24h Delivery</span>
                    <Button asChild size="sm" variant="outline" className="h-8 px-3 rounded-lg text-xs font-bold">
                      <Link href={`/order/triage?source=${lang.code}`}>
                        Select →
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
