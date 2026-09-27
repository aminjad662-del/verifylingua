import { prisma } from "../prisma";
import {
  GatekeeperInput, ClassifierInput, ExtractorInput, GlossaryInput,
  TranslatorInput, RendererInput, InspectorInput, AgentResult
} from "../../types/agents";
import { GatekeeperAgent } from "./01_gatekeeper";
import { ClassifierAgent } from "./02_classifier";
import { ExtractionAgent } from "./03_extractor";
import { GlossaryAgent } from "./04_glossary";
import { TranslationAgent } from "./05_translator";
import { ReconstructionAgent } from "./06_renderer";
import { QAAgent } from "./07_inspector";

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
      console.error(`Failed to update DB for Job ${jobId}:`, e);
      // Fallback logging if DB is unreachable
      console.log(`[Job ${jobId}] Status: ${status} | Progress: ${progress}% | Step: ${currentStep} ${error ? `| Error: ${error}` : ""}`);
    }
  }

    public async processDocument(jobId: string, fileBuffer: Buffer, fileName: string, mimeType: string, sourceLang: string, targetLang: string): Promise<Buffer> {
      try {
        await this.updateJobStatus(jobId, "extracting", 10, "Gatekeeper Scanning: Validating magic bytes and checking for zip-bombs/malware...");
  
        // 1. Gatekeeper
        const gatekeeperRes = await this.gatekeeper.execute({ fileBuffer, fileName, mimeType });
        if (!gatekeeperRes.success || !gatekeeperRes.data) {
          throw new Error(`Gatekeeper failed: ${gatekeeperRes.error}`);
        }
        const sanitizedBuffer = gatekeeperRes.data.sanitizedBuffer;
  
        await this.updateJobStatus(jobId, "extracting", 20, "Classifier Routing: Analyzing vector streams and determining optimal AI engine...");
  
        // 2. Classifier
        const classifierRes = await this.classifier.execute({ sanitizedBuffer });
        if (!classifierRes.success || !classifierRes.data) {
          throw new Error(`Classifier failed: ${classifierRes.error}`);
        }
        const engine = classifierRes.data.recommendedEngine;
  
        await this.updateJobStatus(jobId, "extracting", 30, `Extraction: Generating precise geometric bounding boxes via ${engine}...`);
  
        // 3. Extractor
        const extractorRes = await this.extractor.execute({ sanitizedBuffer, routingStrategy: engine });
        if (!extractorRes.success || !extractorRes.data) {
          throw new Error(`Extractor failed: ${extractorRes.error}`);
        }
        const blocks = extractorRes.data.blocks;
  
        await this.updateJobStatus(jobId, "extracting", 40, "Glossary: Locking dates, PII, and brand identifiers...");
  
        // 4. Glossary
        const glossaryRes = await this.glossary.execute({ blocks, sourceLang, targetLang });
        if (!glossaryRes.success || !glossaryRes.data) {
          throw new Error(`Glossary failed: ${glossaryRes.error}`);
        }
        const protectedTokens = glossaryRes.data.protectedTokens;
  
        await this.updateJobStatus(jobId, "translating", 50, "Translation: The Linguist is translating text safely within bounded regions...");
  
        // 5. Translator
        const translatorRes = await this.translator.execute({ blocks, protectedTokens, sourceLang, targetLang, engine });
        if (!translatorRes.success || !translatorRes.data) {
          throw new Error(`Translator failed: ${translatorRes.error}`);
        }
        const translatedBlocks = translatorRes.data.translatedBlocks;
  
        await this.updateJobStatus(jobId, "reconstructing", 70, "Rendering: Typesetting and injecting translated typography...");
  
        // 6. Renderer
        const rendererRes = await this.renderer.execute({ originalBuffer: sanitizedBuffer, translatedBlocks, targetLang });
        if (!rendererRes.success || !rendererRes.data) {
          throw new Error(`Renderer failed: ${rendererRes.error}`);
        }
        const renderedBuffer = rendererRes.data.renderedBuffer;
  
        await this.updateJobStatus(jobId, "qa", 90, "QA: Inspecting for visual drift, textual overflow, and geometric fidelity...");
  
        // 7. Inspector
        const inspectorRes = await this.inspector.execute({ originalBuffer: sanitizedBuffer, renderedBuffer, translatedBlocks });
        if (!inspectorRes.success || !inspectorRes.data) {
          throw new Error(`QA Inspector failed: ${inspectorRes.error}`);
        }
  
        if (!inspectorRes.data.passed) {
          console.warn(`[Job ${jobId}] QA Warnings:`, inspectorRes.data.warnings);
        }
  
        await this.updateJobStatus(jobId, "ready", 100, "Translation delivery ready.");
        return renderedBuffer;

    } catch (error: any) {
      await this.updateJobStatus(jobId, "failed", 0, "Processing aborted due to unrecoverable error.", error.message);
      throw error;
    }
  }
}
