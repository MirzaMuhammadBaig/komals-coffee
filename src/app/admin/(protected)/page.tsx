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
} from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { formatPkr, cn } from "@/lib/utils";

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

async function loadStats() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }
  try {
    const supabase = createSupabaseServiceClient();

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [
      { count: totalOrders30d },
      { count: pendingCount },
      { data: revenueRows },
      { data: recentOrders },
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", since.toISOString()),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("orders")
        .select("total_pkr, payment_status, created_at")
        .gte("created_at", since.toISOString())
        .eq("payment_status", "paid"),
      supabase
        .from("orders")
        .select(
          "id, name, total_pkr, status, payment_method, payment_status, created_at, items",
        )
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    const revenue30d = (revenueRows ?? []).reduce(
      (s, r) => s + (r.total_pkr ?? 0),
      0,
    );

    // Top items across recent orders (last 50).
    const { data: itemSample } = await supabase
      .from("orders")
      .select("items")
      .order("created_at", { ascending: false })
      .limit(50);

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
      totalOrders30d: totalOrders30d ?? 0,
      pendingCount: pendingCount ?? 0,
      revenue30d,
      recentOrders: (recentOrders as OrderRow[]) ?? [],
      topItems,
    };
  } catch (err) {
    console.error("admin dashboard load failed", err);
    return null;
  }
}

export default async function AdminDashboardPage() {
  const data = await loadStats();

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

  const stats = [
    {
      label: "Orders (30 days)",
      value: data.totalOrders30d.toLocaleString(),
      icon: ShoppingBag,
      tone: "espresso",
    },
    {
      label: "Pending orders",
      value: data.pendingCount.toLocaleString(),
      icon: Clock,
      tone: "caramel",
      href: "/admin/orders?status=new",
    },
    {
      label: "Revenue paid (30d)",
      value: formatPkr(data.revenue30d),
      icon: Banknote,
      tone: "matcha",
      href: "/admin/revenue",
    },
    {
      label: "Average order (30d)",
      value:
        data.totalOrders30d > 0
          ? formatPkr(Math.round(data.revenue30d / data.totalOrders30d))
          : formatPkr(0),
      icon: TrendingUp,
      tone: "blush",
      href: "/admin/revenue",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
                {s.label}
              </p>
              <p className="mt-1 font-display text-3xl text-espresso-800 tabular-nums">
                {s.value}
              </p>
            </Wrapper>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <section className="card lg:col-span-2">
          <header className="flex items-center justify-between border-b border-espresso-100 px-5 py-4 sm:px-6">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h2 className="mt-1 font-display text-lg text-espresso-800">
                Latest orders
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="link-underline text-xs font-semibold uppercase tracking-[0.2em] text-espresso-600 hover:text-caramel-700"
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
                    className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-cream-100/60 sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-display text-base text-espresso-800">
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
                    <div className="text-right">
                      <p className="font-semibold text-espresso-800 tabular-nums">
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
            <p className="eyebrow">This week</p>
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
