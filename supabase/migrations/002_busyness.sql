-- 002_busyness.sql
-- Busyness — auto-progression of order statuses.
--
-- Komal's order pipeline:
--   new -> confirmed -> out_for_delivery -> delivered
--                                            (cancelled is terminal at any point)
--
-- We auto-advance:
--   new           -> confirmed                   (default 2 min)
--   confirmed     -> out_for_delivery            (default 10 min)
-- delivered and cancelled are always manual.
--
-- Multiplier:
--   normal     = ×1
--   busy       = ×2
--   super_busy = ×3
--
-- Apply via the Supabase SQL Editor. This migration is idempotent —
-- re-running it is a no-op thanks to `if not exists` guards.

alter table public.store_settings
  add column if not exists busyness_level text not null default 'normal'
    check (busyness_level in ('normal','busy','super_busy'));

alter table public.store_settings
  add column if not exists auto_progress_minutes jsonb not null default
    '{"new_to_confirmed":2,"confirmed_to_out_for_delivery":10}'::jsonb;

alter table public.orders
  add column if not exists auto_advance_at timestamptz;

create index if not exists orders_auto_advance_idx
  on public.orders(auto_advance_at)
  where auto_advance_at is not null;
