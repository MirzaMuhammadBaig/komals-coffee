import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

export const runtime = "nodejs";

// Partial update (used by toggle-active in the row actions).
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
    "is_signature",
    "is_bestseller",
    "price_pkr",
    "sort_order",
    "name",
    "description",
    "size",
    "image_url",
    "tags",
    "category_id",
  ];
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of allowed) {
    if (k in body) patch[k] = body[k];
  }
  if (Object.keys(patch).length === 1) {
    return NextResponse.json(
      { error: "No fields to update." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("menu_items")
    .update(patch)
    .eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

// Full update used by the edit form.
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

  const supabase = createSupabaseServiceClient();
  const patch = {
    slug: String(body.slug),
    name: String(body.name),
    description: typeof body.description === "string" ? body.description : null,
    price_pkr: Number(body.price_pkr),
    size: typeof body.size === "string" && body.size ? body.size : null,
    image_url:
      typeof body.image_url === "string" && body.image_url
        ? body.image_url
        : null,
    category_id: String(body.category_id),
    tags: Array.isArray(body.tags) ? (body.tags as string[]) : [],
    is_active: body.is_active !== false,
    is_signature: !!body.is_signature,
    is_bestseller: !!body.is_bestseller,
    sort_order: Number(body.sort_order ?? 0),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("menu_items")
    .update(patch)
    .eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    .from("menu_items")
    .delete()
    .eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
