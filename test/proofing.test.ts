import { describe, it, expect } from "vitest";
import { GET as getProof } from "@/app/api/order/[id]/proof/route";
import { GET as getRevisions, POST as postRevision } from "@/app/api/order/[id]/revisions/route";
import { POST as postApprove } from "@/app/api/order/[id]/approve/route";

describe("Interactive Customer Proofing Studio Suite (Stage 1)", () => {
  const testOrderId = "VL-TEST-PROOF-1";

  it("1. fetches bilingual proofing data and segments successfully", async () => {
    const req = new Request(`http://localhost:3000/api/order/${testOrderId}/proof`);
    const res = await getProof(req, { params: Promise.resolve({ id: testOrderId }) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.order).toBeDefined();
    expect(data.order.publicCode).toBe(testOrderId);
    expect(Array.isArray(data.segments)).toBe(true);
    expect(data.segments.length).toBeGreaterThanOrEqual(5);

    // Verify legal standards in segments
    const headerSeg = data.segments.find((s: any) => s.section === "HEADER");
    expect(headerSeg).toBeDefined();
    expect(headerSeg.sourceText).toContain("ESTADOS UNIDOS MEXICANOS");
    expect(headerSeg.translatedText).toContain("UNITED MEXICAN STATES");

    // Verify locked glossary items
    expect(Array.isArray(data.lockedGlossary)).toBe(true);
    expect(data.lockedGlossary.length).toBeGreaterThan(0);
  });

  it("2. handles line-item customer revisions submission and retrieval", async () => {
    // Attempt empty revision - should fail with 400
    const emptyReq = new Request(`http://localhost:3000/api/order/${testOrderId}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suggestedText: "" }),
    });
    const emptyRes = await postRevision(emptyReq, { params: Promise.resolve({ id: testOrderId }) });
    expect(emptyRes.status).toBe(400);

    // Submit valid revision note
    const validReq = new Request(`http://localhost:3000/api/order/${testOrderId}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        segmentId: "seg-5",
        originalText: "Nombre del Registrado: ALEJANDRO MARTÍNEZ RIVERA",
        suggestedText: "Registered Individual's Name: ALEJANDRO MARTINEZ RIVERA",
        reason: "Matches Foreign Passport / USCIS Entry",
      }),
    });
    const validRes = await postRevision(validReq, { params: Promise.resolve({ id: testOrderId }) });
    expect(validRes.status).toBe(200);
    const validData = await validRes.json();
    expect(validData.success).toBe(true);
    expect(validData.revision).toBeDefined();
    expect(validData.revision.status).toBe("PENDING");
    expect(validData.revision.suggestedText).toContain("ALEJANDRO MARTINEZ RIVERA");

    // Retrieve active revisions
    const getReq = new Request(`http://localhost:3000/api/order/${testOrderId}/revisions`);
    const getRes = await getRevisions(getReq, { params: Promise.resolve({ id: testOrderId }) });
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.success).toBe(true);
    expect(getData.revisions.length).toBeGreaterThanOrEqual(1);
  });

  it("3. validates customer approval before generating official certificate", async () => {
    // Missing confirmedAccuracy - should fail with 400
    const unconfirmedReq = new Request(`http://localhost:3000/api/order/${testOrderId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmedAccuracy: false }),
    });
    const unconfirmedRes = await postApprove(unconfirmedReq, {
      params: Promise.resolve({ id: testOrderId }),
    });
    expect(unconfirmedRes.status).toBe(400);

    // Valid electronic sign-off
    const approveReq = new Request(`http://localhost:3000/api/order/${testOrderId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signatureName: "Alejandro Martinez Rivera",
        confirmedAccuracy: true,
      }),
    });
    const approveRes = await postApprove(approveReq, {
      params: Promise.resolve({ id: testOrderId }),
    });
    expect(approveRes.status).toBe(200);
    const approveData = await approveRes.json();
    expect(approveData.success).toBe(true);
    expect(approveData.verifyCode).toMatch(/^VL-[A-Z0-9]{5}$/);
    expect(approveData.downloadUrl).toContain(approveData.verifyCode);
    expect(approveData.verificationUrl).toContain(approveData.verifyCode);
  });
});
