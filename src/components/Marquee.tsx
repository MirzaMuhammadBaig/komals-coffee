const items = [
  "Hand-crafted specialty coffee",
  "Salted caramel signature",
  "Irish cream lattes",
  "Hazelnut praline",
  "Delivered warm & sealed",
  "5.0★ on foodpanda",
  "Made-to-order daily",
  "Lahore · Bahria Orchard",
];

export default function Marquee() {
  return (
    <div
      className="group relative overflow-hidden border-y border-espresso-100 bg-cream-100/60 py-4 sm:py-5"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
      }}
    >
      <div className="flex w-max animate-marquee gap-8 group-hover:[animation-play-state:paused] sm:gap-12">
        {[...items, ...items].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-8 font-display text-sm italic text-espresso-700 sm:gap-12 sm:text-lg"
          >
            <span className="cursor-default transition-colors duration-300 hover:text-caramel-700">
              {t}
            </span>
            <span className="text-caramel-500">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
