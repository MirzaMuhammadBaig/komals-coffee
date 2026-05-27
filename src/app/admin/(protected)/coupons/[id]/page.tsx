import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  Calendar,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CouponForm from "@/components/admin/CouponForm";
import DateRangeFilter from "@/components/admin/DateRangeFilter";
import {
  listOrdersForCoupon,
  type CouponOrderRow,
} from "@/lib/admin/coupon-stats";
import {
  DATE_RANGES,
  DEFAULT_RANGE,
  resolveDateRange,
  type DateRange,
} from "@/lib/admin/date-ranges";
import { cn, formatPkr } from "@/lib/utils";

// Convert ISO to value usable by <input type="datetime-local"> (local time, no Z).
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditCouponPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { range?: string; from?: string; to?: string };
}) {
  const supabase = createSupabaseServiceClient();
  const { data: c } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!c) notFound();

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

  // Pull every order that used this code in the window.
  const orders = await listOrdersForCoupon(
    supabase,
    c.code,
    resolved.since,
    resolved.until,
  );

  const totalDiscount = orders.reduce(
    (s, o) => s + (o.discount_pkr ?? 0),
    0,
  );
  const totalRevenue = orders.reduce(
    (s, o) => s + (o.total_pkr ?? 0),
    0,
  );
  const avgDiscount =
    orders.length > 0 ? Math.round(totalDiscount / orders.length) : 0;
  const lastUsed = orders.length > 0 ? orders[0].created_at : null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/coupons"
        className="link-underline inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500 hover:text-caramel-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Coupons
      </Link>

      <AdminPageHeader
        eyebrow="Edit coupon"
        title={c.code}
        description={`${c.used_count} lifetime use${c.used_count === 1 ? "" : "s"}${
          c.max_uses ? ` of ${c.max_uses}` : ""
        }`}
      />

      {/* ──────────── Analytics section ──────────── */}
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Analytics</p>
            <h2 className="mt-1 font-display text-lg text-espresso-800 sm:text-xl">
              Redemptions
            </h2>
          </div>
          <Link
            href={`/admin/orders?q=${encodeURIComponent(c.code)}`}
            className="link-underline inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-espresso-600 hover:text-caramel-700 sm:text-xs sm:tracking-[0.2em]"
          >
            View in orders <ArrowUpRight className="h-3 w-3" />
          </Link>
        </header>

        <DateRangeFilter
          basePath={`/admin/coupons/${params.id}`}
          current={current}
          resolved={resolved}
          searchParams={searchParams}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Chip
            icon={ShoppingBag}
            tone="espresso"
            label="Redemptions"
            value={orders.length.toLocaleString()}
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
            tone="caramel"
            label="Avg discount"
            value={formatPkr(avgDiscount)}
            sub="per redemption"
          />
          <Chip
            icon={Calendar}
            tone="blush"
            label="Last used"
            value={
              lastUsed
                ? new Date(lastUsed).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                  })
                : "—"
            }
            sub={
              lastUsed
                ? new Date(lastUsed).toLocaleTimeString("en-PK", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "no redemptions yet"
            }
          />
        </div>

        {/* Redemptions list */}
        <section className="card overflow-hidden">
          <header className="border-b border-espresso-100 px-5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
              Orders that used this code · {resolved.label}
            </p>
          </header>
          {orders.length === 0 ? (
            <div className="bg-cream-100/40 px-5 py-12 text-center text-sm text-espresso-500">
              No redemptions in this window. Widen the date range or
              try All time.
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[1.4fr_1.2fr_0.9fr_0.9fr_0.9fr_auto] gap-4 border-b border-espresso-100 bg-cream-100/30 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-espresso-500 lg:grid">
                <span>Customer</span>
                <span>Placed</span>
                <span>Subtotal</span>
                <span>Discount</span>
                <span>Paid</span>
                <span></span>
              </div>
              <ul className="divide-y divide-espresso-100">
                {orders.map((o) => (
                  <RedemptionRow key={o.id} order={o} />
                ))}
              </ul>
              <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-espresso-100 bg-cream-100/40 px-5 py-3 text-xs">
                <span className="text-espresso-500">
                  {orders.length} redemption{orders.length === 1 ? "" : "s"} in
                  view{orders.length === 200 ? " (capped)" : ""}
                </span>
                <span className="font-semibold tabular-nums text-espresso-700">
                  Revenue: {formatPkr(totalRevenue)} ·{" "}
                  <span className="text-green-700">
                    Saved: {formatPkr(totalDiscount)}
                  </span>
                </span>
              </footer>
            </>
          )}
        </section>
      </section>

      {/* ──────────── Edit form ──────────── */}
      <section className="space-y-4">
        <header>
          <p className="eyebrow">Settings</p>
          <h2 className="mt-1 font-display text-lg text-espresso-800 sm:text-xl">
            Coupon settings
          </h2>
        </header>
        <CouponForm
          mode="edit"
          initial={{
            id: c.id,
            code: c.code ?? "",
            kind: (c.kind as "percent" | "flat") ?? "percent",
            value: c.value ?? 0,
            min_order_pkr: c.min_order_pkr ?? 0,
            max_uses: c.max_uses ?? null,
            starts_at: toLocalInput(c.starts_at),
            expires_at: toLocalInput(c.expires_at),
            is_active: c.is_active ?? true,
            notes: c.notes ?? "",
          }}
        />
      </section>
    </div>
  );
}

function RedemptionRow({ order }: { order: CouponOrderRow }) {
  return (
    <li className="grid grid-cols-[1fr_auto] gap-3 px-5 py-3 transition-colors hover:bg-cream-100/40 lg:grid-cols-[1.4fr_1.2fr_0.9fr_0.9fr_0.9fr_auto] lg:items-center lg:gap-4">
      <div className="min-w-0">
        <p className="truncate font-display text-sm text-espresso-800">
          {order.name}
        </p>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.15em] text-espresso-400">
          {order.status} · {order.payment_status}
        </p>
      </div>
      <p className="hidden text-xs text-espresso-500 lg:block">
        {new Date(order.created_at).toLocaleString("en-PK", {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>
      <p className="hidden text-sm tabular-nums text-espresso-700 lg:block">
        {typeof order.subtotal_pkr === "number"
          ? formatPkr(order.subtotal_pkr)
          : "—"}
      </p>
      <p className="hidden text-sm tabular-nums text-green-700 lg:block">
        − {formatPkr(order.discount_pkr ?? 0)}
      </p>
      <p className="hidden text-sm font-semibold tabular-nums text-espresso-800 lg:block">
        {formatPkr(order.total_pkr ?? 0)}
      </p>
      {/* Mobile second line — placed + discount/total */}
      <div className="text-right lg:hidden">
        <p className="font-semibold tabular-nums text-espresso-800">
          {formatPkr(order.total_pkr ?? 0)}
        </p>
        <p className="text-[11px] text-green-700 tabular-nums">
          − {formatPkr(order.discount_pkr ?? 0)}
        </p>
      </div>
      <Link
        href={`/admin/orders/${order.id}`}
        aria-label={`Open order for ${order.name}`}
        className="col-span-2 inline-flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.15em] text-espresso-400 hover:text-caramel-700 lg:col-span-1 lg:justify-end"
      >
        <span className="lg:hidden">
          {new Date(order.created_at).toLocaleString("en-PK", {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </li>
  );
}

function Chip({
  icon: Icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: typeof Banknote;
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
