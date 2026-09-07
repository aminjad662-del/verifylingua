import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-memory revision ledger for instant updates and fallback
const orderRevisionsStore = new Map<string, any[]>();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const publicCode = id.toUpperCase();

    const stored = orderRevisionsStore.get(publicCode) || [];
    return NextResponse.json({ success: true, revisions: stored });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const publicCode = id.toUpperCase();
    const body = await req.json();

    const { segmentId, originalText, suggestedText, reason } = body;

    if (!suggestedText || !suggestedText.trim()) {
      return NextResponse.json(
        { error: "Suggested correction text cannot be empty." },
        { status: 400 }
      );
    }

    const newRevision = {
      id: "rev-" + Math.random().toString(36).substring(2, 9),
      segmentId: segmentId || "general",
      originalText: originalText || "",
      suggestedText: suggestedText.trim(),
      reason: reason || "User Clarification",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    const current = orderRevisionsStore.get(publicCode) || [];
    current.push(newRevision);
    orderRevisionsStore.set(publicCode, current);

    // Optionally update order status and append event to Prisma if available
    try {
      const queryPromise = prisma.order.findFirst({
        where: { OR: [{ id }, { publicCode }] },
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB_TIMEOUT")), 300)
      );
      const order: any = await Promise.race([queryPromise, timeoutPromise]);

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "NEEDS_CUSTOMER_INPUT",
            events: {
              create: {
                type: "CUSTOMER_ACTION",
                message: `Customer requested revision on ${segmentId}: "${suggestedText.substring(0, 60)}..."`,
                actor: "CUSTOMER",
              },
            },
          },
        });
      }
    } catch {
      // ignore in dev without db connection
    }

    return NextResponse.json({
      success: true,
      revision: newRevision,
      totalPending: current.filter((r) => r.status === "PENDING").length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit revision request." },
      { status: 500 }
    );
  }
}
