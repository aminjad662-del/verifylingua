import { describe, it, expect } from "vitest";
import {
  computeDocumentHash,
  generateCertificateData,
  getVerificationUrl,
} from "@/lib/certificate";

describe("Public Verification & Certificate Tests (Phase 5)", () => {
  it("computes deterministic SHA-256 hash for document buffer or text", () => {
    const text1 = "Official Birth Certificate Extract - Record #10928";
    const text2 = "Official Birth Certificate Extract - Record #10928";
    const hash1 = computeDocumentHash(text1);
    const hash2 = computeDocumentHash(text2);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // 64 hex characters
  });

  it("generates 8 CFR 103.2(b)(3) compliant Certificate of Accuracy data", () => {
    const cert = generateCertificateData({
      orderPublicCode: "VL-8K9P2",
      sourceLanguage: "Spanish",
      targetLanguage: "English",
      pageCount: 2,
      translatorName: "Elena V.",
      translatorCredentials: "ATA Member No. 271892",
      receivingAgency: "USCIS",
    });

    expect(cert.verifyCode).toContain("CERT-8K9P2-");
    expect(cert.status).toBe("VALID");
    expect(cert.pageCount).toBe(2);
    expect(cert.competenceStatement).toContain("8 CFR 103.2(b)(3)");
    expect(cert.competenceStatement).toContain("Elena V.");
    expect(cert.competenceStatement).toContain("Spanish");
    expect(cert.competenceStatement).toContain("English");
    expect(cert.documentSha256).toHaveLength(64);
  });

  it("formats public verification URL with QR-friendly route", () => {
    const url = getVerificationUrl("CERT-8K9P2-4019");
    expect(url).toBe("https://verifylingua.com/verify/CERT-8K9P2-4019");
  });
});
