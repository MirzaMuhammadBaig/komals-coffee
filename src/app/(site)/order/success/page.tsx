"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Check, MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { site } from "@/lib/data/site";
import { whatsappLink } from "@/lib/utils";

export default function OrderSuccessPage() {
  const { clear } = useCart();

  // Clear the cart once the user has returned from Safepay successfully.
  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <section className="bg-cream-100/40 py-20 sm:py-28">
      <div className="container-base">
        <div className="card mx-auto max-w-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-caramel-500 via-caramel-600 to-caramel-700 px-8 py-10 text-center text-cream-50 sm:px-12 sm:py-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream-50/15 ring-2 ring-cream-50/30">
              <Check className="h-8 w-8" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-cream-100/80">
              Payment successful
            </p>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl">
              Thank you for ordering!
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm text-cream-100/90">
              Your payment has been received. Komal will WhatsApp you within
              minutes to confirm timing and start preparing your drinks.
            </p>
          </div>

          <div className="space-y-5 px-8 py-8 sm:px-12 sm:py-10">
            <ol className="space-y-4 text-sm text-espresso-700">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-caramel-500/15 text-xs font-bold text-caramel-700">
                  1
                </span>
                <p>
                  <span className="font-semibold text-espresso-800">
                    Confirmation on WhatsApp
                  </span>{" "}
                  within a few minutes.
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
                    Delivery in 30 to 45 minutes
                  </span>
                  , sealed and insulated, straight to your door.
                </p>
              </li>
            </ol>

            <div className="flex flex-wrap gap-3 pt-3">
              <a
                href={whatsappLink(
                  site.contact.whatsapp,
                  "Hi Komal! I just paid for an order.",
                )}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-whatsapp"
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Message Komal
              </a>
              <Link href="/menu" className="btn-ghost">
                <ShoppingBag className="mr-2 h-4 w-4" /> Browse menu again
              </Link>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-md text-center text-xs text-espresso-400">
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
