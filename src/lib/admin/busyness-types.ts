// Pure types and helpers for the busyness feature.
//
// Kept in a non-"use server" module so the values can be imported by both
// client components (BusynessForm) and server code (orders pipeline) —
// "use server" modules may only export async functions.

export const BUSYNESS_LEVELS = ["normal", "busy", "super_busy"] as const;
export type BusynessLevel = (typeof BUSYNESS_LEVELS)[number];

export const BUSYNESS_MULTIPLIERS: Record<BusynessLevel, number> = {
  normal: 1,
  busy: 2,
  super_busy: 3,
};

export const BUSYNESS_LABELS: Record<BusynessLevel, string> = {
  normal: "Normal",
  busy: "Busy",
  super_busy: "Super busy",
};

export const BUSYNESS_DESCRIPTIONS: Record<BusynessLevel, string> = {
  normal: "Standard wait times. Auto-advance runs at the base minutes.",
  busy: "Wait times doubled. Light queue forming during peak hours.",
  super_busy:
    "Wait times tripled. Use this on weekends or full-on rush days.",
};

/**
 * Base minutes (multiplied by the current level) before an order auto
 * advances. The keys match the only transitions we automate; delivered
 * and cancelled stay manual.
 */
export type AutoProgressMinutes = {
  new_to_confirmed: number;
  confirmed_to_out_for_delivery: number;
};

export const DEFAULT_AUTO_PROGRESS_MINUTES: AutoProgressMinutes = {
  new_to_confirmed: 2,
  confirmed_to_out_for_delivery: 10,
};

/**
 * Maps the current status to the status it would auto-advance to. Returns
 * null for terminal/manual statuses.
 */
export function nextStatusAfter(status: string): string | null {
  if (status === "new") return "confirmed";
  if (status === "confirmed") return "out_for_delivery";
  return null;
}

/**
 * When should an order in this status next auto-advance? Returns a Date
 * in the future, or null if the status is terminal/manual.
 */
export function nextAutoAdvanceAt(
  status: string,
  level: BusynessLevel,
  base: AutoProgressMinutes,
  from: Date = new Date(),
): Date | null {
  const multiplier = BUSYNESS_MULTIPLIERS[level];
  let minutes = 0;
  if (status === "new") minutes = base.new_to_confirmed * multiplier;
  else if (status === "confirmed")
    minutes = base.confirmed_to_out_for_delivery * multiplier;
  else return null;
  return new Date(from.getTime() + minutes * 60_000);
}
