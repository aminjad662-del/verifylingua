import { NextRequest, NextResponse } from "next/server";
import { analyzeDocumentOCR } from "@/lib/ocr/service";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let buffer: Buffer | null = null;
    let fileName = "document.pdf";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file uploaded in form data" },
          { status: 400 }
        );
      }
      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      let body: any = {};
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid JSON payload" },
          { status: 400 }
        );
      }

      if (body.fileBase64) {
        buffer = Buffer.from(body.fileBase64, "base64");
      }
      if (body.fileName) {
        fileName = body.fileName;
      }
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Empty or missing file buffer" },
        { status: 400 }
      );
    }

    const result = await analyzeDocumentOCR(buffer, fileName);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API OCR Analyze] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process document OCR",
      },
      { status: 500 }
    );
  }
}
