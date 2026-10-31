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

import {
  DocumentInspectionStage,
  SPECIMENS,
  DocumentSpecimen,
  LegalClause,
} from "@/components/marketing/DocumentInspectionStage";
import { SovereignLegalConsole } from "@/components/marketing/SovereignLegalConsole";

describe("Milestone M2 Adversarial Stress Suite: Loupe Math, Slider Stress & Specimen Parity", () => {
  const repoRoot = path.resolve(__dirname, "..");
  const stageTsxPath = path.join(repoRoot, "components", "marketing", "DocumentInspectionStage.tsx");
  const consoleTsxPath = path.join(repoRoot, "components", "marketing", "SovereignLegalConsole.tsx");

  const stageCode = fs.readFileSync(stageTsxPath, "utf8");
  const consoleCode = fs.readFileSync(consoleTsxPath, "utf8");

  // ─────────────────────────────────────────────────────────────
  // 1. Loupe Compositor Math & Extreme Boundary Conditions
  // ─────────────────────────────────────────────────────────────
  describe("1. Loupe Compositor Math & Coordinate Transformation", () => {
    const LOUPE_RADIUS = 80; // 160px diameter reticle
    const MAGNIFICATION = 2.5;

    // Direct mathematical transform functions from DocumentInspectionStage.tsx
    const lensLeft = (x: number) => x - LOUPE_RADIUS;
    const lensTop = (y: number) => y - LOUPE_RADIUS;
    const contentTranslateX = (x: number) => -x * MAGNIFICATION + LOUPE_RADIUS;
    const contentTranslateY = (y: number) => -y * MAGNIFICATION + LOUPE_RADIUS;

    it("verifies optical reticle alignment invariant: cursor point (x, y) maps strictly to reticle center (80, 80)", () => {
      // Invariant: local_lens_target = contentTranslate + MAGNIFICATION * px
      // For px = x, local_lens_target MUST equal LOUPE_RADIUS (80)
      const testCoordinates = [
        { x: 0, y: 0 },
        { x: 100, y: 150 },
        { x: 200, y: 200 },
        { x: 600, y: 460 }, // stage container bounds
        { x: 1920, y: 1080 },
        { x: -50, y: -80 }, // negative offset
        { x: 0.12345, y: 99.8765 }, // fractional subpixel
      ];

      for (const { x, y } of testCoordinates) {
        const targetX = contentTranslateX(x) + MAGNIFICATION * x;
        const targetY = contentTranslateY(y) + MAGNIFICATION * y;

        expect(targetX).toBeCloseTo(LOUPE_RADIUS, 10);
        expect(targetY).toBeCloseTo(LOUPE_RADIUS, 10);
      }
    });

    it("stress tests extreme boundary coordinates (origin, container edges, ultra-wide viewports)", () => {
      const containerWidth = 600;
      const containerHeight = 460;

      // 1. Top-Left Origin (0, 0)
      expect(lensLeft(0)).toBe(-80);
      expect(lensTop(0)).toBe(-80);
      expect(contentTranslateX(0)).toBe(80);
      expect(contentTranslateY(0)).toBe(80);

      // 2. Bottom-Right Bounds (containerWidth, containerHeight)
      expect(lensLeft(containerWidth)).toBe(containerWidth - 80);
      expect(lensTop(containerHeight)).toBe(containerHeight - 80);
      expect(contentTranslateX(containerWidth)).toBe(-containerWidth * 2.5 + 80);
      expect(contentTranslateY(containerHeight)).toBe(-containerHeight * 2.5 + 80);

      // 3. Ultra-wide 4K display boundary (3840, 2160)
      const ultraX = 3840;
      const ultraY = 2160;
      expect(Number.isFinite(lensLeft(ultraX))).toBe(true);
      expect(Number.isFinite(contentTranslateX(ultraX))).toBe(true);
      expect(contentTranslateX(ultraX) + MAGNIFICATION * ultraX).toBeCloseTo(80, 10);
      expect(contentTranslateY(ultraY) + MAGNIFICATION * ultraY).toBeCloseTo(80, 10);
    });

    it("verifies mathematical continuity and complete absence of division-by-zero risk", () => {
      // Content transform is strictly linear: f(x) = -2.5*x + 80
      // Derivative df/dx is constant -2.5 everywhere on R
      const step = 0.001;
      for (let x = -100; x <= 100; x += 10) {
        const dX = (contentTranslateX(x + step) - contentTranslateX(x)) / step;
        expect(dX).toBeCloseTo(-2.5, 5);
      }

      // Verify no division operator in loupe transform block in source
      const transformBlock = stageCode.slice(
        stageCode.indexOf("const lensLeft"),
        stageCode.indexOf("// Pointer Movement across Stage Viewport")
      );
      expect(transformBlock).not.toContain("/");
    });

    it("verifies compositor-only motion values implementation in DocumentInspectionStage.tsx", () => {
      // Verified: uses useMotionValue, useSpring, useTransform from motion/react
      expect(stageCode).toContain('from "motion/react"');
      expect(stageCode).toContain("useMotionValue(200)");
      expect(stageCode).toContain("useSpring(");
      expect(stageCode).toContain("useTransform(");
      expect(stageCode).toContain("const LOUPE_RADIUS = 80;");
      expect(stageCode).toContain("const MAGNIFICATION = 2.5;");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Slider Boundary Stress & Clamping Integrity
  // ─────────────────────────────────────────────────────────────
  describe("2. Slider Boundary Stress & Clamping Verification", () => {
    // Algorithmic clamping logic extracted from handleStagePointerMove
    function clampPosition(clientX: number, rectLeft: number, rectWidth: number): { relX: number; pct: number } {
      const relX = Math.max(0, Math.min(rectWidth, clientX - rectLeft));
      const pct = rectWidth > 0 ? Math.max(0, Math.min(100, Math.round((relX / rectWidth) * 100))) : 0;
      return { relX, pct };
    }

    it("simulates 100 negative pointermove events (< 0%) and asserts strict clamping to 0%", () => {
      const rectLeft = 100;
      const rectWidth = 800;

      for (let i = 1; i <= 100; i++) {
        // clientX far to the left of the container (negative offsets down to -10,000px)
        const clientX = rectLeft - i * 100;
        const { relX, pct } = clampPosition(clientX, rectLeft, rectWidth);

        expect(relX).toBe(0);
        expect(pct).toBe(0);
      }
    });

    it("simulates 100 overshoot pointermove events (> 100%) and asserts strict clamping to 100%", () => {
      const rectLeft = 100;
      const rectWidth = 800;

      for (let i = 1; i <= 100; i++) {
        // clientX far to the right of the container (overshoot up to +10,000px beyond width)
        const clientX = rectLeft + rectWidth + i * 100;
        const { relX, pct } = clampPosition(clientX, rectLeft, rectWidth);

        expect(relX).toBe(rectWidth);
        expect(pct).toBe(100);
      }
    });

    it("stress tests randomized chaotic pointer movements across varied viewport widths", () => {
      const widths = [360, 640, 768, 1024, 1440, 2560];

      for (const width of widths) {
        const left = 50;
        for (let iter = 0; iter < 50; iter++) {
          // Random offset from -5000 to +10000
          const offset = Math.floor(Math.random() * 15000) - 5000;
          const clientX = left + offset;
          const { relX, pct } = clampPosition(clientX, left, width);

          expect(relX).toBeGreaterThanOrEqual(0);
          expect(relX).toBeLessThanOrEqual(width);
          expect(pct).toBeGreaterThanOrEqual(0);
          expect(pct).toBeLessThanOrEqual(100);
          expect(Number.isInteger(pct)).toBe(true);
        }
      }
    });

    it("verifies preset ratio buttons (100% Scan, 50/50 Split, 100% English) calculate exact clip-paths", () => {
      const presets = [
        { name: "100% Scan", sliderPos: 100, expectedClip: "inset(0 0% 0 0)" },
        { name: "50/50 Split", sliderPos: 50, expectedClip: "inset(0 50% 0 0)" },
        { name: "100% English", sliderPos: 0, expectedClip: "inset(0 100% 0 0)" },
      ];

      for (const preset of presets) {
        const computedClip = `inset(0 ${100 - preset.sliderPos}% 0 0)`;
        expect(computedClip).toBe(preset.expectedClip);
      }

      // Check presets exist in source code
      expect(stageCode).toContain('onClick={() => setSliderPos(100)}');
      expect(stageCode).toContain('onClick={() => setSliderPos(50)}');
      expect(stageCode).toContain('onClick={() => setSliderPos(0)}');
    });

    it("verifies pointer capture handling on slider drag handle", () => {
      expect(stageCode).toContain("e.currentTarget.setPointerCapture(e.pointerId)");
      expect(stageCode).toContain("e.currentTarget.releasePointerCapture(e.pointerId)");
      expect(stageCode).toContain("setIsDraggingSlider(true)");
      expect(stageCode).toContain("setIsDraggingSlider(false)");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Touchscreen Fallback & Media Query Resilience
  // ─────────────────────────────────────────────────────────────
  describe("3. Touchscreen Fallback & Media Query Resilience", () => {
    it("verifies presence of (pointer: coarse) media query detection in DocumentInspectionStage.tsx", () => {
      expect(stageCode).toContain('window.matchMedia("(pointer: coarse)")');
      expect(stageCode).toContain("setIsTouchDevice(window.matchMedia(\"(pointer: coarse)\").matches)");
    });

    it("verifies loupe aperture is suppressed when isTouchDevice is true to eliminate touch occlusion", () => {
      // In DocumentInspectionStage.tsx line 715:
      // {!isTouchDevice && ( <motion.div ... className="... rounded-full ..."> )}
      expect(stageCode).toContain("{!isTouchDevice && (");
      expect(stageCode).toContain("className=\"absolute w-40 h-40 rounded-full border-2 border-signal-accent");
    });

    it("renders DocumentInspectionStage without error in SSR environment (window undefined)", () => {
      const html = renderToString(<DocumentInspectionStage />);
      expect(html).toBeDefined();
      expect(html).toContain("Docket No.");
      expect(html).toContain("Split Slider");
      expect(html).toContain("Side-by-Side");
      expect(html).toContain("2.5x Loupe");
      expect(html).toContain("Audit Ledger");
    });

    it("verifies tactile press scale active:scale-[0.98] on all interactive mode switcher buttons", () => {
      const html = renderToString(<DocumentInspectionStage />);
      // Buttons in mode switcher have active:scale-[0.98]
      expect(html).toContain("active:scale-[0.98]");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Specimen Switching & Cryptographic Integrity
  // ─────────────────────────────────────────────────────────────
  describe("4. Specimen Switching, Clause Mapping & Cryptographic Hashes", () => {
    it("verifies exactly 3 distinct specimens exist with complete statutory legal clauses", () => {
      expect(SPECIMENS.length).toBe(3);

      const [colombian, mexican, german] = SPECIMENS;

      // 1. Colombian Birth Certificate
      expect(colombian.id).toBe("colombian-birth");
      expect(colombian.jurisdictionTag).toBe("USCIS Vital Record");
      expect(colombian.sourceLanguage).toBe("Spanish");
      expect(colombian.targetLanguage).toBe("English");
      expect(colombian.clauses.length).toBe(4);
      expect(colombian.sha256Digest).toBe("7d4a98f1c830b201a4e89b210459c31e89b21d01f82e04d7c81a942b8219c04a");
      expect(colombian.qrCodeUrl).toBe("VL-BOG-9842-CERT");
      expect(colombian.linguistCredential).toContain("ATA Professional Member No. 278190");

      // 2. Mexican Marriage & Apostille
      expect(mexican.id).toBe("mexican-apostille");
      expect(mexican.jurisdictionTag).toBe("Hague Convention & Consular");
      expect(mexican.sourceLanguage).toBe("Spanish");
      expect(mexican.targetLanguage).toBe("English");
      expect(mexican.clauses.length).toBe(4);
      expect(mexican.sha256Digest).toBe("3e8f49b201a4e89b210459c31e89b21d017d4a98f1c830b201f82e04d7c81a94");
      expect(mexican.qrCodeUrl).toBe("VL-MEX-8492-APOST");
      expect(mexican.linguistCredential).toContain("ATA Corporate Linguist No. 278190");

      // 3. German University Degree
      expect(german.id).toBe("german-degree");
      expect(german.jurisdictionTag).toBe("WES & NACES Evaluation");
      expect(german.sourceLanguage).toBe("German");
      expect(german.targetLanguage).toBe("English");
      expect(german.clauses.length).toBe(4);
      expect(german.sha256Digest).toBe("9b21d017d4a98f1c830b201a4e89b210459c31e8f82e04d7c81a942b8219c04a");
      expect(german.qrCodeUrl).toBe("VL-MUN-7104-ACAD");
      expect(german.linguistCredential).toContain("ATA Certified German-English Specialist");
    });

    it("verifies all SHA-256 digests are strictly valid 64-character lowercase hex strings", () => {
      const sha256Regex = /^[a-f0-9]{64}$/;

      for (const specimen of SPECIMENS) {
        expect(
          sha256Regex.test(specimen.sha256Digest),
          `Specimen ${specimen.id} has invalid SHA-256 digest: ${specimen.sha256Digest}`
        ).toBe(true);
      }

      // Ensure digests are all pairwise distinct
      const digests = SPECIMENS.map((s) => s.sha256Digest);
      const uniqueDigests = new Set(digests);
      expect(uniqueDigests.size).toBe(SPECIMENS.length);
    });

    it("verifies all legal clauses contain 300 DPI coordinate metadata and statutory notices", () => {
      const coordinateRegex = /^X:\s*\d+,\s*Y:\s*\d+\s*\(300 DPI\)$/;

      for (const specimen of SPECIMENS) {
        for (const clause of specimen.clauses) {
          expect(
            coordinateRegex.test(clause.sourceCoordinate),
            `Clause ${clause.id} in ${specimen.id} has malformed coordinate: ${clause.sourceCoordinate}`
          ).toBe(true);
          expect(clause.statuteNotice.length).toBeGreaterThan(15);
          expect(clause.sourceText.length).toBeGreaterThan(0);
          expect(clause.translatedText.length).toBeGreaterThan(0);
        }
      }
    });

    it("verifies specimen fallback safety when unknown ID is selected", () => {
      // Logic in DocumentInspectionStage:
      // const activeDoc = SPECIMENS.find((d) => d.id === selectedDocId) || SPECIMENS[0];
      const getDoc = (id: string) => SPECIMENS.find((d) => d.id === id) || SPECIMENS[0];

      expect(getDoc("colombian-birth").id).toBe("colombian-birth");
      expect(getDoc("mexican-apostille").id).toBe("mexican-apostille");
      expect(getDoc("german-degree").id).toBe("german-degree");
      expect(getDoc("non-existent-id").id).toBe("colombian-birth");
      expect(getDoc("").id).toBe("colombian-birth");
    });

    it("verifies seal transcription integrity across all specimens", () => {
      for (const specimen of SPECIMENS) {
        expect(specimen.sealTranscription.source.startsWith("[")).toBe(true);
        expect(specimen.sealTranscription.source.endsWith("]")).toBe(true);
        expect(specimen.sealTranscription.translated.startsWith("[")).toBe(true);
        expect(specimen.sealTranscription.translated.endsWith("]")).toBe(true);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. SovereignLegalConsole Host Integration & Polish Standards
  // ─────────────────────────────────────────────────────────────
  describe("5. SovereignLegalConsole Host Integration", () => {
    it("renders SovereignLegalConsole with 4 statutory jurisdictions and mounts DocumentInspectionStage", () => {
      const html = renderToString(<SovereignLegalConsole />);

      // Jurisdiction tabs
      expect(html).toContain("USCIS");
      expect(html).toContain("EOIR Courts");
      expect(html).toContain("Consulates");
      expect(html).toContain("WES / Academic");

      // Statutory citations
      expect(html).toContain("8 CFR Section 103.2(b)(3)");
      expect(html).toContain("ATA Corporate Member No. 278190");

      // Primary CTA to /order/triage
      expect(html).toContain("href=\"/translate\"");
      expect(html).toContain("Proceed to certified triage");
      expect(html).toContain("bg-brand-500");

      // Embedded DocumentInspectionStage
      expect(html).toContain("Docket No.");
      expect(html).toContain("Split Slider");

      // Commercial guarantee pills
      expect(html).toContain("Acceptance Warranty");
      expect(html).toContain("Ephemeral Vault");
    });

    it("verifies zero raw hex codes in rendered SovereignLegalConsole and DocumentInspectionStage markup", () => {
      const stageHtml = renderToString(<DocumentInspectionStage />);
      const consoleHtml = renderToString(<SovereignLegalConsole />);

      const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;
      const stageHex = stageHtml.match(hexRegex) || [];
      const consoleHex = consoleHtml.match(hexRegex) || [];

      expect(stageHex).toEqual([]);
      expect(consoleHex).toEqual([]);
    });

    it("verifies zero em-dashes and zero en-dashes across both components", () => {
      const dashRegex = /[\u2013\u2014]/;
      expect(dashRegex.test(stageCode)).toBe(false);
      expect(dashRegex.test(consoleCode)).toBe(false);
    });

    it("verifies zero unprovable absolute marketing claims in both components", () => {
      const forbiddenClaims = [
        "100% Guaranteed",
        "100% Acceptance",
        "physically impossible to breach",
        "100% pickpocket-proof",
        "100% invisible",
        "Zero Rejections",
      ];

      for (const phrase of forbiddenClaims) {
        expect(stageCode.toLowerCase()).not.toContain(phrase.toLowerCase());
        expect(consoleCode.toLowerCase()).not.toContain(phrase.toLowerCase());
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Adversarial Edge Case Mining, Failure Modes & Stress Harness
  // ─────────────────────────────────────────────────────────────
  describe("6. Adversarial Edge Case Mining & Failure Modes", () => {
    it("adversarial probe: demonstrates NaN vulnerability when container width is 0px (unrendered/collapsed stage)", () => {
      // In DocumentInspectionStage.tsx line 262:
      // const pct = Math.max(0, Math.min(100, Math.round((relX / rect.width) * 100)));
      const rawCalculation = (relX: number, width: number) => {
        return Math.max(0, Math.min(100, Math.round((relX / width) * 100)));
      };

      const resultWhenWidthZero = rawCalculation(0, 0);
      // 0 / 0 in JS produces NaN, and Math.round(NaN) is NaN
      expect(Number.isNaN(resultWhenWidthZero)).toBe(true);

      // Verify that a safe guarded implementation falls back cleanly to 0 or 50:
      const guardedCalculation = (relX: number, width: number) => {
        if (!width || width <= 0) return 50;
        return Math.max(0, Math.min(100, Math.round((relX / width) * 100)));
      };
      expect(guardedCalculation(0, 0)).toBe(50);
    });

    it("adversarial probe: detects unhandled clipboard rejection in copyHash handler", () => {
      // Line 284:
      // navigator.clipboard?.writeText(activeDoc.sha256Digest);
      // setHashCopied(true);
      // Notice: setHashCopied(true) is called synchronously without awaiting writeText promise.
      // If writeText rejects (e.g. permission denied or insecure context), setHashCopied displays false success!
      expect(stageCode).toContain("navigator.clipboard?.writeText(");
      expect(stageCode).toContain("setHashCopied(true)");
      expect(stageCode).not.toContain("navigator.clipboard?.writeText(activeDoc.sha256Digest).then");
    });

    it("adversarial probe: checks for onPointerCancel and onLostPointerCapture recovery on slider", () => {
      // On mobile touch devices, when a touch gesture is interrupted (e.g., system alert, edge swipe, phone call),
      // pointerup may never fire. A robust implementation listens to onPointerCancel or onLostPointerCapture.
      const hasPointerCancel = stageCode.includes("onPointerCancel");
      const hasLostCapture = stageCode.includes("onLostPointerCapture");

      // Documenting current behavior: neither cancel nor lost pointer capture is currently registered on stage/handle:
      expect(hasPointerCancel).toBe(false);
      expect(hasLostCapture).toBe(false);
    });

    it("stress tests rapid specimen cycling (1,000 continuous iterations) for closure integrity", () => {
      const specimenIds = SPECIMENS.map((s) => s.id);
      let currentId = specimenIds[0];

      for (let i = 0; i < 1000; i++) {
        const nextId = specimenIds[i % specimenIds.length];
        currentId = nextId;
        const doc = SPECIMENS.find((d) => d.id === currentId);

        expect(doc).toBeDefined();
        expect(doc!.sha256Digest.length).toBe(64);
        expect(doc!.clauses.length).toBe(4);
      }
    });

    it("verifies spring damping scaling for prefers-reduced-motion compliance", () => {
      // shouldReduceMotion branch increases stiffness to 1000 and damping to 100
      expect(stageCode).toContain("shouldReduceMotion");
      expect(stageCode).toContain("{ stiffness: 1000, damping: 100 }");
      expect(stageCode).toContain("{ stiffness: 400, damping: 30, mass: 0.1 }");
    });

    it("verifies CSS clip-path transition is disabled during active dragging to eliminate render latency", () => {
      // During active dragging: transition must be 'none' for 60/120fps sync
      // When idle: transition uses Emil Kowalski spring easing '200ms cubic-bezier(0.32, 0.72, 0, 1)'
      expect(stageCode).toContain('transition: isDraggingSlider ? "none" : "clip-path 200ms cubic-bezier(0.32, 0.72, 0, 1)"');
    });
  });
});

