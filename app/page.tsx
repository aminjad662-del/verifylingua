import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SpyglassHero } from "@/components/marketing/SpyglassHero";
import { SpyglassTickerBar } from "@/components/marketing/SpyglassTickerBar";
import { SpyglassDarkMatrix } from "@/components/marketing/SpyglassDarkMatrix";
import { SpyglassEditorialLight } from "@/components/marketing/SpyglassEditorialLight";
import { SpyglassDeepBento } from "@/components/marketing/SpyglassDeepBento";
import { SpyglassStudioPreview } from "@/components/marketing/SpyglassStudioPreview";
import { SpyglassReviews } from "@/components/marketing/SpyglassReviews";
import { SpyglassToolkitGrid } from "@/components/marketing/SpyglassToolkitGrid";
import { SpyglassPreFooterCTA } from "@/components/marketing/SpyglassPreFooterCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-soft selection:bg-brand-100 selection:text-brand-ink">
      <Header />
      <main className="flex-1">
        {/* 1. Ultra-crisp minimal white hero with editorial bold heading & asymmetric floating document stack */}
        <SpyglassHero />

        {/* 2. High-contrast black ticker bar with continuous scrolling foreign legal document strip */}
        <SpyglassTickerBar />

        {/* 3. Dramatic dark section with 3-column high-density risk cards */}
        <SpyglassDarkMatrix />

        {/* 4. Split editorial feature section 1 (Light) with 6-card bento grid */}
        <SpyglassEditorialLight />

        {/* 5. Split editorial feature section 2 (Muted) with 4-card categorized document specimens */}
        <SpyglassDeepBento />

        {/* 6. Dark software preview section with high-density CounselDesk workspace UI */}
        <SpyglassStudioPreview />

        {/* 7. Immigration attorneys & filers testimonials dark grid */}
        <SpyglassReviews />

        {/* 8. 'One platform. every legal motion.' 4-card feature grid */}
        <SpyglassToolkitGrid />

        {/* 9. High-impact bottom dark CTA box & massive watermark brandmark */}
        <SpyglassPreFooterCTA />
      </main>
      <Footer />
    </div>
  );
}
