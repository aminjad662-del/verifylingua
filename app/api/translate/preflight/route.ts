import { NextRequest, NextResponse } from "next/server";
import { analyzeDocumentPreflight } from "@/lib/preflight";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let buffer: Buffer;
    let fileName: string = "document.pdf";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided in form data." }, { status: 400 });
      }
      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      const body = await req.json();
      if (!body.fileBase64) {
        return NextResponse.json({ error: "Missing fileBase64 in request body." }, { status: 400 });
      }
      buffer = Buffer.from(body.fileBase64, "base64");
      if (body.fileName) fileName = body.fileName;
    }

    const analysis = await analyzeDocumentPreflight(buffer, fileName);
    return NextResponse.json({ success: true, analysis });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to analyze document." },
      { status: 400 }
    );
  }
}
