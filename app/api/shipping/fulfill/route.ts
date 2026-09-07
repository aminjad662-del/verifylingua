import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const memoryShippingQueue = [
  {
    id: "ship-1",
    publicCode: "VL-8921-XQ",
    clientName: "Alejandro Martínez Rivera",
    carrier: "FedEx",
    tier: "FedEx Priority Overnight",
    address: "742 EVERGREEN TERRACE, APT 4B, SPRINGFIELD, OR 97477",
    status: "PENDING_PRINT",
    pageCount: 2,
    embossedSealRequired: true,
    orderedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    trackingNumber: null,
  },
  {
    id: "ship-2",
    publicCode: "VL-9104-MN",
    clientName: "Fatima Al-Hassan",
    carrier: "USPS",
    tier: "USPS Priority Mail with Tracking",
    address: "1200 S MICHIGAN AVE, CHICAGO, IL 60605",
    status: "PENDING_PRINT",
    pageCount: 4,
    embossedSealRequired: true,
    orderedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    trackingNumber: null,
  },
];

export async function GET(req: Request) {
  try {
    return NextResponse.json({
      success: true,
      queue: memoryShippingQueue,
      metrics: {
        pendingPrint: memoryShippingQueue.filter((s) => s.status === "PENDING_PRINT").length,
        dispatchedToday: 14,
        avgFulfillmentHours: 1.6,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load physical fulfillment queue." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { publicCode, carrier = "USPS", customTracking } = body;

    if (!publicCode) {
      return NextResponse.json({ error: "Order public code is required." }, { status: 400 });
    }

    const generatedTracking =
      customTracking ||
      (carrier === "FedEx"
        ? "78" + Math.floor(1000000000 + Math.random() * 9000000000).toString()
        : "94001" + Math.floor(100000000000000 + Math.random() * 900000000000000).toString());

    const itemIndex = memoryShippingQueue.findIndex((s) => s.publicCode === publicCode);
    if (itemIndex >= 0) {
      memoryShippingQueue[itemIndex].status = "DISPATCHED";
      memoryShippingQueue[itemIndex].trackingNumber = generatedTracking;
    }

    try {
      const queryPromise = prisma.order.findFirst({
        where: { publicCode },
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB_TIMEOUT")), 300)
      );
      const order: any = await Promise.race([queryPromise, timeoutPromise]);

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            events: {
              create: {
                type: "STATUS_CHANGE",
                message: `Physical wet-ink certified copy dispatched via ${carrier}. Tracking: ${generatedTracking}`,
                actor: "FULFILLMENT_CENTER",
              },
            },
          },
        });
      }
    } catch {
      // fallback in dev
    }

    return NextResponse.json({
      success: true,
      publicCode,
      carrier,
      trackingNumber: generatedTracking,
      status: "DISPATCHED",
      manifestUrl: `/api/certificate/VL-A8291/download?manifest=${publicCode}`,
      dispatchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to dispatch physical order." },
      { status: 500 }
    );
  }
}
