import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO_USE_CASES } from "@/lib/seo-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ShieldCheck, CheckCircle2, FileText, ArrowRight, Building2, HelpCircle } from "lucide-react";

export function generateStaticParams() {
  return SEO_USE_CASES.map((uc) => ({
    slug: uc.slug,
  }));
}

export default async function UseCaseSpokePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const useCase = SEO_USE_CASES.find((u) => u.slug === slug);

  if (!useCase) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "name": useCase.title,
        "description": useCase.metaDescription,
        "provider": {
          "@type": "Organization",
          "name": "VerifyLingua",
          "url": "https://verifylingua.com",
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
            "name": "Use Cases",
            "item": "https://verifylingua.com/use-cases",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": useCase.title,
            "item": `https://verifylingua.com/use-cases/${useCase.slug}`,
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
        {/* Hero */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-hero border-b border-border/60 px-6">
          <div className="max-w-4xl mx-auto space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="default" className="gap-1.5 py-1 px-3 text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-brand-500" />
                {useCase.agency}
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono">100% Acceptance Guaranteed</Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-ink tracking-tight">
              {useCase.h1}
            </h1>

            <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              {useCase.intro}
            </p>

            <div className="pt-4 flex items-center justify-center">
              <Button size="lg" asChild className="gap-2 px-8 h-14 rounded-2xl text-base font-bold shadow-md">
                <Link href="/order/triage">
                  Start translation for this filing
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Requirements & Checklist */}
        <section className="py-16 md:py-24 bg-surface border-b border-border/60 px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Required Documents */}
              <Card className="p-7 rounded-[32px] bg-surface-raised border border-border space-y-4">
                <h3 className="text-lg font-bold text-brand-ink flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-500" />
                  Commonly Required Documents
                </h3>
                <div className="space-y-2.5">
                  {useCase.requiredDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                      <span className="text-brand-ink font-medium">{doc}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Certification Rules */}
              <Card className="p-7 rounded-[32px] bg-surface-raised border border-border space-y-4">
                <h3 className="text-lg font-bold text-brand-ink flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-500" />
                  Mandatory Legal Rules
                </h3>
                <div className="space-y-2.5">
                  {useCase.certificationRules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                      <span className="text-brand-ink font-medium">{rule}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* FAQs */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-ink flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-brand-500" />
                Frequently Asked Questions
              </h2>

              <Accordion type="single" collapsible className="w-full space-y-3">
                {useCase.faqs.map((faq, idx) => (
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

            {/* Sibling Links */}
            <div className="pt-6 border-t border-border space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                Related Filing Use Cases
              </span>
              <div className="flex flex-wrap gap-3">
                {useCase.siblingSlugs.map((s) => (
                  <Button key={s} asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                    <Link href={`/use-cases/${s}`}>
                      {s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} →
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
