"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import AddToCartButton from "@/components/AddToCartButton";
import { menu, menuCategories } from "@/lib/data/menu";
import { cn, formatPkr } from "@/lib/utils";

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  if (!lower.includes(q)) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    const idx = lower.indexOf(q, i);
    if (idx === -1) {
      parts.push(<Fragment key={key++}>{text.slice(i)}</Fragment>);
      break;
    }
    if (idx > i) {
      parts.push(<Fragment key={key++}>{text.slice(i, idx)}</Fragment>);
    }
    parts.push(
      <mark
        key={key++}
        className="rounded-sm bg-caramel-500/30 px-0.5 text-inherit"
      >
        {text.slice(idx, idx + q.length)}
      </mark>,
    );
    i = idx + q.length;
  }
  return <>{parts}</>;
}

export default function MenuExplorer() {
  const [query, setQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Read initial ?q= from the URL on mount (client-only — avoids hydration mismatch).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") ?? "";
    if (initial) setQuery(initial);
    setHydrated(true);
  }, []);

  // Mirror the query back to the URL without involving the Next router, so
  // typing never triggers a re-render of the page (which was wiping the input).
  useEffect(() => {
    if (!hydrated) return;
    const handle = window.setTimeout(() => {
      const url = new URL(window.location.href);
      const trimmed = query.trim();
      if (trimmed) url.searchParams.set("q", trimmed);
      else url.searchParams.delete("q");
      window.history.replaceState(window.history.state, "", url.toString());
    }, 200);
    return () => window.clearTimeout(handle);
  }, [query, hydrated]);

  // Keyboard: "/" focuses search, "Esc" clears + blurs.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const active = document.activeElement as HTMLElement | null;
      const inEditable =
        !!active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable);

      if (e.key === "/" && !inEditable) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (e.key === "Escape" && active === inputRef.current) {
        if (query) {
          e.preventDefault();
          setQuery("");
        } else {
          inputRef.current?.blur();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [query]);

  const q = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!q) return menu;
    return menu.filter((m) => {
      const haystack = [m.name, m.description, m.category, ...(m.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [q]);

  const groups = useMemo(
    () =>
      menuCategories
        .map((cat) => ({
          ...cat,
          items: matches.filter((m) => m.category === cat.slug),
        }))
        .filter((g) => g.items.length > 0),
    [matches],
  );

  const totalMatches = matches.length;

  return (
    <>
      <section className="sticky top-20 z-30 border-b border-espresso-100 bg-cream-50/90 backdrop-blur">
        <div className="container-base flex flex-col gap-3 py-4 sm:py-5">
          {/* Search input */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="search"
              role="searchbox"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search drinks by name, flavour or tag..."
              aria-label="Search drinks"
              aria-controls="menu-results"
              enterKeyHint="search"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-full border border-espresso-100 bg-white py-3 pl-11 pr-12 text-sm text-espresso-800 transition-all duration-200 placeholder:text-espresso-300 hover:border-espresso-200 focus:border-espresso-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-caramel-400/40 sm:pr-20"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-espresso-400 transition-all duration-150 hover:bg-cream-100 hover:text-espresso-700 active:scale-90"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd
                aria-hidden
                className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 items-center rounded border border-espresso-100 bg-cream-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-espresso-500 sm:inline-flex"
                title="Press / to focus"
              >
                /
              </kbd>
            )}
          </div>

          {/* Category chips with live match counts */}
          <div className="flex flex-wrap gap-2">
            {menuCategories.map((c) => {
              const count = matches.filter((m) => m.category === c.slug).length;
              const dim = q !== "" && count === 0;
              return (
                <a
                  key={c.slug}
                  href={dim ? undefined : `#${c.slug}`}
                  aria-disabled={dim || undefined}
                  className={cn(
                    "group inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-200",
                    dim
                      ? "cursor-not-allowed border-espresso-100 text-espresso-300 opacity-50"
                      : "border-espresso-100 text-espresso-600 hover:-translate-y-0.5 hover:border-espresso-700 hover:bg-espresso-700 hover:text-cream-50 hover:shadow-md active:translate-y-0 active:scale-95",
                  )}
                >
                  <span>{c.name}</span>
                  {q && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-[10px] tabular-nums transition-colors",
                        dim
                          ? "bg-espresso-100 text-espresso-300"
                          : "bg-cream-100 text-espresso-500 group-hover:bg-cream-50/20 group-hover:text-cream-50",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </a>
              );
            })}
          </div>

          {/* Live match summary (announced to screen readers) */}
          <p
            role="status"
            aria-live="polite"
            className={cn(
              "text-xs text-espresso-500 transition-opacity",
              q ? "opacity-100" : "h-0 overflow-hidden opacity-0",
            )}
          >
            {q && (
              <>
                {totalMatches}{" "}
                {totalMatches === 1 ? "drink matches" : "drinks match"}{" "}
                <span className="font-semibold text-espresso-700">
                  &ldquo;{query}&rdquo;
                </span>
              </>
            )}
          </p>
        </div>
      </section>

      <section
        id="menu-results"
        className="pb-14 pt-10 sm:pb-20 sm:pt-12 lg:pb-28"
      >
        <div className="container-base space-y-24">
          {groups.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-espresso-200 bg-cream-100/40 px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-100 text-espresso-400">
                <Search className="h-6 w-6" />
              </div>
              <p className="mt-5 font-display text-2xl text-espresso-800">
                No drinks match &ldquo;{query}&rdquo;.
              </p>
              <p className="mt-3 text-espresso-600">
                Try a different name, a flavour like &ldquo;caramel&rdquo;, or
                clear the search to see everything.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-espresso-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 hover:shadow-md active:translate-y-0 active:scale-95"
              >
                <X className="h-3.5 w-3.5" /> Clear search
              </button>
            </div>
          ) : (
            groups.map((cat) => (
              <div key={cat.slug} id={cat.slug} className="scroll-mt-48">
                <div className="flex flex-col gap-3 border-b border-espresso-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow">{cat.name}</p>
                    <h2 className="mt-3 font-display text-4xl text-espresso-800">
                      {cat.name}
                    </h2>
                  </div>
                  <p className="max-w-md text-sm text-espresso-500">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/menu/${item.slug}`}
                      className="card-hoverable group block overflow-hidden active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
                    >
                      <div className="relative h-48 w-full overflow-hidden">
                        <SafeImage
                          src={item.image}
                          alt={item.name}
                          fill
                          className="img-zoom object-cover"
                          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        {item.signature && (
                          <span className="badge absolute left-4 top-4 bg-caramel-500 text-espresso-900 shadow-md transition-transform duration-300 group-hover:scale-105">
                            Signature
                          </span>
                        )}
                        {!item.signature && item.bestseller && (
                          <span className="badge absolute left-4 top-4 bg-espresso-700 text-cream-50 shadow-md transition-transform duration-300 group-hover:scale-105">
                            Bestseller
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-baseline justify-between gap-4">
                          <h3 className="font-display text-xl text-espresso-800 transition-colors duration-300 group-hover:text-caramel-700">
                            <Highlight text={item.name} query={query} />
                          </h3>
                          <span className="font-semibold text-espresso-700 transition-colors duration-300 group-hover:text-caramel-600">
                            {formatPkr(item.price)}
                          </span>
                        </div>
                        {item.size && (
                          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-espresso-400">
                            {item.size}
                          </p>
                        )}
                        <p className="mt-3 text-sm text-espresso-500">
                          <Highlight text={item.description} query={query} />
                        </p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.tags.map((t) => {
                              const tagMatched = q && t.toLowerCase().includes(q);
                              return (
                                <span
                                  key={t}
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors duration-300",
                                    tagMatched
                                      ? "bg-caramel-500/30 text-caramel-700"
                                      : "bg-cream-100 text-espresso-500 group-hover:bg-caramel-500/15 group-hover:text-caramel-700",
                                  )}
                                >
                                  {t}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <div className="mt-5 flex items-center justify-between border-t border-espresso-100 pt-4">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400 transition-colors duration-200 group-hover:text-caramel-600">
                            View details →
                          </span>
                          <AddToCartButton
                            slug={item.slug}
                            name={item.name}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
