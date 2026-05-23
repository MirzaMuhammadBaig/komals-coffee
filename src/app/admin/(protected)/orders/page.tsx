import Link from "next/link";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { formatPkr, cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "out_for_delivery", label: "Out" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const status = searchParams.status ?? "all";
  const q = (searchParams.q ?? "").trim();

  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("orders")
    .select(
      "id, name, phone, total_pkr, status, payment_method, payment_status, created_at, items",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);

  const { data: orders, error } = await query;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Orders"
        title="All orders"
        description="Newest first. Click a row to view full details and update status."
      />

      {/* Filters */}
      <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {STATUS_FILTERS.map((f) => {
            const active = status === f.value;
            const params = new URLSearchParams();
            if (f.value !== "all") params.set("status", f.value);
            if (q) params.set("q", q);
            const href = `/admin/orders${params.toString() ? `?${params}` : ""}`;
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
          {status !== "all" && (
            <input type="hidden" name="status" defaultValue={status} />
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
        <div className="card p-6 text-sm text-red-600">
          {error.message}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-display text-xl text-espresso-800">
            No orders yet.
          </p>
          <p className="mt-2 text-sm text-espresso-500">
            Orders will appear here as customers place them.
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
            {orders.map((o) => (
              <li key={o.id}>
                {/* Mobile: card-style layout. Desktop: 6-column grid. */}
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
                    {/* Mobile/tablet only: status next to name */}
                    <span className="shrink-0 lg:hidden">
                      <StatusBadge status={o.status} />
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 break-words text-xs text-espresso-600 lg:mt-0 lg:truncate">
                    {(
                      (o.items as { name?: string; qty?: number }[]) ?? []
                    )
                      .map((i) => `${i.qty}× ${i.name}`)
                      .join(" · ")}
                  </p>

                  {/* Mobile/tablet only: bottom row with price + payment */}
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

                  {/* Desktop only: spread into columns */}
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
        </div>
      )}
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
