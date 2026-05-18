import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

export const runtime = "nodejs";

const ALLOWED_STATUS = new Set([
  "new",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);
const ALLOWED_PAYMENT = new Set([
  "pending",
  "paid",
  "failed",
  "cancelled",
  "refunded",
]);

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const denied = requireAdmin();
  if (denied) return denied;

  let body: { status?: unknown; payment_status?: unknown; notes?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.status === "string") {
    if (!ALLOWED_STATUS.has(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (typeof body.payment_status === "string") {
    if (!ALLOWED_PAYMENT.has(body.payment_status)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 },
      );
    }
    patch.payment_status = body.payment_status;
  }
  if (typeof body.notes === "string") {
    patch.notes = body.notes;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "No fields to update." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", params.id);
  if (error) {
    console.error("admin order update", error);
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
    .from("orders")
    .delete()
    .eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
