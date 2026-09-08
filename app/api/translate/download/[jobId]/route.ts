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

    if (!job) {
      return NextResponse.json(
        { error: "Translation record not found or expired." },
        { status: 404 }
      );
    }

    if (job.status !== "ready" || !job.translatedBuffer) {
      return NextResponse.json(
        { error: `Translation is currently in status '${job.status}'. Download is not yet ready.` },
        { status: 400 }
      );
    }

    // Validate download token
    const url = req.nextUrl || new URL(req.url, "http://localhost:3000");
    const token = url.searchParams.get("token");
    if (token && token !== job.downloadToken) {
      return NextResponse.json(
        { error: "Invalid or expired download authorization token." },
        { status: 403 }
      );
    }

    const mime = MIME_MAP[job.fileFormat] || "application/octet-stream";
    const baseName = job.fileName.replace(/\.[^/.]+$/, "");
    const downloadFileName = `${baseName}_translated_${job.targetLang}.${job.fileFormat}`;

    return new NextResponse(new Uint8Array(job.translatedBuffer), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${downloadFileName}"`,
        "Content-Length": job.translatedBuffer.length.toString(),
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
