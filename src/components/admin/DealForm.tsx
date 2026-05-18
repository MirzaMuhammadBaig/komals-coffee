"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export type DealFormValues = {
  id?: string;
  title: string;
  description: string;
  badge: string;
  image_url: string;
  discount_pkr: number | null;
  discount_percent: number | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  sort_order: number;
};

export default function DealForm({
  initial,
  mode,
}: {
  initial: DealFormValues;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...v,
        discount_pkr: v.discount_pkr ? Number(v.discount_pkr) : null,
        discount_percent: v.discount_percent
          ? Number(v.discount_percent)
          : null,
        sort_order: Number(v.sort_order) || 0,
        valid_from: v.valid_from ? new Date(v.valid_from).toISOString() : null,
        valid_until: v.valid_until
          ? new Date(v.valid_until).toISOString()
          : null,
      };
      const url =
        mode === "create" ? "/api/admin/deals" : `/api/admin/deals/${v.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Save failed");
      router.push("/admin/deals");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="card space-y-5 p-6">
        <h3 className="font-display text-lg text-espresso-800">Deal</h3>

        <Field label="Title" required>
          <input
            required
            value={v.title}
            onChange={(e) => setV({ ...v, title: e.target.value })}
            className="input"
            placeholder="Buy one, get one half off"
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={3}
            value={v.description}
            onChange={(e) => setV({ ...v, description: e.target.value })}
            className="input resize-none"
            placeholder="What the deal is, terms, who can use it"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Badge text">
            <input
              value={v.badge}
              onChange={(e) => setV({ ...v, badge: e.target.value })}
              className="input"
              placeholder="LIMITED · WEEKEND ONLY"
            />
          </Field>
          <Field label="Sort order">
            <input
              type="number"
              value={v.sort_order}
              onChange={(e) =>
                setV({ ...v, sort_order: Number(e.target.value) })
              }
              className="input tabular-nums"
            />
          </Field>
        </div>

        <Field label="Image URL">
          <input
            type="url"
            value={v.image_url}
            onChange={(e) => setV({ ...v, image_url: e.target.value })}
            className="input"
            placeholder="https://…"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Discount (PKR)">
            <input
              type="number"
              value={v.discount_pkr ?? ""}
              onChange={(e) =>
                setV({
                  ...v,
                  discount_pkr: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="input tabular-nums"
            />
          </Field>
          <Field label="Discount (%)">
            <input
              type="number"
              min={1}
              max={100}
              value={v.discount_percent ?? ""}
              onChange={(e) =>
                setV({
                  ...v,
                  discount_percent: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              className="input tabular-nums"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Valid from">
            <input
              type="datetime-local"
              value={v.valid_from}
              onChange={(e) => setV({ ...v, valid_from: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Valid until">
            <input
              type="datetime-local"
              value={v.valid_until}
              onChange={(e) => setV({ ...v, valid_until: e.target.value })}
              className="input"
            />
          </Field>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="card p-6">
          <h3 className="font-display text-lg text-espresso-800">Status</h3>
          <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl border border-espresso-100 bg-white px-4 py-3 transition-colors hover:border-espresso-200">
            <div>
              <p className="text-sm font-semibold text-espresso-800">Active</p>
              <p className="text-xs text-espresso-400">
                Visible to customers.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={v.is_active}
              onClick={() => setV({ ...v, is_active: !v.is_active })}
              className={
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 " +
                (v.is_active ? "bg-caramel-500" : "bg-espresso-200")
              }
            >
              <span
                className={
                  "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 " +
                  (v.is_active ? "translate-x-5" : "translate-x-0.5")
                }
              />
            </button>
          </label>
        </section>
        {v.image_url && (
          <section className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v.image_url} alt="Preview" className="w-full" />
          </section>
        )}
        {error && (
          <p className="card border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso-700 px-5 py-3 text-sm font-semibold uppercase tracking-wider text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : mode === "create" ? (
            "Create deal"
          ) : (
            "Save changes"
          )}
        </button>
      </aside>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-500">
        {label}
        {required && <span className="ml-1 text-caramel-600">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
