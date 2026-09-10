import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/dashboard/store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Scrub internal messages for client view
  const clientSanitizedOrder = {
    ...order,
    messages: order.messages.filter((m) => !m.isInternal),
  };

  return NextResponse.json({ order: clientSanitizedOrder });
}
