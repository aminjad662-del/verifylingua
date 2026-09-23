import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { CreditTransactionType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const pages = typeof body.pages === "number" && body.pages > 0 ? body.pages : 50;

    let userId: string | null = null;
    const sessionUser = await getCurrentUser();
    if (sessionUser?.id) {
      userId = sessionUser.id;
    } else if (body.userId) {
      userId = body.userId;
    } else {
      // Find the most recently active user or fallback to demo user
      const latestUser = await prisma.user.findFirst({
        orderBy: { updatedAt: "desc" },
      });
      if (latestUser) {
        userId = latestUser.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "No user found to grant credits" }, { status: 400 });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: userId },
        data: {
          creditsAvailable: { increment: pages },
        },
        select: {
          id: true,
          email: true,
          creditsAvailable: true,
          creditsReserved: true,
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          amount: pages,
          balanceAfter: u.creditsAvailable,
          type: CreditTransactionType.ADMIN_ADJUSTMENT,
          description: `Development test grant: +${pages} page credits`,
        },
      });

      return u;
    });

    return NextResponse.json({
      success: true,
      granted: pages,
      userId: updatedUser.id,
      availableCredits: updatedUser.creditsAvailable,
      reservedCredits: updatedUser.creditsReserved,
      message: `Successfully added ${pages} test credits. New balance: ${updatedUser.creditsAvailable} pages.`,
    });
  } catch (error: any) {
    console.error("[dev-grant] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to grant credits" }, { status: 500 });
  }
}
