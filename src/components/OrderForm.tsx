"use client";

import { useMemo, useRef, useState } from "react";
import {
  Banknote,
  Check,
  CreditCard,
  Loader2,
  Lock,
  Minus,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { menu, type MenuItem } from "@/lib/data/menu";
import { cn, formatPkr } from "@/lib/utils";
import { site } from "@/lib/data/site";
import { useCart } from "@/lib/cart/CartContext";
import ProductDetailModal from "@/components/ProductDetailModal";
import CouponInput, {
  type AppliedCoupon,
} from "@/components/CouponInput";

type PaymentMethod = "cod" | "card";

export default function OrderForm() {
  const { items, total, totalQty, add, remove, setQty, clear, getQty } =
    useCart();
  const [query, setQuery] = useState("");
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<
    "idle" | "loading" | "redirecting" | "done" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  // Subtotal is the raw items total; payable is the post-discount number
  // we send to /api/orders. The server re-validates the coupon and
  // recomputes the discount — never trust this client-side figure.
  const subtotal = total;
  const discount = coupon ? Math.min(coupon.discount_pkr, subtotal) : 0;
  const payable = Math.max(0, subtotal - discount);

  const TOP_LIMIT = 10;
  const isSearching = query.trim().length > 0;

  const filtered = useMemo(() => {
    const base = menu.filter((m) => m.category !== "extras");
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((m) => {
      const haystack = [
        m.name,
        m.description,
        m.category,
        ...(m.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  // When the user is not searching, show only the top picks PLUS any cart
  // items that fall outside that top set, so users can still adjust the
  // quantity of a drink they have already added.
  const visible = useMemo(() => {
    if (isSearching) return filtered;
    const top = filtered.slice(0, TOP_LIMIT);
    const topSlugs = new Set(top.map((m) => m.slug));
    const cartExtras = items
      .map((i) => i.item)
      .filter((m) => m.category !== "extras" && !topSlugs.has(m.slug));
    return [...top, ...cartExtras];
  }, [filtered, items, isSearching]);

  const baseTotal = useMemo(
    () => menu.filter((m) => m.category !== "extras").length,
    [],
  );
  const hiddenCount = isSearching ? 0 : Math.max(0, baseTotal - TOP_LIMIT);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) {
      setError("Add at least one item before placing an order.");
      setState("error");
      return;
    }
    if (total < site.service.minOrder) {
      setError(
        `Minimum order is ${formatPkr(site.service.minOrder)}. Add a little more!`,
      );
      setState("error");
      return;
    }

    setState("loading");
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      secondary_phone: String(fd.get("secondary_phone") ?? ""),
      email: String(fd.get("email") ?? "") || null,
      delivery_address: String(fd.get("delivery_address") ?? ""),
      notes: String(fd.get("notes") ?? "") || null,
      items: items.map((l) => ({
        slug: l.slug,
        name: l.item.name,
        qty: l.qty,
        unit_price_pkr: l.item.price,
      })),
      subtotal_pkr: subtotal,
      total_pkr: payable,
      payment_method: paymentMethod,
      coupon_code: coupon?.code ?? null,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong");

      // Card flow: redirect the user to Safepay's hosted checkout. Do NOT
      // clear the cart yet — the success page handles that after payment.
      if (data.payment_method === "card" && data.redirect) {
        setState("redirecting");
        window.location.href = data.redirect as string;
        return;
      }

      // Cash-on-delivery: order is confirmed, clear cart and show success.
      setState("done");
      clear();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (state === "done") {
    return (
      <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:p-8">
        <div className="rounded-full bg-caramel-500/15 p-3 text-caramel-600">
          <Check className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-display text-xl text-espresso-800 sm:text-2xl">
            Order received. See you in 30 to 45 minutes.
          </h3>
          <p className="mt-2 text-sm text-espresso-500">
            Komal will WhatsApp you within minutes to confirm timing and the
            payment method. Thank you for ordering!
          </p>
        </div>
      </div>
    );
  }

  const itemCount = totalQty;

  return (
    <>
    <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-8">
      <div className="min-w-0">
        <div className="card overflow-hidden">
          <div className="border-b border-espresso-100 bg-cream-100/50 px-4 py-4 sm:px-6">
            <p className="eyebrow">Step 1</p>
            <h3 className="mt-1 font-display text-base text-espresso-800 sm:text-xl">
              Pick your drinks
            </h3>

            <div className="relative mt-3">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400"
                aria-hidden
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search drinks…"
                aria-label="Search drinks"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-full border border-espresso-100 bg-white py-2 pl-9 pr-9 text-sm text-espresso-800 placeholder:text-espresso-300 focus:border-espresso-300 focus:outline-none focus:ring-2 focus:ring-caramel-400/40"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-espresso-400 transition-all duration-150 hover:bg-cream-100 hover:text-espresso-700 active:scale-90"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {query && (
              <p className="mt-2 text-xs text-espresso-400">
                {filtered.length}{" "}
                {filtered.length === 1 ? "match" : "matches"} for &ldquo;
                {query}&rdquo;
              </p>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center sm:px-6">
              <p className="font-display text-lg text-espresso-700">
                No drinks match &ldquo;{query}&rdquo;.
              </p>
              <p className="mt-2 text-sm text-espresso-500">
                Try &ldquo;latte&rdquo;, &ldquo;caramel&rdquo;, or clear the
                search to see everything.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-espresso-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-600 transition-all duration-200 hover:border-espresso-700 hover:bg-espresso-700 hover:text-cream-50 active:scale-95"
              >
                <X className="h-3 w-3" /> Clear search
              </button>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-espresso-100">
                {visible.map((m) => {
                  const qty = getQty(m.slug);
                  const active = qty > 0;
                  return (
                    <li
                      key={m.slug}
                      className={cn(
                        "group flex items-center gap-3 px-4 py-3 transition-colors duration-200 sm:gap-4 sm:px-6 sm:py-4",
                        active
                          ? "bg-caramel-500/10"
                          : "hover:bg-cream-100/60",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setModalItem(m)}
                        title={`View ${m.name} details`}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p
                          className={cn(
                            "truncate font-display text-base underline-offset-2 transition-colors duration-200 hover:underline sm:text-lg",
                            active
                              ? "text-caramel-700"
                              : "text-espresso-800 group-hover:text-caramel-700",
                          )}
                        >
                          {m.name}
                        </p>
                        <p className="text-xs text-espresso-400">
                          {m.size ? `${m.size} · ` : ""}
                          {formatPkr(m.price)}
                        </p>
                      </button>
                      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => remove(m.slug)}
                          disabled={qty === 0}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-espresso-200 text-espresso-700 transition-all duration-150 hover:border-espresso-400 hover:bg-cream-100 active:scale-90 disabled:opacity-30 disabled:hover:border-espresso-200 disabled:hover:bg-transparent"
                          aria-label={`Remove one ${m.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span
                          key={qty}
                          className={cn(
                            "w-6 text-center text-sm font-semibold tabular-nums transition-all duration-200",
                            active
                              ? "scale-110 text-caramel-700"
                              : "text-espresso-700",
                          )}
                        >
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => add(m.slug)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso-700 text-cream-50 transition-all duration-150 hover:scale-110 hover:bg-caramel-600 hover:shadow-md active:scale-95"
                          aria-label={`Add one ${m.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {!isSearching && hiddenCount > 0 && (
                <div className="border-t border-espresso-100 bg-cream-100/40 px-5 py-5 text-center sm:px-6">
                  <p className="text-sm text-espresso-700">
                    Showing our top picks. Looking for something else?
                  </p>
                  <p className="mt-1 text-xs text-espresso-500">
                    {hiddenCount} more {hiddenCount === 1 ? "drink" : "drinks"}{" "}
                    available. Use the search above to find any drink by name,
                    flavour or tag.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      inputRef.current?.focus();
                      inputRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-espresso-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-espresso-700 hover:bg-espresso-700 hover:text-cream-50 hover:shadow-md active:translate-y-0 active:scale-95"
                  >
                    <Search className="h-3 w-3" /> Search drinks
                  </button>
                </div>
              )}
            </>
          )}
          {itemCount > 0 && (
            <div className="border-t border-espresso-100 bg-cream-100/50 p-4 lg:hidden">
              <a
                href="#checkout-details"
                className="btn-primary w-full justify-center"
              >
                Continue with {itemCount} item{itemCount > 1 ? "s" : ""} ·{" "}
                {formatPkr(payable)}
              </a>
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        id="checkout-details"
        className="card flex min-w-0 scroll-mt-20 flex-col gap-4 p-5 sm:scroll-mt-24 sm:gap-5 sm:p-6 lg:p-8"
      >
        <div>
          <p className="eyebrow">Step 2</p>
          <h3 className="mt-1 font-display text-lg text-espresso-800 sm:text-xl">
            Your details
          </h3>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500">
            Name
          </label>
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            inputMode="text"
            pattern="[A-Za-z\s'.\-]+"
            title="Letters only (and spaces, apostrophes, hyphens, periods)"
            onInput={(e) => {
              const el = e.currentTarget;
              const cleaned = el.value.replace(/[^A-Za-z\s'.\-]/g, "");
              if (cleaned !== el.value) el.value = cleaned;
            }}
            className="input mt-2"
            placeholder="Your name"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500">
              Phone (WhatsApp)
            </label>
            <input
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              pattern="[\d\s+\-()]+"
              title="Numbers only (and spaces, +, -, parentheses)"
              onInput={(e) => {
                const el = e.currentTarget;
                const cleaned = el.value.replace(/[^\d\s+\-()]/g, "");
                if (cleaned !== el.value) el.value = cleaned;
              }}
              className="input mt-2"
              placeholder="+92 ..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500">
              Phone 2
            </label>
            <input
              name="secondary_phone"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              pattern="[\d\s+\-()]+"
              title="Numbers only (and spaces, +, -, parentheses)"
              onInput={(e) => {
                const el = e.currentTarget;
                const cleaned = el.value.replace(/[^\d\s+\-()]/g, "");
                if (cleaned !== el.value) el.value = cleaned;
              }}
              className="input mt-2"
              placeholder="+92 ..."
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500">
            Email (optional)
          </label>
          <input type="email" name="email" className="input mt-2" />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500">
            Delivery address
          </label>
          <textarea
            name="delivery_address"
            required
            rows={3}
            className="input mt-2 resize-none"
            placeholder="House / street / sector / block · landmark"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500">
            Notes (sweetness, milk choice, surprise gift?)
          </label>
          <textarea
            name="notes"
            rows={3}
            className="input mt-2 resize-none"
          />
        </div>

        <div className="rounded-2xl bg-cream-100/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500">
            Order summary
          </p>
          {items.length === 0 ? (
            <p className="mt-3 text-sm text-espresso-500">
              Your cart is empty. Pick a drink from the list →
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-espresso-700">
              {items.map((l) => (
                <li
                  key={l.slug}
                  className="flex items-start justify-between gap-3"
                >
                  <span className="flex min-w-0 items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setQty(l.slug, 0)}
                      className="mt-1 shrink-0 text-espresso-300 transition-all duration-200 hover:scale-110 hover:rotate-12 hover:text-red-500 active:scale-90"
                      aria-label={`Remove ${l.item.name} from cart`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalItem(l.item)}
                      className="min-w-0 break-words text-left underline-offset-2 transition-colors hover:text-caramel-700 hover:underline"
                      title={`View ${l.item.name} details`}
                    >
                      {l.qty} × {l.item.name}
                    </button>
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {formatPkr(l.qty * l.item.price)}
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between border-t border-espresso-100 pt-2 text-espresso-700">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPkr(subtotal)}</span>
              </li>
              {coupon && discount > 0 && (
                <li className="flex items-center justify-between text-green-700">
                  <span className="font-mono tracking-wider">
                    {coupon.code}
                  </span>
                  <span className="tabular-nums">
                    − {formatPkr(discount)}
                  </span>
                </li>
              )}
              <li className="flex items-center justify-between border-t border-espresso-100 pt-2 font-semibold text-espresso-800">
                <span>Total</span>
                <span className="tabular-nums">{formatPkr(payable)}</span>
              </li>
            </ul>
          )}

          {items.length > 0 && (
            <div className="mt-4">
              <CouponInput
                subtotal_pkr={subtotal}
                applied={coupon}
                onChange={setCoupon}
              />
            </div>
          )}

          <p className="mt-3 text-xs text-espresso-400">
            Minimum order {formatPkr(site.service.minOrder)} · Delivery fee
            calculated after confirmation.
          </p>
        </div>

        {/* Payment method */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500">
            Payment method
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  value: "cod" as const,
                  icon: Banknote,
                  title: "Cash on delivery",
                  body: "Pay Komal in cash when your order arrives.",
                },
                {
                  value: "card" as const,
                  icon: CreditCard,
                  title: "Debit / Credit card",
                  body: "Pay securely via Safepay. Visa, Mastercard accepted.",
                },
              ]
            ).map((opt) => {
              const selected = paymentMethod === opt.value;
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "group relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all duration-200",
                    selected
                      ? "border-caramel-500 bg-caramel-500/10 ring-2 ring-caramel-500/40"
                      : "border-espresso-100 bg-white hover:-translate-y-0.5 hover:border-espresso-300 hover:shadow-sm",
                  )}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={opt.value}
                    checked={selected}
                    onChange={() => setPaymentMethod(opt.value)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                      selected
                        ? "bg-caramel-500 text-cream-50"
                        : "bg-cream-100 text-espresso-600 group-hover:bg-cream-200",
                    )}
                  >
                    <opt.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-display text-sm sm:text-base",
                          selected
                            ? "text-caramel-700"
                            : "text-espresso-800",
                        )}
                      >
                        {opt.title}
                      </span>
                      {selected && (
                        <Check className="h-4 w-4 text-caramel-600" />
                      )}
                    </span>
                    <span className="mt-1 block text-xs text-espresso-500">
                      {opt.body}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          {paymentMethod === "card" && (
            <div className="rounded-xl bg-cream-100/60 px-4 py-3 text-xs text-espresso-600">
              <p className="flex items-center gap-2 font-semibold text-espresso-700">
                <Lock className="h-3.5 w-3.5 text-caramel-600" />
                Secure checkout by Safepay
              </p>
              <p className="mt-1 text-espresso-500">
                You will be redirected to Safepay&apos;s hosted checkout to
                enter your card details. We never see or store your card
                information.
              </p>
            </div>
          )}
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all duration-200 ease-out will-change-transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none",
            paymentMethod === "card"
              ? "bg-caramel-600 text-cream-50 hover:bg-caramel-700"
              : "bg-espresso-700 text-cream-50 hover:bg-espresso-800",
          )}
          disabled={state === "loading" || state === "redirecting"}
        >
          {state === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {paymentMethod === "card"
                ? "Starting payment…"
                : "Sending order…"}
            </>
          ) : state === "redirecting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to Safepay…
            </>
          ) : paymentMethod === "card" ? (
            <>
              <CreditCard className="h-4 w-4" />
              Pay {formatPkr(payable)} with card
            </>
          ) : (
            <>Place order · {formatPkr(payable)}</>
          )}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-espresso-400">
          <Lock className="h-3 w-3" />
          {paymentMethod === "card"
            ? "Encrypted payment processed by Safepay"
            : "Your details stay private. Komal will WhatsApp to confirm."}
        </p>
      </form>
    </div>

      <ProductDetailModal
        item={modalItem}
        onClose={() => setModalItem(null)}
      />
    </>
  );
}
