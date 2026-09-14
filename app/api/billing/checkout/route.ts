import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getMvpPlan, getMvpPlanPages } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { planId, userId: explicitUserId, email: explicitEmail, mock } = body || {};

    if (!planId) {
      return NextResponse.json(
        { error: "planId is required" },
        { status: 400 }
      );
    }

    const plan = getMvpPlan(planId);
    if (!plan) {
      return NextResponse.json(
        {
          error: `Invalid planId: '${planId}'. Supported plans: pack_small_25, pack_large_100, agency_monthly_500`,
        },
        { status: 400 }
      );
    }

    const isTestEnv =
      process.env.NODE_ENV === "test" || process.env.VITEST === "true";

    let user: { id: string; email?: string | null } | null = null;

    if (isTestEnv && explicitUserId) {
      user = {
        id: explicitUserId,
        email: explicitEmail || "test@example.com",
      };
    } else {
      const sessionUser = await getCurrentUser();
      if (sessionUser) {
        user = { id: sessionUser.id, email: sessionUser.email };
      } else if (isTestEnv) {
        user = {
          id: "test_user_id",
          email: explicitEmail || "test@example.com",
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const pages = getMvpPlanPages(plan);
    const APP_URL =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "http://localhost:3000";

    const isMockMode =
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === "sk_test_mock" ||
      process.env.STRIPE_SECRET_KEY.includes("mock") ||
      mock === true ||
      process.env.MOCK_STRIPE === "true" ||
      (isTestEnv && !body.forceStripe);

    if (!isMockMode && process.env.STRIPE_SECRET_KEY) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-02-24.acacia" as any,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: plan.mode,
        customer_email: user.email || undefined,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: plan.name,
                description: plan.description,
              },
              unit_amount: plan.priceCents,
              ...(plan.mode === "subscription"
                ? { recurring: { interval: "month" } }
                : {}),
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
          planId: plan.id,
          pagesGranted: String(pages),
        },
        success_url: `${APP_URL}/dashboard?billing=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/pricing?billing=cancelled`,
      });

      return NextResponse.json({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: "/dashboard?mock_checkout=" + plan.id,
    });
  } catch (error: any) {
    console.error("Billing checkout session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
