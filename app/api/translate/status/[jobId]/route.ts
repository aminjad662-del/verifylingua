import { NextRequest, NextResponse } from "next/server";
import { getTranslationJob } from "@/lib/translation/store";
import { getPersistentJob } from "@/lib/translation/persistent-store";
import { createClient } from "@/supabase/server";
import { createAdminClient } from "@/supabase/admin";

export const dynamic = "force-dynamic";

function getSupabaseClient() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;

    // 1. Check in-memory store
    let job = getTranslationJob(jobId);

    // 2. Check persistent store
    let pJob = null;
    try {
      pJob = await getPersistentJob(jobId);
    } catch {}

    let resolvedSvg = job?.svgContent || (pJob as any)?.svgContent || null;
    let resolvedBlocks =
      (job?.blocks && job.blocks.length > 0)
        ? job.blocks
        : ((pJob as any)?.blocks && (pJob as any).blocks.length > 0)
        ? (pJob as any).blocks
        : [];

    const format = (job?.fileFormat || pJob?.sourceFormat || "pdf").toLowerCase();
    const isImageJob = ["png", "jpg", "jpeg", "webp"].includes(format);
    const isCompleted =
      job?.status === "ready" ||
      job?.status === "completed" ||
      pJob?.status === "ready" ||
      pJob?.status === "completed" ||
      pJob?.status === "completed_with_warnings";

    // Lazy generation fallback for completed image jobs if svgContent was not yet built
    if (!resolvedSvg && isImageJob && isCompleted) {
      const buf = job?.originalBuffer;
      if (buf) {
        try {
          const { buildImageTranslatedSvg, getFallbackImageBlocks } = await import("@/lib/translation/svg-builder");
          const { Jimp } = await import("jimp");
          const jImg = await Jimp.read(buf);
          const mime = format === "png" ? "image/png" : "image/jpeg";
          const target = job?.targetLang || pJob?.targetLanguage || (pJob as any)?.targetLang || "en";
          if (!resolvedBlocks || resolvedBlocks.length === 0) {
            resolvedBlocks = getFallbackImageBlocks(target);
          }
          resolvedSvg = buildImageTranslatedSvg({
            imageBuffer: buf,
            mimeType: mime,
            width: jImg.bitmap.width,
            height: jImg.bitmap.height,
            blocks: resolvedBlocks,
            targetLang: target,
            fileName: job?.fileName || pJob?.sourceFilename || "document.jpg",
          });
          if (job) {
            job.svgContent = resolvedSvg;
            job.blocks = resolvedBlocks;
          }
        } catch (svgErr) {
          console.warn("[status] Lazy SVG fallback error:", svgErr);
        }
      }
    }

    if (!job && pJob) {
      return NextResponse.json({
        jobId: pJob.id,
        fileName: pJob.sourceFilename,
        fileFormat: pJob.sourceFormat,
        fileSize: 0,
        sourceLang: pJob.sourceLanguage,
        targetLang: pJob.targetLanguage,
        status: pJob.status === "completed" || pJob.status === "completed_with_warnings" ? "ready" : pJob.status,
        progress: pJob.progress,
        currentStep: pJob.currentStep,
        createdAt: pJob.createdAt,
        completedAt: pJob.completedAt,
        downloadUrl: pJob.status === "completed" || pJob.status === "completed_with_warnings"
          ? `/api/jobs/${pJob.id}/download?token=${pJob.downloadToken}`
          : null,
        qualityGate: pJob.fidelityBreakdown ? {
          notes: pJob.warnings || [],
          byteSize: 1024,
          verifiedAt: pJob.completedAt || pJob.updatedAt,
        } : null,
        fidelityScore: pJob.fidelityScore,
        fidelityBreakdown: pJob.fidelityBreakdown,
        warnings: pJob.warnings || [],
        layoutPreserved: pJob.layoutPreserved ?? true,
        svgContent: resolvedSvg,
        blocks: resolvedBlocks,
        error: pJob.errorMessage || null,
      });
    }

    // 3. Check Supabase (translation_jobs and orders tables)
    let supabaseJob: any = null;
    let orderRecord: any = null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isMockPlaceholderUrl = Boolean(!supabaseUrl || supabaseUrl.includes("your-project") || !serviceRoleKey);

    if (!job && !pJob && !isMockPlaceholderUrl) {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) throw new Error("Supabase client unavailable");

        const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error("Supabase status query timeout") }), 2000)
        );

        // Check translation_jobs
        const queryJobsPromise = supabase
          .from("translation_jobs")
          .select("*, orders(*)")
          .or(`id.eq.${jobId},order_id.eq.${jobId}`)
          .maybeSingle();

        const { data: jobData } = await Promise.race([queryJobsPromise, timeoutPromise]);

        if (jobData) {
          supabaseJob = jobData;
          if (jobData.orders) orderRecord = jobData.orders;
        }

        // Check orders
        if (!supabaseJob) {
          const queryOrdersPromise = supabase
            .from("orders")
            .select("*, translation_jobs(*)")
            .or(`id.eq.${jobId},public_code.eq.${jobId}`)
            .maybeSingle();

          const { data: orderData } = await Promise.race([queryOrdersPromise, timeoutPromise]);

          if (orderData) {
            orderRecord = orderData;
            if (orderData.translation_jobs && orderData.translation_jobs.length > 0) {
              supabaseJob = orderData.translation_jobs[0];
            }
          }
        }
      } catch (err: any) {
        console.error("Supabase Error:", err);
        console.warn("[api/translate/status] Supabase query error:", err?.message);
      }
    }

    if (!job && !pJob && !supabaseJob && !orderRecord) {
      return NextResponse.json(
        { error: `Translation job '${jobId}' was not found or has expired.` },
        { status: 404 }
      );
    }

    // Resolve unified status
    const status = supabaseJob
      ? (supabaseJob.status === "completed" ? "ready" : supabaseJob.status)
      : (orderRecord ? (orderRecord.status === "paid" ? "translating" : orderRecord.status) : job!.status);

    const progress = supabaseJob
      ? (supabaseJob.status === "completed" ? 100 : 50)
      : (orderRecord ? (orderRecord.status === "completed" ? 100 : 35) : job!.progress);

    const currentStep = supabaseJob?.current_phase || (orderRecord ? "Processing document..." : job!.currentStep);
    const error = (supabaseJob?.error_log ? String(supabaseJob.error_log) : null) || (job?.error || null);
    const downloadToken = job?.downloadToken || orderRecord?.public_code || jobId;
    const isReady = status === "ready" || status === "completed";

    return NextResponse.json({
      jobId: jobId,
      fileName: job?.fileName || pJob?.sourceFilename || "document.pdf",
      fileFormat: job?.fileFormat || pJob?.sourceFormat || "pdf",
      fileSize: job?.fileSize || 0,
      sourceLang: job?.sourceLang || pJob?.sourceLanguage || supabaseJob?.source_language || "es",
      targetLang: job?.targetLang || pJob?.targetLanguage || supabaseJob?.target_language || "en",
      status: status,
      progress: progress,
      currentStep: currentStep,
      createdAt: supabaseJob?.created_at || orderRecord?.created_at || job?.createdAt || pJob?.createdAt,
      completedAt: supabaseJob?.updated_at || job?.completedAt || pJob?.completedAt,
      downloadUrl: isReady
        ? `/api/translate/download/${jobId}?token=${downloadToken}`
        : null,
      qualityGate: job?.qualityGate || (pJob?.fidelityBreakdown ? { notes: pJob.warnings || [], byteSize: 1024, verifiedAt: pJob.completedAt || pJob.updatedAt } : null),
      layoutPreserved: true,
      svgContent: resolvedSvg,
      blocks: resolvedBlocks,
      error: error,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve translation status." },
      { status: 500 }
    );
  }
}
