import Image from "next/image";
import Link from "next/link";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, ShieldCheck } from "lucide-react";

export function DocumentTypes() {
  return (
    <section className="py-20 md:py-28 bg-surface border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-500">
              Official Document Directory
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-ink tracking-tight">
              Accepted for All Legal & Official Purposes
            </h2>
            <p className="text-base sm:text-lg text-text-muted leading-relaxed">
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

        {/* 12 Document Types Grid with Modular 3D Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {DOCUMENT_TYPES.map((doc) => {
            const isPassport = doc.slug === "passport";
            const isCert = doc.slug === "birth-certificate" || doc.slug === "marriage-certificate";

            return (
              <Link
                key={doc.id}
                href={`/order/triage?doc=${doc.slug}`}
                className="group p-6 rounded-3xl bg-surface-raised border border-border hover:border-brand-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-border/70 overflow-hidden relative flex items-center justify-center text-brand-500 group-hover:scale-105 transition-transform shadow-sm">
                    {isPassport ? (
                      <Image
                        src="/images/doc-passport-3d.jpg"
                        alt="Minimalist 3D passport icon"
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : isCert ? (
                      <Image
                        src="/images/doc-certificate-3d.jpg"
                        alt="Minimalist 3D certificate icon"
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-brand-500" />
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-brand-ink group-hover:text-brand-500 transition-colors leading-snug">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-text-muted">
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
