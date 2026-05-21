"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import AddToCartButton from "@/components/AddToCartButton";
import { menuCategories, type MenuItem } from "@/lib/data/menu";
import { formatPkr } from "@/lib/utils";

/**
 * A scrollable product-detail modal. Shows the same information as the
 * /menu/[slug] page. The card is height-capped (max-h-[88vh]); the body
 * scrolls internally so long content never overflows the viewport.
 */
export default function ProductDetailModal({
  item,
  onClose,
}: {
  item: MenuItem | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!item) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 40);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [item, onClose]);

  if (!item) return null;

  const category = menuCategories.find((c) => c.slug === item.category);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4 sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close product details"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-espresso-900/60 backdrop-blur-sm"
      />

      {/* Modal card — capped height, internal scroll */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${item.name} details`}
        className="relative flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-cream-50 shadow-2xl"
      >
        {/* Fixed header */}
        <header className="flex shrink-0 items-center justify-between border-b border-espresso-100 bg-white px-5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
            Product details
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-espresso-500 transition-all duration-150 hover:bg-cream-100 hover:text-espresso-700 active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="relative aspect-[4/3] w-full bg-espresso-100">
            <SafeImage
              src={item.image}
              alt={item.name}
              fill
              sizes="(min-width: 640px) 28rem, 100vw"
              className="object-cover"
              iconOnly
            />
            {item.signature && (
              <span className="badge absolute left-4 top-4 bg-caramel-500 text-espresso-900 shadow-md">
                Signature
              </span>
            )}
            {!item.signature && item.bestseller && (
              <span className="badge absolute left-4 top-4 bg-espresso-700 text-cream-50 shadow-md">
                Bestseller
              </span>
            )}
          </div>

          <div className="p-5 sm:p-6">
            <p className="eyebrow">{category?.name ?? "Drink"}</p>
            <h2 className="mt-2 font-display text-2xl text-espresso-800">
              {item.name}
            </h2>

            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-display text-2xl text-espresso-800">
                {formatPkr(item.price)}
              </span>
              {item.size && (
                <span className="text-xs uppercase tracking-[0.2em] text-espresso-400">
                  {item.size}
                </span>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-espresso-600">
              {item.description}
            </p>

            {item.tags && item.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-cream-100 px-3 py-1 text-[10px] uppercase tracking-wider text-espresso-500"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <dl className="mt-5 space-y-3 border-t border-espresso-100 pt-5 text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-espresso-400">
                  Made-to-order
                </dt>
                <dd className="mt-0.5 text-espresso-700">
                  Pulled, frothed and finished by Komal herself.
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-espresso-400">
                  Delivery
                </dt>
                <dd className="mt-0.5 text-espresso-700">
                  Bahria Orchard + nearby Lahore. 30 to 45 minutes.
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-espresso-400">
                  Customise
                </dt>
                <dd className="mt-0.5 text-espresso-700">
                  Milk, sweetness, extra shot — leave a note at checkout.
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Fixed footer — quantity control + full-page link */}
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-espresso-100 bg-white px-5 py-4">
          <AddToCartButton
            slug={item.slug}
            name={item.name}
            variant="large"
            preventLink={false}
          />
          <Link
            href={`/menu/${item.slug}`}
            onClick={onClose}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500 transition-colors hover:text-caramel-700"
          >
            Full page →
          </Link>
        </footer>
      </div>
    </div>
  );
}
