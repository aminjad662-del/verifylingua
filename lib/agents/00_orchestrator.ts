import { prisma } from "../prisma";
import {
  GatekeeperInput, ClassifierInput, ExtractorInput, GlossaryInput,
  TranslatorInput, RendererInput, InspectorInput, AgentResult, TranslatedBlock, TextBlock
} from "../../types/agents";
import { GatekeeperAgent } from "./01_gatekeeper";
import { ClassifierAgent } from "./02_classifier";
import { ExtractionAgent } from "./03_extractor";
import { GlossaryAgent } from "./04_glossary";
import { TranslationAgent } from "./05_translator";
import { ReconstructionAgent } from "./06_renderer";
import { QAAgent } from "./07_inspector";
import { verifyTranslationArtifact } from "../translation/verifier";
import { getTranslationJob, updateTranslationJob } from "../translation/store";
import { updatePersistentJob } from "../translation/persistent-store";
import crypto from "crypto";

export class Orchestrator {
  private gatekeeper = new GatekeeperAgent();
  private classifier = new ClassifierAgent();
  private extractor = new ExtractionAgent();
  private glossary = new GlossaryAgent();
  private translator = new TranslationAgent();
  private renderer = new ReconstructionAgent();
  private inspector = new QAAgent();

  private async updateJobStatus(
    jobId: string,
    status: "extracting" | "translating" | "rendering" | "verifying" | "completed" | "ready" | "failed",
    progress: number,
    currentStep: string,
    error?: string
  ): Promise<void> {
    try {
      await prisma.translationJob.update({
        where: { id: jobId },
        data: {
          status,
          progress,
          currentStep,
          errorMessage: error || null,
          updatedAt: new Date(),
          ...(status === "completed" || status === "ready" ? { completedAt: new Date() } : {}),
        },
      });
    } catch (e) {
      // Database update fallback for non-persistent / offline testing
    }

    // Sync in-memory store for instant status polling and zero-latency preview
    try {
      const memoryJob = getTranslationJob(jobId);
      if (memoryJob) {
        memoryJob.status = (status === "completed" ? "ready" : status) as any;
        memoryJob.progress = progress;
        memoryJob.currentStep = currentStep;
        if (error) memoryJob.error = error;
        updateTranslationJob(memoryJob);
      }
    } catch {}

    // Sync persistent document store
    try {
      await updatePersistentJob(jobId, {
        status: status as any,
        progress,
        currentStep,
        errorMessage: error,
      });
    } catch {}
  }

  public async processDocument(
    jobId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    sourceLang: string,
    targetLang: string
  ): Promise<Buffer> {
    const docHash = crypto.createHash("sha256").update(fileBuffer).digest("hex").slice(0, 12);
    console.log(`[Job ${jobId}] [Doc ${fileName}#${docHash}] [${sourceLang} -> ${targetLang}] START: Processing initiated in background worker.`);

    try {
      // 1. Stage: EXTRACTING - Gatekeeper
      await this.updateJobStatus(jobId, "extracting", 10, "Gatekeeper Scanning: Validating magic bytes and checking for zip-bombs/malware...");
      const gatekeeperRes = await this.gatekeeper.execute({ fileBuffer, fileName, mimeType });
      if (!gatekeeperRes.success || !gatekeeperRes.data) {
        throw new Error(`Gatekeeper failed: ${gatekeeperRes.error}`);
      }
      const sanitizedBuffer = gatekeeperRes.data.sanitizedBuffer;
      console.log(`[Job ${jobId}] [Stage: Gatekeeper] Passed (${sanitizedBuffer.length} bytes).`);

      // 2. Stage: EXTRACTING - Classifier
      await this.updateJobStatus(jobId, "extracting", 20, "Classifier Routing: Analyzing vector streams and determining optimal AI engine...");
      const classifierRes = await this.classifier.execute({ sanitizedBuffer });
      if (!classifierRes.success || !classifierRes.data) {
        throw new Error(`Classifier failed: ${classifierRes.error}`);
      }
      const engine = classifierRes.data.recommendedEngine;
      console.log(`[Job ${jobId}] [Stage: Classifier] Engine selected: ${engine}.`);

      // 3. Stage: EXTRACTING - Extractor
      await this.updateJobStatus(jobId, "extracting", 30, `Extraction: Generating precise geometric bounding boxes via ${engine}...`);
      const extractorRes = await this.extractor.execute({ sanitizedBuffer, routingStrategy: engine });
      if (!extractorRes.success || !extractorRes.data) {
        throw new Error(`Extractor failed: ${extractorRes.error}`);
      }
      const blocks = extractorRes.data.blocks;
      console.log(`[Job ${jobId}] [Stage: Extractor] Extracted ${blocks.length} spatial text blocks.`);

      // 4. Stage: EXTRACTING - Glossary
      await this.updateJobStatus(jobId, "extracting", 40, "Glossary: Locking dates, PII, and brand identifiers...");
      const glossaryRes = await this.glossary.execute({ blocks, sourceLang, targetLang });
      if (!glossaryRes.success || !glossaryRes.data) {
        throw new Error(`Glossary failed: ${glossaryRes.error}`);
      }
      const protectedTokens = glossaryRes.data.protectedTokens;
      console.log(`[Job ${jobId}] [Stage: Glossary] Locked ${Object.keys(protectedTokens).length} protected entity tokens.`);

      // 5. Stage: TRANSLATING - Chunked / Page-by-Page Processing to prevent OOM & token truncation
      await this.updateJobStatus(jobId, "translating", 50, "Translation: Chunking blocks page-by-page to prevent OOM...");

      // Partition spatial text blocks by page number
      const pageMap = new Map<number, TextBlock[]>();
      for (const block of blocks) {
        const p = block.pageNumber || 1;
        if (!pageMap.has(p)) pageMap.set(p, []);
        pageMap.get(p)!.push(block);
      }
      const sortedPages = Array.from(pageMap.keys()).sort((a, b) => a - b);
      const totalPages = sortedPages.length || 1;

      const maxRetries = 3;
      const translatedBlocks: TranslatedBlock[] = [];

      for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        const pageNum = sortedPages[pageIdx];
        const pageBlocks = pageMap.get(pageNum) || [];
        if (pageBlocks.length === 0) continue;

        const chunkProgress = Math.min(68, Math.round(50 + (pageIdx / totalPages) * 18));
        await this.updateJobStatus(
          jobId,
          "translating",
          chunkProgress,
          `Translating page ${pageNum} of ${totalPages} (${pageBlocks.length} text blocks)...`
        );

        let pageTranslated: TranslatedBlock[] = [];
        let warningPrompt: string | undefined = undefined;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`[Job ${jobId}] [Stage: Translator] Page ${pageNum} Attempt ${attempt}/${maxRetries} initiated.`);
            const translatorRes = await this.translator.execute({
              blocks: pageBlocks,
              protectedTokens,
              sourceLang,
              targetLang,
              engine,
              warningPrompt,
            });

            if (!translatorRes.success || !translatorRes.data) {
              throw new Error(`Translator failed on page ${pageNum}: ${translatorRes.error}`);
            }

            pageTranslated = translatorRes.data.translatedBlocks;

            // Inspector Assertion Engine: array parity, laziness regex, and numeric integrity
            this.inspector.assertParityAndIntegrity(pageBlocks, pageTranslated);

            console.log(`[Job ${jobId}] [Stage: Inspector] Page ${pageNum} parity, anti-laziness, and numeric integrity verified on attempt ${attempt}.`);
            break;
          } catch (err: any) {
            console.warn(`[Job ${jobId}] [QA Inspector] Page ${pageNum} Attempt ${attempt}/${maxRetries} rejected: ${err.message}`);

            if (attempt === maxRetries) {
              throw new Error(`Translation QA rejected page ${pageNum} after ${maxRetries} attempts: ${err.message}`);
            }

            warningPrompt = `CRITICAL REJECTION FROM QA INSPECTOR (Page ${pageNum}, Attempt ${attempt}/${maxRetries}): ${err.message}. You MUST fix this error. Ensure exact block parity (${pageBlocks.length} blocks), NEVER use "[...]" or "same as above" or "continued", and preserve EVERY single digit from the source.`;
            await this.updateJobStatus(
              jobId,
              "translating",
              chunkProgress + attempt,
              `Translation retry ${attempt + 1}/${maxRetries} for page ${pageNum}: Resolving QA inspection warnings...`
            );
          }
        }

        translatedBlocks.push(...pageTranslated);
      }

      // 6. Stage: RENDERING - Typesetting, Smart Redaction & Font Injection
      await this.updateJobStatus(jobId, "rendering", 75, "Rendering: Typesetting and injecting translated typography...");
      const rendererRes = await this.renderer.execute({ originalBuffer: sanitizedBuffer, translatedBlocks, targetLang });
      if (!rendererRes.success || !rendererRes.data) {
        throw new Error(`Renderer failed: ${rendererRes.error}`);
      }
      const renderedBuffer = rendererRes.data.renderedBuffer;
      console.log(`[Job ${jobId}] [Stage: Renderer] Reconstructed document (${renderedBuffer.length} bytes).`);

      // 7. Stage: VERIFYING - Visual Drift QA & 5-Point Quality Gate
      await this.updateJobStatus(jobId, "verifying", 88, "QA Inspector: Inspecting for visual drift, textual overflow, and geometric fidelity...");
      const inspectorRes = await this.inspector.execute({
        originalBuffer: sanitizedBuffer,
        renderedBuffer,
        translatedBlocks,
        sourceBlocks: blocks,
      });
      if (!inspectorRes.success || !inspectorRes.data) {
        throw new Error(`QA Inspector failed: ${inspectorRes.error}`);
      }

      if (!inspectorRes.data.passed) {
        console.warn(`[Job ${jobId}] QA Warnings:`, inspectorRes.data.warnings);
      }

      await this.updateJobStatus(jobId, "verifying", 95, "Verifying: Running automated certified legal verification pass...");
      const verification = await verifyTranslationArtifact({
        sourceBuffer: sanitizedBuffer,
        renderedBuffer,
        sourceBlocks: blocks.map((b) => ({
          id: b.id,
          text: b.originalText,
          x: b.box2d[1],
          y: b.box2d[0],
          width: b.box2d[3] - b.box2d[1],
          height: b.box2d[2] - b.box2d[0],
          page: b.pageNumber,
        })),
        translatedBlocks: translatedBlocks.map((b) => ({
          id: b.id,
          text: b.translatedText,
          x: b.box2d[1],
          y: b.box2d[0],
          width: b.box2d[3] - b.box2d[1],
          height: b.box2d[2] - b.box2d[0],
          page: b.pageNumber,
        })),
        sourceLang,
        targetLang,
      });

      if (!verification.passed) {
        console.error(`[Job ${jobId}] [Verification Failed] Code: ${verification.diagnosticCode} - ${verification.error}`);
        throw new Error(`Verification failed (${verification.diagnosticCode}): ${verification.error}`);
      }

      console.log(`[Job ${jobId}] [Verification Passed] All 5 certified quality gates verified.`);
      await this.updateJobStatus(jobId, "completed", 100, "Translation delivery ready.");
      return renderedBuffer;

    } catch (error: any) {
      console.error(`[Job ${jobId}] [FAILED] ${error.message}`);
      await this.updateJobStatus(jobId, "failed", 0, "Processing aborted due to unrecoverable error.", error.message);
      throw error;
    }
  }
}
