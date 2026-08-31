export const ASSET_ALT_TEXTS: Record<string, string> = {
  "hero-photograph-document":
    "A person using a smartphone to capture a clear photo of an official document for certified translation",
  "step-upload":
    "Icon representing secure document upload and instant AI OCR scanning",
  "step-triage":
    "Icon representing AI vision document triage and legibility verification",
  "step-translate":
    "Icon representing certified human translation and passport name consistency lock",
  "step-deliver":
    "Icon representing signed certificate of accuracy with QR code verification",
  "doc-birth-certificate":
    "Official birth certificate with embossed seal for certified USCIS translation",
  "doc-diploma":
    "Academic diploma and degree certificate for university evaluation",
  "doc-passport":
    "International passport and national identification document",
  "doc-marriage-certificate":
    "Civil marriage certificate for immigration and court filings",
  "trust-security-vault":
    "256-bit encrypted document vault with public cryptographic verification",
  "empty-vault":
    "Illustration showing an empty secure document vault ready for uploads",
  "empty-orders":
    "Illustration showing no active orders in queue",
};

export function getAssetAlt(id: string, fallback: string = "Illustration"): string {
  return ASSET_ALT_TEXTS[id] || fallback;
}
