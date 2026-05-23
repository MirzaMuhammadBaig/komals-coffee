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
      <section className="border-b border-espresso-100 bg-cream-50 py-8 sm:py-12">
        <div className="container-base">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {/* Aggregate card */}
            <div className="card flex flex-col justify-center bg-espresso-700 p-5 text-cream-50 sm:p-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-caramel-400 text-caramel-400"
                  />
                ))}
              </div>
              <p className="mt-3 font-display text-3xl sm:text-4xl">
                {reviewSummary.averageRating}★
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-cream-100/70 sm:text-xs sm:tracking-[0.2em]">
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
                className="card-hoverable group flex flex-col p-5 active:scale-[0.98] sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-espresso-400 sm:text-xs sm:tracking-[0.2em]">
                    {p.name}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-espresso-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="mt-3 font-display text-3xl text-espresso-800 transition-colors group-hover:text-caramel-700 sm:text-4xl">
                  {p.rating}★
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-espresso-400 sm:text-xs sm:tracking-[0.2em]">
                  {p.count} {p.name} reviews
                </p>
              </a>
            ))}

            {/* Five-star card */}
            <div className="card flex flex-col justify-center p-5 sm:p-6">
              <p className="font-display text-3xl text-espresso-800 sm:text-4xl">
                100%
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-espresso-400 sm:text-xs sm:tracking-[0.2em]">
                Of recent reviews are 5-star
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-base">
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <figure
                key={i}
                className="card-hoverable group relative flex h-full flex-col gap-4 overflow-hidden p-5 active:scale-[0.99] sm:p-6 lg:p-7"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-caramel-400/0 blur-3xl transition-all duration-500 group-hover:bg-caramel-400/25" />
                <Quote className="absolute right-4 top-4 h-6 w-6 text-espresso-100 transition-all duration-500 group-hover:scale-110 group-hover:text-caramel-400/60 sm:right-6 sm:top-6 sm:h-8 sm:w-8" />
                <div className="relative flex items-center gap-1">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-caramel-500 text-caramel-500 transition-transform duration-300 group-hover:scale-110"
                      style={{ transitionDelay: `${j * 30}ms` }}
                    />
                  ))}
                </div>
                <blockquote className="relative break-words text-sm text-espresso-700 sm:text-base">
                  &ldquo;{r.body}&rdquo;
                </blockquote>
                <figcaption className="relative mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-espresso-100 pt-4 text-xs text-espresso-500">
                  <span className="break-words font-semibold text-espresso-700 transition-colors group-hover:text-caramel-700">
                    {r.author}
                  </span>
                  <span>
                    {sourceLabel[r.source]} · {formatDate(r.date)}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-10 rounded-3xl bg-cream-100/60 p-5 text-center sm:mt-16 sm:p-8 lg:p-12">
            <p className="eyebrow">Help us grow</p>
            <h2 className="mt-2 font-display text-2xl text-espresso-800 sm:mt-3 sm:text-3xl lg:text-4xl">
              Ordered before? Leave us a quick review.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-espresso-600 sm:text-base">
              Every honest review helps Komal&apos;s reach more coffee lovers in
              Lahore. Takes 30 seconds, and we read every one.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:justify-center">
              {reviewPlatforms.map((p) => (
                <a
                  key={p.key}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={
                    (p.key === "google" ? "btn-primary" : "btn-ghost") +
                    " w-full sm:w-auto"
                  }
                >
                  Review on {p.name}
                </a>
              ))}
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-ghost w-full sm:w-auto"
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
