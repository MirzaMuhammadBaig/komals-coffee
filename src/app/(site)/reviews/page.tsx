import type { Metadata } from "next";
import { Star, Quote } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CtaBanner from "@/components/CtaBanner";
import { reviews } from "@/lib/data/reviews";
import { site } from "@/lib/data/site";
import { formatDate } from "@/lib/utils";

const sourceLabel: Record<string, string> = {
  google: "Google",
  foodpanda: "Verified order",
  instagram: "Instagram",
  facebook: "Facebook",
  tripadvisor: "Tripadvisor",
};

export const metadata: Metadata = {
  title: "Reviews",
  description: `${site.stats.foodpandaRating}★ from ${site.stats.foodpandaReviewCount}+ verified guest reviews. See what Komal's Coffee customers really say.`,
};

export default function ReviewsPage() {
  const byFood = reviews.filter((r) => r.source === "foodpanda").length;
  const byIg = reviews.filter((r) => r.source === "instagram").length;
  const byFb = reviews.filter((r) => r.source === "facebook").length;

  return (
    <>
      <PageHeader
        eyebrow="What guests say"
        title={`${site.stats.foodpandaRating}★ from ${site.stats.foodpandaReviewCount}+ guests.`}
        description="A live feed of what our customers say, pulled from verified orders, Instagram and Facebook. No edits, no filters. What you read is what gets posted publicly."
      />

      <section className="border-b border-espresso-100 bg-cream-50">
        <div className="container-base grid gap-6 py-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-4xl text-espresso-800">
              {site.stats.foodpandaRating}★
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-espresso-400">
              Verified guest average · {site.stats.foodpandaReviewCount}+ orders
            </p>
          </div>
          <div>
            <p className="font-display text-4xl text-espresso-800">100%</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-espresso-400">
              5-star ratings from verified guests
            </p>
          </div>
          <div>
            <p className="font-display text-4xl text-espresso-800">
              {byFood + byIg + byFb}+
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-espresso-400">
              Verified reviews across platforms
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-base">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <figure
                key={i}
                className="card-hoverable group relative flex h-full flex-col gap-4 overflow-hidden p-6 active:scale-[0.99] sm:p-7"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-caramel-400/0 blur-3xl transition-all duration-500 group-hover:bg-caramel-400/25" />
                <Quote className="absolute right-6 top-6 h-8 w-8 text-espresso-100 transition-all duration-500 group-hover:scale-110 group-hover:text-caramel-400/60" />
                <div className="relative flex items-center gap-1">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-caramel-500 text-caramel-500 transition-transform duration-300 group-hover:scale-110"
                      style={{ transitionDelay: `${j * 30}ms` }}
                    />
                  ))}
                </div>
                <blockquote className="relative text-espresso-700">
                  &ldquo;{r.body}&rdquo;
                </blockquote>
                <figcaption className="relative mt-auto flex items-center justify-between border-t border-espresso-100 pt-4 text-xs text-espresso-500">
                  <span className="font-semibold text-espresso-700 transition-colors group-hover:text-caramel-700">
                    {r.author}
                  </span>
                  <span>
                    {sourceLabel[r.source]} · {formatDate(r.date)}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-12 rounded-3xl bg-cream-100/60 p-6 text-center sm:mt-16 sm:p-8 lg:p-12">
            <p className="eyebrow">Help us grow</p>
            <h2 className="mt-3 font-display text-3xl text-espresso-800 sm:text-4xl">
              Ordered before? Leave us a quick review.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-espresso-600">
              Every honest review helps Komal&apos;s reach more coffee lovers in
              Lahore. Takes 30 seconds, and we read every one.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={site.social.foodpanda}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-primary"
              >
                Leave a review
              </a>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-ghost"
              >
                Tag us on Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
