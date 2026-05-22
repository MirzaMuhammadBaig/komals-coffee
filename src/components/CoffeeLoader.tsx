import { cn } from "@/lib/utils";

/**
 * Komal's coffee-cup loader.
 *
 * A hand-illustrated mug that gently bobs while fresh coffee rises and
 * sloshes inside it, three steam wisps curl off the rim, and a row of
 * coffee beans pulses below. Pure SVG + CSS keyframes — no images, no
 * JS — so it is featherweight and works inside Server Components (route
 * `loading.tsx` files) as well as client overlays.
 *
 *  • delayed     — stays invisible for ~280ms, then fades in. A fast
 *                  page render beats the delay, so the loader never
 *                  flashes; only a genuinely slow load ever shows it.
 *  • fullScreen  — a fixed, full-viewport cream overlay.
 */
export default function CoffeeLoader({
  size = 132,
  fullScreen = false,
  delayed = false,
  className,
}: {
  /** SVG width in px. Height scales with it. */
  size?: number;
  fullScreen?: boolean;
  delayed?: boolean;
  className?: string;
}) {
  const cup = (
    <div className="flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size * 1.18}
        viewBox="0 0 140 170"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          {/* Coffee — lighter at the surface, deeper down. */}
          <linearGradient id="kc-coffee" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a3622a" />
            <stop offset="100%" stopColor="#3a2417" />
          </linearGradient>
          {/* The mug interior — clips the coffee to a cup shape. */}
          <clipPath id="kc-cup-inside">
            <path d="M52 61 L57 114 Q59 120 70 120 Q81 120 83 114 L88 61 Z" />
          </clipPath>
        </defs>

        {/* Soft contact shadow on the counter. */}
        <ellipse cx="70" cy="146" rx="33" ry="7" fill="#c39a7e" opacity="0.4" />

        {/* Steam — three wisps curling off the rim, staggered. */}
        {[
          { x: 57, y: 56, delay: "0s" },
          { x: 70, y: 52, delay: "0.55s" },
          { x: 83, y: 56, delay: "1.05s" },
        ].map((s) => (
          <g key={s.x} transform={`translate(${s.x} ${s.y})`}>
            <path
              d="M0 0 C-6 -9 6 -15 0 -24 C-6 -33 6 -39 0 -46"
              stroke="#9c6f53"
              strokeWidth="5"
              strokeLinecap="round"
              style={{
                animation: "steamRise 2.8s ease-in-out infinite",
                animationDelay: s.delay,
              }}
            />
          </g>
        ))}

        {/* The cup — bobs as one unit. */}
        <g style={{ animation: "cupBob 3s ease-in-out infinite" }}>
          {/* Handle (behind the body so the join is hidden). */}
          <path
            d="M93 73 C115 74 116 77 116 90 C116 104 110 107 92 108"
            stroke="#28180f"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Mug body fill. */}
          <path
            d="M46 60 L52 116 Q54 123 70 123 Q86 123 88 116 L94 60 Z"
            fill="#f5e9d6"
          />

          {/* Coffee — rises and sloshes inside the clipped interior. */}
          <g clipPath="url(#kc-cup-inside)">
            <g
              style={{
                animation: "cupFill 2s ease-in-out infinite alternate",
              }}
            >
              <rect
                x="48"
                y="64"
                width="44"
                height="68"
                fill="url(#kc-coffee)"
              />
              <ellipse cx="70" cy="64" rx="18" ry="4" fill="#e0a364" />
            </g>
          </g>

          {/* Mug walls + bottom outline (over the coffee edges). */}
          <path
            d="M46 60 L52 116 Q54 123 70 123 Q86 123 88 116 L94 60"
            stroke="#28180f"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Glossy highlight down the cup. */}
          <path
            d="M55 71 Q52 88 59 106"
            stroke="#fbf6ef"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            opacity="0.55"
          />

          {/* Rim. */}
          <ellipse
            cx="70"
            cy="60"
            rx="25"
            ry="7"
            stroke="#28180f"
            strokeWidth="4"
            fill="none"
          />
          <ellipse
            cx="70"
            cy="60"
            rx="19.5"
            ry="4.6"
            stroke="#fbf6ef"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
        </g>
      </svg>

      {/* A row of beans pulsing in sequence. */}
      <div className="mt-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            width="15"
            height="15"
            viewBox="0 0 16 16"
            aria-hidden="true"
            style={{
              animation: "loaderBean 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.18}s`,
            }}
          >
            <g transform="rotate(-40 8 8)">
              <ellipse cx="8" cy="8" rx="6.6" ry="4.3" fill="#a3622a" />
              <path
                d="M3.5 8 C6 5.2 10 10.8 12.5 8"
                stroke="#f5e9d6"
                strokeWidth="1.3"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>
        ))}
      </div>

      <span className="sr-only">Loading</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "fixed inset-0 z-[95] grid place-items-center bg-cream-50",
          delayed && "loader-delayed",
          className,
        )}
      >
        {cup}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(delayed && "loader-delayed", className)}
    >
      {cup}
    </div>
  );
}
