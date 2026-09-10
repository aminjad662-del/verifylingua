import { NextRequest, NextResponse } from "next/server";
import { getTranslators, updateTranslator, addTranslator } from "@/lib/dashboard/store";

export async function GET() {
  const translators = getTranslators();
  return NextResponse.json({ translators });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "update" && body.id) {
      const updated = updateTranslator(body.id, body.updates);
      return NextResponse.json({ success: true, translator: updated });
    }
    if (body.action === "create" && body.translator) {
      const created = addTranslator({
        ...body.translator,
        id: "tr-" + Date.now(),
        completedOrders: 0,
        activeWorkload: 0,
        rating: 5.0,
      });
      return NextResponse.json({ success: true, translator: created });
    }
    return NextResponse.json({ error: "Invalid action or payload" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process" }, { status: 500 });
  }
}

