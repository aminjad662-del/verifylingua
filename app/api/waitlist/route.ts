import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const waitlistSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  tier: z.enum(["PRO", "ENTERPRISE", "TEAM"]).default("PRO"),
  notes: z.string().max(500).optional(),
});

interface WaitlistEntry {
  id: string;
  email: string;
  tier: string;
  notes?: string;
  createdAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __waitlistStore: Map<string, WaitlistEntry> | undefined;
}

const waitlistStore: Map<string, WaitlistEntry> =
  globalThis.__waitlistStore ?? new Map<string, WaitlistEntry>();
globalThis.__waitlistStore = waitlistStore;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const validation = waitlistSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { email, tier, notes } = validation.data;
    const id = `waitlist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const entry: WaitlistEntry = {
      id,
      email,
      tier,
      notes,
      createdAt: new Date().toISOString(),
    };

    waitlistStore.set(email, entry);

    return NextResponse.json(
      {
        success: true,
        message: "You have been added to the priority waitlist for paid automated document processing tiers.",
        entry: {
          id: entry.id,
          email: entry.email,
          tier: entry.tier,
          createdAt: entry.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to join waitlist" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const entries = Array.from(waitlistStore.values());
  return NextResponse.json({ count: entries.length, entries });
}
