import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from "vitest";
import { prisma } from "../lib/prisma";
import { MVP_PLANS, getMvpPlan, getMvpPlanPages } from "../lib/pricing";
import { POST as checkoutRoute } from "../app/api/billing/checkout/route";
import { POST as webhookRoute } from "../app/api/webhooks/stripe/route";
import { handleStripeWebhookEvent } from "../app/api/webhooks/stripe/handler";
import { CreditTransactionType } from "@prisma/client";
import { NextRequest } from "next/server";

describe("Commercial MVP Billing & Webhook Fulfillment", () => {
  const createdUserIds: string[] = [];

  const createTestUser = async (initialCredits = 0) => {
    const user = await prisma.user.create({
      data: {
        email: `commercial_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`,
        creditsAvailable: initialCredits,
        creditsReserved: 0,
        lifetimePagesUsed: 0,
      },
    });
    createdUserIds.push(user.id);
    return user;
  };

  afterEach(async () => {
    if (createdUserIds.length > 0) {
      await prisma.creditTransaction.deleteMany({
        where: { userId: { in: createdUserIds } },
      });
      await prisma.subscription.deleteMany({
        where: { userId: { in: createdUserIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
      createdUserIds.length = 0;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("1. Centralized Commercial MVP Plans (lib/pricing.ts)", () => {
    it("defines PACK_SMALL: 25 pages, $9.99, mode payment", () => {
      const plan = MVP_PLANS.PACK_SMALL;
      expect(plan.id).toBe("pack_small_25");
      expect(plan.name).toBe("Starter Pack");
      expect(plan.priceCents).toBe(999);
      expect(plan.pages).toBe(25);
      expect(plan.mode).toBe("payment");
      expect(plan.unitPriceDisplay).toBe("$0.40/page");
      expect(getMvpPlanPages(plan)).toBe(25);
    });

    it("defines PACK_LARGE: 100 pages, $29.99, mode payment", () => {
      const plan = MVP_PLANS.PACK_LARGE;
      expect(plan.id).toBe("pack_large_100");
      expect(plan.name).toBe("Professional Pack");
      expect(plan.priceCents).toBe(2999);
      expect(plan.pages).toBe(100);
      expect(plan.mode).toBe("payment");
      expect(plan.unitPriceDisplay).toBe("$0.30/page");
      expect(getMvpPlanPages(plan)).toBe(100);
    });

    it("defines AGENCY_MONTHLY: 500 pages/mo, $119.00/mo, mode subscription", () => {
      const plan = MVP_PLANS.AGENCY_MONTHLY;
      expect(plan.id).toBe("agency_monthly_500");
      expect(plan.name).toBe("Agency Monthly");
      expect(plan.priceCents).toBe(11900);
      expect(plan.pagesPerMonth).toBe(500);
      expect(plan.mode).toBe("subscription");
      expect(plan.unitPriceDisplay).toBe("$0.24/page");
      expect(getMvpPlanPages(plan)).toBe(500);
    });

    it("resolves plans by ID or key name via getMvpPlan", () => {
      expect(getMvpPlan("pack_small_25")).toEqual(MVP_PLANS.PACK_SMALL);
      expect(getMvpPlan("PACK_SMALL")).toEqual(MVP_PLANS.PACK_SMALL);
      expect(getMvpPlan("pack_large_100")).toEqual(MVP_PLANS.PACK_LARGE);
      expect(getMvpPlan("PACK_LARGE")).toEqual(MVP_PLANS.PACK_LARGE);
      expect(getMvpPlan("agency_monthly_500")).toEqual(MVP_PLANS.AGENCY_MONTHLY);
      expect(getMvpPlan("AGENCY_MONTHLY")).toEqual(MVP_PLANS.AGENCY_MONTHLY);
      expect(getMvpPlan("invalid_plan")).toBeUndefined();
      expect(getMvpPlan(undefined)).toBeUndefined();
    });
  });

  describe("2. Checkout API Route (/api/billing/checkout)", () => {
    it("rejects missing or invalid planId with HTTP 400", async () => {
      const reqEmpty = new NextRequest("http://localhost:3000/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const resEmpty = await checkoutRoute(reqEmpty);
      expect(resEmpty.status).toBe(400);
      const dataEmpty = await resEmpty.json();
      expect(dataEmpty.error).toContain("planId is required");

      const reqInvalid = new NextRequest("http://localhost:3000/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ planId: "nonexistent_pack" }),
      });
      const resInvalid = await checkoutRoute(reqInvalid);
      expect(resInvalid.status).toBe(400);
      const dataInvalid = await resInvalid.json();
      expect(dataInvalid.error).toContain("Invalid planId");
    });

    it("returns mock checkout URL in test environment when Stripe secret is not set", async () => {
      const user = await createTestUser();

      const req = new NextRequest("http://localhost:3000/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({
          planId: "pack_small_25",
          userId: user.id,
        }),
      });

      const res = await checkoutRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.checkoutUrl).toBe("/dashboard?mock_checkout=pack_small_25");
    });

    it("supports all 3 commercial plans on the checkout endpoint", async () => {
      const user = await createTestUser();
      const planIds = ["pack_small_25", "pack_large_100", "agency_monthly_500"];

      for (const id of planIds) {
        const req = new NextRequest("http://localhost:3000/api/billing/checkout", {
          method: "POST",
          body: JSON.stringify({
            planId: id,
            userId: user.id,
          }),
        });

        const res = await checkoutRoute(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.checkoutUrl).toBe(`/dashboard?mock_checkout=${id}`);
      }
    });

    it("handles invalid JSON payload gracefully with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/billing/checkout", {
        method: "POST",
        body: "NOT_VALID_JSON",
      });
      const res = await checkoutRoute(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Invalid JSON");
    });

    it("returns HTTP 401 when user is unauthenticated in production mode", async () => {
      const origNodeEnv = process.env.NODE_ENV;
      const origVitest = process.env.VITEST;
      try {
        process.env.NODE_ENV = "production";
        delete process.env.VITEST;

        const req = new NextRequest("http://localhost:3000/api/billing/checkout", {
          method: "POST",
          body: JSON.stringify({ planId: "pack_small_25" }),
        });
        const res = await checkoutRoute(req);
        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.error).toBe("Authentication required");
      } finally {
        process.env.NODE_ENV = origNodeEnv;
        process.env.VITEST = origVitest;
      }
    });
  });

  describe("3. Webhook Idempotency & Credit Fulfillment", () => {
    it("grants 25 credits for PACK_SMALL on checkout.session.completed", async () => {
      const user = await createTestUser(0);
      const sessionId = `cs_test_pack_small_${Date.now()}`;

      const event = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: sessionId,
            mode: "payment",
            metadata: {
              userId: user.id,
              planId: "pack_small_25",
              pagesGranted: "25",
            },
          },
        },
      };

      const result = await handleStripeWebhookEvent(event);
      expect(result.status).toBe("CREDITS_GRANTED");
      expect(result.creditsAdded).toBe(25);
      expect(result.duplicate).toBe(false);

      // Verify DB state
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser?.creditsAvailable).toBe(25);

      const txRecord = await prisma.creditTransaction.findFirst({
        where: { stripePaymentId: sessionId },
      });
      expect(txRecord).toBeDefined();
      expect(txRecord?.amount).toBe(25);
      expect(txRecord?.balanceAfter).toBe(25);
      expect(txRecord?.type).toBe(CreditTransactionType.PACK_PURCHASE);
      expect(txRecord?.description).toContain("Starter Pack (25 pages)");
    });

    it("is strictly idempotent on duplicate checkout.session.completed replay", async () => {
      const user = await createTestUser(10);
      const sessionId = `cs_test_replay_${Date.now()}`;

      const event = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: sessionId,
            mode: "payment",
            metadata: {
              userId: user.id,
              planId: "pack_large_100",
              pagesGranted: "100",
            },
          },
        },
      };

      // First webhook delivery
      const firstResult = await handleStripeWebhookEvent(event);
      expect(firstResult.status).toBe("CREDITS_GRANTED");
      expect(firstResult.creditsAdded).toBe(100);
      expect(firstResult.duplicate).toBe(false);

      const userAfterFirst = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(userAfterFirst?.creditsAvailable).toBe(110);

      // Duplicate / replayed webhook delivery
      const secondResult = await handleStripeWebhookEvent(event);
      expect(secondResult.status).toBe("DUPLICATE_IGNORED");
      expect(secondResult.creditsAdded).toBe(0);
      expect(secondResult.duplicate).toBe(true);

      // Balance must NOT have changed on duplicate replay
      const userAfterSecond = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(userAfterSecond?.creditsAvailable).toBe(110);

      // Exactly ONE transaction record exists for this stripePaymentId
      const allTxRecords = await prisma.creditTransaction.findMany({
        where: { stripePaymentId: sessionId },
      });
      expect(allTxRecords).toHaveLength(1);
    });

    it("fulfills AGENCY_MONTHLY subscription checkout with SUBSCRIPTION_GRANT type", async () => {
      const user = await createTestUser(5);
      const sessionId = `cs_test_agency_${Date.now()}`;
      const customerId = `cus_agency_${Date.now()}`;
      const subscriptionId = `sub_agency_${Date.now()}`;

      const event = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: sessionId,
            mode: "subscription",
            customer: customerId,
            subscription: subscriptionId,
            metadata: {
              userId: user.id,
              planId: "agency_monthly_500",
              pagesGranted: "500",
            },
          },
        },
      };

      const result = await handleStripeWebhookEvent(event);
      expect(result.status).toBe("CREDITS_GRANTED");
      expect(result.creditsAdded).toBe(500);

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser?.creditsAvailable).toBe(505);

      const txRecord = await prisma.creditTransaction.findFirst({
        where: { stripePaymentId: sessionId },
      });
      expect(txRecord?.type).toBe(CreditTransactionType.SUBSCRIPTION_GRANT);
      expect(txRecord?.description).toContain("Agency Monthly (500 pages)");

      // Check Subscription record
      const subRecord = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });
      expect(subRecord).toBeDefined();
      expect(subRecord?.status).toBe("ACTIVE");
      expect(subRecord?.pageQuota).toBe(500);
      expect(subRecord?.plan).toBe("AGENCY_MONTHLY");

      // Idempotent duplicate check on subscription checkout
      const dupResult = await handleStripeWebhookEvent(event);
      expect(dupResult.status).toBe("DUPLICATE_IGNORED");
      expect(dupResult.creditsAdded).toBe(0);
      expect(dupResult.duplicate).toBe(true);

      const userAfterDup = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(userAfterDup?.creditsAvailable).toBe(505);
    });

    it("fulfills invoice.payment_succeeded for monthly subscription renewals", async () => {
      const user = await createTestUser(50);
      const invoiceId = `in_renewal_${Date.now()}`;
      const subscriptionId = `sub_renew_${Date.now()}`;

      // Set up existing subscription in database
      await prisma.subscription.create({
        data: {
          userId: user.id,
          stripeSubscriptionId: subscriptionId,
          plan: "AGENCY_MONTHLY",
          status: "ACTIVE",
          pageQuota: 500,
        },
      });

      const event = {
        type: "invoice.payment_succeeded",
        data: {
          object: {
            id: invoiceId,
            subscription: subscriptionId,
            metadata: {
              userId: user.id,
              planId: "agency_monthly_500",
              pagesGranted: "500",
            },
          },
        },
      };

      const result = await handleStripeWebhookEvent(event);
      expect(result.status).toBe("CREDITS_GRANTED");
      expect(result.creditsAdded).toBe(500);

      const userAfterRenewal = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(userAfterRenewal?.creditsAvailable).toBe(550);

      const txRecord = await prisma.creditTransaction.findFirst({
        where: { stripePaymentId: invoiceId },
      });
      expect(txRecord?.type).toBe(CreditTransactionType.SUBSCRIPTION_GRANT);

      // Replay identical invoice
      const dupResult = await handleStripeWebhookEvent(event);
      expect(dupResult.status).toBe("DUPLICATE_IGNORED");
      expect(dupResult.creditsAdded).toBe(0);
    });

    it("processes webhook through the HTTP POST endpoint (/api/webhooks/stripe)", async () => {
      const user = await createTestUser(0);
      const sessionId = `cs_http_${Date.now()}`;

      const payload = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: sessionId,
            mode: "payment",
            metadata: {
              userId: user.id,
              planId: "pack_small_25",
              pagesGranted: "25",
            },
          },
        },
      };

      // Call route handler directly
      const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await webhookRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.received).toBe(true);
      expect(data.status).toBe("CREDITS_GRANTED");
      expect(data.creditsAdded).toBe(25);

      // Replay via HTTP
      const reqReplay = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const resReplay = await webhookRoute(reqReplay);
      expect(resReplay.status).toBe(200);
      const dataReplay = await resReplay.json();
      expect(dataReplay.received).toBe(true);
      expect(dataReplay.status).toBe("DUPLICATE_IGNORED");
      expect(dataReplay.creditsAdded).toBe(0);
      expect(dataReplay.duplicate).toBe(true);
    });

    it("handles invalid or unrecognized webhook events gracefully", async () => {
      const nullRes = await handleStripeWebhookEvent(null);
      expect(nullRes.status).toBe("INVALID_EVENT");
      expect(nullRes.creditsAdded).toBe(0);

      const unknownRes = await handleStripeWebhookEvent({ type: "unknown.test.event" });
      expect(unknownRes.status).toBe("IGNORED");
      expect(unknownRes.creditsAdded).toBe(0);
    });
  });
});

