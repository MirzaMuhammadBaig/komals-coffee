"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { cn, formatPkr } from "@/lib/utils";
import { site } from "@/lib/data/site";
import SafeImage from "@/components/SafeImage";

export default function CartDrawer() {
  const {
    items,
    total,
    totalQty,
    add,
    remove,
    setQty,
    isDrawerOpen,
    closeDrawer,
  } = useCart();

  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  // Body scroll lock + Esc to close + focus management.
  useEffect(() => {
    if (!isDrawerOpen) return;

    lastFocusRef.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the close button on open.
    const focusTimer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
      }
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      // Restore focus to whatever opened the drawer.
      lastFocusRef.current?.focus?.();
    };
  }, [isDrawerOpen, closeDrawer]);

  const meetsMin = total >= site.service.minOrder;
  const shortBy = Math.max(0, site.service.minOrder - total);

  return (
    <div
      aria-hidden={!isDrawerOpen}
      className={cn(
        "fixed inset-0 z-[60]",
        isDrawerOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {/* Backdrop — fades a touch slower than the panel for a layered feel */}
      <button
        type="button"
        onClick={closeDrawer}
        aria-label="Close cart"
        tabIndex={isDrawerOpen ? 0 : -1}
        className={cn(
          "absolute inset-0 cursor-default bg-espresso-900/55 backdrop-blur-sm transition-opacity duration-[450ms] ease-out",
          isDrawerOpen ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel — glides in on a soft spring easing */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream-50 shadow-2xl",
          "transition-[transform,opacity] duration-[440ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform",
          isDrawerOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-80",
        )}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-espresso-100 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-caramel-500/15 text-caramel-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-lg text-espresso-800">
                Your cart
              </h2>
              <p className="text-[11px] uppercase tracking-[0.2em] text-espresso-400">
                {totalQty} {totalQty === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-espresso-500 transition-all duration-150 hover:bg-cream-100 hover:text-espresso-700 active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-100 text-espresso-400">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <p className="mt-5 font-display text-xl text-espresso-800">
              Your cart is empty.
            </p>
            <p className="mt-2 max-w-xs text-sm text-espresso-500">
              Add a drink from the menu or the order page and it will appear
              here.
            </p>
            <Link
              href="/menu"
              onClick={closeDrawer}
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-espresso-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 hover:shadow-md active:translate-y-0 active:scale-95"
            >
              Browse menu <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <ul
            key={isDrawerOpen ? "cart-open" : "cart-closed"}
            className="flex-1 divide-y divide-espresso-100 overflow-y-auto"
          >
            {items.map((line, i) => (
              <li
                key={line.slug}
                className={cn(
                  "flex gap-3 px-5 py-4 sm:gap-4 sm:px-6",
                  isDrawerOpen && "cart-line-in",
                )}
                style={
                  isDrawerOpen
                    ? { animationDelay: `${80 + i * 65}ms` }
                    : undefined
                }
              >
                <Link
                  href={`/menu/${line.slug}`}
                  onClick={closeDrawer}
                  className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-100"
                >
                  <SafeImage
                    src={line.item.image}
                    alt={line.item.name}
                    fill
                    sizes="64px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/menu/${line.slug}`}
                      onClick={closeDrawer}
                      className="font-display text-sm text-espresso-800 transition-colors hover:text-caramel-700"
                    >
                      {line.item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setQty(line.slug, 0)}
                      aria-label={`Remove ${line.item.name} from cart`}
                      className="shrink-0 text-espresso-300 transition-all duration-150 hover:scale-110 hover:rotate-12 hover:text-red-500 active:scale-90"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-espresso-400">
                    {line.item.size ? `${line.item.size} · ` : ""}
                    {formatPkr(line.item.price)}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-caramel-500/15 p-1 ring-1 ring-caramel-500/30">
                      <button
                        type="button"
                        onClick={() => remove(line.slug)}
                        aria-label={`Decrease ${line.item.name}`}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-espresso-700 transition-all duration-150 hover:bg-cream-100 active:scale-90"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[1.25rem] text-center text-xs font-semibold tabular-nums text-caramel-700">
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => add(line.slug)}
                        aria-label={`Add another ${line.item.name}`}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-espresso-700 text-cream-50 transition-all duration-150 hover:bg-caramel-600 active:scale-95"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-espresso-800">
                      {formatPkr(line.qty * line.item.price)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <footer className="border-t border-espresso-100 bg-white px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-espresso-500">Subtotal</span>
              <span className="font-display text-xl text-espresso-800 tabular-nums">
                {formatPkr(total)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-espresso-400">
              Delivery fee calculated after Komal confirms your order.
            </p>

            {!meetsMin && (
              <p className="mt-3 rounded-lg bg-caramel-500/10 px-3 py-2 text-xs text-caramel-700">
                Add {formatPkr(shortBy)} more to reach the minimum order of{" "}
                {formatPkr(site.service.minOrder)}.
              </p>
            )}

            <Link
              href="/order#checkout-details"
              onClick={closeDrawer}
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-200 ease-out will-change-transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.97]",
                meetsMin
                  ? "bg-espresso-700 text-cream-50 hover:bg-espresso-800"
                  : "bg-espresso-700/80 text-cream-50 hover:bg-espresso-700",
              )}
            >
              Go to checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={closeDrawer}
              className="mt-2 w-full rounded-full py-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500 transition-colors hover:text-espresso-800"
            >
              Continue browsing
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
