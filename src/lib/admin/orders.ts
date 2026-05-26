import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/admin/store";
import {
  nextAutoAdvanceAt,
  nextStatusAfter,
} from "@/lib/admin/busyness-types";

/**
 * Sweep any orders whose `auto_advance_at` is in the past and bump them
 * to the next status. Lazy-on-read: called at the top of admin order
 * pages so we never need a cron job.
 *
 * Idempotent — each update guards on `eq("status", o.status)`, so two
 * concurrent ticks can't double-advance the same order.
 *
 * Defensive — if the 002_busyness migration has not been applied yet
 * the `auto_advance_at` column will not exist; the catch keeps the
 * admin page rendering instead of throwing.
 */
export async function tickAutoAdvance(): Promise<void> {
  try {
    const supabase = createSupabaseServiceClient();
    const nowIso = new Date().toISOString();

    const { data: due, error } = await supabase
      .from("orders")
      .select("id, status")
      .lte("auto_advance_at", nowIso)
      .in("status", ["new", "confirmed"])
      .limit(50);

    if (error || !due || due.length === 0) return;

    const settings = await getStoreSettings();
    if (!settings) return;

    for (const o of due) {
      const next = nextStatusAfter(o.status);
      if (!next) continue;
      const future = nextAutoAdvanceAt(
        next,
        settings.busyness_level,
        settings.auto_progress_minutes,
      );
      await supabase
        .from("orders")
        .update({
          status: next,
          auto_advance_at: future ? future.toISOString() : null,
        })
        .eq("id", o.id)
        .eq("status", o.status); // race-safe: only update if still in the read status
    }
  } catch (err) {
    console.error(
      "tickAutoAdvance — skipped (migration likely not applied yet):",
      err,
    );
  }
}
