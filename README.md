# Komal's Coffee — official site

A pitch-ready Next.js 14 + Supabase marketing & ordering site for **Komal's Coffee** — a home-based specialty coffee studio in Bahria Orchard, Lahore.

> Built to demonstrate to Komal what a full-flash, A-Z brand site can do — pulling in foodpanda reviews, an Instagram tease, a full menu, the founder story, and a live order form that writes straight to Supabase.

---

## What's inside

### Customer site
- **Home** — Hero, marquee, social-proof strip, founder story, bestsellers, "why Komal's", review wall, Instagram grid, location/hours, CTA.
- **Menu** — Full categorised menu with search, bestseller/signature badges, sticky category nav, PKR pricing, and per-item detail pages (`/menu/[slug]`).
- **Our Story** — Founder bio (Komal Hassan), timeline, values.
- **Gallery** — Masonry layout.
- **Reviews** — Aggregated verified guest reviews.
- **Order** — Cart-driven form with COD + Safepay card payment, search-filtered drink list.
- **Contact** — Multi-channel tiles + Supabase-backed contact form.
- **Floating cart** — Sticky WhatsApp + cart button that opens a slide-in side drawer.
- **Store closed banner** — Auto-appears when admin closes the store; blocks order submissions.

### Admin dashboard (`/admin`)
- **Login** — Email + password, HMAC-signed cookie session (7-day expiry).
- **Dashboard** — Live stats: 30-day order count, pending orders, revenue, top 5 drinks, recent orders feed.
- **Orders** — List with status filters + free-text search, detail view with order status / payment status controls, customer contact (WhatsApp, call).
- **Products** — CRUD with full form (name, slug, price, size, image, category, tags, signature/bestseller/active toggles).
- **Categories** — Inline CRUD.
- **Coupons** — CRUD with percent / flat discount, minimum order, max uses, start / expiry dates, internal notes.
- **Deals** — CRUD with title, badge, image, percent / PKR off, validity window.
- **Store status** — One-click open / close with reason + reopening time + site-wide announcement; live banner preview.
- **Reviews moderation** — Feature / unfeature on homepage, delete.
- **Messages** — Contact-form inbox, mark handled, delete.
- **Newsletter** — Subscriber list with source + signup date.

## Tech

- **Next.js 14** (App Router, server components)
- **Tailwind CSS** + custom espresso/caramel/cream palette
- **Supabase** for: contact messages, newsletter subscribers, orders, menu, reviews, gallery
- **lucide-react** icons · **Inter** + **Playfair Display** + **Dancing Script** fonts
- **TypeScript** end-to-end

## Setup

```bash
# 1. install deps
npm install

# 2. copy env and fill in Supabase credentials
cp .env.example .env.local

# 3. run the SQL migration in your Supabase project
#    → open Supabase Studio → SQL editor
#    → paste supabase/migrations/001_init.sql and run

# 4. start the dev server
npm run dev
```

### Required env vars

| Var | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key (server-only) |
| `NEXT_PUBLIC_SITE_URL` | Production URL, e.g. `https://komalscoffee.pk` |
| `SAFEPAY_ENV` | `sandbox` for testing, `production` to go live |
| `SAFEPAY_SECRET_KEY` | Safepay dashboard → Developers (server-only) |
| `NEXT_PUBLIC_SAFEPAY_PUBLIC_KEY` | Safepay dashboard → Developers (publishable) |
| `ADMIN_EMAIL` | Email Komal logs into `/admin` with (defaults to baked-in dev value) |
| `ADMIN_PASSWORD` | Password Komal logs in with (defaults to baked-in dev value) |
| `ADMIN_SESSION_SECRET` | Long random string used to sign session cookies. Generate with `openssl rand -base64 48` |

### Admin login

Default credentials (baked in so the admin works without env config):
- **Email:** `webdev.muhammad@gmail.com`
- **Password:** `Komals@1`

Override both with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env.local` for production.

## Supabase schema

`supabase/migrations/001_init.sql` creates and seeds:

- `menu_categories` & `menu_items`
- `reviews` (foodpanda / Instagram / Facebook / Google)
- `orders` (form submissions from the /order page)
- `contact_messages`
- `newsletter_subscribers`
- `gallery_images`

RLS is on for every table. Public reads are allowed for marketing content; writes (orders, contact, newsletter) use the service-role key from API routes only.

## File map

```
src/
  app/
    page.tsx              Home
    menu/page.tsx
    about/page.tsx
    gallery/page.tsx
    reviews/page.tsx
    order/page.tsx
    contact/page.tsx
    not-found.tsx
    layout.tsx
    globals.css
    sitemap.ts            SEO
    robots.ts
    api/
      contact/route.ts
      newsletter/route.ts
      orders/route.ts
  components/             Hero, Navbar, Footer, OrderForm, etc.
  lib/
    data/                 site.ts, menu.ts, reviews.ts, gallery.ts
    supabase/             client.ts, server.ts
    utils.ts
supabase/
  migrations/001_init.sql
```

## Customising for Komal

Most live content lives in `src/lib/data/`:

- `site.ts` — name, hours, contact, social, stats. **Update phone, WhatsApp number, and Instagram handle here.**
- `menu.ts` — drinks, prices, descriptions. **Update prices, photos and descriptions to match Komal's real menu.**
- `reviews.ts` — verified excerpts. **Pull live reviews from foodpanda regularly.**
- `gallery.ts` — replace Unsplash placeholders with real photos from Komal's kitchen.

The same data is also seeded in `supabase/migrations/001_init.sql` — once you wire up the live Supabase queries you can read these from the DB instead of the static files.

## Production checklist

- [ ] Add Komal's real phone, WhatsApp, Instagram and Facebook URLs in `src/lib/data/site.ts`
- [ ] Replace Unsplash gallery images with real product/lifestyle photography
- [ ] Generate an Open Graph image (1200x630) and save to `public/og.jpg`
- [ ] Add a favicon to `src/app/icon.png`
- [ ] Run the Supabase migration in production
- [ ] Verify the `/api/orders` route inserts correctly (test with a real order)
- [ ] Deploy to Vercel and point `komalscoffee.pk` (or chosen domain) at it
