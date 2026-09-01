import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO_GUIDES } from "@/lib/seo-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { BookOpen, Clock, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export function generateStaticParams() {
  return SEO_GUIDES.map((g) => ({
    slug: g.slug,
  }));
}

export default async function GuideSpokePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = SEO_GUIDES.find((g) => g.slug === slug);

  if (!guide) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": guide.title,
        "description": guide.metaDescription,
        "author": {
          "@type": "Organization",
          "name": "VerifyLingua Legal Compliance Team",
        },
        "publisher": {
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
            "name": "Guides",
            "item": "https://verifylingua.com/guides",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": guide.title,
            "item": `https://verifylingua.com/guides/${guide.slug}`,
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
        {/* Guide Article Hero */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-hero border-b border-border/60 px-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="gap-1.5 py-1 px-3 text-xs font-mono font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                Legal Authority Guide
              </Badge>
              <span className="text-xs font-mono text-text-muted">
                {guide.readTime} • Updated {guide.lastUpdated}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-ink tracking-tight leading-tight">
              {guide.h1}
            </h1>

            <p className="text-base sm:text-lg text-text-muted leading-relaxed">
              {guide.intro}
            </p>
          </div>
        </section>

        {/* Article Body */}
        <section className="py-16 md:py-24 bg-surface border-b border-border/60 px-6">
          <article className="max-w-3xl mx-auto space-y-10">
            {guide.sections.map((sec, idx) => (
              <div key={idx} className="space-y-3">
                <h2 className="text-2xl font-bold text-brand-ink">
                  {sec.title}
                </h2>
                <p className="text-base text-text-muted leading-relaxed">
                  {sec.content}
                </p>
              </div>
            ))}

            {/* In-Article Action CTA */}
            <Card className="p-8 rounded-[32px] bg-gradient-panel border-2 border-brand-100 shadow-md text-center space-y-4">
              <ShieldCheck className="w-10 h-10 text-brand-500 mx-auto" />
              <h3 className="text-2xl font-black text-brand-ink">
                Need a USCIS-Compliant Certified Translation?
              </h3>
              <p className="text-sm text-text-muted max-w-md mx-auto">
                Get an instant quote and pre-payment readability check in under 5 seconds. Flat $24.95/page.
              </p>
              <Button size="lg" asChild className="gap-2 px-8 h-12 rounded-xl text-sm font-bold shadow-md">
                <Link href="/order/triage">
                  Start translation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </Card>

            {/* FAQs */}
            {guide.faqs && guide.faqs.length > 0 && (
              <div className="space-y-6 pt-4">
                <h2 className="text-2xl font-bold text-brand-ink flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-brand-500" />
                  Frequently Asked Questions
                </h2>

                <Accordion type="single" collapsible className="w-full space-y-3">
                  {guide.faqs.map((faq, idx) => (
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
            )}

            {/* Related Documents */}
            <div className="pt-8 border-t border-border space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                Translate These Official Documents
              </span>
              <div className="flex flex-wrap gap-2.5">
                {guide.relatedDocSlugs.map((s) => (
                  <Button key={s} asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                    <Link href={`/documents/${s}`}>
                      {s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} Translation →
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
