import Link from "next/link";
import {
  Banknote,
  Download,
  ShoppingBag,
  Tag,
  TrendingUp,
  X,
} from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DateRangeFilter from "@/components/admin/DateRangeFilter";
import { tickAutoAdvance } from "@/lib/admin/orders";
import {
  DATE_RANGES,
  DEFAULT_RANGE,
  resolveDateRange,
  type DateRange,
} from "@/lib/admin/date-ranges";
import { formatPkr, cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "out_for_delivery", label: "Out" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAGE_LIMIT = 100;

type OrderRow = {
  id: string;
  name: string;
  phone: string;
  total_pkr: number | null;
  status: string;
  payment_method: "cod" | "card";
  payment_status: string;
  created_at: string;
  items: { name?: string; qty?: number }[] | null;
  coupon_code?: string | null;
  discount_pkr?: number | null;
};

// What "earned" means for the revenue chip — same rule as the Revenue page.
function isEarnedRow(r: OrderRow) {
  if (r.payment_method === "card" && r.payment_status === "paid") return true;
  if (r.payment_method === "cod" && r.status === "delivered") return true;
  return false;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    q?: string;
    range?: string;
    from?: string;
    to?: string;
    coupon?: string;
  };
}) {
  const status = searchParams.status ?? "all";
  const q = (searchParams.q ?? "").trim();
  const couponFilter = (searchParams.coupon ?? "").trim().toUpperCase();

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

  // Lazy-on-read: sweep any orders whose auto_advance_at is in the past
  // before we render the list, so the page reflects current state.
  await tickAutoAdvance();

  const supabase = createSupabaseServiceClient();
  // SELECT * so the page survives migration 003 not yet being applied —
  // coupon_code / discount_pkr will simply come back undefined and the
  // UI gates them on `typeof === "string" / "number"`.
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(PAGE_LIMIT);

  if (resolved.since) query = query.gte("created_at", resolved.since.toISOString());
  if (resolved.until) query = query.lte("created_at", resolved.until.toISOString());
  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  if (couponFilter) query = query.ilike("coupon_code", couponFilter);

  const { data: orders, error } = await query;
  const rows = (orders as OrderRow[] | null) ?? [];

  // Summary chips — computed off the same filtered set the admin is looking at.
  const total = rows.length;
  const earned = rows.filter(isEarnedRow);
  const revenue = earned.reduce((s, r) => s + (r.total_pkr ?? 0), 0);
  const avg = earned.length > 0 ? Math.round(revenue / earned.length) : 0;
  const pendingCount = rows.filter(
    (r) => r.status === "new" || r.status === "confirmed",
  ).length;

  // Build the CSV export URL preserving every filter param.
  const exportParams = new URLSearchParams();
  if (current !== DEFAULT_RANGE) exportParams.set("range", current);
  if (current === "custom") {
    if (searchParams.from) exportParams.set("from", searchParams.from);
    if (searchParams.to) exportParams.set("to", searchParams.to);
  }
  if (status !== "all") exportParams.set("status", status);
  if (q) exportParams.set("q", q);
  if (couponFilter) exportParams.set("coupon", couponFilter);
  const exportHref = `/api/admin/orders/export${
    exportParams.toString() ? `?${exportParams}` : ""
  }`;

  // Helper — build the page URL when toggling one param, preserving the rest.
  const linkWithout = (drop: "coupon") => {
    const p = new URLSearchParams();
    if (current !== DEFAULT_RANGE) p.set("range", current);
    if (current === "custom") {
      if (searchParams.from) p.set("from", searchParams.from);
      if (searchParams.to) p.set("to", searchParams.to);
    }
    if (status !== "all") p.set("status", status);
    if (q) p.set("q", q);
    if (drop !== "coupon" && couponFilter) p.set("coupon", couponFilter);
    const s = p.toString();
    return `/admin/orders${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Orders"
        title="All orders"
        description="Newest first. Pick a date range and a status to slice the view. Click any row for full details."
        actions={[
          {
            label: "Export CSV",
            href: exportHref,
            icon: <Download className="h-3.5 w-3.5" />,
          },
        ]}
      />

      {/* Date range filter — pills + custom form. */}
      <DateRangeFilter
        basePath="/admin/orders"
        current={current}
        resolved={resolved}
        searchParams={searchParams}
        preserve={{
          status: status !== "all" ? status : undefined,
          q,
          coupon: couponFilter || undefined,
        }}
      />

      {/* Active filter chips — visible when the admin landed via a deep
          link (e.g. "View in orders" from the coupon detail page). */}
      {couponFilter && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-espresso-500">
            Filtered by:
          </span>
          <Link
            href={linkWithout("coupon")}
            className="inline-flex items-center gap-1.5 rounded-full bg-caramel-500/15 px-3 py-1 text-xs font-semibold text-caramel-700 transition-colors hover:bg-caramel-500/25"
          >
            <Tag className="h-3 w-3" />
            <span className="font-mono tracking-wider">{couponFilter}</span>
            <X className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Summary chips — count, paid revenue, avg, pending */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryChip
          label="Orders"
          value={total.toLocaleString()}
          sub={total === PAGE_LIMIT ? `${PAGE_LIMIT} most recent` : "in view"}
          icon={ShoppingBag}
          tone="espresso"
        />
        <SummaryChip
          label="Paid revenue"
          value={formatPkr(revenue)}
          sub={`${earned.length} earned`}
          icon={Banknote}
          tone="caramel"
        />
        <SummaryChip
          label="Average"
          value={formatPkr(avg)}
          sub="paid order avg"
          icon={TrendingUp}
          tone="matcha"
        />
        <SummaryChip
          label="Pending"
          value={pendingCount.toLocaleString()}
          sub="new + confirmed"
          icon={ShoppingBag}
          tone="blush"
        />
      </div>

      {/* Status filter + search */}
      <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {STATUS_FILTERS.map((f) => {
            const active = status === f.value;
            const params = new URLSearchParams();
            if (current !== DEFAULT_RANGE) params.set("range", current);
            if (current === "custom") {
              if (searchParams.from) params.set("from", searchParams.from);
              if (searchParams.to) params.set("to", searchParams.to);
            }
            if (f.value !== "all") params.set("status", f.value);
            if (q) params.set("q", q);
            if (couponFilter) params.set("coupon", couponFilter);
            const href = `/admin/orders${
              params.toString() ? `?${params}` : ""
            }`;
            return (
              <Link
                key={f.value}
                href={href}
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
        <form method="GET" className="flex items-center gap-2">
          {current !== DEFAULT_RANGE && (
            <input type="hidden" name="range" value={current} />
          )}
          {current === "custom" && (
            <>
              {searchParams.from && (
                <input type="hidden" name="from" defaultValue={searchParams.from} />
              )}
              {searchParams.to && (
                <input type="hidden" name="to" defaultValue={searchParams.to} />
              )}
            </>
          )}
          {status !== "all" && (
            <input type="hidden" name="status" defaultValue={status} />
          )}
          {couponFilter && (
            <input type="hidden" name="coupon" defaultValue={couponFilter} />
          )}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name or phone"
            className="input h-9 w-full py-1 text-sm sm:w-56"
          />
        </form>
      </div>

      {/* Orders table */}
      {error ? (
        <div className="card p-6 text-sm text-red-600">{error.message}</div>
      ) : rows.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-display text-xl text-espresso-800">
            No orders match this filter.
          </p>
          <p className="mt-2 text-sm text-espresso-500">
            Try widening the date range, clearing the search, or switching to
            All statuses.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[1.5fr_2fr_1fr_1fr_1fr_auto] gap-4 border-b border-espresso-100 bg-cream-100/50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-espresso-500 lg:grid">
            <span>Customer</span>
            <span>Items</span>
            <span>Total</span>
            <span>Payment</span>
            <span>Status</span>
            <span></span>
          </div>
          <ul className="divide-y divide-espresso-100">
            {rows.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="block px-4 py-4 transition-colors hover:bg-cream-100/60 sm:px-5 lg:grid lg:grid-cols-[1.5fr_2fr_1fr_1fr_1fr_auto] lg:items-center lg:gap-4"
                >
                  <div className="flex items-start justify-between gap-3 lg:block">
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm text-espresso-800 sm:text-base">
                        {o.name}
                      </p>
                      <p className="truncate text-[11px] text-espresso-400 sm:text-xs">
                        {new Date(o.created_at).toLocaleString("en-PK", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        · {o.phone}
                      </p>
                    </div>
                    <span className="shrink-0 lg:hidden">
                      <StatusBadge status={o.status} />
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 lg:mt-0">
                    <p className="line-clamp-2 break-words text-xs text-espresso-600 lg:truncate">
                      {(o.items ?? [])
                        .map((i) => `${i.qty}× ${i.name}`)
                        .join(" · ")}
                    </p>
                    {o.coupon_code &&
                      typeof o.discount_pkr === "number" &&
                      o.discount_pkr > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-caramel-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-caramel-700">
                          <Tag className="h-2.5 w-2.5" />
                          <span className="font-mono tracking-wider">
                            {o.coupon_code}
                          </span>
                          <span className="text-green-700">
                            −{formatPkr(o.discount_pkr)}
                          </span>
                        </span>
                      )}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs lg:hidden">
                    <span className="text-[11px] uppercase tracking-[0.15em] text-espresso-500">
                      {o.payment_method === "card" ? "Card" : "COD"}
                      {o.payment_status === "paid" && (
                        <span className="ml-1 text-green-600">· Paid</span>
                      )}
                      {o.payment_status === "failed" && (
                        <span className="ml-1 text-red-600">· Failed</span>
                      )}
                    </span>
                    <span className="font-semibold tabular-nums text-espresso-800">
                      {formatPkr(o.total_pkr ?? 0)}
                    </span>
                  </div>

                  <p className="hidden font-semibold tabular-nums text-espresso-800 lg:block">
                    {formatPkr(o.total_pkr ?? 0)}
                  </p>
                  <p className="hidden text-[11px] uppercase tracking-[0.15em] text-espresso-500 lg:block">
                    {o.payment_method === "card" ? "Card" : "COD"}
                    {o.payment_status === "paid" && (
                      <span className="ml-1 text-green-600">· Paid</span>
                    )}
                    {o.payment_status === "failed" && (
                      <span className="ml-1 text-red-600">· Failed</span>
                    )}
                  </p>
                  <span className="hidden lg:block">
                    <StatusBadge status={o.status} />
                  </span>
                  <span className="hidden text-xs text-espresso-300 lg:block">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {rows.length === PAGE_LIMIT && (
            <div className="border-t border-espresso-100 bg-cream-100/40 px-5 py-3 text-center text-xs text-espresso-500">
              Showing the {PAGE_LIMIT} most recent in this range. Narrow the
              date window or status to see older orders, or use{" "}
              <span className="font-semibold text-espresso-700">Export CSV</span>{" "}
              for a full snapshot.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryChip({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof ShoppingBag;
  tone: "espresso" | "caramel" | "matcha" | "blush";
}) {
  return (
    <div className="card flex h-full flex-col p-4">
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          tone === "espresso" && "bg-espresso-700/10 text-espresso-700",
          tone === "caramel" && "bg-caramel-500/15 text-caramel-700",
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    new: { label: "New", cls: "bg-caramel-500/15 text-caramel-700" },
    confirmed: { label: "Confirmed", cls: "bg-blue-50 text-blue-700" },
    out_for_delivery: {
      label: "Out",
      cls: "bg-purple-50 text-purple-700",
    },
    delivered: { label: "Delivered", cls: "bg-green-50 text-green-700" },
    cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700" },
  };
  const m = map[status] ?? {
    label: status,
    cls: "bg-cream-100 text-espresso-600",
  };
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]",
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}
