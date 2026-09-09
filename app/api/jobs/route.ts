import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createPersistentJob } from "@/lib/translation/persistent-store";
import { generatePresignedUploadUrl } from "@/lib/storage";
import { executeAutonomousDocumentPipeline } from "@/lib/inngest/functions";

export const dynamic = "force-dynamic";

const ALLOWED_TARGET_LANGS = new Set([
  "en", "es", "fr", "ar", "de", "it", "pt", "pt-br", "ru", "zh", "ja", "ko", "nl", "pl", "uk", "tr", "vi"
]);

const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "png", "jpg", "jpeg"]);

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const contentType = req.headers.get("content-type") || "";

    // -- Mode A: Direct multipart/form-data upload ----------------------
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const targetLang = ((formData.get("targetLang") as string) || "en").toLowerCase().trim();
      const sourceLang = ((formData.get("sourceLang") as string) || "auto").toLowerCase().trim();

      if (!file) {
        return NextResponse.json({ error: "No document file provided." }, { status: 400 });
      }

      if (!ALLOWED_TARGET_LANGS.has(targetLang)) {
        return NextResponse.json({ error: `Unsupported target language: ${targetLang}` }, { status: 400 });
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json({ error: `Unsupported format .${ext}. Allowed: PDF, DOCX, PNG, JPG` }, { status: 400 });
      }

      const MAX_SIZE = 50 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "File exceeds 50MB size limit." }, { status: 413 });
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());

      let format: "pdf" | "docx" | "png" | "jpg" = "pdf";
      if (ext === "docx") format = "docx";
      else if (ext === "png") format = "png";
      else if (ext === "jpg" || ext === "jpeg") format = "jpg";

      const job = await createPersistentJob({
        userId: user?.id || null,
        filename: file.name,
        format,
        mimeType: file.type || "application/octet-stream",
        sourceLang: sourceLang === "auto" ? undefined : sourceLang,
        targetLang,
        fileBuffer,
      });

      // Dispatch async autonomous processing pipeline
      await executeAutonomousDocumentPipeline(job.id);

      return NextResponse.json(
        {
          jobId: job.id,
          status: "uploaded",
          sourceFilename: job.sourceFilename,
          format: job.sourceFormat,
          targetLanguage: job.targetLanguage,
          currentStep: job.currentStep,
          progress: job.progress,
        },
        { status: 202 }
      );
    }

    // -- Mode B: Signed storage upload URL allocation (JSON payload) ----
    const body = await req.json();
    const filename = (body.filename || "").trim();
    const targetLanguage = ((body.targetLanguage || "en") as string).toLowerCase().trim();
    const sourceLanguage = ((body.sourceLanguage || "auto") as string).toLowerCase().trim();
    const fileSize = Number(body.fileSize || 0);

    if (!filename) {
      return NextResponse.json({ error: "filename is required." }, { status: 400 });
    }

    if (!ALLOWED_TARGET_LANGS.has(targetLanguage)) {
      return NextResponse.json({ error: `Unsupported target language: ${targetLanguage}` }, { status: 400 });
    }

    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: `Unsupported format .${ext}. Allowed: PDF, DOCX, PNG, JPG` }, { status: 400 });
    }

    const MAX_SIZE = 50 * 1024 * 1024;
    if (fileSize > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds 50MB limit." }, { status: 413 });
    }

    let format: "pdf" | "docx" | "png" | "jpg" = "pdf";
    let mimeType = "application/pdf";
    if (ext === "docx") {
      format = "docx";
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (ext === "png") {
      format = "png";
      mimeType = "image/png";
    } else if (ext === "jpg" || ext === "jpeg") {
      format = "jpg";
      mimeType = "image/jpeg";
    }

    const job = await createPersistentJob({
      userId: user?.id || null,
      filename,
      format,
      mimeType,
      sourceLang: sourceLanguage === "auto" ? undefined : sourceLanguage,
      targetLang: targetLanguage,
    });

    const uploadUrl = await generatePresignedUploadUrl(job.sourceKey, mimeType);

    return NextResponse.json(
      {
        jobId: job.id,
        uploadUrl,
        status: "uploading",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating translation job:", err);
    return NextResponse.json({ error: err.message || "Failed to create translation job." }, { status: 500 });
  }
}
