import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Public order-summary endpoint, read-only. Returns just the safe
 * receipt-ish fields for an order id — never the address, the phone,
 * the notes, or anything PII. Used by /order/success to render the
 * receipt without leaking any customer detail into the URL.
 *
 * Defensive against migration 003 not being applied yet: subtotal_pkr
 * / discount_pkr / coupon_code may be undefined; the response simply
 * omits them and the success page falls back to total only.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = data as Record<string, unknown>;
  return NextResponse.json({
    order_id: String(row.id ?? params.id),
    order_number: String(row.id ?? "").slice(0, 8).toUpperCase(),
    subtotal_pkr:
      typeof row.subtotal_pkr === "number" ? row.subtotal_pkr : null,
    discount_pkr:
      typeof row.discount_pkr === "number" ? row.discount_pkr : null,
    coupon_code:
      typeof row.coupon_code === "string" ? row.coupon_code : null,
    total_pkr: typeof row.total_pkr === "number" ? row.total_pkr : null,
    payment_method: row.payment_method ?? null,
    payment_status: row.payment_status ?? null,
  });
}
