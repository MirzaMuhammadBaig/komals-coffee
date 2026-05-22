"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Megaphone, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX = 160;

const SUGGESTIONS = [
  "Free delivery this weekend on orders over Rs 2,000!",
  "New on the menu: Pistachio Cream Latte — try it today.",
  "Eid Mubarak! Orders resume after the holidays.",
];

/**
 * The complete Announcement-banner editor. Saves only the announcement
 * text — through the dedicated /api/admin/announcement endpoint — so it
 * can never touch the store's open/closed state. Live preview, character
 * limit, and a one-click "remove banner".
 */
export default function AnnouncementForm({ initial }: { initial: string }) {
  const router = useRouter();
  const [text, setText] = useState(initial);
  /** The value currently persisted in the database. */
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const trimmed = text.trim();
  const isLive = saved.trim().length > 0;
  const dirty = trimmed !== saved.trim();

  async function persist(value: string): Promise<string> {
    const res = await fetch("/api/admin/announcement", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ announcement: value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? "Save failed");
    return typeof data.announcement === "string" ? data.announcement : "";
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      const result = await persist(trimmed);
      setSaved(result);
      setText(result);
      setSavedAt(new Date().toLocaleTimeString("en-PK"));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onRemove() {
    setRemoving(true);
    setError(null);
    try {
      await persist("");
      setSaved("");
      setText("");
      setSavedAt(new Date().toLocaleTimeString("en-PK"));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Remove failed");
    } finally {
      setRemoving(false);
    }
  }

  const busy = saving || removing;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* ---- Editor ---- */}
      <section className="card space-y-5 p-6">
        {/* Live status */}
        <div
          className={cn(
            "flex items-center gap-4 rounded-2xl border p-5",
            isLive
              ? "border-caramel-500/40 bg-caramel-500/10"
              : "border-espresso-100 bg-cream-100/50",
          )}
        >
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
              isLive
                ? "bg-caramel-500 text-espresso-900"
                : "bg-espresso-100 text-espresso-400",
            )}
          >
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg text-espresso-800">
              {isLive ? "Banner is live" : "No banner showing"}
            </p>
            <p className="text-xs text-espresso-500">
              {isLive
                ? "Customers see this message at the top of every page."
                : "Write a message below and publish it to show a banner."}
            </p>
          </div>
        </div>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-500">
            Banner message
          </span>
          <textarea
            rows={3}
            value={text}
            maxLength={MAX}
            onChange={(e) => setText(e.target.value)}
            className="input mt-1.5 resize-none"
            placeholder="E.g. Free delivery this weekend on orders over Rs 2,000!"
          />
          <div className="mt-1.5 flex items-center justify-between text-xs text-espresso-400">
            <span>Keep it short — it shows on one line across the site.</span>
            <span className={cn(text.length >= MAX && "text-caramel-700")}>
              {text.length}/{MAX}
            </span>
          </div>
        </label>

        {/* Quick suggestions */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
            Quick fill
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setText(s)}
                className="rounded-full border border-espresso-200 px-3 py-1.5 text-left text-xs text-espresso-600 transition-all duration-150 hover:border-caramel-500 hover:bg-caramel-500/10 hover:text-espresso-800 active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap items-center gap-3 border-t border-espresso-100 pt-5">
          <button
            type="button"
            onClick={onSave}
            disabled={busy || !dirty}
            className="inline-flex items-center gap-2 rounded-full bg-espresso-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {isLive ? "Update banner" : "Publish banner"}
          </button>

          {isLive && (
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-600 hover:text-white active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {removing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Remove banner
            </button>
          )}

          {savedAt && !dirty && (
            <p className="text-xs text-espresso-400">Saved at {savedAt}</p>
          )}
          {dirty && (
            <p className="text-xs text-caramel-700">Unsaved changes</p>
          )}
        </div>
      </section>

      {/* ---- Live preview ---- */}
      <aside className="card space-y-4 p-6">
        <div>
          <h3 className="font-display text-lg text-espresso-800">
            What customers will see
          </h3>
          <p className="mt-1 text-xs text-espresso-500">
            Exactly how the banner appears at the very top of every page.
          </p>
        </div>

        {/* Mini browser mock */}
        <div className="overflow-hidden rounded-2xl border border-espresso-100">
          {trimmed ? (
            <div className="flex items-center justify-center gap-2.5 bg-caramel-500 px-4 py-2.5 text-center text-sm font-medium text-espresso-900">
              <Megaphone className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="leading-snug">{trimmed}</span>
            </div>
          ) : (
            <div className="bg-cream-100 px-4 py-2.5 text-center text-xs text-espresso-400">
              No banner — the site starts straight at the navigation.
            </div>
          )}
          <div className="flex items-center gap-2 bg-cream-50 px-4 py-3">
            <span className="font-script text-lg text-caramel-600">
              Komal&apos;s
            </span>
            <span className="ml-auto flex gap-1.5">
              <span className="h-1.5 w-6 rounded-full bg-espresso-100" />
              <span className="h-1.5 w-6 rounded-full bg-espresso-100" />
              <span className="h-1.5 w-6 rounded-full bg-espresso-100" />
            </span>
          </div>
          <div className="h-12 bg-espresso-800" />
        </div>

        <p className="text-xs text-espresso-400">
          The banner is independent of the store status — it shows whether
          Komal&apos;s is open or closed.
        </p>
      </aside>
    </div>
  );
}
