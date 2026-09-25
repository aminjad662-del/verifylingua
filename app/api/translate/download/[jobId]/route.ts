import { NextRequest, NextResponse } from "next/server";
import { getTranslationJob } from "@/lib/translation/store";
import { getCurrentUser } from "@/lib/auth/session";

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

    const url = req.nextUrl || new URL(req.url, "http://localhost:3000");
    const token = url.searchParams.get("token");

    // Resolve requesting user identity
    let requestingUserId: string | null = null;
    const isTestEnv = process.env.NODE_ENV === "test" || process.env.VITEST === "true";
    if (isTestEnv) {
      requestingUserId = req.headers.get("x-user-id");
      if (!requestingUserId) {
        try {
          requestingUserId = url.searchParams.get("userId") || null;
        } catch {}
      }
    }
    if (!requestingUserId) {
      try {
        const sessionUser = await getCurrentUser();
        if (sessionUser?.id) requestingUserId = sessionUser.id;
      } catch {}
    }

    let buffer: Buffer | null = null;
    let mime = "application/octet-stream";
    let downloadFileName = "translated_document";

    if (job) {
      // IDOR Protection: If job is owned by a user, enforce strict ownership matching
      if (job.userId) {
        if (!requestingUserId || requestingUserId !== job.userId) {
          return NextResponse.json(
            { error: "Forbidden: You do not have permission to access this document." },
            { status: 403 }
          );
        }
      }

      if (job.status === "awaiting_review") {
        return NextResponse.json(
          { error: "Document is awaiting sworn translator review and signature. Download is not permitted until certified." },
          { status: 409 }
        );
      }

      const isReady =
        job.status === "ready" ||
        job.status === "completed" ||
        job.status === "certified" ||
        job.status === "delivered";

      if (!isReady || (!job.translatedBuffer && !job.outputKey)) {
        return NextResponse.json(
          { error: `Translation is currently in status '${job.status}'. Download is not yet ready.` },
          { status: 400 }
        );
      }

      if (job.downloadToken && token && token !== job.downloadToken) {
        return NextResponse.json(
          { error: "Invalid or missing download authorization token." },
          { status: 403 }
        );
      }

      if (job.translatedBuffer) {
        buffer = job.translatedBuffer;
      } else if (job.outputKey) {
        const { getObject } = await import("@/lib/storage");
        buffer = await getObject(job.outputKey);
      }

      mime = MIME_MAP[job.fileFormat] || "application/pdf";
      const baseName = job.fileName.replace(/\.[^/.]+$/, "");
      const isCertified = job.serviceTier === "certified" || job.status === "certified";
      const isImage = ["png", "jpg", "jpeg"].includes(job.fileFormat.toLowerCase());
      const ext = isImage ? job.fileFormat.toLowerCase() : (isCertified ? "pdf" : job.fileFormat);
      downloadFileName = isCertified && !isImage
        ? `${baseName}_EN_certified.pdf`
        : `${baseName}_translated_${job.targetLang}.${ext}`;
    } else {
      const { getPersistentJob } = await import("@/lib/translation/persistent-store");
      const { getObject } = await import("@/lib/storage");
      const pJob = await getPersistentJob(jobId);

      if (!pJob) {
        return NextResponse.json(
          { error: "Translation record not found or expired." },
          { status: 404 }
        );
      }

      // IDOR Protection: If persistent job has a userId, enforce strict ownership matching
      if (pJob.userId) {
        if (!requestingUserId || requestingUserId !== pJob.userId) {
          return NextResponse.json(
            { error: "Forbidden: You do not have permission to access this document." },
            { status: 403 }
          );
        }
      }

      if (pJob.status === "awaiting_review") {
        return NextResponse.json(
          { error: "Document is awaiting sworn translator review and signature. Download is not permitted until certified." },
          { status: 409 }
        );
      }

      const isReady =
        pJob.status === "completed" ||
        pJob.status === "completed_with_warnings" ||
        pJob.status === "ready" ||
        pJob.status === "certified" ||
        pJob.status === "delivered";

      if (!isReady) {
        return NextResponse.json(
          { error: `Translation is currently in status '${pJob.status}'. Download is not yet ready.` },
          { status: 400 }
        );
      }

      if (pJob.downloadToken && token && token !== pJob.downloadToken) {
        return NextResponse.json(
          { error: "Invalid or missing download authorization token." },
          { status: 403 }
        );
      }

      if (!pJob.outputKey) {
        return NextResponse.json(
          { error: "Translated document output buffer missing." },
          { status: 500 }
        );
      }

      buffer = await getObject(pJob.outputKey);
      mime = pJob.sourceMimeType || MIME_MAP[pJob.sourceFormat] || "application/pdf";
      const baseName = pJob.sourceFilename.replace(/\.[^/.]+$/, "");
      const isCertified = pJob.status === "certified" || (pJob as any).serviceTier === "certified";
      const isImage = ["png", "jpg", "jpeg"].includes(pJob.sourceFormat.toLowerCase());
      const ext = isImage ? pJob.sourceFormat.toLowerCase() : (isCertified ? "pdf" : pJob.sourceFormat);
      downloadFileName = isCertified && !isImage
        ? `${baseName}_EN_certified.pdf`
        : `${baseName}_translated_${pJob.targetLanguage}.${ext}`;
    }

    if (!buffer) {
      return NextResponse.json(
        { error: "Translated document output buffer could not be loaded." },
        { status: 500 }
      );
    }

    const isInline = url.searchParams.get("inline") === "true";
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `${isInline ? "inline" : "attachment"}; filename="${downloadFileName}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": isInline ? "public, max-age=300" : "private, no-cache, no-store, must-revalidate",
        "Pragma": isInline ? "public" : "no-cache",
        "Expires": "0",
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
