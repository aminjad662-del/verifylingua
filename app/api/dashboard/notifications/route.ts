import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/dashboard/store";

export async function GET() {
  const orders = getAllOrders();
  const notifications: any[] = [];

  for (const order of orders) {
    if (order.status === "CLIENT_REVIEW") {
      const nid = `notif-${order.id}-review`;
      notifications.push({
        id: nid,
        orderId: order.id,
        orderCode: order.publicCode,
        title: "Translation Delivered & Ready for Review",
        message: `Your certified translation for order ${order.publicCode} is ready for inspection.`,
        type: "DELIVERY",
        createdAt: order.deliveredFiles[0]?.deliveredAt || order.promisedAt,
        read: readNotificationIds.has(nid),
      });
    }
    if (order.status === "QUOTE_SENT") {
      const nid = `notif-${order.id}-quote`;
      notifications.push({
        id: nid,
        orderId: order.id,
        orderCode: order.publicCode,
        title: "Formal Quote Available",
        message: `A quote of $${order.total.toFixed(2)} USD is available for order ${order.publicCode}.`,
        type: "QUOTE",
        createdAt: order.submittedAt,
        read: readNotificationIds.has(nid),
      });
    }
    if (order.revisions.length > 0) {
      const nid = `notif-${order.id}-rev`;
      notifications.push({
        id: nid,
        orderId: order.id,
        orderCode: order.publicCode,
        title: "Revision Being Processed",
        message: `Linguist is revising order ${order.publicCode} as requested.`,
        type: "REVISION",
        createdAt: order.revisions[0].requestedAt,
        read: readNotificationIds.has(nid) || true,
      });
    }
  }

  return NextResponse.json({ notifications });
}

// Global set of read notification IDs for user session
const readNotificationIds = new Set<string>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      const orders = getAllOrders();
      for (const order of orders) {
        readNotificationIds.add(`notif-${order.id}-review`);
        readNotificationIds.add(`notif-${order.id}-quote`);
        readNotificationIds.add(`notif-${order.id}-rev`);
      }
      return NextResponse.json({ success: true, markedAll: true });
    }

    if (notificationId) {
      readNotificationIds.add(notificationId);
      return NextResponse.json({ success: true, notificationId, read: true });
    }

    return NextResponse.json({ error: "Missing notificationId or markAllAsRead flag." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update notification status." }, { status: 500 });
  }
}
