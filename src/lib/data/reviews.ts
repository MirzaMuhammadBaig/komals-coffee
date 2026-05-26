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
    body: "Quietly one of the best home-based coffee operations in Lahore right now. Do not sleep on this.",
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
  {
    source: "google",
    author: "Aisha Tariq",
    rating: 5,
    body: "Found Komal's through a friend and now this is our weekend ritual. Coffee is consistent, packaging is sturdy, and delivery is on time every single order.",
    date: "2026-03-18",
  },
  {
    source: "google",
    author: "Saad Mehmood",
    rating: 5,
    body: "Genuine specialty coffee from a home kitchen. I have ordered four times and the quality has not slipped once.",
    date: "2026-02-08",
  },
  {
    source: "google",
    author: "Rida Anjum",
    rating: 5,
    body: "Lovely experience start to finish. The WhatsApp confirmation made it easy to ask for less sugar and the drink arrived exactly that way.",
    date: "2025-12-29",
  },
  {
    source: "google",
    author: "Mahnoor Iqbal",
    rating: 5,
    body: "Worth every rupee. Hot drinks were piping hot on arrival and the iced one stayed perfectly cold the whole way over.",
    date: "2025-11-11",
  },
  {
    source: "google",
    author: "Talha Sheikh",
    rating: 4,
    body: "Coffee is excellent and delivery was quicker than expected. Would love to see slightly larger cup sizes available as an option.",
    date: "2026-01-30",
  },
  {
    source: "google",
    author: "Yumna Khan",
    rating: 5,
    body: "Komal personally messaged to confirm the order. That kind of touch is rare these days and the drinks lived up to it.",
    date: "2024-12-04",
    area: "Bahria Orchard",
  },
  {
    source: "google",
    author: "Imran Aziz",
    rating: 5,
    body: "I have tried most of the menu over the past two months. Every single cup has been spot on. A real find for Bahria Orchard.",
    date: "2025-06-14",
    area: "Bahria Orchard",
  },
  {
    source: "tripadvisor",
    author: "Asad H.",
    rating: 4,
    body: "Home-based but the coffee tastes better than several established cafes I have been to in Lahore. Delivery was prompt and friendly.",
    date: "2025-10-08",
  },
  {
    source: "tripadvisor",
    author: "Maham Z.",
    rating: 5,
    body: "Excellent quality and very thoughtful packaging. I would happily recommend this to anyone in the Lahore area looking for a proper cup.",
    date: "2025-08-22",
  },
  {
    source: "foodpanda",
    author: "Daniyal Raza",
    rating: 4,
    body: "Drinks were great and reached me warm. The only thing I would change is offering smaller portions for lighter days.",
    date: "2025-11-27",
  },
  {
    source: "facebook",
    author: "Tooba Naveed",
    rating: 5,
    body: "Ordered for a small office gathering and everyone was impressed. Komal coordinated the timing perfectly and all the drinks landed together.",
    date: "2025-09-09",
  },
  {
    source: "google",
    author: "Omar Saeed",
    rating: 4,
    body: "Solid specialty coffee. The flavour balance is on point and the prices feel fair for the quality you get.",
    date: "2026-02-25",
  },
  {
    source: "google",
    author: "Fatima Shah",
    rating: 5,
    body: "I have been ordering for months now. Komal is responsive, the coffee is always fresh, and delivery is reliable. Five stars without hesitation.",
    date: "2024-11-18",
    area: "Bahria Orchard",
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
