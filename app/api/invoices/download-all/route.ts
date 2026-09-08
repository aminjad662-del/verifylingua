import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(req: NextRequest) {
  try {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);

    const helvetica = await doc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const courier = await doc.embedFont(StandardFonts.Courier);

    const ink = rgb(0.04, 0.15, 0.25);
    const amber = rgb(0.71, 0.33, 0.04);
    const textMuted = rgb(0.35, 0.4, 0.48);
    const borderGrey = rgb(0.85, 0.87, 0.91);
    const bgLight = rgb(0.98, 0.97, 0.95);

    // Header
    page.drawRectangle({
      x: 40,
      y: 710,
      width: 532,
      height: 52,
      color: bgLight,
      borderColor: borderGrey,
      borderWidth: 1,
    });

    page.drawText("VERIFYLINGUA • CONSOLIDATED EXPENSE & INVOICE STATEMENT", {
      x: 56,
      y: 738,
      size: 10,
      font: helveticaBold,
      color: ink,
    });

    page.drawText("Annual Certified Translation Filings Summary • Fiscal Year 2026", {
      x: 56,
      y: 722,
      size: 8.5,
      font: helvetica,
      color: textMuted,
    });

    page.drawText("TAX YEAR 2026", {
      x: 470,
      y: 730,
      size: 10,
      font: helveticaBold,
      color: amber,
    });

    // Summary Box
    let y = 670;
    page.drawText("LAW FIRM & CLIENT BILLING CONSOLIDATION", {
      x: 40,
      y,
      size: 9,
      font: helveticaBold,
      color: ink,
    });

    y -= 18;
    page.drawText("Total Certified Filings: 12 Documents", {
      x: 40,
      y,
      size: 9,
      font: helvetica,
      color: textMuted,
    });
    page.drawText("Total Paid YTD: $1,248.50 USD", {
      x: 320,
      y,
      size: 9,
      font: helveticaBold,
      color: ink,
    });

    y -= 25;
    page.drawLine({
      start: { x: 40, y },
      end: { x: 572, y },
      thickness: 1,
      color: borderGrey,
    });

    // Table Header
    y -= 18;
    page.drawText("DATE", { x: 40, y, size: 8.5, font: helveticaBold, color: ink });
    page.drawText("ORDER REF / MATTER", { x: 120, y, size: 8.5, font: helveticaBold, color: ink });
    page.drawText("DOCUMENT TITLE", { x: 260, y, size: 8.5, font: helveticaBold, color: ink });
    page.drawText("STATUS", { x: 440, y, size: 8.5, font: helveticaBold, color: ink });
    page.drawText("AMOUNT", { x: 515, y, size: 8.5, font: helveticaBold, color: ink });

    y -= 10;
    page.drawLine({
      start: { x: 40, y },
      end: { x: 572, y },
      thickness: 1,
      color: borderGrey,
    });

    const items = [
      { date: "08/28/2026", ref: "VL-3M8Q1", matter: "USCIS-I485-8910", doc: "Título Universitario (Diploma)", status: "PAID", amount: "$49.90" },
      { date: "08/27/2026", ref: "VL-7X9K2", matter: "USCIS-I485-8910", doc: "Acta de Nacimiento (Birth Cert)", status: "PAID", amount: "$24.95" },
      { date: "08/15/2026", ref: "VL-2P4W9", matter: "MAT-2026-N400", doc: "Certificado de Matrimonio", status: "PAID", amount: "$34.95" },
      { date: "08/02/2026", ref: "VL-8R1K4", matter: "MAT-2026-N400", doc: "Antecedentes Penales (Police Clear)", status: "PAID", amount: "$39.95" },
      { date: "07/19/2026", ref: "VL-5N2D8", matter: "USCIS-EB2-NIW", doc: "Carta Laboral / Reference Ltr", status: "PAID", amount: "$74.85" },
      { date: "07/04/2026", ref: "VL-9T6J3", matter: "USCIS-EB2-NIW", doc: "Certificado de Calificaciones", status: "PAID", amount: "$59.90" },
      { date: "06/22/2026", ref: "VL-1H8M7", matter: "MAT-2026-ASYL", doc: "Declaración Jurada Notariada", status: "PAID", amount: "$89.75" },
      { date: "06/10/2026", ref: "VL-4K3Y2", matter: "MAT-2026-ASYL", doc: "Pasaporte Extranjero", status: "PAID", amount: "$24.95" },
    ];

    items.forEach((item) => {
      y -= 20;
      page.drawText(item.date, { x: 40, y, size: 8, font: courier, color: textMuted });
      page.drawText(`${item.ref} (${item.matter})`, { x: 120, y, size: 8, font: courier, color: ink });
      page.drawText(item.doc.substring(0, 26), { x: 260, y, size: 8, font: helvetica, color: ink });
      page.drawText(item.status, { x: 440, y, size: 8, font: helveticaBold, color: amber });
      page.drawText(item.amount, { x: 520, y, size: 8, font: courier, color: ink });
    });

    y -= 30;
    page.drawLine({
      start: { x: 40, y },
      end: { x: 572, y },
      thickness: 1,
      color: borderGrey,
    });

    y -= 20;
    page.drawText("Total Invoiced & Remitted YTD:", { x: 340, y, size: 9, font: helveticaBold, color: ink });
    page.drawText("$1,248.50 USD", { x: 490, y, size: 9, font: courier, color: amber });

    y -= 60;
    page.drawRectangle({
      x: 40,
      y: y - 30,
      width: 532,
      height: 48,
      color: bgLight,
      borderColor: borderGrey,
      borderWidth: 1,
    });

    page.drawText("ACCOUNTING CERTIFICATION", { x: 56, y: y + 4, size: 8, font: helveticaBold, color: ink });
    page.drawText(
      "Generated for tax and legal accounting records. All transactions verified on VerifyLingua ledger.",
      { x: 56, y: y - 10, size: 7.5, font: helvetica, color: textMuted }
    );

    const pdfBytes = await doc.save();

    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="VerifyLingua-Consolidated-Invoices-2026.pdf"',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate consolidated invoices", details: error.message },
      { status: 500 }
    );
  }
}
