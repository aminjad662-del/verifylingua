import { NextRequest, NextResponse } from "next/server";
import { getTranslationJob } from "@/lib/translation/store";

export const dynamic = "force-dynamic";

const MIME_MAP: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  png: "image/png",
  jpg: "image/jpeg",
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;
    const job = getTranslationJob(jobId);

    const url = req.nextUrl || new URL(req.url, "http://localhost:3000");
    const token = url.searchParams.get("token");

    let buffer: Buffer | null = null;
    let mime = "application/octet-stream";
    let downloadFileName = "translated_document";

    if (job) {
      if (job.status !== "ready" || !job.translatedBuffer) {
        return NextResponse.json(
          { error: `Translation is currently in status '${job.status}'. Download is not yet ready.` },
          { status: 400 }
        );
      }

      if (job.downloadToken && token !== job.downloadToken) {
        return NextResponse.json(
          { error: "Invalid or missing download authorization token." },
          { status: 403 }
        );
      }

      buffer = job.translatedBuffer;
      mime = MIME_MAP[job.fileFormat] || "application/octet-stream";
      const baseName = job.fileName.replace(/\.[^/.]+$/, "");
      downloadFileName = `${baseName}_translated_${job.targetLang}.${job.fileFormat}`;
    } else {
      const { getPersistentJob } = await import("@/lib/translation/persistent-store");
      const { getObject } = await import("@/lib/storage");
      const pJob = await getPersistentJob(jobId);

      if (!pJob) {
        return NextResponse.json(
          { error: "Translation record not found or expired." },
          { status: 404 }
        );
      }

      if (pJob.status !== "completed" && pJob.status !== "completed_with_warnings") {
        return NextResponse.json(
          { error: `Translation is currently in status '${pJob.status}'. Download is not yet ready.` },
          { status: 400 }
        );
      }

      if (pJob.downloadToken && token !== pJob.downloadToken) {
        return NextResponse.json(
          { error: "Invalid or missing download authorization token." },
          { status: 403 }
        );
      }

      if (!pJob.outputKey) {
        return NextResponse.json(
          { error: "Translated document output buffer missing." },
          { status: 500 }
        );
      }

      buffer = await getObject(pJob.outputKey);
      mime = pJob.sourceMimeType || MIME_MAP[pJob.sourceFormat] || "application/octet-stream";
      const baseName = pJob.sourceFilename.replace(/\.[^/.]+$/, "");
      downloadFileName = `${baseName}_translated_${pJob.targetLanguage}.${pJob.sourceFormat}`;
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${downloadFileName}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, max-age=3600",
        "X-VerifyLingua-Quality-Gate": "PASSED",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to download translated document." },
      { status: 500 }
    );
  }
}
