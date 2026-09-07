import { describe, it, expect } from "vitest";
import { GET as getMatters, POST as postMatter } from "@/app/api/counsel/matters/route";
import { POST as postBundle } from "@/app/api/counsel/matters/[id]/bundle/route";

describe("CounselDesk™ Law Firm & B2B Suite (Stage 2)", () => {
  it("1. lists law firm matters and calculates immigration filing metrics", async () => {
    const req = new Request("http://localhost:3000/api/counsel/matters");
    const res = await getMatters(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.matters)).toBe(true);
    expect(data.matters.length).toBeGreaterThanOrEqual(1);

    // Verify matter structure
    const matter = data.matters[0];
    expect(matter.matterNumber).toBeDefined();
    expect(matter.clientName).toBeDefined();
    expect(matter.petitionType).toBeDefined();

    // Verify law firm metrics
    expect(data.metrics).toBeDefined();
    expect(data.metrics.uscisAdmissibilityRate).toBe("100.0%");
  });

  it("2. supports search filtering across client names, matters, and A-Numbers", async () => {
    const req = new Request("http://localhost:3000/api/counsel/matters?q=alvarez");
    const res = await getMatters(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.matters.some((m: any) => m.clientName.toLowerCase().includes("alvarez"))).toBe(true);
  });

  it("3. creates new client matters with validation", async () => {
    // Missing required fields
    const invalidReq = new Request("http://localhost:3000/api/counsel/matters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matterNumber: "" }),
    });
    const invalidRes = await postMatter(invalidReq);
    expect(invalidRes.status).toBe(400);

    // Valid matter creation
    const validReq = new Request("http://localhost:3000/api/counsel/matters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matterNumber: "2026-USCIS-TESTCASE",
        clientName: "Valeria Gomez Santos",
        alienNumber: "A219-001-992",
        petitionType: "I-485 Adjustment of Status",
        notes: "Strict maternal surname match required for G-28.",
      }),
    });
    const validRes = await postMatter(validReq);
    expect(validRes.status).toBe(200);

    const validData = await validRes.json();
    expect(validData.success).toBe(true);
    expect(validData.matter.matterNumber).toBe("2026-USCIS-TESTCASE");
    expect(validData.matter.status).toBe("ACTIVE");
  });

  it("4. compiles 1-click court-ready USCIS exhibit packets with indexed divider tabs", async () => {
    const bundleReq = new Request("http://localhost:3000/api/counsel/matters/mat-1/bundle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ includeTableOfContents: true, includeNotaryAffidavits: true }),
    });
    const bundleRes = await postBundle(bundleReq, {
      params: Promise.resolve({ id: "mat-1" }),
    });
    expect(bundleRes.status).toBe(200);

    const bundleData = await bundleRes.json();
    expect(bundleData.success).toBe(true);
    expect(bundleData.bundleId).toMatch(/^BUNDLE-[A-Z0-9]{6}$/);
    expect(bundleData.bundleSha256).toBeDefined();
    expect(bundleData.tableOfContentsGenerated).toBe(true);
    expect(Array.isArray(bundleData.exhibits)).toBe(true);
    expect(bundleData.exhibits.length).toBeGreaterThanOrEqual(2);
    expect(bundleData.exhibits[0].tab).toBe("Exhibit A");
  });
});
