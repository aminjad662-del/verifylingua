import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, createOrder } from "@/lib/dashboard/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();
  const status = searchParams.get("status");

  let orders = getAllOrders();

  if (search) {
    orders = orders.filter(
      (o) =>
        o.publicCode.toLowerCase().includes(search) ||
        o.clientName.toLowerCase().includes(search) ||
        o.sourceLang.toLowerCase().includes(search) ||
        o.targetLangs.some((t) => t.toLowerCase().includes(search)) ||
        (o.matterNumber && o.matterNumber.toLowerCase().includes(search))
    );
  }

  if (status && status !== "ALL") {
    orders = orders.filter((o) => o.status === status);
  }

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.serviceType || !body.sourceLang || !body.targetLangs || !body.clientEmail) {
      return NextResponse.json({ error: "Missing required order fields" }, { status: 400 });
    }

    const order = createOrder({
      serviceType: body.serviceType,
      sourceLang: body.sourceLang,
      targetLangs: body.targetLangs,
      clientName: body.clientName || "Client",
      clientEmail: body.clientEmail,
      receivingParty: body.receivingParty,
      notes: body.notes,
      isRush: body.isRush,
      needsNotarization: body.needsNotarization,
      pageCount: body.pageCount,
      wordCount: body.wordCount,
      uploadedFiles: body.uploadedFiles,
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 500 });
  }
}
