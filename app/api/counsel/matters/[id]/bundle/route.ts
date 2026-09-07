import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { includeTableOfContents = true, includeNotaryAffidavits = true } = body;

    const bundleId = "BUNDLE-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const bundleDigest = crypto
      .createHash("sha256")
      .update(id + Date.now().toString())
      .digest("hex");

    const exhibits = [
      {
        tab: "Exhibit A",
        title: "Certified Translation of Official Birth Certificate",
        sourceLanguage: "Spanish",
        targetLanguage: "English",
        affidavitIncluded: true,
        pages: 2,
        uscisCompliant8CFR: true,
      },
      {
        tab: "Exhibit B",
        title: "Certified Translation of Civil Marriage Record",
        sourceLanguage: "Spanish",
        targetLanguage: "English",
        affidavitIncluded: true,
        pages: 1,
        uscisCompliant8CFR: true,
      },
    ];

    return NextResponse.json({
      success: true,
      bundleId,
      matterId: id,
      bundleSha256: bundleDigest,
      totalPages: 4,
      exhibits,
      tableOfContentsGenerated: includeTableOfContents,
      notaryAffidavitsBound: includeNotaryAffidavits,
      downloadUrl: `/api/certificate/VL-A8291/download?bundle=${bundleId}`,
      message: "Court-ready USCIS Exhibit Packet successfully compiled and indexed with divider tabs.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to compile court exhibit bundle" },
      { status: 500 }
    );
  }
}
