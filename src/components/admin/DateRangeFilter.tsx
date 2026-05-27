import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  buildRangeQuery,
  DATE_RANGE_LABELS,
  DEFAULT_RANGE,
  isoDate,
  STANDARD_RANGE_PILLS,
  type DateRange,
  type ResolvedRange,
} from "@/lib/admin/date-ranges";

/**
 * Date-range filter shared across admin screens.
 *
 * Renders a row of preset pills (Today / Yesterday / Last 7d / Last 30d /
 * This month / Last month / All / Custom). Selecting **Custom** reveals a
 * GET form with two `<input type="date">` fields. State lives in the URL,
 * so navigating, bookmarking, and the browser back button all work
 * without any client JavaScript.
 *
 * - `basePath` — the path being filtered (e.g. "/admin/orders").
 * - `preserve` — extra params to keep on each pill link (status, search, …).
 */
export default function DateRangeFilter({
  basePath,
  current,
  resolved,
  searchParams,
  preserve = {},
}: {
  basePath: string;
  current: DateRange;
  resolved: ResolvedRange;
  searchParams: { from?: string; to?: string };
  preserve?: Record<string, string | undefined>;
}) {
  return (
    <div className="space-y-3">
      {/* Preset pills — horizontally scrollable on mobile. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {STANDARD_RANGE_PILLS.map((r) => {
          const active = current === r;
          const href =
            basePath +
            buildRangeQuery(r, preserve, {
              from: searchParams.from,
              to: searchParams.to,
            });
          return (
            <Link
              key={r}
              href={href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-150 active:scale-95 sm:shrink sm:px-4 sm:py-2",
                active
                  ? "bg-espresso-700 text-cream-50 shadow-sm"
                  : "border border-espresso-200 bg-white text-espresso-700 hover:-translate-y-0.5 hover:border-espresso-700 hover:bg-espresso-700 hover:text-cream-50",
              )}
            >
              {DATE_RANGE_LABELS[r]}
            </Link>
          );
        })}
      </div>

      {/* Custom-range form — only shown when the user picks Custom. */}
      {current === "custom" && (
        <form
          method="GET"
          action={basePath}
          className="card flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 sm:p-5"
        >
          <input type="hidden" name="range" value="custom" />
          {Object.entries(preserve).map(([k, v]) =>
            v ? <input key={k} type="hidden" name={k} value={v} /> : null,
          )}
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-500">
              From
            </span>
            <input
              type="date"
              name="from"
              defaultValue={searchParams.from ?? ""}
              max={isoDate(new Date())}
              className="input mt-1.5"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-500">
              To
            </span>
            <input
              type="date"
              name="to"
              defaultValue={searchParams.to ?? ""}
              max={isoDate(new Date())}
              className="input mt-1.5"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-espresso-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 active:translate-y-0 active:scale-95"
          >
            Apply
          </button>
        </form>
      )}

      <p className="text-xs text-espresso-500">
        Showing{" "}
        <span className="font-semibold text-espresso-700">
          {resolved.label}
        </span>
        {resolved.since && (
          <>
            {" "}
            (
            <span className="font-mono">{isoDate(resolved.since)}</span>
            {resolved.until && (
              <>
                {" "}
                to <span className="font-mono">{isoDate(resolved.until)}</span>
              </>
            )}
            )
          </>
        )}
      </p>
    </div>
  );
}

export { DEFAULT_RANGE };
