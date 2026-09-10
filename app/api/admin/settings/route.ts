import { NextRequest, NextResponse } from "next/server";
import { getSystemSettings, updateSystemSettings } from "@/lib/dashboard/store";

export async function GET() {
  const settings = getSystemSettings();
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const updated = updateSystemSettings(body);
  return NextResponse.json({ success: true, settings: updated });
}
