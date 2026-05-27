import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import OrderStatusControls from "@/components/admin/OrderStatusControls";
import { tickAutoAdvance } from "@/lib/admin/orders";
import { formatPkr } from "@/lib/utils";
import { whatsappLink } from "@/lib/utils";

type Item = { name: string; qty: number; unit_price_pkr: number; slug: string };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Lazy-on-read auto-advance before we load this order, so the detail
  // page reflects the same state the list does.
  await tickAutoAdvance();

  const supabase = createSupabaseServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!order) notFound();

  const items = (order.items as Item[]) ?? [];
  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const firstName =
    typeof order.name === "string" && order.name.trim()
      ? order.name.trim().split(/\s+/)[0]
      : "there";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/orders"
          className="link-underline inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500 hover:text-caramel-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All orders
        </Link>
      </div>

      <AdminPageHeader
        eyebrow={`Order ${orderNumber}`}
        title={order.name}
        description={`Placed ${new Date(order.created_at).toLocaleString("en-PK")}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Items */}
          <section className="card overflow-hidden">
            <header className="border-b border-espresso-100 px-5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
                Items ({items.length})
              </p>
            </header>
            <ul className="divide-y divide-espresso-100">
              {items.map((it) => (
                <li
                  key={it.slug}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cream-100 text-xs font-bold text-espresso-600">
                      {it.qty}
                    </span>
                    <span className="font-display text-base text-espresso-800">
                      {it.name}
                    </span>
                  </div>
                  <span className="font-semibold tabular-nums text-espresso-700">
                    {formatPkr(it.qty * it.unit_price_pkr)}
                  </span>
                </li>
              ))}
            </ul>
            <footer className="border-t border-espresso-100 bg-cream-100/50 px-5 py-3">
              {/* Pricing breakdown — only shows the subtotal/discount
                  lines when migration 003 has been applied AND the
                  fields are present on this order row. */}
              {typeof order.subtotal_pkr === "number" && (
                <div className="mb-2 flex items-center justify-between text-sm text-espresso-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums">
                    {formatPkr(order.subtotal_pkr)}
                  </span>
                </div>
              )}
              {order.coupon_code &&
                typeof order.discount_pkr === "number" &&
                order.discount_pkr > 0 && (
                  <div className="mb-2 flex items-center justify-between text-sm text-green-700">
                    <span className="inline-flex items-center gap-1.5 font-mono tracking-wider">
                      {order.coupon_code}
                    </span>
                    <span className="tabular-nums">
                      − {formatPkr(order.discount_pkr)}
                    </span>
                  </div>
                )}
              <div className="flex items-center justify-between border-t border-espresso-200 pt-2">
                <span className="text-sm font-semibold text-espresso-700">
                  Total
                </span>
                <span className="font-display text-xl text-espresso-800 tabular-nums">
                  {formatPkr(order.total_pkr ?? 0)}
                </span>
              </div>
            </footer>
          </section>

          {/* Notes & address */}
          <section className="card space-y-4 p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
                Delivery address
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-espresso-700">
                {order.delivery_address}
              </p>
            </div>
            {order.notes && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
                  Notes from customer
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-espresso-700">
                  {order.notes}
                </p>
              </div>
            )}
          </section>

          {/* Status controls */}
          <section className="card p-5">
            <OrderStatusControls
              orderId={order.id}
              initialStatus={order.status}
              initialPaymentStatus={order.payment_status}
            />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <section className="card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
              Customer
            </p>
            <p className="mt-2 font-display text-lg text-espresso-800">
              {order.name}
            </p>
            {order.email && (
              <p className="mt-0.5 text-sm text-espresso-600">{order.email}</p>
            )}
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Phone (WhatsApp)" value={order.phone} />
              <Row label="Phone 2" value={order.secondary_phone} />
            </dl>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <a
                href={whatsappLink(
                  order.phone,
                  `Hi ${firstName}! Following up on your order ${orderNumber}.`,
                )}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-whatsapp w-full sm:w-auto"
              >
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </a>
              <a
                href={`tel:${order.phone.replace(/\s/g, "")}`}
                className="btn-ghost w-full sm:w-auto"
              >
                <Phone className="mr-2 h-4 w-4" /> Call
              </a>
            </div>
          </section>

          <section className="card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
              Payment
            </p>
            <dl className="mt-3 space-y-3 text-sm">
              <Row
                label="Method"
                value={order.payment_method === "card" ? "Card" : "Cash on delivery"}
              />
              <Row
                label="Provider"
                value={order.payment_provider ?? "Not set"}
              />
              <Row label="Status" value={order.payment_status} />
              {order.payment_tracker && (
                <Row label="Tracker" value={order.payment_tracker} mono />
              )}
              <Row label="Channel" value={order.channel} />
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-espresso-400">{label}</dt>
      <dd
        className={
          mono
            ? "max-w-[60%] truncate text-right font-mono text-xs text-espresso-700"
            : "max-w-[60%] truncate text-right text-espresso-700"
        }
      >
        {value || "Not set"}
      </dd>
    </div>
  );
}
