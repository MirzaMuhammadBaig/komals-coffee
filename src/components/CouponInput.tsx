"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Tag, X } from "lucide-react";
import { cn, formatPkr } from "@/lib/utils";

export type AppliedCoupon = {
  code: string;
  discount_pkr: number;
};

/**
 * Coupon code input + apply/remove UX. Sends the typed code to
 * /api/coupons/validate together with the current subtotal so the
 * preview matches the server's eligibility rules exactly.
 *
 * Whenever `subtotal_pkr` drops (e.g. items removed), the applied
 * coupon re-validates automatically; if it no longer qualifies (e.g.
 * min_order_pkr not met), it is removed and the parent is told via
 * `onChange`.
 */
export default function CouponInput({
  subtotal_pkr,
  applied,
  onChange,
}: {
  subtotal_pkr: number;
  applied: AppliedCoupon | null;
  onChange: (next: AppliedCoupon | null) => void;
}) {
  const [code, setCode] = useState(applied?.code ?? "");
  const [state, setState] = useState<"idle" | "checking">("idle");
  const [error, setError] = useState<string | null>(null);

  // Re-validate the applied coupon whenever the subtotal changes
  // (item added/removed). Drop it silently if it no longer qualifies
  // so the customer isn't shown a stale "discount applied" line.
  useEffect(() => {
    if (!applied) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code: applied.code, subtotal_pkr }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.ok) {
          if (data.discount_pkr !== applied.discount_pkr) {
            onChange({ code: data.coupon.code, discount_pkr: data.discount_pkr });
          }
        } else {
          onChange(null);
          setError(data.message ?? "Code no longer applies.");
        }
      } catch {
        // Network blip — keep what we have rather than dropping it.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal_pkr]);

  async function onApply() {
    setState("checking");
    setError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, subtotal_pkr }),
      });
      const data = await res.json();
      if (data.ok) {
        onChange({ code: data.coupon.code, discount_pkr: data.discount_pkr });
        setCode(data.coupon.code);
      } else {
        setError(data.message ?? "Code is not valid.");
        onChange(null);
      }
    } catch {
      setError("Network problem. Try again.");
    } finally {
      setState("idle");
    }
  }

  function onRemove() {
    onChange(null);
    setCode("");
    setError(null);
  }

  if (applied) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50/60 p-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-cream-50">
              <Check className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-mono text-sm font-semibold tracking-wider text-green-800">
                {applied.code}
              </p>
              <p className="text-[11px] text-green-700">
                Saving {formatPkr(applied.discount_pkr)} on this order
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-8 items-center gap-1 rounded-full border border-green-300 px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-green-800 transition-colors hover:bg-green-100 active:scale-95"
          >
            <X className="h-3 w-3" /> Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500">
          Promo code
        </span>
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <Tag
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400"
              aria-hidden
            />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME10"
              autoComplete="off"
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (code.trim()) onApply();
                }
              }}
              className="input w-full pl-9 font-mono tracking-wider"
            />
          </div>
          <button
            type="button"
            onClick={onApply}
            disabled={state === "checking" || !code.trim() || subtotal_pkr <= 0}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-espresso-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
            )}
          >
            {state === "checking" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            Apply
          </button>
        </div>
      </label>
      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
