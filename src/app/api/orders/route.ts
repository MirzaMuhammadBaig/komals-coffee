import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  createSafepayTracker,
  isSafepayConfigured,
} from "@/lib/safepay/client";
import { getStoreSettings } from "@/lib/admin/store";
import { nextAutoAdvanceAt } from "@/lib/admin/busyness-types";

export const runtime = "nodejs";

type OrderItem = {
  slug: string;
  name: string;
  qty: number;
  unit_price_pkr: number;
};

export async function POST(req: Request) {
  // Block ordering if Komal has closed the store from the admin dashboard.
  const store = await getStoreSettings();
  if (store && !store.is_open) {
    return NextResponse.json(
      {
        error:
          store.closed_reason
            ? `We are closed: ${store.closed_reason}`
            : "We are temporarily closed. Please try again later.",
      },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const secondaryPhone =
    typeof body.secondary_phone === "string" ? body.secondary_phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : null;
  const deliveryAddress =
    typeof body.delivery_address === "string"
      ? body.delivery_address.trim()
      : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : null;
  const totalPkr =
    typeof body.total_pkr === "number" ? Math.round(body.total_pkr) : null;
  const items = Array.isArray(body.items) ? (body.items as OrderItem[]) : [];
  const paymentMethod = body.payment_method === "card" ? "card" : "cod";

  if (!name || !phone || !secondaryPhone || !deliveryAddress) {
    return NextResponse.json(
      {
        error:
          "Name, both phone numbers and delivery address are required to place an order.",
      },
      { status: 400 },
    );
  }
  if (items.length === 0) {
    return NextResponse.json(
      { error: "Add at least one drink to your order." },
      { status: 400 },
    );
  }
  for (const it of items) {
    if (
      typeof it.slug !== "string" ||
      typeof it.name !== "string" ||
      typeof it.qty !== "number" ||
      typeof it.unit_price_pkr !== "number" ||
      it.qty < 1
    ) {
      return NextResponse.json(
        { error: "Invalid items payload." },
        { status: 400 },
      );
    }
  }

  // Card payments must have a valid total to charge.
  if (paymentMethod === "card" && (!totalPkr || totalPkr <= 0)) {
    return NextResponse.json(
      { error: "Total amount is required for card payment." },
      { status: 400 },
    );
  }

  // Start the auto-advance clock the moment the order lands. COD starts
  // immediately ("new" already counts); card orders need to be paid first,
  // so we leave auto_advance_at null and let the webhook set it on capture.
  let initialAutoAdvanceAt: string | null = null;
  if (paymentMethod === "cod" && store) {
    const future = nextAutoAdvanceAt(
      "new",
      store.busyness_level,
      store.auto_progress_minutes,
    );
    if (future) initialAutoAdvanceAt = future.toISOString();
  }

  const supabase = createSupabaseServiceClient();
  const baseInsert = {
    name,
    phone,
    secondary_phone: secondaryPhone,
    email,
    delivery_address: deliveryAddress,
    notes,
    items,
    total_pkr: totalPkr,
    channel: "website",
    payment_method: paymentMethod,
    payment_status: "pending",
    payment_provider: paymentMethod === "card" ? "safepay" : null,
  } as Record<string, unknown>;

  // Defensive: try with the new auto_advance_at column. If the busyness
  // migration has not been applied yet, retry without it so ordering
  // keeps working in older deployments.
  let inserted: { id: string } | null = null;
  let insertError: { message: string; code?: string } | null = null;
  {
    const payload = initialAutoAdvanceAt
      ? { ...baseInsert, auto_advance_at: initialAutoAdvanceAt }
      : baseInsert;
    const res = await supabase
      .from("orders")
      .insert(payload)
      .select("id")
      .single();
    inserted = res.data;
    insertError = res.error;
  }
  if (insertError && /auto_advance_at/i.test(insertError.message)) {
    const res = await supabase
      .from("orders")
      .insert(baseInsert)
      .select("id")
      .single();
    inserted = res.data;
    insertError = res.error;
  }

  if (insertError || !inserted) {
    console.error("order insert failed", insertError);
    return NextResponse.json(
      { error: "Could not save your order. Please try again in a moment." },
      { status: 500 },
    );
  }

  // ── Cash on delivery: done, Komal will confirm by WhatsApp.
  if (paymentMethod === "cod") {
    return NextResponse.json({
      ok: true,
      order_id: inserted.id,
      payment_method: "cod",
    });
  }

  // ── Card payment via Safepay.
  if (!isSafepayConfigured()) {
    return NextResponse.json(
      {
        error:
          "Card payment is not configured yet. Please choose Cash on Delivery for now, or message Komal on WhatsApp.",
      },
      { status: 503 },
    );
  }

  try {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      new URL(req.url).origin;

    const { checkoutUrl, tracker } = await createSafepayTracker({
      amountPkr: totalPkr ?? 0,
      orderId: inserted.id,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      redirectUrl: `${origin}/order/success?order_id=${inserted.id}`,
      cancelUrl: `${origin}/order/cancel?order_id=${inserted.id}`,
    });

    await supabase
      .from("orders")
      .update({ payment_tracker: tracker })
      .eq("id", inserted.id);

    return NextResponse.json({
      ok: true,
      order_id: inserted.id,
      payment_method: "card",
      redirect: checkoutUrl,
    });
  } catch (err) {
    console.error("safepay init failed", err);
    // Mark the order so we know payment failed to initialise.
    await supabase
      .from("orders")
      .update({ payment_status: "failed" })
      .eq("id", inserted.id);
    return NextResponse.json(
      {
        error:
          "Could not start card payment. Please try again or pick Cash on Delivery.",
      },
      { status: 502 },
    );
  }
}
