import { site } from "@/lib/data/site";

/**
 * Pakistan Standard Time. Server-side rendering on Netlify/Vercel runs in
 * UTC, so we always convert to Asia/Karachi before comparing to `site.hours`.
 */
const TIMEZONE = "Asia/Karachi";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
type Weekday = (typeof WEEKDAYS)[number];

/** Convert "11:00 AM" / "10:00 PM" / "12:00 PM" into minutes from midnight. */
export function parseHour(s: string): number {
  const m = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

/** Returns the current weekday + minutes-of-day in Pakistan time. */
function pktNow(): { weekday: Weekday; minutes: number; weekdayIndex: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const weekday = (parts.find((p) => p.type === "weekday")?.value ??
    "Monday") as Weekday;
  // hour: "2-digit" + hour12: false → "00".."23" (some browsers emit "24" for midnight, clamp it)
  let hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(
    parts.find((p) => p.type === "minute")?.value ?? "0",
    10,
  );

  const weekdayIndex = WEEKDAYS.indexOf(weekday);
  return { weekday, minutes: hour * 60 + minute, weekdayIndex };
}

/** True if Komal's is currently within today's published order window. */
export function isWithinOrderHours(): boolean {
  const { weekday, minutes } = pktNow();
  const day = site.hours.find((h) => h.day === weekday);
  if (!day) return false;
  return minutes >= parseHour(day.open) && minutes < parseHour(day.close);
}

/**
 * Returns when the store next opens after the current moment.
 *  - null if we are currently within hours
 *  - { dayLabel: "today" | "tomorrow" | "Monday", time: "11:00 AM" } otherwise
 */
export function getNextOpening(): { dayLabel: string; time: string } | null {
  const { weekday, minutes, weekdayIndex } = pktNow();

  // If today's hours have not started yet, opening is later today.
  const today = site.hours.find((h) => h.day === weekday);
  if (today && minutes < parseHour(today.open)) {
    return { dayLabel: "today", time: today.open };
  }

  // Otherwise look forward 1..7 days for the next configured day.
  for (let i = 1; i <= 7; i++) {
    const nextIdx = (weekdayIndex + i) % 7;
    const nextWeekday = WEEKDAYS[nextIdx];
    const next = site.hours.find((h) => h.day === nextWeekday);
    if (next) {
      return {
        dayLabel: i === 1 ? "tomorrow" : nextWeekday,
        time: next.open,
      };
    }
  }
  return null;
}

export type StoreStatus = {
  isOpen: boolean;
  reason: "open" | "after_hours" | "manually_closed";
  next: { dayLabel: string; time: string } | null;
};

/**
 * Pure helper — recomputes the live store state from the admin's manual
 * switch + the published schedule. Runs identically on server and client
 * (the schedule check is timezone-locked to Asia/Karachi). Lives in this
 * plain module — NOT in the client `StoreStatusBadge` — so server
 * components (e.g. Hero) can call it across the RSC boundary.
 */
export function computeStoreStatus(manualOpen: boolean): StoreStatus {
  const { isOpen, reason } = getEffectiveStoreState({ is_open: manualOpen });
  return { isOpen, reason, next: isOpen ? null : getNextOpening() };
}

/**
 * Combine the admin's manual `is_open` switch with the schedule. The schedule
 * is the default (auto open during hours, auto close after them). The manual
 * switch is the override (admin can force-close even within hours).
 */
export function getEffectiveStoreState(input: {
  is_open: boolean | null | undefined;
}): {
  isOpen: boolean;
  /** Why is it closed? */
  reason: "open" | "after_hours" | "manually_closed";
} {
  const manual = input.is_open !== false; // null/true → not manually closed
  const within = isWithinOrderHours();
  if (!manual) return { isOpen: false, reason: "manually_closed" };
  if (!within) return { isOpen: false, reason: "after_hours" };
  return { isOpen: true, reason: "open" };
}
