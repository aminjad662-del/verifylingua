import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/dashboard/store";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let orders = getAllOrders();

  if (user.role !== "ADMIN") {
    orders = orders.filter(o => o.clientId === user.id);
  }

  const activeOrders = orders.filter(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED" && o.status !== "ARCHIVED"
  );
  const awaitingClientAction = orders.filter(
    (o) => o.status === "CLIENT_REVIEW" || o.status === "QUOTE_SENT" || o.status === "PAYMENT_PENDING"
  );
  const inProgress = orders.filter(
    (o) => o.status === "IN_TRANSLATION" || o.status === "QUALITY_REVIEW" || o.status === "SCHEDULED"
  );
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const outstandingInvoices = orders.flatMap((o) => o.invoices).filter((i) => i.status === "PENDING");

  const recentMessages = orders
    .flatMap((o) => o.messages.map((m) => ({ ...m, orderCode: o.publicCode, orderId: o.id })))
    .filter((m) => !m.isInternal)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return NextResponse.json({
    metrics: {
      activeCount: activeOrders.length,
      awaitingActionCount: awaitingClientAction.length,
      inProgressCount: inProgress.length,
      completedCount: completedOrders.length,
      outstandingInvoicesCount: outstandingInvoices.length,
      outstandingBalance: outstandingInvoices.reduce((acc, i) => acc + i.amount, 0),
    },
    activeOrders: activeOrders.slice(0, 5),
    actionRequiredOrders: awaitingClientAction,
    recentMessages,
  });
}
