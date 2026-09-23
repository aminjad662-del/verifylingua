import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTranslationJob, updateTranslationJob } from "@/lib/translation/store";
import { getPersistentJob, updatePersistentJob } from "@/lib/translation/persistent-store";

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

    // Update PostgreSQL
    try {
      await prisma.translationJob.update({
        where: { id },
        data: {
          status: updatedStatus,
          currentStep,
          completedAt: new Date(certifiedAt),
        },
      });
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
