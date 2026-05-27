import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  Plus,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DateRangeFilter from "@/components/admin/DateRangeFilter";
import SimpleRowActions from "@/components/admin/SimpleRowActions";
import { getCouponUsage } from "@/lib/admin/coupon-stats";
import {
  DATE_RANGES,
  DEFAULT_RANGE,
  resolveDateRange,
  type DateRange,
} from "@/lib/admin/date-ranges";
import { formatPkr, cn } from "@/lib/utils";

type CouponStatus = "all" | "active" | "scheduled" | "expired" | "disabled";

const STATUS_FILTERS: { value: CouponStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "expired", label: "Expired" },
  { value: "disabled", label: "Disabled" },
];

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "uses", label: "Most used" },
  { value: "savings", label: "Highest saving" },
  { value: "code", label: "Code (A→Z)" },
] as const;
type Sort = (typeof SORTS)[number]["value"];

type CouponRow = {
  id: string;
  code: string;
  kind: "percent" | "flat";
  value: number;
  min_order_pkr: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
};

function statusOf(c: CouponRow): Exclude<CouponStatus, "all"> {
  if (!c.is_active) return "disabled";
  const now = Date.now();
  if (c.starts_at && new Date(c.starts_at).getTime() > now) return "scheduled";
  if (c.expires_at && new Date(c.expires_at).getTime() < now) return "expired";
  return "active";
}

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: {
    range?: string;
    from?: string;
    to?: string;
    status?: string;
    sort?: string;
  };
}) {
  const current: DateRange = (DATE_RANGES as readonly string[]).includes(
    searchParams.range ?? "",
  )
    ? (searchParams.range as DateRange)
    : DEFAULT_RANGE;
  const resolved = resolveDateRange(
    searchParams.range,
    searchParams.from,
    searchParams.to,
  );

  const status = (
    ["all", "active", "scheduled", "expired", "disabled"].includes(
      searchParams.status ?? "",
    )
      ? searchParams.status
      : "all"
  ) as CouponStatus;

  const sort: Sort = (
    SORTS.find((s) => s.value === searchParams.sort)?.value ?? "newest"
  ) as Sort;

  const supabase = createSupabaseServiceClient();
  const [{ data: rawCoupons }, usage] = await Promise.all([
    supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false }),
    getCouponUsage(supabase, resolved.since, resolved.until),
  ]);
  const coupons = (rawCoupons as CouponRow[] | null) ?? [];

  // Compose enriched rows (status + usage stats joined in).
  const enriched = coupons.map((c) => {
    const u = usage.get(c.code.toUpperCase());
    return {
      ...c,
      status: statusOf(c),
      ordersInRange: u?.orders ?? 0,
      discountInRange: u?.discount_total_pkr ?? 0,
      revenueInRange: u?.revenue_total_pkr ?? 0,
      lastUsedAt: u?.last_used_at ?? null,
    };
  });

  // Filter by status.
  const filtered =
    status === "all" ? enriched : enriched.filter((c) => c.status === status);

  // Sort.
  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "uses":
        return b.ordersInRange - a.ordersInRange;
      case "savings":
        return b.discountInRange - a.discountInRange;
      case "code":
        return a.code.localeCompare(b.code);
      case "newest":
      default:
        return b.created_at.localeCompare(a.created_at);
    }
  });

  // Summary chips computed across ALL coupons in the period.
  const totalActive = enriched.filter((c) => c.status === "active").length;
  const totalRedemptions = enriched.reduce(
    (s, c) => s + c.ordersInRange,
    0,
  );
  const totalDiscount = enriched.reduce(
    (s, c) => s + c.discountInRange,
    0,
  );
  const topPerformer = [...enriched].sort(
    (a, b) => b.ordersInRange - a.ordersInRange,
  )[0];

  // URL builders that preserve the other params.
  const linkFor = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { range: current, status, sort, ...overrides };
    if (merged.range && merged.range !== DEFAULT_RANGE)
      p.set("range", merged.range);
    if (merged.range === "custom") {
      if (searchParams.from) p.set("from", searchParams.from);
      if (searchParams.to) p.set("to", searchParams.to);
    }
    if (merged.status && merged.status !== "all") p.set("status", merged.status);
    if (merged.sort && merged.sort !== "newest") p.set("sort", merged.sort);
    const s = p.toString();
    return `/admin/coupons${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Promotions"
        title="Coupons"
        description="Discount codes customers enter at checkout. Track redemptions, savings impact, and slice the data by date."
        actions={[
          {
            label: "Add coupon",
            href: "/admin/coupons/new",
            primary: true,
            icon: <Plus className="h-3.5 w-3.5" />,
          },
        ]}
      />

      <DateRangeFilter
        basePath="/admin/coupons"
        current={current}
        resolved={resolved}
        searchParams={searchParams}
        preserve={{
          status: status !== "all" ? status : undefined,
          sort: sort !== "newest" ? sort : undefined,
        }}
      />

      {/* Summary chips — computed across the selected range. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Chip
          icon={Tag}
          tone="caramel"
          label="Active codes"
          value={totalActive.toLocaleString()}
          sub="ready to redeem"
        />
        <Chip
          icon={Users}
          tone="espresso"
          label="Redemptions"
          value={totalRedemptions.toLocaleString()}
          sub={resolved.label.toLowerCase()}
        />
        <Chip
          icon={Banknote}
          tone="matcha"
          label="Discount given"
          value={formatPkr(totalDiscount)}
          sub="savings to customers"
        />
        <Chip
          icon={TrendingUp}
          tone="blush"
          label="Top performer"
          value={
            topPerformer && topPerformer.ordersInRange > 0
              ? topPerformer.code
              : "—"
          }
          sub={
            topPerformer && topPerformer.ordersInRange > 0
              ? `${topPerformer.ordersInRange} redemption${topPerformer.ordersInRange === 1 ? "" : "s"}`
              : "no redemptions yet"
          }
        />
      </div>

      {/* Status pills + Sort selector */}
      <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {STATUS_FILTERS.map((f) => {
            const active = status === f.value;
            return (
              <Link
                key={f.value}
                href={linkFor({ status: f.value })}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-150 sm:shrink",
                  active
                    ? "bg-espresso-700 text-cream-50 shadow-sm"
                    : "bg-cream-100 text-espresso-600 hover:bg-cream-200 hover:text-espresso-800",
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-espresso-500">
          <span>Sort:</span>
          <div className="flex flex-wrap gap-1">
            {SORTS.map((s) => {
              const active = sort === s.value;
              return (
                <Link
                  key={s.value}
                  href={linkFor({ sort: s.value })}
                  className={cn(
                    "rounded-full px-2.5 py-1 transition-colors duration-150",
                    active
                      ? "bg-espresso-700 text-cream-50"
                      : "bg-cream-100 text-espresso-600 hover:bg-cream-200",
                  )}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title={
            coupons.length === 0
              ? "No coupons yet."
              : "No coupons match this filter."
          }
          showCreate={coupons.length === 0}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[1.2fr_0.8fr_0.9fr_1.2fr_0.9fr_auto] gap-4 border-b border-espresso-100 bg-cream-100/50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-espresso-500 lg:grid">
            <span>Code</span>
            <span>Discount</span>
            <span>Min order</span>
            <span>Usage ({resolved.label.toLowerCase()})</span>
            <span>Status</span>
            <span></span>
          </div>
          <ul className="divide-y divide-espresso-100">
            {sorted.map((c) => (
              <li
                key={c.id}
                className="grid grid-cols-[1fr_auto] items-start gap-3 px-4 py-4 transition-colors hover:bg-cream-100/40 sm:px-5 lg:grid-cols-[1.2fr_0.8fr_0.9fr_1.2fr_0.9fr_auto] lg:items-center lg:gap-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/coupons/${c.id}`}
                    className="group inline-flex items-center gap-1.5 font-mono text-sm font-semibold tracking-wider text-espresso-800 transition-colors hover:text-caramel-700"
                  >
                    {c.code}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                  {c.notes && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-espresso-400">
                      {c.notes}
                    </p>
                  )}
                  {/* Mobile/tablet — show stats inline since columns are hidden */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-espresso-500 lg:hidden">
                    <span className="font-semibold tabular-nums text-espresso-700">
                      {c.kind === "percent"
                        ? `${c.value}% off`
                        : `${formatPkr(c.value)} off`}
                    </span>
                    {c.min_order_pkr > 0 && (
                      <span>min {formatPkr(c.min_order_pkr)}</span>
                    )}
                    <span>
                      {c.ordersInRange} use
                      {c.ordersInRange === 1 ? "" : "s"}
                      {c.discountInRange > 0 && (
                        <>
                          {" "}
                          ·{" "}
                          <span className="text-green-700">
                            {formatPkr(c.discountInRange)} given
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <p className="hidden text-sm font-semibold tabular-nums text-espresso-700 lg:block">
                  {c.kind === "percent"
                    ? `${c.value}%`
                    : formatPkr(c.value)}
                  {" off"}
                </p>
                <p className="hidden text-sm tabular-nums text-espresso-600 lg:block">
                  {c.min_order_pkr > 0
                    ? formatPkr(c.min_order_pkr)
                    : "No minimum"}
                </p>

                {/* Desktop usage column — progress bar + lifetime + revenue */}
                <div className="hidden min-w-0 flex-col gap-1 lg:flex">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-semibold text-espresso-700 tabular-nums">
                      {c.ordersInRange} use{c.ordersInRange === 1 ? "" : "s"}
                    </span>
                    {c.discountInRange > 0 && (
                      <span className="text-green-700 tabular-nums">
                        {formatPkr(c.discountInRange)} given
                      </span>
                    )}
                  </div>
                  {/* Progress against max_uses if set, else lifetime usage. */}
                  <UsageBar
                    used={c.used_count}
                    max={c.max_uses}
                  />
                  <p className="text-[10px] text-espresso-400 tabular-nums">
                    Lifetime: {c.used_count}
                    {c.max_uses ? ` / ${c.max_uses}` : ""}
                  </p>
                </div>

                <span
                  className={cn(
                    "hidden w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] lg:inline-flex",
                    statusClass(c.status),
                  )}
                >
                  {labelForStatus(c.status)}
                </span>

                <SimpleRowActions
                  endpoint={`/api/admin/coupons/${c.id}`}
                  editHref={`/admin/coupons/${c.id}`}
                  isActive={c.is_active}
                  confirmDelete={`Delete coupon ${c.code}?`}
                />

                {/* Mobile — status chip stacked at the bottom of the row */}
                <span
                  className={cn(
                    "col-span-2 mt-1 w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] lg:hidden",
                    statusClass(c.status),
                  )}
                >
                  {labelForStatus(c.status)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function statusClass(s: Exclude<CouponStatus, "all">): string {
  if (s === "active") return "bg-green-50 text-green-700";
  if (s === "scheduled") return "bg-blue-50 text-blue-700";
  if (s === "expired") return "bg-red-50 text-red-700";
  return "bg-cream-100 text-espresso-400";
}

function labelForStatus(s: Exclude<CouponStatus, "all">): string {
  if (s === "active") return "Active";
  if (s === "scheduled") return "Scheduled";
  if (s === "expired") return "Expired";
  return "Disabled";
}

function UsageBar({
  used,
  max,
}: {
  used: number;
  max: number | null;
}) {
  // When max_uses is unset, show a passive lifetime bar capped at 100.
  const ceiling = max ?? Math.max(100, used || 1);
  const pct = ceiling > 0 ? Math.min(100, (used / ceiling) * 100) : 0;
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-cream-100">
      <div
        className={cn(
          "h-full rounded-full transition-all",
          max && used >= max
            ? "bg-red-500"
            : "bg-gradient-to-r from-caramel-400 to-caramel-600",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Chip({
  icon: Icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: typeof Tag;
  tone: "caramel" | "espresso" | "matcha" | "blush";
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="card flex h-full flex-col p-4">
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          tone === "caramel" && "bg-caramel-500/15 text-caramel-700",
          tone === "espresso" && "bg-espresso-700/10 text-espresso-700",
          tone === "matcha" && "bg-green-100 text-green-700",
          tone === "blush" && "bg-blush-200/40 text-blush-500",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-espresso-400">
        {label}
      </p>
      <p className="mt-1 break-words font-display text-xl text-espresso-800 tabular-nums sm:text-2xl">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-espresso-500">{sub}</p>
    </div>
  );
}

function EmptyState({
  title,
  showCreate,
}: {
  title: string;
  showCreate: boolean;
}) {
  return (
    <div className="card p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-caramel-500/15 text-caramel-600">
        <Tag className="h-5 w-5" />
      </div>
      <p className="mt-4 font-display text-xl text-espresso-800">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-espresso-500">
        {showCreate
          ? "Create discount codes to share on Instagram, with regulars, or for seasonal promos."
          : "Try a different status, sort, or date range."}
      </p>
      {showCreate && (
        <Link
          href="/admin/coupons/new"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-espresso-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 active:translate-y-0 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" /> Create the first coupon
        </Link>
      )}
    </div>
  );
}
