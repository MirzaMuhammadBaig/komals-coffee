import Link from "next/link";
import { bestsellers } from "@/lib/data/menu";
import { formatPkr } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import SafeImage from "@/components/SafeImage";

export default function FeaturedItems() {
  return (
    <section className="section bg-cream-100/40">
      <div className="container-base">
        <div className="flex flex-col items-start justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="eyebrow">Most ordered</p>
            <h2 className="mt-3 font-display text-3xl text-espresso-800 sm:mt-4 sm:text-4xl lg:text-5xl">
              The cups Komal&apos;s regulars{" "}
              <em className="text-caramel-600">can&apos;t stop</em> reordering.
            </h2>
            <p className="mt-3 text-sm text-espresso-600 sm:mt-4 sm:text-base">
              Based on foodpanda reorders and DM bookings across the last 6
              months. These are the ones we built our reputation on.
            </p>
          </div>
          <Link
            href="/menu"
            className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-700 transition-colors hover:text-caramel-600 sm:text-sm"
          >
            Full menu
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5 group-active:translate-x-0" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {bestsellers.slice(0, 6).map((item) => (
            <Link
              key={item.slug}
              href={`/menu/${item.slug}`}
              aria-label={`View ${item.name} details`}
              className="card-hoverable group block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100 active:scale-[0.99]"
            >
              <div className="relative h-44 w-full overflow-hidden bg-espresso-100 sm:h-52 lg:h-56">
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
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="font-display text-xl text-espresso-800 transition-colors duration-300 group-hover:text-caramel-700 sm:text-2xl">
                    {item.name}
                  </h3>
                  <span className="font-semibold text-espresso-700 transition-colors duration-300 group-hover:text-caramel-600">
                    {formatPkr(item.price)}
                  </span>
                </div>
                {item.size && (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-espresso-400 sm:text-[11px]">
                    {item.size}
                  </p>
                )}
                <p className="mt-3 text-sm text-espresso-500">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
