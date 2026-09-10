import { NextRequest, NextResponse } from "next/server";
import { getAllOrders } from "@/lib/dashboard/store";

export async function GET() {
  const orders = getAllOrders();
  const invoices = orders.flatMap((o) =>
    o.invoices.map((i) => ({
      ...i,
      orderCode: o.publicCode,
      orderId: o.id,
      clientName: o.clientName,
      clientEmail: o.clientEmail,
      serviceType: o.serviceType,
      sourceLang: o.sourceLang,
      targetLang: o.targetLangs[0],
    }))
  );

  const totalRevenue = invoices.filter((i) => i.status === "PAID").reduce((acc, i) => acc + i.amount, 0);
  const pendingReceivables = invoices.filter((i) => i.status === "PENDING").reduce((acc, i) => acc + i.amount, 0);

  const revenueByService = [
    { service: "Certified (USCIS)", revenue: totalRevenue * 0.52, count: 24 },
    { service: "Medical & Clinical", revenue: totalRevenue * 0.28, count: 8 },
    { service: "Legal & Court", revenue: totalRevenue * 0.12, count: 6 },
    { service: "Notarized Translation", revenue: totalRevenue * 0.08, count: 4 },
  ];

  return NextResponse.json({
    metrics: {
      totalRevenue: totalRevenue.toFixed(2),
      pendingReceivables: pendingReceivables.toFixed(2),
      refundsTotal: "49.90",
      grossMargin: "94.2%",
    },
    invoices,
    revenueByService,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orders = getAllOrders();

    if (body.action === "markPaid" && body.invoiceId) {
      for (const o of orders) {
        const inv = o.invoices.find((i) => i.id === body.invoiceId);
        if (inv) {
          inv.status = "PAID";
          inv.paidAt = new Date().toISOString();
          return NextResponse.json({ success: true, invoice: inv });
        }
      }
    }

    if (body.action === "refund" && body.invoiceId) {
      for (const o of orders) {
        const inv = o.invoices.find((i) => i.id === body.invoiceId);
        if (inv) {
          inv.status = "REFUNDED";
          return NextResponse.json({ success: true, invoice: inv });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Action processed" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process finance action" }, { status: 500 });
  }
}

