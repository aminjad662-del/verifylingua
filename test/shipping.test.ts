import { describe, it, expect } from "vitest";
import { POST as validateAddress } from "@/app/api/shipping/validate-address/route";
import { POST as getRates } from "@/app/api/shipping/rates/route";
import { GET as getFulfillQueue, POST as dispatchShipping } from "@/app/api/shipping/fulfill/route";

describe("Physical Mail Shipping & Print Fulfillment Suite (Stage 4)", () => {
  it("1. validates and normalizes physical addresses against USPS standards", async () => {
    // Missing required fields
    const invalidReq = new Request("http://localhost:3000/api/shipping/validate-address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ street: "123 Main St" }),
    });
    const invalidRes = await validateAddress(invalidReq);
    expect(invalidRes.status).toBe(400);

    // Invalid ZIP code
    const badZipReq = new Request("http://localhost:3000/api/shipping/validate-address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        street: "742 Evergreen Terrace",
        city: "Springfield",
        state: "OR",
        zipCode: "invalid-zip",
      }),
    });
    const badZipRes = await validateAddress(badZipReq);
    expect(badZipRes.status).toBe(400);

    // Valid USPS address
    const validReq = new Request("http://localhost:3000/api/shipping/validate-address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        street: "742 Evergreen Terrace",
        apartment: "Apt 4B",
        city: "Springfield",
        state: "OR",
        zipCode: "97477",
      }),
    });
    const validRes = await validateAddress(validReq);
    expect(validRes.status).toBe(200);

    const validData = await validRes.json();
    expect(validData.success).toBe(true);
    expect(validData.deliverable).toBe(true);
    expect(validData.normalized.formattedFull).toContain("SPRINGFIELD, OR 97477");
  });

  it("2. returns dynamic shipping rates across USPS and FedEx tiers", async () => {
    const req = new Request("http://localhost:3000/api/shipping/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationZip: "97477", pageCount: 2 }),
    });
    const res = await getRates(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.rates)).toBe(true);
    expect(data.rates.length).toBe(3);

    const overnight = data.rates.find((r: any) => r.id === "fedex-overnight");
    expect(overnight).toBeDefined();
    expect(overnight.price).toBe(39.95);
    expect(overnight.carrier).toBe("FedEx");
  });

  it("3. handles warehouse print queue listing and barcode label generation", async () => {
    // List queue
    const listReq = new Request("http://localhost:3000/api/shipping/fulfill");
    const listRes = await getFulfillQueue(listReq);
    expect(listRes.status).toBe(200);
    const listData = await listRes.json();
    expect(listData.success).toBe(true);
    expect(Array.isArray(listData.queue)).toBe(true);
    expect(listData.metrics).toBeDefined();

    // Dispatch order
    const dispatchReq = new Request("http://localhost:3000/api/shipping/fulfill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicCode: "VL-8921-XQ", carrier: "FedEx" }),
    });
    const dispatchRes = await dispatchShipping(dispatchReq);
    expect(dispatchRes.status).toBe(200);

    const dispatchData = await dispatchRes.json();
    expect(dispatchData.success).toBe(true);
    expect(dispatchData.trackingNumber).toMatch(/^78\d{10}$/);
    expect(dispatchData.status).toBe("DISPATCHED");
  });
});
