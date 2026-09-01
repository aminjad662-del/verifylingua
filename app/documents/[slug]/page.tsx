import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO_DOCUMENTS } from "@/lib/seo-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ShieldCheck, CheckCircle2, FileText, ArrowRight, Clock, Building2, HelpCircle } from "lucide-react";

export function generateStaticParams() {
  return SEO_DOCUMENTS.map((doc) => ({
    slug: doc.slug,
  }));
}

export default async function DocumentSpokePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = SEO_DOCUMENTS.find((d) => d.slug === slug);

  if (!doc) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "name": doc.name,
        "description": doc.metaDescription,
        "provider": {
          "@type": "Organization",
          "name": "VerifyLingua",
          "url": "https://verifylingua.com",
        },
        "offers": {
          "@type": "Offer",
          "price": "24.95",
          "priceCurrency": "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://verifylingua.com",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Documents",
            "item": "https://verifylingua.com/documents",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": doc.name,
            "item": `https://verifylingua.com/documents/${doc.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1">
        {/* Page Hero */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-hero border-b border-border/60 px-6">
          <div className="max-w-4xl mx-auto space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="default" className="gap-1.5 py-1 px-3 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                USCIS Acceptance Guaranteed
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono">Flat $24.95 / page</Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-ink tracking-tight">
              {doc.h1}
            </h1>

            <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              {doc.intro}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="gap-2 px-8 h-14 rounded-2xl text-base font-bold shadow-md">
                <Link href={`/order/triage?doc=${doc.slug}`}>
                  Start translation with this document
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Requirements & Compliance Details */}
        <section className="py-16 md:py-24 bg-surface border-b border-border/60 px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-ink">
                Document Overview & Agency Standards
              </h2>
              <p className="text-base text-text-muted leading-relaxed">
                {doc.overview}
              </p>
            </div>

            {/* Compliance Rules Box */}
            <Card className="p-8 rounded-[32px] bg-surface-raised border-2 border-brand-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500">
                    Compliance Checklist
                  </span>
                  <h3 className="text-xl font-bold text-brand-ink">
                    Certification Standards for {doc.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-brand-500 font-mono font-bold">
                  <Clock className="w-4 h-4" />
                  <span>24h Turnaround</span>
                </div>
              </div>

              <div className="space-y-3">
                {doc.complianceRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
                    <span className="text-brand-ink font-medium">{req}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* FAQs */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-ink flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-brand-500" />
                Frequently Asked Questions
              </h2>

              <Accordion type="single" collapsible className="w-full space-y-3">
                {doc.faqs.map((faq, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`item-${idx}`}
                    className="border border-border rounded-2xl px-6 py-1 bg-surface-raised"
                  >
                    <AccordionTrigger className="text-base font-bold text-brand-ink text-left hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-text-muted leading-relaxed pt-2">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Internal Sibling Links */}
            <div className="pt-6 border-t border-border space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                Related Document Translations
              </span>
              <div className="flex flex-wrap gap-3">
                {doc.siblingSlugs.map((s) => (
                  <Button key={s} asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                    <Link href={`/documents/${s}`}>
                      {s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} Translation →
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
