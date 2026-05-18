import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DealForm from "@/components/admin/DealForm";

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditDealPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServiceClient();
  const { data: d } = await supabase
    .from("deals")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!d) notFound();
  return (
    <div className="space-y-6">
      <Link
        href="/admin/deals"
        className="link-underline inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500 hover:text-caramel-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Deals
      </Link>
      <AdminPageHeader eyebrow="Edit deal" title={d.title} />
      <DealForm
        mode="edit"
        initial={{
          id: d.id,
          title: d.title ?? "",
          description: d.description ?? "",
          badge: d.badge ?? "",
          image_url: d.image_url ?? "",
          discount_pkr: d.discount_pkr ?? null,
          discount_percent: d.discount_percent ?? null,
          valid_from: toLocalInput(d.valid_from),
          valid_until: toLocalInput(d.valid_until),
          is_active: d.is_active ?? true,
          sort_order: d.sort_order ?? 0,
        }}
      />
    </div>
  );
}
