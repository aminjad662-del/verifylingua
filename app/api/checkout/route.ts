import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const plan = (body.plan || "PRO").toUpperCase();

    const prices: Record<string, number> = {
      STARTER: 2900, // $29.00
      PRO: 7900,     // $79.00
      BUSINESS: 19900 // $199.00
    };

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (stripeKey && !process.env.VITEST) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" as any });
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        customer_email: user?.email || undefined,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `VerifyLingua ${plan} Plan`,
                description: `High-Fidelity Autonomous Document Translation (${plan})`,
              },
              unit_amount: prices[plan] || 7900,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/translate?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
        cancel_url: `${appUrl}/translate`,
      });

      return NextResponse.json({ url: session.url, sessionId: session.id });
    }

    // Test / local dev fallback checkout session
    return NextResponse.json({
      url: `${appUrl}/translate?upgraded=${plan}`,
      sessionId: `mock_sub_${Date.now()}`,
      plan,
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: err.message || "Failed to initialize checkout session." }, { status: 500 });
  }
}
