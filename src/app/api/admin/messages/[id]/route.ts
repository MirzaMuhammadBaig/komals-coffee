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
  const patch: Record<string, unknown> = {};
  if ("handled" in body) patch.handled = !!body.handled;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields" }, { status: 400 });
  }
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("contact_messages")
    .update(patch)
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
    .from("contact_messages")
    .delete()
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
