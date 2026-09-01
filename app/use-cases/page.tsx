import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomCTA } from "@/components/marketing/BottomCTA";
import { SEO_USE_CASES } from "@/lib/seo-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Building2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function UseCasesHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <Header />
      <main className="flex-1">
        {/* Hub Hero */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-hero border-b border-border/60 text-center px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <Badge variant="default" className="gap-1.5 py-1 px-4 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              Institutional Compliance Guides
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-ink tracking-tight">
              Certified Translation by Use Case
            </h1>

            <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              Find exact legal certification standards, required document lists, and agency compliance rules for your specific filing.
            </p>
          </div>
        </section>

        {/* Use Cases Grid */}
        <section className="py-16 md:py-24 bg-surface border-b border-border/60 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {SEO_USE_CASES.map((uc) => (
              <Card
                key={uc.slug}
                className="p-8 rounded-[32px] bg-surface-raised border border-border hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs font-mono">
                      {uc.agency}
                    </Badge>
                    <span className="text-xs font-mono text-brand-500 font-bold">
                      Flat $24.95 / page
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-brand-ink leading-tight">
                      {uc.title}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {uc.intro}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 text-xs text-text-muted">
                    {uc.requiredDocuments.slice(0, 2).map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-bold">
                    <Link href={`/use-cases/${uc.slug}`}>
                      View Filing Guide
                    </Link>
                  </Button>

                  <Button asChild size="sm" className="gap-1.5 rounded-xl text-xs font-bold">
                    <Link href="/order/triage">
                      Start translation
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
