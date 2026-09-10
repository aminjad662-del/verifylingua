import { NextRequest, NextResponse } from "next/server";
import { getOrderById, addOrderMessage } from "@/lib/dashboard/store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const messages = order.messages.filter((m) => !m.isInternal);
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (!body.body || !body.body.trim()) {
    return NextResponse.json({ error: "Message body cannot be empty" }, { status: 400 });
  }

  const msg = addOrderMessage(id, {
    senderId: body.senderId || "client",
    senderName: body.senderName || "Client",
    senderRole: "CLIENT",
    body: body.body.trim(),
    attachments: body.attachments,
    isInternal: false,
  });

  if (!msg) {
    return NextResponse.json({ error: "Failed to post message" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: msg }, { status: 201 });
}
