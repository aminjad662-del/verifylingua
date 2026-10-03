import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SynthesiaHero } from "@/components/marketing/SynthesiaHero";
import { SynthesiaWhyLoveBento } from "@/components/marketing/SynthesiaWhyLoveBento";
import { SynthesiaTrustPills } from "@/components/marketing/SynthesiaTrustPills";
import { SynthesiaDarkHowItWorks } from "@/components/marketing/SynthesiaDarkHowItWorks";
import { SynthesiaStatsCards } from "@/components/marketing/SynthesiaStatsCards";
import { SynthesiaCategoryLeader } from "@/components/marketing/SynthesiaCategoryLeader";
import { SynthesiaCompetitorGrid } from "@/components/marketing/SynthesiaCompetitorGrid";
import { SynthesiaDarkPreFooter } from "@/components/marketing/SynthesiaDarkPreFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-slate-900 selection:bg-brand-500/20 selection:text-brand-900 flex flex-col antialiased">
      {/* 1. Global Navigation Header */}
      <Header />
      
      <main className="flex-1 w-full overflow-hidden">
        {/* 2. Synthesia-Inspired Hero with Floating Head-to-Head Comparison Matrix */}
        <SynthesiaHero />

        {/* 3. 3-Card Bento Stack: Instant Verification, Firm Collaboration, 100% USCIS Acceptance */}
        <SynthesiaWhyLoveBento />

        {/* 4. 4 Horizontal Trust Badges Strip (Zero-Training, TLS Vault, 8 CFR § 103.2, ATA Accredited) */}
        <SynthesiaTrustPills />

        {/* 5. Midnight Obsidian Studio Tour: 4 Interactive Workflow Stage Tabs */}
        <SynthesiaDarkHowItWorks />

        {/* 6. High-Contrast Stats Cards: +$10K Savings, 90% Faster, 100% USCIS Acceptance */}
        <SynthesiaStatsCards />

        {/* 7. Category Leadership: 2x2 Coordinate Quadrant & 10-Badge Award Ribbon */}
        <SynthesiaCategoryLeader />

        {/* 8. 3x3 Competitor Matrix: Direct Head-to-Head Feature Comparison */}
        <SynthesiaCompetitorGrid />

        {/* 9. Midnight Obsidian Pre-Footer CTA: Produce Translations Faster & Sample Inspector */}
        <SynthesiaDarkPreFooter />
      </main>

      {/* 10. Global Comprehensive Footer */}
      <Footer />
    </div>
  );
}
