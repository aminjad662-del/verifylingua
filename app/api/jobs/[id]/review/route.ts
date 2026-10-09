import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { createAdminClient } from "@/supabase/admin";
import { getTranslationJob, updateTranslationJob } from "@/lib/translation/store";
import { getPersistentJob, updatePersistentJob } from "@/lib/translation/persistent-store";
import { updateJobDbStatus } from "@/lib/services/credit-service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pJob = await getPersistentJob(id);
    const mJob = getTranslationJob(id);

    if (!pJob && !mJob) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    const job = pJob || (mJob as any);

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        currentStep: job.currentStep,
        sourceFilename: job.sourceFilename || job.fileName,
        sourceLanguage: job.sourceLanguage || job.sourceLang,
        targetLanguage: job.targetLanguage || job.targetLang,
        pageCount: job.pageCount,
        qaReport: job.qaResults?.[0] || null,
        reviewedAt: (job as any).reviewedAt || null,
        translatorId: (job as any).translatorId || null,
        outputKey: job.outputKey,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { translatorId, translatorName, signature, approved } = body;

    if (!translatorId || typeof translatorId !== "string" || translatorId.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing required 'translatorId' in review submission." },
        { status: 400 }
      );
    }

    if (approved === false) {
      // Mark as failed or rejected for re-translation
      const rejectedStatus = "failed";
      await updatePersistentJob(id, {
        status: rejectedStatus,
        currentStep: "Translation rejected by linguist review: " + (body.notes || "Quality issues"),
        errorMessage: body.notes || "Linguist rejected translation quality.",
      });

      const mJob = getTranslationJob(id);
      if (mJob) {
        mJob.status = "failed";
        mJob.error = body.notes || "Linguist rejected translation quality.";
        updateTranslationJob(mJob);
      }

      return NextResponse.json({
        success: true,
        status: "failed",
        action: "rejected",
      });
    }

    // Sworn Approval & Certification
    const certifiedAt = new Date().toISOString();
    const updatedStatus = "certified";
    const currentStep = `Certified by Sworn Translator (${translatorName || translatorId}) under 8 CFR § 103.2`;

    // Update in-memory job
    const mJob = getTranslationJob(id);
    if (mJob) {
      mJob.status = "certified" as any;
      (mJob as any).reviewedAt = certifiedAt;
      (mJob as any).translatorId = translatorId;
      (mJob as any).translatorName = translatorName || "Authorized Sworn Translator";
      (mJob as any).signature = signature || `[signature: ${translatorName || translatorId}]`;
      mJob.currentStep = currentStep;
      updateTranslationJob(mJob);
    }

    await updateJobDbStatus(id, "certified");
    await updatePersistentJob(id, {
      status: "certified" as any,
      currentStep,
      completedAt: certifiedAt,
    });

    // Update Supabase translation_jobs table
    try {
      const supabase =
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
          ? createAdminClient()
          : await createClient();
      await supabase
        .from("translation_jobs")
        .update({
          status: "completed",
          current_phase: currentStep,
          updated_at: certifiedAt,
        })
        .or(`id.eq.${id},order_id.eq.${id}`);
    } catch {}

    return NextResponse.json({
      success: true,
      status: "certified",
      translatorId,
      certifiedAt,
      message: "Translation approved, signed, and certified for USCIS/official submission.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
