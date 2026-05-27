import type { SupabaseClient } from "@supabase/supabase-js";

export type CouponKind = "percent" | "flat";

export type Coupon = {
  id: string;
  code: string;
  kind: CouponKind;
  value: number;
  min_order_pkr: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
};

export type CouponValidation =
  | {
      ok: true;
      coupon: Pick<Coupon, "id" | "code" | "kind" | "value" | "min_order_pkr">;
      /** Discount in PKR, already floored to the subtotal so total is never negative. */
      discount_pkr: number;
      /** Subtotal after discount. */
      total_pkr: number;
    }
  | {
      ok: false;
      reason:
        | "not_found"
        | "inactive"
        | "not_yet_started"
        | "expired"
        | "max_uses_reached"
        | "min_order_not_met"
        | "invalid_subtotal";
      message: string;
    };

/**
 * Compute the discount for a known coupon row. Pure — no DB hit. The
 * insertion path and the public preview endpoint both pipe through this
 * so the number can never disagree between preview and final order.
 */
export function computeDiscount(
  coupon: Pick<Coupon, "kind" | "value">,
  subtotal_pkr: number,
): number {
  if (subtotal_pkr <= 0) return 0;
  let d = 0;
  if (coupon.kind === "percent") {
    d = Math.round((subtotal_pkr * coupon.value) / 100);
  } else {
    d = Math.round(coupon.value);
  }
  // Never let the discount exceed the subtotal.
  return Math.max(0, Math.min(d, subtotal_pkr));
}

/**
 * Server-side coupon validation. Looks up the code, runs every eligibility
 * rule (active, in-window, under max uses, meets min order), and returns
 * either a {discount, total} preview or a structured rejection.
 *
 * This is the SAME function the /api/coupons/validate endpoint uses for
 * the preview and the /api/orders endpoint uses pre-redemption — so the
 * customer's preview total can never disagree with the charged total.
 */
export async function validateCoupon(
  supabase: SupabaseClient,
  rawCode: string,
  subtotal_pkr: number,
): Promise<CouponValidation> {
  if (!Number.isFinite(subtotal_pkr) || subtotal_pkr <= 0) {
    return {
      ok: false,
      reason: "invalid_subtotal",
      message: "Add at least one drink before applying a code.",
    };
  }

  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return {
      ok: false,
      reason: "not_found",
      message: "Enter a code to apply.",
    };
  }

  const { data, error } = await supabase
    .from("coupons")
    .select(
      "id, code, kind, value, min_order_pkr, max_uses, used_count, starts_at, expires_at, is_active",
    )
    .ilike("code", code)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      reason: "not_found",
      message: "That code is not recognised.",
    };
  }

  const c = data as Coupon;
  const now = Date.now();

  if (!c.is_active) {
    return {
      ok: false,
      reason: "inactive",
      message: "This code is no longer active.",
    };
  }
  if (c.starts_at && new Date(c.starts_at).getTime() > now) {
    return {
      ok: false,
      reason: "not_yet_started",
      message: "This code is not available yet.",
    };
  }
  if (c.expires_at && new Date(c.expires_at).getTime() < now) {
    return {
      ok: false,
      reason: "expired",
      message: "This code has expired.",
    };
  }
  if (c.max_uses !== null && c.used_count >= c.max_uses) {
    return {
      ok: false,
      reason: "max_uses_reached",
      message: "This code has been fully redeemed.",
    };
  }
  if (subtotal_pkr < c.min_order_pkr) {
    return {
      ok: false,
      reason: "min_order_not_met",
      message: `Code requires a minimum order of Rs ${c.min_order_pkr.toLocaleString()}.`,
    };
  }

  const discount = computeDiscount(c, subtotal_pkr);
  return {
    ok: true,
    coupon: {
      id: c.id,
      code: c.code,
      kind: c.kind,
      value: c.value,
      min_order_pkr: c.min_order_pkr,
    },
    discount_pkr: discount,
    total_pkr: subtotal_pkr - discount,
  };
}

/**
 * Atomically redeem a coupon via the `redeem_coupon(p_code text)` SQL
 * function from migration 003. Returns the redeemed coupon row, or null
 * if the code lost a race / became invalid between preview and order.
 *
 * The caller MUST handle null by either re-pricing without the discount
 * or returning an error to the customer.
 */
export async function redeemCoupon(
  supabase: SupabaseClient,
  code: string,
): Promise<{
  id: string;
  code: string;
  kind: CouponKind;
  value: number;
  min_order_pkr: number;
} | null> {
  const { data, error } = await supabase.rpc("redeem_coupon", {
    p_code: code.trim().toUpperCase(),
  });
  if (error || !data || !Array.isArray(data) || data.length === 0) return null;
  return data[0] as {
    id: string;
    code: string;
    kind: CouponKind;
    value: number;
    min_order_pkr: number;
  };
}
