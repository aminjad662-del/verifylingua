import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { createAdminClient } from "@/supabase/admin";
import { calculatePricing } from "@/lib/pricing";
import { createTranslationJob } from "@/lib/translation/store";
import { inngest } from "@/src/inngest/client";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function generatePublicCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "VL-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const isValidUuid = (id: unknown): id is string =>
  typeof id === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

function getSupabaseClient() {
  return createAdminClient();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      guestEmail,
      sourceLang = "es",
      targetLang = "en",
      serviceType = "CERTIFIED",
      pageCount = 1,
      wordCount = 250,
      receivingParty = "USCIS",
      primaryName,
      parentName,
      dateFormat = "MM/DD/YYYY",
      needsNotarization = false,
      isExpedited = false,
      needsHardCopy = false,
      needsApostille = false,
      fileName = "document.pdf",
      fileUrl,
      stripeSessionId,
      userId: clientUserId,
    } = body;

    if (!guestEmail || !guestEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required for certified delivery." },
        { status: 400 }
      );
    }

    const pricing = calculatePricing({
      serviceType: (serviceType as "CERTIFIED" | "STANDARD") || "CERTIFIED",
      pageCount,
      wordCount,
      isExpedited,
      needsNotarization,
      needsHardCopy,
      needsApostille,
    });

    const publicCode = generatePublicCode();
    const orderId = crypto.randomUUID();
    const translationJobId = crypto.randomUUID();

    // Check for authenticated session user or valid client user UUID
    let resolvedUserId: string | null = null;
    try {
      const serverClient = await createClient();
      const {
        data: { user },
      } = await serverClient.auth.getUser();
      if (user?.id && isValidUuid(user.id)) {
        resolvedUserId = user.id;
      }
    } catch {
      // Guest order or SSR cookie context unavailable
    }

    if (!resolvedUserId && isValidUuid(clientUserId)) {
      resolvedUserId = clientUserId;
    }

    // Initialize official Supabase admin client strictly for initial order creation to safely bypass RLS
    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (clientErr: any) {
      console.error("Supabase Error:", clientErr);
      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_INSERT_FAILED",
          message: "Failed to initialize database client.",
          detail: clientErr?.message,
        },
        { status: 500 }
      );
    }

    // 1. Insert order entity into Supabase orders table
    let { data: orderRecord, error: orderError } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        user_id: resolvedUserId,
        public_code: publicCode,
        stripe_session_id: stripeSessionId || body.stripe_session_id || null,
        status: "paid",
      })
      .select()
      .single();

    // Resilient fallback: if user_id causes foreign key violation, retry with user_id: null
    if (
      orderError &&
      (orderError.code === "23503" ||
        orderError.message?.toLowerCase().includes("foreign key") ||
        orderError.message?.toLowerCase().includes("user_id"))
    ) {
      console.warn("[api/order] Retrying order insertion with user_id: null due to foreign key constraint");
      const retry = await supabase
        .from("orders")
        .insert({
          id: orderId,
          user_id: null,
          public_code: publicCode,
          stripe_session_id: stripeSessionId || body.stripe_session_id || null,
          status: "paid",
        })
        .select()
        .single();
      orderRecord = retry.data;
      orderError = retry.error;
    }

    if (orderError) {
      console.error("Supabase Error:", orderError);
      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_INSERT_FAILED",
          message: `Failed to insert order into database: ${orderError.message}`,
          detail: orderError.message,
        },
        { status: 500 }
      );
    }

    // 2. Insert corresponding translation job into Supabase translation_jobs table
    const resolvedOrderId =
      (Array.isArray(orderRecord) ? orderRecord[0]?.id : orderRecord?.id) || orderId;
    const resolvedFileUrl =
      fileUrl ||
      body.file_url ||
      `/vault/${publicCode}/${fileName || "document.pdf"}`;

    const { data: jobRecord, error: jobError } = await supabase
      .from("translation_jobs")
      .insert({
        id: translationJobId,
        order_id: resolvedOrderId,
        file_url: resolvedFileUrl,
        status: "pending",
        current_phase: "Job initialized and queued for background processing",
        error_log: null,
      })
      .select()
      .single();

    if (jobError) {
      console.error("Supabase Error:", jobError);
      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_INSERT_FAILED",
          message: `Failed to insert translation job into database: ${jobError.message}`,
          detail: jobError.message,
        },
        { status: 500 }
      );
    }

    const resolvedJobId =
      (Array.isArray(jobRecord) ? jobRecord[0]?.id : jobRecord?.id) || translationJobId;

    try {
      let timer: NodeJS.Timeout;
      await Promise.race([
        inngest.send({
          name: "document.translate",
          data: {
            jobId: String(resolvedJobId),
            orderId: String(resolvedOrderId),
            fileUrl: resolvedFileUrl,
          },
        }),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error("Inngest dispatch timeout")), 600);
          if (typeof timer?.unref === "function") timer.unref();
        }),
      ]).finally(() => {
        if (timer) clearTimeout(timer);
      });
      console.log("Inngest Event Sent!");
    } catch (inngestErr: any) {
      console.warn("[api/order] Inngest event dispatch warning:", inngestErr?.message);
    }

    // 3. Sync with in-memory store for immediate tracking endpoint resolution
    try {
      createTranslationJob({
        id: publicCode,
        fileName: fileName || "document.pdf",
        fileFormat: "pdf",
        fileSize: 1024,
        sourceLang,
        targetLang,
        originalBuffer: Buffer.from(""),
        pageCount: pricing.pageCount,
        options: { serviceTier: "certified", format: "pdf" },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      orderId: orderRecord?.id || orderId,
      jobId: publicCode,
      id: publicCode,
      publicCode: publicCode,
      translationJobId: jobRecord?.id || translationJobId,
      total: pricing.total,
      subtotal: pricing.subtotal,
      promisedAt: pricing.promisedAt,
      status: orderRecord?.status || "paid",
      order: orderRecord,
      translationJob: jobRecord,
    });
  } catch (err: any) {
    console.error("Supabase Error:", err);
    console.error("[api/order] Order creation failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: "DATABASE_INSERT_FAILED",
        message: err.message || "Failed to initialize certified order.",
        detail: err.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseClient();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || searchParams.get("public_code") || searchParams.get("id");

    let query = supabase.from("orders").select("*, translation_jobs(*)");
    if (code) {
      query = query.or(`public_code.eq.${code},id.eq.${code}`);
    }
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, orders: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
