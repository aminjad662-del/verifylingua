import { NextRequest, NextResponse } from "next/server";
import {
  getAllOrders,
  getSystemSettings,
  updateSystemSettings,
  updateOrder,
} from "@/lib/dashboard/store";

export async function GET() {
  const orders = getAllOrders();
  const settings = getSystemSettings();
  const quotes = orders
    .filter((o) => !!o.quote)
    .map((o) => ({
      ...o.quote,
      orderId: o.id,
      orderCode: o.publicCode,
      clientName: o.clientName,
      clientEmail: o.clientEmail,
      serviceType: o.serviceType,
      sourceLang: o.sourceLang,
      targetLangs: o.targetLangs,
      pageCount: o.pageCount,
      wordCount: o.wordCount,
    }));

  return NextResponse.json({
    quotes,
    pricingRules: settings.pricingRules,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.pricingRules) {
      const updated = updateSystemSettings({ pricingRules: body.pricingRules });
      return NextResponse.json({ success: true, pricingRules: updated.pricingRules });
    }
    if (body.orderId && body.quote) {
      const updated = updateOrder(body.orderId, { quote: body.quote, status: "QUOTE_SENT" });
      return NextResponse.json({ success: true, order: updated });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update" }, { status: 500 });
  }
}

