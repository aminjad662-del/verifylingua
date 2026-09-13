import { describe, it, expect } from "vitest";
import { GET, POST } from "@/app/api/order/[id]/revisions/route";
import { NextRequest } from "next/server";
import { createPersistentJob } from "@/lib/translation/persistent-store";

describe("Revision Requests & Multi-Version Workflow (/api/order/[id]/revisions)", () => {
  it("rejects empty revision submission with 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/order/VL-TEST-REV/revisions", {
      method: "POST",
      body: JSON.stringify({
        notes: "   ",
        reason: "TRANSLATION_CORRECTION",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "VL-TEST-REV" }) });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("cannot be empty");
  });

  it("submits revision with notes and retrieves it for an order publicCode", async () => {
    const publicCode = `VL-REV-${Date.now()}`;
    const req = new NextRequest(`http://localhost:3000/api/order/${publicCode}/revisions`, {
      method: "POST",
      body: JSON.stringify({
        notes: "Please adjust translation of company title to match Colombian mercantile registry.",
        reason: "TERMINOLOGY_PRECISION",
        priority: "HIGH",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: publicCode }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.revision.notes).toContain("Colombian mercantile registry");
    expect(body.revision.status).toBe("PENDING");

    // Retrieve revisions
    const getReq = new NextRequest(`http://localhost:3000/api/order/${publicCode}/revisions`, {
      method: "GET",
    });
    const getRes = await GET(getReq, { params: Promise.resolve({ id: publicCode }) });
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.revisions.length).toBeGreaterThanOrEqual(1);
    expect(getData.revisions[0].reason).toBe("TERMINOLOGY_PRECISION");
  });

  it("supports revision requests against persistent TranslationJob IDs", async () => {
    const job = await createPersistentJob({
      filename: "affidavit.pdf",
      format: "pdf",
      mimeType: "application/pdf",
      targetLang: "en",
    });

    const req = new NextRequest(`http://localhost:3000/api/order/${job.id}/revisions`, {
      method: "POST",
      body: JSON.stringify({
        notes: "Page 2 notary seal should have transliteration note.",
        reason: "SEAL_TRANSLITERATION",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.revision.suggestedText).toContain("notary seal");

    // Fetch via GET
    const getRes = await GET(
      new NextRequest(`http://localhost:3000/api/order/${job.id}/revisions`),
      { params: Promise.resolve({ id: job.id }) }
    );
    const getData = await getRes.json();
    expect(getData.revisions.some((r: any) => r.notes.includes("notary seal"))).toBe(true);
  });
});
