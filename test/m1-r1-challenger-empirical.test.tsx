import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import nextConfig from "@/next.config";

// Layout & Marketing Components
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalHero } from "@/components/marketing/LegalHero";
import { WorkflowInteractive } from "@/components/marketing/WorkflowInteractive";
import { BottomCTA } from "@/components/marketing/BottomCTA";
import { AcceptanceNetworkBanner } from "@/components/marketing/AcceptanceNetworkBanner";
import { DiagnosticComparisonCards } from "@/components/marketing/DiagnosticComparisonCards";
import { TranslationCinematicShowcase } from "@/components/marketing/TranslationCinematicShowcase";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { RejectionMoatSection } from "@/components/marketing/RejectionMoatSection";
import { CompetitorComparisonView } from "@/components/comparison/CompetitorComparisonView";
import { COMPETITORS } from "@/lib/comparisons";
import PricingPage from "@/app/pricing/page";

// Mock router and auth
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

describe("Challenger Empirical R1 Verification: Navigation Flow & 3-Layer Redirection", () => {
  const repoRoot = path.resolve(__dirname, "..");

  // ─────────────────────────────────────────────────────────────
  // 1. Static AST / Codebase Exhaustive Scan
  // ─────────────────────────────────────────────────────────────
  describe("1. Static Codebase Exhaustive Scan", () => {
    it("empirically verifies zero occurrences of href='/order/triage' across app/ and components/", () => {
      const dirs = ["app", "components"];
      const matches: { file: string; line: number; content: string }[] = [];

      function scanDir(dirPath: string) {
        if (!fs.existsSync(dirPath)) return;
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          if (entry.isDirectory()) {
            scanDir(fullPath);
          } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, "utf8");
            const lines = content.split("\n");
            lines.forEach((line, idx) => {
              // Ignore comments
              const trimmed = line.trim();
              if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
                return;
              }
              if (/href=["']\/order\/triage["']/.test(line)) {
                matches.push({
                  file: path.relative(repoRoot, fullPath),
                  line: idx + 1,
                  content: line.trim(),
                });
              }
            });
          }
        }
      }

      dirs.forEach((d) => scanDir(path.join(repoRoot, d)));
      expect(matches, `Found unexpected href="/order/triage" in: ${JSON.stringify(matches)}`).toEqual([]);
    });

    it("empirically verifies zero router navigation to /order/triage across app/ and components/", () => {
      const dirs = ["app", "components"];
      const matches: { file: string; line: number; content: string }[] = [];

      function scanDir(dirPath: string) {
        if (!fs.existsSync(dirPath)) return;
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          if (entry.isDirectory()) {
            scanDir(fullPath);
          } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
            // Exclude app/order/triage/page.tsx from this check
            if (fullPath.includes(path.join("app", "order", "triage"))) return;

            const content = fs.readFileSync(fullPath, "utf8");
            const lines = content.split("\n");
            lines.forEach((line, idx) => {
              const trimmed = line.trim();
              if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
                return;
              }
              if (/push\(["']\/order\/triage|navigate\(["']\/order\/triage|replace\(["']\/order\/triage/.test(line)) {
                matches.push({
                  file: path.relative(repoRoot, fullPath),
                  line: idx + 1,
                  content: line.trim(),
                });
              }
            });
          }
        }
      }

      dirs.forEach((d) => scanDir(path.join(repoRoot, d)));
      expect(matches, `Found navigation to /order/triage in: ${JSON.stringify(matches)}`).toEqual([]);
    });

    it("empirically verifies zero occurrences of data-start-translation-trigger in app/ and components/ (outside of context listener)", () => {
      const dirs = ["app", "components"];
      const matches: string[] = [];

      function scanDir(dirPath: string) {
        if (!fs.existsSync(dirPath)) return;
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          if (entry.isDirectory()) {
            scanDir(fullPath);
          } else if (/\.(tsx|ts)$/.test(entry.name)) {
            // Exclude TranslationModalContext.tsx listener
            if (entry.name === "TranslationModalContext.tsx") return;
            const content = fs.readFileSync(fullPath, "utf8");
            if (content.includes("data-start-translation-trigger")) {
              matches.push(path.relative(repoRoot, fullPath));
            }
          }
        }
      }

      dirs.forEach((d) => scanDir(path.join(repoRoot, d)));
      expect(matches).toEqual([]);
    });

    it("empirically verifies zero openModal() calls in marketing and comparison components", () => {
      const dirs = [
        path.join(repoRoot, "components", "marketing"),
        path.join(repoRoot, "components", "comparison"),
      ];
      const matches: { file: string; line: number; content: string }[] = [];

      dirs.forEach((dirPath) => {
        if (!fs.existsSync(dirPath)) return;
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          if (entry.isFile() && /\.(tsx|ts)$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, "utf8");
            const lines = content.split("\n");
            lines.forEach((line, idx) => {
              const trimmed = line.trim();
              if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
                return;
              }
              // Check if openModal is actually invoked
              if (/openModal\s*\(/.test(line)) {
                matches.push({
                  file: path.relative(repoRoot, fullPath),
                  line: idx + 1,
                  content: line.trim(),
                });
              }
            });
          }
        }
      });

      expect(matches, `Found unexpected openModal() call in marketing/comparison: ${JSON.stringify(matches)}`).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. 3-Layer Redirection Logic Verification
  // ─────────────────────────────────────────────────────────────
  describe("2. 3-Layer Redirection Logic Verification", () => {
    it("Layer 1: verifies Next.js redirects() in next.config.ts routes /order/triage to /translate", async () => {
      expect(typeof nextConfig.redirects).toBe("function");
      const redirects = await nextConfig.redirects!();
      
      const exactRule = redirects.find((r) => r.source === "/order/triage");
      expect(exactRule).toBeDefined();
      expect(exactRule?.destination).toBe("/translate");
      expect(exactRule?.permanent).toBe(false);

      const wildcardRule = redirects.find((r) => r.source === "/order/triage/:path*");
      expect(wildcardRule).toBeDefined();
      expect(wildcardRule?.destination).toBe("/translate");
      expect(wildcardRule?.permanent).toBe(false);
    });

    it("Layer 2: verifies middleware.ts issues HTTP 307 redirect to /translate preserving complex search params", () => {
      const testCases = [
        {
          url: "https://verifylingua.com/order/triage",
          expectedPath: "/translate",
          expectedSearch: "",
        },
        {
          url: "https://verifylingua.com/order/triage/",
          expectedPath: "/translate",
          expectedSearch: "",
        },
        {
          url: "https://verifylingua.com/order/triage/subflow",
          expectedPath: "/translate",
          expectedSearch: "",
        },
        {
          url: "https://verifylingua.com/order/triage?source=es&target=en&tier=certified",
          expectedPath: "/translate",
          expectedSearch: "?source=es&target=en&tier=certified",
        },
        {
          url: "https://verifylingua.com/order/triage?doc=birth-certificate&pages=4&vaultDoc=VL-DOC-9821",
          expectedPath: "/translate",
          expectedSearch: "?doc=birth-certificate&pages=4&vaultDoc=VL-DOC-9821",
        },
        {
          url: "https://verifylingua.com/order/triage?source=ar&target=en&special=%24%26%2B%2C%2F%3A%3B%3D%3F%40",
          expectedPath: "/translate",
          expectedSearch: "?source=ar&target=en&special=%24%26%2B%2C%2F%3A%3B%3D%3F%40",
        },
      ];

      for (const tc of testCases) {
        const req = new NextRequest(tc.url);
        const res = middleware(req);

        expect(res.status).toBe(307);
        const location = res.headers.get("location");
        expect(location).toBeDefined();

        const redirectUrl = new URL(location!);
        expect(redirectUrl.pathname).toBe(tc.expectedPath);
        expect(redirectUrl.search).toBe(tc.expectedSearch);
      }
    });

    it("Layer 2: verifies middleware.ts does NOT redirect other normal routes", () => {
      const normalUrls = [
        "https://verifylingua.com/",
        "https://verifylingua.com/translate",
        "https://verifylingua.com/pricing",
        "https://verifylingua.com/order/precheck",
        "https://verifylingua.com/order/configure",
      ];

      for (const url of normalUrls) {
        const req = new NextRequest(url);
        const res = middleware(req);
        // Non-redirect response should not have a 307 status
        expect(res.status).not.toBe(307);
      }
    });

    it("Layer 3: verifies app/order/triage/page.tsx file exists on disk with client-side redirect", () => {
      const triagePagePath = path.join(repoRoot, "app", "order", "triage", "page.tsx");
      expect(fs.existsSync(triagePagePath)).toBe(true);
      const content = fs.readFileSync(triagePagePath, "utf8");

      expect(content).toContain('router.replace("/translate"');
      expect(content).toContain("window.location.search");
    });

    it("verifies app/order/layout.tsx FUNNEL_STEPS does not include /order/triage", () => {
      const layoutPath = path.join(repoRoot, "app", "order", "layout.tsx");
      const content = fs.readFileSync(layoutPath, "utf8");

      expect(content).not.toContain('path: "/order/triage"');
      expect(content).toContain('path: "/order/precheck"');
      expect(content).toContain('name: "Configure", step: 1');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Rendered Marketing & Layout Components SSR Audit
  // ─────────────────────────────────────────────────────────────
  describe("3. Rendered Marketing & Layout Components SSR Audit", () => {
    it("verifies Header primary & mobile CTAs link to /translate", () => {
      const html = renderToString(<Header />);
      expect(html).toContain('href="/translate"');
      expect(html).not.toContain('href="/order/triage"');
      expect(html).not.toContain("data-start-translation-trigger");
    });

    it("verifies Footer primary CTA links to /translate", () => {
      const html = renderToString(<Footer />);
      expect(html).toContain('href="/translate"');
      expect(html).not.toContain('href="/order/triage"');
      expect(html).not.toContain("data-start-translation-trigger");
    });

    it("verifies LegalHero links directly to /translate", () => {
      const html = renderToString(<LegalHero />);
      expect(html).toContain('href="/translate"');
      expect(html).not.toContain('href="/order/triage"');
    });

    it("verifies WorkflowInteractive links directly to /translate", () => {
      const html = renderToString(<WorkflowInteractive />);
      expect(html).toContain('href="/translate"');
      expect(html).not.toContain('href="/order/triage"');
    });

    it("verifies BottomCTA links directly to /translate", () => {
      const html = renderToString(<BottomCTA />);
      expect(html).toContain('href="/translate"');
      expect(html).not.toContain('href="/order/triage"');
    });

    it("verifies AcceptanceNetworkBanner links directly to /translate", () => {
      const html = renderToString(<AcceptanceNetworkBanner />);
      expect(html).toContain('href="/translate"');
      expect(html).not.toContain('href="/order/triage"');
    });

    it("verifies DiagnosticComparisonCards links directly to /translate", () => {
      const html = renderToString(<DiagnosticComparisonCards />);
      expect(html).toContain('href="/translate"');
      expect(html).not.toContain('href="/order/triage"');
    });

    it("verifies TranslationCinematicShowcase links directly to /translate", () => {
      const html = renderToString(<TranslationCinematicShowcase />);
      expect(html).toContain('href="/translate"');
      expect(html).not.toContain('href="/order/triage"');
    });

    it("verifies ComparisonTable links directly to /translate without modal trigger", () => {
      const html = renderToString(<ComparisonTable />);
      expect(html).toContain('href="/translate"');
      expect(html).not.toContain('href="/order/triage"');
      expect(html).not.toContain("data-start-translation-trigger");
    });

    it("verifies RejectionMoatSection links directly to /translate without modal trigger", () => {
      const html = renderToString(<RejectionMoatSection />);
      expect(html).toContain('href="/translate"');
      expect(html).not.toContain('href="/order/triage"');
      expect(html).not.toContain("data-start-translation-trigger");
    });

    it("verifies CompetitorComparisonView links directly to /translate for all competitors", () => {
      const competitors = Object.values(COMPETITORS);
      for (const comp of competitors) {
        const html = renderToString(<CompetitorComparisonView profile={comp} />);
        expect(html).toContain('href="/translate"');
        expect(html).not.toContain('href="/order/triage"');
        expect(html).not.toContain("data-start-translation-trigger");
      }
    });

    it("verifies PricingPage CTAs link directly to /translate preserving tier", () => {
      const html = renderToString(<PricingPage />);
      expect(html).toContain('href="/translate?');
      expect(html).toContain("tier=certified");
      expect(html).not.toContain('href="/order/triage"');
    });
  });
});
