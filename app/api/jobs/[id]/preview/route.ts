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
      const upperId = (id || "").toUpperCase();
      if (
        id === "demo" ||
        upperId.startsWith("VL-DEMO") ||
        upperId === "VL-8921-XQ" ||
        upperId === "VL-9104-MN"
      ) {
        const { PDFDocument } = await import("pdf-lib");
        const demoDoc = await PDFDocument.create();
        const page = demoDoc.addPage([612, 792]);
        page.drawText("VerifyLingua — Certified Legal Translation Sample Preview", {
          x: 50,
          y: 720,
          size: 16,
        });
        page.drawText("Certified under USCIS 8 CFR § 103.2 Standards • ATA Accredited #271892", {
          x: 50,
          y: 695,
          size: 10,
        });
        const demoPdfBytes = await demoDoc.save();

        return new NextResponse(demoPdfBytes as any, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="preview_${id}.pdf"`,
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        });
      }

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
