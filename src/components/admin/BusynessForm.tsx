"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Gauge, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BUSYNESS_DESCRIPTIONS,
  BUSYNESS_LABELS,
  BUSYNESS_LEVELS,
  BUSYNESS_MULTIPLIERS,
  type AutoProgressMinutes,
  type BusynessLevel,
} from "@/lib/admin/busyness-types";
import { updateBusyness } from "@/lib/admin/busyness";

type Initial = {
  level: BusynessLevel;
  minutes: AutoProgressMinutes;
};

export default function BusynessForm({ initial }: { initial: Initial }) {
  const [level, setLevel] = useState<BusynessLevel>(initial.level);
  const [m, setM] = useState<AutoProgressMinutes>(initial.minutes);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Effective (multiplied) waits — preview as the admin tweaks.
  const mult = BUSYNESS_MULTIPLIERS[level];
  const effA = m.new_to_confirmed * mult;
  const effB = m.confirmed_to_out_for_delivery * mult;

  async function action(fd: FormData) {
    setError(null);
    const res = await updateBusyness(fd);
    if (res.ok) {
      setSavedAt(new Date().toLocaleTimeString("en-PK"));
    } else {
      setError(res.error);
    }
  }

  // Reset "Saved" badge once the admin starts editing again.
  useEffect(() => {
    if (savedAt) setSavedAt(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, m.new_to_confirmed, m.confirmed_to_out_for_delivery]);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="card space-y-6 p-5 sm:p-6">
        {/* Level picker */}
        <div>
          <p className="eyebrow">Step 1</p>
          <h3 className="mt-1 font-display text-lg text-espresso-800 sm:text-xl">
            How busy is Komal right now?
          </h3>
          <p className="mt-1.5 text-sm text-espresso-500">
            Multiplies every auto-advance timer below.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {BUSYNESS_LEVELS.map((L) => {
              const selected = level === L;
              return (
                <label
                  key={L}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all duration-200 active:scale-95 sm:p-4",
                    selected
                      ? "border-caramel-500 bg-caramel-500/10 ring-2 ring-caramel-500/40"
                      : "border-espresso-100 bg-white hover:-translate-y-0.5 hover:border-espresso-300 hover:shadow-sm",
                  )}
                >
                  <input
                    type="radio"
                    name="busyness_level"
                    value={L}
                    checked={selected}
                    onChange={() => setLevel(L)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "font-display text-sm sm:text-base",
                      selected ? "text-caramel-700" : "text-espresso-800",
                    )}
                  >
                    {BUSYNESS_LABELS[L]}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-espresso-400">
                    ×{BUSYNESS_MULTIPLIERS[L]}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-espresso-500">
            {BUSYNESS_DESCRIPTIONS[level]}
          </p>
        </div>

        {/* Base minutes */}
        <div className="space-y-4">
          <div>
            <p className="eyebrow">Step 2</p>
            <h3 className="mt-1 font-display text-lg text-espresso-800 sm:text-xl">
              Base auto-advance minutes
            </h3>
            <p className="mt-1.5 text-sm text-espresso-500">
              The schedule at <span className="font-semibold">normal</span>.
              Busy and super-busy levels multiply these.
            </p>
          </div>
          <MinutesField
            name="new_to_confirmed"
            label="New → Confirmed"
            hint="How long Komal has to acknowledge a fresh order before it auto-confirms."
            value={m.new_to_confirmed}
            onChange={(v) => setM({ ...m, new_to_confirmed: v })}
          />
          <MinutesField
            name="confirmed_to_out_for_delivery"
            label="Confirmed → Out for delivery"
            hint="Estimated prep time before the order is marked out for delivery."
            value={m.confirmed_to_out_for_delivery}
            onChange={(v) =>
              setM({ ...m, confirmed_to_out_for_delivery: v })
            }
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-espresso-100 pt-5">
          {savedAt ? (
            <p className="inline-flex items-center gap-1.5 text-xs text-green-700">
              <Check className="h-3.5 w-3.5" /> Saved at {savedAt}
            </p>
          ) : (
            <span />
          )}
          <SaveButton />
        </div>
      </section>

      <aside className="card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-caramel-500/15 text-caramel-700">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
              Effective wait
            </p>
            <p className="font-display text-base text-espresso-800 sm:text-lg">
              At {BUSYNESS_LABELS[level]} (×{mult})
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-cream-100/60 p-4">
          <Row label="New → Confirmed" mins={effA} />
          <Row
            label="Confirmed → Out for delivery"
            mins={effB}
          />
          <div className="border-t border-espresso-200 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-espresso-400">
              Total auto-advance
            </p>
            <p className="mt-1 font-display text-2xl text-espresso-800 tabular-nums">
              ~{effA + effB} min
            </p>
          </div>
        </div>

        <p className="text-xs text-espresso-400">
          Delivered and cancelled statuses always stay manual. Komal still
          marks an order delivered when the driver hands it over.
        </p>
      </aside>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-espresso-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Check className="h-3.5 w-3.5" />
      )}
      Save busyness
    </button>
  );
}

function MinutesField({
  name,
  label,
  hint,
  value,
  onChange,
}: {
  name: string;
  label: string;
  hint: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-500">
        {label}
      </span>
      <div className="mt-1.5 flex items-center gap-3">
        <input
          type="number"
          name={name}
          value={value}
          min={1}
          max={120}
          step={1}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(Number.isFinite(n) ? n : 1);
          }}
          className="input w-28"
        />
        <span className="text-sm text-espresso-500">minutes</span>
      </div>
      <p className="mt-1.5 text-xs text-espresso-400">{hint}</p>
    </label>
  );
}

function Row({ label, mins }: { label: string; mins: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-espresso-500">{label}</span>
      <span className="font-display text-base text-espresso-800 tabular-nums">
        ~{mins} min
      </span>
    </div>
  );
}
