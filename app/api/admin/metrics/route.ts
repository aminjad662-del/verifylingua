import { NextResponse } from "next/server";
import { getAdminMetrics } from "@/lib/dashboard/store";

export async function GET() {
  const metrics = getAdminMetrics();
  return NextResponse.json({ metrics });
}
