import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = requireAdmin();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const required = ["slug", "name", "price_pkr", "category_id"];
  for (const k of required) {
    if (!body[k]) {
      return NextResponse.json(
        { error: `${k} is required` },
        { status: 400 },
      );
    }
  }

  const supabase = createSupabaseServiceClient();
  const insertRow = {
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
  };

  const { data, error } = await supabase
    .from("menu_items")
    .insert(insertRow)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data?.id });
}
