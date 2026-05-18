"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export type CouponFormValues = {
  id?: string;
  code: string;
  kind: "percent" | "flat";
  value: number;
  min_order_pkr: number;
  max_uses: number | null;
  starts_at: string; // local datetime-input value
  expires_at: string;
  is_active: boolean;
  notes: string;
};

export default function CouponForm({
  initial,
  mode,
}: {
  initial: CouponFormValues;
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
        code: v.code.trim().toUpperCase(),
        value: Number(v.value),
        min_order_pkr: Number(v.min_order_pkr) || 0,
        max_uses: v.max_uses ? Number(v.max_uses) : null,
        starts_at: v.starts_at ? new Date(v.starts_at).toISOString() : null,
        expires_at: v.expires_at ? new Date(v.expires_at).toISOString() : null,
      };
      const url =
        mode === "create"
          ? "/api/admin/coupons"
          : `/api/admin/coupons/${v.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Save failed");
      router.push("/admin/coupons");
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
        <h3 className="font-display text-lg text-espresso-800">Coupon</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Code" required>
            <input
              required
              value={v.code}
              onChange={(e) =>
                setV({
                  ...v,
                  code: e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9_-]/g, ""),
                })
              }
              placeholder="WELCOME10"
              className="input font-mono tracking-wider"
            />
          </Field>
          <Field label="Kind" required>
            <select
              value={v.kind}
              onChange={(e) =>
                setV({ ...v, kind: e.target.value as "percent" | "flat" })
              }
              className="input"
            >
              <option value="percent">Percentage off</option>
              <option value="flat">Flat PKR off</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={
              v.kind === "percent" ? "Value (%)" : "Value (PKR)"
            }
            required
          >
            <input
              type="number"
              required
              min={1}
              max={v.kind === "percent" ? 100 : 100000}
              value={v.value}
              onChange={(e) => setV({ ...v, value: Number(e.target.value) })}
              className="input tabular-nums"
            />
          </Field>
          <Field label="Minimum order (PKR)">
            <input
              type="number"
              min={0}
              value={v.min_order_pkr}
              onChange={(e) =>
                setV({ ...v, min_order_pkr: Number(e.target.value) })
              }
              className="input tabular-nums"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Max uses (blank = unlimited)">
            <input
              type="number"
              min={1}
              value={v.max_uses ?? ""}
              onChange={(e) =>
                setV({
                  ...v,
                  max_uses: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="input tabular-nums"
            />
          </Field>
          <Field label="Starts at (optional)">
            <input
              type="datetime-local"
              value={v.starts_at}
              onChange={(e) => setV({ ...v, starts_at: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Expires at (optional)">
            <input
              type="datetime-local"
              value={v.expires_at}
              onChange={(e) => setV({ ...v, expires_at: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <Field label="Internal notes">
          <textarea
            rows={2}
            value={v.notes}
            onChange={(e) => setV({ ...v, notes: e.target.value })}
            className="input resize-none"
            placeholder="What is this coupon for? Where was it shared?"
          />
        </Field>
      </section>

      <aside className="space-y-4">
        <section className="card p-6">
          <h3 className="font-display text-lg text-espresso-800">Status</h3>
          <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl border border-espresso-100 bg-white px-4 py-3 transition-colors hover:border-espresso-200">
            <div>
              <p className="text-sm font-semibold text-espresso-800">Active</p>
              <p className="text-xs text-espresso-400">
                Customers can redeem this coupon.
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
            "Create coupon"
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
