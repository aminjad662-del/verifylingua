import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AwwwardsHero } from "@/components/marketing/AwwwardsHero";
import { AwwwardsPipeline } from "@/components/marketing/AwwwardsPipeline";
import { AwwwardsBento } from "@/components/marketing/AwwwardsBento";
import { PricingSection } from "@/components/marketing-saas/PricingSection";
import { FinalCTA } from "@/components/marketing-saas/FinalCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full overflow-hidden">
        {/* 1. Hero Section with Interactive Document Inspection Stage */}
        <AwwwardsHero />

        {/* 2. Real-Time 8-Agent State Machine & Telemetry Console */}
        <AwwwardsPipeline />

        {/* 3. High-Density Bento Grid Architecture (8 CFR § 103.2, ATA Accreditation) */}
        <AwwwardsBento />

        {/* 4. Transparent Commercial Legal Pricing Matrix */}
        <PricingSection />

        {/* 5. Final Compliance Call to Action */}
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
