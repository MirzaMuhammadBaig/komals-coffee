"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Subtle "scroll to explore" cue at the bottom of the hero.
 * Auto-hides once the user has scrolled past a small threshold.
 */
export default function ScrollIndicator() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function onScroll() {
      setHidden(window.scrollY > 120);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={hidden}
      className={cn(
        "pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-cream-100/70 transition-opacity duration-500 sm:flex",
        hidden ? "opacity-0" : "opacity-100",
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.35em]">
        Scroll to explore
      </span>
      <span className="flex h-9 w-6 items-start justify-center rounded-full border border-cream-100/30 p-1">
        <span className="block h-2 w-1 animate-bounce rounded-full bg-caramel-400" />
      </span>
      <ChevronDown
        className="h-3 w-3 animate-bounce text-caramel-400"
        style={{ animationDelay: "0.2s" }}
      />
    </div>
  );
}
