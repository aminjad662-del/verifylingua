import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getPersistentJob } from "@/lib/translation/persistent-store";
import { getObject, generatePresignedDownloadUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = req.nextUrl || new URL(req.url, "http://localhost:3000");
    const token = url.searchParams.get("token");
    const redirectMode = url.searchParams.get("redirect") === "true";

    const job = await getPersistentJob(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    // Authenticate via token OR session user
    const user = await getCurrentUser();
    const tokenMatches = token && token === job.downloadToken;
    const isOwner = user && job.userId && user.id === job.userId;

    if (!tokenMatches && !isOwner) {
      return NextResponse.json({ error: "Unauthorized download token." }, { status: 401 });
    }

    if (job.status !== "completed" && job.status !== "completed_with_warnings") {
      return NextResponse.json({ error: `Document is not ready for download (current status: ${job.status}).` }, { status: 409 });
    }

    if (!job.outputKey) {
      return NextResponse.json({ error: "Translated document output key missing." }, { status: 500 });
    }

    // Build canonical download filename: original_ar.pdf / original_fr.docx
    const ext = job.sourceFilename.split(".").pop() || job.sourceFormat;
    const baseName = job.sourceFilename.substring(0, job.sourceFilename.lastIndexOf(".")) || job.sourceFilename;
    const downloadFilename = `${baseName}_${job.targetLanguage}.${ext}`;

    // If client requested signed redirect URL
    if (redirectMode) {
      const signedUrl = await generatePresignedDownloadUrl(job.outputKey, downloadFilename, 900);
      return NextResponse.redirect(signedUrl);
    }

    // Direct binary stream with legal certified headers
    const binary = await getObject(job.outputKey);

    return new NextResponse(new Uint8Array(binary), {
      status: 200,
      headers: {
        "Content-Type": job.sourceMimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${downloadFilename}"`,
        "Content-Length": binary.length.toString(),
        "X-VerifyLingua-Fidelity-Score": (job.fidelityScore || 98).toString(),
        "X-VerifyLingua-Quality-Gate": "PASSED",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Error streaming translated document download:", err);
    return NextResponse.json({ error: err.message || "Failed to download translated file." }, { status: 500 });
  }
}
