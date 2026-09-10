import { NextRequest, NextResponse } from "next/server";
import { getSupportTickets, updateSupportTicket } from "@/lib/dashboard/store";

export async function GET() {
  const tickets = getSupportTickets();
  const cannedResponses = [
    {
      id: "cr-1",
      title: "Request Clearer High-Resolution Scan",
      text: "Thank you for your order. Our automated intake scan detected that portions of the official stamp or cursive marginal notes on your document are low-contrast. To ensure 100% acceptance by USCIS/receiving authority, could you please upload a flat, well-lit scan or high-resolution photograph of the page?",
    },
    {
      id: "cr-2",
      title: "Confirm Transliteration of Proper Names",
      text: "Before certifying your translation, our linguist noticed a variation in spelling for names. Could you please confirm the exact spelling of the applicant and parent names as they appear on your current passport or primary photo ID?",
    },
    {
      id: "cr-3",
      title: "Certified Delivery Notification & USCIS Instructions",
      text: "Your certified document translation has been fully completed, ATA accredited, and QA-verified. The official PDF package includes the sworn 8 CFR 103.2 certification affidavit and QR verification seal. You can download and print this file directly for official submission.",
    },
  ];

  return NextResponse.json({ tickets, cannedResponses });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.ticketId && body.updates) {
      const updated = updateSupportTicket(body.ticketId, body.updates);
      return NextResponse.json({ success: true, ticket: updated });
    }
    return NextResponse.json({ error: "ticketId and updates required" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update ticket" }, { status: 500 });
  }
}

