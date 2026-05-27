-- 003_coupons_discount.sql
-- Wire coupons into the order pipeline.
--
-- Adds three columns to orders so we can prove (forever, in the row
-- itself) what the customer was charged and why:
--   subtotal_pkr  — pre-discount total of the items
--   discount_pkr  — the discount applied (0 if no coupon)
--   coupon_code   — the redeemed code, uppercase, denormalised so
--                   refunds and reports do not need a join to coupons
--
-- Adds an atomic redemption helper redeem_coupon(code) that:
--   • finds the active, in-window coupon with that code
--   • increments used_count, but ONLY if max_uses is null or unmet
--   • returns the row of (id, kind, value, min_order_pkr) so the
--     caller can re-derive the discount server-side
--   • returns 0 rows if the code is invalid / used up — caller treats
--     that as a redemption failure and rolls back the order if needed
--
-- Apply via the Supabase SQL Editor. Idempotent.

alter table public.orders
  add column if not exists subtotal_pkr int;

alter table public.orders
  add column if not exists discount_pkr int not null default 0;

alter table public.orders
  add column if not exists coupon_code text;

create index if not exists orders_coupon_code_idx
  on public.orders(lower(coupon_code))
  where coupon_code is not null;

-- Atomic redeem. Returns the redeemed row, or no rows on rejection.
-- We do all eligibility checks inside one UPDATE so two concurrent orders
-- racing on the last available use can never both succeed.
create or replace function public.redeem_coupon(p_code text)
returns table (
  id uuid,
  code text,
  kind text,
  value int,
  min_order_pkr int
)
language sql
security definer
as $$
  update public.coupons
     set used_count = used_count + 1
   where lower(code) = lower(p_code)
     and is_active
     and (starts_at is null or starts_at <= now())
     and (expires_at is null or expires_at >= now())
     and (max_uses is null or used_count < max_uses)
  returning id, code, kind, value, min_order_pkr;
$$;

grant execute on function public.redeem_coupon(text) to anon, authenticated, service_role;
