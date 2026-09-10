import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, updateQAChecklist } from "@/lib/dashboard/store";

export async function GET() {
  const orders = getAllOrders();
  const qaQueue = orders.filter(
    (o) => o.status === "IN_TRANSLATION" || o.status === "QUALITY_REVIEW" || o.status === "CLIENT_REVIEW"
  );
  return NextResponse.json({ queue: qaQueue });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.orderId || !body.checklist) {
    return NextResponse.json({ error: "orderId and checklist required" }, { status: 400 });
  }

  const order = updateQAChecklist(body.orderId, body.checklist, body.reviewerName || "Lead QA");
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, order });
}
