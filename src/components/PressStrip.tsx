const mentions = [
  { label: "5.0★ foodpanda", sub: "67 verified reviews" },
  { label: "@komals.coffee", sub: "575+ Instagram followers" },
  { label: "Bahria Orchard", sub: "Lahore home-based" },
  { label: "Made-to-order", sub: "By Komal Hassan" },
  { label: "30–45 min", sub: "Door delivery" },
];

export default function PressStrip() {
  return (
    <section className="border-y border-espresso-100 bg-cream-50">
      <div className="container-base grid grid-cols-2 gap-3 py-8 sm:grid-cols-3 sm:gap-4 sm:py-10 lg:grid-cols-5">
        {mentions.map((m) => (
          <div
            key={m.label}
            className="group flex cursor-default flex-col items-center rounded-2xl p-2.5 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-cream-100/60 sm:items-start sm:p-3 sm:text-left"
          >
            <span className="break-words font-display text-base text-espresso-800 transition-colors duration-300 group-hover:text-caramel-700 sm:text-xl">
              {m.label}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-espresso-400 transition-colors duration-300 group-hover:text-espresso-600 sm:text-xs sm:tracking-[0.2em]">
              {m.sub}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
