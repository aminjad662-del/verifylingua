import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { ScrollWorldHero } from "@/components/marketing/ScrollWorldHero";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("ScrollWorldHero — Continuous Scroll Diorama World Component", () => {
  it("renders the hero headline, value proposition, and direct /translate action", () => {
    const html = renderToString(<ScrollWorldHero />);

    // 1. Headline and positioning
    expect(html).toContain("Looking for a certified legal translation");
    expect(html).toContain("alternative?");
    expect(html).toContain("Start Certified Translation");
    expect(html).toContain('href="/translate"');

    // 2. Statutory trust badges
    expect(html).toContain("8 CFR");
    expect(html).toContain("ATA Member No. 278190");
    expect(html).toContain("Acceptance Guarantee");
  });

  it("renders all 5 continuous diorama world stations and narrative journeys", () => {
    const html = renderToString(<ScrollWorldHero />);

    // 5 Diorama Stages from scroll-world architecture
    expect(html).toContain("Global Document Intake");
    expect(html).toContain("Neural Forensic Layout Engine");
    expect(html).toContain("ATA-Certified Jurat &amp; Notary");
    expect(html).toContain("Sovereign Cryptographic Vault");
    expect(html).toContain("Institutional Acceptance Gateway");
  });

  it("renders the interactive scrubber navigation and journey controls", () => {
    const html = renderToString(<ScrollWorldHero />);

    // Scrubber station tags
    expect(html).toContain("01 INTAKE");
    expect(html).toContain("02 ENGINE");
    expect(html).toContain("03 CERTIFY");
    expect(html).toContain("04 VAULT");
    expect(html).toContain("05 ACCEPT");
  });

  it("renders the integrated comparison matrix with competitor benchmarks", () => {
    const html = renderToString(<ScrollWorldHero />);

    // Competitor matrix data
    expect(html).toContain("RushTranslate");
    expect(html).toContain("Rev");
    expect(html).toContain("Comprehensive Verification Matrix");
    expect(html).toContain("$24.95 / page");
  });

  it("does not contain any links to /order/triage", () => {
    const html = renderToString(<ScrollWorldHero />);
    expect(html).not.toContain('href="/order/triage"');
  });
});
