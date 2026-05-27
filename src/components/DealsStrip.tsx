import { Sparkles } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type Deal = {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  image_url: string | null;
  discount_pkr: number | null;
  discount_percent: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
};

/**
 * Customer-facing strip of live deals. Server component — pulls from
 * Supabase at request time (the site layout is force-dynamic, so this
 * is always fresh). Renders nothing when there are no in-window deals,
 * so it never leaves a sad empty box on the page.
 *
 * Filtering happens in SQL: only `is_active`, and `valid_from`/`valid_until`
 * must straddle now() when set. Sorted by `sort_order` ascending.
 *
 * Deals are marketing copy — they advertise an offer ("10% off this
 * weekend!"). The actual price drop is applied by typing the coupon
 * code on the order form, validated by `/api/coupons/validate`.
 */
export default async function DealsStrip() {
  let deals: Deal[] = [];
  try {
    const supabase = createSupabaseServiceClient();
    const nowIso = new Date().toISOString();
    const { data } = await supabase
      .from("deals")
      .select("*")
      .eq("is_active", true)
      .or(`valid_from.is.null,valid_from.lte.${nowIso}`)
      .or(`valid_until.is.null,valid_until.gte.${nowIso}`)
      .order("sort_order", { ascending: true })
      .limit(6);
    deals = (data as Deal[] | null) ?? [];
  } catch {
    return null;
  }

  if (deals.length === 0) return null;

  return (
    <section aria-label="Live offers">
      <header className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-caramel-500" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-caramel-700 sm:text-xs">
          Live offers
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {deals.map((d) => (
          <li
            key={d.id}
            className="group card relative flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg"
          >
            {d.image_url && (
              <div className="relative h-32 w-full overflow-hidden bg-espresso-100 sm:h-36">
                <SafeImage
                  src={d.image_url}
                  alt={d.title}
                  fill
                  sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  iconOnly
                />
              </div>
            )}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                {d.badge && (
                  <span className="badge bg-caramel-500 text-espresso-900">
                    {d.badge}
                  </span>
                )}
                <DiscountChip
                  pkr={d.discount_pkr}
                  percent={d.discount_percent}
                />
              </div>
              <h3 className="mt-2 break-words font-display text-lg text-espresso-800 transition-colors duration-300 group-hover:text-caramel-700 sm:text-xl">
                {d.title}
              </h3>
              {d.description && (
                <p className="mt-1.5 line-clamp-3 text-sm text-espresso-500">
                  {d.description}
                </p>
              )}
              {d.valid_until && (
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-espresso-400">
                  Ends{" "}
                  {new Date(d.valid_until).toLocaleDateString("en-PK", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-espresso-400">
        Got a code? Apply it on the order form below — the discount lands
        on your total before you pay.
      </p>
    </section>
  );
}

function DiscountChip({
  pkr,
  percent,
}: {
  pkr: number | null;
  percent: number | null;
}) {
  if (!pkr && !percent) return null;
  const label = percent ? `${percent}% off` : `Rs ${pkr} off`;
  return (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-green-700">
      {label}
    </span>
  );
}
