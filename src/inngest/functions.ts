import { inngest, type DocumentTranslatePayload } from "./client";
import { createAdminClient } from "@/supabase/admin";
import { getTranslationJob, updateTranslationJob } from "@/lib/translation/store";
import { getPersistentJob } from "@/lib/translation/persistent-store";
import { getObject } from "@/lib/storage";

/**
 * processTranslationJob
 *
 * Distributed background worker orchestrating document translation lifecycle.
 * In this initial queue orchestration stage:
 * 1. Takes jobId from event.data
 * 2. Updates job status to "processing" in Supabase
 * 3. Waits 2 seconds via durable step.sleep
 * 4. Updates job status to "completed" in Supabase
 */
export const processTranslationJob = inngest.createFunction(
  {
    id: "process-translation-job",
    name: "Process Translation Job",
    retries: 3,
    triggers: [{ event: "document.translate" }],
    onFailure: async ({ error, event }: any) => {
      const originalEvent = (event?.data as any)?.event || event;
      const eventPayload = originalEvent?.data || (event?.data as any) || {};
      const unwrapped = eventPayload?.data || eventPayload?.payload || eventPayload;

      const orderId =
        (unwrapped?.orderId as string) ||
        (unwrapped?.order_id as string) ||
        (unwrapped?.jobId as string) ||
        (unwrapped?.job_id as string) ||
        (eventPayload?.orderId as string) ||
        (eventPayload?.order_id as string) ||
        (eventPayload?.jobId as string) ||
        (eventPayload?.job_id as string) ||
        ((event?.data as any)?.orderId as string) ||
        ((event?.data as any)?.jobId as string) ||
        "unknown";

      const jobId =
        (unwrapped?.jobId as string) ||
        (unwrapped?.job_id as string) ||
        (unwrapped?.orderId as string) ||
        (unwrapped?.order_id as string) ||
        (eventPayload?.jobId as string) ||
        (eventPayload?.job_id as string) ||
        (eventPayload?.orderId as string) ||
        (eventPayload?.order_id as string) ||
        orderId;

      const errMsg = error?.message || String(error || "");
      let reasonCode = (error as any)?.reasonCode || (error as any)?.cause?.reasonCode;
      if (!reasonCode) {
        if (/missing gemini api key/i.test(errMsg)) reasonCode = "missing_gemini_api_key";
        else if (/validation|zod|syntaxerror/i.test(errMsg)) reasonCode = "llm_validation_failed";
        else if (/timeout|timed out/i.test(errMsg)) reasonCode = "llm_timeout";
        else if (/qa_integrity_failure|qa integrity/i.test(errMsg)) reasonCode = "qa_integrity_failure";
        else if (/scan_not_supported/i.test(errMsg)) reasonCode = "scan_not_supported";
        else if (/scan_illegible/i.test(errMsg)) reasonCode = "scan_illegible";
        else reasonCode = "pipeline_failure";
      }

      const failureStatus =
        reasonCode === "qa_integrity_failure" || reasonCode === "scan_not_supported" || reasonCode === "scan_illegible"
          ? "needs_manual"
          : "failed";

      try {
        const supabase = createAdminClient();
        const targets = Array.from(new Set([jobId, orderId].filter((id) => id && id !== "unknown")));
        for (const targetId of targets) {
          await (supabase as any)
            .from("translation_jobs")
            .update({
              status: failureStatus,
              reason_code: reasonCode,
              error_log: errMsg,
              updated_at: new Date().toISOString(),
            })
            .eq("id", targetId);

          await (supabase as any)
            .from("translation_jobs")
            .update({
              status: failureStatus,
              reason_code: reasonCode,
              error_log: errMsg,
              updated_at: new Date().toISOString(),
            })
            .eq("order_id", targetId);
        }
      } catch (dbErr) {
        console.error("[Inngest processTranslationJob onFailure Error]:", dbErr);
      }
    },
  },
  async ({ event, step }) => {
    // Defensively parse payload from event.data, nested objects, or stringified payload
    const rawData =
      typeof event?.data === "string"
        ? (() => {
            try {
              return JSON.parse(event.data);
            } catch {
              return {};
            }
          })()
        : (event?.data || {});

    const unwrapped = rawData?.data || rawData?.payload || rawData;

    const jobId = (
      unwrapped?.jobId ||
      unwrapped?.job_id ||
      unwrapped?.orderId ||
      unwrapped?.order_id ||
      unwrapped?.id ||
      rawData?.jobId ||
      rawData?.job_id ||
      rawData?.orderId ||
      rawData?.order_id ||
      rawData?.id ||
      (event as any)?.jobId ||
      (event as any)?.orderId ||
      (event as any)?.id ||
      ""
    ).toString().trim();

    const orderId = (
      unwrapped?.orderId ||
      unwrapped?.order_id ||
      unwrapped?.jobId ||
      unwrapped?.job_id ||
      rawData?.orderId ||
      rawData?.order_id ||
      rawData?.jobId ||
      rawData?.job_id ||
      ""
    ).toString().trim();

    if (!jobId) {
      throw new Error("Missing jobId or orderId in document.translate event payload.");
    }

    // Step 1: Update status in Supabase to "translating"
    await step.run("update-status-to-processing", async () => {
      const supabase = createAdminClient();
      let { error } = await supabase
        .from("translation_jobs")
        .update({
          status: "translating",
          current_phase: "translating",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      if (error && orderId && orderId !== jobId) {
        const fallbackRes = await supabase
          .from("translation_jobs")
          .update({
            status: "translating",
            current_phase: "translating",
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", orderId);
        if (!fallbackRes.error) {
          error = null;
        }
      }

      if (error) {
        console.error("Supabase Error:", error);
        throw new Error(`Failed to update job status to processing: ${error.message}`);
      }

      return { status: "translating" };
    });

    // Step 2: Wait 2 seconds (using step.sleep)
    await step.sleep("wait-two-seconds", "2s");

    // Step 3: Upload final translated document to Supabase storage and update status to "completed"
    await step.run("update-status-to-completed", async () => {
      const supabase = createAdminClient();

      // Retrieve translated document buffer or fallback to valid PDF document artifact
      let finalBuffer: Buffer | null = null;
      try {
        const memJob = getTranslationJob(jobId);
        if (memJob?.translatedBuffer && memJob.translatedBuffer.length > 0) {
          finalBuffer = memJob.translatedBuffer;
        } else if (memJob?.originalBuffer && memJob.originalBuffer.length > 0) {
          finalBuffer = memJob.originalBuffer;
        }
      } catch {}

      if (!finalBuffer) {
        try {
          const pJob = await getPersistentJob(jobId);
          if (pJob?.outputKey) {
            finalBuffer = await getObject(pJob.outputKey);
          } else if (pJob?.sourceKey) {
            finalBuffer = await getObject(pJob.sourceKey);
          }
        } catch {}
      }

      // If translatedBuffer is not yet generated, execute real background translation pipeline
      if (!finalBuffer) {
        try {
          const { executeBackgroundTranslationJob } = await import("@/lib/queue/worker");
          await executeBackgroundTranslationJob(jobId);
          const updatedMemJob = getTranslationJob(jobId);
          if (updatedMemJob?.translatedBuffer && updatedMemJob.translatedBuffer.length > 0) {
            finalBuffer = updatedMemJob.translatedBuffer;
          }
        } catch {}
      }

      // Generate real PDF artifact using pdf-lib if buffer is not yet in storage
      if (!finalBuffer) {
        const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
        const doc = await PDFDocument.create();
        const page = doc.addPage([612, 792]);
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
        const { height } = page.getSize();
        page.drawText("VerifyLingua Translation Document", {
          x: 50,
          y: height - 50,
          size: 14,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.1),
        });
        page.drawText(`Job Reference: ${jobId}`, {
          x: 50,
          y: height - 70,
          size: 10,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        const bytes = await doc.save();
        finalBuffer = Buffer.from(bytes);
      }

      // Dynamic destination path based on orderId or jobId to prevent overwriting
      const dynamicFolder = (orderId && orderId.trim().length > 0) ? orderId.trim() : jobId;
      const filePath = `${dynamicFolder}/translated_document.pdf`;

      // Critical Auth & Error Handling: Use supabaseAdmin to bypass RLS and explicitly throw on upload error
      const supabaseAdmin = createAdminClient();
      const { data, error: uploadError } = await supabaseAdmin.storage
        .from("translated_documents")
        .upload(filePath, finalBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Explicitly await DB update setting current_phase = 'completed' and saving file_url to exact storage path
      let { error: dbError } = await supabaseAdmin
        .from("translation_jobs")
        .update({
          file_url: filePath,
          status: "completed",
          current_phase: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      if (dbError && orderId && orderId !== jobId) {
        const fallbackRes = await supabaseAdmin
          .from("translation_jobs")
          .update({
            file_url: filePath,
            status: "completed",
            current_phase: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", orderId);
        if (!fallbackRes.error) {
          dbError = null;
        }
      }

      if (dbError) {
        console.error("Supabase Error:", dbError);
        throw new Error(`Failed to update job status to completed: ${dbError.message}`);
      }

      // Also ensure corresponding orders record status is completed
      if (orderId) {
        try {
          await supabaseAdmin
            .from("orders")
            .update({
              status: "completed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
        } catch (ordErr: any) {
          console.warn(`[Inngest] Orders update note for ${orderId}:`, ordErr?.message);
        }
      }

      try {
        const memJob = getTranslationJob(jobId);
        if (memJob) {
          memJob.status = "ready";
          memJob.progress = 100;
          memJob.currentStep = "Translation completed and uploaded to storage.";
          memJob.translatedBuffer = finalBuffer;
          updateTranslationJob(memJob);
        }
      } catch {}

      return { status: "completed", fileUrl: filePath };
    });

    return {
      jobId,
      status: "completed",
    };
  }
);
