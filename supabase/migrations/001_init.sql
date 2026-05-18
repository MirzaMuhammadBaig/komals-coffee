-- ============================================================
-- Komal's Coffee · initial Supabase schema
-- Run this in the Supabase SQL editor, or via `supabase db push`.
-- ============================================================

-- ─── extensions ─────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── menu_categories ────────────────────────────────────────
create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── menu_items ─────────────────────────────────────────────
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.menu_categories(id) on delete set null,
  slug text unique not null,
  name text not null,
  description text,
  price_pkr int not null,
  size text,
  image_url text,
  is_bestseller boolean not null default false,
  is_signature boolean not null default false,
  is_new boolean not null default false,
  is_active boolean not null default true,
  tags text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── reviews (from foodpanda, Instagram, Facebook) ──────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('google','foodpanda','instagram','facebook','tripadvisor','manual')),
  author_name text not null,
  author_avatar_url text,
  rating int not null check (rating between 1 and 5),
  body text not null,
  area text,
  reviewed_at date,
  external_url text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── orders (lead-form submissions from /order page) ────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  secondary_phone text not null,
  email text,
  delivery_address text not null,
  items jsonb not null default '[]'::jsonb,
  notes text,
  total_pkr int,
  channel text not null default 'website' check (channel in ('website','whatsapp','foodpanda','instagram')),
  status text not null default 'new' check (status in ('new','confirmed','out_for_delivery','delivered','cancelled')),
  payment_method text not null default 'cod' check (payment_method in ('cod','card')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','cancelled','refunded')),
  payment_provider text,
  payment_tracker text,
  created_at timestamptz not null default now()
);

-- ─── contact_messages (general inquiries) ───────────────────
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── newsletter_subscribers ─────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  created_at timestamptz not null default now()
);

-- ─── gallery_images ─────────────────────────────────────────
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt text,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── store_settings (single row) ────────────────────────────
create table if not exists public.store_settings (
  id int primary key default 1 check (id = 1),
  is_open boolean not null default true,
  closed_reason text,
  closed_until timestamptz,
  announcement text,
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict do nothing;

-- ─── coupons ────────────────────────────────────────────────
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  kind text not null check (kind in ('percent','flat')),
  value int not null check (value > 0),
  min_order_pkr int not null default 0,
  max_uses int,
  used_count int not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists coupons_code_idx on public.coupons (lower(code));

-- ─── deals ──────────────────────────────────────────────────
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  badge text,
  image_url text,
  discount_pkr int,
  discount_percent int,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── Row-Level Security ─────────────────────────────────────
alter table public.menu_categories       enable row level security;
alter table public.menu_items            enable row level security;
alter table public.reviews               enable row level security;
alter table public.orders                enable row level security;
alter table public.contact_messages      enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.gallery_images        enable row level security;
alter table public.store_settings        enable row level security;
alter table public.coupons               enable row level security;
alter table public.deals                 enable row level security;

-- Public read for marketing content
create policy "menu_categories_read"  on public.menu_categories  for select using (true);
create policy "menu_items_read"       on public.menu_items       for select using (true);
create policy "reviews_read"          on public.reviews          for select using (true);
create policy "gallery_images_read"   on public.gallery_images   for select using (true);
create policy "store_settings_read"   on public.store_settings   for select using (true);
create policy "deals_read"            on public.deals            for select using (is_active);
-- Coupons are NOT publicly readable; only the validator route (service-role) checks them.

-- Public can insert their own order / message / newsletter signup.
-- Reads on these are restricted to service-role (no policy).
create policy "orders_insert"           on public.orders                for insert with check (true);
create policy "contact_messages_insert" on public.contact_messages      for insert with check (true);
create policy "newsletter_insert"       on public.newsletter_subscribers for insert with check (true);

-- ─── Seed: menu categories ──────────────────────────────────
insert into public.menu_categories (slug, name, description, sort_order) values
  ('signature',  'Komal''s Signatures', 'House caramel, hazelnut and Irish-cream ribbons. The orders regulars never replace.', 1),
  ('hot-lattes', 'Hot Lattes',          'Double-shot espresso, hand-frothed milk, made-to-order.',                              2),
  ('iced',       'Iced Coffees',        'Ice-shaken or layered cold, finished for the Lahore afternoon.',                     3),
  ('frappes',    'Frappés & Blends',    'Blended, frothy, dessert-adjacent.',                                                  4),
  ('extras',     'Little Extras',       'Add-ons to pair with your cup.',                                                      5)
on conflict (slug) do nothing;

-- ─── Seed: menu items ───────────────────────────────────────
insert into public.menu_items (category_id, slug, name, description, price_pkr, size, image_url, is_bestseller, is_signature, tags, sort_order)
select id, 'salted-caramel-latte', 'Salted Caramel Latte',
       'Double espresso, steamed milk, our house salted-caramel ribbon and a flaky-salt finish.',
       1100, '16oz', null, true, true, array['signature','hot'], 1
from public.menu_categories where slug='signature' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, is_bestseller, is_signature, tags, sort_order)
select id, 'irish-cream-latte', 'Irish Cream Latte',
       'Smooth Irish cream stirred through espresso and steamed whole milk (no alcohol).',
       1150, '16oz', true, true, array['signature','hot'], 2
from public.menu_categories where slug='signature' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, is_signature, tags, sort_order)
select id, 'hazelnut-praline-latte', 'Hazelnut Praline Latte',
       'Toasted hazelnut praline syrup, double espresso, silky milk and a swirl of crumble.',
       1100, '16oz', true, array['signature','hot'], 3
from public.menu_categories where slug='signature' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, is_signature, tags, sort_order)
select id, 'komals-house-mocha', 'Komal''s House Mocha',
       'Dark Belgian chocolate ganache, double espresso, steamed milk.',
       1150, '16oz', true, array['signature','hot'], 4
from public.menu_categories where slug='signature' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, tags, sort_order)
select id, 'classic-latte', 'Classic Latte',
       'Just the way it should be. Espresso, steamed milk, micro-foam.',
       900, '16oz', array['hot'], 1
from public.menu_categories where slug='hot-lattes' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, tags, sort_order)
select id, 'cappuccino', 'Cappuccino',
       'Equal parts espresso, steamed milk and dense foam. Cocoa-dust finish.',
       850, '12oz', array['hot','classic'], 2
from public.menu_categories where slug='hot-lattes' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, tags, sort_order)
select id, 'vanilla-latte', 'Vanilla Latte',
       'Real vanilla bean syrup, double shot, hand-frothed milk.',
       950, '16oz', array['hot','flavoured'], 3
from public.menu_categories where slug='hot-lattes' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, is_bestseller, tags, sort_order)
select id, 'spanish-latte', 'Spanish Latte',
       'Sweetened condensed milk, double espresso, steamed whole milk.',
       1000, '16oz', true, array['hot','flavoured'], 4
from public.menu_categories where slug='hot-lattes' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, tags, sort_order)
select id, 'americano', 'Americano',
       'A clean double shot, hot water, served as-is.',
       600, '12oz', array['hot','classic'], 5
from public.menu_categories where slug='hot-lattes' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, is_bestseller, tags, sort_order)
select id, 'iced-caramel-latte', 'Iced Salted Caramel Latte',
       'Our signature caramel latte, layered cold over ice.',
       1200, '16oz', true, array['iced','signature'], 1
from public.menu_categories where slug='iced' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, tags, sort_order)
select id, 'iced-spanish-latte', 'Iced Spanish Latte',
       'Cold milk, condensed milk, double espresso poured over ice.',
       1100, '16oz', array['iced'], 2
from public.menu_categories where slug='iced' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, tags, sort_order)
select id, 'iced-americano', 'Iced Americano',
       'Double shot, chilled water, plenty of ice. Clean and bright.',
       700, '16oz', array['iced','classic'], 3
from public.menu_categories where slug='iced' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, tags, sort_order)
select id, 'iced-mocha', 'Iced Mocha',
       'Belgian dark chocolate, cold milk, double espresso, ice, chocolate shavings.',
       1200, '16oz', array['iced','chocolate'], 4
from public.menu_categories where slug='iced' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, is_bestseller, tags, sort_order)
select id, 'caramel-frappe', 'Caramel Frappé',
       'Blended ice, espresso, milk and house caramel, topped with whipped cream.',
       1200, '16oz', true, array['blended','dessert'], 1
from public.menu_categories where slug='frappes' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, tags, sort_order)
select id, 'hazelnut-frappe', 'Hazelnut Frappé',
       'Blended hazelnut praline, espresso, milk, finished with whipped cream and crumble.',
       1200, '16oz', array['blended','dessert'], 2
from public.menu_categories where slug='frappes' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, size, tags, sort_order)
select id, 'mocha-frappe', 'Mocha Frappé',
       'Blended chocolate, espresso, milk and ice, topped with cocoa-dusted cream.',
       1200, '16oz', array['blended','chocolate'], 3
from public.menu_categories where slug='frappes' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, tags, sort_order)
select id, 'extra-shot', 'Extra Espresso Shot',
       'Add a single shot to any drink.',
       150, array['add-on'], 1
from public.menu_categories where slug='extras' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, tags, sort_order)
select id, 'extra-syrup', 'Extra Flavour Pump',
       'Caramel, hazelnut, vanilla, Irish cream or chocolate.',
       100, array['add-on'], 2
from public.menu_categories where slug='extras' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, tags, sort_order)
select id, 'whipped-cream', 'Whipped Cream',
       'House-whipped sweet cream, on top.',
       100, array['add-on'], 3
from public.menu_categories where slug='extras' on conflict (slug) do nothing;

-- ─── Seed: reviews ──────────────────────────────────────────
insert into public.reviews (source, author_name, rating, body, area, reviewed_at, is_featured) values
  ('foodpanda', 'Moiz', 5,
   'Best coffee in Bahria Orchard area. Will order again, hands down.',
   'Bahria Orchard', '2025-11-02', true),
  ('foodpanda', 'Zara', 5,
   'Loved it. I will be ordering it again. The caramel latte was perfectly balanced.',
   null, '2025-07-27', true),
  ('foodpanda', 'Hira A.', 5,
   'Arrived warm, sealed and tasted exactly like a café cup. Komal''s hospitality is felt in every order.',
   null, '2025-09-14', true),
  ('foodpanda', 'Usman', 5,
   'I am hooked. The Irish cream latte is creamy, not too sweet. Went back the same week.',
   null, '2025-10-19', true),
  ('foodpanda', 'Mehak', 5,
   'Frothy, creamy, the way a 1,200 PKR latte should taste. Packaging was top-tier too.',
   null, '2025-08-11', true),
  ('foodpanda', 'Ali R.', 5,
   'Better than the chains nearby. Komal clearly cares about every cup.',
   null, '2025-06-25', true),
  ('instagram', '@lahorefoodies', 5,
   'Home-based but tastes like a third-wave specialty café. Komal''s caramel ribbon is the move.',
   null, '2025-11-20', true)
on conflict do nothing;
