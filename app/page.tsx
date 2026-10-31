import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SovereignLegalConsole } from "@/components/marketing/SovereignLegalConsole";
import { UscisComplianceBento } from "@/components/marketing/UscisComplianceBento";
import { LegalComparisonMatrix } from "@/components/marketing/LegalComparisonMatrix";
import { PreFooterCTA } from "@/components/marketing/PreFooterCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-text selection:bg-brand-500/20 selection:text-brand-900 flex flex-col antialiased">
      {/* 1. Global Navigation Header */}
      <Header />
      
      <main className="flex-1 w-full">
        {/* 2. Unified Sovereign Legal Console & Document Inspection Stage */}
        <SovereignLegalConsole />

        {/* 3. USCIS 8 CFR § 103.2 Compliance Bento & Institutional Legal Trust */}
        <UscisComplianceBento />

        {/* 4. Transparent Feature & Compliance Comparison Matrix */}
        <LegalComparisonMatrix />

        {/* 5. Sovereign Pre-Footer Intake Hub */}
        <PreFooterCTA />
      </main>

      {/* 6. Global Comprehensive Institutional Footer */}
      <Footer />
    </div>
  );
}
