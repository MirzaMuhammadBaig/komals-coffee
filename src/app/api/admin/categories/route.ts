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
  if (!body.slug || !body.name) {
    return NextResponse.json(
      { error: "Slug and name are required." },
      { status: 400 },
    );
  }
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("menu_categories").insert({
    slug: String(body.slug),
    name: String(body.name),
    description: typeof body.description === "string" ? body.description : null,
    sort_order: Number(body.sort_order ?? 0),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
