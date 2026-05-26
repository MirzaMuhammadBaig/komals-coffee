# Komal's Coffee

> Hand-crafted lattes, at your door. A home-based specialty coffee studio in Bahria Orchard, Lahore — full Next.js 14 + Supabase site with a customer storefront, online ordering with card payments, and a complete admin dashboard.

## Quick reference

| Property        | Value |
|-----------------|-------|
| Live site       | `https://komals-coffee.netlify.app` |
| Admin           | `/admin` (cookie-session auth, see Bootstrap) |
| Tech stack      | Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Supabase (Postgres + RLS) · Safepay (payments) |
| Timezone        | Asia/Karachi (PKT) |
| Currency        | PKR |
| Hosting target  | Netlify (via `@netlify/plugin-nextjs`) |

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Local development](#local-development)
4. [Environment variables](#environment-variables)
5. [Database — Supabase](#database--supabase)
6. [Bootstrap admin user](#bootstrap-admin-user)
7. [Safepay setup](#safepay-setup)
8. [Architecture & key concepts](#architecture--key-concepts)
9. [Project structure](#project-structure)
10. [Common admin workflows](#common-admin-workflows)
11. [Customising](#customising)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)
14. [License](#license)

---

## Features

### Public site

| Surface | What it shows |
|---|---|
| `/` (home) | Hero with live store-status chip, marquee, social-proof strip, founder story, bestsellers grid (clickable), why-Komal's, mood picker, review wall, Instagram grid, location + hours, CTA banner |
| `/menu` | Full categorised menu with live search, signature/bestseller badges, sticky category nav |
| `/menu/[slug]` | Per-drink detail page with image, description, price, add-to-cart + go-to-checkout |
| `/order` | Order page with menu picker, address + payment form (COD or card), order summary, modal preview for each line |
| `/order/success` | Post-payment receipt with order number, payment + fulfilment chips, "Save this number" emphasis, print receipt button, WhatsApp follow-up link |
| `/about` | Founder bio, values, timeline |
| `/gallery` | Masonry photo grid |
| `/reviews` | Platform breakdown + 28 individual reviews from Google, foodpanda, Instagram, Facebook, Tripadvisor |
| `/contact` | 5 contact channels, hours, bulk-orders card, full contact form |
| Always-on | Cart drawer, click effect, floating WhatsApp button, coffee-cup route loader, announcement banner (admin-controlled), closed banner (manual + after-hours) |

### Admin dashboard (`/admin`)

| Section | What it manages |
|---|---|
| Overview | Dashboard — 30-day orders, pending count, paid revenue, average order, recent activity, top drinks, current busyness pill |
| Overview | Revenue page — paid totals over time |
| Overview | Orders — list, filter by status, per-order detail with status controls, Call + WhatsApp customer buttons |
| Catalog | Products, Categories, Deals, Coupons |
| Engagement | Reviews moderation, contact-form messages, newsletter signups |
| Configuration | Store status (open/close + reason + reopen-at), Announcement banner, Busyness (auto-progression timer) |

---

## Tech stack

- **Next.js 14** with the App Router, React Server Components, Server Actions
- **TypeScript 5.6** with strict mode
- **Tailwind CSS 3.4** with a custom palette (cream / espresso / caramel / blush)
- **Supabase** — Postgres + Row Level Security, service-role key used for server-only writes
- **Safepay** — hosted card checkout (sandbox + production)
- **lucide-react** for icons, **framer-motion** for select animations

---

## Local development

```bash
# 1. Install
npm install

# 2. Copy env template and fill in keys
cp .env.example .env.local
# Edit .env.local — fill in Supabase + Safepay + admin credentials

# 3. Apply the migrations in Supabase (SQL Editor)
#    supabase/migrations/001_init.sql
#    supabase/migrations/002_busyness.sql

# 4. Bootstrap an admin user (see "Bootstrap admin user" section)

# 5. Run
npm run dev          # http://localhost:3000
npm run build        # production build
npm run start        # serve production build
npm run lint
npm run type-check
```

---

## Environment variables

Every variable, what it does, and whether it is required:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL. Used by both browser and server. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public anon key. Read-only RLS-bound access from the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Service-role key. **Never exposed to the browser.** Bypasses RLS for admin writes, order inserts, and the busyness sweep. |
| `NEXT_PUBLIC_SITE_URL` | yes (prod) | Public base URL (no trailing slash). Used for Safepay redirect URLs, OG tags, sitemap. |
| `ADMIN_EMAIL` | yes | Login email for `/admin/login`. Defaults are baked in for dev; **rotate before public launch**. |
| `ADMIN_PASSWORD` | yes | Login password. **Rotate before public launch.** |
| `ADMIN_SESSION_SECRET` | yes | HMAC secret for the cookie session. Any long random string. |
| `SAFEPAY_API_KEY` | for card payments | Server secret (`sec_…`). Also accepts `SAFEPAY_SECRET_KEY` as a legacy alias. |
| `SAFEPAY_V1_SECRET` | for card payments | v1 API secret. Used wherever HMAC signing is required. |
| `SAFEPAY_WEBHOOK_SECRET` | for card payments | Signs incoming webhook calls (future use). |
| `SAFEPAY_ENVIRONMENT` | for card payments | `sandbox` (default) or `production`. Also accepts `SAFEPAY_ENV`. |

If `SUPABASE_*` vars are missing, the customer site still renders (falls back to static seed data); only admin writes fail. If `SAFEPAY_*` vars are missing, COD orders still work.

---

## Database — Supabase

Apply migrations in order from the Supabase **SQL Editor**:

| # | File | What it adds |
|---|---|---|
| 001 | `supabase/migrations/001_init.sql` | Core schema — menu, orders, reviews, contact, newsletter, gallery, store settings, coupons, deals + RLS policies |
| 002 | `supabase/migrations/002_busyness.sql` | `store_settings.busyness_level`, `store_settings.auto_progress_minutes`, `orders.auto_advance_at`, supporting index |

### Tables

| Table | Purpose |
|---|---|
| `menu_categories` | Categorisation of the menu (signature, hot, iced, frappe, extras…) |
| `menu_items` | Each drink — price, image, badges, tags |
| `reviews` | User reviews from each platform |
| `orders` | Customer orders — items as JSONB, status pipeline, Safepay tracker, `auto_advance_at` |
| `contact_messages` | Submissions from `/contact` |
| `newsletter_subscribers` | Email signups |
| `gallery_images` | Photos for the gallery |
| `store_settings` | Singleton row (`id = 1`) — open/close, reason, reopen time, announcement, busyness |
| `coupons` | Discount codes (admin-managed) |
| `deals` | Time-bound deals (admin-managed) |

### RLS pattern

- All tables have **Row Level Security enabled**.
- The customer site uses the anon key — reads only what RLS exposes (public menu, gallery, etc.).
- Admin routes and `/api/orders` use `createSupabaseServiceClient()` which uses the service-role key and **bypasses RLS**. Service-role usage is gated to `runtime = "nodejs"` route handlers and server components; it never reaches the browser.
- Defensive design: `getStoreSettings()` selects `*` and merges with defaults, so a new column without its migration applied does not crash the read.

---

## Bootstrap admin user

The admin login uses an HMAC-signed cookie session with credentials stored in env vars (no auth table). This keeps the surface small and avoids Supabase Auth complexity for a single-operator shop.

1. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` in `.env.local`.
2. Restart the dev server.
3. Visit `/admin/login`, sign in, you are in.

If you also use Supabase Auth for any future feature, you can manually add the admin in **Supabase Studio → Authentication → Add User**, then if you want to reference that user in SQL:

```sql
select id from auth.users where email = 'webdev.muhammad@gmail.com';
```

**Important:** rotate `ADMIN_EMAIL` + `ADMIN_PASSWORD` before any public launch. Default values in committed code are for development only.

---

## Safepay setup

Komal's uses Safepay's hosted checkout for card payments. COD orders skip Safepay entirely.

### Sandbox

1. Sign up at https://sandbox.api.getsafepay.com and grab API keys.
2. Set `SAFEPAY_API_KEY`, `SAFEPAY_V1_SECRET`, `SAFEPAY_ENVIRONMENT=sandbox`.
3. Test cards: Safepay's docs list the sandbox cards. The 4242 Visa works as expected.
4. Place a card order → you are redirected to Safepay's sandbox checkout → enter test card → you land on `/order/success?order_id=…`.

### Production

1. Apply for live keys at https://getsafepay.com.
2. Set `SAFEPAY_ENVIRONMENT=production` and swap the keys.
3. Make sure `NEXT_PUBLIC_SITE_URL` is the production URL so redirect URLs are correct.
4. Webhook (future): set `SAFEPAY_WEBHOOK_SECRET` and configure your webhook endpoint in the Safepay dashboard.

### What happens on a card order

1. Customer submits `/order` form with `payment_method=card`.
2. `/api/orders` inserts the order with `payment_status=pending` (defensive insert: retries without `auto_advance_at` if migration 002 not yet applied).
3. Server calls `createSafepayTracker()` which posts to Safepay's `/order/v1/init`.
4. Returns a `checkoutUrl` that the browser navigates to.
5. Customer pays on Safepay; Safepay redirects to `/order/success?order_id=…`.
6. Success page reads the order number and shows a printable receipt.

---

## Architecture & key concepts

### Route groups

```
src/app/
  (site)/         ← customer-facing routes (Navbar + Footer wrapping)
    layout.tsx    ← force-dynamic, fetches store_settings, mounts banners
  admin/
    login/        ← unauthenticated login form
    (protected)/  ← admin area, layout calls getAdminSession() + redirects
  api/            ← Route Handlers (POST/PATCH/PUT/DELETE)
```

The `(site)` and `admin/(protected)` route groups each have their own `layout.tsx` and `loading.tsx`. The site layout is `force-dynamic` so the store-status banner + announcement banner are always fresh.

### Three-layer store status

1. **DB switch** — `store_settings.is_open` (admin's manual toggle).
2. **Schedule** — `site.hours` (or, in future, a DB-stored override) checked against PKT clock via `isWithinOrderHours()`.
3. **Live client recheck** — `StoreStatusBadge` re-evaluates every 30 s + on tab focus so the hero pill flips automatically at opening / closing time without a page reload.

`computeStoreStatus(manualOpen, hours?)` and `getEffectiveStoreState(input, hours?)` both accept an optional `hours` argument so a future admin Hours editor can plug straight in.

### Hours parsing — both formats

`parseHour()` accepts both 12-hour (`"9:00 AM"`) and 24-hour (`"09:00"`) strings. An HTML `<input type="time">` saves 24-hour values; without this, both `open` and `close` would parse to 0 and the store would silently appear after-hours all day. `formatHour()` is the inverse, turning `"21:30"` into `"9:30 PM"` for UI display.

### Busyness pipeline (auto-progression)

```
new ──(t1)──> confirmed ──(t2)──> out_for_delivery ──(manual)──> delivered
                                                                  (cancelled is terminal)
```

- `t1 = base.new_to_confirmed × multiplier` (default 2 min)
- `t2 = base.confirmed_to_out_for_delivery × multiplier` (default 10 min)
- Multipliers: `normal=1, busy=2, super_busy=3` (admin-controlled)

**Lazy-on-read:** `tickAutoAdvance()` sweeps overdue orders at the top of `/admin/orders` and `/admin/orders/[id]`. No cron required. Each conditional update uses `eq("status", o.status)` so concurrent ticks can never double-advance.

**Defensive:** every code path that touches `auto_advance_at` wraps the column in try/catch or retry-without, so the app keeps running if migration 002 has not been applied.

### Cart flow

```
add  →  CartContext (React Context)
            │  state held in memory + localStorage
            ▼
        FloatingOrderButton (badge count)  ↔  CartDrawer (slide-in)
            │
            ▼
        OrderForm  →  POST /api/orders  →  Supabase insert
            │                                 │
            ├─ COD: cart cleared, inline "done" state
            └─ Card: Safepay redirect → success page clears cart on mount
```

### Stale service-worker purge

`CleanPreviewUrl` strips known cache-busting query strings, so a previously installed SW from a different Next preview cannot leave the URL in a corrupted state.

### Honest UX

- Success page tells the customer Komal *will be notified* (not "we will WhatsApp you", which would imply automation we do not have).
- Order number is shown prominently with "Save this number" so the customer has something to quote.
- WhatsApp deep-links pre-fill a message that references the order number where possible.

---

## Project structure

```
komals-coffee/
├── public/                         # static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx              # root layout — fonts, ClickEffect, InitialLoader
│   │   ├── globals.css             # tailwind base + custom keyframes
│   │   ├── (site)/                 # customer-facing routes
│   │   │   ├── layout.tsx          # force-dynamic, mounts banners + nav
│   │   │   ├── loading.tsx         # coffee-cup loader (delayed reveal)
│   │   │   ├── page.tsx            # home
│   │   │   ├── menu/[slug]/        # product detail
│   │   │   ├── order/{success,cancel,page}.tsx
│   │   │   ├── about, contact, gallery, reviews
│   │   ├── admin/
│   │   │   ├── login/              # public login page
│   │   │   └── (protected)/        # gated by session cookie
│   │   │       ├── layout.tsx      # sidebar + topbar
│   │   │       ├── loading.tsx     # coffee-cup loader
│   │   │       ├── page.tsx        # dashboard + busyness pill
│   │   │       ├── orders/{page,[id]}.tsx
│   │   │       ├── products/{page,new,[id]}/
│   │   │       ├── categories, coupons, deals
│   │   │       ├── reviews, messages, newsletter
│   │   │       ├── store, announcement, busyness, revenue
│   │   └── api/
│   │       ├── orders/route.ts            # public — POST a customer order
│   │       ├── contact, newsletter
│   │       └── admin/                     # gated by requireAdmin()
│   │           ├── auth/{login,logout}
│   │           ├── store, announcement
│   │           ├── orders/[id], products, categories, deals, coupons,
│   │           │   reviews/[id], messages/[id]
│   ├── components/
│   │   ├── Hero, Navbar, Footer, FeaturedItems, Story, WhyKomals, ...
│   │   ├── CartDrawer, FloatingOrderButton, ProductDetailModal
│   │   ├── CoffeeLoader, InitialLoader, ClickEffect, AnnouncementBanner
│   │   ├── StoreStatusBadge, StoreClosedBanner
│   │   └── admin/
│   │       ├── AdminSidebar, AdminTopbar, AdminMobileNav, AdminPageHeader
│   │       ├── BusynessForm, AnnouncementForm, StoreSettingsForm
│   │       ├── ProductForm, CouponForm, DealForm, CategoriesManager
│   │       └── nav.ts (the sidebar manifest)
│   └── lib/
│       ├── data/{site,menu,reviews,gallery}.ts   # static seed content
│       ├── hours.ts                              # PKT clock + parse/format
│       ├── cart/CartContext.tsx
│       ├── safepay/client.ts
│       ├── supabase/server.ts                    # no-store fetch wrapper
│       ├── admin/
│       │   ├── auth.ts, guard.ts                 # cookie session
│       │   ├── store.ts                          # getStoreSettings (defensive)
│       │   ├── orders.ts                         # tickAutoAdvance
│       │   ├── busyness-types.ts                 # pure types + helpers
│       │   └── busyness.ts                       # "use server" action
│       └── utils.ts
├── supabase/
│   └── migrations/
│       ├── 001_init.sql
│       └── 002_busyness.sql
├── tailwind.config.ts
├── next.config.js
├── netlify.toml
└── package.json
```

---

## Common admin workflows

| Goal | Steps |
|---|---|
| Mark store closed for the day | Admin → **Store status** → "Close store" → optional reason + reopen time → Save. A dark banner appears across the public site within seconds. |
| Show a promo banner | Admin → **Announcement** → type the message → Publish. A caramel banner appears at the top of every page. Clear it with **Remove banner**. |
| Crank up busyness during a rush | Admin → **Busyness** → tap **Busy** or **Super busy** → Save. Auto-advance timers multiply by 2× or 3×, so the order pipeline slows down to match reality. |
| Confirm a brand new order | Admin → **Orders** → click the row → **Confirm** in the status controls. WhatsApp the customer using the pre-filled button. |
| Edit a drink price | Admin → **Products** → click the drink → change price → Save. |
| Reply to a contact-form message | Admin → **Messages** → click → reply via the email link directly in your mail client. Mark as read. |

---

## Customising

| To change… | Edit… |
|---|---|
| Brand name, tagline, address, hours, social links | `src/lib/data/site.ts` |
| The menu seed (drinks shown if Supabase is empty) | `src/lib/data/menu.ts` |
| Gallery photos | `src/lib/data/gallery.ts` |
| Static review fallbacks | `src/lib/data/reviews.ts` |
| Colours, fonts, breakpoints | `tailwind.config.ts` |
| Animations, keyframes | `src/app/globals.css` |
| Sidebar nav links | `src/components/admin/nav.ts` |
| Order pipeline statuses | `src/app/api/admin/orders/[id]/route.ts` + the `STATUS_FILTERS` in `src/app/admin/(protected)/orders/page.tsx` |

---

## Deployment

The project is set up for **Netlify** via `@netlify/plugin-nextjs`.

```bash
# Build locally before pushing if you want to be sure
npm run build
npm run type-check

# Push — Netlify builds + deploys
git add -A
git commit -m "Your change"
git push
```

### Post-deploy checklist

- [ ] Visit `/` — verify hero loads, store-status pill colour matches actual clock.
- [ ] Visit `/menu` — search works, click a bestseller card on the home page → product detail.
- [ ] Place a test COD order → verify it lands in `/admin/orders` with `status=new`.
- [ ] Place a test card order using the Safepay sandbox 4242 card → land on `/order/success?order_id=…` → order shows as `payment_status=paid` in admin.
- [ ] Toggle store closed in admin → public banner appears within seconds. Toggle back.
- [ ] Publish an announcement → caramel strip appears. Remove → strip disappears.
- [ ] Confirm the 002 migration is applied: open `/admin/busyness`, save once at "normal", check the dashboard pill shows the values.
- [ ] Open the site on a 320 px phone and a 768 px tablet — no horizontal scroll, all touch targets readable.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Cannot find module './vendor-chunks/...'` during dev | Two `next dev` processes racing on `.next/` | Kill all node processes, `rm -rf .next`, restart one server. |
| Repeated `/admin/login` redirect loop | `ADMIN_SESSION_SECRET` changed between requests (different value in `.env.local` and the build) | Set a single value, redeploy, clear the `komals_admin` cookie. |
| Stale service-worker intercepts pages | A prior SW from a different preview is still installed | Hard refresh (Ctrl+Shift+R); the in-app `CleanPreviewUrl` purges the bust params on next visit. |
| Admin page shows stale data after save | Next.js Data Cache caching the Supabase fetch | Already mitigated — `createSupabaseServiceClient()` uses `cache: "no-store"`. If you see it again, double-check the env vars are loaded. |
| Public banner not showing after Save | You are testing the live Netlify URL but have not deployed yet | `git push` to deploy, wait for build, hard refresh the public site. |
| Hours misconfigured — store looks closed all day | A custom hours entry uses an unsupported time format | `parseHour` accepts `"9:00 AM"` *or* `"09:00"`. Anything else returns 0 and breaks the window check. |
| Card payment returns "Could not start card payment" | `SAFEPAY_API_KEY` missing or wrong environment | Confirm `SAFEPAY_ENVIRONMENT` matches the keys (sandbox keys → sandbox env). |
| Busyness page errors on save: "column does not exist" | Migration 002 not applied | Open Supabase SQL Editor → paste `supabase/migrations/002_busyness.sql` → run. |
| Auto-advance never fires | `auto_advance_at` is null because migration 002 was applied after the order was placed | New orders placed after the migration set the column on insert; older orders stay manual. Or click into the order and re-save the status. |
| Type error after pulling main | Stale TS server | `npm run type-check`; in VS Code, command palette → "TypeScript: Restart TS Server". |

---

## License

Private. © Komal's Coffee. All rights reserved.
