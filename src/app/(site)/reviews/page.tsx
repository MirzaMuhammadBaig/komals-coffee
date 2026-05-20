import type { Metadata } from "next";
import { Star, Quote, ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CtaBanner from "@/components/CtaBanner";
import {
  reviews,
  reviewPlatforms,
  reviewSummary,
} from "@/lib/data/reviews";
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
  description: `${reviewSummary.averageRating}★ from ${reviewSummary.totalCount}+ reviews across Google and foodpanda. See what Komal's Coffee customers really say.`,
};

export default function ReviewsPage() {
  return (
    <>
      <PageHeader
        eyebrow="What guests say"
        title={`${reviewSummary.averageRating}★ from ${reviewSummary.totalCount}+ reviews.`}
        description="Komal's Coffee is rated across Google and foodpanda, plus Instagram and Facebook. No edits, no filters. What you read is what guests posted publicly."
      />

      {/* Platform breakdown — aggregate + per-platform trust cards */}
      <section className="border-b border-espresso-100 bg-cream-50 py-10 sm:py-12">
        <div className="container-base">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Aggregate card */}
            <div className="card flex flex-col justify-center bg-espresso-700 p-6 text-cream-50">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-caramel-400 text-caramel-400"
                  />
                ))}
              </div>
              <p className="mt-3 font-display text-4xl">
                {reviewSummary.averageRating}★
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cream-100/70">
                Average across {reviewSummary.totalCount}+ reviews
              </p>
            </div>

            {/* Per-platform cards */}
            {reviewPlatforms.map((p) => (
              <a
                key={p.key}
                href={p.url}
                target="_blank"
                rel="noreferrer noopener"
                className="card-hoverable group flex flex-col p-6 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-400">
                    {p.name}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-espresso-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="mt-3 font-display text-4xl text-espresso-800 transition-colors group-hover:text-caramel-700">
                  {p.rating}★
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-espresso-400">
                  {p.count} {p.name} reviews
                </p>
              </a>
            ))}

            {/* Five-star card */}
            <div className="card flex flex-col justify-center p-6">
              <p className="font-display text-4xl text-espresso-800">100%</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-espresso-400">
                Of recent reviews are 5-star
              </p>
            </div>
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
              {reviewPlatforms.map((p) => (
                <a
                  key={p.key}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={p.key === "google" ? "btn-primary" : "btn-ghost"}
                >
                  Review on {p.name}
                </a>
              ))}
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
