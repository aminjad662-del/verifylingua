import React from "react";
import { HeroSection } from "@/components/marketing-saas/HeroSection";
import { BentoSection } from "@/components/marketing-saas/BentoSection";
import { PricingSection } from "@/components/marketing-saas/PricingSection";
import { FinalCTA } from "@/components/marketing-saas/FinalCTA";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
      <Header />
      
      <main className="flex flex-col w-full overflow-hidden pt-16">
        <HeroSection />
        <BentoSection />
        <PricingSection />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
