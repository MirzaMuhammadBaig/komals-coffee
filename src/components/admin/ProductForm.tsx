"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export type ProductFormValues = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  price_pkr: number;
  size: string;
  image_url: string;
  category_id: string;
  tags: string;
  is_bestseller: boolean;
  is_signature: boolean;
  is_active: boolean;
  sort_order: number;
};

export default function ProductForm({
  initial,
  categories,
  mode,
}: {
  initial: ProductFormValues;
  categories: { id: string; name: string }[];
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ProductFormValues>(
    key: K,
    val: ProductFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...values,
        price_pkr: Number(values.price_pkr) || 0,
        sort_order: Number(values.sort_order) || 0,
        tags: values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const url =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${values.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Save failed");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <section className="card space-y-5 p-6">
          <h3 className="font-display text-lg text-espresso-800">Basics</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required>
              <input
                required
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Slug" required>
              <input
                required
                value={values.slug}
                onChange={(e) =>
                  update(
                    "slug",
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]+/g, "-")
                      .replace(/^-|-$/g, ""),
                  )
                }
                className="input font-mono text-xs"
                placeholder="auto-generated-from-name"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={3}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              className="input resize-none"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (PKR)" required>
              <input
                type="number"
                min={0}
                step={50}
                required
                value={values.price_pkr}
                onChange={(e) => update("price_pkr", Number(e.target.value))}
                className="input tabular-nums"
              />
            </Field>
            <Field label="Size">
              <input
                value={values.size}
                onChange={(e) => update("size", e.target.value)}
                placeholder="16oz"
                className="input"
              />
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                value={values.sort_order}
                onChange={(e) =>
                  update("sort_order", Number(e.target.value))
                }
                className="input tabular-nums"
              />
            </Field>
          </div>

          <Field label="Image URL">
            <input
              type="url"
              value={values.image_url}
              onChange={(e) => update("image_url", e.target.value)}
              placeholder="https://…"
              className="input"
            />
            {values.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.image_url}
                alt="Preview"
                className="mt-2 h-24 w-24 rounded-xl object-cover ring-1 ring-espresso-100"
              />
            )}
          </Field>

          <Field label="Tags (comma separated)">
            <input
              value={values.tags}
              onChange={(e) => update("tags", e.target.value)}
              placeholder="hot, signature, dairy-free"
              className="input"
            />
          </Field>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card space-y-4 p-6">
          <h3 className="font-display text-lg text-espresso-800">
            Organisation
          </h3>
          <Field label="Category" required>
            <select
              required
              value={values.category_id}
              onChange={(e) => update("category_id", e.target.value)}
              className="input"
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="space-y-2">
            <Toggle
              label="Active"
              hint="Visible to customers"
              checked={values.is_active}
              onChange={(v) => update("is_active", v)}
            />
            <Toggle
              label="Signature"
              hint="Show signature badge"
              checked={values.is_signature}
              onChange={(v) => update("is_signature", v)}
            />
            <Toggle
              label="Bestseller"
              hint="Featured on home + cards"
              checked={values.is_bestseller}
              onChange={(v) => update("is_bestseller", v)}
            />
          </div>
        </section>

        {error && (
          <p className="card border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso-700 px-5 py-3 text-sm font-semibold uppercase tracking-wider text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 hover:shadow-md active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : mode === "create" ? (
            "Create product"
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

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-espresso-100 bg-white px-4 py-3 transition-all duration-150 hover:border-espresso-200">
      <div>
        <p className="text-sm font-semibold text-espresso-800">{label}</p>
        {hint && <p className="text-xs text-espresso-400">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 " +
          (checked ? "bg-caramel-500" : "bg-espresso-200")
        }
      >
        <span
          className={
            "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 " +
            (checked ? "translate-x-5" : "translate-x-0.5")
          }
        />
      </button>
    </label>
  );
}
