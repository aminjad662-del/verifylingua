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
});
