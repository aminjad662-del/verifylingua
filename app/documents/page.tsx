"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomCTA } from "@/components/marketing/BottomCTA";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

const DOC_IMAGE_MAP: Record<string, string> = {
  "birth-certificate": "/images/docs/birth-certificate.jpg",
  "marriage-certificate": "/images/docs/marriage-certificate.jpg",
  "diploma-and-degree": "/images/docs/diploma.jpg",
  "academic-transcript": "/images/docs/transcript.jpg",
  "passport-and-id": "/images/docs/passport.jpg",
  "court-order-and-judgment": "/images/docs/court-order.jpg",
  "medical-record-and-vaccination": "/images/docs/medical-record.jpg",
  "financial-and-bank-statement": "/images/docs/bank-statement.jpg",
  "drivers-license": "/images/docs/drivers-license.jpg",
};

export default function DocumentsPage() {
  const [search, setSearch] = React.useState("");

  const filteredDocs = React.useMemo(() => {
    return DOCUMENT_TYPES.filter((doc) =>
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.receivingAgency.toLowerCase().includes(search.toLowerCase())
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
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              USCIS & Institutional Document Directory
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-ink tracking-tight">
              Certified Document Directory
            </h1>

            <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              Find exact translation standards, required certifications, and typical turnaround times for over 25+ document categories.
            </p>

            {/* Search Input */}
            <div className="max-w-md mx-auto pt-4 relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input
                type="text"
                placeholder="Search by document name or receiving agency..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 rounded-2xl border-2 border-border bg-surface-raised text-base shadow-sm focus:border-brand-500"
              />
            </div>
          </div>
        </section>

        {/* Documents Grid */}
        <section className="py-16 md:py-24 bg-surface border-b border-border/60 px-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-muted">
                Showing {filteredDocs.length} of {DOCUMENT_TYPES.length} Document Types
              </span>
              <span className="text-xs font-mono text-brand-500 font-bold">
                Flat $24.95 / page standard rate
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc) => {
                const imageSrc = DOC_IMAGE_MAP[doc.slug] || "/images/docs/birth-certificate.jpg";
                return (
                  <div
                    key={doc.id}
                    className="p-6 rounded-3xl bg-surface-raised border border-border hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-border/60 bg-surface">
                        <Image
                          src={imageSrc}
                          alt={doc.name}
                          fill
                          className="object-cover"
                        />
                        {doc.popular && (
                          <Badge variant="default" className="absolute top-3 right-3 text-[11px] shadow-sm">
                            Most Requested
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-xl font-bold text-brand-ink leading-tight">
                          {doc.name}
                        </h3>
                        <p className="text-xs text-text-muted">
                          Required by: <span className="font-semibold text-brand-ink">{doc.receivingAgency}</span>
                        </p>
                      </div>

                      <div className="space-y-1 pt-1 text-xs text-text-muted">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                          <span>All official stamps & seals translated</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                          <span>Passport spelling consistency lock</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-border/60">
                      <span className="font-mono text-xs text-text-muted">
                        ~{doc.typicalPages} page avg. • 24h turnaround
                      </span>
                      <Button asChild size="sm" className="gap-1.5 rounded-xl font-bold">
                        <Link href={`/order/triage?doc=${doc.slug}`}>
                          Translate
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
