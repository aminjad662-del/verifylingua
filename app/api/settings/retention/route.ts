import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { isolatedDb } from "@/lib/db/data-isolation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (cookieToken) {
        const sessionUser = await getSessionUser(cookieToken);
        userId = sessionUser?.id;
      }
    }

    if (!userId) {
      userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId") || undefined;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: User session required" }, { status: 401 });
    }

    const settings = await isolatedDb.getRetentionSettings(userId);
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err: any) {
    console.error("Error fetching retention settings:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch retention settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (cookieToken) {
        const sessionUser = await getSessionUser(cookieToken);
        userId = sessionUser?.id;
      }
    }

    if (!userId) {
      userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId") || undefined;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: User session required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { autoDeleteEnabled, retentionDays } = body;

    if (typeof autoDeleteEnabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid payload: autoDeleteEnabled (boolean) is required" },
        { status: 400 }
      );
    }

    const updated = await isolatedDb.updateRetentionSettings(userId, {
      autoDeleteEnabled,
      retentionDays: typeof retentionDays === "number" ? retentionDays : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Retention policy updated successfully",
      settings: updated,
    });
  } catch (err: any) {
    console.error("Error updating retention settings:", err);
    return NextResponse.json({ error: err.message || "Failed to update retention settings" }, { status: 500 });
  }
}
