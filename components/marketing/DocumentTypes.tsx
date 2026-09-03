import Link from "next/link";
import Image from "next/image";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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

export function DocumentTypes() {
  return (
    <section className="py-24 md:py-44 bg-surface border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-500">
              Official Document Directory
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-ink tracking-tight font-display">
              Accepted for All Legal & Official Purposes
            </h2>
            <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
              Every document is translated by accredited human linguists with precise formatting matching the original layout.
            </p>
          </div>

          <Button variant="secondary" asChild className="gap-2 shrink-0">
            <Link href="/documents">
              Browse all 25+ documents
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* 12 Document Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {DOCUMENT_TYPES.map((doc) => {
            const imageSrc = DOC_IMAGE_MAP[doc.slug] || "/images/docs/birth-certificate.jpg";
            return (
              <Link
                key={doc.id}
                href={`/order/triage?doc=${doc.slug}`}
                className="group p-5 rounded-3xl bg-surface-raised border border-border hover:border-brand-500/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Spot Illustration */}
                  <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-surface border border-border/60 group-hover:scale-[1.02] transition-transform">
                    <Image
                      src={imageSrc}
                      alt={`${doc.name} certified translation`}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                    />
                  </div>

                  <h3 className="text-lg font-bold text-brand-ink group-hover:text-brand-500 transition-colors leading-snug">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-ink-soft">
                    Required for: <span className="font-semibold text-brand-ink">{doc.receivingAgency}</span>
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border/60 text-xs">
                  <span className="font-mono text-text-muted">Typical: ~{doc.typicalPages} page</span>
                  <span className="font-semibold text-brand-500 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Translate →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
