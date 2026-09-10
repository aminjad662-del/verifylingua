import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/dashboard/store";

export async function GET() {
  const orders = getAllOrders();
  const invoices = orders.flatMap((o) =>
    o.invoices.map((i) => ({
      ...i,
      orderCode: o.publicCode,
      orderId: o.id,
      serviceType: o.serviceType,
    }))
  );

  const quotes = orders
    .filter((o) => !!o.quote)
    .map((o) => ({
      ...o.quote,
      orderCode: o.publicCode,
      orderId: o.id,
      serviceType: o.serviceType,
    }));

  const totalSpent = invoices
    .filter((i) => i.status === "PAID")
    .reduce((acc, i) => acc + i.amount, 0);

  const outstandingBalance = invoices
    .filter((i) => i.status === "PENDING")
    .reduce((acc, i) => acc + i.amount, 0);

  return NextResponse.json({
    metrics: {
      totalSpent: totalSpent.toFixed(2),
      outstandingBalance: outstandingBalance.toFixed(2),
      paidCount: invoices.filter((i) => i.status === "PAID").length,
    },
    invoices,
    quotes,
  });
}
