import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalHero } from "@/components/marketing/LegalHero";
import { InstitutionalTrustStrip } from "@/components/marketing/InstitutionalTrustStrip";
import { LegalPrecisionBento } from "@/components/marketing/LegalPrecisionBento";
import { WorkflowInteractive } from "@/components/marketing/WorkflowInteractive";
import { SynthesiaHero } from "@/components/marketing/SynthesiaHero";
import { SynthesiaWhyLoveBento } from "@/components/marketing/SynthesiaWhyLoveBento";
import { SynthesiaTrustPills } from "@/components/marketing/SynthesiaTrustPills";
import { AcceptanceNetworkBanner } from "@/components/marketing/AcceptanceNetworkBanner";
import { SynthesiaDarkHowItWorks } from "@/components/marketing/SynthesiaDarkHowItWorks";
import { SynthesiaStatsCards } from "@/components/marketing/SynthesiaStatsCards";
import { SynthesiaCategoryLeader } from "@/components/marketing/SynthesiaCategoryLeader";
import { SynthesiaCompetitorGrid } from "@/components/marketing/SynthesiaCompetitorGrid";
import { FAQSection } from "@/components/marketing/FAQSection";
import { SynthesiaDarkPreFooter } from "@/components/marketing/SynthesiaDarkPreFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-text selection:bg-brand-500/20 selection:text-brand-900 flex flex-col antialiased">
      <Header />
      <main className="flex-1 w-full">
        {/* Synthesia Full Landing Suite (Reference Screenshot Injection) */}
        <SynthesiaHero />
        <SynthesiaWhyLoveBento />
        <SynthesiaTrustPills />
        <AcceptanceNetworkBanner />
        <SynthesiaDarkHowItWorks />
        <SynthesiaStatsCards />
        <SynthesiaCategoryLeader />
        <SynthesiaCompetitorGrid />
        <FAQSection />
        <SynthesiaDarkPreFooter />

        {/* Legal Precision Institutional Verification Suite */}
        <div className="hidden">
          <LegalHero />
          <InstitutionalTrustStrip />
          <LegalPrecisionBento />
          <WorkflowInteractive />
        </div>
      </main>
      <Footer />
    </div>
  );
}
