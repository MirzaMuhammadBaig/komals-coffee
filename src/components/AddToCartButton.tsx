"use client";

import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { cn } from "@/lib/utils";

type Variant = "compact" | "large";

type Props = {
  slug: string;
  name?: string;
  variant?: Variant;
  /**
   * When the button sits inside a Link (or another clickable parent),
   * keep this true so clicks do not bubble up and trigger navigation.
   */
  preventLink?: boolean;
};

export default function AddToCartButton({
  slug,
  name,
  variant = "compact",
  preventLink = true,
}: Props) {
  const { getQty, add, remove, hydrated } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const qty = getQty(slug);

  function stop(e: React.MouseEvent) {
    if (!preventLink) return;
    e.preventDefault();
    e.stopPropagation();
  }

  function handleAdd(e: React.MouseEvent) {
    stop(e);
    add(slug);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 900);
  }

  function handleRemove(e: React.MouseEvent) {
    stop(e);
    remove(slug);
  }

  // Avoid hydration mismatch — render a stable placeholder until cart
  // has loaded from localStorage on the client.
  if (!hydrated) {
    if (variant === "large") {
      return (
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center gap-2 rounded-full bg-espresso-700/30 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cream-50"
        >
          <ShoppingBag className="h-4 w-4" /> Add to cart
        </button>
      );
    }
    return (
      <span className="inline-flex h-8 w-20 rounded-full bg-cream-100" />
    );
  }

  if (qty === 0) {
    if (variant === "large") {
      return (
        <button
          type="button"
          onClick={handleAdd}
          aria-label={name ? `Add ${name} to cart` : "Add to cart"}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-200 ease-out will-change-transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.97]",
            justAdded
              ? "bg-caramel-600 text-cream-50"
              : "bg-espresso-700 text-cream-50 hover:bg-espresso-800 hover:shadow-espresso-700/30",
          )}
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" /> Added
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </>
          )}
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={handleAdd}
        aria-label={name ? `Add ${name} to cart` : "Add to cart"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ease-out will-change-transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95",
          justAdded
            ? "bg-caramel-600 text-cream-50"
            : "bg-espresso-700 text-cream-50 hover:bg-caramel-600",
        )}
      >
        {justAdded ? (
          <>
            <Check className="h-3 w-3" /> Added
          </>
        ) : (
          <>
            <Plus className="h-3 w-3" /> Add
          </>
        )}
      </button>
    );
  }

  const wrapperSize = variant === "large" ? "p-1.5 gap-2" : "p-1 gap-1.5";
  const btnSize = variant === "large" ? "h-9 w-9" : "h-7 w-7";
  const qtyText = variant === "large" ? "text-base" : "text-xs";

  return (
    <div
      onClick={stop}
      className={cn(
        "inline-flex items-center rounded-full bg-caramel-500/15 ring-1 ring-caramel-500/40",
        wrapperSize,
      )}
    >
      <button
        type="button"
        onClick={handleRemove}
        aria-label={name ? `Decrease ${name}` : "Decrease quantity"}
        className={cn(
          "flex items-center justify-center rounded-full bg-white text-espresso-700 transition-all duration-150 hover:bg-cream-100 active:scale-90",
          btnSize,
        )}
      >
        <Minus className="h-3 w-3" />
      </button>
      <span
        className={cn(
          "min-w-[1.25rem] text-center font-semibold tabular-nums text-caramel-700",
          qtyText,
        )}
      >
        {qty}
      </span>
      <button
        type="button"
        onClick={handleAdd}
        aria-label={name ? `Add another ${name}` : "Increase quantity"}
        className={cn(
          "flex items-center justify-center rounded-full bg-espresso-700 text-cream-50 transition-all duration-150 hover:bg-caramel-600 hover:shadow-md active:scale-95",
          btnSize,
        )}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
