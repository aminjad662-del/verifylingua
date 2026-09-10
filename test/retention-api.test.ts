import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getRetentionHandler, POST as postRetentionHandler } from "../app/api/settings/retention/route";

describe("User-Scoped Retention Policy API Gate", () => {
  const user1 = "user_retention_alice";
  const user2 = "user_retention_bob";

  it("1. Returns default retention settings (autoDeleteEnabled = false) for authenticated user", async () => {
    const req = new NextRequest(`http://localhost:3000/api/settings/retention?userId=${user1}`, {
      headers: { "x-user-id": user1 },
    });
    const res = await getRetentionHandler(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.settings.userId).toBe(user1);
    expect(body.settings.autoDeleteEnabled).toBe(false);
  });

  it("2. Updates user retention settings via POST with validation", async () => {
    // Valid update
    const updateReq = new NextRequest(`http://localhost:3000/api/settings/retention?userId=${user1}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user1,
      },
      body: JSON.stringify({
        autoDeleteEnabled: true,
        retentionDays: 60,
      }),
    });
    const updateRes = await postRetentionHandler(updateReq);
    expect(updateRes.status).toBe(200);

    const updateBody = await updateRes.json();
    expect(updateBody.success).toBe(true);
    expect(updateBody.settings.autoDeleteEnabled).toBe(true);
    expect(updateBody.settings.retentionDays).toBe(60);

    // Verify isolation: User 2 still has default settings
    const checkUser2Req = new NextRequest(`http://localhost:3000/api/settings/retention?userId=${user2}`, {
      headers: { "x-user-id": user2 },
    });
    const checkUser2Res = await getRetentionHandler(checkUser2Req);
    const checkUser2Body = await checkUser2Res.json();
    expect(checkUser2Body.settings.autoDeleteEnabled).toBe(false);
  });

  it("3. Validates payload and rejects malformed requests", async () => {
    const invalidReq = new NextRequest(`http://localhost:3000/api/settings/retention?userId=${user1}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user1,
      },
      body: JSON.stringify({
        autoDeleteEnabled: "not-a-boolean",
      }),
    });
    const res = await postRetentionHandler(invalidReq);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toContain("autoDeleteEnabled (boolean) is required");
  });
});
