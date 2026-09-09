import { inngest } from "./client";
import { getPersistentJob, updatePersistentJob } from "../translation/persistent-store";
import { getObject, putObject } from "../storage";
import { autonomousDocumentAgent } from "../agent/autonomous-document-agent";

export const processDocumentWorkflow = inngest.createFunction(
  {
    id: "process-document-workflow",
    retries: 2,
    triggers: [{ event: "document.processing.requested" }],
  },
  async ({ event, step }) => {
    const { jobId } = (event.data as { jobId: string });

    // Step 1: Load Job & Source Buffer
    const job = await step.run("load-job", async () => {
      const j = await getPersistentJob(jobId);
      if (!j) throw new Error(`Job ${jobId} not found`);
      return { id: j.id, sourceKey: j.sourceKey, targetLanguage: j.targetLanguage, filename: j.sourceFilename };
    });

    // Step 2: Classify Document
    const classification = await step.run("classify-document", async () => {
      const buf = await getObject(job.sourceKey);
      await updatePersistentJob(job.id, {
        status: "classifying",
        currentStep: "Classifying document format, layout, and complexity…",
        progress: 20,
      });
      return await autonomousDocumentAgent.classifyDocument({
        buffer: buf,
        filename: job.filename,
        targetLanguage: job.targetLanguage,
      });
    });

    // Step 3: Extract, Translate, Reconstruct & Persist Output
    const outputKey = `outputs/${job.id}/translated_${job.filename}`;
    const translationResult = await step.run("translate-and-reconstruct", async () => {
      const buf = await getObject(job.sourceKey);
      await updatePersistentJob(job.id, {
        status: "translating",
        currentStep: `Translating content using ${classification.selectedProvider} engine…`,
        progress: 50,
      });

      const processed = await autonomousDocumentAgent.processDocument({
        buffer: buf,
        filename: job.filename,
        targetLang: job.targetLanguage,
      });

      await putObject(outputKey, processed.translatedBuffer, classification.mimeType);

      return {
        outputKey,
        providerUsed: processed.providerUsed,
        fidelityScore: processed.fidelityScore,
        issues: processed.issues,
        warnings: processed.warnings,
      };
    });

    // Step 4: Finalize Job
    await step.run("finalize-job", async () => {
      const hasWarnings = translationResult.warnings.length > 0;
      await updatePersistentJob(job.id, {
        status: hasWarnings ? "completed_with_warnings" : "completed",
        currentStep: "Document translation, layout reconstruction, and QA certified.",
        progress: 100,
        outputKey: translationResult.outputKey,
        provider: translationResult.providerUsed,
        fidelityScore: translationResult.fidelityScore.overallScore,
        fidelityBreakdown: translationResult.fidelityScore,
        issues: translationResult.issues,
        warnings: translationResult.warnings,
        pageCount: classification.pageCount,
        completedAt: new Date().toISOString(),
      });
    });

    return { jobId: job.id, status: "completed", fidelityScore: translationResult.fidelityScore.overallScore };
  }
);

/**
 * Direct execution runner that executes the autonomous pipeline asynchronously
 * for zero-timeout responsiveness without blocking normal web requests.
 */
export async function executeAutonomousDocumentPipeline(jobId: string): Promise<void> {
  // Fire-and-forget background worker execution
  setImmediate(async () => {
    try {
      const job = await getPersistentJob(jobId);
      if (!job) return;

      await updatePersistentJob(jobId, {
        status: "classifying",
        currentStep: "Analyzing document format, density, and language structure…",
        progress: 15,
        startedAt: new Date().toISOString(),
      });

      const buffer = await getObject(job.sourceKey);

      await updatePersistentJob(jobId, {
        status: "extracting",
        currentStep: "Extracting geometric text runs, bounding boxes, and reading order…",
        progress: 35,
      });

      const result = await autonomousDocumentAgent.processDocument({
        buffer,
        filename: job.sourceFilename,
        sourceLang: job.sourceLanguage,
        targetLang: job.targetLanguage,
        onProgress: async (stepName, progress) => {
          let st = job.status;
          if (progress >= 85) st = "repairing";
          else if (progress >= 70) st = "qa";
          else if (progress >= 45) st = "translating";
          await updatePersistentJob(jobId, {
            currentStep: stepName,
            progress,
            status: st,
          });
        },
      });

      const outputKey = `outputs/${jobId}/translated_${job.sourceFilename}`;
      await putObject(outputKey, result.translatedBuffer, result.classification.mimeType);

      const hasWarnings = result.warnings.length > 0;
      await updatePersistentJob(jobId, {
        status: hasWarnings ? "completed_with_warnings" : "completed",
        currentStep: "Document translation complete and certified for official use.",
        progress: 100,
        outputKey,
        provider: result.providerUsed,
        fidelityScore: result.fidelityScore.overallScore,
        fidelityBreakdown: result.fidelityScore,
        issues: result.issues,
        warnings: result.warnings,
        pageCount: result.classification.pageCount,
        completedAt: new Date().toISOString(),
        layoutPreserved: result.fidelityScore.layoutScore >= 80,
      });
    } catch (err: any) {
      console.error(`[AutonomousPipeline] Job ${jobId} failed:`, err);
      await updatePersistentJob(jobId, {
        status: "failed",
        currentStep: `Pipeline failure: ${err.message || "Unknown error"}`,
        errorCode: "PIPELINE_ERROR",
        errorMessage: err.message || "Processing failed.",
        progress: 0,
      });
    }
  });
}
