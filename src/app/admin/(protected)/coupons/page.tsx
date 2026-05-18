import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SimpleRowActions from "@/components/admin/SimpleRowActions";
import { formatPkr, cn } from "@/lib/utils";

export default async function AdminCouponsPage() {
  const supabase = createSupabaseServiceClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Promotions"
        title="Coupons"
        description="Discount codes customers enter at checkout. Disable any code without deleting."
        actions={[
          {
            label: "Add coupon",
            href: "/admin/coupons/new",
            primary: true,
            icon: <Plus className="h-3.5 w-3.5" />,
          },
        ]}
      />

      {!coupons || coupons.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] gap-4 border-b border-espresso-100 bg-cream-100/50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-espresso-500 md:grid">
            <span>Code</span>
            <span>Discount</span>
            <span>Min order</span>
            <span>Usage</span>
            <span>Status</span>
            <span></span>
          </div>
          <ul className="divide-y divide-espresso-100">
            {coupons.map((c) => {
              const expired =
                c.expires_at && new Date(c.expires_at) < new Date();
              return (
                <li
                  key={c.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 transition-colors hover:bg-cream-100/40 md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr_auto]"
                >
                  <div>
                    <p className="font-mono font-semibold tracking-wider text-espresso-800">
                      {c.code}
                    </p>
                    {c.notes && (
                      <p className="mt-0.5 truncate text-xs text-espresso-400">
                        {c.notes}
                      </p>
                    )}
                  </div>
                  <p className="hidden text-sm font-semibold tabular-nums text-espresso-700 md:block">
                    {c.kind === "percent"
                      ? `${c.value}%`
                      : formatPkr(c.value)}
                    {" off"}
                  </p>
                  <p className="hidden text-sm tabular-nums text-espresso-600 md:block">
                    {c.min_order_pkr > 0 ? formatPkr(c.min_order_pkr) : "—"}
                  </p>
                  <p className="hidden text-sm tabular-nums text-espresso-600 md:block">
                    {c.used_count}
                    {c.max_uses ? ` / ${c.max_uses}` : ""}
                  </p>
                  <span
                    className={cn(
                      "hidden w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] md:inline-flex",
                      !c.is_active
                        ? "bg-cream-100 text-espresso-400"
                        : expired
                          ? "bg-red-50 text-red-700"
                          : "bg-green-50 text-green-700",
                    )}
                  >
                    {!c.is_active ? "Disabled" : expired ? "Expired" : "Active"}
                  </span>
                  <SimpleRowActions
                    endpoint={`/api/admin/coupons/${c.id}`}
                    editHref={`/admin/coupons/${c.id}`}
                    isActive={c.is_active}
                    confirmDelete={`Delete coupon ${c.code}?`}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-caramel-500/15 text-caramel-600">
        <Tag className="h-5 w-5" />
      </div>
      <p className="mt-4 font-display text-xl text-espresso-800">
        No coupons yet.
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-espresso-500">
        Create discount codes to share on Instagram, with regulars, or for
        seasonal promos.
      </p>
      <Link
        href="/admin/coupons/new"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-espresso-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 active:translate-y-0 active:scale-95"
      >
        <Plus className="h-3.5 w-3.5" /> Create the first coupon
      </Link>
    </div>
  );
}
