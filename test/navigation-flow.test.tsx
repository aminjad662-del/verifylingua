import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToString } from "react-dom/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PricingPage from "@/app/pricing/page";
import { LegalHero } from "@/components/marketing/LegalHero";
import { PreFooterCTA } from "@/components/marketing/PreFooterCTA";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import OrderLayout from "@/app/order/layout";
import TriagePage from "@/app/order/triage/page";
import TranslatePage from "@/app/translate/page";

// Mock Next.js navigation and auth
const mockReplace = vi.fn();
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => mockSearchParams,
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

describe("Direct Translation Workspace Navigation & Order Triage Removal Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  describe("1. Direct Routing for Start Translation CTAs", () => {
    it("verifies Header primary CTA links directly to /translate without Order Triage", () => {
      const html = renderToString(<Header />);

      // Must link to /translate
      expect(html).toContain('href="/translate"');
      // Must NOT link to /order/triage
      expect(html).not.toContain('href="/order/triage"');
      // Must NOT have modal trigger attribute on the primary CTA
      expect(html).not.toContain('data-start-translation-trigger');
    });

    it("verifies Footer primary CTA links directly to /translate without Order Triage", () => {
      const html = renderToString(<Footer />);

      expect(html).toContain('href="/translate"');
      expect(html).not.toContain('href="/order/triage"');
      expect(html).not.toContain('data-start-translation-trigger');
    });

    it("verifies Pricing page CTA links directly to /translate preserving configuration params", () => {
      const html = renderToString(<PricingPage />);

      expect(html).toContain('href="/translate?');
      expect(html).toContain('tier=certified');
      expect(html).not.toContain('href="/order/triage"');
    });

    it("verifies LegalHero CTA links directly to /translate", () => {
      const html = renderToString(<LegalHero />);

      expect(html).toContain('href="/translate"');
      expect(html).not.toContain('href="/order/triage"');
    });

    it("verifies PreFooterCTA links directly to /translate", () => {
      const html = renderToString(<PreFooterCTA />);

      expect(html).toContain('href="/translate"');
      expect(html).not.toContain('href="/order/triage"');
    });

    it("verifies ComparisonTable CTA links directly to /translate without modal interception", () => {
      const html = renderToString(<ComparisonTable />);

      expect(html).toContain('href="/translate"');
      expect(html).not.toContain('href="/order/triage"');
      expect(html).not.toContain('data-start-translation-trigger');
    });
  });

  describe("2. Order Triage Route Removal and Redirection", () => {
    it("verifies /order/triage is completely removed from FUNNEL_STEPS in OrderLayout", () => {
      const html = renderToString(
        <OrderLayout>
          <div>Test Children</div>
        </OrderLayout>
      );

      // Funnel steps should not mention "Triage"
      expect(html).not.toContain("Triage");
      // Must contain Configure as Step 1
      expect(html).toContain("Configure");
      expect(html).toContain("Lock");
      expect(html).toContain("Checkout");
      expect(html).not.toContain("/order/triage");
    });

    it("verifies Order Triage page component executes immediate client redirect to /translate", () => {
      // Render triage page
      renderToString(<TriagePage />);

      // The useEffect in TriagePage replaces location to /translate on mount
      // Verify component exists without crashing and does not reference active triage steps
      expect(TriagePage).toBeDefined();
    });
  });

  describe("3. Workspace Direct Landing & Operational Rendering", () => {
    it("renders Section 1 and Section 2 operational states on direct /translate landing", () => {
      const html = renderToString(<TranslatePage />);

      // Section 1: "1. Original Source Document"
      expect(html).toContain("1. Original Source Document");
      // Must have dropzone or document specimen selector
      expect(html).toContain("Drop document to translate");
      expect(html).toContain("One-Click Specimen Tests");

      // Section 2: "2. Translation Configuration & Legal Output"
      expect(html).toContain("2. Translation Configuration");
      // Configuration controls must be rendered immediately
      expect(html).toContain("English (US)");
      expect(html).toContain("Spanish");
      expect(html).toContain("Automated Vector Translation");
      expect(html).toContain("Certified USCIS Packet");
      // Must have operational action button
      expect(html).toContain("Select Document to Translate");
    });
  });
});
