import { NextRequest, NextResponse } from "next/server";
import { generateCertificatePdf } from "@/lib/certificate";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Build standard certified certificate parameters
    const pdfBytes = await generateCertificatePdf({
      verifyCode: code,
      orderCode: code.replace("CERT-", "VL-").slice(0, 8),
      translatorName: "Elena V.",
      translatorCredentials: "ATA Member No. 271892 • Certified Legal Translator",
      sourceLanguage: "Spanish",
      targetLanguage: "English",
      pageCount: 1,
      documentName: "Acta de Nacimiento (Birth Certificate)",
      documentSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      receivingParty: "USCIS",
      issuedAt: new Date(),
    });

    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="VerifyLingua-Certificate-${code}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF certificate generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate PDF", details: error.message },
      { status: 500 }
    );
  }
}
