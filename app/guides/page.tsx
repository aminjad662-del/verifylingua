import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomCTA } from "@/components/marketing/BottomCTA";
import { SEO_GUIDES } from "@/lib/seo-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, ArrowRight, ShieldCheck } from "lucide-react";

export default function GuidesHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <Header />
      <main className="flex-1">
        {/* Hub Hero */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-hero border-b border-border/60 text-center px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <Badge variant="default" className="gap-1.5 py-1 px-4 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-brand-500" />
              USCIS Rejection Prevention & Legal Guides
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-ink tracking-tight">
              Certified Translation Knowledge Hub
            </h1>

            <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              Researched compliance guides, USCIS RFE prevention strategies, and official regulation breakdowns.
            </p>
          </div>
        </section>

        {/* Guides Grid */}
        <section className="py-16 md:py-24 bg-surface border-b border-border/60 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {SEO_GUIDES.map((guide) => (
              <Card
                key={guide.slug}
                className="p-8 rounded-[32px] bg-surface-raised border border-border hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                    <span className="text-brand-500 font-bold">{guide.readTime}</span>
                    <span>Updated {guide.lastUpdated}</span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-brand-ink leading-tight">
                      {guide.title}
                    </h2>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {guide.intro}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <Button asChild size="sm" className="gap-1.5 rounded-xl text-xs font-bold">
                    <Link href={`/guides/${guide.slug}`}>
                      Read Complete Guide
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
