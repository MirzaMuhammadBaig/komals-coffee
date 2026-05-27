"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  CreditCard,
  Banknote,
  MessageCircle,
  Printer,
  ShoppingBag,
  Tag,
  Truck,
  Store as PickupIcon,
} from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { site } from "@/lib/data/site";
import { formatPkr, whatsappLink } from "@/lib/utils";

type ReceiptSummary = {
  subtotal_pkr: number | null;
  discount_pkr: number | null;
  coupon_code: string | null;
  total_pkr: number | null;
};

/**
 * Order success — shown after a Safepay redirect (card payments). Reads
 * URL params written by `/api/orders` so the page can be honest about
 * what was actually purchased: order number, payment method, fulfilment
 * mode. The page is print-friendly: the user can save or print the
 * receipt and the chrome (buttons, header banner) collapses to a clean
 * paper layout.
 */
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessInner />
    </Suspense>
  );
}

function OrderSuccessInner() {
  const params = useSearchParams();
  const { clear } = useCart();

  // The Safepay redirect carries order_id; payment / fulfilment are
  // optional overrides for when COD or pickup eventually use the page.
  const orderId = params.get("order_id") ?? "";
  const orderNumber = orderId ? orderId.slice(0, 8).toUpperCase() : null;
  const payment =
    params.get("payment") === "cod" ? "cod" : ("card" as const);
  const fulfilment =
    params.get("fulfilment") === "pickup"
      ? "pickup"
      : ("delivery" as const);

  const [receipt, setReceipt] = useState<ReceiptSummary | null>(null);

  // Clear the cart once the user has returned from Safepay successfully.
  useEffect(() => {
    clear();
  }, [clear]);

  // Fetch the receipt summary (subtotal/discount/coupon/total). Order id
  // is the only thing in the URL — we never leak the customer's promo
  // or pricing into the address bar. A 404 just hides the block.
  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/orders/${orderId}/summary`, {
          cache: "no-store",
        });
        if (!r.ok) return;
        const json = (await r.json()) as ReceiptSummary;
        if (!cancelled) setReceipt(json);
      } catch {
        // Silent — we already display the order number + chips from the URL.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const showPricing =
    receipt &&
    typeof receipt.total_pkr === "number" &&
    receipt.total_pkr >= 0;

  function onPrint() {
    if (typeof window !== "undefined") window.print();
  }

  return (
    <section className="bg-cream-100/40 py-12 print:bg-white print:py-0 sm:py-20 lg:py-28">
      <div className="container-base">
        <div className="card mx-auto max-w-2xl overflow-hidden print:shadow-none print:ring-0">
          {/* Hero strip — collapses to a simple line in print. */}
          <div className="bg-gradient-to-br from-caramel-500 via-caramel-600 to-caramel-700 px-5 py-8 text-center text-cream-50 print:bg-white print:px-0 print:py-4 print:text-espresso-800 sm:px-12 sm:py-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-50/15 ring-2 ring-cream-50/30 print:hidden sm:h-16 sm:w-16">
              <Check className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-cream-100/80 print:mt-0 print:text-espresso-500 sm:mt-5 sm:text-xs sm:tracking-[0.3em]">
              {payment === "card" ? "Payment successful" : "Order received"}
            </p>
            <h1 className="mt-2 font-display text-2xl sm:mt-3 sm:text-3xl lg:text-4xl">
              Thank you for ordering!
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-cream-100/90 print:hidden sm:mt-4">
              {payment === "card"
                ? "Your payment has been received. Komal is notified the moment your order lands and usually replies on WhatsApp within minutes to confirm timing."
                : "Your order is in. Komal usually replies on WhatsApp within minutes to confirm timing and the cash-on-delivery details."}
            </p>
          </div>

          <div className="space-y-5 px-5 py-6 sm:px-12 sm:py-10">
            {/* Order number + summary chips */}
            {orderNumber && (
              <div className="rounded-2xl border border-dashed border-espresso-200 bg-cream-50 p-4 text-center sm:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-espresso-400 sm:text-[11px]">
                  Save this order number
                </p>
                <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-espresso-800 sm:text-3xl">
                  {orderNumber}
                </p>
                <p className="mt-2 text-xs text-espresso-500">
                  Quote this if you message Komal about your order.
                </p>
              </div>
            )}

            {/* Pricing breakdown — fetched from the order summary endpoint. */}
            {showPricing && (
              <div className="rounded-2xl border border-espresso-100 bg-white p-4 sm:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-espresso-400 sm:text-[11px]">
                  Receipt
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  {typeof receipt.subtotal_pkr === "number" && (
                    <Row
                      label="Subtotal"
                      value={formatPkr(receipt.subtotal_pkr)}
                    />
                  )}
                  {receipt.coupon_code &&
                    typeof receipt.discount_pkr === "number" &&
                    receipt.discount_pkr > 0 && (
                      <Row
                        label={
                          <span className="inline-flex items-center gap-1.5 font-mono tracking-wider text-green-700">
                            <Tag className="h-3.5 w-3.5" />
                            {receipt.coupon_code}
                          </span>
                        }
                        value={
                          <span className="text-green-700">
                            − {formatPkr(receipt.discount_pkr)}
                          </span>
                        }
                      />
                    )}
                  <Row
                    label={
                      <span className="font-semibold text-espresso-800">
                        Total paid
                      </span>
                    }
                    value={
                      <span className="font-display text-lg text-espresso-800">
                        {formatPkr(receipt.total_pkr ?? 0)}
                      </span>
                    }
                  />
                </dl>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1.5 font-semibold text-espresso-700">
                {payment === "card" ? (
                  <>
                    <CreditCard className="h-3.5 w-3.5 text-caramel-600" />
                    Paid by card
                  </>
                ) : (
                  <>
                    <Banknote className="h-3.5 w-3.5 text-caramel-600" />
                    Cash on delivery
                  </>
                )}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1.5 font-semibold text-espresso-700">
                {fulfilment === "pickup" ? (
                  <>
                    <PickupIcon className="h-3.5 w-3.5 text-caramel-600" />
                    Self-pickup
                  </>
                ) : (
                  <>
                    <Truck className="h-3.5 w-3.5 text-caramel-600" />
                    Home delivery
                  </>
                )}
              </span>
            </div>

            <ol className="space-y-4 text-sm text-espresso-700">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-caramel-500/15 text-xs font-bold text-caramel-700">
                  1
                </span>
                <p>
                  <span className="font-semibold text-espresso-800">
                    Komal will reach out on WhatsApp
                  </span>{" "}
                  usually within a few minutes to confirm timing. If you do
                  not hear back, message her directly using the button below.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-caramel-500/15 text-xs font-bold text-caramel-700">
                  2
                </span>
                <p>
                  <span className="font-semibold text-espresso-800">
                    Komal prepares your drinks
                  </span>{" "}
                  fresh, by hand, in her home kitchen.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-caramel-500/15 text-xs font-bold text-caramel-700">
                  3
                </span>
                <p>
                  <span className="font-semibold text-espresso-800">
                    {fulfilment === "pickup"
                      ? "Ready in 30 to 45 minutes"
                      : "Delivery in 30 to 45 minutes"}
                  </span>
                  ,{" "}
                  {fulfilment === "pickup"
                    ? "sealed and ready when you arrive."
                    : "sealed and insulated, straight to your door."}
                </p>
              </li>
            </ol>

            {/* Action row — hidden when printing. */}
            <div className="flex flex-col gap-3 pt-2 print:hidden sm:flex-row sm:flex-wrap sm:pt-3">
              <a
                href={whatsappLink(
                  site.contact.whatsapp,
                  orderNumber
                    ? `Hi Komal! Following up on order ${orderNumber}.`
                    : "Hi Komal! I just placed an order.",
                )}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-whatsapp w-full sm:w-auto"
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Message Komal
              </a>
              <button
                type="button"
                onClick={onPrint}
                className="btn-ghost w-full sm:w-auto"
              >
                <Printer className="mr-2 h-4 w-4" /> Print receipt
              </button>
              <Link href="/menu" className="btn-ghost w-full sm:w-auto">
                <ShoppingBag className="mr-2 h-4 w-4" /> Browse menu again
              </Link>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-md text-center text-xs text-espresso-400 print:hidden">
          Need help? Message Komal on WhatsApp at{" "}
          <a
            href={whatsappLink(site.contact.whatsapp)}
            target="_blank"
            rel="noreferrer noopener"
            className="link-underline font-semibold text-espresso-600 hover:text-caramel-700"
          >
            {site.contact.whatsapp}
          </a>
          .
        </p>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-espresso-700">
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
