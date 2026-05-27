import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { validateCoupon } from "@/lib/coupons";

export const runtime = "nodejs";

/**
 * Public coupon-preview endpoint. Customer types a code, the order form
 * POSTs here with the current subtotal, and the server replies with the
 * exact discount + total that would be charged.
 *
 * It re-runs the same `validateCoupon` the order insert uses, so the
 * preview cannot diverge from the actual charge. The endpoint is
 * read-only — usage count is bumped only at order insert, never here.
 */
export async function POST(req: Request) {
  let body: { code?: unknown; subtotal_pkr?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code : "";
  const subtotal =
    typeof body.subtotal_pkr === "number" ? body.subtotal_pkr : NaN;

  const supabase = createSupabaseServiceClient();
  const result = await validateCoupon(supabase, code, subtotal);
  // 200 for both ok and a structured rejection — the form needs the
  // `reason` and `message` to render the right error inline.
  return NextResponse.json(result);
}
