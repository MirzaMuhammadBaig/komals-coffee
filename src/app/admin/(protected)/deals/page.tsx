import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SimpleRowActions from "@/components/admin/SimpleRowActions";
import { cn, formatPkr } from "@/lib/utils";

export default async function AdminDealsPage() {
  const supabase = createSupabaseServiceClient();
  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Promotions"
        title="Deals"
        description="Time-limited promos shown to customers. Disable a deal without deleting if you want to bring it back later."
        actions={[
          {
            label: "Add deal",
            href: "/admin/deals/new",
            primary: true,
            icon: <Plus className="h-3.5 w-3.5" />,
          },
        ]}
      />

      {!deals || deals.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-caramel-500/15 text-caramel-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="mt-4 font-display text-xl text-espresso-800">
            No deals yet.
          </p>
          <Link href="/admin/deals/new" className="btn-primary mt-5">
            <Plus className="mr-1.5 h-4 w-4" /> Create first deal
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((d) => {
            const expired =
              d.valid_until && new Date(d.valid_until) < new Date();
            return (
              <article
                key={d.id}
                className="card overflow-hidden transition-shadow hover:shadow-lg"
              >
                {d.image_url ? (
                  <div className="relative h-40 w-full">
                    <SafeImage
                      src={d.image_url}
                      alt={d.title}
                      fill
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-caramel-500/20 via-cream-100 to-blush-200/40 text-caramel-600">
                    <Sparkles className="h-10 w-10" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    {d.badge && (
                      <span className="rounded-full bg-caramel-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-caramel-700">
                        {d.badge}
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]",
                        !d.is_active
                          ? "bg-cream-100 text-espresso-400"
                          : expired
                            ? "bg-red-50 text-red-700"
                            : "bg-green-50 text-green-700",
                      )}
                    >
                      {!d.is_active
                        ? "Disabled"
                        : expired
                          ? "Expired"
                          : "Live"}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg text-espresso-800">
                    {d.title}
                  </h3>
                  {d.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-espresso-500">
                      {d.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-espresso-600">
                    <span>
                      {d.discount_percent
                        ? `${d.discount_percent}% off`
                        : d.discount_pkr
                          ? `${formatPkr(d.discount_pkr)} off`
                          : "Promo"}
                    </span>
                    <SimpleRowActions
                      endpoint={`/api/admin/deals/${d.id}`}
                      editHref={`/admin/deals/${d.id}`}
                      isActive={d.is_active}
                      confirmDelete={`Delete deal "${d.title}"?`}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
