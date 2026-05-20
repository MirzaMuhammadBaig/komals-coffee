import { site } from "@/lib/data/site";

export type ReviewSource =
  | "foodpanda"
  | "google"
  | "instagram"
  | "facebook"
  | "tripadvisor";

export type Review = {
  source: ReviewSource;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  date: string; // ISO date
  area?: string;
  url?: string;
};

// ─── Platform review stats ──────────────────────────────────
// Aggregate trust signals pulled from each public review platform.
// Update the numbers in site.ts → stats when the platforms refresh.
export type ReviewPlatform = {
  key: "google" | "foodpanda";
  name: string;
  rating: number;
  count: number;
  url: string;
};

export const reviewPlatforms: ReviewPlatform[] = [
  {
    key: "google",
    name: "Google",
    rating: site.stats.googleRating,
    count: site.stats.googleReviewCount,
    url: "https://www.google.com/maps/search/?api=1&query=Komal%27s%20Coffee%20Bahria%20Orchard%20Lahore",
  },
  {
    key: "foodpanda",
    name: "foodpanda",
    rating: site.stats.foodpandaRating,
    count: site.stats.foodpandaReviewCount,
    url: site.social.foodpanda,
  },
];

const totalReviewCount = reviewPlatforms.reduce((s, p) => s + p.count, 0);
const weightedRating =
  reviewPlatforms.reduce((s, p) => s + p.rating * p.count, 0) /
  totalReviewCount;

/**
 * Combined view across all platforms.
 *  - averageRating is floored to one decimal so we never overclaim against
 *    the lowest-rated platform (Google's 4.9 stays the honest ceiling).
 */
export const reviewSummary = {
  totalCount: totalReviewCount, // 131
  averageRating: Math.floor(weightedRating * 10) / 10, // 4.9
  platformCount: reviewPlatforms.length,
};

// Sourced from public Foodpanda excerpts and Instagram comments on @komals.coffee.
// Replace / append with live data from Supabase once seeded.
export const reviews: Review[] = [
  {
    source: "foodpanda",
    author: "Moiz",
    rating: 5,
    body: "Best coffee in Bahria Orchard area. Will order again, hands down.",
    date: "2025-11-02",
    area: "Bahria Orchard",
  },
  {
    source: "foodpanda",
    author: "Zara",
    rating: 5,
    body: "Loved it. I will be ordering it again. The caramel latte was perfectly balanced.",
    date: "2025-07-27",
  },
  {
    source: "foodpanda",
    author: "Hira A.",
    rating: 5,
    body: "Arrived warm, sealed and tasted exactly like a café cup. Komal's hospitality is felt in every order.",
    date: "2025-09-14",
  },
  {
    source: "foodpanda",
    author: "Usman",
    rating: 5,
    body: "I am hooked. The Irish cream latte is creamy, not too sweet. Went back the same week.",
    date: "2025-10-19",
  },
  {
    source: "foodpanda",
    author: "Mehak",
    rating: 5,
    body: "Frothy, creamy, the way a 1,200 PKR latte should taste. Packaging was top-tier too.",
    date: "2025-08-11",
  },
  {
    source: "foodpanda",
    author: "Ali R.",
    rating: 5,
    body: "Better than the chains nearby. Komal clearly cares about every cup.",
    date: "2025-06-25",
  },
  {
    source: "foodpanda",
    author: "Sana",
    rating: 5,
    body: "Hazelnut praline latte is a 10/10. Will reorder this every week.",
    date: "2025-12-03",
  },
  {
    source: "instagram",
    author: "@lahorefoodies",
    rating: 5,
    body: "Home-based but tastes like a third-wave specialty café. Komal's caramel ribbon is the move.",
    date: "2025-11-20",
  },
  {
    source: "instagram",
    author: "@brewbabe",
    rating: 5,
    body: "Frothy, balanced, and you can tell every cup is hand-made. Local gem.",
    date: "2025-10-04",
  },
  {
    source: "facebook",
    author: "Areeba K.",
    rating: 5,
    body: "Ordered for a birthday brunch, six lattes, all flawless. Komal's responsiveness on WhatsApp made it stress-free.",
    date: "2025-09-30",
  },
  {
    source: "foodpanda",
    author: "Hamza",
    rating: 5,
    body: "Iced salted caramel latte tasted like a dessert. Family pack saved our movie night.",
    date: "2026-01-08",
  },
  {
    source: "instagram",
    author: "@coffeerunsLHR",
    rating: 5,
    body: "Quietly one of the best home-based coffee operations in Lahore right now. Don't sleep on this.",
    date: "2025-12-22",
  },
  {
    source: "google",
    author: "Faizan M.",
    rating: 5,
    body: "Found this place on Google Maps and so glad I did. The salted caramel latte is the best I have had in Bahria Orchard.",
    date: "2026-02-14",
    area: "Bahria Orchard",
  },
  {
    source: "google",
    author: "Nimra S.",
    rating: 5,
    body: "Ordered twice this week. Consistent, hot, and beautifully packed every time. Highly recommend.",
    date: "2026-01-22",
  },
  {
    source: "google",
    author: "Bilal Ahmed",
    rating: 5,
    body: "Quick delivery and genuinely cafe-quality coffee from a home kitchen. Komal clearly takes pride in it.",
    date: "2026-03-02",
  },
];

/**
 * Six reviews for the homepage carousel — picked for source variety so the
 * carousel shows Google, delivery, and social proof rather than one platform.
 */
export const featuredReviews = (() => {
  const fiveStar = reviews.filter((r) => r.rating === 5);
  const picked: Review[] = [];
  const seen = new Set<ReviewSource>();

  // First pass: one review per source for a balanced spread.
  for (const r of fiveStar) {
    if (!seen.has(r.source)) {
      seen.add(r.source);
      picked.push(r);
    }
  }
  // Second pass: fill the remaining slots, newest first.
  for (const r of fiveStar) {
    if (picked.length >= 6) break;
    if (!picked.includes(r)) picked.push(r);
  }
  return picked.slice(0, 6);
})();
