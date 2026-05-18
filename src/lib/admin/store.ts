import { createSupabaseServiceClient } from "@/lib/supabase/server";

export type StoreSettings = {
  is_open: boolean;
  closed_reason: string | null;
  closed_until: string | null;
  announcement: string | null;
  updated_at: string;
};

/**
 * Reads the singleton store_settings row. Returns null on any error so
 * callers can fall back gracefully (the customer site shouldn't crash if
 * Supabase isn't configured yet).
 */
export async function getStoreSettings(): Promise<StoreSettings | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("is_open, closed_reason, closed_until, announcement, updated_at")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return null;
    return data as StoreSettings;
  } catch {
    return null;
  }
}
