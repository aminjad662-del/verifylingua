import { NextRequest, NextResponse } from "next/server";
import { createBatchJob, executeBatchJob, getAllBatchJobs, BatchItemInput } from "@/lib/batch";

export async function GET() {
  const batches = getAllBatchJobs();
  return NextResponse.json({ batches });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const items: BatchItemInput[] = [];
    const fileBuffers = new Map<string, Buffer>();
    let batchName = "Batch Translation";
    let targetLang = "en";
    let serviceTier: "automated" | "professional" | "certified" = "automated";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      batchName = (formData.get("name") as string) || batchName;
      targetLang = (formData.get("targetLang") as string) || targetLang;
      serviceTier = ((formData.get("serviceTier") as string) as any) || serviceTier;

      const files = formData.getAll("files") as File[];
      for (const f of files) {
        const arrayBuf = await f.arrayBuffer();
        const buf = Buffer.from(arrayBuf);
        items.push({
          fileName: f.name,
          fileBuffer: buf,
          targetLang,
          serviceTier,
        });
        fileBuffers.set(f.name, buf);
      }
    } else {
      const body = await req.json();
      batchName = body.name || batchName;
      targetLang = body.targetLang || targetLang;
      serviceTier = body.serviceTier || serviceTier;

      if (!Array.isArray(body.files) || body.files.length === 0) {
        return NextResponse.json({ error: "Invalid payload: 'files' array required." }, { status: 400 });
      }

      for (const f of body.files) {
        const buf = Buffer.from(f.contentBase64, "base64");
        items.push({
          fileName: f.name,
          fileBuffer: buf,
          sourceLang: f.sourceLang,
          targetLang: f.targetLang || targetLang,
          serviceTier: f.serviceTier || serviceTier,
        });
        fileBuffers.set(f.name, buf);
      }
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "No files provided in batch request." }, { status: 400 });
    }

    const batch = createBatchJob(batchName, items, targetLang, serviceTier);
    for (const item of batch.items) {
      const b = fileBuffers.get(item.fileName);
      if (b) fileBuffers.set(item.id, b);
    }

    // Execute batch processing
    const processed = await executeBatchJob(batch.id, fileBuffers);

    return NextResponse.json({
      success: true,
      batch: processed,
      downloadUrl: `/api/batch/${batch.id}/download`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process batch." },
      { status: 500 }
    );
  }
}
