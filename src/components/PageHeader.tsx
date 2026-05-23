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
      <div className="container-base py-10 sm:py-16 lg:py-28">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl text-espresso-800 sm:mt-4 sm:text-4xl md:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-sm text-espresso-600 sm:mt-5 sm:text-base lg:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
