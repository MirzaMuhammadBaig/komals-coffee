"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Power, PowerOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StoreSettingsForm({
  initial,
}: {
  initial: {
    is_open: boolean;
    closed_reason: string;
    closed_until: string; // datetime-local value
  };
}) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...v,
        closed_until: v.closed_until
          ? new Date(v.closed_until).toISOString()
          : null,
        closed_reason: v.closed_reason || null,
      };
      const res = await fetch("/api/admin/store", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Save failed");
      setSavedAt(new Date().toLocaleTimeString("en-PK"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="card space-y-5 p-6">
        {/* Status toggle */}
        <div
          className={cn(
            "flex items-center gap-4 rounded-2xl border p-5 transition-colors",
            v.is_open
              ? "border-green-200 bg-green-50/60"
              : "border-red-200 bg-red-50/60",
          )}
        >
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              v.is_open ? "bg-green-500 text-white" : "bg-red-500 text-white",
            )}
          >
            {v.is_open ? <Power className="h-5 w-5" /> : <PowerOff className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <p className="font-display text-lg text-espresso-800">
              Store is currently {v.is_open ? "open" : "closed"}
            </p>
            <p className="text-xs text-espresso-500">
              {v.is_open
                ? "Customers can place orders normally."
                : "A banner appears on every page and orders are blocked."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setV({ ...v, is_open: !v.is_open })}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95",
              v.is_open
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700",
            )}
          >
            {v.is_open ? "Close store" : "Open store"}
          </button>
        </div>

        <Field label="Reason (shown on banner)">
          <input
            value={v.closed_reason}
            onChange={(e) => setV({ ...v, closed_reason: e.target.value })}
            className="input"
            placeholder="E.g. We are restocking ingredients."
            disabled={v.is_open}
          />
        </Field>

        <Field label="Reopening at (optional)">
          <input
            type="datetime-local"
            value={v.closed_until}
            onChange={(e) => setV({ ...v, closed_until: e.target.value })}
            className="input"
            disabled={v.is_open}
          />
        </Field>

        <p className="rounded-xl bg-cream-100/60 px-4 py-3 text-xs text-espresso-500">
          Looking for the site-wide announcement message? It now has its
          own page — <span className="font-semibold text-espresso-700">
          Configuration → Announcement</span>.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between">
          {savedAt && (
            <p className="text-xs text-espresso-400">Saved at {savedAt}</p>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-espresso-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save settings
          </button>
        </div>
      </section>

      <aside className="card space-y-4 p-6">
        <div>
          <h3 className="font-display text-lg text-espresso-800">
            What customers will see
          </h3>
          <p className="mt-1 text-xs text-espresso-500">
            Live preview of the banners shown at the very top of every page.
          </p>
        </div>

        {/* Closed banner — only while the store is closed. */}
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
            Closed banner
          </p>
          {v.is_open ? (
            <p className="rounded-2xl border border-dashed border-espresso-200 px-5 py-4 text-xs text-espresso-400">
              Store is open — this banner is hidden.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-espresso-900 px-5 py-4 text-sm text-cream-50">
              <p>
                <span className="font-semibold">
                  We are temporarily closed.
                </span>{" "}
                <span className="text-cream-100/80">
                  {v.closed_reason || "Komal is taking a short break."}
                  {v.closed_until && (
                    <>
                      {" "}
                      Reopens{" "}
                      {new Date(v.closed_until).toLocaleString("en-PK", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      .
                    </>
                  )}
                </span>
              </p>
            </div>
          )}
        </div>

      </aside>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-500">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
