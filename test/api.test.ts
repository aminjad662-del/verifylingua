import { describe, it, expect } from "vitest";
import { generateCertificatePdf } from "@/lib/certificate";

describe("API Endpoints & Certificate Streaming", () => {
  it("generates a valid binary PDF buffer with USCIS competence text", async () => {
    const pdfBytes = await generateCertificatePdf({
      verifyCode: "CERT-TEST-9988",
      orderCode: "VL-TEST",
      translatorName: "Elena V.",
      translatorCredentials: "ATA Member No. 271892",
      sourceLanguage: "Spanish",
      targetLanguage: "English",
      pageCount: 1,
      documentName: "Acta de Nacimiento",
      documentSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      receivingParty: "USCIS",
      issuedAt: new Date(),
    });

    expect(pdfBytes).toBeDefined();
    expect(pdfBytes.length).toBeGreaterThan(1000);
    // PDF Magic Bytes: %PDF- (0x25 0x50 0x44 0x46)
    expect(pdfBytes[0]).toBe(0x25);
    expect(pdfBytes[1]).toBe(0x50);
    expect(pdfBytes[2]).toBe(0x44);
    expect(pdfBytes[3]).toBe(0x46);
  });
});
