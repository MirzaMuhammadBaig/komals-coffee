import Link from "next/link";
import { AlertCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { site } from "@/lib/data/site";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Payment cancelled",
};

export default function OrderCancelPage() {
  return (
    <section className="bg-cream-100/40 py-20 sm:py-28">
      <div className="container-base">
        <div className="card mx-auto max-w-2xl overflow-hidden">
          <div className="bg-espresso-700 px-8 py-10 text-center text-cream-50 sm:px-12 sm:py-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream-50/15 ring-2 ring-cream-50/30">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-cream-100/80">
              Payment cancelled
            </p>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl">
              No worries, nothing was charged.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm text-cream-100/85">
              Your card was not charged and your cart is still saved. Pick up
              where you left off whenever you are ready.
            </p>
          </div>

          <div className="space-y-5 px-8 py-8 sm:px-12 sm:py-10">
            <p className="text-sm text-espresso-600">
              If something went wrong with payment, you can try again with a
              different card, switch to{" "}
              <span className="font-semibold text-espresso-800">
                Cash on Delivery
              </span>
              , or message Komal directly and she will sort it out.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/order#checkout-details" className="btn-primary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to checkout
              </Link>
              <a
                href={whatsappLink(
                  site.contact.whatsapp,
                  "Hi Komal! My card payment didn't go through. Can you help?",
                )}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-whatsapp"
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Message Komal
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
