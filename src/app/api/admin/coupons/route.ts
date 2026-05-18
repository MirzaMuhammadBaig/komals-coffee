import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

export const runtime = "nodejs";

function normalise(body: Record<string, unknown>) {
  return {
    code: String(body.code ?? "").trim().toUpperCase(),
    kind: body.kind === "flat" ? "flat" : "percent",
    value: Number(body.value),
    min_order_pkr: Number(body.min_order_pkr ?? 0),
    max_uses: body.max_uses ? Number(body.max_uses) : null,
    starts_at:
      typeof body.starts_at === "string" && body.starts_at
        ? body.starts_at
        : null,
    expires_at:
      typeof body.expires_at === "string" && body.expires_at
        ? body.expires_at
        : null,
    is_active: body.is_active !== false,
    notes: typeof body.notes === "string" ? body.notes : null,
  };
}

export async function POST(req: Request) {
  const denied = requireAdmin();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const row = normalise(body);
  if (!row.code) {
    return NextResponse.json({ error: "Code is required." }, { status: 400 });
  }
  if (!Number.isFinite(row.value) || row.value <= 0) {
    return NextResponse.json(
      { error: "Value must be greater than 0." },
      { status: 400 },
    );
  }
  if (row.kind === "percent" && row.value > 100) {
    return NextResponse.json(
      { error: "Percentage discounts cannot exceed 100." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("coupons").insert(row);
  if (error) {
    const msg = error.code === "23505" ? "That code already exists." : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
