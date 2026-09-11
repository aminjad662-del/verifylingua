import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  createDocumentIR,
  validateDocumentIR,
  updateIRElementTranslation,
  queryIRElementsByType,
} from "../lib/document-ir";
import {
  maskProtectedEntities,
  unmaskProtectedEntities,
  validateEntityIntegrity,
} from "../lib/translation/entity-protection";
import { JobLifecycleStateMachine } from "../lib/pipeline/status-model";
import { calculatePreProcessingFeasibility } from "../lib/preflight/feasibility";
import { validateDeliveryArtifact } from "../lib/delivery/artifact-validator";

const FIXTURES_DIR = path.join(process.cwd(), "fixtures");
const pdfBuffer = fs.readFileSync(path.join(FIXTURES_DIR, "sample_birth_cert.pdf"));
const docxBuffer = fs.readFileSync(path.join(FIXTURES_DIR, "sample_transcript.docx"));
const jpgBuffer = fs.readFileSync(path.join(FIXTURES_DIR, "sample_diploma.jpg"));

describe("Enterprise Pipeline & Quality Gates Suite", () => {
  describe("1. Document Intermediate Representation (IR) Engine", () => {
    it("creates and validates a structurally sound multi-page document IR", () => {
      const ir = createDocumentIR({
        documentId: "doc_test_101",
        format: "pdf",
        sourceLanguage: "es",
        targetLanguage: "en",
        pageDimensions: [
          { width: 612, height: 792 },
          { width: 612, height: 792 },
        ],
      });

      expect(ir.documentId).toBe("doc_test_101");
      expect(ir.pageCount).toBe(2);
      expect(ir.pages[0].pageId).toBe("page_doc_test_101_1");
      expect(ir.pages[1].pageId).toBe("page_doc_test_101_2");

      // Add text element
      ir.pages[0].elements.push({
        elementId: "el_1",
        pageId: "page_doc_test_101_1",
        documentId: "doc_test_101",
        elementType: "text",
        sourceText: "Republica de Colombia - Certificado de Nacimiento",
        coordinates: { x: 50, y: 700, width: 400, height: 20, bbox: [50, 700, 450, 720] },
        readingOrder: 1,
        fontInfo: { fontFamily: "Helvetica", fontSize: 16, fontWeight: "bold" },
        styleInfo: { alignment: "center" },
        languageDirection: "ltr",
        ocrConfidence: 100,
        translationConfidence: 0,
        reviewStatus: "unreviewed",
      });

      const validation = validateDocumentIR(ir);
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);

      // Update translation
      const updated = updateIRElementTranslation(
        ir,
        "el_1",
        "Republic of Colombia - Birth Certificate",
        98
      );
      expect(updated).toBe(true);
      expect(ir.pages[0].elements[0].targetText).toBe("Republic of Colombia - Birth Certificate");
      expect(ir.pages[0].elements[0].reviewStatus).toBe("approved");

      // Query elements by type
      const texts = queryIRElementsByType(ir, "text");
      expect(texts.length).toBe(1);
    });

    it("detects schema invalidity and catches missing fields or negative bounds", () => {
      const invalidIr = createDocumentIR({
        documentId: "doc_invalid",
        format: "pdf",
        sourceLanguage: "en",
        pageDimensions: [{ width: -100, height: 0 }],
      });

      const res = validateDocumentIR(invalidIr);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes("invalid dimensions"))).toBe(true);
    });
  });

  describe("2. Protected Entity & Strict Validation Rules", () => {
    it("masks, unmasks, and validates emails, URLs, dates, numbers, currencies, and case numbers", () => {
      const sourceText =
        "Petitioner Case No. 2024-CV-8891 under 8 CFR 103.2 was processed on 2024-05-12. Fee: $500.00 USD paid via info@uscis.gov. Passport: A12345678.";

      const { maskedText, entities } = maskProtectedEntities(sourceText);

      expect(entities.length).toBeGreaterThan(3);
      expect(maskedText).toContain("{{VL_PROTECT_");

      // Simulated translation that keeps tokens intact
      const simulatedTranslation = maskedText.replace("Petitioner", "Demandeur").replace("paid via", "payé via");

      // Unmask
      const restored = unmaskProtectedEntities(simulatedTranslation, entities);
      expect(restored).toContain("Case No. 2024-CV-8891");
      expect(restored).toContain("8 CFR 103.2");
      expect(restored).toContain("$500.00 USD");
      expect(restored).toContain("info@uscis.gov");
      expect(restored).toContain("A12345678");

      const validation = validateEntityIntegrity(sourceText, restored, entities);
      expect(validation.passed).toBe(true);
      expect(validation.score).toBe(100);
      expect(validation.missingEntities.length).toBe(0);
    });

    it("flags altered or missing protected entities when target text has dropped critical numbers", () => {
      const sourceText = "Annual Salary: $85,000 USD, Effective Date: 2023-01-01.";
      const { entities } = maskProtectedEntities(sourceText);

      // Faulty translation where salary was omitted
      const faultyTranslation = "Salaire annuel : [MISSING], Date d'effet : 2023-01-01.";

      const validation = validateEntityIntegrity(sourceText, faultyTranslation, entities);
      expect(validation.passed).toBe(false);
      expect(validation.missingEntities.length).toBeGreaterThan(0);
      expect(validation.issues.some((i) => i.includes("missing") || i.includes("Numeric discrepancy"))).toBe(true);
    });
  });

  describe("3. 17-State Customer Lifecycle Status Model", () => {
    it("progresses sequentially through mandatory states with audit timestamps and metadata", () => {
      const sm = new JobLifecycleStateMachine("job_audit_999");
      expect(sm.getCurrentState().state).toBe("Uploaded");

      sm.transitionTo("Validating", {
        currentAction: "Validating MIME magic bytes and file limits.",
        nextAction: "Perform anti-malware inspection.",
      });
      expect(sm.getCurrentState().state).toBe("Validating");

      sm.transitionTo("Security scanning", {
        currentAction: "Scanning buffer for malicious signatures.",
        nextAction: "Classify document layout topology.",
      });
      expect(sm.getCurrentState().state).toBe("Security scanning");

      sm.transitionTo("Translating", {
        currentAction: "Translating structured text nodes.",
        nextAction: "Perform spatial layout reconstruction.",
      });
      expect(sm.getCurrentState().state).toBe("Translating");

      sm.transitionTo("Human review required", {
        currentAction: "Low OCR confidence on stamp requires linguist review.",
        nextAction: "Awaiting linguist sign-off.",
        customerActionRequired: false,
        canEscalateToHuman: true,
      });
      expect(sm.getCurrentState().state).toBe("Human review required");
      expect(sm.getCurrentState().retryOrEscalationPath.canEscalateToHuman).toBe(true);

      const history = sm.getHistory();
      expect(history.length).toBe(5);
    });
  });

  describe("4. Pre-Processing Feasibility Assessment Engine", () => {
    it("computes 16 feasibility attributes for text-native PDF", async () => {
      const rep = await calculatePreProcessingFeasibility(
        pdfBuffer,
        "sample_birth_cert.pdf",
        "fr",
        "automated"
      );

      expect(rep.fileType).toBe("pdf");
      expect(rep.pageCount).toBeGreaterThanOrEqual(1);
      expect(rep.estimatedWordCount).toBeGreaterThan(0);
      expect(rep.expectedOutputFormat).toBe("pdf");
      expect(rep.estimatedPrice.baseAmount).toBeGreaterThan(0);
      expect(rep.estimatedPrice.currency).toBe("USD");
      expect(rep.estimatedProcessingTimeSeconds).toBeGreaterThan(0);
    });

    it("flags scanned image requirements and suggests professional tier for photographed diploma", async () => {
      const rep = await calculatePreProcessingFeasibility(
        jpgBuffer,
        "sample_diploma.jpg",
        "en",
        "automated"
      );

      expect(rep.ocrRequirement).toBe(true);
      expect(rep.fileType).toBe("jpg");
      expect(rep.knownLimitations.length).toBeGreaterThan(0);
      expect(rep.humanReviewRecommendation.recommendedTier).toBe("professional");
    });
  });

  describe("5. Artifact Delivery Verification Gate", () => {
    it("approves delivery when all 12 validation criteria pass", async () => {
      const result = await validateDeliveryArtifact({
        outputBuffer: pdfBuffer,
        expectedFormat: "pdf",
        expectedPageCount: 1,
        sourceTextSample: "Birth Certificate 1990",
        translatedTextSample: "Certificado de Nacimiento 1990",
        visualQaScore: 96,
        scanStatus: "CLEAN",
        downloadUrl: "https://api.verifylingua.com/download/job_123?token=abc",
      });

      expect(result.canMarkReadyOrDelivered).toBe(true);
      expect(result.recommendedStatus).toBe("Ready");
      expect(result.sha256Checksum.length).toBe(64);
      expect(result.checks.outputOpens).toBe(true);
      expect(result.checks.formatCorrect).toBe(true);
      expect(result.checks.numbersAndDatesPass).toBe(true);
    });

    it("strictly refuses to mark Ready when buffer is empty or corrupted", async () => {
      const result = await validateDeliveryArtifact({
        outputBuffer: Buffer.from(""),
        expectedFormat: "pdf",
        expectedPageCount: 1,
        sourceTextSample: "Sample",
        translatedTextSample: "Exemple",
        downloadUrl: "https://api.verifylingua.com/download/job_empty",
      });

      expect(result.canMarkReadyOrDelivered).toBe(false);
      expect(result.recommendedStatus).toBe("Failed");
      expect(result.failures.some((f) => f.includes("empty"))).toBe(true);
    });

    it("routes to Human Review Required when numeric discrepancy is detected", async () => {
      const result = await validateDeliveryArtifact({
        outputBuffer: pdfBuffer,
        expectedFormat: "pdf",
        expectedPageCount: 1,
        sourceTextSample: "Invoice Total: $4,500.00 Date: 2024",
        translatedTextSample: "Total Factura: [Missing] Date: 2024",
        visualQaScore: 92,
        scanStatus: "CLEAN",
        downloadUrl: "https://api.verifylingua.com/download/job_err",
      });

      expect(result.canMarkReadyOrDelivered).toBe(false);
      expect(result.recommendedStatus).toBe("Human review required");
      expect(result.checks.numbersAndDatesPass).toBe(false);
    });
  });
});
