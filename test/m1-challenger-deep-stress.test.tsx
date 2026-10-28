import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import fs from "fs";
import path from "path";

import { ToggleRow } from "@/components/ui/toggle-row";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

describe("Milestone M1 Challenger Deep Adversarial Stress Suite", () => {
  const repoRoot = path.resolve(__dirname, "..");
  const globalsCssPath = path.join(repoRoot, "app", "globals.css");
  const globalsCss = fs.readFileSync(globalsCssPath, "utf8");

  function getOpeningTag(html: string): string {
    const end = html.indexOf(">");
    return html.substring(0, end + 1);
  }

  // ─────────────────────────────────────────────────────────────
  // 1. ToggleRow Disabled Press Suppression & Event Invariance
  // ─────────────────────────────────────────────────────────────
  describe("1. ToggleRow Disabled Press Suppression", () => {
    it("empirically verifies disabled ToggleRow contains pointer-events-none and cursor-not-allowed", () => {
      const html = renderToString(
        <ToggleRow
          id="cert-notary"
          title="Notarization"
          description="Legal certification"
          priceDelta={25}
          checked={false}
          onCheckedChange={() => {}}
          disabled={true}
        />
      );
      const tag = getOpeningTag(html);
      expect(tag).toContain("pointer-events-none");
      expect(tag).toContain("cursor-not-allowed");
      expect(tag).toContain("opacity-50");
    });

    it("stress tests simulated click handler: onCheckedChange callback is never invoked when disabled", () => {
      const mockOnChange = vi.fn();
      const component = ToggleRow({
        id: "cert-apostille",
        title: "Apostille",
        description: "Hague apostille",
        priceDelta: 45,
        checked: false,
        onCheckedChange: mockOnChange,
        disabled: true,
      });

      // Directly invoke the onClick prop of the rendered element 100 times
      for (let i = 0; i < 100; i++) {
        component.props.onClick();
      }

      expect(mockOnChange).not.toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalledTimes(0);
    });

    it("verifies enabled ToggleRow invokes callback upon simulated click", () => {
      let currentValue = false;
      const mockOnChange = vi.fn((val: boolean) => {
        currentValue = val;
      });

      const component = ToggleRow({
        id: "cert-rush",
        title: "Rush 24h",
        description: "Fast turnaround",
        priceDelta: 30,
        checked: currentValue,
        onCheckedChange: mockOnChange,
        disabled: false,
      });

      component.props.onClick();
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it("handles non-numeric priceDelta without throwing or NaN formatting errors", () => {
      const html = renderToString(
        <ToggleRow
          id="cert-free"
          title="Standard Digital Delivery"
          description="Instant PDF via portal"
          priceDelta="Included"
          checked={true}
          onCheckedChange={() => {}}
        />
      );
      expect(html).toContain("Included");
      expect(html).not.toContain("NaN");
      expect(html).not.toContain("+$NaN");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Select Component Focus-Visible Isolation
  // ─────────────────────────────────────────────────────────────
  describe("2. Select Component Focus-Visible Isolation", () => {
    it("ensures SelectTrigger has focus-visible:ring-2 and ZERO bare focus:ring", () => {
      const selectPath = path.join(repoRoot, "components", "ui", "select.tsx");
      const content = fs.readFileSync(selectPath, "utf8");

      expect(content).toContain("focus-visible:ring-2");
      expect(content).toContain("focus-visible:outline-none");
      expect(content).toContain("focus-visible:ring-[var(--focus-ring)]");

      // Verify absence of bare focus:ring on trigger
      const triggerSection = content.substring(
        content.indexOf("const SelectTrigger"),
        content.indexOf("SelectTrigger.displayName")
      );
      expect(triggerSection).not.toMatch(/(^|\s)focus:ring/);
    });

    it("verifies SelectTrigger preserves 44px min touch height and active scale", () => {
      const html = renderToString(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Source Language" />
          </SelectTrigger>
        </Select>
      );
      const tag = getOpeningTag(html);
      expect(tag).toContain("h-11"); // 44px height
      expect(tag).toContain("active:scale-[0.99]");
      expect(tag).toContain("disabled:cursor-not-allowed");
      expect(tag).toContain("disabled:opacity-50");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Dialog Component Focus-Visible Isolation & Touch Geometry
  // ─────────────────────────────────────────────────────────────
  describe("3. Dialog Close Focus-Visible Isolation & Touch Geometry", () => {
    it("ensures DialogPrimitive.Close uses focus-visible:ring-2 and NOT bare focus:ring-2", () => {
      const dialogPath = path.join(repoRoot, "components", "ui", "dialog.tsx");
      const content = fs.readFileSync(dialogPath, "utf8");

      expect(content).toContain("focus-visible:ring-2");
      expect(content).toContain("focus-visible:ring-brand-500");
      expect(content).not.toContain("focus:ring-2 focus:ring-brand-500");
      expect(content).toContain("focus-visible:outline-none");
    });

    it("verifies DialogClose satisfies Apple HIG / WCAG 44x44px touch targets", () => {
      const dialogPath = path.join(repoRoot, "components", "ui", "dialog.tsx");
      const content = fs.readFileSync(dialogPath, "utf8");

      expect(content).toContain("min-h-[44px]");
      expect(content).toContain("min-w-[44px]");
      expect(content).toContain("active:scale-[0.98]");
      expect(content).toContain("disabled:pointer-events-none");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Accordion Animation Compiling & Transition Scoping
  // ─────────────────────────────────────────────────────────────
  describe("4. Accordion Motion & Tailwind v4 Utility Infrastructure", () => {
    it("ensures AccordionTrigger has scoped transition-colors and ZERO generic transition-all", () => {
      const accordionPath = path.join(repoRoot, "components", "ui", "accordion.tsx");
      const content = fs.readFileSync(accordionPath, "utf8");

      const triggerSection = content.substring(
        content.indexOf("const AccordionTrigger"),
        content.indexOf("AccordionTrigger.displayName")
      );

      expect(triggerSection).toContain("transition-colors duration-150 ease-out");
      expect(triggerSection).not.toContain("transition-all");
    });

    it("ensures globals.css declares Tailwind v4 @utility animate-accordion-down and animate-accordion-up", () => {
      expect(globalsCss).toContain("@utility animate-accordion-down");
      expect(globalsCss).toContain("@utility animate-accordion-up");
      expect(globalsCss).toContain("animation: accordion-down 200ms cubic-bezier(0.32, 0.72, 0, 1);");
      expect(globalsCss).toContain("animation: accordion-up 180ms cubic-bezier(0.32, 0.72, 0, 1);");
    });

    it("verifies keyframes accordion-down and accordion-up utilize radix height variable", () => {
      expect(globalsCss).toContain("@keyframes accordion-down");
      expect(globalsCss).toContain("@keyframes accordion-up");
      expect(globalsCss).toContain("var(--radix-accordion-content-height)");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Button Transition Timing & Specificity
  // ─────────────────────────────────────────────────────────────
  describe("5. Button Transition Polish & Scoped Transitions", () => {
    it("verifies base button transition timing is standardized to duration-150", () => {
      const buttonPath = path.join(repoRoot, "components", "ui", "button.tsx");
      const content = fs.readFileSync(buttonPath, "utf8");

      expect(content).toContain("duration-150");
      expect(content).toContain("active:scale-[0.98]");
    });

    it("verifies tertiary button underline transition is scoped to width rather than transition-all", () => {
      const buttonPath = path.join(repoRoot, "components", "ui", "button.tsx");
      const content = fs.readFileSync(buttonPath, "utf8");

      expect(content).toContain("after:transition-[width]");
      expect(content).not.toContain("after:transition-all");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Reduced Motion Comprehensive Safety Net
  // ─────────────────────────────────────────────────────────────
  describe("6. Reduced Motion Comprehensive Coverage", () => {
    it("verifies prefers-reduced-motion neutralizes active scale transforms across buttons, menuitems, and scale classes", () => {
      const reducedMotionMatch = globalsCss.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/);
      expect(reducedMotionMatch).not.toBeNull();
      const body = reducedMotionMatch![1];

      // Must cover buttons, role="button", role="menuitem", and active:scale-* classes
      expect(body).toContain('button:not(:disabled)');
      expect(body).toContain('[role="button"]:not(:disabled)');
      expect(body).toContain('[role="menuitem"]');
      expect(body).toContain('[class*="active:scale-"]');
      expect(body).toContain("transform: none !important;");

      // Duration collapse to 0.01ms
      expect(body).toContain("animation-duration: 0.01ms !important;");
      expect(body).toContain("transition-duration: 0.01ms !important;");
      expect(body).toContain("scroll-behavior: auto !important;");
    });
  });
});
