"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "fade" | "zoom";

type Props = {
  children: ReactNode;
  /** Where the element comes from. Default: up. */
  direction?: Direction;
  /** Delay in ms before the animation starts. Useful for staggers. */
  delay?: number;
  /** Animation duration in ms. */
  duration?: number;
  /** How much of the element must be visible to trigger (0–1). */
  threshold?: number;
  /** If false, the animation replays whenever the element re-enters view. */
  once?: boolean;
  /** Distance to travel during the slide (in px). */
  distance?: number;
  className?: string;
};

/**
 * Industry-standard scroll-reveal wrapper:
 *  - Uses IntersectionObserver (one observer per element, GC-friendly).
 *  - Honours prefers-reduced-motion → renders the final state immediately.
 *  - GPU-accelerated transforms only.
 *  - Pass `delay` to stagger groups (200ms per card looks great).
 */
export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 700,
  threshold = 0.15,
  once = true,
  distance = 28,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) io.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold]);

  const offset =
    direction === "up"
      ? `translate3d(0, ${distance}px, 0)`
      : direction === "down"
        ? `translate3d(0, -${distance}px, 0)`
        : direction === "left"
          ? `translate3d(${distance}px, 0, 0)`
          : direction === "right"
            ? `translate3d(-${distance}px, 0, 0)`
            : direction === "zoom"
              ? "scale(0.95)"
              : "none";

  return (
    <div
      ref={ref}
      className={cn("will-change-[transform,opacity]", className)}
      style={{
        transform: visible ? "translate3d(0,0,0) scale(1)" : offset,
        opacity: visible ? 1 : 0,
        transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, opacity ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
