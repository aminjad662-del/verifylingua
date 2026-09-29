import { prisma } from "../prisma";
import { inngest } from "../inngest/client";
import { getObject, putObject } from "../storage";
import { Orchestrator } from "../agents/00_orchestrator";
import { processTranslationJob } from "../translation/pipeline";
import {
  createTranslationJob,
  getTranslationJob,
  updateTranslationJob,
} from "../translation/store";
import {
  settleCreditsOnSuccess,
  releaseCreditsOnFailure,
} from "../services/credit-service";
import { updatePersistentJob } from "../translation/persistent-store";

/**
 * Dispatches a translation job to the asynchronous background worker queue.
 * - Broadcasts event to Inngest client for distributed serverless workers.
 * - Triggers local detached async worker runner for zero-timeout execution.
 */
export async function dispatchBackgroundJob(jobId: string): Promise<void> {
  // 1. Dispatch event to Inngest background queue
  try {
    await inngest.send({
      name: "document.processing.requested",
      data: { jobId },
    });
  } catch (err: any) {
    // Inngest dispatch is non-blocking; fallback to local async worker runner
    if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
      console.warn(`[Queue] Inngest event dispatch warning for job ${jobId}:`, err?.message);
    }
  }

  // 2. Trigger asynchronous background worker execution completely detached from HTTP lifecycle
  setImmediate(async () => {
    try {
      await executeBackgroundTranslationJob(jobId);
    } catch (err: any) {
      console.error(`[Background Worker] Unhandled failure on job ${jobId}:`, err?.message);
    }
  });
}

/**
 * Core background worker execution routine.
 * Completely immune to HTTP timeouts (runs asynchronously in worker environment).
 */
export async function executeBackgroundTranslationJob(jobId: string): Promise<void> {
  // Fetch job metadata from Prisma (or fallback to in-memory store)
  let dbJob = null;
  try {
    dbJob = await prisma.translationJob.findUnique({ where: { id: jobId } });
  } catch {}

  const memJob = getTranslationJob(jobId);
  if (!dbJob && !memJob) {
    console.error(`[Background Worker] Job ${jobId} not found in database or memory store.`);
    return;
  }

  const userId = dbJob?.userId || memJob?.userId || null;
  const pageCount = dbJob?.pageCount || memJob?.pageCount || 1;
  const fileName = dbJob?.sourceFilename || memJob?.fileName || "document.pdf";
  const sourceFormat = (dbJob?.sourceFormat || memJob?.fileFormat || "pdf").toLowerCase();
  const sourceMime = dbJob?.sourceMimeType || "application/pdf";
  const sourceLang = dbJob?.sourceLanguage || memJob?.sourceLang || "es";
  const targetLang = dbJob?.targetLanguage || memJob?.targetLang || "en";
  const sourceKey = dbJob?.sourceKey || memJob?.sourceKey || `jobs/${userId || "anonymous"}/${jobId}/source.${sourceFormat}`;
  const outputKey = dbJob?.outputKey || memJob?.outputKey || `jobs/${userId || "anonymous"}/${jobId}/output.${sourceFormat}`;

  // Retrieve raw document buffer from Object Storage or in-memory buffer
  let fileBuffer: Buffer | null = memJob?.originalBuffer || null;
  if (!fileBuffer) {
    try {
      fileBuffer = await getObject(sourceKey);
    } catch (storageErr: any) {
      const errMsg = `Source document could not be retrieved from object storage (${sourceKey}): ${storageErr?.message}`;
      console.error(`[Background Worker] Job ${jobId} aborted:`, errMsg);
      if (userId) {
        try {
          await releaseCreditsOnFailure(userId, jobId, pageCount, errMsg);
        } catch {}
      }
      try {
        await prisma.translationJob.update({
          where: { id: jobId },
          data: { status: "failed", errorMessage: errMsg, completedAt: new Date() },
        });
      } catch {}
      if (memJob) {
        memJob.status = "failed";
        memJob.error = errMsg;
        updateTranslationJob(memJob);
      }
      return;
    }
  }

  // Handle DOCX translation via DOCX pipeline
  if (sourceFormat === "docx") {
    try {
      const activeJob =
        memJob ||
        createTranslationJob({
          fileName,
          fileFormat: "docx",
          fileSize: fileBuffer.length,
          sourceLang,
          targetLang,
          originalBuffer: fileBuffer,
          userId,
          pageCount,
          options: { serviceTier: "automated", format: "docx" },
        });

      const updated = await processTranslationJob(activeJob, {
        sourceLang,
        targetLang,
        serviceTier: (activeJob.serviceTier as any) || "automated",
        register: "general",
      });

      updateTranslationJob(updated);

      if (updated.status === "failed") {
        throw new Error(updated.error || "DOCX translation failed");
      }

      // Persist translated docx output
      if (updated.translatedBuffer) {
        try {
          await putObject(
            outputKey,
            updated.translatedBuffer,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          );
        } catch {}
      }

      if (userId) {
        await settleCreditsOnSuccess(userId, jobId, pageCount);
      }

      try {
        await prisma.translationJob.update({
          where: { id: jobId },
          data: {
            status: "completed",
            outputKey,
            progress: 100,
            currentStep: "Document translated and formatted successfully.",
            completedAt: new Date(),
            layoutPreserved: true,
          },
        });
      } catch {}

      try {
        await updatePersistentJob(jobId, {
          status: "completed",
          progress: 100,
          currentStep: "Document translated and formatted successfully.",
          outputKey,
          completedAt: new Date().toISOString(),
        });
      } catch {}

      return;
    } catch (docxErr: any) {
      console.error(`[Background Worker] DOCX job ${jobId} failed:`, docxErr.message);
      if (userId) {
        try {
          await releaseCreditsOnFailure(userId, jobId, pageCount, docxErr.message);
        } catch {}
      }
      try {
        await prisma.translationJob.update({
          where: { id: jobId },
          data: {
            status: "failed",
            errorMessage: docxErr.message,
            completedAt: new Date(),
          },
        });
      } catch {}
      if (memJob) {
        memJob.status = "failed";
        memJob.error = docxErr.message;
        updateTranslationJob(memJob);
      }
      return;
    }
  }

  // Handle PDF & Image translation via Orchestrator (8-Agent State Machine)
  try {
    const orchestrator = new Orchestrator();
    const renderedBuffer = await orchestrator.processDocument(
      jobId,
      fileBuffer,
      fileName,
      sourceMime,
      sourceLang,
      targetLang
    );

    // Persist final rendered artifact to Object Storage
    const outputMime = "application/pdf";
    try {
      await putObject(outputKey, renderedBuffer, outputMime);
    } catch (e: any) {
      console.error(`[Background Worker] Failed to upload output artifact to ${outputKey}:`, e.message);
    }

    // Settle credits atomically
    if (userId) {
      try {
        await settleCreditsOnSuccess(userId, jobId, pageCount);
      } catch (settleErr: any) {
        console.error(`[Background Worker] Credit settlement warning for job ${jobId}:`, settleErr.message);
      }
    }

    // Update database to completed
    try {
      await prisma.translationJob.update({
        where: { id: jobId },
        data: {
          status: "completed",
          outputKey,
          progress: 100,
          currentStep: "Machine translation and layout reconstruction complete.",
          completedAt: new Date(),
          layoutPreserved: true,
        },
      });
    } catch {}

    // Update in-memory job store for zero-latency local polling
    if (memJob) {
      memJob.status = "ready";
      memJob.progress = 100;
      memJob.currentStep = "Machine translation and layout reconstruction complete.";
      memJob.outputKey = outputKey;
      memJob.translatedBuffer = renderedBuffer;
      updateTranslationJob(memJob);
    }

    try {
      await updatePersistentJob(jobId, {
        status: "completed",
        progress: 100,
        currentStep: "Machine translation and layout reconstruction complete.",
        outputKey,
        completedAt: new Date().toISOString(),
      });
    } catch {}

    console.log(`[Background Worker] [Job ${jobId}] SUCCESS: Completed and output stored at ${outputKey}.`);
  } catch (err: any) {
    console.error(`[Background Worker] [Job ${jobId}] FAILED: ${err.message}`);

    // Auto-refund reserved credits upon any failure
    if (userId) {
      try {
        await releaseCreditsOnFailure(userId, jobId, pageCount, err.message);
      } catch (refundErr: any) {
        console.error(`[Background Worker] Credit refund warning for job ${jobId}:`, refundErr.message);
      }
    }

    try {
      await prisma.translationJob.update({
        where: { id: jobId },
        data: {
          status: "failed",
          errorMessage: err.message,
          completedAt: new Date(),
        },
      });
    } catch {}

    if (memJob) {
      memJob.status = "failed";
      memJob.error = err.message;
      updateTranslationJob(memJob);
    }

    try {
      await updatePersistentJob(jobId, {
        status: "failed",
        currentStep: `Pipeline failure: ${err.message}`,
        errorMessage: err.message,
        progress: 0,
      });
    } catch {}
  }
}
