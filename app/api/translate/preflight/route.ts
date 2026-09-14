import { NextRequest, NextResponse } from "next/server";
import {
  analyzeDocumentPreflight,
  validateMvpLanguagePair,
  detectNonLatinScriptRatio,
} from "@/lib/preflight";
import { MVP_LANGUAGE_CODES } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let buffer: Buffer | null = null;
    let fileName = "document.pdf";
    let sourceLang: string | undefined;
    let targetLang: string | undefined;
    let sampleText: string | undefined;
    let pageCount: number | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (file) {
        fileName = file.name;
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      }
      sourceLang = (formData.get("sourceLang") as string | null) || undefined;
      targetLang = (formData.get("targetLang") as string | null) || undefined;
      sampleText = (formData.get("sampleText") as string | null) || undefined;
      const pageCountRaw = formData.get("pageCount");
      if (pageCountRaw) {
        pageCount = parseInt(pageCountRaw.toString(), 10);
      }
    } else {
      let body: any = {};
      try {
        body = await req.json();
      } catch {
        body = {};
      }
      if (body.fileBase64) {
        buffer = Buffer.from(body.fileBase64, "base64");
      }
      if (body.fileName) {
        fileName = body.fileName;
      }
      sourceLang = body.sourceLang;
      targetLang = body.targetLang;
      sampleText = body.sampleText;
      if (typeof body.pageCount === "number") {
        pageCount = body.pageCount;
      }
    }

    // Fallback to URL search parameters if not present in body/formData
    const url = new URL(req.url, "http://localhost:3000");
    const effectiveSourceLang = sourceLang || url.searchParams.get("sourceLang") || undefined;
    const effectiveTargetLang = targetLang || url.searchParams.get("targetLang") || undefined;
    const effectiveSampleText = sampleText || url.searchParams.get("sampleText") || undefined;
    const effectivePageCount =
      pageCount ??
      (url.searchParams.get("pageCount")
        ? parseInt(url.searchParams.get("pageCount")!, 10)
        : undefined);

    // 1. Validate page count pilot guardrail (<= 100 pages)
    if (effectivePageCount !== undefined && effectivePageCount > 100) {
      return NextResponse.json(
        {
          success: false,
          code: "DOC_TOO_LARGE",
          message:
            "Single document pilot limit is 100 pages. Please split your document or contact support.",
          error:
            "Single document pilot limit is 100 pages. Please split your document or contact support.",
        },
        { status: 400 }
      );
    }

    // 2. Validate language pair if both source and target are provided
    if (effectiveSourceLang && effectiveTargetLang) {
      const pairValidation = validateMvpLanguagePair(effectiveSourceLang, effectiveTargetLang);
      if (!pairValidation.valid) {
        return NextResponse.json(
          {
            supported: false,
            code: "UNSUPPORTED_LANGUAGE",
            message:
              "VerifyLingua MVP currently guarantees 100% layout preservation for English, Spanish, French, and German. Right-to-Left (RTL) and Asian scripts are launching in v1.1.",
            waitlistAffordance: true,
          },
          { status: 422 }
        );
      }
    } else if (effectiveSourceLang && !(MVP_LANGUAGE_CODES as readonly string[]).includes(effectiveSourceLang.toLowerCase().trim())) {
      return NextResponse.json(
        {
          supported: false,
          code: "UNSUPPORTED_LANGUAGE",
          message:
            "VerifyLingua MVP currently guarantees 100% layout preservation for English, Spanish, French, and German. Right-to-Left (RTL) and Asian scripts are launching in v1.1.",
          waitlistAffordance: true,
        },
        { status: 422 }
      );
    } else if (effectiveTargetLang && !(MVP_LANGUAGE_CODES as readonly string[]).includes(effectiveTargetLang.toLowerCase().trim())) {
      return NextResponse.json(
        {
          supported: false,
          code: "UNSUPPORTED_LANGUAGE",
          message:
            "VerifyLingua MVP currently guarantees 100% layout preservation for English, Spanish, French, and German. Right-to-Left (RTL) and Asian scripts are launching in v1.1.",
          waitlistAffordance: true,
        },
        { status: 422 }
      );
    }

    // 3. Deep script check on provided sample text
    if (effectiveSampleText && detectNonLatinScriptRatio(effectiveSampleText) > 0.10) {
      return NextResponse.json(
        {
          supported: false,
          code: "UNSUPPORTED_SCRIPT_DETECTED",
          message:
            "Document contains non-Latin or RTL script (Arabic, Hebrew, Cyrillic, or Asian characters). VerifyLingua MVP currently supports Latin-script LTR documents (English, Spanish, French, German). RTL and Asian scripts are launching in v1.1.",
          waitlistAffordance: true,
        },
        { status: 422 }
      );
    }

    // 4. If no buffer provided in payload
    if (!buffer) {
      return NextResponse.json(
        {
          success: false,
          error: contentType.includes("multipart/form-data")
            ? "No file provided in form data."
            : "Missing fileBase64 in request body.",
        },
        { status: 400 }
      );
    }

    // 5. Full document preflight analysis
    const analysis = await analyzeDocumentPreflight(buffer, fileName);

    // Validate parsed document page count
    if (analysis.pageCount > 100) {
      return NextResponse.json(
        {
          success: false,
          code: "DOC_TOO_LARGE",
          message:
            "Single document pilot limit is 100 pages. Please split your document or contact support.",
          error:
            "Single document pilot limit is 100 pages. Please split your document or contact support.",
        },
        { status: 400 }
      );
    }

    // Deep script check on extracted text from document
    const extractedText = analysis.sampleText || "";
    if (extractedText && detectNonLatinScriptRatio(extractedText) > 0.10) {
      return NextResponse.json(
        {
          supported: false,
          code: "UNSUPPORTED_SCRIPT_DETECTED",
          message:
            "Document contains non-Latin or RTL script (Arabic, Hebrew, Cyrillic, or Asian characters). VerifyLingua MVP currently supports Latin-script LTR documents (English, Spanish, French, German). RTL and Asian scripts are launching in v1.1.",
          waitlistAffordance: true,
        },
        { status: 422 }
      );
    }

    // Validate resolved language pair if target language was provided
    const resolvedSourceLang = effectiveSourceLang || analysis.detectedSourceLang;
    if (resolvedSourceLang && effectiveTargetLang) {
      const pairValidation = validateMvpLanguagePair(resolvedSourceLang, effectiveTargetLang);
      if (!pairValidation.valid) {
        return NextResponse.json(
          {
            supported: false,
            code: "UNSUPPORTED_LANGUAGE",
            message:
              "VerifyLingua MVP currently guarantees 100% layout preservation for English, Spanish, French, and German. Right-to-Left (RTL) and Asian scripts are launching in v1.1.",
            waitlistAffordance: true,
          },
          { status: 422 }
        );
      }
    }

    return NextResponse.json({ success: true, analysis });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to analyze document." },
      { status: 400 }
    );
  }
}
