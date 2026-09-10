import { NextRequest, NextResponse } from "next/server";
import { getBatchJob } from "@/lib/batch";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const batch = getBatchJob(id);

  if (!batch) {
    return NextResponse.json({ error: `Batch job '${id}' not found.` }, { status: 404 });
  }

  // Sanitize by omitting raw outputBuffers from JSON response
  const sanitized = {
    ...batch,
    items: batch.items.map((item) => ({
      ...item,
      outputBuffer: undefined,
    })),
    downloadUrl: `/api/batch/${batch.id}/download`,
  };

  return NextResponse.json({ success: true, batch: sanitized });
}
