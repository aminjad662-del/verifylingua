import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { createAdminClient } from "@/supabase/admin";

// In-memory revision ledger for instant updates and fallback
const orderRevisionsStore = new Map<string, any[]>();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const publicCode = id.toUpperCase();

    const stored = orderRevisionsStore.get(publicCode) || orderRevisionsStore.get(id) || [];
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

    const { segmentId, originalText, suggestedText, notes, reason, priority } = body;
    const notesText = (suggestedText || notes || "").trim();

    if (!notesText) {
      return NextResponse.json(
        { error: "Revision notes or suggested correction text cannot be empty." },
        { status: 400 }
      );
    }

    const newRevision = {
      id: "rev-" + Math.random().toString(36).substring(2, 9),
      segmentId: segmentId || "general",
      originalText: originalText || "",
      notes: notesText,
      suggestedText: notesText,
      reason: reason || "User Clarification",
      priority: priority || "NORMAL",
      status: body.status || "PENDING",
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const current = orderRevisionsStore.get(publicCode) || orderRevisionsStore.get(id) || [];
    current.push(newRevision);
    orderRevisionsStore.set(publicCode, current);
    orderRevisionsStore.set(id, current);

    // Update order status or translation job version in database
    try {
      const supabase =
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
          ? createAdminClient()
          : await createClient();

      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .or(`id.eq.${id},public_code.eq.${publicCode}`)
        .maybeSingle();

      if (order) {
        await supabase
          .from("orders")
          .update({
            status: "processing",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);
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
