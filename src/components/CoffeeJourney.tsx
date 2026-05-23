import { Leaf, Cog, Flame, Coffee, Truck } from "lucide-react";
import Reveal from "@/components/Reveal";

const steps = [
  {
    icon: Leaf,
    title: "Single-origin",
    body: "Beans sourced from boutique roasters Komal has personally tasted.",
  },
  {
    icon: Cog,
    title: "Ground to order",
    body: "Every cup begins with a fresh grind, dialled for the day's humidity.",
  },
  {
    icon: Flame,
    title: "Hand-pulled",
    body: "Espresso pulled and milk frothed at the moment your order lands.",
  },
  {
    icon: Coffee,
    title: "Finished by Komal",
    body: "Caramel ribbons, latte art, cocoa dust — never an afterthought.",
  },
  {
    icon: Truck,
    title: "Sealed & sent",
    body: "Insulated to your door in 30 to 45 minutes, warm and photo-ready.",
  },
];

export default function CoffeeJourney() {
  return (
    <section className="relative overflow-hidden border-b border-espresso-100 bg-gradient-to-b from-cream-50 via-cream-100/40 to-cream-50 py-16 sm:py-24">
      {/* Subtle decorative blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 animate-blob rounded-full bg-caramel-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 animate-blob rounded-full bg-blush-300/15 blur-3xl"
        style={{ animationDelay: "2.5s" }}
      />

      <div className="container-base relative">
        <Reveal direction="up">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">From bean to cup</p>
            <h2 className="mt-3 font-display text-3xl text-espresso-800 sm:text-4xl lg:text-5xl">
              The five steps in every order.
            </h2>
            <p className="mt-4 text-espresso-600">
              No factory pipeline, no mystery shortcuts. Just five moments of
              care between Komal&apos;s kitchen and your door.
            </p>
          </div>
        </Reveal>

        <ol className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
          {steps.map((s, i) => (
            <Reveal
              key={s.title}
              direction="up"
              delay={120 + i * 110}
              className="relative h-full"
            >
              <div className="card-hoverable group relative flex h-full flex-col p-5 active:scale-[0.99] sm:p-6">
                {/* Step number watermark */}
                <span
                  aria-hidden
                  className="absolute right-3 top-2 font-display text-3xl font-bold leading-none text-espresso-100 transition-colors duration-300 group-hover:text-caramel-500/30 sm:right-4 sm:top-3 sm:text-5xl"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-caramel-500/15 text-caramel-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-caramel-500/30">
                  <s.icon className="h-5 w-5" strokeWidth={1.7} />
                </div>

                <h3 className="relative mt-5 font-display text-lg text-espresso-800 transition-colors duration-300 group-hover:text-caramel-700">
                  {s.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-espresso-500">
                  {s.body}
                </p>

                {/* Connector dot between cards on lg+ */}
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -right-3 top-1/2 hidden h-1 w-6 -translate-y-1/2 rounded-full bg-gradient-to-r from-caramel-500/40 to-transparent lg:block"
                  />
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
