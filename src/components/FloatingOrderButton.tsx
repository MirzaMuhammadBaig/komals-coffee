"use client";

import Link from "next/link";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { site } from "@/lib/data/site";
import { whatsappLink, cn } from "@/lib/utils";
import { useCart } from "@/lib/cart/CartContext";

export default function FloatingOrderButton() {
  const { totalQty, hydrated, openDrawer, isDrawerOpen } = useCart();
  const hasItems = hydrated && totalQty > 0;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 transition-opacity duration-200 sm:bottom-8 sm:right-8",
        isDrawerOpen
          ? "pointer-events-none opacity-0"
          : "pointer-events-auto opacity-100",
      )}
    >
      <a
        href={whatsappLink(
          site.contact.whatsapp,
          "Hi Komal! I'd like to place an order.",
        )}
        target="_blank"
        rel="noreferrer noopener"
        className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-5px_rgba(37,211,102,0.5)] transition-all duration-300 hover:scale-110 hover:bg-[#1ebd5b] hover:shadow-[0_15px_40px_-5px_rgba(37,211,102,0.7)] active:scale-95 sm:h-auto sm:w-auto sm:gap-2 sm:px-5 sm:py-3 sm:text-sm sm:font-semibold"
        aria-label="Order on WhatsApp"
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[#25D366] opacity-60"
          style={{
            animation: "pulseRing 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
          }}
          aria-hidden
        />
        <MessageCircle className="relative h-5 w-5 transition-transform duration-300 group-hover:-rotate-12 sm:h-4 sm:w-4" />
        <span className="relative hidden sm:inline">WhatsApp</span>
      </a>

      {hasItems ? (
        <button
          type="button"
          onClick={openDrawer}
          aria-label={`View cart, ${totalQty} ${totalQty === 1 ? "item" : "items"}`}
          className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-espresso-800 text-cream-50 shadow-[0_10px_30px_-5px_rgba(40,24,15,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-espresso-900 hover:shadow-[0_15px_40px_-5px_rgba(40,24,15,0.7)] active:translate-y-0 active:scale-95 sm:h-auto sm:w-auto sm:gap-2.5 sm:px-5 sm:py-3 sm:text-sm sm:font-semibold sm:uppercase sm:tracking-wider"
        >
          <span className="relative inline-flex">
            <ShoppingBag className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-6 sm:h-4 sm:w-4" />
            <span
              key={totalQty}
              className="absolute -right-2 -top-2 inline-flex h-[18px] min-w-[18px] animate-pulse-soft items-center justify-center rounded-full bg-caramel-500 px-1 text-[10px] font-bold tabular-nums leading-none text-espresso-900 ring-2 ring-espresso-800 transition-colors group-hover:ring-espresso-900"
            >
              {totalQty}
            </span>
          </span>
          <span className="hidden sm:inline">View cart</span>
        </button>
      ) : (
        <Link
          href="/order"
          className="group hidden items-center gap-2 rounded-full bg-espresso-700 px-5 py-3 text-sm font-semibold text-cream-50 shadow-[0_10px_30px_-5px_rgba(40,24,15,0.5)] transition-all duration-300 hover:scale-105 hover:bg-espresso-800 hover:shadow-[0_15px_40px_-5px_rgba(40,24,15,0.7)] active:scale-95 sm:flex"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
            Order online
          </span>
          <span className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
            →
          </span>
        </Link>
      )}
    </div>
  );
}
