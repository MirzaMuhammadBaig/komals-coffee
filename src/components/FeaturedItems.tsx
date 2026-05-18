import Link from "next/link";
import { bestsellers } from "@/lib/data/menu";
import { formatPkr } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import SafeImage from "@/components/SafeImage";

export default function FeaturedItems() {
  return (
    <section className="section bg-cream-100/40">
      <div className="container-base">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="eyebrow">Most ordered</p>
            <h2 className="mt-4 font-display text-4xl text-espresso-800 sm:text-5xl">
              The cups Komal&apos;s regulars{" "}
              <em className="text-caramel-600">can&apos;t stop</em> reordering.
            </h2>
            <p className="mt-4 text-espresso-600">
              Based on foodpanda reorders and DM bookings across the last 6
              months. These are the ones we built our reputation on.
            </p>
          </div>
          <Link
            href="/menu"
            className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-espresso-700 transition-colors hover:text-caramel-600"
          >
            Full menu
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5 group-active:translate-x-0" />
          </Link>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bestsellers.slice(0, 6).map((item) => (
            <article
              key={item.slug}
              className="card-hoverable group overflow-hidden active:scale-[0.99]"
            >
              <div className="relative h-56 w-full overflow-hidden bg-espresso-100">
                <SafeImage
                  src={item.image}
                  alt={item.name}
                  fill
                  className="img-zoom object-cover"
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {item.signature && (
                  <span className="badge absolute left-4 top-4 bg-caramel-500 text-espresso-900 shadow-md transition-transform duration-300 group-hover:scale-105">
                    Signature
                  </span>
                )}
                {!item.signature && item.bestseller && (
                  <span className="badge absolute left-4 top-4 bg-espresso-700 text-cream-50 shadow-md transition-transform duration-300 group-hover:scale-105">
                    Bestseller
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl text-espresso-800 transition-colors duration-300 group-hover:text-caramel-700">
                    {item.name}
                  </h3>
                  <span className="font-semibold text-espresso-700 transition-colors duration-300 group-hover:text-caramel-600">
                    {formatPkr(item.price)}
                  </span>
                </div>
                {item.size && (
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-espresso-400">
                    {item.size}
                  </p>
                )}
                <p className="mt-3 text-sm text-espresso-500">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
