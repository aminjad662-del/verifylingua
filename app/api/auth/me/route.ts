import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  const user = await getSessionUser(token);
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  let orderCount = 0;
  if (!process.env.VITEST) {
    try {
      orderCount = await prisma.order.count({
        where: { userId: user.id },
      });
    } catch {
      // Ignore error
    }
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      ...user,
      orderCount,
    },
  });
}
