import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToString } from "react-dom/server";
import fs from "fs";
import path from "path";
import HomePage from "@/app/page";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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

// Mock Next.js navigation and auth
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/components/translation/TranslationModalContext", () => ({
  useTranslationModal: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isOpen: false,
  }),
  TranslationModalProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe("Homepage Screenshot Redesign & /translate Direct Navigation Verification", () => {
  it("renders full Synthesia-aligned landing page structure matching screenshot reference", () => {
    const html = renderToString(<HomePage />);

    // 1. Hero Alternative Headline & CTAs
    expect(html).toContain("Looking for a certified legal translation");
    expect(html).toContain("alternative?");
    expect(html).toContain("Start Certified Translation");
    expect(html).toContain('href="/translate"');

    // 2. Integrated Comparison Matrix in Hero
    expect(html).toContain("RushTranslate");
    expect(html).toContain("Rev");
    expect(html).toContain("8 CFR");

    // 3. Why Customers Love VerifyLingua Bento
    expect(html).toContain("Why customers love VerifyLingua");
    expect(html).toContain("Instant tamper-evident verification");
    expect(html).toContain("CERTIFICATE_ACCURACY_SEAL.PDF");

    // 4. Trust Ribbon Pills & 50-State Acceptance
    expect(html).toContain("Zero-Model Training");
    expect(html).toContain("256-Bit TLS Vault");
    expect(html).toContain("Filing With Confidence in All 50 States");

    // 5. Dark Interactive How It Works Stage
    expect(html).toContain("Optical Ingestion");
    expect(html).toContain("Pre-Payment Quality Triage &amp; Stamp Extraction");

    // 6. Metrics / Stats Section
    expect(html).toContain("You don&#x27;t have to choose between cost, time, and quality");
    expect(html).toContain("+$10K");
    expect(html).toContain("90%");

    // 7. Category Leader Section
    expect(html).toContain("Leader");
    expect(html).toContain("Certified Legal Translation");

    // 8. Competitor Comparison Grid
    expect(html).toContain("See how VerifyLingua compares to other translation services");

    // 9. FAQ Accordion
    expect(html).toContain("Frequently Asked Questions");
    expect(html).toContain("What is a Certified Translation, and how is it accepted by USCIS?");

    // 10. Dark Pre-Footer Banner
    expect(html).toContain("Produce Certified Translations");
    expect(html).toContain("Start Your Translation Today");

    // Must NOT link to /order/triage anywhere on the homepage
    expect(html).not.toContain('href="/order/triage"');
  });

  it("verifies Cloudflare Pages edge redirects file routes /order/triage to /translate", () => {
    const redirectsPath = path.join(process.cwd(), "public", "_redirects");
    expect(fs.existsSync(redirectsPath)).toBe(true);

    const content = fs.readFileSync(redirectsPath, "utf8");
    expect(content).toContain("/order/triage /translate 302");
    expect(content).toContain("/order/triage/* /translate 302");
  });

  it("verifies Header and Footer CTAs route directly to /translate", () => {
    const headerHtml = renderToString(<Header />);
    const footerHtml = renderToString(<Footer />);

    expect(headerHtml).toContain('href="/translate"');
    expect(headerHtml).not.toContain('href="/order/triage"');

    expect(footerHtml).toContain('href="/translate"');
    expect(footerHtml).not.toContain('href="/order/triage"');
  });
});
