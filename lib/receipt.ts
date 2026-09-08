import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface ReceiptData {
  orderId: string;
  publicCode: string;
  documentName: string;
  matterNumber?: string;
  sourceLang: string;
  targetLang: string;
  pages: number;
  total: number;
  clientName?: string;
  date?: string;
  paymentMethod?: string;
  linguist?: string;
}

export async function generateReceiptPdf(data: ReceiptData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // Standard US Letter

  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const courier = await doc.embedFont(StandardFonts.Courier);

  // Palette colors (RGB 0-1)
  const ink = rgb(0.04, 0.15, 0.25); // #0A2540
  const amber = rgb(0.71, 0.33, 0.04); // #B45309
  const textMuted = rgb(0.35, 0.40, 0.48);
  const borderGrey = rgb(0.85, 0.87, 0.91);
  const bgLight = rgb(0.98, 0.97, 0.95); // warm paper

  // Header Box
  page.drawRectangle({
    x: 40,
    y: 710,
    width: 532,
    height: 52,
    color: bgLight,
    borderColor: borderGrey,
    borderWidth: 1,
  });

  page.drawText("VERIFYLINGUA • OFFICIAL PAYMENT RECEIPT", {
    x: 56,
    y: 738,
    size: 11,
    font: helveticaBold,
    color: ink,
  });

  page.drawText("Certified Legal Translation & USCIS Notarial Filing Division", {
    x: 56,
    y: 722,
    size: 9,
    font: helvetica,
    color: textMuted,
  });

  page.drawText("PAID IN FULL", {
    x: 480,
    y: 730,
    size: 11,
    font: helveticaBold,
    color: amber,
  });

  // Receipt Meta Grid
  let y = 670;
  page.drawText("RECEIPT DETAILS", {
    x: 40,
    y,
    size: 10,
    font: helveticaBold,
    color: ink,
  });

  y -= 20;
  page.drawText(`Receipt Number: REC-${data.publicCode}-2026`, {
    x: 40,
    y,
    size: 9,
    font: courier,
    color: ink,
  });
  page.drawText(`Order Reference: ${data.publicCode}`, {
    x: 320,
    y,
    size: 9,
    font: courier,
    color: ink,
  });

  y -= 16;
  page.drawText(`Date of Issue: ${data.date || "August 28, 2026"}`, {
    x: 40,
    y,
    size: 9,
    font: helvetica,
    color: textMuted,
  });
  page.drawText(`Matter / Case ID: ${data.matterNumber || "USCIS-FILING-DEFAULT"}`, {
    x: 320,
    y,
    size: 9,
    font: courier,
    color: textMuted,
  });

  y -= 16;
  page.drawText(`Billed To: ${data.clientName || "Client Account"}`, {
    x: 40,
    y,
    size: 9,
    font: helvetica,
    color: textMuted,
  });
  page.drawText(`Payment Method: ${data.paymentMethod || "Credit Card (Stripe Auth)"}`, {
    x: 320,
    y,
    size: 9,
    font: helvetica,
    color: textMuted,
  });

  // Table Line
  y -= 25;
  page.drawLine({
    start: { x: 40, y },
    end: { x: 572, y },
    thickness: 1,
    color: borderGrey,
  });

  // Table Header
  y -= 18;
  page.drawText("ITEM DESCRIPTION", { x: 40, y, size: 9, font: helveticaBold, color: ink });
  page.drawText("PAGES", { x: 380, y, size: 9, font: helveticaBold, color: ink });
  page.drawText("AMOUNT (USD)", { x: 480, y, size: 9, font: helveticaBold, color: ink });

  y -= 10;
  page.drawLine({
    start: { x: 40, y },
    end: { x: 572, y },
    thickness: 1,
    color: borderGrey,
  });

  // Line Items
  y -= 22;
  page.drawText(`Certified Translation: ${data.documentName}`, {
    x: 40,
    y,
    size: 9,
    font: helveticaBold,
    color: ink,
  });
  page.drawText(String(data.pages), { x: 395, y, size: 9, font: helvetica, color: ink });
  page.drawText(`$${data.total.toFixed(2)}`, { x: 500, y, size: 9, font: courier, color: ink });

  y -= 14;
  page.drawText(`Language Pair: ${data.sourceLang} to ${data.targetLang}`, {
    x: 52,
    y,
    size: 8,
    font: helvetica,
    color: textMuted,
  });

  y -= 14;
  page.drawText(`Sworn Competence Affidavit (8 CFR 103.2) & Cryptographic Seal`, {
    x: 52,
    y,
    size: 8,
    font: helvetica,
    color: textMuted,
  });

  if (data.linguist) {
    y -= 14;
    page.drawText(`Accredited Linguist: ${data.linguist}`, {
      x: 52,
      y,
      size: 8,
      font: helvetica,
      color: textMuted,
    });
  }

  y -= 30;
  page.drawLine({
    start: { x: 40, y },
    end: { x: 572, y },
    thickness: 1,
    color: borderGrey,
  });

  // Summary
  y -= 22;
  page.drawText("Subtotal:", { x: 380, y, size: 9, font: helvetica, color: textMuted });
  page.drawText(`$${data.total.toFixed(2)}`, { x: 500, y, size: 9, font: courier, color: ink });

  y -= 16;
  page.drawText("Sales Tax (Legal Services):", { x: 380, y, size: 9, font: helvetica, color: textMuted });
  page.drawText("$0.00", { x: 500, y, size: 9, font: courier, color: ink });

  y -= 20;
  page.drawRectangle({
    x: 360,
    y: y - 8,
    width: 212,
    height: 30,
    color: bgLight,
    borderColor: borderGrey,
    borderWidth: 1,
  });

  page.drawText("TOTAL PAID:", { x: 375, y: y + 2, size: 10, font: helveticaBold, color: ink });
  page.drawText(`$${data.total.toFixed(2)} USD`, { x: 475, y: y + 2, size: 10, font: courier, color: amber });

  // Legal & Institutional Acceptance Notice
  y -= 80;
  page.drawRectangle({
    x: 40,
    y: y - 50,
    width: 532,
    height: 70,
    color: bgLight,
    borderColor: borderGrey,
    borderWidth: 1,
  });

  page.drawText("USCIS & INSTITUTIONAL ACCEPTANCE NOTICE", {
    x: 56,
    y: y + 4,
    size: 8.5,
    font: helveticaBold,
    color: ink,
  });

  page.drawText(
    "VerifyLingua translations are guaranteed compliant with 8 CFR 103.2(b)(3) for immigration proceedings,",
    { x: 56, y: y - 10, size: 8, font: helvetica, color: textMuted }
  );
  page.drawText(
    "federal and state courts, and NACES-affiliated academic evaluations. Keep this receipt for legal expense accounting.",
    { x: 56, y: y - 22, size: 8, font: helvetica, color: textMuted }
  );
  page.drawText(
    "VerifyLingua LLC • Corporate Member, American Translators Association (ATA)",
    { x: 56, y: y - 36, size: 8, font: helveticaBold, color: ink }
  );

  return await doc.save();
}
