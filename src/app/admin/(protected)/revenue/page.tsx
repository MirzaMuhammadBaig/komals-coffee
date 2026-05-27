import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DateRangeFilter from "@/components/admin/DateRangeFilter";
import {
  DATE_RANGES,
  DEFAULT_RANGE,
  isoDate,
  resolveDateRange,
  type DateRange,
} from "@/lib/admin/date-ranges";
import { cn, formatPkr } from "@/lib/utils";

type OrderRow = {
  total_pkr: number | null;
  payment_method: "cod" | "card";
  payment_status: string;
  status: string;
  created_at: string;
};

// What counts as earned revenue: paid card orders + delivered COD orders.
function isRevenueRow(r: OrderRow) {
  if (r.payment_method === "card" && r.payment_status === "paid") return true;
  if (r.payment_method === "cod" && r.status === "delivered") return true;
  return false;
}

export default async function AdminRevenuePage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
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

  const supabase = createSupabaseServiceClient();
  let q = supabase
    .from("orders")
    .select("total_pkr, payment_method, payment_status, status, created_at")
    .order("created_at", { ascending: true })
    .limit(5000);
  if (resolved.since) q = q.gte("created_at", resolved.since.toISOString());
  if (resolved.until) q = q.lte("created_at", resolved.until.toISOString());
  const { data: rows, error } = await q;

  const all = (rows as OrderRow[] | null) ?? [];
  const earned = all.filter(isRevenueRow);
  const revenue = earned.reduce((s, r) => s + (r.total_pkr ?? 0), 0);
  const orderCount = earned.length;
  const avg = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

  // Group by day for the by-day list.
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (const r of earned) {
    const key = isoDate(new Date(r.created_at));
    const cur = byDay.get(key) ?? { revenue: 0, orders: 0 };
    cur.revenue += r.total_pkr ?? 0;
    cur.orders += 1;
    byDay.set(key, cur);
  }
  const byDayList = [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 60);
  const maxDayRevenue = byDayList.reduce(
    (m, [, v]) => Math.max(m, v.revenue),
    0,
  );

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="link-underline inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500 hover:text-caramel-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>

      <AdminPageHeader
        eyebrow="Reports"
        title="Revenue"
        description="Pick a quick range or set a custom window. Counts paid card orders + delivered cash orders."
      />

      <DateRangeFilter
        basePath="/admin/revenue"
        current={current}
        resolved={resolved}
        searchParams={searchParams}
      />

      {error && (
        <div className="card border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {/* 3 stat cards */}
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard
          label="Revenue"
          value={formatPkr(revenue)}
          sub={resolved.label.toLowerCase()}
          icon={Banknote}
          tone="caramel"
        />
        <StatCard
          label="Orders"
          value={orderCount.toLocaleString()}
          sub="paid + completed cash"
          icon={ShoppingCart}
          tone="espresso"
        />
        <StatCard
          label="Average order"
          value={formatPkr(avg)}
          sub="revenue / orders"
          icon={TrendingUp}
          tone="matcha"
        />
      </div>

      {/* Revenue by day */}
      <section className="card overflow-hidden">
        <header className="border-b border-espresso-100 px-5 py-4 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
            Revenue by day
          </p>
          <h2 className="mt-1 font-display text-lg text-espresso-800">
            {resolved.label}
          </h2>
        </header>

        {byDayList.length === 0 ? (
          <div className="bg-cream-100/40 px-5 py-12 text-center text-sm text-espresso-500">
            No paid orders in this range yet.
          </div>
        ) : (
          <ul className="divide-y divide-espresso-100">
            {byDayList.map(([day, v]) => {
              const pct =
                maxDayRevenue > 0 ? (v.revenue / maxDayRevenue) * 100 : 0;
              return (
                <li key={day} className="px-4 py-3 sm:px-6">
                  {/* Mobile: stacked. Desktop: 3 columns. */}
                  <div className="flex items-center justify-between gap-3 sm:hidden">
                    <span className="font-mono text-xs text-espresso-500 tabular-nums">
                      {new Date(day).toLocaleDateString("en-PK", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span className="text-right">
                      <span className="font-semibold tabular-nums text-espresso-800">
                        {formatPkr(v.revenue)}
                      </span>
                      <span className="ml-2 text-[10px] uppercase tracking-[0.15em] text-espresso-400 tabular-nums">
                        {v.orders} order{v.orders === 1 ? "" : "s"}
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream-100 sm:hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-caramel-400 to-caramel-600 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="hidden grid-cols-[130px_1fr_auto] items-center gap-4 sm:grid">
                    <span className="font-mono text-xs text-espresso-500 tabular-nums">
                      {new Date(day).toLocaleDateString("en-PK", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <div className="h-2 overflow-hidden rounded-full bg-cream-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-caramel-400 to-caramel-600 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-right">
                      <span className="block font-semibold tabular-nums text-espresso-800">
                        {formatPkr(v.revenue)}
                      </span>
                      <span className="block text-[10px] uppercase tracking-[0.15em] text-espresso-400 tabular-nums">
                        {v.orders} order{v.orders === 1 ? "" : "s"}
                      </span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Banknote;
  tone: "caramel" | "espresso" | "matcha";
}) {
  return (
    <div className="card flex h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            tone === "caramel" && "bg-caramel-500/15 text-caramel-700",
            tone === "espresso" && "bg-espresso-700/10 text-espresso-700",
            tone === "matcha" && "bg-green-100 text-green-700",
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
        {label}
      </p>
      <p className="mt-1 break-words font-display text-2xl text-espresso-800 tabular-nums sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-espresso-400">{sub}</p>
    </div>
  );
}
