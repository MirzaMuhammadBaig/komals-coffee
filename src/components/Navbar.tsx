"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "Our Story" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-espresso-100/60 bg-cream-50/85 backdrop-blur transition-shadow hover:shadow-sm">
      <div className="container-base flex h-20 items-center justify-between">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 font-display text-2xl font-bold text-espresso-700 transition-transform duration-300 hover:-translate-y-0.5 active:scale-95"
        >
          <Coffee
            className="h-6 w-6 text-caramel-500 transition-transform duration-500 group-hover:rotate-[14deg] sm:h-7 sm:w-7"
            strokeWidth={1.6}
          />
          <span className="flex flex-col leading-none">
            <span className="font-script text-xl text-caramel-600 transition-colors group-hover:text-caramel-500 sm:text-2xl">
              Komal&apos;s
            </span>
            <span className="-mt-1 text-[10px] uppercase tracking-[0.3em] text-espresso-500 transition-colors group-hover:text-espresso-700 sm:text-[11px] sm:tracking-[0.35em]">
              Coffee
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "link-underline text-sm font-medium tracking-wide transition-colors duration-200",
                  active
                    ? "text-espresso-900 after:scale-x-100 after:origin-left"
                    : "text-espresso-600 hover:text-espresso-900",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/order" className="btn-primary hidden md:inline-flex">
          Order now
        </Link>

        <button
          aria-label="Toggle navigation"
          className="rounded-full p-2 text-espresso-700 transition-all duration-200 hover:bg-cream-100 active:scale-90 md:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          <span
            className={cn(
              "block transition-transform duration-300",
              open ? "rotate-180" : "rotate-0",
            )}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </span>
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-espresso-100 bg-cream-50 transition-[max-height,opacity] duration-300 ease-out md:hidden",
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="container-base flex flex-col gap-1 py-3">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                  active
                    ? "bg-cream-100 text-espresso-900"
                    : "text-espresso-700 hover:bg-cream-100 hover:pl-5",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/order"
            onClick={() => setOpen(false)}
            className="btn-primary mx-1 mt-2 justify-center"
          >
            Order now
          </Link>
        </div>
      </div>
    </header>
  );
}
