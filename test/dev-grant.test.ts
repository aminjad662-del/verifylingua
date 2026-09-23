import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "../lib/prisma";
import { POST as devGrantPost } from "../app/api/billing/dev-grant/route";
import { GET as balanceGet } from "../app/api/billing/balance/route";
import { NextRequest } from "next/server";
import crypto from "crypto";

describe("Development Credit Grant & Balance API", () => {
  const createdUserIds: string[] = [];

  afterAll(async () => {
    for (const userId of createdUserIds) {
      try {
        await prisma.creditTransaction.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } });
      } catch {}
    }
  });

  it("grants test credits and records credit transaction", async () => {
    const userId = `usr_grant_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@test.com`,
        creditsAvailable: 20,
        creditsReserved: 0,
        lifetimePagesUsed: 0,
      },
    });
    createdUserIds.push(user.id);

    const req = new NextRequest("http://localhost:3000/api/billing/dev-grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, pages: 50 }),
    });

    const res = await devGrantPost(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.granted).toBe(50);
    expect(json.availableCredits).toBe(70);

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(dbUser?.creditsAvailable).toBe(70);

    // Verify GET /api/billing/balance returns the updated balance
    const balanceReq = new NextRequest(`http://localhost:3000/api/billing/balance?userId=${user.id}`);
    const balanceRes = await balanceGet(balanceReq);
    expect(balanceRes.status).toBe(200);
    const balanceJson = await balanceRes.json();
    expect(balanceJson.available).toBe(70);
    expect(balanceJson.reserved).toBe(0);
  });
});

