"use client";

import { useEffect, useState } from "react";
import { Coffee, Flame, MapPin, Sparkles, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

type Update = {
  icon: typeof Coffee;
  text: string;
  tone: "caramel" | "espresso" | "green";
};

const updates: Update[] = [
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

export default function LiveTicker() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    // Always rotate — short, subtle text crossfade; pauses when tab is hidden
    // so we never waste cycles on a backgrounded tab.
    const tick = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setPhase("out");
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % updates.length);
        setPhase("in");
      }, 360);
    }, 3600);
    return () => window.clearInterval(tick);
  }, []);

  const current = updates[index];
  const Icon = current.icon;

  return (
    <section
      aria-label="Live activity"
      className="relative overflow-hidden border-y border-espresso-100 bg-espresso-900 py-4 text-cream-50"
    >
      {/* Animated dot */}
      <div className="container-base flex items-center justify-center gap-3">
        <span className="relative inline-flex h-2 w-2 shrink-0">
          <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
        </span>
        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.3em] text-cream-100/70 sm:inline">
          Live
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
