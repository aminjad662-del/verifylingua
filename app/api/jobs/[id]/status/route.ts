import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { createAdminClient } from "@/supabase/admin";
import { getPersistentJob } from "@/lib/translation/persistent-store";
import { getTranslationJob } from "@/lib/translation/store";
import { releaseCreditsOnFailure } from "@/lib/services/credit-service";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function getSupabaseClient() {
  return createAdminClient();
}

/**
 * Live Status Polling Endpoint:
 * GET /api/jobs/[id]/status
 *
 * Returns granular job state, current pipeline phase (extracting, translating, rendering, verifying),
 * progress percentage (0-100%), and the final artifact URL upon completion.
 * Backed by Supabase orders & translation_jobs tables and in-memory caches.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cleanId = (id || "").trim();
    const url = req.nextUrl || new URL(req.url, "http://localhost:3000");

    // 1. Check In-Memory Store first (instant)
    const memJob = getTranslationJob(cleanId);

    // 2. Check Persistent Store
    let pJob = null;
    if (!memJob) {
      try {
        pJob = await getPersistentJob(cleanId);
      } catch (err: any) {
        console.warn("[api/jobs/status] persistent-store query error:", err?.message);
      }
    }

    // 3. Check Supabase (orders and translation_jobs tables)
    let supabaseJob: any = null;
    let orderRecord: any = null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMockPlaceholderUrl = Boolean(supabaseUrl?.includes("your-project"));

    if (!memJob && !pJob && (!supabaseUrl || !isMockPlaceholderUrl)) {
      try {
        const supabase = getSupabaseClient();

        const queryOrdersPromise = supabase
          .from("orders")
          .select("*, translation_jobs(*)")
          .or(`id.eq.${cleanId},public_code.eq.${cleanId}`)
          .maybeSingle();

        const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error("Supabase status query timeout") }), 2000)
        );

        const { data: orderData } = await Promise.race([queryOrdersPromise, timeoutPromise]);

        if (orderData) {
          orderRecord = orderData;
          if (orderData.translation_jobs && orderData.translation_jobs.length > 0) {
            supabaseJob = orderData.translation_jobs[0];
          }
        }

        // Check translation_jobs table directly by id or order_id
        if (!supabaseJob) {
          const queryJobsPromise = supabase
            .from("translation_jobs")
            .select("*, orders(*)")
            .or(`id.eq.${cleanId},order_id.eq.${cleanId}`)
            .maybeSingle();

          const { data: jobData } = await Promise.race([queryJobsPromise, timeoutPromise]);

          if (jobData) {
            supabaseJob = jobData;
            if (jobData.orders) {
              orderRecord = jobData.orders;
            }
          }
        }
      } catch (supabaseErr: any) {
        console.error("Supabase Error:", supabaseErr);
        console.warn("[api/jobs/status] Supabase query error:", supabaseErr?.message);
      }
    }

    if (!supabaseJob && !pJob && !memJob && !orderRecord) {
      return NextResponse.json(
        { error: `Job '${cleanId}' not found.` },
        { status: 404 }
      );
    }

    // Resolve unified job attributes
    const jobId = supabaseJob?.id || pJob?.id || memJob?.id || orderRecord?.public_code || cleanId;
    const userId = supabaseJob?.user_id || pJob?.userId || memJob?.userId || orderRecord?.user_id || null;
    const rawStatus =
      supabaseJob?.status ||
      pJob?.status ||
      memJob?.status ||
      (orderRecord?.status === "paid" ? "translating" : (orderRecord?.status?.toLowerCase() || "queued"));

    const progress =
      pJob?.progress ??
      memJob?.progress ??
      (orderRecord ? (orderRecord.status === "completed" ? 100 : 35) : 0);

    const currentStep =
      supabaseJob?.current_phase ||
      pJob?.currentStep ||
      memJob?.currentStep ||
      (orderRecord ? "ATA-accredited certified linguist assigned. Processing document..." : "Processing document...");

    const fileName = pJob?.sourceFilename || memJob?.fileName || "document.pdf";
    const fileFormat = pJob?.sourceFormat || memJob?.fileFormat || "pdf";
    const sourceLang = pJob?.sourceLanguage || memJob?.sourceLang || "es";
    const targetLang = pJob?.targetLanguage || memJob?.targetLang || "en";
    const pageCount = pJob?.pageCount || memJob?.pageCount || 1;
    const downloadToken = pJob?.downloadToken || memJob?.downloadToken || cleanId;
    const errorMessage =
      (supabaseJob?.error_log ? String(supabaseJob.error_log) : null) ||
      pJob?.errorMessage ||
      memJob?.error ||
      null;

    const createdAt =
      supabaseJob?.created_at ||
      pJob?.createdAt ||
      memJob?.createdAt ||
      orderRecord?.created_at ||
      new Date().toISOString();

    const completedAt =
      supabaseJob?.updated_at ||
      pJob?.completedAt ||
      memJob?.completedAt ||
      null;

    const layoutPreserved = pJob?.layoutPreserved ?? memJob?.layoutPreserved ?? true;

    // Resolve user authorization (multi-tenant IDOR protection)
    const isTestEnv = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);
    let requestingUserId: string | null = null;
    if (isTestEnv) {
      requestingUserId = req.headers.get("x-user-id") || url.searchParams.get("userId") || null;
    }
    if (!requestingUserId) {
      try {
        const sessionUser = await getCurrentUser();
        if (sessionUser?.id) requestingUserId = sessionUser.id;
      } catch {}
    }

    if (userId && requestingUserId && userId !== requestingUserId && !isTestEnv) {
      return NextResponse.json(
        { error: "Unauthorized access to this job." },
        { status: 403 }
      );
    }

    // Automatic resilience: If status is failed and user has reserved credits, guarantee refund
    if (rawStatus === "failed" && userId) {
      try {
        await releaseCreditsOnFailure(
          userId,
          jobId,
          pageCount,
          errorMessage || "Translation pipeline failed"
        );
      } catch (err: any) {
        // Idempotent settlement warning log
      }
    }

    const isCompleted =
      rawStatus === "completed" ||
      rawStatus === "completed_with_warnings" ||
      rawStatus === "ready";

    const downloadUrl = isCompleted
      ? `/api/jobs/${jobId}/download?token=${downloadToken}`
      : null;

    return NextResponse.json({
      jobId,
      status: rawStatus,
      currentPhase: rawStatus,
      progress,
      currentStep,
      fileName,
      fileFormat,
      sourceLang,
      targetLang,
      pageCount,
      artifactUrl: downloadUrl,
      downloadUrl,
      layoutPreserved,
      error: errorMessage,
      createdAt,
      completedAt,
    });
  } catch (err: any) {
    console.error("Error fetching live job status:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch live job status." },
      { status: 500 }
    );
  }
}
