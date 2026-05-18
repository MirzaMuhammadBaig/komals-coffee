import Link from "next/link";
import { site } from "@/lib/data/site";
import { whatsappLink } from "@/lib/utils";

export default function CtaBanner() {
  return (
    <section className="section">
      <div className="container-base">
        <div className="group relative overflow-hidden rounded-[2rem] bg-espresso-700 px-6 py-12 text-cream-50 transition-shadow duration-500 hover:shadow-[0_40px_100px_-40px_rgba(40,24,15,0.6)] sm:rounded-[2.5rem] sm:px-12 sm:py-16 lg:px-16 lg:py-24">
          <div className="absolute -right-20 -top-20 h-72 w-72 animate-blob rounded-full bg-caramel-500/25 blur-3xl" />
          <div
            className="absolute -bottom-24 -left-16 h-72 w-72 animate-blob rounded-full bg-blush-400/20 blur-3xl"
            style={{ animationDelay: "4s" }}
          />

          <div className="relative grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="eyebrow text-caramel-400">Place an order</p>
              <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
                Your next favourite latte is{" "}
                <em className="text-caramel-300">one tap away.</em>
              </h2>
              <p className="mt-5 max-w-xl text-cream-100/80">
                Order through the website, WhatsApp or foodpanda. Komal
                confirms within minutes. Sealed, insulated and delivered warm.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/order" className="btn-gold">
                Order from us
              </Link>
              <a
                href={whatsappLink(
                  site.contact.whatsapp,
                  "Hi Komal! I'd like to place an order.",
                )}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-whatsapp"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
