import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/data/site";
import { reviewSummary } from "@/lib/data/reviews";

export default function Story() {
  return (
    <section className="section">
      <div className="container-base grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="group relative h-[300px] overflow-hidden rounded-3xl ring-1 ring-espresso-100 transition-shadow duration-500 hover:shadow-2xl hover:ring-espresso-200 sm:h-[420px] lg:h-[560px]">
          <Image
            src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1400&q=80"
            alt="Komal hand-pouring milk into espresso"
            fill
            className="img-zoom object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute bottom-4 left-4 flex flex-col rounded-2xl bg-cream-50/95 p-4 shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl sm:bottom-6 sm:left-6 sm:p-5">
            <span className="font-script text-2xl text-caramel-600 sm:text-3xl">
              by Komal
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-espresso-400 sm:text-xs">
              Every single cup.
            </span>
          </div>
        </div>

        <div>
          <p className="eyebrow">Our story</p>
          <h2 className="mt-3 font-display text-3xl text-espresso-800 sm:mt-4 sm:text-4xl lg:text-5xl">
            One kitchen. One barista.{" "}
            <em className="text-caramel-600">One cup at a time.</em>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-espresso-600 sm:mt-6 sm:text-lg">
            {site.longDescription}
          </p>

          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-espresso-100 pt-6 sm:mt-10 sm:gap-6 sm:pt-8">
            <div className="group cursor-default rounded-xl p-2 transition-all duration-300 hover:-translate-y-1">
              <dt className="text-[10px] uppercase tracking-[0.18em] text-espresso-400 transition-colors group-hover:text-caramel-600 sm:text-xs sm:tracking-[0.2em]">
                Google
              </dt>
              <dd className="mt-1 font-display text-xl text-espresso-800 transition-colors group-hover:text-caramel-700 sm:text-3xl">
                {site.stats.googleRating}★
              </dd>
            </div>
            <div className="group cursor-default rounded-xl p-2 transition-all duration-300 hover:-translate-y-1">
              <dt className="text-[10px] uppercase tracking-[0.18em] text-espresso-400 transition-colors group-hover:text-caramel-600 sm:text-xs sm:tracking-[0.2em]">
                Guest reviews
              </dt>
              <dd className="mt-1 font-display text-xl text-espresso-800 transition-colors group-hover:text-caramel-700 sm:text-3xl">
                {reviewSummary.totalCount}+
              </dd>
            </div>
            <div className="group cursor-default rounded-xl p-2 transition-all duration-300 hover:-translate-y-1">
              <dt className="text-[10px] uppercase tracking-[0.18em] text-espresso-400 transition-colors group-hover:text-caramel-600 sm:text-xs sm:tracking-[0.2em]">
                Instagram fam
              </dt>
              <dd className="mt-1 font-display text-xl text-espresso-800 transition-colors group-hover:text-caramel-700 sm:text-3xl">
                {site.stats.instagramFollowers}
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3 sm:mt-10 sm:gap-4">
            <Link href="/about" className="btn-primary w-full sm:w-auto">
              Meet Komal
            </Link>
            <Link href="/menu" className="btn-ghost w-full sm:w-auto">
              Browse the menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
