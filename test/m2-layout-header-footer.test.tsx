import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import fs from "fs";
import path from "path";

// Mock next/navigation for Header
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock lucide-react to avoid any dynamic icon issues
vi.mock("lucide-react", async () => {
  const actual = await vi.importActual<Record<string, any>>("lucide-react");
  return actual;
});

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

describe("Milestone M2 Layout & Copy Anti-Cliché Test Suite", () => {
  const repoRoot = path.resolve(__dirname, "..");

  // ─────────────────────────────────────────────────────────────
  // 1. Header Component Architecture & Styling
  // ─────────────────────────────────────────────────────────────
  describe("1. Header Component", () => {
    it("renders Header with Warm Ivory palette, Obsidian Ink brand mark, and Signal Orange CTA", () => {
      const html = renderToString(<Header />);

      // Warm Ivory canvas & border tokens
      expect(html).toContain("bg-canvas");
      expect(html).toContain("border-border");

      // Obsidian Ink brand tile
      expect(html).toContain("bg-surface-raised");
      expect(html).toContain("text-brand-ink");
      expect(html).toContain("Verify");
      expect(html).toContain("Lingua");
      expect(html).toContain("USCIS CERTIFIED");

      // Signal Orange Primary CTA routing to /order/triage
      expect(html).toContain("href=\"/order/triage\"");
      expect(html).toContain("bg-brand-500");
      expect(html).toContain("text-white");

      // Tactile press active physics
      expect(html).toContain("active:scale-[0.98]");

      // Zero em-dashes
      expect(html).not.toContain("—");
      expect(html).not.toContain("&mdash;");

      // Zero raw hex codes in rendered markup
      const hexMatches = html.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
      expect(hexMatches).toEqual([]);
    });

    it("verifies Header navigation links adhere to design system", () => {
      const html = renderToString(<Header />);

      expect(html).toContain("href=\"/pricing\"");
      expect(html).toContain("href=\"/how-it-works\"");
      expect(html).toContain("href=\"/counsel\"");
      expect(html).toContain("href=\"/verify\"");
      expect(html).toContain("href=\"/order/triage\"");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Footer Component Architecture & Statutory Compliance
  // ─────────────────────────────────────────────────────────────
  describe("2. Footer Component", () => {
    it("renders Footer with geometric sans headers and strictly isolated monospace data ledger", () => {
      const html = renderToString(<Footer />);

      // Category headers: geometric sans, uppercase, tracking-wider
      expect(html).toContain("text-xs uppercase tracking-wider text-brand-ink font-bold font-sans");

      // Monospace technical ledger
      expect(html).toContain("font-mono text-[11px]");
      expect(html).toContain("FIPS 140-2");
      expect(html).toContain("TLS 1.3");
      expect(html).toContain("/verify");
      expect(html).toContain("ZERO-RETENTION");

      // 3-Column statutory compliance block
      expect(html).toContain("8 CFR § 103.2(b)(3)");
      expect(html).toContain("ATA Corporate Member No. 278190");
      expect(html).toContain("ASTM F2575-14");
      expect(html).toContain("DE File No. 7491823");

      // Zero em-dashes
      expect(html).not.toContain("—");
      expect(html).not.toContain("&mdash;");

      // Zero raw hex codes in rendered markup
      const hexMatches = html.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
      expect(hexMatches).toEqual([]);
    });

    it("verifies Footer newsletter and interactive buttons feature tactile active press", () => {
      const html = renderToString(<Footer />);

      expect(html).toContain("active:scale-[0.98]");
      expect(html).toContain("bg-brand-500");
      expect(html).toContain("text-white");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Marketing Copy Anti-Cliché & Absolute Claims Audit
  // ─────────────────────────────────────────────────────────────
  describe("3. Marketing Copy Anti-Cliché & Absolute Claims Audit", () => {
    it("verifies lib/seo-data.ts:88 has zero em-dashes", () => {
      const seoDataPath = path.join(repoRoot, "lib", "seo-data.ts");
      const content = fs.readFileSync(seoDataPath, "utf8");
      const lines = content.split("\n");
      const line88 = lines[87] || ""; // 0-indexed line 88

      expect(line88).not.toContain("—");
      expect(line88).toContain(";");
    });

    it("verifies absolute claims are purged across critical marketing components", () => {
      const filesToCheck = [
        "components/marketing/FAQSection.tsx",
        "components/marketing/DiagnosticComparisonCards.tsx",
        "components/marketing/ComparisonTable.tsx",
        "components/marketing/InstitutionalAcceptanceStack.tsx",
        "components/marketing/RejectionMoatSection.tsx",
        "components/marketing/DarkProductHowItWorks.tsx",
        "app/pricing/page.tsx",
        "lib/constants.ts",
      ];

      const forbiddenPhrases = [
        "100% Guaranteed",
        "100% Acceptance Rate",
        "Physically impossible to breach",
        "100% pickpocket-proof",
        "100% invisible",
      ];

      for (const relativePath of filesToCheck) {
        const fullPath = path.join(repoRoot, relativePath);
        expect(fs.existsSync(fullPath)).toBe(true);
        const content = fs.readFileSync(fullPath, "utf8");

        for (const phrase of forbiddenPhrases) {
          const hasPhrase = content.toLowerCase().includes(phrase.toLowerCase());
          expect(
            hasPhrase,
            `File ${relativePath} contains forbidden absolute claim "${phrase}"`
          ).toBe(false);
        }
      }
    });

    it("verifies badge elements use font-sans instead of font-mono in marketing components", () => {
      const filesWithBadges = [
        "components/marketing/FAQSection.tsx",
        "components/marketing/DiagnosticComparisonCards.tsx",
        "components/marketing/ComparisonTable.tsx",
        "components/marketing/InstitutionalAcceptanceStack.tsx",
        "components/marketing/DarkProductHowItWorks.tsx",
      ];

      for (const relativePath of filesWithBadges) {
        const fullPath = path.join(repoRoot, relativePath);
        const content = fs.readFileSync(fullPath, "utf8");

        // Search for badge classes: none should have `font-mono` on section badges
        const badgeRegex = /<Badge[^>]*className=["'][^"']*font-mono[^"']*["']/g;
        const matches = content.match(badgeRegex);
        expect(
          matches,
          `File ${relativePath} contains font-mono on Badge component: ${matches}`
        ).toBeNull();
      }
    });
  });
});
