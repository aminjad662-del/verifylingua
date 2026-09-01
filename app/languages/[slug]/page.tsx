import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO_LANGUAGES } from "@/lib/seo-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Globe2, ShieldCheck, CheckCircle2, ArrowRight, Clock, HelpCircle } from "lucide-react";

export function generateStaticParams() {
  return SEO_LANGUAGES.map((lang) => ({
    slug: lang.slug,
  }));
}

export default async function LanguageSpokePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lang = SEO_LANGUAGES.find((l) => l.slug === slug);

  if (!lang) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "name": lang.name,
        "description": lang.metaDescription,
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
            "name": "Languages",
            "item": "https://verifylingua.com/languages",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": lang.name,
            "item": `https://verifylingua.com/languages/${lang.slug}`,
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
        {/* Hero Section */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-hero border-b border-border/60 px-6">
          <div className="max-w-4xl mx-auto space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="default" className="gap-1.5 py-1 px-3 text-xs font-bold uppercase tracking-wider">
                <Globe2 className="w-4 h-4 text-brand-500" />
                Accredited Native Translators
              </Badge>
              {lang.dir === "rtl" && (
                <Badge variant="secondary" className="text-xs font-mono">Specialized RTL Mirror-Formatting</Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-ink tracking-tight">
              {lang.h1}
            </h1>

            <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              {lang.intro}
            </p>

            <div className="pt-4 flex items-center justify-center">
              <Button size="lg" asChild className="gap-2 px-8 h-14 rounded-2xl text-base font-bold shadow-md">
                <Link href={`/order/triage?source=${lang.code}`}>
                  Translate {lang.name} Document
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Details & Origin Countries */}
        <section className="py-16 md:py-24 bg-surface border-b border-border/60 px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <Card className="p-8 rounded-[32px] bg-surface-raised border border-border space-y-6">
              <h2 className="text-xl font-bold text-brand-ink">
                Common Origin Countries & Jurisdictions
              </h2>

              <div className="flex flex-wrap gap-2">
                {lang.commonOrigins.map((origin) => (
                  <span
                    key={origin}
                    className="px-3.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-brand-ink"
                  >
                    {origin}
                  </span>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-lavender-50 border border-border text-xs text-text-muted leading-relaxed">
                <strong className="text-brand-ink font-bold">Linguistic Formatting Standards:</strong> {lang.formattingNotes}
              </div>
            </Card>

            {/* FAQs */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-ink flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-brand-500" />
                {lang.name} Translation FAQs
              </h2>

              <Accordion type="single" collapsible className="w-full space-y-3">
                {lang.faqs.map((faq, idx) => (
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
                Related Languages
              </span>
              <div className="flex flex-wrap gap-3">
                {lang.siblingSlugs.map((s) => (
                  <Button key={s} asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                    <Link href={`/languages/${s}`}>
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
