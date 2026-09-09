import { NextRequest, NextResponse } from "next/server";
import { getObject } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl || new URL(req.url, "http://localhost:3000");
    const key = url.searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
    }

    const buffer = await getObject(key);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${key.split("/").pop() || "download"}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "File not found" }, { status: 404 });
  }
}
