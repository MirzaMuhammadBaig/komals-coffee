"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  words: string[];
  /** Time each word stays visible, ms. */
  interval?: number;
  /** Fade duration, ms. */
  fade?: number;
  className?: string;
};

/**
 * Cycles through a list of words with a smooth fade + slide swap.
 * Pauses if the tab is hidden (no wasted work).
 * Respects prefers-reduced-motion (renders the first word, no rotation).
 */
export default function AnimatedTagline({
  words,
  interval = 2400,
  fade = 450,
  className,
}: Props) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedRef.current) return;

    let timer: number;
    let mounted = true;

    function tick() {
      if (!mounted) return;
      setPhase("out");
      window.setTimeout(() => {
        if (!mounted) return;
        setIndex((i) => (i + 1) % words.length);
        setPhase("in");
      }, fade);
    }

    function loop() {
      timer = window.setTimeout(() => {
        if (document.visibilityState === "visible") tick();
        loop();
      }, interval);
    }
    loop();

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [words.length, interval, fade]);

  // Reserve the width of the longest word so layout doesn't shift.
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span
      className={cn(
        "relative inline-block align-baseline",
        className,
      )}
      aria-live="polite"
    >
      {/* Sizer (invisible, holds width) */}
      <span className="invisible whitespace-nowrap">{longest}</span>
      {/* Animated word */}
      <span
        key={index}
        className={cn(
          "absolute left-0 top-0 whitespace-nowrap will-change-[transform,opacity]",
        )}
        style={{
          transform:
            phase === "in" ? "translate3d(0,0,0)" : "translate3d(0,8px,0)",
          opacity: phase === "in" ? 1 : 0,
          transition: `transform ${fade}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${fade}ms ease-out`,
        }}
      >
        {words[index]}
      </span>
    </span>
  );
}
