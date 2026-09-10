import { NextRequest, NextResponse } from "next/server";
import { requestOrderRevision } from "@/lib/dashboard/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (!body.notes || !body.notes.trim()) {
    return NextResponse.json({ error: "Revision notes are required" }, { status: 400 });
  }

  const order = requestOrderRevision(id, body.notes.trim(), body.clientName || "Client");
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, order });
}
