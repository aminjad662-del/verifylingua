import { prisma } from "../prisma";
import {
  GatekeeperInput, ClassifierInput, ExtractorInput, GlossaryInput,
  TranslatorInput, RendererInput, InspectorInput, AgentResult, TranslatedBlock
} from "../../types/agents";
import { GatekeeperAgent } from "./01_gatekeeper";
import { ClassifierAgent } from "./02_classifier";
import { ExtractionAgent } from "./03_extractor";
import { GlossaryAgent } from "./04_glossary";
import { TranslationAgent } from "./05_translator";
import { ReconstructionAgent } from "./06_renderer";
import { QAAgent } from "./07_inspector";
import { verifyTranslationArtifact } from "../translation/verifier";
import crypto from "crypto";

export class Orchestrator {
  private gatekeeper = new GatekeeperAgent();
  private classifier = new ClassifierAgent();
  private extractor = new ExtractionAgent();
  private glossary = new GlossaryAgent();
  private translator = new TranslationAgent();
  private renderer = new ReconstructionAgent();
  private inspector = new QAAgent();

  private async updateJobStatus(jobId: string, status: string, progress: number, currentStep: string, error?: string): Promise<void> {
    try {
      await prisma.translationJob.update({
        where: { id: jobId },
        data: {
          status,
          progress,
          currentStep,
          errorMessage: error || null,
          updatedAt: new Date()
        }
      });
    } catch (e) {
      // Fallback logging if DB is unreachable in test / offline environments
    }
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
    console.log(`[Job ${jobId}] [Doc ${fileName}#${docHash}] [${sourceLang} -> ${targetLang}] START: Processing initiated.`);

    try {
      await this.updateJobStatus(jobId, "extracting", 10, "Gatekeeper Scanning: Validating magic bytes and checking for zip-bombs/malware...");

      // 1. Gatekeeper
      const gatekeeperRes = await this.gatekeeper.execute({ fileBuffer, fileName, mimeType });
      if (!gatekeeperRes.success || !gatekeeperRes.data) {
        throw new Error(`Gatekeeper failed: ${gatekeeperRes.error}`);
      }
      const sanitizedBuffer = gatekeeperRes.data.sanitizedBuffer;
      console.log(`[Job ${jobId}] [Stage: Gatekeeper] Passed (${sanitizedBuffer.length} bytes).`);

      await this.updateJobStatus(jobId, "extracting", 20, "Classifier Routing: Analyzing vector streams and determining optimal AI engine...");

      // 2. Classifier
      const classifierRes = await this.classifier.execute({ sanitizedBuffer });
      if (!classifierRes.success || !classifierRes.data) {
        throw new Error(`Classifier failed: ${classifierRes.error}`);
      }
      const engine = classifierRes.data.recommendedEngine;
      console.log(`[Job ${jobId}] [Stage: Classifier] Engine selected: ${engine}.`);

      await this.updateJobStatus(jobId, "extracting", 30, `Extraction: Generating precise geometric bounding boxes via ${engine}...`);

      // 3. Extractor
      const extractorRes = await this.extractor.execute({ sanitizedBuffer, routingStrategy: engine });
      if (!extractorRes.success || !extractorRes.data) {
        throw new Error(`Extractor failed: ${extractorRes.error}`);
      }
      const blocks = extractorRes.data.blocks;
      console.log(`[Job ${jobId}] [Stage: Extractor] Extracted ${blocks.length} spatial text blocks.`);

      await this.updateJobStatus(jobId, "extracting", 40, "Glossary: Locking dates, PII, and brand identifiers...");

      // 4. Glossary
      const glossaryRes = await this.glossary.execute({ blocks, sourceLang, targetLang });
      if (!glossaryRes.success || !glossaryRes.data) {
        throw new Error(`Glossary failed: ${glossaryRes.error}`);
      }
      const protectedTokens = glossaryRes.data.protectedTokens;
      console.log(`[Job ${jobId}] [Stage: Glossary] Locked ${Object.keys(protectedTokens).length} protected entity tokens.`);

      await this.updateJobStatus(jobId, "translating", 50, "Translation: The Linguist is translating text safely within bounded regions...");

      // 5. Translator & 7. Inspector Assertion Loop with Auto-Retry (maxRetries = 3)
      const maxRetries = 3;
      let translatedBlocks: TranslatedBlock[] = [];
      let warningPrompt: string | undefined = undefined;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[Job ${jobId}] [Stage: Translator] Attempt ${attempt}/${maxRetries} initiated.`);
          const translatorRes = await this.translator.execute({
            blocks,
            protectedTokens,
            sourceLang,
            targetLang,
            engine,
            warningPrompt,
          });

          if (!translatorRes.success || !translatorRes.data) {
            throw new Error(`Translator failed: ${translatorRes.error}`);
          }

          translatedBlocks = translatorRes.data.translatedBlocks;

          // Inspector Assertion Engine: array parity, laziness regex, and numeric integrity
          this.inspector.assertParityAndIntegrity(blocks, translatedBlocks);

          console.log(`[Job ${jobId}] [Stage: Inspector] Parity, anti-laziness, and numeric integrity verified on attempt ${attempt}.`);
          break;
        } catch (err: any) {
          console.warn(`[Job ${jobId}] [QA Inspector] Attempt ${attempt}/${maxRetries} rejected: ${err.message}`);

          if (attempt === maxRetries) {
            throw new Error(`Translation QA rejected after ${maxRetries} attempts: ${err.message}`);
          }

          warningPrompt = `CRITICAL REJECTION FROM QA INSPECTOR (Attempt ${attempt}/${maxRetries}): ${err.message}. You MUST fix this error. Ensure exact block parity (${blocks.length} blocks), NEVER use "[...]" or "same as above" or "continued", and preserve EVERY single digit from the source.`;
          await this.updateJobStatus(
            jobId,
            "translating",
            50 + attempt * 5,
            `Translation retry ${attempt + 1}/${maxRetries}: Resolving QA inspection warnings...`
          );
        }
      }

      await this.updateJobStatus(jobId, "reconstructing", 70, "Rendering: Typesetting and injecting translated typography...");

      // 6. Renderer
      const rendererRes = await this.renderer.execute({ originalBuffer: sanitizedBuffer, translatedBlocks, targetLang });
      if (!rendererRes.success || !rendererRes.data) {
        throw new Error(`Renderer failed: ${rendererRes.error}`);
      }
      const renderedBuffer = rendererRes.data.renderedBuffer;
      console.log(`[Job ${jobId}] [Stage: Renderer] Reconstructed document (${renderedBuffer.length} bytes).`);

      await this.updateJobStatus(jobId, "qa", 85, "QA: Inspecting for visual drift, textual overflow, and geometric fidelity...");

      // 7. Inspector (Physical visual drift and bounding geometry pass)
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

      // 8. Mandatory Automated 5-Point Verification Stage
      await this.updateJobStatus(jobId, "qa", 95, "Verifying: Running automated certified legal verification pass...");
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
      await this.updateJobStatus(jobId, "ready", 100, "Translation delivery ready.");
      return renderedBuffer;

    } catch (error: any) {
      console.error(`[Job ${jobId}] [FAILED] ${error.message}`);
      await this.updateJobStatus(jobId, "failed", 0, "Processing aborted due to unrecoverable error.", error.message);
      throw error;
    }
  }
}
