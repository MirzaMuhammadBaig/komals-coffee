import Link from "next/link";
import { site } from "@/lib/data/site";
import { whatsappLink } from "@/lib/utils";

export default function CtaBanner() {
  return (
    <section className="section">
      <div className="container-base">
        <div className="group relative overflow-hidden rounded-[1.75rem] bg-espresso-700 px-5 py-10 text-cream-50 transition-shadow duration-500 hover:shadow-[0_40px_100px_-40px_rgba(40,24,15,0.6)] sm:rounded-[2.5rem] sm:px-12 sm:py-16 lg:px-16 lg:py-24">
          <div className="absolute -right-20 -top-20 h-72 w-72 animate-blob rounded-full bg-caramel-500/25 blur-3xl" />
          <div
            className="absolute -bottom-24 -left-16 h-72 w-72 animate-blob rounded-full bg-blush-400/20 blur-3xl"
            style={{ animationDelay: "4s" }}
          />

          <div className="relative grid items-end gap-8 sm:gap-10 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="eyebrow text-caramel-400">Place an order</p>
              <h2 className="mt-3 font-display text-2xl leading-tight sm:mt-4 sm:text-4xl lg:text-5xl">
                Your next favourite latte is{" "}
                <em className="text-caramel-300">one tap away.</em>
              </h2>
              <p className="mt-4 max-w-xl text-sm text-cream-100/80 sm:mt-5 sm:text-base">
                Order through the website, WhatsApp or foodpanda. Komal
                confirms within minutes. Sealed, insulated and delivered warm.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
              <Link href="/order" className="btn-gold w-full sm:w-auto">
                Order from us
              </Link>
              <a
                href={whatsappLink(
                  site.contact.whatsapp,
                  "Hi Komal! I'd like to place an order.",
                )}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-whatsapp w-full sm:w-auto"
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
