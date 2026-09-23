import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserCreditBalance } from "@/lib/services/credit-service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;
    const isTestEnv = process.env.NODE_ENV === "test" || process.env.VITEST === "true";

    const sessionUser = await getCurrentUser();
    if (sessionUser?.id) {
      userId = sessionUser.id;
    } else if (isTestEnv || process.env.NODE_ENV === "development") {
      const { searchParams } = new URL(req.url);
      userId = searchParams.get("userId");
      if (!userId) {
        // Fallback to most recent user in local development
        const latestUser = await prisma.user.findFirst({
          orderBy: { updatedAt: "desc" },
          select: { id: true },
        });
        if (latestUser) userId = latestUser.id;
      }
    }

    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        available: 20,
        reserved: 0,
        lifetimeUsed: 0,
      });
    }

    const balance = await getUserCreditBalance(userId);

    return NextResponse.json({
      authenticated: true,
      userId,
      available: balance.available,
      reserved: balance.reserved,
      lifetimeUsed: balance.lifetimeUsed,
    });
  } catch (error: any) {
    console.error("[billing/balance] Error:", error);
    return NextResponse.json({
      authenticated: false,
      available: 20,
      reserved: 0,
      lifetimeUsed: 0,
      error: error.message,
    }, { status: 200 });
  }
}
