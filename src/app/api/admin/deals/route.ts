import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

export const runtime = "nodejs";

function normalise(b: Record<string, unknown>) {
  return {
    title: String(b.title ?? "").trim(),
    description: typeof b.description === "string" ? b.description : null,
    badge: typeof b.badge === "string" && b.badge ? b.badge : null,
    image_url: typeof b.image_url === "string" && b.image_url ? b.image_url : null,
    discount_pkr: b.discount_pkr ? Number(b.discount_pkr) : null,
    discount_percent: b.discount_percent ? Number(b.discount_percent) : null,
    valid_from: typeof b.valid_from === "string" && b.valid_from ? b.valid_from : null,
    valid_until: typeof b.valid_until === "string" && b.valid_until ? b.valid_until : null,
    is_active: b.is_active !== false,
    sort_order: Number(b.sort_order ?? 0),
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
  if (!row.title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("deals").insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
