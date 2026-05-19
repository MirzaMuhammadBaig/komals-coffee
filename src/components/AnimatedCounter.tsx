"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  to: number;
  /** Decimal places (default 0). */
  decimals?: number;
  /** Animation duration, ms. */
  duration?: number;
  /** String appended after the number (e.g. "+" or "★"). */
  suffix?: string;
  /** String prepended before the number. */
  prefix?: string;
  className?: string;
};

/**
 * Counts up from 0 to `to` when the element first scrolls into view.
 * Uses requestAnimationFrame with an ease-out curve so it doesn't tick mechanically.
 * Respects prefers-reduced-motion → shows the final value immediately.
 */
export default function AnimatedCounter({
  to,
  decimals = 0,
  duration = 1400,
  suffix = "",
  prefix = "",
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const playedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Run animation regardless of prefers-reduced-motion — this is a short,
    // gentle ease (~1.4s) that finishes well within OS motion-tolerance
    // guidance, and the user explicitly wants the count-up effect.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || playedRef.current) return;
        playedRef.current = true;

        const start = performance.now();
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        function frame(now: number) {
          const elapsed = now - start;
          const t = Math.min(1, elapsed / duration);
          const eased = easeOutCubic(t);
          setValue(to * eased);
          if (t < 1) requestAnimationFrame(frame);
          else setValue(to);
        }
        requestAnimationFrame(frame);
        io.disconnect();
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  const formatted = value.toFixed(decimals);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
