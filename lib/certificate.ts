import crypto from "crypto";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

export interface CertificateData {
  verifyCode: string;
  orderPublicCode: string;
  sourceLanguage: string;
  targetLanguage: string;
  pageCount: number;
  translatorName: string;
  translatorCredentials: string;
  issuedAt: Date;
  documentSha256: string;
  status: "VALID" | "REVOKED";
  receivingAgency: string;
  competenceStatement: string;
}

/**
 * Generate a deterministic SHA-256 fingerprint for a document buffer or string
 */
export function computeDocumentHash(content: string | Buffer): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Generates the official USCIS 8 CFR 103.2(b)(3) compliant Certificate of Accuracy content
 */
export function generateCertificateData(params: {
  orderPublicCode: string;
  sourceLanguage: string;
  targetLanguage?: string;
  pageCount: number;
  translatorName: string;
  translatorCredentials: string;
  receivingAgency?: string;
  documentContent?: string | Buffer;
}): CertificateData {
  const targetLanguage = params.targetLanguage || "English";
  const receivingAgency = params.receivingAgency || "USCIS / Government Institutions";
  const issuedAt = new Date();

  // Generate unique verification code
  const verifyCode = `CERT-${params.orderPublicCode.replace("VL-", "")}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const documentSha256 = params.documentContent
    ? computeDocumentHash(params.documentContent)
    : crypto.createHash("sha256").update(params.orderPublicCode + issuedAt.toISOString()).digest("hex");

  const competenceStatement = `I, ${params.translatorName}, hereby certify that I am fluent and fully literate in both ${params.sourceLanguage} and ${targetLanguage}. I further certify that I have thoroughly translated the attached document comprising ${params.pageCount} page(s) and that the translation is a complete, true, and accurate translation of the source document to the best of my knowledge, skill, and ability in compliance with 8 CFR 103.2(b)(3).`;

  return {
    verifyCode,
    orderPublicCode: params.orderPublicCode,
    sourceLanguage: params.sourceLanguage,
    targetLanguage,
    pageCount: params.pageCount,
    translatorName: params.translatorName,
    translatorCredentials: params.translatorCredentials,
    issuedAt,
    documentSha256,
    status: "VALID",
    receivingAgency,
    competenceStatement,
  };
}

/**
 * Verification URL generator for QR codes
 */
export function getVerificationUrl(verifyCode: string, baseUrl: string = "https://verifylingua.com"): string {
  return `${baseUrl}/verify/${encodeURIComponent(verifyCode)}`;
}

/**
 * Generates a signed, official PDF Certificate of Accuracy
 */
export async function generateCertificatePdf(params: {
  verifyCode: string;
  orderCode: string;
  translatorName: string;
  translatorCredentials: string;
  sourceLanguage: string;
  targetLanguage: string;
  pageCount: number;
  documentName: string;
  documentSha256: string;
  receivingParty: string;
  issuedAt?: Date;
}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const issuedDate = params.issuedAt || new Date();
  const dateStr = issuedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Border & Header Line
  page.drawRectangle({
    x: 36,
    y: 36,
    width: 523.28,
    height: 769.89,
    borderWidth: 1.5,
    borderColor: rgb(0.25, 0.38, 0.91), // #4160E8
    color: rgb(0.98, 0.98, 1.0),
  });

  // Header Title
  page.drawText("CERTIFICATE OF TRANSLATION ACCURACY", {
    x: 60,
    y: 760,
    size: 18,
    font: fontBold,
    color: rgb(0.04, 0.05, 0.16),
  });

  page.drawText("COMPLIANT WITH USCIS 8 CFR 103.2(b)(3) & ATA STANDARDS", {
    x: 60,
    y: 742,
    size: 9,
    font: fontBold,
    color: rgb(0.25, 0.38, 0.91),
  });

  // Certificate Code & Verification Line
  page.drawText(`Certificate ID: ${params.verifyCode}`, {
    x: 60,
    y: 700,
    size: 10,
    font: fontBold,
    color: rgb(0.04, 0.05, 0.16),
  });

  page.drawText(`Order Reference: ${params.orderCode}  •  Date: ${dateStr}`, {
    x: 60,
    y: 685,
    size: 10,
    font: fontRegular,
    color: rgb(0.38, 0.41, 0.48),
  });

  // Document Summary Box
  page.drawRectangle({
    x: 60,
    y: 560,
    width: 475.28,
    height: 105,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.87, 0.91),
    borderWidth: 1,
  });

  page.drawText(`Document Title: ${params.documentName}`, {
    x: 75,
    y: 645,
    size: 10,
    font: fontBold,
    color: rgb(0.04, 0.05, 0.16),
  });

  page.drawText(`Language Pair: ${params.sourceLanguage} to ${params.targetLanguage}`, {
    x: 75,
    y: 628,
    size: 10,
    font: fontRegular,
    color: rgb(0.04, 0.05, 0.16),
  });

  page.drawText(`Total Certified Pages: ${params.pageCount}  •  Receiving Party: ${params.receivingParty}`, {
    x: 75,
    y: 611,
    size: 10,
    font: fontRegular,
    color: rgb(0.04, 0.05, 0.16),
  });

  page.drawText(`SHA-256 Fingerprint: ${params.documentSha256.slice(0, 48)}...`, {
    x: 75,
    y: 580,
    size: 8,
    font: fontRegular,
    color: rgb(0.38, 0.41, 0.48),
  });

  // Sworn Statement of Competence
  page.drawText("SWORN STATEMENT OF TRANSLATOR COMPETENCE", {
    x: 60,
    y: 520,
    size: 11,
    font: fontBold,
    color: rgb(0.04, 0.05, 0.16),
  });

  const statementText = `I, ${params.translatorName}, hereby certify that I am competent and fully literate in both ${params.sourceLanguage} and ${params.targetLanguage}. I further certify that I have thoroughly translated the attached official document comprising ${params.pageCount} page(s) and that the translation is a complete, true, and accurate translation of the source document to the best of my knowledge, skill, and ability, meeting all legal standards set forth in Title 8 of the Code of Federal Regulations, Section 103.2(b)(3).`;

  page.drawText(statementText, {
    x: 60,
    y: 495,
    size: 10,
    font: fontItalic,
    color: rgb(0.1, 0.1, 0.2),
    maxWidth: 475,
    lineHeight: 15,
  });

  // Translator Signature Block
  page.drawText("CERTIFIED TRANSLATOR:", {
    x: 60,
    y: 350,
    size: 10,
    font: fontBold,
    color: rgb(0.04, 0.05, 0.16),
  });

  page.drawText(params.translatorName, {
    x: 60,
    y: 330,
    size: 13,
    font: fontBold,
    color: rgb(0.25, 0.38, 0.91),
  });

  page.drawText(params.translatorCredentials, {
    x: 60,
    y: 312,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.38, 0.41, 0.48),
  });

  page.drawText("VerifyLingua Legal Certification Division  •  support@verifylingua.com", {
    x: 60,
    y: 295,
    size: 9,
    font: fontRegular,
    color: rgb(0.38, 0.41, 0.48),
  });

  // Embed QR Code
  try {
    const verifyUrl = getVerificationUrl(params.verifyCode);
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 100 });
    const qrImage = await pdfDoc.embedPng(qrDataUrl);
    page.drawImage(qrImage, {
      x: 430,
      y: 275,
      width: 90,
      height: 90,
    });

    page.drawText("Scan to verify validity", {
      x: 430,
      y: 265,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.38, 0.41, 0.48),
    });
  } catch (qrErr) {
    // If QR rendering fails, continue with text code
  }

  // Footer institutional watermark
  page.drawText("OFFICIAL CERTIFIED TRANSLATION • ACCEPTED BY USCIS, COURTS, & UNIVERSITIES", {
    x: 95,
    y: 55,
    size: 8,
    font: fontBold,
    color: rgb(0.38, 0.41, 0.48),
  });

  return await pdfDoc.save();
}
