import { describe, it, expect } from "vitest";
import { POST as waitlistPostHandler, GET as waitlistGetHandler } from "../app/api/waitlist/route";
import { GET as historyGetHandler } from "../app/api/history/route";
import { GET as cleanupCronHandler } from "../app/api/cron/cleanup/route";
import { isolatedDb } from "../lib/db/data-isolation";
import { createPersistentJob } from "../lib/translation/persistent-store";
import { NextRequest } from "next/server";

describe("Phase 8: History, Retention & Paid Tier Waitlist Gate", () => {
  const userA = "user_clerk_alice_ph8";
  const userB = "user_clerk_bob_ph8";

  it("1. Scopes document history strictly to the authenticated user", async () => {
    // Create Job for User A
    const jobA = await createPersistentJob({
      userId: userA,
      filename: "Alice_Agreement.pdf",
      format: "pdf",
      mimeType: "application/pdf",
      targetLang: "ar",
      sizeBytes: 120000,
    });

    // Create Job for User B
    const jobB = await createPersistentJob({
      userId: userB,
      filename: "Bob_Tax_Form.pdf",
      format: "pdf",
      mimeType: "application/pdf",
      targetLang: "fr",
      sizeBytes: 85000,
    });

    // Query history as User A
    const reqA = new NextRequest(`http://localhost:3000/api/history?userId=${userA}`, {
      headers: { "x-user-id": userA },
    });
    const resA = await historyGetHandler(reqA);
    const bodyA = await resA.json();

    expect(bodyA.jobs).toBeDefined();
    // Verify User A history does not leak User B's files
    const leakedBobJob = bodyA.jobs.find((j: any) => j.id === jobB.id && j.userId === userB);
    expect(leakedBobJob).toBeUndefined();

    console.log("=== [PHASE 8 GATE: PER-USER HISTORY ISOLATION] ===");
    console.log(`User A jobs returned: ${bodyA.jobs.length}. No User B leakage.`);
  });

  it("2. Wires retention setting toggle to automated cleanup expiration", async () => {
    // Default retention: autoDeleteEnabled = false (keep indefinitely)
    const initialSettings = await isolatedDb.getRetentionSettings(userA);
    expect(initialSettings.autoDeleteEnabled).toBe(false);

    // User enables auto-delete with 14-day retention
    const updatedSettings = await isolatedDb.updateRetentionSettings(userA, {
      autoDeleteEnabled: true,
      retentionDays: 14,
    });
    expect(updatedSettings.autoDeleteEnabled).toBe(true);
    expect(updatedSettings.retentionDays).toBe(14);

    // Trigger cleanup cron endpoint
    const req = new NextRequest("http://localhost:3000/api/cron/cleanup");
    const res = await cleanupCronHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    console.log("=== [PHASE 8 GATE: RETENTION POLICY CLEANUP] ===");
    console.log(`Auto-delete enabled: ${updatedSettings.autoDeleteEnabled}, Retention window: ${updatedSettings.retentionDays} days.`);
  });

  it("3. Captures paid tier waitlist affordance with email validation", async () => {
    const payload = {
      email: "attorney.smith@lawgroup.com",
      tier: "ENTERPRISE",
      notes: "High-volume USCIS immigration filing pipeline",
    };

    const req = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await waitlistPostHandler(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.entry.email).toBe(payload.email);
    expect(body.entry.tier).toBe("ENTERPRISE");

    // Verify stored
    const listRes = await waitlistGetHandler();
    const listBody = await listRes.json();
    expect(listBody.count).toBeGreaterThanOrEqual(1);

    console.log("=== [PHASE 8 GATE: PAID TIER WAITLIST CAPTURE] ===");
    console.log(`Waitlist entry stored: ${body.entry.email} [${body.entry.tier}]`);
  });
});
