"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Coffee,
  Flame,
  Instagram,
  MapPin,
  MessageCircle,
  PowerOff,
  Sparkles,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "caramel" | "espresso" | "green" | "red" | "cream";

type Update = {
  icon: typeof Coffee;
  text: string;
  tone: Tone;
};

const OPEN_UPDATES: Update[] = [
  {
    icon: Flame,
    text: "Komal is brewing 3 orders right now",
    tone: "caramel",
  },
  {
    icon: Coffee,
    text: "Just delivered: Salted Caramel Latte to Sector C",
    tone: "espresso",
  },
  {
    icon: Sparkles,
    text: "147 cups served this month",
    tone: "caramel",
  },
  {
    icon: MapPin,
    text: "Most ordered drink today: Irish Cream Latte",
    tone: "espresso",
  },
  {
    icon: Timer,
    text: "Average delivery this week: 38 minutes",
    tone: "green",
  },
  {
    icon: Coffee,
    text: "Just delivered: Hazelnut Praline Latte to Bahria Orchard",
    tone: "espresso",
  },
];

/**
 * Build the closed-mode rotating messages from the live store state.
 * The set is small and honest — no fictional "brewing now" lines, no
 * "147 cups served" stats that would contradict the closed banner.
 */
function buildClosedUpdates(
  next: { dayLabel: string; time: string } | null,
): Update[] {
  const updates: Update[] = [
    {
      icon: PowerOff,
      text: "Komal's is closed right now",
      tone: "red",
    },
  ];
  if (next) {
    updates.push({
      icon: Timer,
      text: `Reopens ${next.dayLabel} at ${next.time}`,
      tone: "cream",
    });
  }
  updates.push(
    {
      icon: MessageCircle,
      text: "Message Komal on WhatsApp to plan ahead",
      tone: "green",
    },
    {
      icon: Instagram,
      text: "Catch us on @komals.coffee in the meantime",
      tone: "caramel",
    },
  );
  return updates;
}

/**
 * Honest live-activity strip below the hero.
 *
 *  • Open  → rotates the lively "brewing 3 orders, last delivered to..."
 *           messages with a pulsing GREEN dot.
 *  • Closed → rotates closed-aware messages ("Reopens tomorrow at 11 AM"),
 *           pulsing RED dot, "Closed" label. Never claims activity that
 *           is not happening — the closed banner already tells customers
 *           the store is shut.
 */
export default function LiveTicker({
  isOpen,
  next = null,
}: {
  isOpen: boolean;
  next?: { dayLabel: string; time: string } | null;
}) {
  const updates = useMemo(
    () => (isOpen ? OPEN_UPDATES : buildClosedUpdates(next)),
    [isOpen, next],
  );

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  // Reset to the first message whenever the open/closed state flips, so
  // a customer who just landed during after-hours doesn't see a stale
  // "brewing now" message before the first interval kicks in.
  useEffect(() => {
    setIndex(0);
    setPhase("in");
  }, [isOpen]);

  useEffect(() => {
    // Short, subtle text crossfade; pauses when the tab is hidden so we
    // never waste cycles on a backgrounded tab.
    const tick = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setPhase("out");
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % updates.length);
        setPhase("in");
      }, 360);
    }, 3600);
    return () => window.clearInterval(tick);
  }, [updates.length]);

  const current = updates[index];
  const Icon = current.icon;
  const label = isOpen ? "Live" : "Closed";
  const dotColor = isOpen ? "bg-green-400" : "bg-red-400";

  return (
    <section
      aria-label={isOpen ? "Live activity" : "Store closed"}
      className="relative overflow-hidden border-y border-espresso-100 bg-espresso-900 py-4 text-cream-50"
    >
      <div className="container-base flex items-center justify-center gap-3">
        {/* Status dot — colour matches the actual store state. */}
        <span className="relative inline-flex h-2 w-2 shrink-0">
          <span
            className={cn(
              "absolute inset-0 animate-ping rounded-full opacity-75",
              dotColor,
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              dotColor,
            )}
          />
        </span>
        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.3em] text-cream-100/70 sm:inline">
          {label}
        </span>

        <div
          key={index}
          aria-live="polite"
          className={cn(
            "flex min-w-0 items-center gap-2 transition-all duration-300 will-change-[transform,opacity]",
          )}
          style={{
            transform:
              phase === "in" ? "translate3d(0,0,0)" : "translate3d(0,8px,0)",
            opacity: phase === "in" ? 1 : 0,
          }}
        >
          <Icon
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              current.tone === "caramel" && "text-caramel-400",
              current.tone === "espresso" && "text-cream-100",
              current.tone === "green" && "text-green-400",
              current.tone === "red" && "text-red-400",
              current.tone === "cream" && "text-cream-50",
            )}
          />
          <span className="truncate text-sm text-cream-100">
            {current.text}
          </span>
        </div>
      </div>
    </section>
  );
}
