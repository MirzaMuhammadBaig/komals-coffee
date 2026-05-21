import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { site } from "@/lib/data/site";
import { getStoreSettings } from "@/lib/admin/store";
import { reviewSummary } from "@/lib/data/reviews";
import CoffeeDecorations from "@/components/CoffeeDecorations";
import AnimatedTagline from "@/components/AnimatedTagline";
import AnimatedCounter from "@/components/AnimatedCounter";
import ScrollIndicator from "@/components/ScrollIndicator";
import StoreStatusBadge from "@/components/StoreStatusBadge";
import { computeStoreStatus } from "@/lib/hours";

export default async function Hero() {
  const store = await getStoreSettings();
  // Server seed — the client badge re-checks the clock live after hydration.
  const manualOpen = store?.is_open !== false;
  const initialStatus = computeStoreStatus(manualOpen);

  return (
    <section className="group relative overflow-hidden bg-espresso-800 text-cream-50">
      <div className="absolute inset-0 bg-hero-grain opacity-90" aria-hidden />
      <Image
        src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1800&q=80"
        alt=""
        fill
        priority
        className="animate-kenburns object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-espresso-900/70 via-espresso-800/65 to-espresso-900/90" />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 animate-blob rounded-full bg-caramel-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 animate-blob rounded-full bg-blush-400/15 blur-3xl"
        style={{ animationDelay: "3s" }}
        aria-hidden
      />

      <CoffeeDecorations />

      <div className="container-base relative grid min-h-[88vh] items-center py-20 sm:min-h-[90vh] sm:py-24 lg:min-h-[92vh] lg:py-28">
        <div className="max-w-3xl">
          {/* Live store-status chip — re-checks the clock client-side */}
          <StoreStatusBadge manualOpen={manualOpen} initial={initialStatus} />

          <h1 className="font-display text-4xl leading-[1.05] text-cream-50 sm:text-6xl lg:text-7xl">
            <span className="font-script block pb-1 text-5xl leading-[0.95] text-caramel-400 transition-colors duration-500 hover:text-caramel-300 sm:text-7xl lg:text-8xl">
              Komal&apos;s
            </span>
            hand-crafted
            <br />
            <span className="italic text-caramel-300">
              lattes, at your door.
            </span>
          </h1>

          {/* Rotating "today's craving" line */}
          <div className="mt-5 flex flex-wrap items-baseline gap-x-2 text-sm text-cream-100/70 sm:text-base">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-caramel-400">
              Today&apos;s craving:
            </span>
            <AnimatedTagline
              className="font-display text-sm italic text-cream-50 sm:text-base lg:text-lg"
              words={[
                "Salted Caramel Latte",
                "Hazelnut Praline",
                "Irish Cream",
                "Iced Spanish Latte",
                "House Mocha",
              ]}
            />
          </div>

          <p className="mt-5 max-w-xl text-base text-cream-100/85 sm:mt-6 sm:text-lg lg:text-xl">
            One barista. One kitchen. One promise. Frothy, creamy,
            made-to-order specialty coffee. Rated{" "}
            <span className="font-semibold text-cream-50">
              {site.stats.googleRating}★
            </span>{" "}
            on Google and{" "}
            <span className="font-semibold text-cream-50">
              {site.stats.foodpandaRating}★
            </span>{" "}
            on foodpanda.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
            <Link href="/order" className="btn-gold w-full sm:w-auto">
              Order now
            </Link>
            <Link
              href="/menu"
              className="btn-ghost w-full border-cream-100/40 text-cream-50 hover:bg-cream-50 hover:text-espresso-800 sm:w-auto"
            >
              See the menu
            </Link>
          </div>

          {/* Three stat counters — aggregate across Google + foodpanda */}
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-cream-100/15 pt-6 sm:mt-12 sm:gap-6 sm:pt-8">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-100/60">
                Avg rating
              </dt>
              <dd className="mt-1 flex items-baseline gap-1 font-display text-xl text-cream-50 sm:text-2xl lg:text-3xl">
                <AnimatedCounter
                  to={reviewSummary.averageRating}
                  decimals={1}
                  duration={1400}
                />
                <Star className="h-4 w-4 fill-caramel-400 text-caramel-400" />
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-100/60">
                Reviews
              </dt>
              <dd className="mt-1 font-display text-xl text-cream-50 sm:text-2xl lg:text-3xl">
                <AnimatedCounter
                  to={reviewSummary.totalCount}
                  duration={1600}
                  suffix="+"
                />
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-100/60">
                Delivery
              </dt>
              <dd className="mt-1 font-display text-xl text-cream-50 sm:text-2xl lg:text-3xl">
                <AnimatedCounter
                  to={30}
                  duration={1500}
                  suffix=" min"
                />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <ScrollIndicator />
    </section>
  );
}
