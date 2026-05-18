"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
};

export default function CategoriesManager({
  initial,
}: {
  initial: Category[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Partial<Category>>({
    slug: "",
    name: "",
    description: "",
    sort_order: 0,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(c: Category) {
    setEditingId(c.id);
    setDraft({ ...c });
  }
  function startCreate() {
    setEditingId("new");
    setDraft({ slug: "", name: "", description: "", sort_order: 0 });
  }
  function cancel() {
    setEditingId(null);
    setDraft({});
    setError(null);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const isNew = editingId === "new";
      const res = await fetch(
        isNew
          ? "/api/admin/categories"
          : `/api/admin/categories/${editingId}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...draft,
            sort_order: Number(draft.sort_order) || 0,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Save failed");
      cancel();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function destroy(id: string) {
    if (
      !confirm(
        "Delete this category? Products under it will lose their category.",
      )
    )
      return;
    setBusy(true);
    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {editingId === null && (
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-full bg-espresso-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 active:translate-y-0 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" /> Add category
        </button>
      )}

      {editingId !== null && (
        <div className="card space-y-3 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              placeholder="Name"
              value={draft.name ?? ""}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="input"
            />
            <input
              placeholder="slug (lowercase-with-hyphens)"
              value={draft.slug ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]+/g, "-")
                    .replace(/^-|-$/g, ""),
                })
              }
              className="input font-mono text-xs"
            />
            <input
              type="number"
              placeholder="Sort"
              value={draft.sort_order ?? 0}
              onChange={(e) =>
                setDraft({ ...draft, sort_order: Number(e.target.value) })
              }
              className="input tabular-nums"
            />
          </div>
          <textarea
            placeholder="Description"
            rows={2}
            value={draft.description ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
            className="input resize-none"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={busy || !draft.name || !draft.slug}
              className="inline-flex items-center gap-2 rounded-full bg-espresso-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editingId === "new" ? "Create" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="inline-flex items-center gap-2 rounded-full border border-espresso-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-espresso-600 transition-colors hover:border-espresso-700 hover:bg-espresso-700 hover:text-cream-50"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <ul className="divide-y divide-espresso-100">
          {initial.map((c) => (
            <li
              key={c.id}
              className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="font-display text-base text-espresso-800">
                  {c.name}
                </p>
                <p className="truncate text-xs text-espresso-400">
                  /{c.slug} · sort {c.sort_order}
                </p>
                {c.description && (
                  <p className="mt-1 truncate text-xs text-espresso-500">
                    {c.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-espresso-200 text-espresso-700 transition-all duration-150 hover:bg-espresso-700 hover:text-cream-50 active:scale-90"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => destroy(c.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-espresso-200 text-espresso-700 transition-all duration-150 hover:border-red-300 hover:bg-red-500 hover:text-white active:scale-90"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
