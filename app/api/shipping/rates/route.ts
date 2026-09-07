import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { destinationZip = "90210", pageCount = 2 } = body;

    const rates = [
      {
        id: "usps-first-class",
        carrier: "USPS",
        serviceName: "USPS Certified First-Class Mail",
        price: 9.95,
        estimatedDays: "3-5 Business Days",
        trackingIncluded: true,
        signatureRequired: false,
        recommended: false,
      },
      {
        id: "usps-priority",
        carrier: "USPS",
        serviceName: "USPS Priority Mail with Tracking",
        price: 19.95,
        estimatedDays: "2-3 Business Days",
        trackingIncluded: true,
        signatureRequired: false,
        recommended: true,
      },
      {
        id: "fedex-overnight",
        carrier: "FedEx",
        serviceName: "FedEx Priority Overnight",
        price: 39.95,
        estimatedDays: "Next Business Day by 10:30 AM",
        trackingIncluded: true,
        signatureRequired: true,
        recommended: false,
      },
    ];

    return NextResponse.json({
      success: true,
      destinationZip,
      pageCount,
      currency: "USD",
      rates,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to calculate shipping rates." },
      { status: 500 }
    );
  }
}
