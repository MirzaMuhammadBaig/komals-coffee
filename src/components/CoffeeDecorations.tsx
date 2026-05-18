/**
 * Decorative coffee bean + steam SVGs for the hero. Positioned absolutely.
 * Pure CSS animations — no JS, no scroll listeners.
 * Hidden from screen readers and pointer events.
 */
export default function CoffeeDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Floating coffee beans */}
      <Bean className="absolute left-[6%] top-[18%] h-10 w-10 animate-float text-caramel-400/70" />
      <Bean
        className="absolute right-[12%] top-[28%] h-7 w-7 animate-float text-caramel-300/60"
        style={{ animationDelay: "1.4s" }}
        rotate={-20}
      />
      <Bean
        className="absolute left-[14%] bottom-[18%] h-8 w-8 animate-float text-caramel-400/60"
        style={{ animationDelay: "2.6s" }}
        rotate={32}
      />
      <Bean
        className="absolute right-[8%] bottom-[14%] h-9 w-9 animate-float text-caramel-300/55"
        style={{ animationDelay: "3.8s" }}
        rotate={-12}
      />
      <Bean
        className="hidden lg:block absolute left-[42%] top-[8%] h-6 w-6 animate-float text-caramel-400/40"
        style={{ animationDelay: "2.2s" }}
        rotate={48}
      />
      <Bean
        className="hidden lg:block absolute right-[35%] bottom-[22%] h-7 w-7 animate-float text-caramel-300/45"
        style={{ animationDelay: "0.9s" }}
        rotate={-30}
      />

      {/* Steam wisps rising at the top-right */}
      <SteamWisp className="absolute right-[16%] top-0 h-32 w-12 animate-steam opacity-50" />
      <SteamWisp
        className="absolute right-[24%] top-0 h-28 w-10 animate-steam opacity-30"
        style={{ animationDelay: "1.6s" }}
      />
    </div>
  );
}

function Bean({
  className,
  rotate = 0,
  style,
}: {
  className?: string;
  rotate?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 40 56"
      fill="none"
      className={className}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      {/* Outer bean body */}
      <path
        d="M20 2C28 2 36 12 36 28C36 44 28 54 20 54C12 54 4 44 4 28C4 12 12 2 20 2Z"
        fill="currentColor"
      />
      {/* Center crease */}
      <path
        d="M20 4C18 12 18 44 20 52"
        stroke="rgba(40, 24, 15, 0.55)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SteamWisp({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 80"
      fill="none"
      className={className}
      style={style}
    >
      <path
        d="M12 78 C 4 60 20 50 12 32 C 4 14 20 8 12 0"
        stroke="rgba(245, 233, 214, 0.45)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
