import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CouponForm from "@/components/admin/CouponForm";

// Convert ISO to value usable by <input type="datetime-local"> (local time, no Z).
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditCouponPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServiceClient();
  const { data: c } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!c) notFound();
  return (
    <div className="space-y-6">
      <Link
        href="/admin/coupons"
        className="link-underline inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500 hover:text-caramel-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Coupons
      </Link>
      <AdminPageHeader
        eyebrow="Edit coupon"
        title={c.code}
        description={`${c.used_count} use${c.used_count === 1 ? "" : "s"} so far`}
      />
      <CouponForm
        mode="edit"
        initial={{
          id: c.id,
          code: c.code ?? "",
          kind: (c.kind as "percent" | "flat") ?? "percent",
          value: c.value ?? 0,
          min_order_pkr: c.min_order_pkr ?? 0,
          max_uses: c.max_uses ?? null,
          starts_at: toLocalInput(c.starts_at),
          expires_at: toLocalInput(c.expires_at),
          is_active: c.is_active ?? true,
          notes: c.notes ?? "",
        }}
      />
    </div>
  );
}
