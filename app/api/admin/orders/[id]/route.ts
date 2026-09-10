import { NextRequest, NextResponse } from "next/server";
import {
  getOrderById,
  updateOrderStatus,
  assignStaffToOrder,
  addOrderMessage,
  OrderStatus,
} from "@/lib/dashboard/store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  // Admin sees all messages, including internal staff notes
  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  let order = getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (body.status) {
    order = updateOrderStatus(id, body.status as OrderStatus, body.actor || "Admin Operator");
  }

  if (body.assignments) {
    order = assignStaffToOrder(id, body.assignments, body.actor || "Admin Operator");
  }

  if (body.internalNote) {
    addOrderMessage(id, {
      senderId: body.actorId || "admin-op",
      senderName: body.actorName || "Staff Operations",
      senderRole: "STAFF",
      body: body.internalNote,
      isInternal: true,
    });
  }

  return NextResponse.json({ success: true, order });
}
