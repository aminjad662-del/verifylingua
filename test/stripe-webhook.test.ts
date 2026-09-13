import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/webhooks/stripe/route";
import { memorySubscriptions } from "@/lib/stripe/store";
import { NextRequest } from "next/server";

describe("Stripe Webhook Pipeline & Subscription Lifecycle (/api/webhooks/stripe)", () => {
  it("rejects invalid non-JSON payload with 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: "INVALID_BODY_NOT_JSON",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid JSON");
  });

  it("processes checkout.session.completed for certified order", async () => {
    const publicCode = `VL-TEST-${Date.now().toString().slice(-4)}`;

    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_order_123",
            client_reference_id: publicCode,
            metadata: {
              publicCode,
            },
          },
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  });

  it("processes subscription upgrade event and assigns plan page quotas", async () => {
    const userEmail = `subscriber_${Date.now()}@lawfirm.com`;
    const testUserId = `user_test_${Date.now()}`;

    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({
        type: "checkout.session.completed",
        data: {
          object: {
            id: `cs_sub_${Date.now()}`,
            mode: "subscription",
            subscription: "sub_stripe_12345",
            customer: "cus_stripe_67890",
            client_reference_id: testUserId,
            customer_email: userEmail,
            metadata: {
              plan: "PRO",
              userId: testUserId,
            },
          },
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);

    const sub = memorySubscriptions.get(testUserId);
    expect(sub).toBeDefined();
    expect(sub!.plan).toBe("PRO");
    expect(sub!.pageQuota).toBe(250);
    expect(sub!.status).toBe("ACTIVE");
    expect(sub!.stripeSubscriptionId).toBe("sub_stripe_12345");
  });

  it("handles customer.subscription.deleted to cancel subscription", async () => {
    const testUserId = `user_cancel_${Date.now()}`;
    memorySubscriptions.set(testUserId, {
      userId: testUserId,
      plan: "BUSINESS",
      status: "ACTIVE",
      pageQuota: 1000,
      pagesUsed: 0,
      stripeSubscriptionId: "sub_to_cancel_999",
    });

    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({
        type: "customer.subscription.deleted",
        data: {
          object: {
            id: "sub_to_cancel_999",
          },
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);

    const sub = memorySubscriptions.get(testUserId);
    expect(sub).toBeDefined();
    expect(sub!.status).toBe("CANCELLED");
    expect(sub!.plan).toBe("FREE");
    expect(sub!.pageQuota).toBe(10);
  });
});
