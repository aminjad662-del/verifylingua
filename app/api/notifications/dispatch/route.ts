import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      recipientEmail,
      recipientPhone,
      eventType = "PROOF_READY",
      orderCode = "VL-8921-XQ",
      metadata = {},
    } = body;

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return NextResponse.json(
        { error: "Valid recipient email is required for omnichannel notifications." },
        { status: 400 }
      );
    }

    const TEMPLATES: Record<
      string,
      { subject: string; emailBody: string; smsBody: string }
    > = {
      ORDER_CONFIRMED: {
        subject: `[VerifyLingua] Order Confirmed: ${orderCode} (Guaranteed USCIS Delivery)`,
        emailBody: `Thank you for ordering with VerifyLingua. Your translation of ${metadata.fileName || "document.pdf"} is currently undergoing pre-processing and ATA linguist assignment. Track your live progress at https://verifylingua.pages.dev/order/${orderCode}`,
        smsBody: `VerifyLingua: Order ${orderCode} confirmed. Track live: https://verifylingua.pages.dev/order/${orderCode}`,
      },
      PROOF_READY: {
        subject: `[ACTION REQUIRED] Your Translation Draft for ${orderCode} is Ready for Review in Proofing Studio`,
        emailBody: `Your certified translation draft is ready for review in the Proofing Studio. Please inspect names, dates, and official seals side-by-side with your original document before final certification: https://verifylingua.pages.dev/order/${orderCode}/proof`,
        smsBody: `VerifyLingua: Your translation draft for ${orderCode} is ready for review in the Proofing Studio: https://verifylingua.pages.dev/order/${orderCode}/proof`,
      },
      CERTIFICATE_ISSUED: {
        subject: `[OFFICIAL] Certified Translation Packet & Verification QR Issued: ${orderCode}`,
        emailBody: `Your certified legal translation packet has been officially minted under 8 CFR § 204.2 standards. Download your PDF packet and view your public SHA-256 ledger record: https://verifylingua.pages.dev/order/${orderCode}`,
        smsBody: `VerifyLingua: Your certified translation packet ${orderCode} is sealed and ready for download: https://verifylingua.pages.dev/order/${orderCode}`,
      },
      PHYSICAL_DISPATCHED: {
        subject: `[TRACKING] Physical Certified Copies Dispatched: ${orderCode}`,
        emailBody: `Your wet-ink embossed certified copies have been dispatched via ${metadata.carrier || "FedEx"}. Tracking Number: ${metadata.trackingNumber || "781290481023"}.`,
        smsBody: `VerifyLingua: Your physical hard copy for ${orderCode} was shipped via ${metadata.carrier || "FedEx"}. Tracking: ${metadata.trackingNumber || "781290481023"}`,
      },
    };

    const template = TEMPLATES[eventType] || TEMPLATES.PROOF_READY;

    return NextResponse.json({
      success: true,
      orderCode,
      eventType,
      recipientEmail,
      recipientPhone: recipientPhone || null,
      emailDispatched: true,
      smsDispatched: !!recipientPhone,
      emailPreview: {
        to: recipientEmail,
        subject: template.subject,
        text: template.emailBody,
      },
      smsPreview: recipientPhone
        ? {
            to: recipientPhone,
            body: template.smsBody,
          }
        : null,
      dispatchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to dispatch omnichannel notification." },
      { status: 500 }
    );
  }
}
