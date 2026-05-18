export type MenuCategorySlug =
  | "signature"
  | "hot-lattes"
  | "iced"
  | "frappes"
  | "extras";

export type MenuItem = {
  slug: string;
  name: string;
  description: string;
  price: number; // PKR, 16oz unless noted
  size?: string;
  category: MenuCategorySlug;
  image?: string;
  bestseller?: boolean;
  signature?: boolean;
  tags?: string[];
};

export const menuCategories: {
  slug: MenuCategorySlug;
  name: string;
  description: string;
}[] = [
  {
    slug: "signature",
    name: "Komal's Signatures",
    description:
      "The lattes guests come back for, built around our house caramel, hazelnut and Irish-cream ribbons.",
  },
  {
    slug: "hot-lattes",
    name: "Hot Lattes",
    description:
      "Double-shot espresso, hand-frothed milk, and a finish that's never an afterthought.",
  },
  {
    slug: "iced",
    name: "Iced Coffees",
    description:
      "Ice-shaken or layered over milk, finished for the Lahore afternoon.",
  },
  {
    slug: "frappes",
    name: "Frappés & Blends",
    description: "Blended, frothy, dessert-adjacent. Perfect for hot days and sweet tooths.",
  },
  {
    slug: "extras",
    name: "Little Extras",
    description: "Snacks, syrups and add-ons to pair with your cup.",
  },
];

export const menu: MenuItem[] = [
  // ─── Signatures ──────────────────────────────────────────
  {
    slug: "salted-caramel-latte",
    name: "Salted Caramel Latte",
    description:
      "Double espresso, steamed milk, our house salted-caramel ribbon and a flaky-salt finish. The order most regulars never replace.",
    price: 1100,
    size: "16oz",
    category: "signature",
    bestseller: true,
    signature: true,
    image:
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "irish-cream-latte",
    name: "Irish Cream Latte",
    description:
      "Smooth, custard-y Irish cream stirred through espresso and steamed whole milk. Dessert in a cup, no alcohol.",
    price: 1150,
    size: "16oz",
    category: "signature",
    signature: true,
    bestseller: true,
    image:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "hazelnut-praline-latte",
    name: "Hazelnut Praline Latte",
    description:
      "Toasted-hazelnut praline syrup, double espresso and silky milk. Finished with a swirl of praline crumble.",
    price: 1100,
    size: "16oz",
    category: "signature",
    signature: true,
    image:
      "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "komals-house-mocha",
    name: "Komal's House Mocha",
    description:
      "Dark Belgian chocolate ganache, double espresso, steamed milk. Rich, but not heavy.",
    price: 1150,
    size: "16oz",
    category: "signature",
    signature: true,
    image:
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=900&q=80",
  },

  // ─── Hot Lattes ──────────────────────────────────────────
  {
    slug: "classic-latte",
    name: "Classic Latte",
    description: "Just the way it should be. Espresso, steamed milk, micro-foam.",
    price: 900,
    size: "16oz",
    category: "hot-lattes",
    image:
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "cappuccino",
    name: "Cappuccino",
    description:
      "Equal parts espresso, steamed milk and dense foam. Cocoa-dust finish.",
    price: 850,
    size: "12oz",
    category: "hot-lattes",
    image:
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "vanilla-latte",
    name: "Vanilla Latte",
    description: "Real vanilla bean syrup, double shot, hand-frothed milk.",
    price: 950,
    size: "16oz",
    category: "hot-lattes",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "spanish-latte",
    name: "Spanish Latte",
    description: "Sweetened condensed milk, double espresso, steamed whole milk.",
    price: 1000,
    size: "16oz",
    category: "hot-lattes",
    bestseller: true,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "americano",
    name: "Americano",
    description: "A clean double shot, hot water, served as-is.",
    price: 600,
    size: "12oz",
    category: "hot-lattes",
  },

  // ─── Iced ────────────────────────────────────────────────
  {
    slug: "iced-caramel-latte",
    name: "Iced Salted Caramel Latte",
    description:
      "Our signature caramel latte, layered cold over ice. Tall, frosty, ridiculous.",
    price: 1200,
    size: "16oz",
    category: "iced",
    bestseller: true,
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "iced-spanish-latte",
    name: "Iced Spanish Latte",
    description: "Cold milk, condensed milk, double espresso poured over ice.",
    price: 1100,
    size: "16oz",
    category: "iced",
    image:
      "https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "iced-americano",
    name: "Iced Americano",
    description: "Double shot, chilled water, plenty of ice. Clean and bright.",
    price: 700,
    size: "16oz",
    category: "iced",
  },
  {
    slug: "iced-mocha",
    name: "Iced Mocha",
    description:
      "Belgian dark chocolate, cold milk, double espresso, ice and chocolate shavings.",
    price: 1200,
    size: "16oz",
    category: "iced",
    image:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=900&q=80",
  },

  // ─── Frappés ─────────────────────────────────────────────
  {
    slug: "caramel-frappe",
    name: "Caramel Frappé",
    description:
      "Blended ice, espresso, milk and house caramel, topped with whipped cream and caramel drizzle.",
    price: 1200,
    size: "16oz",
    category: "frappes",
    bestseller: true,
    image:
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "hazelnut-frappe",
    name: "Hazelnut Frappé",
    description:
      "Blended hazelnut praline, espresso and milk, finished with whipped cream and crumble.",
    price: 1200,
    size: "16oz",
    category: "frappes",
    image:
      "https://images.unsplash.com/photo-1620207418302-439b387441b0?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "mocha-frappe",
    name: "Mocha Frappé",
    description:
      "Blended chocolate, espresso, milk and ice, topped with cocoa-dusted cream.",
    price: 1200,
    size: "16oz",
    category: "frappes",
    image:
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=900&q=80",
  },

  // ─── Extras ──────────────────────────────────────────────
  {
    slug: "extra-shot",
    name: "Extra Espresso Shot",
    description: "Add a single shot to any drink.",
    price: 150,
    category: "extras",
  },
  {
    slug: "extra-syrup",
    name: "Extra Flavour Pump",
    description: "Caramel, hazelnut, vanilla, Irish cream or chocolate.",
    price: 100,
    category: "extras",
  },
  {
    slug: "whipped-cream",
    name: "Whipped Cream",
    description: "House-whipped sweet cream, on top.",
    price: 100,
    category: "extras",
  },
];

export const bestsellers = menu.filter((m) => m.bestseller);
export const signatures = menu.filter((m) => m.signature);
