import { describe, it, expect } from "vitest";
import { POST as postRfeDefense } from "@/app/api/defense/rfe/route";
import { POST as postNotification } from "@/app/api/notifications/dispatch/route";

describe("USCIS RFE Defense Shield & Omnichannel Notifications Suite (Stage 5)", () => {
  it("1. compiles automated USCIS RFE supplemental response packet", async () => {
    // Missing required fields
    const invalidReq = new Request("http://localhost:3000/api/defense/rfe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicCode: "VL-8921-XQ" }),
    });
    const invalidRes = await postRfeDefense(invalidReq);
    expect(invalidRes.status).toBe(400);

    // Valid RFE notice submission
    const validReq = new Request("http://localhost:3000/api/defense/rfe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicCode: "VL-8921-XQ",
        rfeReceiptNumber: "LIN2690184910",
        serviceCenter: "Texas Service Center (TSC)",
        rfeObjectionType: "COMPETENCE_AFFIDAVIT_OMISSION",
        officerNotes: "Translation does not contain sworn statement of competency.",
      }),
    });
    const validRes = await postRfeDefense(validReq);
    expect(validRes.status).toBe(200);

    const data = await validRes.json();
    expect(data.success).toBe(true);
    expect(data.defenseCaseId).toMatch(/^RFE-DEF-[A-Z0-9]{6}$/);
    expect(data.defenseSha256).toBeDefined();
    expect(data.remedy).toBeDefined();
    expect(data.remedy.regulationCite).toContain("8 CFR § 204.2");
    expect(data.defensePacket.swornReAffidavitSigned).toBe(true);
    expect(data.resolutionTurnaround).toContain("< 4 Hours");
  });

  it("2. dispatches omnichannel email and SMS milestone alerts with magic links", async () => {
    // Missing recipient email
    const invalidReq = new Request("http://localhost:3000/api/notifications/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderCode: "VL-8921-XQ" }),
    });
    const invalidRes = await postNotification(invalidReq);
    expect(invalidRes.status).toBe(400);

    // Valid notification dispatch
    const validReq = new Request("http://localhost:3000/api/notifications/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientEmail: "applicant@example.com",
        recipientPhone: "+15551234567",
        eventType: "PROOF_READY",
        orderCode: "VL-8921-XQ",
      }),
    });
    const validRes = await postNotification(validReq);
    expect(validRes.status).toBe(200);

    const data = await validRes.json();
    expect(data.success).toBe(true);
    expect(data.emailDispatched).toBe(true);
    expect(data.smsDispatched).toBe(true);
    expect(data.emailPreview.subject).toContain("Proofing Studio");
    expect(data.smsPreview.body).toContain("https://verifylingua.pages.dev/order/VL-8921-XQ/proof");
  });
});
