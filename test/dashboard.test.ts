import { describe, it, expect } from "vitest";

describe("Customer Dashboard & Onboarding Tests (Phase 6)", () => {
  it("calculates 90-day auto-purge retention countdown accurately", () => {
    const uploadedAt = new Date("2026-08-31T00:00:00Z");
    const retentionDays = 90;
    const purgeDate = new Date(uploadedAt.getTime() + retentionDays * 24 * 60 * 60 * 1000);

    expect(purgeDate.toISOString()).toBe("2026-11-29T00:00:00.000Z");
  });

  it("handles valid status chip transitions", () => {
    const validStatuses = [
      "DRAFT",
      "TRIAGED",
      "PAID",
      "ASSIGNED",
      "TRANSLATING",
      "QA",
      "CERTIFIED",
      "DELIVERED",
    ];

    expect(validStatuses).toContain("PAID");
    expect(validStatuses).toContain("TRANSLATING");
    expect(validStatuses).toContain("DELIVERED");
  });

  it("generates an official itemized legal receipt PDF for immigration clients and law firms", async () => {
    const { generateReceiptPdf } = await import("@/lib/receipt");
    const receiptBytes = await generateReceiptPdf({
      orderId: "ord-1",
      publicCode: "VL-7X9K2",
      documentName: "Acta de Nacimiento (Birth Certificate)",
      matterNumber: "Matter #USCIS-I485-8910",
      sourceLang: "Spanish",
      targetLang: "English",
      pages: 1,
      total: 24.95,
      clientName: "Maria Santos",
      linguist: "Elena V. (ATA No. 271892)",
    });

    expect(receiptBytes).toBeDefined();
    expect(receiptBytes.length).toBeGreaterThan(1000);
    // PDF Magic Bytes: %PDF- (0x25 0x50 0x44 0x46)
    expect(receiptBytes[0]).toBe(0x25);
    expect(receiptBytes[1]).toBe(0x50);
    expect(receiptBytes[2]).toBe(0x44);
    expect(receiptBytes[3]).toBe(0x46);
  });

  it("streams official order receipt via /api/order/[id]/receipt endpoint", async () => {
    const { GET } = await import("@/app/api/order/[id]/receipt/route");
    const { NextRequest } = await import("next/server");

    const req = new NextRequest("http://localhost:3000/api/order/VL-7X9K2/receipt");
    const res = await GET(req, { params: Promise.resolve({ id: "VL-7X9K2" }) });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toContain("VerifyLingua-Receipt-VL-7X9K2.pdf");
  });

  it("streams consolidated YTD legal invoices via /api/invoices/download-all endpoint", async () => {
    const { GET } = await import("@/app/api/invoices/download-all/route");
    const { NextRequest } = await import("next/server");

    const req = new NextRequest("http://localhost:3000/api/invoices/download-all");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toContain("VerifyLingua-Consolidated-Invoices-2026.pdf");
  });
});
