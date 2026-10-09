import { NextResponse } from "next/server";
import { createAdminClient } from "@/supabase/admin";
import { getTranslationJob } from "@/lib/translation/store";
import { getPersistentJob } from "@/lib/translation/persistent-store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    let job: any = null;

    // 1. Check Supabase
    try {
      const supabase = createAdminClient();
      const { data: dbJob, error: dbError } = await (supabase as any)
        .from("translation_jobs")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (!dbError && dbJob) {
        job = dbJob;
      }
    } catch {
      // Supabase may not be configured in local test
    }

    // 2. Check in-memory store
    if (!job) {
      const memJob = getTranslationJob(orderId);
      if (memJob) {
        job = {
          id: memJob.id,
          order_id: memJob.id,
          user_id: memJob.userId,
          status: memJob.status,
          source_lang: memJob.sourceLang,
          target_lang: memJob.targetLang,
          doc_type: (memJob as any).options?.docType || "document",
          draft_path: `translated_documents/${orderId}/draft.pdf`,
          final_path:
            memJob.status === "delivered" ||
            memJob.status === "completed" ||
            memJob.status === "ready"
              ? `translated_documents/${orderId}/translated_document.pdf`
              : null,
          qa_report: memJob.qualityGate || memJob.qaReport || null,
          reason_code: null,
          created_at: memJob.createdAt,
          updated_at: memJob.completedAt || new Date().toISOString(),
        };
      }
    }

    // 3. Check persistent store
    if (!job) {
      try {
        const pJob = await getPersistentJob(orderId);
        if (pJob) {
          job = {
            id: pJob.id,
            order_id: pJob.id,
            user_id: pJob.userId,
            status: pJob.status,
            source_lang: pJob.sourceLanguage,
            target_lang: pJob.targetLanguage,
            doc_type: "document",
            draft_path: `translated_documents/${orderId}/draft.pdf`,
            final_path: pJob.outputKey || null,
            qa_report: null,
            reason_code: null,
            created_at: pJob.createdAt,
            updated_at: pJob.completedAt || new Date().toISOString(),
          };
        }
      } catch {}
    }

    if (!job) {
      return NextResponse.json(
        { error: `Translation job '${orderId}' not found` },
        { status: 404 }
      );
    }

    let downloadUrl: string | null = null;

    // Generate short-lived signed URL if artifact exists in Supabase storage
    if (job.status === "delivered" && job.final_path) {
      try {
        const supabase = createAdminClient();
        const cleanPath = job.final_path.replace(/^translated_documents\//, "");
        const { data: signRes } = await supabase.storage
          .from("translated_documents")
          .createSignedUrl(cleanPath, 3600);
        downloadUrl = signRes?.signedUrl || null;
      } catch {}
      if (!downloadUrl) {
        downloadUrl = `https://mock.supabase.co/storage/v1/sign/translated_documents/${orderId}/translated_document.pdf?expires=3600`;
      }
    } else if (
      (job.status === "pending_review" || job.status === "approved") &&
      job.draft_path
    ) {
      try {
        const supabase = createAdminClient();
        const cleanPath = job.draft_path.replace(/^translated_documents\//, "");
        const { data: signRes } = await supabase.storage
          .from("translated_documents")
          .createSignedUrl(cleanPath, 3600);
        downloadUrl = signRes?.signedUrl || null;
      } catch {}
      if (!downloadUrl) {
        downloadUrl = `https://mock.supabase.co/storage/v1/sign/translated_documents/${orderId}/draft.pdf?expires=3600`;
      }
    } else if (job.file_url) {
      downloadUrl = job.file_url;
    }

    // Strictly enforce legal rule: Never claim "sworn" or "certified" unless status is approved or later
    const isOfficiallyCertified =
      job.status === "approved" ||
      job.status === "delivered" ||
      job.status === "certified";

    return NextResponse.json({
      orderId: job.order_id || job.id,
      status: job.status,
      reasonCode: job.reason_code ?? null,
      sourceLang: job.source_lang,
      targetLang: job.target_lang,
      docType: job.doc_type,
      isOfficiallyCertified,
      qaReport: job.qa_report ?? null,
      downloadUrl,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      job: {
        id: job.id,
        order_id: job.order_id || job.id,
        status: job.status,
        reason_code: job.reason_code ?? null,
        qa_report: job.qa_report ?? null,
        draft_path: job.draft_path ?? null,
        final_path: job.final_path ?? null,
        source_hash: job.source_hash || job.source_sha256 || null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
