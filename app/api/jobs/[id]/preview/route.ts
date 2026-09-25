import { NextRequest, NextResponse } from "next/server";
import { getPersistentJob } from "@/lib/translation/persistent-store";
import { getObject } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let binary: Buffer | null = null;
    let mime = "application/octet-stream";
    let filename = "preview_document";

    const job = await getPersistentJob(id);
    if (job && job.outputKey) {
      binary = await getObject(job.outputKey);
      mime = job.sourceMimeType || "application/octet-stream";
      filename = `preview_${job.sourceFilename}`;
    } else {
      const { getTranslationJob } = await import("@/lib/translation/store");
      const memJob = getTranslationJob(id);
      if (memJob) {
        if (memJob.translatedBuffer) {
          binary = memJob.translatedBuffer;
        } else if (memJob.outputKey) {
          binary = await getObject(memJob.outputKey);
        }
        mime = memJob.fileFormat === "png"
          ? "image/png"
          : memJob.fileFormat === "jpg"
          ? "image/jpeg"
          : "application/pdf";
        filename = `preview_${memJob.fileName}`;
      }
    }

    if (!binary) {
      return NextResponse.json({ error: "Preview not available." }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(binary), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err: any) {
    console.error("Preview error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate preview." }, { status: 500 });
  }
}
