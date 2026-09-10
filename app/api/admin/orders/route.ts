import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, createOrder } from "@/lib/dashboard/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  let orders = getAllOrders();

  if (search) {
    orders = orders.filter(
      (o) =>
        o.publicCode.toLowerCase().includes(search) ||
        o.clientName.toLowerCase().includes(search) ||
        o.clientEmail.toLowerCase().includes(search) ||
        o.sourceLang.toLowerCase().includes(search) ||
        o.targetLangs.some((t) => t.toLowerCase().includes(search)) ||
        (o.matterNumber && o.matterNumber.toLowerCase().includes(search))
    );
  }

  if (status && status !== "ALL") {
    orders = orders.filter((o) => o.status === status);
  }

  if (priority && priority !== "ALL") {
    orders = orders.filter((o) => o.priority === priority);
  }

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = createOrder({
      serviceType: body.serviceType || "CERTIFIED",
      sourceLang: body.sourceLang || "Spanish",
      targetLangs: body.targetLangs || ["English"],
      clientName: body.clientName || "Direct Admin Client",
      clientEmail: body.clientEmail || "client@direct.com",
      receivingParty: body.receivingParty,
      notes: body.notes,
      isRush: body.isRush,
      needsNotarization: body.needsNotarization,
      pageCount: body.pageCount || 1,
      wordCount: body.wordCount || 250,
      uploadedFiles: body.uploadedFiles,
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
