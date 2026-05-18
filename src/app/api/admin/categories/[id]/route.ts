import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

export const runtime = "nodejs";

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
  if (!body.slug || !body.name) {
    return NextResponse.json(
      { error: "Slug and name are required." },
      { status: 400 },
    );
  }
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("menu_categories")
    .update({
      slug: String(body.slug),
      name: String(body.name),
      description:
        typeof body.description === "string" ? body.description : null,
      sort_order: Number(body.sort_order ?? 0),
    })
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
    .from("menu_categories")
    .delete()
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
