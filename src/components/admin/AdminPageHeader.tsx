import Link from "next/link";

type Action = {
  label: string;
  href?: string;
  onClickName?: string; // reserved
  icon?: React.ReactNode;
  primary?: boolean;
};

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions = [],
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: Action[];
}) {
  return (
    <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:pb-6">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-espresso-400 sm:text-[11px] sm:tracking-[0.2em]">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 break-words font-display text-xl text-espresso-800 sm:text-2xl lg:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-espresso-500">
            {description}
          </p>
        )}
      </div>
      {actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((a) =>
            a.href ? (
              <Link
                key={a.label}
                href={a.href}
                className={
                  a.primary
                    ? "inline-flex items-center gap-2 rounded-full bg-espresso-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 hover:shadow-md active:translate-y-0 active:scale-95"
                    : "inline-flex items-center gap-2 rounded-full border border-espresso-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-espresso-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-espresso-700 hover:bg-espresso-700 hover:text-cream-50 active:translate-y-0 active:scale-95"
                }
              >
                {a.icon}
                {a.label}
              </Link>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
