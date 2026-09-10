import { NextRequest, NextResponse } from "next/server";
import { approveOrderTranslation } from "@/lib/dashboard/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const order = approveOrderTranslation(id, body.clientName || "Client");
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, order });
}
