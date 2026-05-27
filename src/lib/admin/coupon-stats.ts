import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Per-coupon usage + revenue impact, aggregated from the `orders` table.
 * Keyed by uppercase code so two orders with different cased entries land
 * in the same bucket.
 *
 * Defensive: if migration 003 has not been applied (no `discount_pkr` /
 * `coupon_code` columns), the helper returns an empty map and any UI
 * driven off it shows "no usage data yet" rather than crashing.
 */
export type CouponUsageRow = {
  /** Total orders that used this code in the window. */
  orders: number;
  /** Sum of `discount_pkr` across those orders — what the shop gave up. */
  discount_total_pkr: number;
  /** Sum of `total_pkr` (post-discount) — revenue that still came in. */
  revenue_total_pkr: number;
  /** ISO string of the most recent order using this code, or null. */
  last_used_at: string | null;
};

export type CouponUsageMap = Map<string, CouponUsageRow>;

/**
 * Aggregate every `coupon_code` use into a map. Optional window narrows
 * to a date range; pass null/null for "all time".
 */
export async function getCouponUsage(
  supabase: SupabaseClient,
  since: Date | null,
  until: Date | null,
): Promise<CouponUsageMap> {
  const result: CouponUsageMap = new Map();
  try {
    let q = supabase
      .from("orders")
      .select("coupon_code, discount_pkr, total_pkr, created_at")
      .not("coupon_code", "is", null)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (since) q = q.gte("created_at", since.toISOString());
    if (until) q = q.lte("created_at", until.toISOString());

    const { data, error } = await q;
    if (error || !data) return result;

    for (const row of data as Array<{
      coupon_code: string | null;
      discount_pkr: number | null;
      total_pkr: number | null;
      created_at: string;
    }>) {
      if (!row.coupon_code) continue;
      const key = row.coupon_code.toUpperCase();
      const cur =
        result.get(key) ??
        ({
          orders: 0,
          discount_total_pkr: 0,
          revenue_total_pkr: 0,
          last_used_at: null,
        } as CouponUsageRow);
      cur.orders += 1;
      cur.discount_total_pkr += row.discount_pkr ?? 0;
      cur.revenue_total_pkr += row.total_pkr ?? 0;
      if (!cur.last_used_at || row.created_at > cur.last_used_at) {
        cur.last_used_at = row.created_at;
      }
      result.set(key, cur);
    }
  } catch {
    // Migration 003 not applied yet — return empty.
  }
  return result;
}

/**
 * The list of orders that used a specific code, for the coupon detail
 * page. Capped at 200 — Komal's scale means this stays well under that
 * for the foreseeable future.
 */
export type CouponOrderRow = {
  id: string;
  name: string;
  created_at: string;
  subtotal_pkr: number | null;
  discount_pkr: number | null;
  total_pkr: number | null;
  status: string;
  payment_status: string;
};

export async function listOrdersForCoupon(
  supabase: SupabaseClient,
  code: string,
  since: Date | null,
  until: Date | null,
): Promise<CouponOrderRow[]> {
  try {
    let q = supabase
      .from("orders")
      .select(
        "id, name, created_at, subtotal_pkr, discount_pkr, total_pkr, status, payment_status",
      )
      .ilike("coupon_code", code)
      .order("created_at", { ascending: false })
      .limit(200);
    if (since) q = q.gte("created_at", since.toISOString());
    if (until) q = q.lte("created_at", until.toISOString());
    const { data, error } = await q;
    if (error || !data) return [];
    return data as CouponOrderRow[];
  } catch {
    return [];
  }
}
