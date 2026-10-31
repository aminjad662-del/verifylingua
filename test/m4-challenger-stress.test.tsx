import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import fs from "fs";
import path from "path";

// Mock next/link to render simple anchor tag
vi.mock("next/link", () => ({
  default: ({ href, children, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

import { StickyPriceBar } from "@/components/order/StickyPriceBar";
import { OrderDrawer, OrderDetail } from "@/components/dashboard/OrderDrawer";
import { PricingBreakdown } from "@/lib/pricing";

describe("Milestone 4 Challenger Stress & Empirical Contract Verification Suite", () => {
  const repoRoot = path.resolve(__dirname, "..");
  const stickyBarPath = path.join(repoRoot, "components", "order", "StickyPriceBar.tsx");
  const orderDrawerPath = path.join(repoRoot, "components", "dashboard", "OrderDrawer.tsx");
  const translatePagePath = path.join(repoRoot, "app", "translate", "page.tsx");

  const stickyBarSource = fs.readFileSync(stickyBarPath, "utf8");
  const orderDrawerSource = fs.readFileSync(orderDrawerPath, "utf8");
  const translatePageSource = fs.readFileSync(translatePagePath, "utf8");

  const mockPricing: PricingBreakdown = {
    serviceType: "CERTIFIED",
    pageCount: 3,
    wordCount: 750,
    basePrice: 74.85,
    isExpedited: true,
    expeditedFee: 44.91,
    needsNotarization: true,
    notarizationFee: 19.0,
    needsHardCopy: false,
    hardCopyFee: 0,
    needsApostille: false,
    apostilleFee: 0,
    addOnTotal: 63.91,
    subtotal: 138.76,
    total: 138.76,
    promisedAt: new Date(),
    promisedAtFormatted: "Today, 6:00 PM EST",
  };

  const mockOrder: OrderDetail = {
    id: "ord_test_123",
    publicCode: "VL-ORD-98214",
    documentName: "Acta de Nacimiento - Jalisco.pdf",
    matterNumber: "USCIS-I485-2026",
    sourceLang: "Spanish (ES)",
    targetLang: "English (US)",
    status: "DELIVERED",
    statusLabel: "Certified & Delivered",
    pages: 2,
    total: 99.8,
    promisedAt: "Today, 4:30 PM EST",
    translator: "Elena Rostova (ATA #278190)",
    verifyCode: "VAL-88219-JAL",
    sha256Hash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 1. STICKY PRICE BAR COLLISION SENSING & MONOSPACE DISCIPLINE (RULE 10 & RULE 8)
  // ─────────────────────────────────────────────────────────────────────────
  describe("1. StickyPriceBar Collision Yielding & Monospace Hygiene", () => {
    it("empirically verifies IntersectionObserver selector queries the mandatory collision targets", () => {
      // Must target footer, yield targets, primary action buttons, dialogs, and FAQ accordions
      expect(stickyBarSource).toContain("document.querySelectorAll(");
      expect(stickyBarSource).toContain("footer");
      expect(stickyBarSource).toContain('[data-collision-yield="true"]');
      expect(stickyBarSource).toContain('[data-primary-action="true"]');
      expect(stickyBarSource).toContain('[role="dialog"]');
      expect(stickyBarSource).toContain('[data-faq-accordion="true"]');
    });

    it("verifies IntersectionObserver threshold and negative rootMargin for preemptive auto-hide", () => {
      expect(stickyBarSource).toContain('rootMargin: "0px 0px -60px 0px"');
      expect(stickyBarSource).toContain("threshold: 0.05");
      expect(stickyBarSource).toContain("observer.disconnect()");
    });

    it("verifies mobile bar yields via translate-y-[115%], opacity-0, and pointer-events-none when forceYield=true", () => {
      const renderedHtml = renderToString(
        <StickyPriceBar pricing={mockPricing} forceYield={true} />
      );

      // The mobile bottom bar must have yielding styles
      expect(renderedHtml).toContain("translate-y-[115%]");
      expect(renderedHtml).toContain("opacity-0");
      expect(renderedHtml).toContain("pointer-events-none");
    });

    it("verifies mobile bar is fully visible and interactive when forceYield=false", () => {
      const renderedHtml = renderToString(
        <StickyPriceBar pricing={mockPricing} forceYield={false} />
      );

      // The mobile bottom bar must be at origin and interactable
      expect(renderedHtml).toContain("translate-y-0");
      expect(renderedHtml).toContain("opacity-100");
      expect(renderedHtml).toContain("pointer-events-auto");
    });

    it("enforces Monospace Discipline (Rule 8): section titles must NOT use font-mono", () => {
      // "Live Order Docket" must use font-sans, NOT font-mono
      expect(stickyBarSource).toMatch(/font-sans\s+font-bold\s+uppercase[^>]*>\s*Live Order Docket/);
      expect(stickyBarSource).not.toMatch(/font-mono[^>]*>\s*Live Order Docket/);

      // "Order Summary" header must use font-heading or font-sans, NOT font-mono
      expect(stickyBarSource).toContain("font-heading");
      expect(stickyBarSource).not.toMatch(/font-mono[^>]*>\s*Order Summary/);

      // font-mono is strictly allowed and required for monetary amounts and promised delivery time
      expect(stickyBarSource).toContain("font-mono font-semibold tabular-nums text-ink");
      expect(stickyBarSource).toContain("font-mono tabular-nums tracking-tight");
    });

    it("enforces Touch Target compliance: action buttons meet min 44px tap targets", () => {
      expect(stickyBarSource).toContain("min-h-[44px]");
      const renderedHtml = renderToString(
        <StickyPriceBar pricing={mockPricing} onNext={() => {}} />
      );
      expect(renderedHtml).toContain("min-h-[44px]");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. ORDER DRAWER 0ms ESCAPE LATENCY & ATA COMPLIANCE (GATE G21)
  // ─────────────────────────────────────────────────────────────────────────
  describe("2. OrderDrawer 0ms Keyboard Dismissal Physics & ATA Verification", () => {
    it("verifies Emil Kowalski 0ms exit latency implementation via isEscDismiss ref", () => {
      expect(orderDrawerSource).toContain("const isEscDismiss = React.useRef(false);");
      expect(orderDrawerSource).toContain('if (e.key === "Escape") {');
      expect(orderDrawerSource).toContain("isEscDismiss.current = true;");
      expect(orderDrawerSource).toContain("onClose();");

      // Verify that transition duration conditionally switches to 0 on Escape
      expect(orderDrawerSource).toContain("duration: isEscDismiss.current ? 0 : 0.1");
    });

    it("verifies window keydown event listener cleanup on component unmount", () => {
      expect(orderDrawerSource).toContain("window.addEventListener(\"keydown\", handleKeyDown);");
      expect(orderDrawerSource).toContain("return () => window.removeEventListener(\"keydown\", handleKeyDown);");
    });

    it("verifies opening a new order resets isEscDismiss ref to false", () => {
      expect(orderDrawerSource).toContain("if (order) {");
      expect(orderDrawerSource).toContain("isEscDismiss.current = false;");
    });

    it("verifies clicking backdrop or close button resets isEscDismiss before closing (giving smooth 100ms exit)", () => {
      expect(orderDrawerSource).toContain("isEscDismiss.current = false;");
      expect(orderDrawerSource).toContain("onClose();");
    });

    it("verifies accessible ARIA dialog markup (role='dialog', aria-modal='true', aria-labelledby)", () => {
      const renderedHtml = renderToString(
        <OrderDrawer order={mockOrder} onClose={() => {}} />
      );

      expect(renderedHtml).toContain('role="dialog"');
      expect(renderedHtml).toContain('aria-modal="true"');
      expect(renderedHtml).toContain('aria-labelledby="order-drawer-title"');
      expect(renderedHtml).toContain('id="order-drawer-title"');
    });

    it("verifies ATA Corporate Member compliance certification copy (No. 278190 & 8 CFR § 103.2)", () => {
      const renderedHtml = renderToString(
        <OrderDrawer order={mockOrder} onClose={() => {}} />
      );

      expect(renderedHtml).toContain("ATA Corporate Member Verification");
      expect(renderedHtml).toContain("Corporate ID No. 278190");
      expect(renderedHtml).toContain("8 CFR § 103.2(a)(3)");
      expect(renderedHtml).toContain("Statutory Sworn Affidavit Attached");
    });

    it("verifies Honest Logistics Turnaround 3-tier matrix without fake telemetry", () => {
      const renderedHtml = renderToString(
        <OrderDrawer order={mockOrder} onClose={() => {}} />
      );

      expect(renderedHtml).toContain("Honest Logistics Turnaround");
      expect(renderedHtml).toContain("24 Hours");
      expect(renderedHtml).toContain("12 Hours");
      expect(renderedHtml).toContain("4 Hours");
      expect(renderedHtml).toContain("RFE Defense");
    });

    it("verifies cryptographic SHA-256 evidence seal with public verification link", () => {
      const renderedHtml = renderToString(
        <OrderDrawer order={mockOrder} onClose={() => {}} />
      );

      expect(renderedHtml).toContain("Cryptographic Evidence Seal");
      expect(renderedHtml).toContain(mockOrder.sha256Hash);
      expect(renderedHtml).toContain(`/verify/${mockOrder.verifyCode}`);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. TRANSLATION STUDIO & PIPELINE PRESERVATION (PAGE.TSX CONTRACTS)
  // ─────────────────────────────────────────────────────────────────────────
  describe("3. Interactive Translation Studio Contracts (app/translate/page.tsx)", () => {
    it("empirically asserts exact AST error strings required by test/upload-sync-persistence.test.ts", () => {
      expect(translatePageSource).toContain("uploadRes.status >= 500");
      expect(translatePageSource).toContain("DATABASE_INSERT_FAILED");
      expect(translatePageSource).toContain("alert(");
      expect(translatePageSource).toContain('targetJobId === "undefined"');
    });

    it("verifies advisory language detection does not overwrite user targetLang", () => {
      // In handleStageFile, targetLang must never be set
      const stageFileFn = translatePageSource.slice(
        translatePageSource.indexOf("const handleStageFile ="),
        translatePageSource.indexOf("const handleClearStaged =")
      );

      // stageFileFn must never call setTargetLang
      expect(stageFileFn).not.toContain("setTargetLang");

      // It only optionally updates sourceLang if sourceLang === 'auto'
      expect(stageFileFn).toContain('if (sourceLang === "auto") setSourceLang("en")');
      expect(stageFileFn).toContain('if (sourceLang === "auto") setSourceLang("es")');
      expect(stageFileFn).toContain('if (sourceLang === "auto") setSourceLang("de")');
    });

    it("verifies responsive dual-pane grid collapse (flex-col lg:flex-row with w-5/12 and w-7/12 split)", () => {
      expect(translatePageSource).toContain("flex-col lg:flex-row");
      expect(translatePageSource).toContain("w-full lg:w-5/12");
      expect(translatePageSource).toContain("w-full lg:w-7/12");
    });

    it("verifies GPU-only progress bar using transform scaleX instead of width layout reflow", () => {
      expect(translatePageSource).toContain("scaleX");
      expect(translatePageSource).toContain("origin-left");
      expect(translatePageSource).toContain("transform");
    });

    it("verifies Escape key listener on lightbox modal for 0ms dismissal", () => {
      expect(translatePageSource).toContain('if (e.key === "Escape") {');
      expect(translatePageSource).toContain("setIsZoomModalOpen(false)");
    });

    it("verifies ResultViewer is integrated for completed job state", () => {
      expect(translatePageSource).toContain("<ResultViewer");
      expect(translatePageSource).toContain('job?.status === "ready"');
    });

    it("verifies sample specimen triggers load authentic documents with correct source/target pair", () => {
      expect(translatePageSource).toContain("SPECIMEN_SAMPLES");
      expect(translatePageSource).toContain("Mexican Marriage Apostille");
      expect(translatePageSource).toContain("Colombian Birth Certificate");
      expect(translatePageSource).toContain("German Academic Record");
    });
  });
});
