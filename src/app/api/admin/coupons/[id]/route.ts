import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const denied = requireAdmin();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const allowed = ["is_active", "value", "min_order_pkr", "max_uses", "notes"];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) patch[k] = body[k];
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields" }, { status: 400 });
  }
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("coupons")
    .update(patch)
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const denied = requireAdmin();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const row = {
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
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("coupons")
    .update(row)
    .eq("id", params.id);
  if (error) {
    const msg = error.code === "23505" ? "That code already exists." : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const denied = requireAdmin();
  if (denied) return denied;
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("coupons")
    .delete()
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
