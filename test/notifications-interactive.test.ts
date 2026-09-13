import { describe, it, expect } from "vitest";
import { GET as getDashboardNotifs, POST as updateDashboardNotif } from "@/app/api/dashboard/notifications/route";
import { POST as dispatchOmnichannelNotif } from "@/app/api/notifications/dispatch/route";
import { NextRequest } from "next/server";

describe("Notifications System & Dispatch Pipeline", () => {
  it("fetches active user notifications via GET /api/dashboard/notifications", async () => {
    const res = await getDashboardNotifs();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.notifications)).toBe(true);
  });

  it("marks a notification as read via POST /api/dashboard/notifications", async () => {
    const req = new NextRequest("http://localhost:3000/api/dashboard/notifications", {
      method: "POST",
      body: JSON.stringify({
        notificationId: "notif-ord-123-review",
      }),
    });

    const res = await updateDashboardNotif(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.notificationId).toBe("notif-ord-123-review");
    expect(data.read).toBe(true);
  });

  it("supports markAllAsRead flag", async () => {
    const req = new NextRequest("http://localhost:3000/api/dashboard/notifications", {
      method: "POST",
      body: JSON.stringify({
        markAllAsRead: true,
      }),
    });

    const res = await updateDashboardNotif(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.markedAll).toBe(true);
  });

  it("rejects dispatch request without recipient email with 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/notifications/dispatch", {
      method: "POST",
      body: JSON.stringify({
        recipientEmail: "",
      }),
    });

    const res = await dispatchOmnichannelNotif(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Valid recipient email is required");
  });

  it("successfully dispatches omnichannel notification for PROOF_READY", async () => {
    const req = new NextRequest("http://localhost:3000/api/notifications/dispatch", {
      method: "POST",
      body: JSON.stringify({
        recipientEmail: "client@lawfirm.com",
        recipientPhone: "+15551234567",
        eventType: "PROOF_READY",
        orderCode: "VL-8921-XQ",
      }),
    });

    const res = await dispatchOmnichannelNotif(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.emailDispatched).toBe(true);
    expect(data.smsDispatched).toBe(true);
    expect(data.emailPreview.subject).toContain("Proofing Studio");
  });
});
