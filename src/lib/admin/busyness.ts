"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/admin/auth";
import {
  BUSYNESS_LEVELS,
  type AutoProgressMinutes,
  type BusynessLevel,
} from "@/lib/admin/busyness-types";

type ActionResult =
  | { ok: true; level: BusynessLevel; minutes: AutoProgressMinutes }
  | { ok: false; error: string };

/**
 * Server action — persists the busyness level + base minutes. Form-driven
 * (called with a FormData via `<form action={updateBusyness}>`). Clamps
 * minutes into [1, 120] and validates the level against the allow-list.
 */
export async function updateBusyness(fd: FormData): Promise<ActionResult> {
  if (!getAdminSession()) return { ok: false, error: "Unauthorised" };

  const rawLevel = String(fd.get("busyness_level") ?? "");
  if (!BUSYNESS_LEVELS.includes(rawLevel as BusynessLevel)) {
    return { ok: false, error: "Invalid busyness level" };
  }
  const level = rawLevel as BusynessLevel;

  const clamp = (n: number) =>
    Math.max(1, Math.min(120, Number.isFinite(n) ? Math.round(n) : 1));
  const minutes: AutoProgressMinutes = {
    new_to_confirmed: clamp(Number(fd.get("new_to_confirmed") ?? 2)),
    confirmed_to_out_for_delivery: clamp(
      Number(fd.get("confirmed_to_out_for_delivery") ?? 10),
    ),
  };

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("store_settings")
    .update({
      busyness_level: level,
      auto_progress_minutes: minutes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    // Defensive: surface migration-not-applied errors as a friendly message.
    const msg = /column .* does not exist/i.test(error.message)
      ? "The 002_busyness migration has not been applied yet. Run it in the Supabase SQL Editor."
      : error.message;
    return { ok: false, error: msg };
  }

  revalidatePath("/admin/busyness");
  revalidatePath("/admin");
  return { ok: true, level, minutes };
}
