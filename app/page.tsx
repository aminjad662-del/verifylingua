import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/marketing/Hero";
import { TrustStats } from "@/components/marketing/TrustStats";
import { DiagnosticComparisonCards } from "@/components/marketing/DiagnosticComparisonCards";
import { TranslationCinematicShowcase } from "@/components/marketing/TranslationCinematicShowcase";
import { DarkProductHowItWorks } from "@/components/marketing/DarkProductHowItWorks";
import { CertifiedSampleShowcase } from "@/components/marketing/CertifiedSampleShowcase";
import { InstitutionalAcceptanceStack } from "@/components/marketing/InstitutionalAcceptanceStack";
import { SunsamaFeatureBento } from "@/components/marketing/SunsamaFeatureBento";
import { AcceptanceNetworkBanner } from "@/components/marketing/AcceptanceNetworkBanner";
import { PacketBreakdownSection } from "@/components/marketing/PacketBreakdownSection";
import { DocumentTypes } from "@/components/marketing/DocumentTypes";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { RejectionMoatSection } from "@/components/marketing/RejectionMoatSection";
import { FAQSection } from "@/components/marketing/FAQSection";
import { BottomCTA } from "@/components/marketing/BottomCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-soft selection:bg-brand-100 selection:text-brand-ink">
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustStats />
        <DiagnosticComparisonCards />
        <TranslationCinematicShowcase />
        <DarkProductHowItWorks />
        <CertifiedSampleShowcase />
        <InstitutionalAcceptanceStack />
        <SunsamaFeatureBento />
        <AcceptanceNetworkBanner />
        <PacketBreakdownSection />
        <DocumentTypes />
        <ComparisonTable />
        <RejectionMoatSection />
        <FAQSection />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
