import { describe, it, expect } from "vitest";
import { calculatePricing, calculateDeliveryDatetime } from "../lib/pricing";

describe("Pricing Engine & Deterministic Delivery Math", () => {
  it("calculates 1 certified page accurately at $24.95", () => {
    const result = calculatePricing({
      serviceType: "CERTIFIED",
      pageCount: 1,
      wordCount: 150,
      isExpedited: false,
      needsNotarization: false,
    });

    expect(result.basePrice).toBe(24.95);
    expect(result.addOnTotal).toBe(0);
    expect(result.total).toBe(24.95);
    expect(result.pageCount).toBe(1);
  });

  it("rounds up certified pages based on word count (e.g. 520 words -> 3 pages)", () => {
    const result = calculatePricing({
      serviceType: "CERTIFIED",
      pageCount: 1,
      wordCount: 520, // 520 / 250 = 2.08 -> 3 pages
    });

    expect(result.pageCount).toBe(3);
    expect(result.basePrice).toBe(74.85); // 3 * 24.95
    expect(result.total).toBe(74.85);
  });

  it("calculates standard translation per word ($0.10/word, 250 word min)", () => {
    const minResult = calculatePricing({
      serviceType: "STANDARD",
      pageCount: 1,
      wordCount: 100, // below 250 min
    });
    expect(minResult.basePrice).toBe(25.00);

    const largeResult = calculatePricing({
      serviceType: "STANDARD",
      pageCount: 2,
      wordCount: 1000,
    });
    expect(largeResult.basePrice).toBe(100.00); // 1000 * 0.10
  });

  it("applies expedited fee (+60% base) and notarization ($19.95)", () => {
    const result = calculatePricing({
      serviceType: "CERTIFIED",
      pageCount: 2,
      wordCount: 400,
      isExpedited: true,
      needsNotarization: true,
    });

    // Base = 2 * 24.95 = 49.90
    // Expedited = 49.90 * 0.60 = 29.94
    // Notarization = 19.95
    // AddOn = 49.89
    // Total = 99.79
    expect(result.basePrice).toBe(49.90);
    expect(result.expeditedFee).toBe(29.94);
    expect(result.notarizationFee).toBe(19.95);
    expect(result.addOnTotal).toBe(49.89);
    expect(result.total).toBe(99.79);
  });

  it("handles Friday afternoon notarization edge case cleanly", () => {
    // Friday at 5:00 PM EST (2026-09-04 17:00:00)
    const fridayEvening = new Date(Date.UTC(2026, 8, 4, 21, 0, 0)); // 21:00 UTC = 17:00 EST

    const delivery = calculateDeliveryDatetime({
      pageCount: 1,
      isExpedited: false,
      needsNotarization: true,
      needsHardCopy: false,
      needsApostille: false,
      paidAt: fridayEvening,
    });

    // Should push to Monday or Tuesday business batch window
    expect(delivery.getDay()).not.toBe(0); // Not Sunday
    expect(delivery.getDay()).not.toBe(6); // Not Saturday
    expect(delivery.getTime()).toBeGreaterThan(fridayEvening.getTime());
  });
});
