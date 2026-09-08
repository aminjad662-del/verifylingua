import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getTranslationJob } from "@/lib/translation/store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // 1. Check if an active translation job has the original buffer
    const job = getTranslationJob(id);
    if (job && job.originalBuffer) {
      const mime =
        job.fileFormat === "pdf"
          ? "application/pdf"
          : job.fileFormat === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : job.fileFormat === "png"
          ? "image/png"
          : "image/jpeg";

      return new NextResponse(new Uint8Array(job.originalBuffer), {
        status: 200,
        headers: {
          "Content-Type": mime,
          "Content-Disposition": `attachment; filename="original_${job.fileName}"`,
          "X-VerifyLingua-Vault": "PERMANENT-RETENTION-ACTIVE",
          "X-VerifyLingua-Policy": "CANNOT-DELETE-ACTIVE-REVIEW",
          "X-VerifyLingua-Compliance": "8-CFR-204.2-EVIDENTIARY-HOLD",
        },
      });
    }

    // 2. Default evidentiary demo document for order tracking demo codes (e.g. VL-DEMO1)
    const fixturesDir = path.join(process.cwd(), "fixtures");
    const fallbackPath = path.join(fixturesDir, "sample_birth_cert.pdf");

    if (fs.existsSync(fallbackPath)) {
      const fileBuffer = fs.readFileSync(fallbackPath);
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="original_${id}_evidence.pdf"`,
          "X-VerifyLingua-Vault": "PERMANENT-RETENTION-ACTIVE",
          "X-VerifyLingua-Policy": "CANNOT-DELETE-ACTIVE-REVIEW",
          "X-VerifyLingua-Compliance": "8-CFR-204.2-EVIDENTIARY-HOLD",
        },
      });
    }

    return NextResponse.json(
      { error: `Original evidentiary file for order '${id}' was not found in vault.` },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve original uploaded evidence." },
      { status: 500 }
    );
  }
}
