import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AwwwardsHero } from "@/components/marketing/AwwwardsHero";
import { AwwwardsBento } from "@/components/marketing/AwwwardsBento";
import { SpyglassTickerBar } from "@/components/marketing/SpyglassTickerBar";
import { SpyglassPreFooterCTA } from "@/components/marketing/SpyglassPreFooterCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1A1816] selection:bg-[#1A1816] selection:text-white">
      <Header />
      <main className="flex-1">
        <AwwwardsHero />
        
        {/* We keep the ticker for social proof but styled appropriately */}
        <div className="border-y border-neutral-200 bg-white">
          <SpyglassTickerBar />
        </div>

        <AwwwardsBento />

        {/* Keeping PreFooter CTA for funnel completion */}
        <SpyglassPreFooterCTA />
      </main>
      <Footer />
    </div>
  );
}
