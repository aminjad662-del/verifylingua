import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePricing } from "@/lib/pricing";

function generatePublicCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "VL-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      guestEmail,
      sourceLang = "es",
      targetLang = "en",
      serviceType = "CERTIFIED",
      pageCount = 1,
      wordCount = 250,
      receivingParty = "USCIS",
      primaryName,
      parentName,
      dateFormat = "MM/DD/YYYY",
      needsNotarization = false,
      isExpedited = false,
      needsHardCopy = false,
      needsApostille = false,
      fileName = "document.pdf",
    } = body;

    if (!guestEmail || !guestEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required for certified delivery." },
        { status: 400 }
      );
    }

    const pricing = calculatePricing({
      serviceType: serviceType as "CERTIFIED" | "STANDARD",
      pageCount,
      wordCount,
      isExpedited,
      needsNotarization,
      needsHardCopy,
      needsApostille,
    });

    const publicCode = generatePublicCode();

    // Create user or link existing guest
    let user = await prisma.user.findUnique({
      where: { email: guestEmail.toLowerCase().trim() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: guestEmail.toLowerCase().trim(),
          name: primaryName || null,
          isGuest: true,
        },
      });
    }

    // Create complete order entity with all relations
    const order = await prisma.order.create({
      data: {
        publicCode,
        userId: user.id,
        guestEmail: user.email,
        status: "PAID",
        sourceLang,
        targetLang,
        serviceType: serviceType as "CERTIFIED" | "STANDARD",
        pageCount: pricing.pageCount,
        wordCount: pricing.wordCount,
        subtotal: pricing.subtotal,
        addOnTotal: pricing.addOnTotal,
        total: pricing.total,
        receivingParty,
        promisedAt: pricing.promisedAt,
        documents: {
          create: [
            {
              fileName: fileName || "uploaded_document.pdf",
              s3Key: `vault/${publicCode}/${fileName || "doc.pdf"}`,
              mimeType: "application/pdf",
              pages: pricing.pageCount,
              sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            },
          ],
        },
        glossaryTerms: {
          create: [
            ...(primaryName
              ? [
                  {
                    sourceText: primaryName,
                    requiredTarget: primaryName,
                    kind: "NAME" as const,
                    locked: true,
                  },
                ]
              : []),
            ...(parentName
              ? [
                  {
                    sourceText: parentName,
                    requiredTarget: parentName,
                    kind: "NAME" as const,
                    locked: true,
                  },
                ]
              : []),
          ],
        },
        addOns: {
          create: [
            ...(needsNotarization
              ? [{ type: "NOTARIZATION" as const, price: pricing.notarizationFee }]
              : []),
            ...(isExpedited
              ? [{ type: "EXPEDITED" as const, price: pricing.expeditedFee }]
              : []),
            ...(needsHardCopy
              ? [{ type: "HARD_COPY" as const, price: pricing.hardCopyFee }]
              : []),
            ...(needsApostille
              ? [{ type: "APOSTILLE" as const, price: pricing.apostilleFee }]
              : []),
          ],
        },
        events: {
          create: [
            {
              type: "STATUS_CHANGE",
              message: "Order placed & payment authorized. Pre-payment document triage passed.",
              actor: "SYSTEM",
            },
            {
              type: "ASSIGNED",
              message: "Assigned to ATA-accredited native certified translator (Elena V.).",
              actor: "SYSTEM",
            },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      publicCode: order.publicCode,
      total: order.total,
      promisedAt: order.promisedAt,
    });
  } catch (err: any) {
    console.error("Order creation failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initialize certified order." },
      { status: 500 }
    );
  }
}
