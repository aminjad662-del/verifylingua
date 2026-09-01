import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/marketing/Hero";
import { TrustStats } from "@/components/marketing/TrustStats";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { CertifiedSampleShowcase } from "@/components/marketing/CertifiedSampleShowcase";
import { DocumentTypes } from "@/components/marketing/DocumentTypes";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { RejectionMoatSection } from "@/components/marketing/RejectionMoatSection";
import { FAQSection } from "@/components/marketing/FAQSection";
import { BottomCTA } from "@/components/marketing/BottomCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text selection:bg-brand-100 selection:text-brand-ink">
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustStats />
        <HowItWorks />
        <CertifiedSampleShowcase />
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
