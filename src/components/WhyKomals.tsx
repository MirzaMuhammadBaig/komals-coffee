import { Coffee, Truck, Heart, Shield } from "lucide-react";

const reasons = [
  {
    icon: Coffee,
    title: "Hand-made, every cup",
    body: "No factory blends, no auto-machines. Komal pulls every shot, froths every milk, draws every ribbon herself.",
  },
  {
    icon: Truck,
    title: "Door delivery, 30–45 min",
    body: "Insulated, sealed and warm. We deliver across Bahria Orchard and surrounding Lahore zones, with no compromise on temperature.",
  },
  {
    icon: Heart,
    title: "Hospitality you can taste",
    body: "Reorder once and Komal remembers your milk choice, sweetness, and the small notes. The kind of care chains can not match.",
  },
  {
    icon: Shield,
    title: "5.0★ on foodpanda",
    body: "Spotless reviews. We never filter feedback. What you read is what guests genuinely write after every order.",
  },
];

export default function WhyKomals() {
  return (
    <section className="section">
      <div className="container-base">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Why Komal&apos;s</p>
          <h2 className="mt-4 font-display text-4xl text-espresso-800 sm:text-5xl">
            A latte you would travel for,{" "}
            <em className="text-caramel-600">that comes to you.</em>
          </h2>
          <p className="mt-4 text-espresso-600">
            Komal&apos;s is built for people who care about what&apos;s in the
            cup. No shortcuts, no compromises.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="card-hoverable group relative flex h-full flex-col items-start overflow-hidden p-6 active:scale-[0.99] sm:p-7"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-caramel-500/0 blur-2xl transition-all duration-500 group-hover:bg-caramel-500/30" />
              <div className="relative rounded-2xl bg-caramel-500/15 p-3 text-caramel-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-caramel-500/30">
                <r.icon className="h-6 w-6" strokeWidth={1.6} />
              </div>
              <h3 className="relative mt-5 font-display text-xl text-espresso-800 transition-colors duration-300 group-hover:text-caramel-700">
                {r.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-espresso-500">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
