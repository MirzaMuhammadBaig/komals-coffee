import { Star, Quote } from "lucide-react";
import { featuredReviews, reviewSummary } from "@/lib/data/reviews";
import { formatDate } from "@/lib/utils";

const sourceLabel: Record<string, string> = {
  google: "Google",
  foodpanda: "Verified order",
  instagram: "Instagram",
  facebook: "Facebook",
  tripadvisor: "Tripadvisor",
};

export default function ReviewsCarousel() {
  return (
    <section className="section bg-espresso-800 text-cream-50">
      <div className="container-base">
        <div className="max-w-2xl">
          <p className="eyebrow text-caramel-400">What guests are saying</p>
          <h2 className="mt-3 font-display text-3xl text-cream-50 sm:mt-4 sm:text-4xl lg:text-5xl">
            {reviewSummary.averageRating}★ from{" "}
            {reviewSummary.totalCount}+ reviews
          </h2>
          <p className="mt-3 max-w-xl text-sm text-cream-100/70 sm:mt-4 sm:text-base">
            Rated across Google, foodpanda, Instagram and Facebook. We do not
            filter. These are real, public reviews from real customers.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredReviews.slice(0, 6).map((r, idx) => (
            <figure
              key={idx}
              className="group relative overflow-hidden rounded-3xl bg-espresso-700/40 p-5 ring-1 ring-cream-100/10 backdrop-blur transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-espresso-700/55 hover:ring-caramel-400/40 hover:shadow-[0_30px_60px_-30px_rgba(224,163,100,0.45)] sm:p-6 lg:p-7"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-caramel-400/0 blur-3xl transition-all duration-500 group-hover:bg-caramel-400/20" />
              <Quote className="absolute right-4 top-4 h-6 w-6 text-caramel-400/40 transition-all duration-500 group-hover:scale-110 group-hover:text-caramel-400/70 sm:right-6 sm:top-6 sm:h-8 sm:w-8" />
              <div className="flex items-center gap-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-caramel-400 text-caramel-400 transition-transform duration-300 group-hover:scale-110"
                    style={{ transitionDelay: `${i * 30}ms` }}
                  />
                ))}
              </div>
              <blockquote className="relative mt-4 break-words text-sm leading-relaxed text-cream-100/90 sm:text-base">
                &ldquo;{r.body}&rdquo;
              </blockquote>
              <figcaption className="relative mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-cream-100/10 pt-4 text-xs text-cream-100/60 sm:mt-6">
                <span className="break-words font-semibold text-cream-50">
                  {r.author}
                </span>
                <span>
                  {sourceLabel[r.source]} · {formatDate(r.date)}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
