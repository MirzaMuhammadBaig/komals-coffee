import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";
import { isoDate, resolveDateRange } from "@/lib/admin/date-ranges";

export const runtime = "nodejs";

type OrderItem = { name?: string; qty?: number; unit_price_pkr?: number };

/**
 * CSV export of the filtered orders list. Mirrors the same query the
 * /admin/orders page uses (range + status + search) so what the admin
 * sees on screen matches the file they download.
 *
 * Cap is high but bounded — 10,000 rows. Komal's volume is nowhere near
 * that, but the limit stops a runaway export if something goes wrong.
 */
export async function GET(req: Request) {
  const denied = requireAdmin();
  if (denied) return denied;

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "all";
  const q = (url.searchParams.get("q") ?? "").trim();
  const couponFilter = (url.searchParams.get("coupon") ?? "")
    .trim()
    .toUpperCase();
  const resolved = resolveDateRange(
    url.searchParams.get("range") ?? undefined,
    url.searchParams.get("from") ?? undefined,
    url.searchParams.get("to") ?? undefined,
  );

  // SELECT * so the export survives migration 003 not yet being applied —
  // missing columns just come back undefined and the row helper emits "".
  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10000);

  if (resolved.since) query = query.gte("created_at", resolved.since.toISOString());
  if (resolved.until) query = query.lte("created_at", resolved.until.toISOString());
  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  if (couponFilter) query = query.ilike("coupon_code", couponFilter);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const csv = toCsv(rows);
  const today = isoDate(new Date());
  const filename = `komals-orders-${today}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}

// ---------------------------------------------------------------------------

function toCsv(rows: Record<string, unknown>[]): string {
  const header = [
    "order_id",
    "created_at",
    "name",
    "phone",
    "secondary_phone",
    "email",
    "delivery_address",
    "items",
    "subtotal_pkr",
    "discount_pkr",
    "coupon_code",
    "total_pkr",
    "status",
    "payment_method",
    "payment_status",
    "channel",
    "notes",
  ];
  const lines: string[] = [header.join(",")];
  for (const r of rows) {
    const items = ((r.items as OrderItem[]) ?? [])
      .map((i) => `${i.qty ?? "?"}x ${i.name ?? "?"}`)
      .join(" | ");
    lines.push(
      [
        String(r.id ?? ""),
        String(r.created_at ?? ""),
        cell(r.name),
        cell(r.phone),
        cell(r.secondary_phone),
        cell(r.email),
        cell(r.delivery_address),
        cell(items),
        String(r.subtotal_pkr ?? ""),
        String(r.discount_pkr ?? ""),
        cell(r.coupon_code),
        String(r.total_pkr ?? 0),
        cell(r.status),
        cell(r.payment_method),
        cell(r.payment_status),
        cell(r.channel),
        cell(r.notes),
      ].join(","),
    );
  }
  return lines.join("\r\n");
}

function cell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  // Quote any cell containing , " \n \r — and escape inner quotes by doubling them.
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
