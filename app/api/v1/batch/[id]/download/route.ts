import { NextRequest, NextResponse } from "next/server";
import { generateBatchZipBundle, getBatchJob } from "@/lib/batch";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const batch = getBatchJob(id);

    if (!batch) {
      return NextResponse.json({ error: `Batch job '${id}' not found.` }, { status: 404 });
    }

    const zipBuffer = await generateBatchZipBundle(id);

    return new NextResponse(zipBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${batch.id}-translations.zip"`,
        "Content-Length": zipBuffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate batch zip bundle." },
      { status: 500 }
    );
  }
}
