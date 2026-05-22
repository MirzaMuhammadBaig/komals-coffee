"use client";

import { useEffect, useState } from "react";
import CoffeeLoader from "@/components/CoffeeLoader";

/**
 * First-visit splash.
 *
 * Rendered into the very first HTML the browser receives, so it covers
 * the screen while the page paints and React hydrates. The moment the
 * app is interactive it removes itself.
 *
 * It carries `delayed`, so it is fully invisible for the first ~280ms —
 * if the site is ready before then (a fast load) the splash is removed
 * while still invisible and the visitor never sees it. Only a genuinely
 * slow first load ever reveals the cup.
 */
export default function InitialLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Runs right after hydration — the real page is already painted
    // underneath, so the splash can go. One frame lets that paint land.
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (ready) return null;
  return <CoffeeLoader fullScreen delayed />;
}
