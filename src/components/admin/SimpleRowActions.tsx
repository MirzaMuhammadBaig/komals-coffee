"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable row actions: toggle is_active + edit link + delete.
 * Works for coupons, deals, reviews, etc.
 */
export default function SimpleRowActions({
  endpoint, // e.g. "/api/admin/coupons/abc-123"
  editHref, // e.g. "/admin/coupons/abc-123"
  isActive,
  confirmDelete = "Delete this item?",
  showActive = true,
}: {
  endpoint: string;
  editHref?: string;
  isActive?: boolean;
  confirmDelete?: string;
  showActive?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<"none" | "toggle" | "delete">("none");

  async function toggle() {
    setBusy("toggle");
    try {
      await fetch(endpoint, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      startTransition(() => router.refresh());
    } finally {
      setBusy("none");
    }
  }
  async function destroy() {
    if (!confirm(confirmDelete)) return;
    setBusy("delete");
    try {
      await fetch(endpoint, { method: "DELETE" });
      startTransition(() => router.refresh());
    } finally {
      setBusy("none");
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {showActive && (
        <button
          type="button"
          onClick={toggle}
          disabled={busy !== "none" || pending}
          title={isActive ? "Disable" : "Enable"}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-150 active:scale-90 disabled:opacity-60",
            isActive
              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              : "border-espresso-200 bg-cream-100 text-espresso-400 hover:bg-espresso-200",
          )}
        >
          {busy === "toggle" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isActive ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
        </button>
      )}
      {editHref && (
        <Link
          href={editHref}
          title="Edit"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-espresso-200 text-espresso-700 transition-all duration-150 hover:-translate-y-0.5 hover:bg-espresso-700 hover:text-cream-50 active:translate-y-0 active:scale-90"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Link>
      )}
      <button
        type="button"
        onClick={destroy}
        disabled={busy !== "none" || pending}
        title="Delete"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-espresso-200 text-espresso-700 transition-all duration-150 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-500 hover:text-white active:translate-y-0 active:scale-90 disabled:opacity-60"
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
