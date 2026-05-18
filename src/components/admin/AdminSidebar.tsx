"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee as Logo, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNavSections } from "@/components/admin/nav";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-espresso-100 bg-cream-50 lg:sticky lg:top-0 lg:flex">
      <Link
        href="/admin"
        className="flex items-center gap-2 border-b border-espresso-100 px-6 py-5"
      >
        <Logo className="h-6 w-6 text-caramel-500" strokeWidth={1.6} />
        <div className="flex flex-col leading-none">
          <span className="font-script text-xl text-caramel-600">
            Komal&apos;s
          </span>
          <span className="-mt-0.5 text-[10px] uppercase tracking-[0.35em] text-espresso-500">
            Admin
          </span>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {adminNavSections.map((sec) => (
          <div key={sec.heading} className="mb-5">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
              {sec.heading}
            </p>
            <ul className="space-y-0.5">
              {sec.items.map((it) => {
                const active =
                  pathname === it.href ||
                  (it.href !== "/admin" && pathname.startsWith(it.href));
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-150",
                        active
                          ? "bg-espresso-700 text-cream-50 shadow-sm"
                          : "text-espresso-700 hover:bg-cream-100 hover:text-espresso-900",
                      )}
                    >
                      <it.icon
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          active
                            ? "text-caramel-300"
                            : "text-espresso-400 group-hover:text-espresso-700 group-hover:scale-110",
                        )}
                      />
                      <span className="font-medium">{it.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-espresso-100 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-espresso-500 transition-colors hover:bg-cream-100 hover:text-espresso-800"
        >
          <span>View live site</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}
