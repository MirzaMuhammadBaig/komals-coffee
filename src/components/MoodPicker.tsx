import Link from "next/link";
import { Sun, Snowflake, Heart, Zap, ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";

type Mood = {
  icon: typeof Sun;
  emoji: string;
  title: string;
  subtitle: string;
  drink: string;
  drinkSlug: string;
  gradient: string;
  accent: string;
};

const moods: Mood[] = [
  {
    icon: Zap,
    emoji: "⚡",
    title: "Need energy",
    subtitle: "Long day? Long shot.",
    drink: "Spanish Latte",
    drinkSlug: "spanish-latte",
    gradient: "from-espresso-700 to-espresso-900",
    accent: "caramel",
  },
  {
    icon: Heart,
    emoji: "🍯",
    title: "Sweet tooth",
    subtitle: "Dessert in a cup.",
    drink: "Salted Caramel Latte",
    drinkSlug: "salted-caramel-latte",
    gradient: "from-caramel-500 to-caramel-700",
    accent: "cream",
  },
  {
    icon: Snowflake,
    emoji: "❄️",
    title: "Beat the heat",
    subtitle: "Layered cold over ice.",
    drink: "Iced Salted Caramel Latte",
    drinkSlug: "iced-caramel-latte",
    gradient: "from-blush-300 to-caramel-500",
    accent: "cream",
  },
  {
    icon: Sun,
    emoji: "🌅",
    title: "Cozy morning",
    subtitle: "Smooth, slow, satisfying.",
    drink: "Irish Cream Latte",
    drinkSlug: "irish-cream-latte",
    gradient: "from-caramel-600 to-espresso-700",
    accent: "cream",
  },
];

export default function MoodPicker() {
  return (
    <section className="relative overflow-hidden bg-cream-50 py-16 sm:py-24">
      <div className="container-base relative">
        <Reveal direction="up">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Pick your vibe</p>
            <h2 className="mt-3 font-display text-3xl text-espresso-800 sm:text-4xl lg:text-5xl">
              What kind of cup is{" "}
              <em className="text-caramel-600">today?</em>
            </h2>
            <p className="mt-4 text-espresso-600">
              Tell us the mood, we&apos;ll point at the drink. Tap a card to
              jump straight to it.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {moods.map((m, i) => (
            <Reveal
              key={m.title}
              direction="up"
              delay={120 + i * 110}
              className="h-full"
            >
              <Link
                href={`/menu/${m.drinkSlug}`}
                className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br ${m.gradient} p-5 text-cream-50 shadow-[0_20px_60px_-30px_rgba(58,36,23,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_80px_-30px_rgba(58,36,23,0.65)] active:translate-y-0 active:scale-[0.98] sm:p-6`}
              >
                {/* Decorative blob */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cream-50/15 blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:bg-cream-50/25"
                />
                {/* Watermark emoji */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-3 right-2 text-5xl leading-none opacity-20 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:opacity-40 sm:-bottom-2 sm:right-3 sm:text-7xl"
                >
                  {m.emoji}
                </span>

                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cream-50/15 backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-cream-50/25 sm:h-11 sm:w-11">
                    <m.icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-4 font-display text-xl sm:mt-5 sm:text-2xl">
                    {m.title}
                  </h3>
                  <p className="mt-1 text-sm text-cream-100/80">
                    {m.subtitle}
                  </p>
                </div>

                <div className="relative mt-6 flex items-end justify-between gap-3 border-t border-cream-50/15 pt-4 sm:mt-8">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-100/70">
                      We suggest
                    </p>
                    <p className="mt-1 font-display text-base leading-tight">
                      {m.drink}
                    </p>
                  </div>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-50/15 transition-all duration-300 group-hover:bg-cream-50 group-hover:text-espresso-800">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
