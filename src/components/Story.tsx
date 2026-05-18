import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/data/site";

export default function Story() {
  return (
    <section className="section">
      <div className="container-base grid items-center gap-16 lg:grid-cols-2">
        <div className="group relative h-[380px] overflow-hidden rounded-3xl ring-1 ring-espresso-100 transition-shadow duration-500 hover:shadow-2xl hover:ring-espresso-200 sm:h-[480px] lg:h-[560px]">
          <Image
            src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1400&q=80"
            alt="Komal hand-pouring milk into espresso"
            fill
            className="img-zoom object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute bottom-6 left-6 flex flex-col rounded-2xl bg-cream-50/95 p-5 shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl">
            <span className="font-script text-3xl text-caramel-600">
              by Komal
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-espresso-400">
              Every single cup.
            </span>
          </div>
        </div>

        <div>
          <p className="eyebrow">Our story</p>
          <h2 className="mt-4 font-display text-4xl text-espresso-800 sm:text-5xl">
            One kitchen. One barista.{" "}
            <em className="text-caramel-600">One cup at a time.</em>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-espresso-600">
            {site.longDescription}
          </p>

          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-espresso-100 pt-8">
            <div className="group cursor-default rounded-xl p-2 transition-all duration-300 hover:-translate-y-1">
              <dt className="text-xs uppercase tracking-[0.2em] text-espresso-400 transition-colors group-hover:text-caramel-600">
                foodpanda
              </dt>
              <dd className="mt-1 font-display text-3xl text-espresso-800 transition-colors group-hover:text-caramel-700">
                {site.stats.foodpandaRating}★
              </dd>
            </div>
            <div className="group cursor-default rounded-xl p-2 transition-all duration-300 hover:-translate-y-1">
              <dt className="text-xs uppercase tracking-[0.2em] text-espresso-400 transition-colors group-hover:text-caramel-600">
                Guest reviews
              </dt>
              <dd className="mt-1 font-display text-3xl text-espresso-800 transition-colors group-hover:text-caramel-700">
                {site.stats.foodpandaReviewCount}
              </dd>
            </div>
            <div className="group cursor-default rounded-xl p-2 transition-all duration-300 hover:-translate-y-1">
              <dt className="text-xs uppercase tracking-[0.2em] text-espresso-400 transition-colors group-hover:text-caramel-600">
                Instagram fam
              </dt>
              <dd className="mt-1 font-display text-3xl text-espresso-800 transition-colors group-hover:text-caramel-700">
                {site.stats.instagramFollowers}
              </dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/about" className="btn-primary">
              Meet Komal
            </Link>
            <Link href="/menu" className="btn-ghost">
              Browse the menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
