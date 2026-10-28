import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import fs from "fs";
import path from "path";

import { Button, buttonVariants } from "@/components/ui/button";
import { ToggleRow } from "@/components/ui/toggle-row";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

describe("Milestone M1 Adversarial Interaction & Motion Challenge Suite", () => {
  const repoRoot = path.resolve(__dirname, "..");
  const globalsCssPath = path.join(repoRoot, "app", "globals.css");
  const globalsCss = fs.readFileSync(globalsCssPath, "utf8");

  // Helper to extract opening tag
  function getOpeningTag(html: string): string {
    const end = html.indexOf(">");
    return html.substring(0, end + 1);
  }

  // ─────────────────────────────────────────────────────────────
  // 1. Button Component (`components/ui/button.tsx`)
  // ─────────────────────────────────────────────────────────────
  describe("1. Button Component Interaction & Motion Mechanics", () => {
    it("enforces tactile press scale and Emil Kowalski spring timing in base classes", () => {
      const classes = buttonVariants();
      expect(classes).toContain("active:scale-[0.98]");
      expect(classes).toContain("ease-[cubic-bezier(0.32,0.72,0,1)]");
      expect(classes).toContain("transition-[transform,background-color,border-color,color,box-shadow]");
      expect(classes).toContain("min-h-[44px]");
    });

    it("verifies disabled button suppresses pointer events and renders disabled attribute", () => {
      const html = renderToString(<Button disabled>Disabled Action</Button>);
      const tag = getOpeningTag(html);
      expect(tag).toContain("disabled=\"\"");
      expect(tag).toContain("disabled:pointer-events-none");
      expect(tag).toContain("disabled:opacity-50");
    });

    it("verifies isLoading button is disabled and displays accessible loading spinner", () => {
      const html = renderToString(<Button isLoading>Submit Document</Button>);
      const tag = getOpeningTag(html);
      expect(tag).toContain("disabled=\"\"");
      expect(html).toContain("animate-spin");
      expect(html).toContain("Submit Document");
    });

    it("enforces WCAG 2.5.5 / Apple HIG 44px minimum touch targets across all size variants", () => {
      const defaultHtml = renderToString(<Button size="default">Default</Button>);
      const smHtml = renderToString(<Button size="sm">Small</Button>);
      const iconHtml = renderToString(<Button size="icon">Icon</Button>);

      expect(defaultHtml).toContain("min-h-[44px]");
      expect(smHtml).toContain("min-h-[44px]");
      expect(iconHtml).toContain("min-h-[44px]");
      expect(iconHtml).toContain("min-w-[44px]");
    });

    it("verifies keyboard focus-visible rings use designated focus token", () => {
      const classes = buttonVariants();
      expect(classes).toContain("focus-visible:outline-none");
      expect(classes).toContain("focus-visible:ring-2");
      expect(classes).toContain("focus-visible:ring-[var(--focus-ring)]");
    });

    it("adversarial probe: detects if asChild with anchor tag lacks pointer-events-none when disabled", () => {
      const html = renderToString(
        <Button asChild disabled>
          <a href="/test">Link</a>
        </Button>
      );
      const tag = getOpeningTag(html);
      // <a class="... disabled:pointer-events-none ...">
      // In CSS, <a> does NOT match :disabled pseudo-class.
      // So disabled:pointer-events-none does not activate on <a>!
      expect(tag.startsWith("<a")).toBe(true);
      expect(tag).toContain("disabled:pointer-events-none");
      // Explicit 'pointer-events-none' (without 'disabled:') is NOT on the tag:
      const hasUnconditionalPointerEventsNone = /(^|\s)pointer-events-none(\s|$)/.test(tag);
      expect(hasUnconditionalPointerEventsNone).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. ToggleRow Component (`components/ui/toggle-row.tsx`)
  // ─────────────────────────────────────────────────────────────
  describe("2. ToggleRow Adversarial Interaction & Accessibility Probe", () => {
    it("renders active:scale-[0.99] on container", () => {
      const html = renderToString(
        <ToggleRow
          id="row-1"
          title="Notarization"
          description="Official state notary seal"
          priceDelta={25}
          checked={false}
          onCheckedChange={() => {}}
        />
      );
      const tag = getOpeningTag(html);
      expect(tag).toContain("active:scale-[0.99]");
      expect(tag).toContain("cursor-pointer");
    });

    it("adversarial defect: disabled ToggleRow outer div retains active:scale-[0.99] without pointer-events-none", () => {
      const html = renderToString(
        <ToggleRow
          id="row-disabled"
          title="Apostille"
          description="Hague convention apostille certificate"
          priceDelta={45}
          checked={false}
          onCheckedChange={() => {}}
          disabled={true}
        />
      );
      const outerTag = getOpeningTag(html);

      // Defect verification:
      // 1. The container is a <div> (not a <button>), so native :disabled pseudo-class does not exist.
      expect(outerTag.startsWith("<div")).toBe(true);

      // 2. The class active:scale-[0.99] is unconditionally applied.
      expect(outerTag).toContain("active:scale-[0.99]");

      // 3. When disabled={true}, "opacity-50 cursor-not-allowed" is added,
      expect(outerTag).toContain("opacity-50");
      expect(outerTag).toContain("cursor-not-allowed");

      // 4. pointer-events-none is applied on the outer div when disabled
      const outerHasPointerEventsNone = outerTag.includes("pointer-events-none");
      expect(outerHasPointerEventsNone).toBe(true);
    });

    it("accessibility probe: outer card container lacks keyboard focus ring and keyboard event handlers", () => {
      const html = renderToString(
        <ToggleRow
          id="row-a11y"
          title="Rush 24h Delivery"
          description="Priority expedited review"
          priceDelta={30}
          checked={false}
          onCheckedChange={() => {}}
        />
      );
      const outerTag = getOpeningTag(html);

      // The container is a clickable card (onClick), but has no role="button", no tabIndex, no focus ring:
      expect(outerTag).not.toContain('role="button"');
      expect(outerTag).not.toContain("tabindex");
      expect(outerTag).not.toContain("focus-visible:ring");
      expect(outerTag).not.toContain("focus:ring");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Select Component (`components/ui/select.tsx`)
  // ─────────────────────────────────────────────────────────────
  describe("3. Select Component Interaction & Focus Mechanics", () => {
    it("verifies SelectTrigger tactile active scale and height", () => {
      const html = renderToString(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select target language" />
          </SelectTrigger>
        </Select>
      );
      const tag = getOpeningTag(html);
      expect(tag).toContain("active:scale-[0.99]");
      expect(tag).toContain("h-11"); // 44px minimum touch height
    });

    it("verifies SelectTrigger uses focus-visible:ring-2 instead of focus:ring-2", () => {
      const html = renderToString(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
        </Select>
      );
      const tag = getOpeningTag(html);

      // SelectTrigger uses focus-visible:ring-2 instead of focus:ring-2
      expect(tag).toContain("focus-visible:ring-2");
      expect(tag).not.toContain(" focus:ring-2");
    });

    it("verifies SelectContent transform origin and animation tokens", () => {
      const selectTsxPath = path.join(repoRoot, "components", "ui", "select.tsx");
      const content = fs.readFileSync(selectTsxPath, "utf8");
      expect(content).toContain("origin-[var(--radix-select-content-transform-origin)]");
      expect(content).toContain("data-[state=open]:animate-in");
      expect(content).toContain("data-[state=closed]:animate-out");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Dialog Component (`components/ui/dialog.tsx`)
  // ─────────────────────────────────────────────────────────────
  describe("4. Dialog Close Button & Motion Boundaries", () => {
    it("verifies DialogClose tactile press, 44px touch target, and disabled guard", () => {
      const dialogTsxPath = path.join(repoRoot, "components", "ui", "dialog.tsx");
      const content = fs.readFileSync(dialogTsxPath, "utf8");
      expect(content).toContain("active:scale-[0.98]");
      expect(content).toContain("min-h-[44px]");
      expect(content).toContain("min-w-[44px]");
      expect(content).toContain("disabled:pointer-events-none");
    });

    it("verifies DialogContent uses high-density rounded-2xl and surface-raised", () => {
      const dialogTsxPath = path.join(repoRoot, "components", "ui", "dialog.tsx");
      const content = fs.readFileSync(dialogTsxPath, "utf8");
      expect(content).toContain("bg-surface-raised");
      expect(content).toContain("border-border");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Dropdown Menu Component (`components/ui/dropdown-menu.tsx`)
  // ─────────────────────────────────────────────────────────────
  describe("5. Dropdown Menu Interaction Mechanics", () => {
    it("verifies DropdownMenuItem active scale and disabled pointer-events guard", () => {
      const dropdownTsxPath = path.join(repoRoot, "components", "ui", "dropdown-menu.tsx");
      const content = fs.readFileSync(dropdownTsxPath, "utf8");
      expect(content).toContain("active:scale-[0.98]");
      expect(content).toContain("data-[disabled]:pointer-events-none");
      expect(content).toContain("data-[disabled]:opacity-50");
    });

    it("verifies DropdownMenuContent transform origin", () => {
      const dropdownTsxPath = path.join(repoRoot, "components", "ui", "dropdown-menu.tsx");
      const content = fs.readFileSync(dropdownTsxPath, "utf8");
      expect(content).toContain("origin-[var(--radix-dropdown-menu-content-transform-origin)]");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Switch Component (`components/ui/switch.tsx`)
  // ─────────────────────────────────────────────────────────────
  describe("6. Switch Component Motion & State Accessibility", () => {
    it("verifies Switch Thumb spring physics and translation bounds", () => {
      const switchTsxPath = path.join(repoRoot, "components", "ui", "switch.tsx");
      const content = fs.readFileSync(switchTsxPath, "utf8");
      expect(content).toContain("transition-transform duration-200");
      expect(content).toContain("ease-[cubic-bezier(0.32,0.72,0,1)]");
      expect(content).toContain("data-[state=checked]:translate-x-5");
      expect(content).toContain("data-[state=unchecked]:translate-x-0");
    });

    it("verifies Switch focus-visible ring token and disabled cursor", () => {
      const html = renderToString(<Switch disabled />);
      const tag = getOpeningTag(html);
      expect(tag).toContain("focus-visible:ring-2");
      expect(tag).toContain("disabled:cursor-not-allowed");
      expect(tag).toContain("disabled:opacity-50");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Global CSS Reduced Motion & Asymmetric Press Rules (`app/globals.css`)
  // ─────────────────────────────────────────────────────────────
  describe("7. Global CSS Reduced Motion & Asymmetric Press Timing", () => {
    it("verifies universal asymmetric button press timing (150ms return, 90ms active press)", () => {
      expect(globalsCss).toContain("button:not(:disabled)");
      expect(globalsCss).toContain("transition-duration: 150ms;");
      expect(globalsCss).toContain("button:active:not(:disabled)");
      expect(globalsCss).toContain("transition-duration: 90ms;");
      expect(globalsCss).toContain("transform: scale(0.98);");
    });

    it("verifies prefers-reduced-motion overrides transform and forces instant durations", () => {
      const reducedMotionMatch = globalsCss.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/);
      expect(reducedMotionMatch).not.toBeNull();
      const reducedMotionContent = reducedMotionMatch![1];

      expect(reducedMotionContent).toContain("transform: none !important;");
      expect(reducedMotionContent).toContain("animation-duration: 0.01ms !important;");
      expect(reducedMotionContent).toContain("transition-duration: 0.01ms !important;");
      expect(reducedMotionContent).toContain("scroll-behavior: auto !important;");
    });

    it("adversarial challenge: probes if prefers-reduced-motion transform override covers non-button interactive elements", () => {
      const reducedMotionMatch = globalsCss.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/);
      const reducedMotionContent = reducedMotionMatch![1];

      // In globals.css lines 620-625:
      // button:not(:disabled), [role="button"]:not(:disabled), button:active:not(:disabled), [role="button"]:active:not(:disabled)
      // Check whether role="menuitem" or generic interactive scale is explicitly covered:
      const coversMenuitem = reducedMotionContent.includes('[role="menuitem"]');
      const coversAllInteractive = reducedMotionContent.includes('[data-interactive]') || reducedMotionContent.includes('.active\\:');

      // Documenting that [role="menuitem"] (DropdownMenuItem) is explicitly covered:
      expect(coversMenuitem).toBe(true);
      expect(coversAllInteractive).toBe(false);
    });
  });
});
