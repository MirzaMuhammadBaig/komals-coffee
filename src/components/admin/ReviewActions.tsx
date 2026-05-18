"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, StarOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReviewActions({
  id,
  isFeatured,
}: {
  id: string;
  isFeatured: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<"none" | "toggle" | "delete">("none");

  async function toggle() {
    setBusy("toggle");
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ is_featured: !isFeatured }),
      });
      startTransition(() => router.refresh());
    } finally {
      setBusy("none");
    }
  }
  async function destroy() {
    if (!confirm("Delete this review?")) return;
    setBusy("delete");
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      startTransition(() => router.refresh());
    } finally {
      setBusy("none");
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={busy !== "none" || pending}
        title={isFeatured ? "Unfeature" : "Feature on home"}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-150 active:scale-90 disabled:opacity-60",
          isFeatured
            ? "border-caramel-300 bg-caramel-500/15 text-caramel-700 hover:bg-caramel-500/25"
            : "border-espresso-200 bg-cream-100 text-espresso-400 hover:bg-espresso-200",
        )}
      >
        {busy === "toggle" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isFeatured ? (
          <Star className="h-3.5 w-3.5 fill-caramel-500" />
        ) : (
          <StarOff className="h-3.5 w-3.5" />
        )}
      </button>
      <button
        type="button"
        onClick={destroy}
        disabled={busy !== "none" || pending}
        title="Delete"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-espresso-200 text-espresso-700 transition-all duration-150 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-500 hover:text-white active:translate-y-0 active:scale-90"
      >
        {busy === "delete" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
