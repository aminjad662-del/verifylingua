import { NextRequest, NextResponse } from "next/server";
import { generateReceiptPdf } from "@/lib/receipt";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const publicCode = id.toUpperCase();

    // Look up in database or use standard fallback for mock orders
    let orderInfo: any = null;
    try {
      const queryPromise = prisma.order.findFirst({
        where: { OR: [{ id }, { publicCode }] },
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB_TIMEOUT")), 300)
      );
      orderInfo = await Promise.race([queryPromise, timeoutPromise]);
    } catch {
      // ignore in dev without db
    }

    const documentName =
      orderInfo?.documentName ||
      (publicCode.includes("7X9K2")
        ? "Acta de Nacimiento (Birth Certificate)"
        : publicCode.includes("3M8Q1")
        ? "Título Universitario (Bachelor Diploma)"
        : "Certified USCIS Document Translation");

    const matterNumber =
      orderInfo?.matterNumber ||
      (publicCode.includes("7X9K2")
        ? "USCIS-I485-8910"
        : "MAT-2026-IMMIG");

    const pages = orderInfo?.pages || (publicCode.includes("3M8Q1") ? 2 : 1);
    const total = orderInfo?.total || (publicCode.includes("3M8Q1") ? 49.9 : 24.95);

    const pdfBytes = await generateReceiptPdf({
      orderId: id,
      publicCode,
      documentName,
      matterNumber,
      sourceLang: orderInfo?.sourceLang || "Spanish",
      targetLang: orderInfo?.targetLang || "English",
      pages,
      total,
      clientName: orderInfo?.clientName || "Client Legal Account",
      date: "August 28, 2026",
      paymentMethod: "Card (Visa ending in 4242)",
      linguist: orderInfo?.translator || "Elena V. (ATA No. 271892)",
    });

    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="VerifyLingua-Receipt-${publicCode}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Receipt generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt PDF", details: error.message },
      { status: 500 }
    );
  }
}
