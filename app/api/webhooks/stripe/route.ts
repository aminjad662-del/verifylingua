import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { memorySubscriptions, withDbTimeout } from "@/lib/stripe/store";
import { handleStripeWebhookEvent } from "./handler";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event: any;

    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2025-02-24.acacia" as any,
      });

      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err: any) {
        console.error("⚠️ Stripe webhook signature verification failed:", err.message);
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    } else {
      // Fallback for local testing or simulated webhooks
      try {
        event = JSON.parse(rawBody);
      } catch (err) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
    }

    // Process commercial MVP plans with strict idempotency and atomic credit fulfillment
    const commercialResult = await handleStripeWebhookEvent(event);
    if (
      commercialResult.status === "CREDITS_GRANTED" ||
      commercialResult.status === "DUPLICATE_IGNORED"
    ) {
      return NextResponse.json({ received: true, ...commercialResult });
    }

    const PLAN_PAGE_QUOTAS: Record<string, number> = {
      FREE: 10,
      STARTER: 50,
      PRO: 250,
      BUSINESS: 1000,
    };

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const isSubscription = session.mode === "subscription" || Boolean(session.subscription);

      // Handle SaaS subscription upgrade
      if (isSubscription) {
        const plan = (session.metadata?.plan || "PRO").toUpperCase();
        const customerEmail = session.customer_details?.email || session.customer_email;
        const userId = session.metadata?.userId || session.client_reference_id || `user_${Date.now()}`;
        const pageQuota = PLAN_PAGE_QUOTAS[plan] || 250;

        // Record in memory store for instant offline availability
        memorySubscriptions.set(userId, {
          userId,
          plan,
          status: "ACTIVE",
          pageQuota,
          pagesUsed: 0,
          stripeCustomerId: session.customer ? String(session.customer) : undefined,
          stripeSubscriptionId: session.subscription ? String(session.subscription) : undefined,
        });

        try {
          let targetUser = null;
          if (userId) {
            targetUser = await withDbTimeout(prisma.user.findUnique({ where: { id: userId } }));
          }
          if (!targetUser && customerEmail) {
            targetUser = await withDbTimeout(prisma.user.findUnique({ where: { email: customerEmail.toLowerCase() } }));
          }

          if (targetUser) {
            await withDbTimeout(
              prisma.subscription.upsert({
                where: { userId: targetUser.id },
                create: {
                  userId: targetUser.id,
                  stripeCustomerId: session.customer ? String(session.customer) : undefined,
                  stripeSubscriptionId: session.subscription ? String(session.subscription) : undefined,
                  plan,
                  status: "ACTIVE",
                  pageQuota,
                  pagesUsed: 0,
                },
                update: {
                  stripeCustomerId: session.customer ? String(session.customer) : undefined,
                  stripeSubscriptionId: session.subscription ? String(session.subscription) : undefined,
                  plan,
                  status: "ACTIVE",
                  pageQuota,
                },
              })
            );

            await withDbTimeout(
              prisma.auditEvent.create({
                data: {
                  userId: targetUser.id,
                  action: "SUBSCRIPTION_UPGRADED",
                  resourceType: "Subscription",
                  details: { plan, pageQuota, stripeSessionId: session.id },
                },
              })
            );
          }
        } catch (dbErr) {
          console.warn("Could not persist subscription to DB:", dbErr);
        }
      }

      // Handle certified order payment
      const publicCode = session.metadata?.publicCode || session.client_reference_id;
      const orderId = session.metadata?.orderId;

      if (publicCode || orderId) {
        try {
          const order = await withDbTimeout(
            prisma.order.findFirst({
              where: publicCode ? { publicCode } : { id: orderId },
            })
          );

          if (order) {
            await withDbTimeout(
              prisma.order.update({
                where: { id: order.id },
                data: {
                  status: "PAID",
                  stripeSessionId: session.id,
                },
              })
            );

            await withDbTimeout(
              prisma.orderEvent.create({
                data: {
                  orderId: order.id,
                  type: "STATUS_CHANGE",
                  message: "Payment authorized via Stripe Checkout. Order dispatched to certified translator pool.",
                  actor: "SYSTEM",
                },
              })
            );

            // Optional Resend email dispatch if configured
            if (process.env.RESEND_API_KEY && order.guestEmail) {
              try {
                const { Resend } = await import("resend");
                const resend = new Resend(process.env.RESEND_API_KEY);
                await resend.emails.send({
                  from: "VerifyLingua <orders@verifylingua.com>",
                  to: order.guestEmail,
                  subject: `Payment Confirmed: Your Translation Order ${order.publicCode}`,
                  html: `
                    <h2>Thank you for your order!</h2>
                    <p>Your certified translation order <strong>${order.publicCode}</strong> has been confirmed and routed to an accredited ATA translator.</p>
                    <p><a href="https://verifylingua.com/order/${order.publicCode}">Track Live Order Progress →</a></p>
                  `,
                });
              } catch (emailErr) {
                console.error("⚠️ Resend email dispatch error:", emailErr);
              }
            }
          }
        } catch {}
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      for (const [uid, s] of memorySubscriptions.entries()) {
        if (s.stripeSubscriptionId === sub.id) {
          s.status = "CANCELLED";
          s.plan = "FREE";
          s.pageQuota = 10;
        }
      }

      try {
        const existing = await withDbTimeout(
          prisma.subscription.findFirst({
            where: { stripeSubscriptionId: sub.id },
          })
        );
        if (existing) {
          await withDbTimeout(
            prisma.subscription.update({
              where: { id: existing.id },
              data: {
                status: "CANCELLED",
                plan: "FREE",
                pageQuota: 10,
              },
            })
          );

          await withDbTimeout(
            prisma.auditEvent.create({
              data: {
                userId: existing.userId,
                action: "SUBSCRIPTION_CANCELLED",
                resourceType: "Subscription",
                details: { stripeSubscriptionId: sub.id },
              },
            })
          );
        }
      } catch (err) {
        console.warn("Could not cancel subscription in DB:", err);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed", details: error.message },
      { status: 500 }
    );
  }
}
