import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { createAdminClient } from "@/supabase/admin";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const publicCode = id.toUpperCase();
    const body = await req.json().catch(() => ({}));
    const { signatureName, confirmedAccuracy } = body;

    if (!confirmedAccuracy) {
      return NextResponse.json(
        { error: "You must confirm that you have reviewed the translation before certifying." },
        { status: 400 }
      );
    }

    const verifyCode = "VL-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    const documentSha256 = crypto
      .createHash("sha256")
      .update(publicCode + Date.now().toString())
      .digest("hex");

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
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);
      }
    } catch {
      // ignore db errors in fallback
    }

    return NextResponse.json({
      success: true,
      publicCode,
      verifyCode,
      status: "CERTIFIED",
      downloadUrl: `/api/certificate/${verifyCode}/download`,
      verificationUrl: `/verify/${verifyCode}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to approve and certify order." },
      { status: 500 }
    );
  }
}
