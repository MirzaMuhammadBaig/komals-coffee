import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { menu, menuCategories } from "@/lib/data/menu";
import { formatPkr } from "@/lib/utils";
import AddToCartButton from "@/components/AddToCartButton";
import GoToCheckoutButton from "@/components/GoToCheckoutButton";
import SafeImage from "@/components/SafeImage";
import CtaBanner from "@/components/CtaBanner";

export function generateStaticParams() {
  return menu.map((m) => ({ slug: m.slug }));
}

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const item = menu.find((m) => m.slug === params.slug);
  if (!item) return { title: "Drink" };
  return {
    title: item.name,
    description: item.description,
    openGraph: {
      title: item.name,
      description: item.description,
      images: item.image ? [{ url: item.image }] : undefined,
    },
  };
}

export default function MenuItemPage({ params }: Props) {
  const item = menu.find((m) => m.slug === params.slug);
  if (!item) notFound();

  const category = menuCategories.find((c) => c.slug === item.category);
  const related = menu
    .filter((m) => m.slug !== item.slug && m.category === item.category)
    .slice(0, 3);

  return (
    <>
      <section className="border-b border-espresso-100 bg-cream-50">
        <div className="container-base flex flex-wrap items-center justify-between gap-3 py-5">
          <Link
            href="/menu"
            className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-600 transition-colors hover:text-caramel-700"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to menu
          </Link>
          {category && (
            <span className="text-xs uppercase tracking-[0.2em] text-espresso-400">
              {category.name}
            </span>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container-base grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="group relative aspect-square overflow-hidden rounded-3xl bg-espresso-100 ring-1 ring-espresso-100 transition-shadow duration-500 hover:shadow-2xl">
            <SafeImage
              src={item.image}
              alt={item.name}
              fill
              priority
              className="img-zoom object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              iconOnly
            />
            {item.signature && (
              <span className="badge absolute left-5 top-5 bg-caramel-500 text-espresso-900 shadow-md">
                Signature
              </span>
            )}
            {!item.signature && item.bestseller && (
              <span className="badge absolute left-5 top-5 bg-espresso-700 text-cream-50 shadow-md">
                Bestseller
              </span>
            )}
          </div>

          <div>
            <p className="eyebrow">{category?.name ?? "Drink"}</p>
            <h1 className="mt-3 font-display text-4xl text-espresso-800 sm:text-5xl">
              {item.name}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-espresso-600">
              {item.description}
            </p>

            <div className="mt-7 flex items-baseline gap-4">
              <span className="font-display text-4xl text-espresso-800">
                {formatPkr(item.price)}
              </span>
              {item.size && (
                <span className="text-xs uppercase tracking-[0.2em] text-espresso-400">
                  {item.size}
                </span>
              )}
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-cream-100 px-3 py-1 text-[10px] uppercase tracking-wider text-espresso-500"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <AddToCartButton
                slug={item.slug}
                name={item.name}
                variant="large"
                preventLink={false}
              />
              <GoToCheckoutButton slug={item.slug} />
            </div>

            <dl className="mt-12 grid gap-5 border-t border-espresso-100 pt-8 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-espresso-400">
                  Made-to-order
                </dt>
                <dd className="mt-1 text-sm text-espresso-700">
                  Pulled, frothed and finished by Komal herself.
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-espresso-400">
                  Delivery
                </dt>
                <dd className="mt-1 text-sm text-espresso-700">
                  Bahria Orchard + nearby Lahore. 30 to 45 minutes.
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-espresso-400">
                  Customise
                </dt>
                <dd className="mt-1 text-sm text-espresso-700">
                  Milk, sweetness, extra shot — leave a note at checkout.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-cream-100/40 py-14 sm:py-20">
          <div className="container-base">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">More from this category</p>
                <h2 className="mt-3 font-display text-3xl text-espresso-800 sm:text-4xl">
                  You might also like
                </h2>
              </div>
              <Link
                href="/menu"
                className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-espresso-600 hover:text-caramel-700 sm:inline"
              >
                Full menu →
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/menu/${r.slug}`}
                  className="card-hoverable group block overflow-hidden active:scale-[0.99]"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <SafeImage
                      src={r.image}
                      alt={r.name}
                      fill
                      className="img-zoom object-cover"
                      sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-lg text-espresso-800 transition-colors group-hover:text-caramel-700">
                        {r.name}
                      </h3>
                      <span className="text-sm font-semibold text-espresso-700">
                        {formatPkr(r.price)}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      {r.size ? (
                        <span className="text-[11px] uppercase tracking-[0.2em] text-espresso-400">
                          {r.size}
                        </span>
                      ) : (
                        <span />
                      )}
                      <AddToCartButton slug={r.slug} name={r.name} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner />
    </>
  );
}
