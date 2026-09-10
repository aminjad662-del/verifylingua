import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/dashboard/store";

export async function GET() {
  const orders = getAllOrders();
  const documents: any[] = [];

  for (const order of orders) {
    for (const uf of order.uploadedFiles) {
      documents.push({
        id: uf.id,
        orderId: order.id,
        publicCode: order.publicCode,
        name: uf.name,
        category: "ORIGINAL_UPLOAD",
        serviceType: order.serviceType,
        sourceLang: order.sourceLang,
        targetLang: order.targetLangs[0] || "EN",
        sizeBytes: uf.sizeBytes,
        mimeType: uf.mimeType,
        date: uf.uploadedAt,
        sha256: uf.sha256,
        status: uf.scanStatus,
        isDelivered: false,
      });
    }
    for (const df of order.deliveredFiles) {
      documents.push({
        id: df.id,
        orderId: order.id,
        publicCode: order.publicCode,
        name: df.name,
        category: "DELIVERED_CERTIFIED",
        serviceType: order.serviceType,
        sourceLang: order.sourceLang,
        targetLang: order.targetLangs[0] || "EN",
        sizeBytes: df.sizeBytes,
        mimeType: df.mimeType,
        date: df.deliveredAt,
        sha256: df.sha256,
        verifyCode: df.verifyCode,
        downloadCount: df.downloadCount,
        isDelivered: true,
      });
    }
  }

  return NextResponse.json({ documents, retentionPolicyDays: 90 });
}
