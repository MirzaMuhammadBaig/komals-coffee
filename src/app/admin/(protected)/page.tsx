import Link from "next/link";
import {
  ShoppingBag,
  Banknote,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Coffee,
  Star,
  Mail,
  Gauge,
} from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { formatPkr, cn } from "@/lib/utils";
import { getStoreSettings } from "@/lib/admin/store";
import {
  BUSYNESS_LABELS,
  BUSYNESS_MULTIPLIERS,
} from "@/lib/admin/busyness-types";
import {
  buildRangeQuery,
  DATE_RANGES,
  DEFAULT_RANGE,
  resolveDateRange,
  type DateRange,
} from "@/lib/admin/date-ranges";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DateRangeFilter from "@/components/admin/DateRangeFilter";

type OrderRow = {
  id: string;
  name: string;
  total_pkr: number | null;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  items: { name: string; qty: number }[];
};

async function loadStats(since: Date | null, until: Date | null) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }
  try {
    const supabase = createSupabaseServiceClient();

    // Builders that apply the optional time window to a query.
    const inWindow = <T,>(
      q: T extends { gte: (col: string, v: string) => T }
        ? T
        : never,
    ): T => {
      let out = q as unknown as {
        gte: (col: string, v: string) => unknown;
        lte: (col: string, v: string) => unknown;
      };
      if (since) out = out.gte("created_at", since.toISOString()) as typeof out;
      if (until) out = out.lte("created_at", until.toISOString()) as typeof out;
      return out as unknown as T;
    };

    const [
      { count: totalOrdersInRange },
      { count: pendingCount },
      { data: revenueRows },
      { data: recentOrders },
    ] = await Promise.all([
      inWindow(
        supabase.from("orders").select("*", { count: "exact", head: true }),
      ),
      // Pending is always "right now" — not bounded by the dashboard window,
      // so the admin can still see un-acknowledged orders from earlier days.
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["new", "confirmed"]),
      inWindow(
        supabase
          .from("orders")
          .select("total_pkr, payment_status, created_at")
          .eq("payment_status", "paid"),
      ),
      // Recent orders list is always the latest 8 regardless of range, so the
      // admin can act on anything fresh without changing filters.
      supabase
        .from("orders")
        .select(
          "id, name, total_pkr, status, payment_method, payment_status, created_at, items",
        )
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    const revenueInRange = (revenueRows ?? []).reduce(
      (s, r) => s + (r.total_pkr ?? 0),
      0,
    );

    // Top items across the same window — falls back to "recent 50" if the
    // range is "all time" so the table is not empty on a fresh project.
    let topItemsQuery = supabase
      .from("orders")
      .select("items, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (since) topItemsQuery = topItemsQuery.gte("created_at", since.toISOString());
    if (until) topItemsQuery = topItemsQuery.lte("created_at", until.toISOString());
    const { data: itemSample } = await topItemsQuery;

    const tally = new Map<string, number>();
    for (const row of itemSample ?? []) {
      const items = (row.items as { name?: string; qty?: number }[]) ?? [];
      for (const it of items) {
        if (!it?.name) continue;
        tally.set(it.name, (tally.get(it.name) ?? 0) + (it.qty ?? 0));
      }
    }
    const topItems = [...tally.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalOrdersInRange: totalOrdersInRange ?? 0,
      pendingCount: pendingCount ?? 0,
      revenueInRange,
      recentOrders: (recentOrders as OrderRow[]) ?? [],
      topItems,
    };
  } catch (err) {
    console.error("admin dashboard load failed", err);
    return null;
  }
}

export default async function AdminDashboardPage({
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

  const [data, store] = await Promise.all([
    loadStats(resolved.since, resolved.until),
    getStoreSettings(),
  ]);

  if (!data) {
    return (
      <div className="rounded-3xl border border-dashed border-espresso-200 bg-white p-10 text-center">
        <p className="font-display text-2xl text-espresso-800">
          Connect Supabase to see live stats.
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-espresso-500">
          Set <code className="rounded bg-cream-100 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code className="rounded bg-cream-100 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{" "}
          <code className="rounded bg-cream-100 px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          in <code className="rounded bg-cream-100 px-1.5 py-0.5">.env.local</code> and run the SQL migration.
        </p>
      </div>
    );
  }

  // Carry the current range through to the linked pages so clicking a stat
  // card preserves context.
  const rangeQuery = buildRangeQuery(current, {}, {
    from: searchParams.from,
    to: searchParams.to,
  });

  const stats = [
    {
      label: `Orders (${resolved.label.toLowerCase()})`,
      value: data.totalOrdersInRange.toLocaleString(),
      icon: ShoppingBag,
      tone: "espresso",
      href: `/admin/orders${rangeQuery}`,
    },
    {
      label: "Pending orders",
      value: data.pendingCount.toLocaleString(),
      icon: Clock,
      tone: "caramel",
      href: "/admin/orders?status=new",
    },
    {
      label: `Revenue paid (${resolved.label.toLowerCase()})`,
      value: formatPkr(data.revenueInRange),
      icon: Banknote,
      tone: "matcha",
      href: `/admin/revenue${rangeQuery}`,
    },
    {
      label: `Average order (${resolved.label.toLowerCase()})`,
      value:
        data.totalOrdersInRange > 0
          ? formatPkr(Math.round(data.revenueInRange / data.totalOrdersInRange))
          : formatPkr(0),
      icon: TrendingUp,
      tone: "blush",
      href: `/admin/revenue${rangeQuery}`,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="High-level pulse of the business. Switch the date range to slice everything below — only Pending orders and Latest orders stay live."
      />

      <DateRangeFilter
        basePath="/admin"
        current={current}
        resolved={resolved}
        searchParams={searchParams}
      />

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Wrapper = s.href
            ? ({ children }: { children: React.ReactNode }) => (
                <Link
                  href={s.href!}
                  className="card-hoverable group flex h-full flex-col p-5"
                >
                  {children}
                </Link>
              )
            : ({ children }: { children: React.ReactNode }) => (
                <div className="card flex h-full flex-col p-5">{children}</div>
              );
          return (
            <Wrapper key={s.label}>
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    s.tone === "espresso" && "bg-espresso-700/10 text-espresso-700",
                    s.tone === "caramel" && "bg-caramel-500/15 text-caramel-700",
                    s.tone === "matcha" && "bg-green-100 text-green-700",
                    s.tone === "blush" && "bg-blush-200/40 text-blush-500",
                  )}
                >
                  <s.icon className="h-5 w-5" />
                </span>
                {s.href && (
                  <ArrowUpRight className="h-4 w-4 text-espresso-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                )}
              </div>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-espresso-400 sm:mt-5 sm:text-[11px] sm:tracking-[0.2em]">
                {s.label}
              </p>
              <p className="mt-1 break-words font-display text-2xl text-espresso-800 tabular-nums sm:text-3xl">
                {s.value}
              </p>
            </Wrapper>
          );
        })}
      </div>

      {/* Busyness pill */}
      {store && (
        <Link
          href="/admin/busyness"
          className="card-hoverable group flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-caramel-500/15 text-caramel-700 transition-transform duration-200 group-hover:scale-110">
            <Gauge className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
              Busyness
            </p>
            <p className="mt-0.5 font-display text-base text-espresso-800 sm:text-lg">
              {BUSYNESS_LABELS[store.busyness_level]}{" "}
              <span className="text-sm text-espresso-500">
                · ×{BUSYNESS_MULTIPLIERS[store.busyness_level]} multiplier
              </span>
            </p>
            <p className="mt-1 text-xs text-espresso-500">
              Auto-advance: new → confirmed {" "}
              <span className="font-semibold text-espresso-700 tabular-nums">
                ~
                {store.auto_progress_minutes.new_to_confirmed *
                  BUSYNESS_MULTIPLIERS[store.busyness_level]}{" "}
                min
              </span>
              , confirmed → out for delivery{" "}
              <span className="font-semibold text-espresso-700 tabular-nums">
                ~
                {store.auto_progress_minutes.confirmed_to_out_for_delivery *
                  BUSYNESS_MULTIPLIERS[store.busyness_level]}{" "}
                min
              </span>
              .
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-espresso-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      )}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <section className="card lg:col-span-2">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-espresso-100 px-4 py-4 sm:px-6">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h2 className="mt-1 font-display text-base text-espresso-800 sm:text-lg">
                Latest orders
              </h2>
            </div>
            <Link
              href={`/admin/orders${rangeQuery}`}
              className="link-underline text-[11px] font-semibold uppercase tracking-[0.18em] text-espresso-600 hover:text-caramel-700 sm:text-xs sm:tracking-[0.2em]"
            >
              View all →
            </Link>
          </header>
          {data.recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-espresso-500">
              No orders yet.
            </div>
          ) : (
            <ul className="divide-y divide-espresso-100">
              {data.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-cream-100/60 sm:gap-4 sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="truncate font-display text-sm text-espresso-800 sm:text-base">
                          {o.name}
                        </p>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-espresso-500">
                        {(o.items ?? [])
                          .slice(0, 3)
                          .map((i) => `${i.qty}× ${i.name}`)
                          .join(" · ")}
                        {(o.items?.length ?? 0) > 3 ? "…" : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-espresso-800 tabular-nums sm:text-base">
                        {formatPkr(o.total_pkr ?? 0)}
                      </p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-espresso-400">
                        {o.payment_method === "card" ? "Card" : "COD"} ·{" "}
                        {new Date(o.created_at).toLocaleTimeString("en-PK", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Top items + quick links */}
        <section className="card flex flex-col">
          <header className="border-b border-espresso-100 px-5 py-4">
            <p className="eyebrow">{resolved.label}</p>
            <h2 className="mt-1 font-display text-lg text-espresso-800">
              Top drinks
            </h2>
          </header>
          {data.topItems.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-espresso-500">
              Not enough data yet.
            </div>
          ) : (
            <ol className="divide-y divide-espresso-100">
              {data.topItems.map(([name, qty], i) => (
                <li
                  key={name}
                  className="flex items-center gap-4 px-5 py-3"
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                      i === 0
                        ? "bg-caramel-500 text-cream-50"
                        : "bg-cream-100 text-espresso-600",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-espresso-700">
                    {name}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-espresso-500">
                    {qty}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-auto border-t border-espresso-100 p-3">
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
              Quick links
            </p>
            <div className="grid grid-cols-2 gap-2">
              <QuickLink href="/admin/products" icon={Coffee} label="Products" />
              <QuickLink href="/admin/orders" icon={ShoppingBag} label="Orders" />
              <QuickLink href="/admin/reviews" icon={Star} label="Reviews" />
              <QuickLink href="/admin/messages" icon={Mail} label="Messages" />
              <QuickLink href="/admin/store" icon={Clock} label="Store status" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Coffee;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-espresso-600 transition-all duration-150 hover:-translate-y-0.5 hover:bg-cream-100 hover:text-espresso-800"
    >
      <Icon className="h-3.5 w-3.5 text-espresso-400" />
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    new: { label: "New", cls: "bg-caramel-500/15 text-caramel-700" },
    confirmed: { label: "Confirmed", cls: "bg-blue-50 text-blue-700" },
    out_for_delivery: {
      label: "Out for delivery",
      cls: "bg-purple-50 text-purple-700",
    },
    delivered: { label: "Delivered", cls: "bg-green-50 text-green-700" },
    cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700" },
  };
  const m = map[status] ?? { label: status, cls: "bg-cream-100 text-espresso-600" };
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]",
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}
