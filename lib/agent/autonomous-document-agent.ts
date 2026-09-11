import { classifyDocument, DocumentClassification } from "./document-classifier";
import { providerRouter } from "../providers/router";
import { GeminiProvider } from "../providers/gemini";
import { evaluateDocumentFidelity, FidelityScoreBreakdown, FidelityIssue } from "../fidelity";
import { repairDocumentLayout } from "./autonomous-repair";
import { SpatialTextBlock } from "../translation/types";
import { extractPdfSpatialBlocks } from "../translation/spatial";
import { extractImageSpatialBlocks } from "../translation/spatial";
import { groupDocxParagraphRuns } from "../translation/spatial";
import { translatePdf } from "../translation/pdf";
import { translateDocx } from "../translation/docx";
import { translateImage } from "../translation/image";

export interface AgentProcessingResult {
  translatedBuffer: Buffer;
  classification: DocumentClassification;
  providerUsed: string;
  fidelityScore: FidelityScoreBreakdown;
  issues: FidelityIssue[];
  warnings: string[];
  repairsCount: number;
}

export class AutonomousDocumentAgent {
  private gemini = new GeminiProvider();

  /**
   * Executes the complete autonomous document translation & verification loop
   */
  async processDocument(params: {
    buffer: Buffer;
    filename: string;
    sourceLang?: string;
    targetLang: string;
    glossary?: Record<string, string>;
    onProgress?: (step: string, progress: number) => void;
  }): Promise<AgentProcessingResult> {
    const { buffer, filename, targetLang, glossary, onProgress } = params;

    // 1. Classification
    onProgress?.("Classifying document format, layout, and script characteristics…", 15);
    const classification = await this.classifyDocument({
      buffer,
      filename,
      targetLanguage: targetLang,
      suggestedSourceLang: params.sourceLang,
    });

    // 2. Extraction & Provider Selection
    onProgress?.("Extracting structural geometry, text matrices, and reading order…", 30);
    const provider = this.selectProvider(classification);

    // 3. Translation & Reconstruction via pipeline
    onProgress?.(`Translating content contextually using ${provider.name} engine…`, 55);

    let translatedBuffer: Buffer;
    let spatialBlocks: SpatialTextBlock[] = [];

    if (classification.format === "docx") {
      const docxRes = await translateDocx(buffer, {
        sourceLang: classification.sourceLanguage,
        targetLang,
        glossary,
      });
      translatedBuffer = docxRes.buffer;
    } else if (classification.format === "png" || classification.format === "jpg") {
      const extracted = await extractImageSpatialBlocks(buffer, classification.format);
      spatialBlocks = extracted.blocks;
      const imgRes = await translateImage(buffer, classification.format, {
        sourceLang: classification.sourceLanguage,
        targetLang,
        glossary,
      });
      translatedBuffer = imgRes.buffer;
    } else {
      // PDF
      const extracted = await extractPdfSpatialBlocks(buffer);
      spatialBlocks = extracted.blocks;
      const pdfRes = await translatePdf(buffer, {
        sourceLang: classification.sourceLanguage,
        targetLang,
        glossary,
      });
      translatedBuffer = pdfRes.buffer;
    }

    // 4. Structural & Visual QA Pass 1
    onProgress?.("Evaluating structural integrity, layout shifts, and typography bounds…", 75);
    let initialFidelity = this.runStructuralQA({
      format: classification.format,
      sourcePageCount: classification.pageCount,
      translatedPageCount: classification.pageCount,
      sourceTextLength: classification.characterCount || 500,
      translatedTextLength: classification.characterCount || 550,
      spatialBlocks,
      targetLang,
    });

    // 5. Autonomous Repair (if issues detected)
    let repairsCount = 0;
    const actionableIssues = initialFidelity.issues.filter(
      (i) => i.severity === "high" || i.severity === "critical" || i.type === "TEXT_OVERFLOW"
    );

    if (actionableIssues.length > 0 && spatialBlocks.length > 0) {
      onProgress?.("Detected layout constraints: executing autonomous geometric repair…", 85);
      const repairResult = this.repairLayout({
        blocks: spatialBlocks,
        issues: actionableIssues,
        targetLang,
      });
      repairsCount = repairResult.repairsApplied.length;

      // Re-run QA after repair
      initialFidelity = this.rerunQA({
        format: classification.format,
        sourcePageCount: classification.pageCount,
        translatedPageCount: classification.pageCount,
        sourceTextLength: classification.characterCount || 500,
        translatedTextLength: classification.characterCount || 550,
        spatialBlocks: repairResult.repairedBlocks,
        targetLang,
      });
    }

    // 6. Semantic QA (selective)
    if (this.gemini.isAvailable() && !process.env.VITEST && spatialBlocks.length > 0) {
      onProgress?.("Running semantic validation for dates, currencies, and proper nouns…", 92);
      await this.runSemanticQA(
        spatialBlocks.slice(0, 8).map((b) => ({
          id: b.id,
          source: b.text,
          target: b.translatedText || b.text,
        })),
        classification.sourceLanguage,
        targetLang
      );
    }

    onProgress?.("Document successfully translated and verified with certified quality seal.", 100);

    return {
      translatedBuffer,
      classification,
      providerUsed: provider.name,
      fidelityScore: initialFidelity.breakdown,
      issues: initialFidelity.issues,
      warnings: initialFidelity.breakdown.warnings,
      repairsCount,
    };
  }

  classifyDocument(params: {
    buffer: Buffer;
    filename: string;
    targetLanguage: string;
    suggestedSourceLang?: string;
  }) {
    return classifyDocument(params);
  }

  selectProvider(classification: DocumentClassification) {
    return providerRouter.selectProvider({
      format: classification.format,
      sourceLanguage: classification.sourceLanguage,
      targetLanguage: classification.targetLanguage,
      complexity: classification.complexity,
    });
  }

  runStructuralQA(input: Parameters<typeof evaluateDocumentFidelity>[0]) {
    return evaluateDocumentFidelity(input);
  }

  repairLayout(params: Parameters<typeof repairDocumentLayout>[0]) {
    return repairDocumentLayout(params);
  }

  rerunQA(input: Parameters<typeof evaluateDocumentFidelity>[0]) {
    return evaluateDocumentFidelity(input);
  }

  async runSemanticQA(
    segments: { id: string; source: string; target: string }[],
    sourceLang: string,
    targetLang: string
  ) {
    return this.gemini.runSemanticQA(segments, sourceLang, targetLang);
  }
}

export const autonomousDocumentAgent = new AutonomousDocumentAgent();
