import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  const denied = requireAdmin();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // NOTE: this endpoint never touches `announcement` — that column is
  // owned solely by /api/admin/announcement, so saving the store status
  // can never clear the site-wide banner.
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("store_settings")
    .update({
      is_open: body.is_open !== false,
      closed_reason:
        typeof body.closed_reason === "string" && body.closed_reason
          ? body.closed_reason
          : null,
      closed_until:
        typeof body.closed_until === "string" && body.closed_until
          ? body.closed_until
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
