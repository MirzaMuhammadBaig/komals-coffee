"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
] as const;

const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
] as const;

export default function OrderStatusControls({
  orderId,
  initialStatus,
  initialPaymentStatus,
}: {
  orderId: string;
  initialStatus: string;
  initialPaymentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [saving, setSaving] = useState<"none" | "status" | "payment">("none");
  const [error, setError] = useState<string | null>(null);

  async function update(
    field: "status" | "payment_status",
    value: string,
    which: "status" | "payment",
  ) {
    setSaving(which);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Update failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving("none");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
          Order status
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUSES.map((s) => {
            const active = status === s.value;
            return (
              <button
                key={s.value}
                type="button"
                disabled={saving !== "none"}
                onClick={() => {
                  setStatus(s.value);
                  update("status", s.value, "status");
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-150 active:scale-95 disabled:opacity-60",
                  active
                    ? "bg-espresso-700 text-cream-50 shadow-sm"
                    : "border border-espresso-200 bg-white text-espresso-700 hover:-translate-y-0.5 hover:border-espresso-700 hover:bg-espresso-700 hover:text-cream-50",
                )}
              >
                {saving === "status" && active && (
                  <Loader2 className="mr-1 inline-block h-3 w-3 animate-spin" />
                )}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
          Payment status
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PAYMENT_STATUSES.map((s) => {
            const active = paymentStatus === s.value;
            return (
              <button
                key={s.value}
                type="button"
                disabled={saving !== "none"}
                onClick={() => {
                  setPaymentStatus(s.value);
                  update("payment_status", s.value, "payment");
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-150 active:scale-95 disabled:opacity-60",
                  active
                    ? "bg-caramel-600 text-cream-50 shadow-sm"
                    : "border border-espresso-200 bg-white text-espresso-700 hover:-translate-y-0.5 hover:border-caramel-500 hover:bg-caramel-500 hover:text-cream-50",
                )}
              >
                {saving === "payment" && active && (
                  <Loader2 className="mr-1 inline-block h-3 w-3 animate-spin" />
                )}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
