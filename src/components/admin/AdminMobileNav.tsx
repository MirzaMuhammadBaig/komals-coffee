"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee as Logo, ExternalLink, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNavSections } from "@/components/admin/nav";

/**
 * Hamburger button + slide-in nav drawer for screens below `lg`.
 *
 * The hamburger lives in the topbar, but the drawer overlay is PORTALED to
 * <body>. The topbar has `backdrop-blur`, and a `backdrop-filter` ancestor
 * makes `position: fixed` descendants size to that ancestor (~60px tall)
 * instead of the viewport — which collapsed the drawer. Portaling to body
 * escapes that containing block so `fixed inset-0` covers the full screen.
 */
export default function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // createPortal needs `document` — only available after the client mounts.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Body scroll lock + ESC to close.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-espresso-700 transition-colors hover:bg-cream-100 active:scale-90 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mounted &&
        createPortal(
          <div
            aria-hidden={!open}
            className={cn(
              "fixed inset-0 z-[70] lg:hidden",
              open ? "pointer-events-auto" : "pointer-events-none",
            )}
          >
            {/* Backdrop */}
            <button
              type="button"
              aria-label="Close menu"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className={cn(
                "absolute inset-0 cursor-default bg-espresso-900/55 backdrop-blur-sm transition-opacity duration-300",
                open ? "opacity-100" : "opacity-0",
              )}
            />

            {/* Panel */}
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation"
              className={cn(
                "absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-cream-50 shadow-2xl transition-transform duration-300 ease-out",
                open ? "translate-x-0" : "-translate-x-full",
              )}
            >
              <header className="flex shrink-0 items-center justify-between border-b border-espresso-100 px-5 py-4">
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Logo
                    className="h-6 w-6 text-caramel-500"
                    strokeWidth={1.6}
                  />
                  <div className="flex flex-col leading-none">
                    <span className="font-script text-xl text-caramel-600">
                      Komal&apos;s
                    </span>
                    <span className="-mt-0.5 text-[10px] uppercase tracking-[0.35em] text-espresso-500">
                      Admin
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-espresso-500 transition-all duration-150 hover:bg-cream-100 hover:text-espresso-700 active:scale-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
                {adminNavSections.map((sec) => (
                  <div key={sec.heading} className="mb-5">
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
                      {sec.heading}
                    </p>
                    <ul className="space-y-0.5">
                      {sec.items.map((it) => {
                        const active =
                          pathname === it.href ||
                          (it.href !== "/admin" &&
                            pathname.startsWith(it.href));
                        return (
                          <li key={it.href}>
                            <Link
                              href={it.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 active:scale-[0.98]",
                                active
                                  ? "bg-espresso-700 text-cream-50 shadow-sm"
                                  : "text-espresso-700 hover:bg-cream-100 hover:text-espresso-900",
                              )}
                            >
                              <it.icon
                                className={cn(
                                  "h-4 w-4",
                                  active
                                    ? "text-caramel-300"
                                    : "text-espresso-400",
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

              <div className="shrink-0 border-t border-espresso-100 p-3">
                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-espresso-500 transition-colors hover:bg-cream-100 hover:text-espresso-800"
                >
                  <span>View live site</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
