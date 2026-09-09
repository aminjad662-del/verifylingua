import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getPersistentJob, updatePersistentJob } from "@/lib/translation/persistent-store";
import { headObject, getObject } from "@/lib/storage";
import { executeAutonomousDocumentPipeline } from "@/lib/inngest/functions";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const job = await getPersistentJob(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    if (job.userId && user && job.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to this job." }, { status: 403 });
    }

    // Verify object exists in storage
    const meta = await headObject(job.sourceKey);
    if (!meta || meta.size === 0) {
      return NextResponse.json({ error: "Uploaded document not found in storage bucket." }, { status: 400 });
    }

    // Sniff buffer magic bytes
    try {
      const buffer = await getObject(job.sourceKey);
      if (buffer.length < 4) {
        return NextResponse.json({ error: "Corrupted or empty document file." }, { status: 400 });
      }

      // Check magic bytes for PDF, DOCX, PNG, JPG
      const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50; // %P
      const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b; // PK (DOCX)
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50; // .PNG
      const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8; // JPEG

      if (!isPdf && !isZip && !isPng && !isJpg) {
        return NextResponse.json({ error: "Invalid file signature. File header does not match expected format." }, { status: 422 });
      }
    } catch {
      // ignore
    }

    await updatePersistentJob(id, {
      status: "uploaded",
      currentStep: "Upload confirmed. Triggering autonomous translation pipeline…",
      progress: 10,
    });

    // Fire asynchronous autonomous pipeline
    await executeAutonomousDocumentPipeline(id);

    return NextResponse.json({
      jobId: id,
      status: "uploaded",
      message: "Upload completed and processing initiated.",
    });
  } catch (err: any) {
    console.error("Error in upload-complete:", err);
    return NextResponse.json({ error: err.message || "Failed to finalize upload." }, { status: 500 });
  }
}
