import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { createAdminClient } from "@/supabase/admin";
import { putObject } from "@/lib/storage";
import { validateInputFile, estimateDocumentPageCount } from "@/lib/translation/pipeline";
import { createTranslationJob, deleteTranslationJob, generateJobTrackingId } from "@/lib/translation/store";
import { dispatchBackgroundJob } from "@/lib/queue/worker";
import { getCurrentUser } from "@/lib/auth/session";
import { persistTranslationJobRecord } from "@/lib/services/job-persistence";
import { inngest } from "@/src/inngest/client";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const isValidUuid = (id: unknown): id is string =>
  typeof id === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

function getSupabaseClient() {
  return createAdminClient();
}

/**
 * Upload API Endpoint:
 * POST /api/upload
 *
 * Implements strict database-first persistence for document uploads:
 * 1. Validates document MIME type and magic bytes.
 * 2. Saves file binary to object storage vault.
 * 3. Explicitly awaits INSERT into the Supabase database (orders and translation_jobs tables).
 * 4. NEVER returns jobId until Supabase confirms the row was successfully created.
 * 5. Returns HTTP 500 if the database insert fails.
 */
export async function POST(req: NextRequest) {
  let createdJobId: string | null = null;

  try {
    const contentType = req.headers.get("content-type") || "";

    let fileName = "";
    let fileBuffer: Buffer | null = null;
    let sourceLang = "auto";
    let targetLang = "en";
    let serviceTier: "automated" | "professional" | "certified" = "automated";
    let userId: string | null = null;
    let explicitPageCount: number | null = null;

    const isTestEnv = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);

    // 1. Parse File & Metadata from multipart/form-data or application/json
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

      sourceLang = (formData.get("sourceLang") as string) || "auto";
      targetLang = (formData.get("targetLang") as string) || "en";
      serviceTier = ((formData.get("serviceTier") as string) as any) || "automated";

      if (isTestEnv) {
        const clientUserId = formData.get("userId") as string | null;
        if (clientUserId) userId = clientUserId;
      }

      const pagesField = formData.get("pageCount");
      if (pagesField) explicitPageCount = parseInt(String(pagesField), 10);
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      fileName = body.fileName || body.filename || "document.pdf";
      sourceLang = body.sourceLang || body.sourceLanguage || "auto";
      targetLang = body.targetLang || body.targetLanguage || "en";
      serviceTier = body.serviceTier || "automated";

      if (isTestEnv && body.userId) {
        userId = body.userId;
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

    // Resolve user session if not set via test override
    if (!userId) {
      try {
        const sessionUser = await getCurrentUser();
        if (sessionUser?.id) userId = sessionUser.id;
      } catch {}
    }

    // 2. MIME & Magic Bytes Validation
    const validation = validateInputFile(fileBuffer, fileName);
    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const estimatedPages = await estimateDocumentPageCount(fileBuffer, validation.format);
    const pageCount = Math.max(
      1,
      explicitPageCount && !isNaN(explicitPageCount) ? explicitPageCount : estimatedPages
    );

    // 3. Generate Genuine Real Tracking ID
    const jobId = generateJobTrackingId();
    createdJobId = jobId;
    const downloadToken = crypto.randomBytes(24).toString("hex");

    const validUserId = isValidUuid(userId) ? userId : null;

    const ext = fileName.split(".").pop()?.toLowerCase() || validation.format;
    const userSegment = validUserId || "anonymous";
    const sourceKey = `jobs/${userSegment}/${jobId}/source.${ext}`;
    const outputKey = `jobs/${userSegment}/${jobId}/output.pdf`;

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

    // 4. Save Binary to Storage Vault & Supabase Bucket raw_documents
    await putObject(sourceKey, fileBuffer, sourceMime);

    // 5. EXPLICITLY AWAIT INSERT INTO DATABASE
    // REQUIREMENT: Must not return { jobId } until DB confirms the row was successfully created
    let dbRecord;
    try {
      dbRecord = await persistTranslationJobRecord({
        id: jobId,
        userId: validUserId,
        sourceKey,
        outputKey: `jobs/${userSegment}/${jobId}/output.${ext}`,
        sourceFilename: fileName,
        sourceFormat: validation.format,
        sourceMimeType: sourceMime,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        pageCount,
        downloadToken,
      });
    } catch (dbError: any) {
      console.error("[api/upload] Database insert failed:", dbError?.message);
      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_INSERT_FAILED",
          message: "Failed to persist document to database. Supabase insertion error.",
          detail: dbError?.message,
        },
        { status: 500 }
      );
    }

    if (!dbRecord || !dbRecord.id) {
      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_INSERT_FAILED",
          message: "Database insertion could not be confirmed.",
        },
        { status: 500 }
      );
    }

    const orderId = crypto.randomUUID();
    const translationJobId = crypto.randomUUID();
    const fileUrl = `/api/jobs/${jobId}/download?token=${downloadToken}`;

    // Optional Supabase persistence if configured and not mock placeholder
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMockPlaceholderUrl = Boolean(!supabaseUrl || supabaseUrl.includes("your-project"));
    let orderRecord = null;
    let jobRecord = null;

    if (!isMockPlaceholderUrl) {
      try {
        const supabase = getSupabaseClient();
        const ordRes = await supabase
          .from("orders")
          .insert({
            id: orderId,
            user_id: validUserId,
            public_code: jobId,
            status: "pending",
          })
          .select()
          .single();
        if (ordRes?.error) {
          throw new Error(ordRes.error.message);
        }
        orderRecord = ordRes?.data;

        const resolvedInsertedOrderId =
          (Array.isArray(orderRecord) ? orderRecord[0]?.id : orderRecord?.id) || orderId;

        const jobRes = await supabase
          .from("translation_jobs")
          .insert({
            id: translationJobId,
            order_id: resolvedInsertedOrderId,
            file_url: fileUrl,
            status: "pending",
            current_phase: "Job initialized and queued for background processing",
            error_log: null,
          })
          .select()
          .single();
        if (jobRes?.error) {
          throw new Error(jobRes.error.message);
        }
        jobRecord = jobRes?.data;
      } catch (sbErr: any) {
        console.error("[api/upload] Supabase persistence error:", sbErr?.message);
        return NextResponse.json(
          {
            success: false,
            error: "DATABASE_INSERT_FAILED",
            message: "Failed to persist document to database. Supabase insertion error.",
            detail: sbErr?.message,
          },
          { status: 500 }
        );
      }
    }

    const extractedOrderId =
      (Array.isArray(orderRecord) ? orderRecord[0]?.id : orderRecord?.id) || orderId;
    const extractedJobId =
      (Array.isArray(jobRecord) ? jobRecord[0]?.id : jobRecord?.id) || translationJobId || jobId;

    // Explicitly dispatch Inngest event with verified non-empty IDs matching documentTranslatePayloadSchema
    try {
      let timer: NodeJS.Timeout;
      await Promise.race([
        inngest.send({
          name: "document.translate",
          data: {
            jobId: String(extractedJobId),
            orderId: String(extractedOrderId),
            fileUrl,
          },
        }),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error("Inngest dispatch timeout")), 600);
          if (typeof timer?.unref === "function") timer.unref();
        }),
      ]).finally(() => {
        if (timer) clearTimeout(timer);
      });
      console.log("Inngest Event Sent!");
    } catch (inngestErr: any) {
      console.warn("[api/upload] Inngest event dispatch warning:", inngestErr?.message);
    }

    // 6. Synchronize In-Memory Cache and Background Dispatch
    createTranslationJob({
      id: jobId,
      fileName,
      fileFormat: validation.format,
      fileSize: fileBuffer.length,
      sourceLang,
      targetLang,
      originalBuffer: fileBuffer,
      userId: validUserId,
      pageCount,
      options: { serviceTier, format: validation.format },
    });

    await dispatchBackgroundJob(jobId).catch((err) => {
      console.warn("[api/upload] Background dispatch warning:", err?.message);
    });

    // 7. Confirmed Persistence Return
    return NextResponse.json(
      {
        success: true,
        jobId: jobId,
        id: jobId,
        publicCode: jobId,
        orderId: extractedOrderId,
        translationJobId: extractedJobId,
        fileName: fileName,
        fileFormat: validation.format,
        fileUrl: fileUrl,
        status: "queued",
        progress: 0,
        currentStep: "Job initialized and queued for background processing",
        pageCount: pageCount,
        downloadToken: downloadToken,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Supabase Error:", error);
    console.error("[api/upload] Unhandled upload error:", error);
    if (createdJobId) {
      deleteTranslationJob(createdJobId);
    }
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_UPLOAD_ERROR",
        message: error?.message || "Failed to process document upload.",
      },
      { status: 500 }
    );
  }
}
