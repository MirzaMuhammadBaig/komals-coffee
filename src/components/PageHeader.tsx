export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-espresso-100 bg-cream-100/60">
      <div className="container-base py-14 sm:py-20 lg:py-28">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl text-espresso-800 sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-base text-espresso-600 sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
