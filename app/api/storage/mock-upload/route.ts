import { NextRequest, NextResponse } from "next/server";
import { putObject } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const url = req.nextUrl || new URL(req.url, "http://localhost:3000");
    const key = url.searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
    }

    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = req.headers.get("content-type") || "application/octet-stream";

    await putObject(key, buffer, contentType);

    return new NextResponse(null, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed mock upload" }, { status: 500 });
  }
}
