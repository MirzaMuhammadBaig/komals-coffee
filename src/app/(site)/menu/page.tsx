import type { Metadata } from "next";
import { Suspense } from "react";
import CtaBanner from "@/components/CtaBanner";
import MenuExplorer from "@/components/MenuExplorer";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Komal's signature lattes, hot lattes, iced coffees, frappés and extras. The full made-to-order menu from Komal's Coffee, Bahria Orchard Lahore.",
};

export default function MenuPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="container-base py-16 text-center text-sm text-espresso-400">
            Loading menu…
          </div>
        }
      >
        <MenuExplorer />
      </Suspense>

      <section className="bg-cream-100/40 py-12 sm:py-20">
        <div className="container-base">
          <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <p className="eyebrow">About this menu</p>
              <h2 className="mt-2 font-display text-2xl text-espresso-800 sm:mt-3 sm:text-3xl lg:text-4xl">
                Made fresh, made for you.
              </h2>
              <p className="mt-3 text-sm text-espresso-600 sm:mt-4 sm:text-base">
                Every drink is built to order by Komal. Prices in PKR, default
                16oz where applicable. Milk substitutions, sweetness, and shot
                count are all adjustable. Just leave a note with your order.
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              <li className="card-hoverable p-5 sm:p-6">
                <p className="eyebrow">Made-to-order</p>
                <p className="mt-2 text-sm text-espresso-600">
                  No pre-made batches. Komal pulls, froths and finishes every
                  cup at the moment of order.
                </p>
              </li>
              <li className="card-hoverable p-5 sm:p-6">
                <p className="eyebrow">Customisable</p>
                <p className="mt-2 text-sm text-espresso-600">
                  Sweetness, milk type, an extra shot, easy on the foam. All
                  free, just ask in the notes.
                </p>
              </li>
              <li className="card-hoverable p-5 sm:p-6">
                <p className="eyebrow">Sealed & insulated</p>
                <p className="mt-2 text-sm text-espresso-600">
                  Hot drinks stay hot, iced drinks stay cold. Sturdy packaging,
                  zero spills on delivery.
                </p>
              </li>
              <li className="card-hoverable p-5 sm:p-6">
                <p className="eyebrow">Allergens & dietary</p>
                <p className="mt-2 text-sm text-espresso-600">
                  Lactose-sensitive or have an allergy? Mention it in the notes
                  and Komal will tailor the drink.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
