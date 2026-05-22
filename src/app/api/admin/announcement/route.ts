import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

export const runtime = "nodejs";

/**
 * Dedicated endpoint for the site-wide announcement banner. Touches ONLY
 * the `announcement` column of store_settings — it can never affect the
 * store's open/closed state. An empty message clears the banner.
 *
 * The update is read back with `.select().single()` so the response
 * confirms exactly what was persisted: a save that matched no row (or was
 * blocked) surfaces as an error instead of failing silently.
 */
export async function PUT(req: Request) {
  const denied = requireAdmin();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw =
    typeof body.announcement === "string" ? body.announcement.trim() : "";
  const announcement = raw.length > 0 ? raw : null;

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("store_settings")
    .update({ announcement, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select("announcement")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    announcement: data?.announcement ?? null,
  });
}
