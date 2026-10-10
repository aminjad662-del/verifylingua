import { inngest } from "./client";
import { NonRetriableError } from "inngest";
import { runAgent2 } from "../../../services/translator";
import { runRenderingAgent } from "../../../services/renderer";

export const translateDocumentJob = inngest.createFunction(
  {
    id: "run-strict-translator",
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
        else if (/llm structured output validation failed|validation|zod|syntaxerror/i.test(errMsg)) reasonCode = "llm_validation_failed";
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
        const { createAdminClient } = await import("@/supabase/admin");
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
        console.error("[Inngest onFailure Error]:", dbErr);
      }
    },
  },
  async ({ event, step, attempt, ctx }: any) => {
    const currentAttempt = typeof attempt === "number" ? attempt : (typeof ctx?.attempt === "number" ? ctx.attempt : 0);
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
    const jobId = unwrapped?.jobId || unwrapped?.job_id || unwrapped?.orderId || rawData?.jobId;
    const orderId = unwrapped?.orderId || unwrapped?.order_id || unwrapped?.jobId || rawData?.orderId;

    const extractedBlocks = event?.data?.extractedBlocks;
    const originalBuffer = event?.data?.fileBuffer ? Buffer.from(event.data.fileBuffer) : Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n200\n%%EOF");
    const sourceLang = event?.data?.sourceLang || "es";
    const targetLang = event?.data?.targetLang || "en";

    // 1. translate-document: Live AI translation via Gemini 3.5 Flash API
    const translateFn = async () => {
      // API KEY GUARD: At the start of the translate-document step, verify process.env.GEMINI_API_KEY exists
      if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.trim()) {
        try {
          const { createAdminClient } = await import("@/supabase/admin");
          const supabase = createAdminClient();
          const target = orderId || jobId;
          if (target && target !== "unknown") {
            await (supabase as any)
              .from("translation_jobs")
              .update({
                status: "failed",
                reason_code: "missing_gemini_api_key",
                updated_at: new Date().toISOString(),
              })
              .eq("id", target);
            await (supabase as any)
              .from("translation_jobs")
              .update({
                status: "failed",
                reason_code: "missing_gemini_api_key",
                updated_at: new Date().toISOString(),
              })
              .eq("order_id", target);
          }
        } catch {}

        const keyErr = new NonRetriableError("Missing Gemini API Key");
        (keyErr as any).reasonCode = "missing_gemini_api_key";
        throw keyErr;
      }

      try {
        return await runAgent2(extractedBlocks, sourceLang, targetLang);
      } catch (err: any) {
        const errMsg = err?.message || String(err || "");
        const isValidationError =
          err?.isValidationError ||
          err?.name === "ZodError" ||
          err?.name === "SyntaxError" ||
          /validation|zod|syntaxerror/i.test(errMsg);

        const isTimeout =
          err?.isTimeout ||
          err?.name === "TimeoutError" ||
          err?.code === 23 ||
          /timeout|timed out/i.test(errMsg);

        if (isValidationError) {
          if (currentAttempt >= 3) {
            try {
              const { createAdminClient } = await import("@/supabase/admin");
              const supabase = createAdminClient();
              const target = orderId || jobId;
              if (target && target !== "unknown") {
                await (supabase as any)
                  .from("translation_jobs")
                  .update({
                    status: "failed",
                    reason_code: "llm_validation_failed",
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", target);
                await (supabase as any)
                  .from("translation_jobs")
                  .update({
                    status: "failed",
                    reason_code: "llm_validation_failed",
                    updated_at: new Date().toISOString(),
                  })
                  .eq("order_id", target);
              }
            } catch {}

            const fatalErr = new NonRetriableError("LLM structured output validation failed");
            (fatalErr as any).reasonCode = "llm_validation_failed";
            throw fatalErr;
          }

          const retryErr = new Error(`LLM structured output validation failed (attempt ${currentAttempt + 1} of 3): ${errMsg}`);
          (retryErr as any).reasonCode = "llm_validation_failed";
          (retryErr as any).isValidationError = true;
          throw retryErr;
        }

        if (isTimeout) {
          if (currentAttempt >= 3) {
            try {
              const { createAdminClient } = await import("@/supabase/admin");
              const supabase = createAdminClient();
              const target = orderId || jobId;
              if (target && target !== "unknown") {
                await (supabase as any)
                  .from("translation_jobs")
                  .update({
                    status: "failed",
                    reason_code: "llm_timeout",
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", target);
                await (supabase as any)
                  .from("translation_jobs")
                  .update({
                    status: "failed",
                    reason_code: "llm_timeout",
                    updated_at: new Date().toISOString(),
                  })
                  .eq("order_id", target);
              }
            } catch {}

            const fatalErr = new NonRetriableError("Gemini API call timed out after 3 retries");
            (fatalErr as any).reasonCode = "llm_timeout";
            throw fatalErr;
          }

          const retryErr = new Error(`Gemini API call timed out (attempt ${currentAttempt + 1} of 3): ${errMsg}`);
          (retryErr as any).reasonCode = "llm_timeout";
          (retryErr as any).isTimeout = true;
          throw retryErr;
        }

        throw err;
      }
    };

    // Execute translation step supporting both canonical 'translate-document' and legacy 'execute-translation-agent' step names
    let translatedData: any;
    try {
      translatedData = await step.run("translate-document", translateFn);
    } catch (stepErr: any) {
      const isOperationalError =
        stepErr instanceof NonRetriableError ||
        stepErr?.name === "NonRetriableError" ||
        stepErr?.isValidationError ||
        stepErr?.isTimeout ||
        stepErr?.reasonCode;

      if (!isOperationalError && step.run) {
        translatedData = await step.run("execute-translation-agent", translateFn);
      } else {
        throw stepErr;
      }
    }

    // 2. Rendering Agent: Real PDF generation mapping translated text to original layout
    const renderedResult = await step.run("execute-rendering-agent", async () => {
      return await runRenderingAgent({
        originalBuffer,
        translations: translatedData,
        targetLang,
        sourceLang,
      });
    });

    // 3. Update status in Supabase translation_jobs to completed and persist rendered PDF
    await step.run("update-status-to-completed", async () => {
      const target = orderId || jobId;
      if (target && target !== "unknown") {
        try {
          const { createAdminClient } = await import("@/supabase/admin");
          const supabase = createAdminClient();
          const filePath = `${target}/translated_document.pdf`;

          if (renderedResult?.pdfBuffer) {
            try {
              await supabase.storage
                .from("translated_documents")
                .upload(filePath, Buffer.from(renderedResult.pdfBuffer), {
                  contentType: "application/pdf",
                  upsert: true,
                });
            } catch {}
          }

          await supabase
            .from("translation_jobs")
            .update({
              status: "completed",
              current_phase: "completed",
              file_url: renderedResult?.pdfBuffer ? filePath : undefined,
              updated_at: new Date().toISOString(),
            })
            .eq("id", target);

          await supabase
            .from("translation_jobs")
            .update({
              status: "completed",
              current_phase: "completed",
              file_url: renderedResult?.pdfBuffer ? filePath : undefined,
              updated_at: new Date().toISOString(),
            })
            .eq("order_id", target);

          if (orderId && orderId !== "unknown") {
            try {
              await supabase
                .from("orders")
                .update({
                  status: "completed",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", orderId);
            } catch {}
          }

          // Sync in-memory store for instant download availability
          try {
            const { getTranslationJob, updateTranslationJob } = await import("@/lib/translation/store");
            for (const key of [jobId, orderId].filter(Boolean)) {
              const mem = getTranslationJob(key);
              if (mem) {
                mem.status = "completed";
                mem.progress = 100;
                if (renderedResult?.pdfBuffer) {
                  mem.translatedBuffer = Buffer.from(renderedResult.pdfBuffer);
                }
                updateTranslationJob(mem);
              }
            }
          } catch {}

          // Sync persistent store
          try {
            const { updatePersistentJob } = await import("@/lib/translation/persistent-store");
            await updatePersistentJob(target, {
              status: "completed",
              progress: 100,
              outputKey: filePath,
            });
          } catch {}
        } catch {}
      }
      return { status: "completed" };
    });

    return {
      success: true,
      jobId,
      orderId,
      data: translatedData,
      rendered: renderedResult,
    };
  }
);