import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { getUserAuthAuditEvents } from "@/lib/auth/audit";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized. Session required." }, { status: 401 });
  }

  const user = await getSessionUser(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Session expired." }, { status: 401 });
  }

  try {
    const events = await getUserAuthAuditEvents(user.id, user.email);
    return NextResponse.json({
      success: true,
      events: events.map((e) => ({
        id: e.id,
        action: e.action,
        ipAddress: e.ipAddress || "Internal/Local",
        userAgent: e.userAgent ? e.userAgent.slice(0, 60) : "Browser Client",
        createdAt: e.createdAt,
      })),
    });
  } catch (err: unknown) {
    console.error("Failed to retrieve audit events:", err);
    return NextResponse.json({ error: "Failed to retrieve security audit events." }, { status: 500 });
  }
}
