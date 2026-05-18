export const site = {
  name: "Komal's Coffee",
  tagline: "Hand-crafted lattes, brewed at home.",
  shortDescription:
    "A home-based specialty coffee studio in Bahria Orchard, Lahore. Frothy, creamy, and made-to-order with the kind of care only Komal pours.",
  longDescription:
    "Komal's Coffee began in a small home kitchen in Bahria Orchard, Lahore: a one-woman roastery with one belief. Every cup should taste like it was made for you. No factory shortcuts, no chain-store templates. Just thoughtful espresso, ribbons of caramel, hand-frothed milk, and a delivery box that arrives at your door warm, sealed, and signed-off by Komal herself. We do not have seats. We do not have a queue. We have your order, and we make it the same way we would make it for family.",
  founder: {
    name: "Komal Hassan",
    role: "Founder & Head Barista",
    bio: "A home-based entrepreneur with a barista's obsession for milk texture and a baker's love for the perfect caramel ribbon. Komal started the brand from her kitchen in 2024. Today every order is still pulled, frothed and finished by her own hand.",
  },
  address: {
    line1: "Bahria Orchard Phase 1",
    line2: "Lahore, Punjab",
    country: "Pakistan",
    mapsUrl: "https://maps.google.com/?q=Bahria+Orchard+Lahore",
    embedUrl:
      "https://www.google.com/maps?q=Bahria+Orchard+Lahore&output=embed",
  },
  // Home-based. Pickup & delivery windows only.
  hours: [
    { day: "Monday", open: "11:00 AM", close: "10:00 PM" },
    { day: "Tuesday", open: "11:00 AM", close: "10:00 PM" },
    { day: "Wednesday", open: "11:00 AM", close: "10:00 PM" },
    { day: "Thursday", open: "11:00 AM", close: "10:00 PM" },
    { day: "Friday", open: "11:00 AM", close: "11:00 PM" },
    { day: "Saturday", open: "11:00 AM", close: "11:00 PM" },
    { day: "Sunday", open: "12:00 PM", close: "10:00 PM" },
  ],
  contact: {
    phone: "+92 300 0000000",
    whatsapp: "+92 300 0000000",
    email: "hello@komalscoffee.pk",
  },
  social: {
    instagram: "https://www.instagram.com/komals.coffee",
    instagramHandle: "@komals.coffee",
    facebook: "https://www.facebook.com/komalscoffee",
    foodpanda:
      "https://www.foodpanda.pk/restaurant/komals-coffee-bahria-orchard-lahore",
    tiktok: "https://www.tiktok.com/@komals.coffee",
  },
  stats: {
    foodpandaRating: 5.0,
    foodpandaReviewCount: 67,
    instagramFollowers: "575+",
    yearStarted: 2024,
    deliveryRadius: "Bahria Orchard & nearby Lahore",
  },
  service: {
    mode: "Pickup & Delivery",
    deliveryNote:
      "Door-to-door delivery across Bahria Orchard and surrounding Lahore zones. Sealed, insulated, and arrives in 30 to 45 minutes on average.",
    pickupNote:
      "Pickup available from Bahria Orchard on request. DM to coordinate.",
    minOrder: 1000,
  },
} as const;

export type Site = typeof site;
