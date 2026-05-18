import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { cn, formatPkr } from "@/lib/utils";

type Range = "today" | "yesterday" | "last_7d" | "last_30d" | "month" | "all" | "custom";

const RANGES: { value: Range; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7d", label: "Last 7 days" },
  { value: "last_30d", label: "Last 30 days" },
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom" },
];

function startOf(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOf(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function resolveRange(
  range: Range,
  from?: string,
  to?: string,
): { since: Date | null; until: Date | null; label: string } {
  const now = new Date();
  switch (range) {
    case "today":
      return { since: startOf(now), until: endOf(now), label: "Today" };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { since: startOf(y), until: endOf(y), label: "Yesterday" };
    }
    case "last_7d": {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      return { since: startOf(s), until: endOf(now), label: "Last 7 days" };
    }
    case "month": {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { since: startOf(s), until: endOf(now), label: "This month" };
    }
    case "all":
      return { since: null, until: null, label: "All time" };
    case "custom": {
      const f = from ? new Date(from) : null;
      const t = to ? new Date(to) : null;
      return {
        since: f && !Number.isNaN(f.getTime()) ? startOf(f) : null,
        until: t && !Number.isNaN(t.getTime()) ? endOf(t) : endOf(now),
        label:
          f && t
            ? `${from} → ${to}`
            : "Custom range",
      };
    }
    case "last_30d":
    default: {
      const s = new Date(now);
      s.setDate(s.getDate() - 29);
      return { since: startOf(s), until: endOf(now), label: "Last 30 days" };
    }
  }
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

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
  const range = (searchParams.range as Range) ?? "last_30d";
  const { since, until, label } = resolveRange(
    range,
    searchParams.from,
    searchParams.to,
  );

  const supabase = createSupabaseServiceClient();
  let q = supabase
    .from("orders")
    .select("total_pkr, payment_method, payment_status, status, created_at")
    .order("created_at", { ascending: true })
    .limit(5000);
  if (since) q = q.gte("created_at", since.toISOString());
  if (until) q = q.lte("created_at", until.toISOString());
  const { data: rows, error } = await q;

  const all = (rows as OrderRow[] | null) ?? [];
  const earned = all.filter(isRevenueRow);
  const revenue = earned.reduce((s, r) => s + (r.total_pkr ?? 0), 0);
  const orderCount = earned.length;
  const avg = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

  // Group by day for the by-day list.
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (const r of earned) {
    const key = fmtDate(new Date(r.created_at));
    const cur = byDay.get(key) ?? { revenue: 0, orders: 0 };
    cur.revenue += r.total_pkr ?? 0;
    cur.orders += 1;
    byDay.set(key, cur);
  }
  const byDayList = [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 60);
  const maxDayRevenue = byDayList.reduce((m, [, v]) => Math.max(m, v.revenue), 0);

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

      {/* Range filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((r) => {
          const active = (searchParams.range ?? "last_30d") === r.value;
          const params = new URLSearchParams();
          if (r.value !== "last_30d") params.set("range", r.value);
          if (r.value === "custom") {
            if (searchParams.from) params.set("from", searchParams.from);
            if (searchParams.to) params.set("to", searchParams.to);
          }
          const href = `/admin/revenue${params.toString() ? `?${params}` : ""}`;
          return (
            <Link
              key={r.value}
              href={href}
              className={cn(
                "rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-150 active:scale-95",
                active
                  ? "bg-espresso-700 text-cream-50 shadow-sm"
                  : "border border-espresso-200 bg-white text-espresso-700 hover:-translate-y-0.5 hover:border-espresso-700 hover:bg-espresso-700 hover:text-cream-50",
              )}
            >
              {r.label}
            </Link>
          );
        })}
      </div>

      {/* Custom date inputs */}
      {range === "custom" && (
        <form
          method="GET"
          className="card flex flex-wrap items-end gap-4 p-4 sm:p-5"
        >
          <input type="hidden" name="range" value="custom" />
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-500">
              From
            </span>
            <input
              type="date"
              name="from"
              defaultValue={searchParams.from ?? ""}
              className="input mt-1.5"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-500">
              To
            </span>
            <input
              type="date"
              name="to"
              defaultValue={searchParams.to ?? ""}
              className="input mt-1.5"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-espresso-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 active:translate-y-0 active:scale-95"
          >
            Apply
          </button>
        </form>
      )}

      <p className="text-xs text-espresso-500">
        Showing <span className="font-semibold text-espresso-700">{label}</span>
        {since && (
          <>
            {" "}
            (since{" "}
            <span className="font-mono">{fmtDate(since)}</span>)
          </>
        )}
      </p>

      {error && (
        <div className="card border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {/* 3 stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Revenue"
          value={formatPkr(revenue)}
          sub={label.toLowerCase()}
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
            {label}
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
                <li
                  key={day}
                  className="px-4 py-3 sm:px-6 sm:py-3"
                >
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
      <p className="mt-1 font-display text-3xl text-espresso-800 tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-espresso-400">{sub}</p>
    </div>
  );
}
