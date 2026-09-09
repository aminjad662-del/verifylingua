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
    const job = await getPersistentJob(id);
    if (!job || !job.outputKey) {
      return NextResponse.json({ error: "Preview not available." }, { status: 404 });
    }

    const binary = await getObject(job.outputKey);

    return new NextResponse(new Uint8Array(binary), {
      status: 200,
      headers: {
        "Content-Type": job.sourceMimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="preview_${job.sourceFilename}"`,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err: any) {
    console.error("Preview error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate preview." }, { status: 500 });
  }
}
