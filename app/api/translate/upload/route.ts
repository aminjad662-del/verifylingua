import { NextRequest, NextResponse } from "next/server";
import { validateInputFile, processTranslationJob } from "@/lib/translation/pipeline";
import { createTranslationJob, updateTranslationJob } from "@/lib/translation/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let fileName = "";
    let fileBuffer: Buffer | null = null;
    let sourceLang = "es";
    let targetLang = "en";
    let serviceTier: "automated" | "professional" | "certified" = "automated";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "No file was provided in the upload request." },
          { status: 400 }
        );
      }
      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      sourceLang = (formData.get("sourceLang") as string) || "es";
      targetLang = (formData.get("targetLang") as string) || "en";
      serviceTier = ((formData.get("serviceTier") as string) as any) || "automated";
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      fileName = body.fileName || "document.pdf";
      sourceLang = body.sourceLang || "es";
      targetLang = body.targetLang || "en";
      serviceTier = body.serviceTier || "automated";

      if (body.fileBase64) {
        fileBuffer = Buffer.from(body.fileBase64, "base64");
      } else {
        return NextResponse.json(
          { error: "Missing fileBase64 data in JSON payload." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported Content-Type. Use multipart/form-data or application/json." },
        { status: 400 }
      );
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json(
        { error: "The provided file data is empty (0 bytes)." },
        { status: 400 }
      );
    }

    // 1. Validation & MIME sniffing
    const validation = validateInputFile(fileBuffer, fileName);
    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 2. Create job in queue
    const job = createTranslationJob({
      fileName,
      fileFormat: validation.format,
      fileSize: fileBuffer.length,
      sourceLang,
      targetLang,
      originalBuffer: fileBuffer,
    });
    job.serviceTier = serviceTier;

    // 3. Kick off asynchronous layout-preserving translation
    processTranslationJob(job, {
      sourceLang,
      targetLang,
      serviceTier,
      register: serviceTier === "automated" ? "general" : "certified_legal",
    })
      .then((updated) => {
        updateTranslationJob(updated);
      })
      .catch((err) => {
        job.status = "failed";
        job.error = err.message;
        updateTranslationJob(job);
      });

    return NextResponse.json(
      {
        success: true,
        jobId: job.id,
        fileName: job.fileName,
        fileFormat: job.fileFormat,
        fileSize: job.fileSize,
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        downloadToken: job.downloadToken,
      },
      { status: 202 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to initiate document translation." },
      { status: 500 }
    );
  }
}
