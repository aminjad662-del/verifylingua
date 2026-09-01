import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const publicCode = session.metadata?.publicCode || session.client_reference_id;
      const orderId = session.metadata?.orderId;

      if (publicCode || orderId) {
        const order = await prisma.order.findFirst({
          where: publicCode ? { publicCode } : { id: orderId },
        });

        if (order) {
          // Transition order status to PAID
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "PAID",
              stripeSessionId: session.id,
            },
          });

          // Log immutable order event
          await prisma.orderEvent.create({
            data: {
              orderId: order.id,
              type: "STATUS_CHANGE",
              message: "Payment authorized via Stripe Checkout. Order dispatched to certified translator pool.",
              actor: "SYSTEM",
            },
          });

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
