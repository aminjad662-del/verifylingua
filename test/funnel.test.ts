import { describe, it, expect } from "vitest";
import { calculatePricing } from "@/lib/pricing";

describe("Order Funnel Integration Tests (Phase 4)", () => {
  it("calculates standard certified translation for 1 page correctly", () => {
    const quote = calculatePricing({
      serviceType: "CERTIFIED",
      pageCount: 1,
      wordCount: 200,
    });

    expect(quote.pageCount).toBe(1);
    expect(quote.basePrice).toBe(24.95);
    expect(quote.total).toBe(24.95);
    expect(quote.isExpedited).toBe(false);
    expect(quote.needsNotarization).toBe(false);
  });

  it("calculates multi-page document with notarization and expedited turnaround", () => {
    const quote = calculatePricing({
      serviceType: "CERTIFIED",
      pageCount: 3,
      wordCount: 750,
      isExpedited: true,
      needsNotarization: true,
    });

    // 3 * 24.95 = 74.85
    expect(quote.basePrice).toBeCloseTo(74.85, 2);
    // Expedited = 74.85 * 0.6 = 44.91
    expect(quote.expeditedFee).toBeCloseTo(44.91, 2);
    // Notarization = 19.95
    expect(quote.notarizationFee).toBe(19.95);
    // Total = 74.85 + 44.91 + 19.95 = 139.71
    expect(quote.total).toBeCloseTo(139.71, 2);
  });

  it("calculates standard per-word pricing with minimum word threshold", () => {
    const quote = calculatePricing({
      serviceType: "STANDARD",
      wordCount: 150, // below 250 min
    });

    expect(quote.basePrice).toBe(25.0); // 250 min words * $0.10
    expect(quote.total).toBe(25.0);
  });

  it("applies notarization batch timing to promised delivery date", () => {
    const quote = calculatePricing({
      serviceType: "CERTIFIED",
      pageCount: 1,
      needsNotarization: true,
    });

    expect(quote.promisedAt).toBeInstanceOf(Date);
    expect(quote.promisedAtFormatted).toBeTruthy();
    expect(typeof quote.promisedAtFormatted).toBe("string");
  });

  it("handles full add-on matrix including hard copy and apostille", () => {
    const quote = calculatePricing({
      serviceType: "CERTIFIED",
      pageCount: 2,
      needsNotarization: true,
      needsHardCopy: true,
      needsApostille: true,
      isExpedited: true,
    });

    // base: 2 * 24.95 = 49.90
    // expedited: 49.90 * 0.6 = 29.94
    // notarization: 19.95
    // hard copy ($19.95 + $10 shipping): 29.95
    // apostille: 75.00
    // total = 49.90 + 29.94 + 19.95 + 29.95 + 75.00 = 194.74
    expect(quote.total).toBeCloseTo(194.74, 2);
  });
});
