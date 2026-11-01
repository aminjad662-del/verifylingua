import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import fs from "fs";
import path from "path";

describe("Milestone M2/M3 Empirical Challenger Verification (R2 & R3)", () => {
  const repoRoot = path.resolve(__dirname, "..");
  const landingPagePath = path.join(repoRoot, "app", "page.tsx");
  const translatePagePath = path.join(repoRoot, "app", "translate", "page.tsx");
  const sovereignConsolePath = path.join(repoRoot, "components", "marketing", "SovereignLegalConsole.tsx");

  const landingSource = fs.readFileSync(landingPagePath, "utf8");
  const translateSource = fs.readFileSync(translatePagePath, "utf8");

  describe("R3: Landing Page Restoration & Disk Retention", () => {
    it("1. Verifies SovereignLegalConsole.tsx is preserved on disk", () => {
      expect(fs.existsSync(sovereignConsolePath)).toBe(true);
      const sovereignSource = fs.readFileSync(sovereignConsolePath, "utf8");
      expect(sovereignSource).toContain("export function SovereignLegalConsole");
    });

    it("2. Verifies app/page.tsx has completely purged the 4 redesign components", () => {
      expect(landingSource).not.toContain("SovereignLegalConsole");
      expect(landingSource).not.toContain("UscisComplianceBento");
      expect(landingSource).not.toContain("LegalComparisonMatrix");
      expect(landingSource).not.toContain("PreFooterCTA");
    });

    it("3. Verifies app/page.tsx restored the prior design suite", () => {
      expect(landingSource).toContain('import { Header } from "@/components/layout/Header";');
      expect(landingSource).toContain('import { Footer } from "@/components/layout/Footer";');
      expect(landingSource).toContain('import { LegalHero } from "@/components/marketing/LegalHero";');
      expect(landingSource).toContain('import { InstitutionalTrustStrip } from "@/components/marketing/InstitutionalTrustStrip";');
      expect(landingSource).toContain('import { LegalPrecisionBento } from "@/components/marketing/LegalPrecisionBento";');
      expect(landingSource).toContain('import { WorkflowInteractive } from "@/components/marketing/WorkflowInteractive";');

      expect(landingSource).toContain("<Header />");
      expect(landingSource).toContain("<LegalHero />");
      expect(landingSource).toContain("<InstitutionalTrustStrip />");
      expect(landingSource).toContain("<LegalPrecisionBento />");
      expect(landingSource).toContain("<WorkflowInteractive />");
      expect(landingSource).toContain("<Footer />");
    });

    it("4. Verifies restored landing page components route CTAs to /translate", () => {
      const heroPath = path.join(repoRoot, "components", "marketing", "LegalHero.tsx");
      const heroSource = fs.readFileSync(heroPath, "utf8");
      expect(heroSource).toContain('href="/translate"');
      expect(heroSource).not.toContain('href="/order/triage"');

      const workflowPath = path.join(repoRoot, "components", "marketing", "WorkflowInteractive.tsx");
      const workflowSource = fs.readFileSync(workflowPath, "utf8");
      expect(workflowSource).toContain('href="/translate"');
      expect(workflowSource).not.toContain('href="/order/triage"');
    });
  });

  describe("R2: Workspace Direct Intake UI State & Hydration", () => {
    it("1. Verifies SearchParamsHandler is wrapped in Suspense with fallback={null}", () => {
      expect(translateSource).toContain("<Suspense fallback={null}>");
      expect(translateSource).toContain("<SearchParamsHandler onParams={handleParams} />");
      expect(translateSource).toContain("</Suspense>");
    });

    it("2. Verifies SearchParamsHandler parses all required parameters and normalization", () => {
      expect(translateSource).toContain('searchParams.get("source") || searchParams.get("sourceLang")');
      expect(translateSource).toContain('searchParams.get("target") || searchParams.get("targetLang")');
      expect(translateSource).toContain('searchParams.get("tier") || searchParams.get("serviceTier")');
      expect(translateSource).toContain('searchParams.get("notarization") === "true"');
      expect(translateSource).toContain('searchParams.get("expedited") === "true"');
      expect(translateSource).toContain('searchParams.get("doc") || searchParams.get("sample")');
      expect(translateSource).toContain('searchParams.get("vaultDoc")');
      expect(translateSource).toContain('searchParams.get("pages")');
    });

    it("3. Verifies specimen sample doc slug normalization handles hyphens and underscores", () => {
      expect(translateSource).toContain('const normalizedDoc = params.doc.toLowerCase().replace(/[-_]/g, " ");');
      expect(translateSource).toContain('s.name.toLowerCase().includes(normalizedDoc)');
    });

    it("4. Verifies Section 2 operational controls render on first paint whenever !job", () => {
      expect(translateSource).toContain("2. Translation Configuration & Legal Output");
      expect(translateSource).toContain("{!job && (");
      expect(translateSource).toContain("Source Language");
      expect(translateSource).toContain("Target Language");
      expect(translateSource).toContain("handleSwapLanguages");
      expect(translateSource).toContain("Service Level & Legal Certification");
      expect(translateSource).toContain("Automated Vector Translation");
      expect(translateSource).toContain("Certified USCIS Packet");
      expect(translateSource).toContain("Neural Vector & Artwork Lock Active");
    });

    it("5. Verifies dynamic CTA button text and file trigger mechanics", () => {
      // Dynamic CTA label when !stagedFile
      expect(translateSource).toContain(
        `!stagedFile\n                      ? (serviceTier === "certified" ? "Select Document for Certified Translation" : "Select Document to Translate")`
      );
      // Dynamic CTA label when stagedFile is present
      expect(translateSource).toContain(
        `: (serviceTier === "certified"\n                        ? "Submit for Certified USCIS Translation"\n                        : "Begin Vector-Preserving Translation")`
      );
      // Dynamic onClick handler when !stagedFile triggers file input
      expect(translateSource).toContain(
        `onClick={stagedFile ? handleTranslateSample : () => {\n                      const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;\n                      if (input) input.click();\n                    }}`
      );
    });

    it("6. Verifies sessionStorage pending_upload restoration with handleStageFile and dimension calculation", () => {
      expect(translateSource).toContain('sessionStorage.getItem("pending_upload")');
      expect(translateSource).toContain("setSourceLang(parsed.detectedLang)");
      expect(translateSource).toContain('setServiceTier("certified")');
      expect(translateSource).toContain("handleStageFile(file)");
      expect(translateSource).toContain("setStagedDimensions({ width: img.naturalWidth, height: img.naturalHeight })");
      expect(translateSource).toContain("Session Restored");
    });
  });
});
