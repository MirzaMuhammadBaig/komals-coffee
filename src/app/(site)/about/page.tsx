import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import WhyKomals from "@/components/WhyKomals";
import LocationHours from "@/components/LocationHours";
import CtaBanner from "@/components/CtaBanner";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Komal's Coffee is a home-based specialty coffee studio in Bahria Orchard, Lahore. Built by founder Komal Hassan. One barista, one kitchen, one promise.",
};

const milestones = [
  {
    year: "2024",
    title: "The home kitchen opens",
    body: "Komal starts pulling shots for friends and family, and the first paid order arrives within a week.",
  },
  {
    year: "Mid 2024",
    title: "foodpanda launch",
    body: "Komal's Coffee goes live on foodpanda for Bahria Orchard. The first 5-star reviews start coming in.",
  },
  {
    year: "Late 2024",
    title: "Signature menu finalised",
    body: "Salted caramel, Irish cream and hazelnut praline lattes become the menu pillars regulars keep reordering.",
  },
  {
    year: "2025",
    title: "5.0★ on 67 reviews",
    body: "A spotless rating, hundreds of repeat orders, and a 500+ Instagram community. All word-of-mouth, no ads.",
  },
];

const values = [
  {
    title: "Quality you can taste, not market",
    body: "Single-origin espresso, fresh milk, real syrups. If a shot pulls badly, it is binned and re-pulled. No exceptions.",
  },
  {
    title: "Hospitality from the kitchen",
    body: "You order, Komal makes it. You message, Komal answers. No call centres, no scripts, just a barista who actually cares.",
  },
  {
    title: "Delivery you'd expect from a café",
    body: "Insulated, sealed, double-checked. The drink that leaves the kitchen is the drink that arrives. Warm, complete, photo-ready.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="A coffee brand built from one home kitchen."
        description={site.longDescription}
      />

      <section className="section">
        <div className="container-base grid items-start gap-16 lg:grid-cols-[1fr_1.2fr]">
          <div className="relative h-[460px] overflow-hidden rounded-3xl ring-1 ring-espresso-100 sm:h-[520px] lg:h-[600px]">
            <Image
              src="https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=1400&q=80"
              alt="Komal pouring milk into espresso"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-cream-50/95 p-5 shadow-xl">
              <p className="font-script text-3xl text-caramel-600">
                {site.founder.name}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-espresso-500">
                {site.founder.role}
              </p>
              <p className="mt-3 text-sm text-espresso-600">
                {site.founder.bio}
              </p>
            </div>
          </div>
          <div>
            <p className="eyebrow">What we believe</p>
            <h2 className="mt-3 font-display text-4xl text-espresso-800 sm:text-5xl">
              Three things we will{" "}
              <em className="text-caramel-600">never compromise on.</em>
            </h2>
            <ul className="mt-10 space-y-3">
              {values.map((v, i) => (
                <li
                  key={v.title}
                  className="group flex gap-5 rounded-2xl p-3 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-espresso-100"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-caramel-500/15 font-display text-xl text-caramel-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-caramel-500/30">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-espresso-800 transition-colors duration-300 group-hover:text-caramel-700">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-espresso-600">{v.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-cream-100/40">
        <div className="container-base">
          <p className="eyebrow">Timeline</p>
          <h2 className="mt-3 font-display text-4xl text-espresso-800 sm:text-5xl">
            Quietly building, one cup at a time.
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((m) => (
              <div
                key={m.year}
                className="card-hoverable group relative overflow-hidden p-6 active:scale-[0.99] sm:p-7"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-caramel-500/0 blur-2xl transition-all duration-500 group-hover:bg-caramel-500/30" />
                <span className="relative inline-block font-display text-3xl text-caramel-600 transition-transform duration-300 group-hover:scale-110">
                  {m.year}
                </span>
                <h3 className="relative mt-3 font-display text-xl text-espresso-800 transition-colors duration-300 group-hover:text-caramel-700">
                  {m.title}
                </h3>
                <p className="relative mt-2 text-sm text-espresso-500">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhyKomals />
      <LocationHours />
      <CtaBanner />
    </>
  );
}
