"use client";

import { useEffect, useState } from "react";
import { Sparkles, PowerOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { computeStoreStatus, type StoreStatus } from "@/lib/hours";

function badgeLabel(s: StoreStatus): string {
  if (s.isOpen) return "Open · Brewing now";
  if (s.reason === "manually_closed") return "Closed for now";
  if (s.next) {
    if (s.next.dayLabel === "today") return `Closed · Opens at ${s.next.time}`;
    if (s.next.dayLabel === "tomorrow")
      return `Closed · Opens tomorrow at ${s.next.time}`;
    return `Closed · Opens ${s.next.dayLabel} at ${s.next.time}`;
  }
  return "Closed for now";
}

/**
 * The hero status chip. Seeded with a server-computed value (so hydration
 * matches the SSR HTML exactly), then re-evaluates the clock on the client:
 *  - immediately on mount (corrects any build/request-time staleness)
 *  - every 30 seconds (flips automatically at open / close time)
 *  - whenever the tab regains focus (catches long-idle tabs)
 */
export default function StoreStatusBadge({
  manualOpen,
  initial,
}: {
  manualOpen: boolean;
  initial: StoreStatus;
}) {
  const [status, setStatus] = useState<StoreStatus>(initial);

  useEffect(() => {
    function tick() {
      setStatus(computeStoreStatus(manualOpen));
    }
    tick();
    const id = window.setInterval(tick, 30_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [manualOpen]);

  const isOpen = status.isOpen;

  return (
    <div
      className={cn(
        "mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] backdrop-blur-md ring-1",
        isOpen
          ? "badge-glow-open bg-espresso-900/55 text-cream-100 ring-cream-100/15"
          : "badge-glow-closed bg-red-900/55 text-red-100 ring-red-200/20",
      )}
    >
      {isOpen ? (
        <Sparkles className="h-3 w-3 text-caramel-400" />
      ) : (
        <PowerOff className="h-3 w-3 text-red-300" />
      )}
      <span>{badgeLabel(status)}</span>
      <span className="relative ml-1 inline-flex h-1.5 w-1.5">
        <span
          className={cn(
            "absolute inset-0 animate-ping rounded-full opacity-75",
            isOpen ? "bg-green-400" : "bg-red-400",
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-1.5 w-1.5 rounded-full",
            isOpen ? "bg-green-400" : "bg-red-400",
          )}
        />
      </span>
    </div>
  );
}
