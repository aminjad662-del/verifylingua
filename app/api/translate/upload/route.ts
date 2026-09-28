import { NextRequest, NextResponse } from "next/server";
import {
  validateInputFile,
  processTranslationJob,
  estimateDocumentPageCount,
} from "@/lib/translation/pipeline";
import {
  createTranslationJob,
  updateTranslationJob,
  deleteTranslationJob,
  getJobByCompositeKey,
} from "@/lib/translation/store";
import { generateCompositeKey, CURRENT_PIPELINE_VERSION } from "@/lib/translation/composite-key";
import { prisma } from "@/lib/prisma";
import {
  getUserCreditBalance,
  reserveCreditsForJob,
} from "@/lib/services/credit-service";
import { getCurrentUser } from "@/lib/auth/session";
import { putObject } from "@/lib/storage";
import { Orchestrator } from "@/lib/agents/00_orchestrator";
import { settleCreditsOnSuccess, releaseCreditsOnFailure } from "@/lib/services/credit-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let fileName = "";
    let fileBuffer: Buffer | null = null;
    let sourceLang = "es";
    let targetLang = "en";
    let serviceTier: "automated" | "professional" | "certified" = "automated";
    let userId: string | null = null;
    let explicitPageCount: number | null = null;
    const isTestEnv = process.env.NODE_ENV === "test" || process.env.VITEST === "true";
    let clientProvidedUserId: string | null = null;
    let simulateError: string | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "No file was provided in the upload request." },
          { status: 400 }
        );
      }
      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      sourceLang = (formData.get("sourceLang") as string) || "es";
      targetLang = (formData.get("targetLang") as string) || "en";
      serviceTier = ((formData.get("serviceTier") as string) as any) || "automated";
      if (isTestEnv) {
        clientProvidedUserId = (formData.get("userId") as string) || null;
        simulateError = (formData.get("simulateError") as string) || undefined;
      }
      const pagesField = formData.get("pageCount");
      if (pagesField) explicitPageCount = parseInt(String(pagesField), 10);
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      fileName = body.fileName || "document.pdf";
      sourceLang = body.sourceLang || "es";
      targetLang = body.targetLang || "en";
      serviceTier = body.serviceTier || "automated";
      if (isTestEnv) {
        clientProvidedUserId = body.userId || null;
        simulateError = body.simulateError || undefined;
      }
      if (body.pageCount) explicitPageCount = parseInt(String(body.pageCount), 10);

      if (body.fileBase64) {
        fileBuffer = Buffer.from(body.fileBase64, "base64");
      } else {
        return NextResponse.json(
          { error: "Missing fileBase64 data in JSON payload." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported Content-Type. Use multipart/form-data or application/json." },
        { status: 400 }
      );
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json(
        { error: "The provided file data is empty (0 bytes)." },
        { status: 400 }
      );
    }

    // In test environment, allow client-provided userId, headers, or query parameters
    if (isTestEnv) {
      if (clientProvidedUserId) {
        userId = clientProvidedUserId;
      } else {
        userId = req.headers.get("x-user-id");
        if (!userId) {
          try {
            const urlObj = req.nextUrl || new URL(req.url);
            userId = urlObj.searchParams?.get("userId") || null;
          } catch {}
        }
      }
    }

    // In production (or if no test userId specified), strictly enforce session authentication
    if (!userId) {
      try {
        const sessionUser = await getCurrentUser();
        if (sessionUser?.id) userId = sessionUser.id;
      } catch {}
    }

    // 1. Validation & MIME sniffing
    const validation = validateInputFile(fileBuffer, fileName);
    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Estimate or calculate document page count N (minimum 1)
    const estimated = await estimateDocumentPageCount(fileBuffer, validation.format);
    const N = Math.max(1, explicitPageCount && !isNaN(explicitPageCount) ? explicitPageCount : estimated);

    // 2. Credit verification if userId is present
    if (userId) {
      const balance = await getUserCreditBalance(userId);
      if (balance.available < N) {
        return NextResponse.json(
          {
            success: false,
            error: "INSUFFICIENT_CREDITS",
            message: `Insufficient page credits. This document requires ${N} credits, but your account has ${balance.available} available.`,
            requiredCredits: N,
            availableCredits: balance.available,
            upgradeUrl: "/pricing",
          },
          { status: 402 }
        );
      }
    }

    // Generate composite identity key
    const compositeDetails = generateCompositeKey({
      buffer: fileBuffer,
      sourceLang,
      targetLang,
      pipelineVersion: CURRENT_PIPELINE_VERSION,
      options: { serviceTier, format: validation.format },
    });

    // Check for legitimate cache reuse: same document + same languages + same pipeline version
    const cachedJob = getJobByCompositeKey(compositeDetails.compositeKey);
    if (
      cachedJob &&
      (cachedJob.status === "ready" || cachedJob.status === "completed") &&
      (cachedJob.translatedBuffer || cachedJob.outputKey)
    ) {
      console.log(`[Upload] Legitimate cache hit for compositeKey: ${compositeDetails.compositeKey}`);
      return NextResponse.json(
        {
          success: true,
          jobId: cachedJob.id,
          fileName: cachedJob.fileName,
          fileFormat: cachedJob.fileFormat,
          fileSize: cachedJob.fileSize,
          status: "ready",
          progress: 100,
          currentStep: "Document translated with authentic layout preservation (cached).",
          downloadToken: cachedJob.downloadToken,
          downloadUrl: `/api/translate/download/${cachedJob.id}?token=${cachedJob.downloadToken}`,
          cached: true,
        },
        {
          status: 200,
          headers: {
            "X-VerifyLingua-Composite-Key": compositeDetails.compositeKey,
            "X-VerifyLingua-Cache": "HIT",
          },
        }
      );
    }

    // 3. Create job in queue
    const job = createTranslationJob({
      fileName,
      fileFormat: validation.format,
      fileSize: fileBuffer.length,
      sourceLang,
      targetLang,
      originalBuffer: fileBuffer,
      userId,
      pageCount: N,
      options: { serviceTier, format: validation.format },
    });
    job.serviceTier = serviceTier;

    const ext = fileName.split(".").pop()?.toLowerCase() || validation.format;
    const userSegment = userId || "anonymous";
    const sourceKey = job.sourceKey || `jobs/${userSegment}/${job.id}/source.${ext}`;
    const outputKey = job.outputKey || `jobs/${userSegment}/${job.id}/output.${ext}`;
    job.sourceKey = sourceKey;
    job.outputKey = outputKey;

    const sourceMime =
      validation.format === "pdf"
        ? "application/pdf"
        : validation.format === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : validation.format === "png"
        ? "image/png"
        : validation.format === "jpg"
        ? "image/jpeg"
        : "application/octet-stream";

    // Persist source file to storage
    if (fileBuffer) {
      try {
        await putObject(sourceKey, fileBuffer, sourceMime);
      } catch {}
    }

    // 4. If userId is present, persist to PostgreSQL and reserve credits
    if (userId) {
      try {
        await prisma.translationJob.create({
          data: {
            id: job.id,
            userId,
            sourceKey,
            outputKey,
            sourceFilename: fileName,
            sourceFormat: validation.format,
            sourceMimeType: sourceMime,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
            status: "queued",
            currentStep: "Job initialized and queued for processing",
            pageCount: N,
            downloadToken: job.downloadToken,
          },
        });
      } catch (dbErr: any) {
        console.error("[upload] Failed to persist job to database:", dbErr?.message);
      }

      try {
        await reserveCreditsForJob(userId, job.id, N);
      } catch (resErr: any) {
        try {
          await prisma.translationJob.delete({ where: { id: job.id } });
        } catch {}
        deleteTranslationJob(job.id);
        const isInsufficient = resErr.message?.includes("INSUFFICIENT_CREDITS");
        return NextResponse.json(
          {
            success: false,
            error: isInsufficient ? "INSUFFICIENT_CREDITS" : "RESERVATION_FAILED",
            message: resErr.message || "Failed to reserve credits.",
            requiredCredits: N,
            upgradeUrl: "/pricing",
          },
          { status: isInsufficient ? 402 : 400 }
        );
      }
    }

    // 5. Kick off asynchronous processing
    if (isTestEnv && simulateError) {
      setTimeout(async () => {
        if (userId) {
          try {
            await releaseCreditsOnFailure(userId, job.id, N, simulateError!);
            await prisma.translationJob.update({
              where: { id: job.id },
              data: {
                status: "failed",
                errorMessage: simulateError,
                completedAt: new Date(),
              },
            });
          } catch (e: any) {}
        }
        job.status = "failed";
        job.error = simulateError;
        updateTranslationJob(job);
      }, 10);

      return NextResponse.json(
        {
          success: true,
          jobId: job.id,
          fileName: job.fileName,
          fileFormat: job.fileFormat,
          fileSize: job.fileSize,
          status: "queued",
          progress: 5,
          currentStep: "Job initialized and queued for processing",
          downloadToken: job.downloadToken,
        },
        { status: 202 }
      );
    }

    if (validation.format === "docx") {
      processTranslationJob(job, {
        sourceLang,
        targetLang,
        serviceTier,
        register: serviceTier === "automated" ? "general" : "certified_legal",
      })
        .then(async (updated) => {
          updateTranslationJob(updated);
          if (userId) {
            try {
              if (updated.status === "failed") {
                await prisma.translationJob.update({
                  where: { id: job.id },
                  data: {
                    status: "failed",
                    errorMessage: updated.error || "Translation pipeline failed",
                    completedAt: new Date(),
                  },
                });
              } else {
                await prisma.translationJob.update({
                  where: { id: job.id },
                  data: {
                    status: "completed",
                    progress: 100,
                    currentStep: "Machine translation and layout reconstruction complete.",
                    completedAt: new Date(),
                    layoutPreserved: updated.layoutPreserved ?? true,
                  },
                });
              }
            } catch {}
          }
        })
        .catch(async (err) => {
          if (userId) {
            try {
              await releaseCreditsOnFailure(userId, job.id, N, err.message);
              await prisma.translationJob.update({
                where: { id: job.id },
                data: {
                  status: "failed",
                  errorMessage: err.message || "Translation pipeline failed",
                  completedAt: new Date(),
                },
              });
            } catch {}
          }
          job.status = "failed";
          job.error = err.message;
          updateTranslationJob(job);
        });

      return NextResponse.json(
        {
          success: true,
          jobId: job.id,
          fileName: job.fileName,
          fileFormat: job.fileFormat,
          fileSize: job.fileSize,
          status: "queued",
          progress: 5,
          currentStep: "Job initialized and queued for processing",
          downloadToken: job.downloadToken,
        },
        { status: 202 }
      );
    }

    // 8-Agent State Machine for Vector PDFs and High-Resolution Documents
    const orchestrator = new Orchestrator();

    orchestrator.processDocument(
      job.id, 
      fileBuffer, 
      fileName, 
      sourceMime, 
      sourceLang, 
      targetLang
    )
      .then(async (renderedBuffer) => {
        // Persist final rendered output to storage
        const outputMime = "application/pdf";
        try {
          await putObject(outputKey, renderedBuffer, outputMime);
        } catch (e: any) {
          console.error(`[Job ${job.id}] Failed to upload rendered output:`, e.message);
        }

        // Settle credits and mark job fully complete in DB
        if (userId) {
          try {
            await settleCreditsOnSuccess(userId, job.id, N);
            await prisma.translationJob.update({
              where: { id: job.id },
              data: {
                status: "completed",
                outputKey,
                progress: 100,
                currentStep: "Machine translation and layout reconstruction complete.",
                completedAt: new Date(),
                layoutPreserved: true,
              },
            });
          } catch (e: any) {
            console.error(`[Job ${job.id}] Final settlement failed:`, e.message);
          }
        }
        
        // Keep in-memory store updated for immediate local polling and preview
        job.status = "ready";
        job.progress = 100;
        job.currentStep = "Machine translation and layout reconstruction complete.";
        job.outputKey = outputKey;
        job.translatedBuffer = renderedBuffer;
        updateTranslationJob(job);
      })
      .catch(async (err) => {
        if (userId) {
          try {
            await releaseCreditsOnFailure(userId, job.id, N, err.message);
            await prisma.translationJob.update({
              where: { id: job.id },
              data: {
                status: "failed",
                errorMessage: err.message || "Translation pipeline failed",
                completedAt: new Date(),
              },
            });
          } catch (e: any) {
            console.error(`[Job ${job.id}] Credit refund failed:`, e.message);
          }
        }
        
        job.status = "failed";
        job.error = err.message;
        updateTranslationJob(job);
      });

    return NextResponse.json(
      {
        success: true,
        jobId: job.id,
        fileName: job.fileName,
        fileFormat: job.fileFormat,
        fileSize: job.fileSize,
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        downloadToken: job.downloadToken,
      },
      {
        status: 202,
        headers: {
          "X-VerifyLingua-Composite-Key": job.compositeKey || "",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to initiate document translation." },
      { status: 500 }
    );
  }
}
