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
    const { getTranslationJob } = await import("@/lib/translation/store");
    const memJob = getTranslationJob(id);

    const format =
      job?.sourceFormat ||
      memJob?.fileFormat ||
      job?.sourceFilename?.split(".").pop()?.toLowerCase() ||
      memJob?.fileName?.split(".").pop()?.toLowerCase();

    if (format === "jpg" || format === "jpeg") {
      mime = "image/jpeg";
    } else if (format === "png") {
      mime = "image/png";
    } else if (job?.sourceMimeType && job.sourceMimeType !== "application/octet-stream") {
      mime = job.sourceMimeType;
    } else {
      mime = "application/pdf";
    }

    filename = `preview_${job?.sourceFilename || memJob?.fileName || "document"}`;

    if (memJob?.translatedBuffer) {
      binary = memJob.translatedBuffer;
    } else if (job?.outputKey) {
      binary = await getObject(job.outputKey);
    } else if (memJob?.outputKey) {
      binary = await getObject(memJob.outputKey);
    }

    if (!binary) {
      return NextResponse.json({ error: "Preview not available." }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(binary), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (err: any) {
    console.error("Preview error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate preview." }, { status: 500 });
  }
}
