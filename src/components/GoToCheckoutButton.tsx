"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";

/**
 * "Go to checkout" for the product detail page. Unlike a plain link, this
 * guarantees the product is in the cart before navigating — so the item is
 * always visible on the order page, even if the user never clicked "Add".
 */
export default function GoToCheckoutButton({ slug }: { slug: string }) {
  const router = useRouter();
  const { getQty, add } = useCart();

  function onClick() {
    if (getQty(slug) === 0) add(slug);
    router.push("/order#checkout-details");
  }

  return (
    <button type="button" onClick={onClick} className="btn-ghost">
      Go to checkout
      <ArrowRight className="ml-2 h-4 w-4" />
    </button>
  );
}
