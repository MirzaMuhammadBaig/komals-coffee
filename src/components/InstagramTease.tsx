import { Instagram } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { site } from "@/lib/data/site";
import { gallery } from "@/lib/data/gallery";

export default function InstagramTease() {
  const tiles = gallery.slice(0, 6);

  return (
    <section className="section">
      <div className="container-base">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="eyebrow">From the gram</p>
            <h2 className="mt-4 font-display text-4xl text-espresso-800 sm:text-5xl">
              {site.social.instagramHandle}
            </h2>
            <p className="mt-4 text-espresso-600">
              {site.stats.instagramFollowers} coffee lovers and counting. Tag us
              in your shots. Our favourites land on the feed.
            </p>
          </div>
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-primary"
          >
            <Instagram className="mr-2 h-4 w-4" />
            Follow on Instagram
          </a>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((g, i) => (
            <a
              key={i}
              href={site.social.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="group relative aspect-square overflow-hidden rounded-2xl bg-espresso-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-caramel-400/40 active:scale-95"
            >
              <SafeImage
                src={g.url}
                alt={g.alt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                iconOnly
              />
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-espresso-900/0 via-espresso-900/0 to-espresso-900/0 transition-all duration-500 group-hover:from-espresso-900/30 group-hover:via-espresso-900/30 group-hover:to-caramel-700/40">
                <Instagram className="h-7 w-7 -translate-y-1 scale-50 text-cream-50 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
