import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  DEFAULT_AUTO_PROGRESS_MINUTES,
  type AutoProgressMinutes,
  type BusynessLevel,
} from "@/lib/admin/busyness-types";

export type StoreSettings = {
  is_open: boolean;
  closed_reason: string | null;
  closed_until: string | null;
  announcement: string | null;
  updated_at: string;
  busyness_level: BusynessLevel;
  auto_progress_minutes: AutoProgressMinutes;
};

/**
 * Reads the singleton store_settings row. Returns null on any error so
 * callers can fall back gracefully (the customer site shouldn't crash if
 * Supabase isn't configured yet).
 *
 * Defensive against schema drift — we `select("*")` and merge with
 * defaults, so the call survives even if a newer column (busyness, etc.)
 * has not had its migration applied yet.
 */
export async function getStoreSettings(): Promise<StoreSettings | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as Partial<StoreSettings>;
    return {
      is_open: row.is_open ?? true,
      closed_reason: row.closed_reason ?? null,
      closed_until: row.closed_until ?? null,
      announcement: row.announcement ?? null,
      updated_at: row.updated_at ?? new Date().toISOString(),
      busyness_level: (row.busyness_level as BusynessLevel) ?? "normal",
      auto_progress_minutes:
        (row.auto_progress_minutes as AutoProgressMinutes) ??
        DEFAULT_AUTO_PROGRESS_MINUTES,
    };
  } catch {
    return null;
  }
}
