import { NextRequest, NextResponse } from "next/server";
import {
  getOrganizations,
  getAllOrders,
  updateOrganization,
  addOrganization,
} from "@/lib/dashboard/store";

export async function GET() {
  const organizations = getOrganizations();
  const orders = getAllOrders();

  // Distinct clients from orders
  const clientMap = new Map();
  for (const o of orders) {
    if (!clientMap.has(o.clientEmail)) {
      clientMap.set(o.clientEmail, {
        id: o.clientId,
        name: o.clientName,
        email: o.clientEmail,
        organizationName: o.organizationName || "Individual",
        tier: o.organizationId ? "ORGANIZATION" : "INDIVIDUAL",
        role: "OWNER",
        totalOrders: 1,
        totalSpend: o.total,
        lastActive: o.submittedAt,
      });
    } else {
      const existing = clientMap.get(o.clientEmail);
      existing.totalOrders += 1;
      existing.totalSpend += o.total;
    }
  }

  const clients = Array.from(clientMap.values());
  return NextResponse.json({ clients, organizations });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "updateOrg" && body.id) {
      const updated = updateOrganization(body.id, body.updates);
      return NextResponse.json({ success: true, organization: updated });
    }
    if (body.action === "createOrg" && body.organization) {
      const created = addOrganization({
        ...body.organization,
        id: "org-" + Date.now(),
        membersCount: 1,
        activeOrdersCount: 0,
        totalSpent: 0,
      });
      return NextResponse.json({ success: true, organization: created });
    }
    return NextResponse.json({ error: "Invalid action or payload" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process" }, { status: 500 });
  }
}

