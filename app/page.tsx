import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SpyglassHero } from "@/components/marketing/SpyglassHero";
import { SpyglassDarkMatrix } from "@/components/marketing/SpyglassDarkMatrix";
import { SpyglassReviews } from "@/components/marketing/SpyglassReviews";
import { SpyglassDeepBento } from "@/components/marketing/SpyglassDeepBento";
import { SpyglassEditorialLight } from "@/components/marketing/SpyglassEditorialLight";
import { SpyglassToolkitGrid } from "@/components/marketing/SpyglassToolkitGrid";
import { SpyglassPricing } from "@/components/marketing/SpyglassPricing";
import { FAQSection } from "@/components/marketing/FAQSection";
import { SpyglassPreFooterCTA } from "@/components/marketing/SpyglassPreFooterCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-soft selection:bg-brand-100 selection:text-brand-ink">
      <Header />
      <main className="flex-1">
        <SpyglassHero />
        <SpyglassDarkMatrix />
        <SpyglassReviews />
        <SpyglassDeepBento />
        <SpyglassEditorialLight />
        <SpyglassToolkitGrid />
        <SpyglassPricing />
        <FAQSection />
        <SpyglassPreFooterCTA />
      </main>
      <Footer />
    </div>
  );
}

