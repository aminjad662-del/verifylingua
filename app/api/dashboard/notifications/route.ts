import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/dashboard/store";

export async function GET() {
  const orders = getAllOrders();
  const notifications: any[] = [];

  for (const order of orders) {
    if (order.status === "CLIENT_REVIEW") {
      notifications.push({
        id: `notif-${order.id}-review`,
        orderId: order.id,
        orderCode: order.publicCode,
        title: "Translation Delivered & Ready for Review",
        message: `Your certified translation for order ${order.publicCode} is ready for inspection.`,
        type: "DELIVERY",
        createdAt: order.deliveredFiles[0]?.deliveredAt || order.promisedAt,
        read: false,
      });
    }
    if (order.status === "QUOTE_SENT") {
      notifications.push({
        id: `notif-${order.id}-quote`,
        orderId: order.id,
        orderCode: order.publicCode,
        title: "Formal Quote Available",
        message: `A quote of $${order.total.toFixed(2)} USD is available for order ${order.publicCode}.`,
        type: "QUOTE",
        createdAt: order.submittedAt,
        read: false,
      });
    }
    if (order.revisions.length > 0) {
      notifications.push({
        id: `notif-${order.id}-rev`,
        orderId: order.id,
        orderCode: order.publicCode,
        title: "Revision Being Processed",
        message: `Linguist is revising order ${order.publicCode} as requested.`,
        type: "REVISION",
        createdAt: order.revisions[0].requestedAt,
        read: true,
      });
    }
  }

  return NextResponse.json({ notifications });
}
