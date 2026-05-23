import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import InstagramTease from "@/components/InstagramTease";
import SafeImage from "@/components/SafeImage";
import { gallery } from "@/lib/data/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A peek inside Komal's home kitchen. Drinks, pours, packaging, and the people who keep ordering.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="A peek inside Komal's kitchen."
        description="Drinks, pours, packaging, all shot in-house. Want to see more? Follow @komals.coffee on Instagram."
      />

      <section className="section">
        <div className="container-base">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {gallery.map((g, i) => (
              <figure
                key={i}
                className={
                  // Only apply the tall masonry tile on md+ so mobile stays
                  // a clean 2-col grid of equal squares with no overflow.
                  (i % 5 === 0
                    ? "relative aspect-square md:col-span-1 md:row-span-2 md:aspect-[3/4] "
                    : "relative aspect-square ") +
                  "group cursor-zoom-in overflow-hidden rounded-2xl bg-espresso-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-2 hover:ring-caramel-400/40 active:scale-[0.99] sm:rounded-3xl"
                }
              >
                <SafeImage
                  src={g.url}
                  alt={g.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 33vw, 50vw"
                  iconOnly
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/70 via-espresso-900/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {g.caption ? (
                  <figcaption className="absolute bottom-3 left-3 translate-y-1 rounded-full bg-espresso-900/60 px-3 py-1 text-xs text-cream-50 opacity-90 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:bg-espresso-900/85 group-hover:opacity-100">
                    {g.caption}
                  </figcaption>
                ) : (
                  <figcaption className="absolute bottom-3 left-3 translate-y-2 rounded-full bg-espresso-900/70 px-3 py-1 text-xs text-cream-50 opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {g.alt}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </section>

      <InstagramTease />
    </>
  );
}
