import crypto from "crypto";

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
