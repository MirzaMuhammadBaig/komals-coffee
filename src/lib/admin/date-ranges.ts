// Shared date-range filter for admin screens. One source of truth for the
// presets, custom-range parsing, label formatting, and URL serialisation so
// every screen (orders, revenue, dashboard) behaves identically.

export const DATE_RANGES = [
  "today",
  "yesterday",
  "last_7d",
  "last_30d",
  "last_90d",
  "month",
  "last_month",
  "all",
  "custom",
] as const;

export type DateRange = (typeof DATE_RANGES)[number];

export const DEFAULT_RANGE: DateRange = "last_30d";

export const DATE_RANGE_LABELS: Record<DateRange, string> = {
  today: "Today",
  yesterday: "Yesterday",
  last_7d: "Last 7 days",
  last_30d: "Last 30 days",
  last_90d: "Last 90 days",
  month: "This month",
  last_month: "Last month",
  all: "All time",
  custom: "Custom",
};

/** Standard set of pills shown on most screens. */
export const STANDARD_RANGE_PILLS: DateRange[] = [
  "today",
  "yesterday",
  "last_7d",
  "last_30d",
  "month",
  "last_month",
  "all",
  "custom",
];

function startOf(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOf(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export type ResolvedRange = {
  /** Inclusive lower bound (or null for "all time"). */
  since: Date | null;
  /** Inclusive upper bound (or null for open-ended). */
  until: Date | null;
  /** Friendly label for headings / chips. */
  label: string;
};

/**
 * Coerce the URL params into a concrete date window. Tolerant of bad input:
 * invalid dates are dropped, unknown ranges fall through to the default.
 */
export function resolveDateRange(
  range: string | undefined,
  from?: string,
  to?: string,
): ResolvedRange {
  const r = (DATE_RANGES as readonly string[]).includes(range ?? "")
    ? (range as DateRange)
    : DEFAULT_RANGE;
  const now = new Date();

  switch (r) {
    case "today":
      return { since: startOf(now), until: endOf(now), label: "Today" };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { since: startOf(y), until: endOf(y), label: "Yesterday" };
    }
    case "last_7d": {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      return { since: startOf(s), until: endOf(now), label: "Last 7 days" };
    }
    case "last_90d": {
      const s = new Date(now);
      s.setDate(s.getDate() - 89);
      return { since: startOf(s), until: endOf(now), label: "Last 90 days" };
    }
    case "month": {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { since: startOf(s), until: endOf(now), label: "This month" };
    }
    case "last_month": {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      return { since: startOf(s), until: endOf(e), label: "Last month" };
    }
    case "all":
      return { since: null, until: null, label: "All time" };
    case "custom": {
      const f = from ? new Date(from) : null;
      const t = to ? new Date(to) : null;
      const fOk = f && !Number.isNaN(f.getTime());
      const tOk = t && !Number.isNaN(t.getTime());
      return {
        since: fOk ? startOf(f as Date) : null,
        until: tOk ? endOf(t as Date) : endOf(now),
        label:
          fOk && tOk
            ? `${(from as string)} → ${(to as string)}`
            : "Custom range",
      };
    }
    case "last_30d":
    default: {
      const s = new Date(now);
      s.setDate(s.getDate() - 29);
      return { since: startOf(s), until: endOf(now), label: "Last 30 days" };
    }
  }
}

/** "YYYY-MM-DD" — used as the value for <input type="date"> and for filenames. */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Build a URL query for a target preset, preserving the other params
 * (status, search) the caller wants to keep around.
 */
export function buildRangeQuery(
  target: DateRange,
  preserve: Record<string, string | undefined> = {},
  custom?: { from?: string; to?: string },
): string {
  const params = new URLSearchParams();
  if (target !== DEFAULT_RANGE) params.set("range", target);
  if (target === "custom") {
    if (custom?.from) params.set("from", custom.from);
    if (custom?.to) params.set("to", custom.to);
  }
  for (const [k, v] of Object.entries(preserve)) {
    if (v) params.set(k, v);
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}
