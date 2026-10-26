import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalHero } from "@/components/marketing/LegalHero";
import { InstitutionalTrustStrip } from "@/components/marketing/InstitutionalTrustStrip";
import { LegalPrecisionBento } from "@/components/marketing/LegalPrecisionBento";
import { WorkflowInteractive } from "@/components/marketing/WorkflowInteractive";
import { LegalComparisonMatrix } from "@/components/marketing/LegalComparisonMatrix";
import { PreFooterCTA } from "@/components/marketing/PreFooterCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-text selection:bg-brand-500/20 selection:text-brand-900 flex flex-col antialiased">
      {/* 1. Global Navigation Header with Strict Auth State Boundary */}
      <Header />
      
      <main className="flex-1 w-full">
        {/* 2. Asymmetric Legal Translation Hero with Interactive Document Inspector */}
        <LegalHero />

        {/* 3. Federal & Court Institutional Trust Strip */}
        <InstitutionalTrustStrip />

        {/* 4. Asymmetric Bento Grid: 1:1 Preservation, SHA-256 Seal, Sworn Affidavit, RFE Warranty */}
        <LegalPrecisionBento />

        {/* 5. 4-Stage Interactive Workflow in Unified Light Theme */}
        <WorkflowInteractive />

        {/* 6. Transparent Feature & Compliance Comparison Matrix */}
        <LegalComparisonMatrix />

        {/* 7. Sovereign Pre-Footer CTA */}
        <PreFooterCTA />
      </main>

      {/* 8. Global Comprehensive Footer */}
      <Footer />
    </div>
  );
}
