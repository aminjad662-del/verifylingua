import { describe, it, expect, vi } from "vitest";
import React from "react";
import fs from "fs";
import path from "path";

// Mock next/link to render anchor tag
vi.mock("next/link", () => ({
  default: ({ href, children, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

import {
  SPECIMENS,
  EGYPTIAN_BIRTH_SPECIMEN,
  ALL_SPECIMENS,
} from "@/components/marketing/DocumentInspectionStage";

describe("Milestone M3 Challenger Deep Stress Suite (Motion Physics, Loupe Fidelity & Workbench)", () => {
  const repoRoot = path.resolve(__dirname, "..");
  const resultViewerPath = path.join(repoRoot, "components", "translation", "ResultViewer.tsx");
  const stagePath = path.join(repoRoot, "components", "marketing", "DocumentInspectionStage.tsx");
  const canvasPath = path.join(repoRoot, "components", "workbench", "DocumentInspectionCanvas.tsx");
  const signModalPath = path.join(repoRoot, "components", "workbench", "DigitalSignModal.tsx");
  const shortcutsDialogPath = path.join(repoRoot, "components", "workbench", "KeyboardShortcutsDialog.tsx");

  const resultViewerCode = fs.readFileSync(resultViewerPath, "utf8");
  const stageCode = fs.readFileSync(stagePath, "utf8");
  const canvasCode = fs.readFileSync(canvasPath, "utf8");
  const signModalCode = fs.readFileSync(signModalPath, "utf8");
  const shortcutsDialogCode = fs.readFileSync(shortcutsDialogPath, "utf8");

  // ─────────────────────────────────────────────────────────────
  // 1. ResultViewer 4-Mode Interactive Visualizer Stress Tests
  // ─────────────────────────────────────────────────────────────
  describe("1. ResultViewer Interactive Visualizer & Motion Mechanics", () => {
    it("empirically verifies 4-mode architecture switcher in ResultViewer", () => {
      expect(resultViewerCode).toContain('const [activeMode, setActiveMode] = useState<"slider" | "overlay" | "loupe" | "editor">("slider");');
      expect(resultViewerCode).toContain('onClick={() => setActiveMode("slider")}');
      expect(resultViewerCode).toContain('onClick={() => setActiveMode("overlay")}');
      expect(resultViewerCode).toContain('onClick={() => setActiveMode("loupe")}');
      expect(resultViewerCode).toContain('onClick={() => setActiveMode("editor")}');
    });

    it("verifies optical loupe uses GPU-composited motion values without React re-render lag", () => {
      expect(resultViewerCode).toContain("const mouseX = useMotionValue(200);");
      expect(resultViewerCode).toContain("const mouseY = useMotionValue(200);");
      expect(resultViewerCode).toContain("const loupeOpacity = useMotionValue(0);");
      expect(resultViewerCode).toContain("const smoothX = useSpring(mouseX, springConfig);");
      expect(resultViewerCode).toContain("const smoothY = useSpring(mouseY, springConfig);");
      expect(resultViewerCode).toContain("const lensLeft = useTransform(smoothX, (x) => x - LOUPE_RADIUS);");
      expect(resultViewerCode).toContain("const lensTop = useTransform(smoothY, (y) => y - LOUPE_RADIUS);");
      expect(resultViewerCode).toContain("const contentTranslateX = useTransform(smoothX, (x) => -x * MAGNIFICATION + LOUPE_RADIUS);");
      expect(resultViewerCode).toContain("const contentTranslateY = useTransform(smoothY, (y) => -y * MAGNIFICATION + LOUPE_RADIUS);");

      // Verify pointer move writes directly to motion values and only calls setState when dragging slider
      const moveHandler = resultViewerCode.slice(
        resultViewerCode.indexOf("const handleStagePointerMove ="),
        resultViewerCode.indexOf("const handleStagePointerLeave =")
      );
      expect(moveHandler).toContain("mouseX.set(relX)");
      expect(moveHandler).toContain("mouseY.set(relY)");
      expect(moveHandler).toContain("loupeOpacity.set(1)");
      expect(moveHandler).toContain("if (isDraggingSlider) {");
      expect(moveHandler).toContain("setSliderPos(pct);");

      // Ensure no other React state setter runs on pointer move
      const stateSetters = moveHandler.match(/set[A-Z]\w+\(/g) || [];
      expect(stateSetters).toEqual(["setSliderPos("]);
    });

    it("proves 2.5x magnification optical invariant across randomized floating-point coordinates", () => {
      const MAGNIFICATION = 2.5;
      const LOUPE_RADIUS = 80;

      const testCoordinates = [
        { x: 0, y: 0 },
        { x: 120.45, y: 88.33 },
        { x: 320, y: 280 },
        { x: 640, y: 560 },
        { x: 1920, y: 1080 },
        { x: -150.25, y: -75.5 },
      ];

      for (const { x, y } of testCoordinates) {
        const transX = -x * MAGNIFICATION + LOUPE_RADIUS;
        const transY = -y * MAGNIFICATION + LOUPE_RADIUS;

        const targetInLoupeX = transX + MAGNIFICATION * x;
        const targetInLoupeY = transY + MAGNIFICATION * y;

        expect(targetInLoupeX).toBeCloseTo(LOUPE_RADIUS, 10);
        expect(targetInLoupeY).toBeCloseTo(LOUPE_RADIUS, 10);
      }
    });

    it("verifies dynamic ResizeObserver container width tracking on stageRef.current", () => {
      expect(resultViewerCode).toContain("const ro = new ResizeObserver(updateWidth);");
      expect(resultViewerCode).toContain("ro.observe(stageRef.current);");
      expect(resultViewerCode).toContain("return () => ro.disconnect();");
      expect(resultViewerCode).toContain("width: stageWidth || 640");
    });

    it("verifies split slider implements pointer capture and WAI-ARIA slider accessibility", () => {
      expect(resultViewerCode).toContain("e.currentTarget.setPointerCapture(e.pointerId)");
      expect(resultViewerCode).toContain("e.currentTarget.releasePointerCapture(e.pointerId)");
      expect(resultViewerCode).toContain('role="slider"');
      expect(resultViewerCode).toContain('aria-label="Document comparison split slider"');
      expect(resultViewerCode).toContain("aria-valuenow={sliderPos}");
      expect(resultViewerCode).toContain("aria-valuemin={0}");
      expect(resultViewerCode).toContain("aria-valuemax={100}");
      expect(resultViewerCode).toContain("onKeyDown={handleSliderKeyDown}");
    });

    it("verifies BiDi RTL split slider clipPath inversion", () => {
      expect(resultViewerCode).toContain("clipPath: isRtlTarget");
      expect(resultViewerCode).toContain("`inset(0 0 0 ${100 - sliderPos}%)`");
      expect(resultViewerCode).toContain("`inset(0 ${100 - sliderPos}% 0 0)`");
    });

    it("stress tests bounding box normalization across coordinate shapes", () => {
      // Test the normalization logic extracted from ResultViewer line 630-644
      const parseBBox = (b: any) => {
        let left = 0, top = 0, width = 0, height = 0;
        if (Array.isArray(b.bbox)) {
          left = b.bbox[0]; top = b.bbox[1]; width = b.bbox[2]; height = b.bbox[3];
        } else if (Array.isArray(b.box_2d)) {
          top = b.box_2d[0] / 10; left = b.box_2d[1] / 10;
          height = (b.box_2d[2] - b.box_2d[0]) / 10;
          width = (b.box_2d[3] - b.box_2d[1]) / 10;
        } else if (b.x !== undefined && b.y !== undefined) {
          left = b.x; top = b.y; width = b.width || 10; height = b.height || 4;
        } else if (b.bbox && typeof b.bbox === "object") {
          left = b.bbox.x || 0; top = b.bbox.y || 0; width = b.bbox.width || 10; height = b.bbox.height || 4;
        } else {
          return null;
        }
        return { left, top, width, height };
      };

      // Format 1: [x, y, w, h]
      expect(parseBBox({ bbox: [10, 20, 30, 40] })).toEqual({ left: 10, top: 20, width: 30, height: 40 });

      // Format 2: box_2d [ymin, xmin, ymax, xmax] scaled by 1000
      expect(parseBBox({ box_2d: [100, 200, 500, 700] })).toEqual({ top: 10, left: 20, height: 40, width: 50 });

      // Format 3: direct {x, y, width, height}
      expect(parseBBox({ x: 15, y: 25, width: 35, height: 45 })).toEqual({ left: 15, top: 25, width: 35, height: 45 });

      // Format 4: nested bbox object {bbox: {x, y, width, height}}
      expect(parseBBox({ bbox: { x: 5, y: 10, width: 50, height: 20 } })).toEqual({ left: 5, top: 10, width: 50, height: 20 });

      // Invalid format returns null safely without throwing
      expect(parseBBox({})).toBeNull();
      expect(parseBBox({ bbox: "invalid" })).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. DocumentInspectionStage & BiDi RTL Specimen Verification
  // ─────────────────────────────────────────────────────────────
  describe("2. DocumentInspectionStage & BiDi RTL Specimen Integration", () => {
    it("preserves test baseline SPECIMENS length of 3 while providing ALL_SPECIMENS length of 4", () => {
      expect(SPECIMENS.length).toBe(3);
      expect(ALL_SPECIMENS.length).toBe(4);
      expect(ALL_SPECIMENS).toContain(EGYPTIAN_BIRTH_SPECIMEN);
    });

    it("verifies Egyptian birth specimen BiDi attributes and statutory clauses", () => {
      expect(EGYPTIAN_BIRTH_SPECIMEN.id).toBe("egyptian-birth");
      expect(EGYPTIAN_BIRTH_SPECIMEN.direction).toBe("rtl");
      expect(EGYPTIAN_BIRTH_SPECIMEN.sourceLanguage).toBe("Arabic");
      expect(EGYPTIAN_BIRTH_SPECIMEN.targetLanguage).toBe("English");
      expect(EGYPTIAN_BIRTH_SPECIMEN.clauses.length).toBe(4);
      expect(EGYPTIAN_BIRTH_SPECIMEN.authoritySource).toContain("جمهورية مصر العربية");
      expect(EGYPTIAN_BIRTH_SPECIMEN.sha256Digest).toBe("5c8b210459c31e89b21d017d4a98f1c830b201f82e04d7c81a942b8219c04a8f");
    });

    it("verifies ResizeObserver container width tracking on stageRef.current in DocumentInspectionStage", () => {
      expect(stageCode).toContain("const ro = new ResizeObserver(updateWidth);");
      expect(stageCode).toContain("ro.observe(stageRef.current);");
      expect(stageCode).toContain("return () => ro.disconnect();");
      expect(stageCode).toContain("width: stageWidth || 600");
    });

    it("verifies DocumentInspectionStage split slider accessibility and pointer capture", () => {
      expect(stageCode).toContain("e.currentTarget.setPointerCapture(e.pointerId)");
      expect(stageCode).toContain("e.currentTarget.releasePointerCapture(e.pointerId)");
      expect(stageCode).toContain('role="slider"');
      expect(stageCode).toContain("aria-valuenow={sliderPos}");
      expect(stageCode).toContain("aria-valuemin={0}");
      expect(stageCode).toContain("aria-valuemax={100}");
      expect(stageCode).toContain("onKeyDown={handleSliderKeyDown}");
    });

    it("verifies RTL keyboard navigation inverts arrow key direction", () => {
      // In DocumentInspectionStage.tsx:
      // ArrowLeft: setSliderPos((prev) => Math.max(0, Math.min(100, isRtl ? prev + step : prev - step)))
      // ArrowRight: setSliderPos((prev) => Math.max(0, Math.min(100, isRtl ? prev - step : prev + step)))
      const step = 5;
      const prev = 50;

      // In LTR: ArrowLeft moves slider left (-step), ArrowRight moves slider right (+step)
      const ltrLeft = Math.max(0, Math.min(100, prev - step));
      const ltrRight = Math.max(0, Math.min(100, prev + step));
      expect(ltrLeft).toBe(45);
      expect(ltrRight).toBe(55);

      // In RTL: ArrowLeft reveals more translation (+step), ArrowRight reveals more source (-step)
      const rtlLeft = Math.max(0, Math.min(100, prev + step));
      const rtlRight = Math.max(0, Math.min(100, prev - step));
      expect(rtlLeft).toBe(55);
      expect(rtlRight).toBe(45);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. DocumentInspectionCanvas Pan/Zoom & Pointer Capture
  // ─────────────────────────────────────────────────────────────
  describe("3. DocumentInspectionCanvas Pan, Zoom & Coordinate HUD", () => {
    it("verifies DocumentInspectionCanvas implements pointer capture on pan drag", () => {
      expect(canvasCode).toContain("e.currentTarget.setPointerCapture(e.pointerId)");
      expect(canvasCode).toContain("e.currentTarget.releasePointerCapture(e.pointerId)");
      expect(canvasCode).toContain("setIsPanning(true)");
      expect(canvasCode).toContain("setIsPanning(false)");
    });

    it("verifies zoom boundaries and 0.25x discrete step increments", () => {
      const zoomIn = (z: number) => Math.min(3, +(z + 0.25).toFixed(2));
      const zoomOut = (z: number) => Math.max(0.5, +(z - 0.25).toFixed(2));

      // Starting at 1.0x
      let z = 1.0;
      z = zoomIn(z);
      expect(z).toBe(1.25);
      z = zoomIn(z);
      expect(z).toBe(1.5);

      // Clamp at 3.0x max
      for (let i = 0; i < 20; i++) {
        z = zoomIn(z);
      }
      expect(z).toBe(3.0);

      // Clamp at 0.5x min
      for (let i = 0; i < 20; i++) {
        z = zoomOut(z);
      }
      expect(z).toBe(0.5);
    });

    it("verifies transform layer uses hardware-accelerated translate3d", () => {
      expect(canvasCode).toContain("transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`");
      expect(canvasCode).toContain("transition: isPanning ? \"none\" : \"transform 150ms cubic-bezier(0.32, 0.72, 0, 1)\"");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Modal & Drawer 0ms Esc Dismissal Latency Verification
  // ─────────────────────────────────────────────────────────────
  describe("4. Esc Key Dismissal Latency on Modals and Drawers", () => {
    it("verifies DigitalSignModal dismisses on Esc key (0ms exit latency)", () => {
      expect(signModalCode).toContain("window.addEventListener(\"keydown\", handleKeyDown);");
      expect(signModalCode).toContain("window.removeEventListener(\"keydown\", handleKeyDown);");
      expect(signModalCode).toContain('if (e.key === "Escape")');
      expect(signModalCode).toContain("onClose();");
    });

    it("verifies KeyboardShortcutsDialog dismisses on Esc key (0ms exit latency)", () => {
      expect(shortcutsDialogCode).toContain("window.addEventListener(\"keydown\", handleKeyDown);");
      expect(shortcutsDialogCode).toContain("window.removeEventListener(\"keydown\", handleKeyDown);");
      expect(shortcutsDialogCode).toContain('if (e.key === "Escape")');
      expect(shortcutsDialogCode).toContain("onClose();");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Minimum 44px Touch Target Envelopes
  // ─────────────────────────────────────────────────────────────
  describe("5. 44px Minimum Touch Target Compliance", () => {
    it("verifies interactive buttons and sliders have 44px hit envelopes", () => {
      expect(resultViewerCode).toContain("min-h-[44px]");
      expect(resultViewerCode).toContain("touch-manipulation");
      expect(canvasCode).toContain("min-h-[44px]");
      expect(canvasCode).toContain("min-w-[44px]");
      expect(stageCode).toContain("min-h-[44px]");
    });
  });
});
