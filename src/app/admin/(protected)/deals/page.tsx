import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SimpleRowActions from "@/components/admin/SimpleRowActions";
import { cn, formatPkr } from "@/lib/utils";

type DealStatus = "all" | "live" | "scheduled" | "expired" | "disabled";

const FILTERS: { value: DealStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live now" },
  { value: "scheduled", label: "Scheduled" },
  { value: "expired", label: "Expired" },
  { value: "disabled", label: "Disabled" },
];

type DealRow = {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  image_url: string | null;
  discount_pkr: number | null;
  discount_percent: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  sort_order: number;
};

function dealStatus(d: DealRow): Exclude<DealStatus, "all"> {
  if (!d.is_active) return "disabled";
  const now = Date.now();
  if (d.valid_from && new Date(d.valid_from).getTime() > now) return "scheduled";
  if (d.valid_until && new Date(d.valid_until).getTime() < now) return "expired";
  return "live";
}

function statusClass(s: Exclude<DealStatus, "all">): string {
  if (s === "live") return "bg-green-50 text-green-700";
  if (s === "scheduled") return "bg-blue-50 text-blue-700";
  if (s === "expired") return "bg-red-50 text-red-700";
  return "bg-cream-100 text-espresso-400";
}

function labelOf(s: Exclude<DealStatus, "all">): string {
  if (s === "live") return "Live now";
  if (s === "scheduled") return "Scheduled";
  if (s === "expired") return "Expired";
  return "Disabled";
}

export default async function AdminDealsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = (
    ["all", "live", "scheduled", "expired", "disabled"].includes(
      searchParams.status ?? "",
    )
      ? searchParams.status
      : "all"
  ) as DealStatus;

  const supabase = createSupabaseServiceClient();
  const { data: rawDeals } = await supabase
    .from("deals")
    .select("*")
    .order("sort_order", { ascending: true });
  const deals = (rawDeals as DealRow[] | null) ?? [];
  const enriched = deals.map((d) => ({ ...d, status: dealStatus(d) }));

  const counts: Record<DealStatus, number> = {
    all: enriched.length,
    live: enriched.filter((d) => d.status === "live").length,
    scheduled: enriched.filter((d) => d.status === "scheduled").length,
    expired: enriched.filter((d) => d.status === "expired").length,
    disabled: enriched.filter((d) => d.status === "disabled").length,
  };

  const filtered =
    status === "all" ? enriched : enriched.filter((d) => d.status === status);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Promotions"
        title="Deals"
        description="Marketing tiles shown on the order page. A deal advertises the offer — pair it with a coupon code so customers can actually redeem it."
        actions={[
          {
            label: "Add deal",
            href: "/admin/deals/new",
            primary: true,
            icon: <Plus className="h-3.5 w-3.5" />,
          },
        ]}
      />

      {/* Status pills with live counts */}
      <div className="card -mx-0 flex gap-1.5 overflow-x-auto p-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:p-4 [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => {
          const active = status === f.value;
          const href =
            f.value === "all"
              ? "/admin/deals"
              : `/admin/deals?status=${f.value}`;
          return (
            <Link
              key={f.value}
              href={href}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-150 sm:shrink",
                active
                  ? "bg-espresso-700 text-cream-50 shadow-sm"
                  : "bg-cream-100 text-espresso-600 hover:bg-cream-200 hover:text-espresso-800",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] tabular-nums",
                  active
                    ? "bg-cream-50/20 text-cream-50"
                    : "bg-white text-espresso-500",
                )}
              >
                {counts[f.value]}
              </span>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-caramel-500/15 text-caramel-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="mt-4 font-display text-xl text-espresso-800">
            {deals.length === 0
              ? "No deals yet."
              : "No deals match this filter."}
          </p>
          {deals.length === 0 ? (
            <Link href="/admin/deals/new" className="btn-primary mt-5">
              <Plus className="mr-1.5 h-4 w-4" /> Create first deal
            </Link>
          ) : (
            <p className="mt-2 text-sm text-espresso-500">
              Switch to <span className="font-semibold">All</span> above to see
              every deal.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {d.badge ? (
                    <span className="rounded-full bg-caramel-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-caramel-700">
                      {d.badge}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]",
                      statusClass(d.status),
                    )}
                  >
                    {labelOf(d.status)}
                  </span>
                </div>
                <h3 className="mt-2 break-words font-display text-lg text-espresso-800">
                  {d.title}
                </h3>
                {d.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-espresso-500">
                    {d.description}
                  </p>
                )}

                {/* Validity window + discount headline */}
                <div className="mt-3 space-y-1 text-xs text-espresso-600">
                  <p className="font-semibold text-espresso-700">
                    {d.discount_percent
                      ? `${d.discount_percent}% off`
                      : d.discount_pkr
                        ? `${formatPkr(d.discount_pkr)} off`
                        : "Promo"}
                  </p>
                  {(d.valid_from || d.valid_until) && (
                    <p className="text-[11px] text-espresso-500">
                      {d.valid_from && (
                        <>
                          From{" "}
                          {new Date(d.valid_from).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                          })}
                        </>
                      )}
                      {d.valid_from && d.valid_until && " · "}
                      {d.valid_until && (
                        <>
                          Until{" "}
                          {new Date(d.valid_until).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                          })}
                        </>
                      )}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <SimpleRowActions
                    endpoint={`/api/admin/deals/${d.id}`}
                    editHref={`/admin/deals/${d.id}`}
                    isActive={d.is_active}
                    confirmDelete={`Delete deal "${d.title}"?`}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
