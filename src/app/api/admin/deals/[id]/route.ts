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
  const allowed = [
    "is_active",
    "title",
    "description",
    "badge",
    "image_url",
    "discount_pkr",
    "discount_percent",
    "valid_from",
    "valid_until",
    "sort_order",
  ];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) patch[k] = body[k];
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields" }, { status: 400 });
  }
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("deals")
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
    title: String(body.title ?? "").trim(),
    description:
      typeof body.description === "string" ? body.description : null,
    badge: typeof body.badge === "string" && body.badge ? body.badge : null,
    image_url:
      typeof body.image_url === "string" && body.image_url
        ? body.image_url
        : null,
    discount_pkr: body.discount_pkr ? Number(body.discount_pkr) : null,
    discount_percent: body.discount_percent
      ? Number(body.discount_percent)
      : null,
    valid_from:
      typeof body.valid_from === "string" && body.valid_from
        ? body.valid_from
        : null,
    valid_until:
      typeof body.valid_until === "string" && body.valid_until
        ? body.valid_until
        : null,
    is_active: body.is_active !== false,
    sort_order: Number(body.sort_order ?? 0),
  };
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("deals")
    .update(row)
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
    .from("deals")
    .delete()
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
