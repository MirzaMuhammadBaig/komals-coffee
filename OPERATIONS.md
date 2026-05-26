# Komal's Coffee — Operations & Automation

The companion to the [README](README.md). The README is what the next developer reads. **This** is what the owner reads — automation opportunities, ongoing maintenance, cost projections, risks.

## TL;DR

- The site is **shippable today** — customer storefront, online ordering, card payments and admin all work end to end.
- The **biggest operational gap** is the lack of automated customer notifications. Komal is currently the manual notifier for every order. SMS or WhatsApp Business API is the highest-impact next step.
- **Minimum monthly running cost** (today's setup): ~$0–$5 USD (~PKR 0–1,500) plus Safepay transaction fees on card orders.
- **Full-suite cost** with SMS, WhatsApp Business, paid Supabase, paid Netlify, monitoring: ~$80–$130 USD/month (~PKR 22,000–36,000).

## Table of contents

1. [Automation roadmap](#automation-roadmap)
2. [Recurring maintenance — short term](#recurring-maintenance--short-term)
3. [Strategic maintenance — long term](#strategic-maintenance--long-term)
4. [Services & integrations catalogue](#services--integrations-catalogue)
5. [Cost projections](#cost-projections)
6. [Risks & contingencies](#risks--contingencies)
7. [Suggested implementation roadmap](#suggested-implementation-roadmap)
8. [Appendix — handover quick reference](#appendix--handover-quick-reference)

---

## Automation roadmap

Three tiers, sorted by impact-per-rupee.

### Tier A — Ship this first (high impact, low effort)

| # | Item | Impact | Effort (hrs) | Monthly cost | Implementation note |
|---|---|---|---|---|---|
| A1 | Customer SMS on order confirmation | High | 4 | ~PKR 0.50 / SMS | Twilio or local provider (Veevo, Branchout). Wire into `/api/orders` and the Safepay webhook. |
| A2 | Customer SMS on out-for-delivery | High | 2 | as A1 | Wire into the admin status PATCH route. |
| A3 | Owner SMS for new orders (Komal's number) | High | 1 | as A1 | Same provider as A1, fires from `/api/orders` POST. |
| A4 | Email order receipt to customer | Medium | 3 | $0 (Resend free tier) | Resend or Mailgun. Render the order summary as HTML. |
| A5 | Daily sales digest to owner email | Medium | 2 | $0 | Netlify Scheduled Function or Supabase cron. Reads `orders` for the last 24 h. |
| A6 | Sentry error monitoring | Medium | 1 | $0 (free tier) | Drop in the Next.js SDK. Track 500s + client errors. |
| A7 | Uptime monitoring (UptimeRobot) | Medium | 0.5 | $0 | Pings `/api/orders` health check every 5 min. |

### Tier B — When you have a free weekend (medium effort)

| # | Item | Impact | Effort (hrs) | Monthly cost | Implementation note |
|---|---|---|---|---|---|
| B1 | WhatsApp Business API for confirmations | High | 8–12 | $15–$40 | Twilio WhatsApp, 360dialog, or Wati. Replaces A1/A2 with WhatsApp messages. |
| B2 | Admin Hours editor (DB-stored, replaces `site.hours`) | Medium | 4 | $0 | New column `store_settings.hours jsonb`. The hours utilities already accept a parameter — wire the override through `(site)/layout.tsx`. |
| B3 | Plausible/Posthog analytics | Medium | 1 | $9–$19 | Privacy-respecting alternative to Google Analytics. |
| B4 | Image CDN with auto-WebP (Cloudflare Images / Bunny.net) | Medium | 3 | $5–$10 | Replaces direct Unsplash links; faster mobile loads. |
| B5 | Coupon redemption tracking | Medium | 6 | $0 | Schema already has `coupons` table; expose usage stats in admin. |
| B6 | Auto-cancel orders unconfirmed after N hours | Low | 2 | $0 | Extend `tickAutoAdvance()` to cancel orders stuck in `new` for too long. |
| B7 | Print-friendly kitchen ticket | Medium | 3 | $0 | A page at `/admin/orders/[id]/ticket` with print: CSS. |
| B8 | Backup automation | High | 2 | $0 (within Supabase free) | GitHub Action that downloads a nightly schema + data snapshot to S3 / R2. |

### Tier C — Long-term polish (high effort, strategic value)

| # | Item | Impact | Effort (hrs) | Monthly cost | Implementation note |
|---|---|---|---|---|---|
| C1 | Customer accounts (login, order history) | Medium | 20+ | $0 (Supabase Auth free tier) | Reuses Supabase Auth. Order table already has `email` — link by user_id. |
| C2 | Driver app (mobile-only `/driver` route) | High | 30+ | $0 | Real-time pin updates via Supabase Realtime; mark delivered from the road. |
| C3 | Live order tracking page for customers | High | 15 | $0 | Tokenised URL per order; reads status from DB. |
| C4 | Loyalty / referral system | Medium | 20 | $0 | Earn-and-burn points in a new `loyalty_transactions` table. |
| C5 | Multi-language (English + Urdu) | Medium | 12 | $0 | next-intl. Komal's user base is bilingual; Urdu strings move conversion. |
| C6 | Inventory tracking | Low | 25 | $0 | New `ingredients` table, FIFO subtraction on order. Probably overkill for one operator. |
| C7 | A/B testing infra (GrowthBook) | Low | 8 | $0 (self-hosted) | Worth it once traffic ~10× from today. |
| C8 | PCI-certified card vault (move off Safepay redirect) | Low | 60+ | $500+ | Only if Safepay limits become a blocker. |
| C9 | Recipes + COGS tracking | Low | 15 | $0 | Foundation for margin reporting. |

---

## Recurring maintenance — short term

### Weekly

- **Mon morning** — open `/admin` and confirm: yesterday's order count, any unconfirmed orders, any failed Safepay charges.
- **Mid-week** — clear `/admin/messages` (mark read + reply).
- **Friday afternoon** — scan `/admin/reviews` for new platform reviews to feature; respond to anything 4-star or below.

### Monthly

- **First Monday** — `npm outdated`; bump patch versions; redeploy. Pay particular attention to `next`, `@supabase/*`, `react`.
- **Mid-month** — export `orders` to CSV for accounting (right now this means a manual SQL query in Supabase; see B5 for automation).
- **Last day of month** — reconcile Safepay payouts against `orders.payment_status = 'paid'` totals.

### Quarterly

- **Quarter 1, Q2, Q3, Q4** — rotate `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`. Update env in Netlify dashboard.
- Bump Supabase plan if MAU usage > 70% of the free tier.
- Run `npm audit` and patch any high-severity vulns.

### Yearly

- Renew the Netlify domain.
- Renew Safepay merchant agreement.
- Take a full backup of the Supabase project (auth + database + storage).
- Review `tailwind.config.ts` palette against any brand updates.
- Review the OPERATIONS roadmap below — promote Tier B items to Tier A based on what hurt during the year.

### Useful commands

```bash
# Quick health check
npm run type-check && npm run build

# Read live store_settings
node -e "fetch(process.env.NEXT_PUBLIC_SUPABASE_URL+'/rest/v1/store_settings?select=*',{headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY}}).then(r=>r.json()).then(console.log)"

# Count orders in the last 7 days (Supabase SQL Editor)
select count(*) from orders where created_at >= now() - interval '7 days';

# Check Safepay paid totals for the last month
select sum(total_pkr) from orders
where created_at >= now() - interval '30 days' and payment_status = 'paid';
```

---

## Strategic maintenance — long term

### Year 1 (months 1–12)

- Reach steady state of ~10 orders/day. At that volume the free tiers of every service still suffice. Supabase free tier covers ~50,000 monthly active reads.
- Ship Tier A automation items 1–7 by month 3.
- Ship Tier B's WhatsApp + Hours editor + image CDN by month 9.
- Plan: stay on Netlify free, Supabase free, Resend free; estimated cost ~$5/mo (Plausible).

### Year 2–3

- Scale assumption: ~40–80 orders/day. Supabase free tier is borderline (500 MB DB, 5 GB egress). Plan an upgrade to Supabase Pro at $25/mo when:
  - DB size > 350 MB, **or**
  - Monthly egress > 4 GB, **or**
  - You start using Realtime for the driver app (C2).
- Netlify free is 100 GB/mo bandwidth; assume an upgrade to Pro at $19/mo if image traffic eats it.
- Build customer accounts (C1) and the driver app (C2) as you start signing repeat customers and a delivery partner.

### Year 3+

- Data growth math: at 80 orders/day, ~30 KB per order row (incl. items JSONB), you accumulate ~700 MB/year. Plan to archive old `orders` (move closed-out months to a separate archive table or external store) before hitting the 8 GB DB ceiling on Supabase Pro.
- Migrate static images off `images.unsplash.com` to Cloudflare R2 + Image Resizing for full control.
- If MRR allows, hire a part-time dev for incremental improvements; otherwise budget for a 1–2 day quarterly maintenance sprint from this codebase's original developer.

---

## Services & integrations catalogue

### Already integrated

| Service | Plan | What it does | Notes |
|---|---|---|---|
| Supabase | Free | Postgres + Auth + Storage + (future) Realtime | Singleton DB project; row-level security on every table. |
| Netlify | Free | Hosting + CDN + serverless functions | Auto-deploys on `git push` to main. |
| Safepay | Sandbox | Hosted card checkout | Switch `SAFEPAY_ENVIRONMENT=production` + swap keys to go live. |
| Unsplash | Free | Stock photography URLs | Used in the menu and hero. Replace with own photography over time. |
| Google Fonts | Free | Inter + Playfair + Dancing Script | Loaded via `next/font/google`. |

### Short-term integrations (Tier A / B candidates)

| Service | Estimated cost | What it would add |
|---|---|---|
| Twilio (SMS) | $0.50–1 per SMS to PK numbers | Customer + owner SMS notifications |
| Resend (email) | Free up to 3,000/mo | Order receipt emails, daily digests |
| Sentry | Free up to 5,000 events/mo | Error monitoring |
| UptimeRobot | Free | Uptime pings |
| Plausible | $9/mo (10k pageviews) | Privacy-respecting analytics |
| Cloudflare Images | $5/mo (100k images) | Auto-WebP, image CDN |

### Mid- and long-term integrations

| Service | Estimated cost | What it would add |
|---|---|---|
| Twilio WhatsApp Business | $15–40/mo + per-conversation fees | Branded WhatsApp confirmations |
| 360dialog / Wati | $40–80/mo flat | Easier WhatsApp Business setup |
| Linear / GitHub Projects | Free | Track the operations roadmap |
| BunnyCDN / Cloudflare R2 | $0.01/GB | Cheap durable image storage |
| Mixpanel / PostHog | Free → $250/mo | Funnel analytics once you have repeat traffic |

---

## Cost projections

All figures monthly. Card-payment Safepay fees are the biggest variable cost — typically 2.9% + PKR 5 per transaction in PK. Plan for those on top of the line items below.

### Tier 1 — Minimum (today)

| Item | USD | PKR |
|---|---|---|
| Domain | $0 (using komals-coffee.netlify.app) | 0 |
| Supabase | Free | 0 |
| Netlify | Free | 0 |
| Total fixed | **$0** | **0** |
| + Safepay fees on, say, 200 card txns × avg PKR 1,200 | ~$25 | ~PKR 7,000 |

### Tier 2 — Growth (Tier A automation shipped)

| Item | USD | PKR |
|---|---|---|
| Twilio SMS (300/mo) | $7 | ~2,000 |
| Resend (free tier) | $0 | 0 |
| Plausible | $9 | ~2,500 |
| Sentry / UptimeRobot | $0 | 0 |
| Total fixed | **$16** | **~4,500** |
| + Safepay fees | as above | as above |

### Tier 3 — Premium (Tier B + paid Supabase)

| Item | USD | PKR |
|---|---|---|
| Twilio WhatsApp Business | $25 | ~7,000 |
| Supabase Pro | $25 | ~7,000 |
| Netlify Pro | $19 | ~5,300 |
| Plausible / Sentry paid | $20 | ~5,600 |
| Cloudflare Images | $5 | ~1,400 |
| Custom domain | $1 | ~280 |
| Total fixed | **$95** | **~26,500** |
| + Safepay fees | as above | as above |

---

## Risks & contingencies

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Supabase project lost / corrupted | Low | Catastrophic | Schedule nightly `pg_dump` to GitHub or S3 (Tier B item B8). Without backups, the menu + reviews are recoverable from `src/lib/data/`, but orders and admin state are not. |
| Netlify outage | Low | Site offline | Komal's still takes orders on WhatsApp manually. Public side is hostable elsewhere quickly (Vercel, Cloudflare Pages) using the same `next build`. |
| Safepay account suspended | Medium | No card payments | COD continues to work. Provide a clear "Card temporarily unavailable" notice on `/order` — the API already falls back gracefully. |
| Domain expires | Low | Site offline | Calendar reminder 30 days before renewal. Auto-renew via card on Netlify dashboard. |
| Developer unavailable | High over a 2-year window | Site rots | This README + OPERATIONS file is the handover doc. Most workflows are admin-driven so a non-dev can keep running. |
| Stale service-worker corrupts dev | Medium | Lost dev hours | The in-app `CleanPreviewUrl` purge + the README troubleshooting row should be enough. |
| Migration drift (DB ahead/behind code) | Medium | Admin pages 500 | Every new column has a defensive fallback (`getStoreSettings` selects `*` and merges defaults). The busyness pipeline retries inserts without the new column if it does not exist. |
| Inventory mismatch (sold out) | Medium | Customer disappointed | No live inventory today. Mitigate by Komal manually closing the store, or specific items being marked `is_active=false` in `menu_items`. C6 would automate this. |
| Targeted DDoS | Low | Site slow / down | Netlify includes basic mitigation. Consider Cloudflare in front if it ever happens. |
| **Leaked service-role key** | Medium | Catastrophic — full DB control | **Never commit the key.** It is in `.env.local` only. Rotate immediately in Supabase if a leak is suspected — every secret in `.env.local` can be rotated independently. |
| **Compromised admin login** | Medium | Full admin control | Two factors: (1) rotate `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` quarterly; (2) **rotate them right now before public launch** because the dev-default password is in conversation logs. Set new values in the Netlify env panel, redeploy, expire all existing sessions by changing `ADMIN_SESSION_SECRET`. |

---

## Suggested implementation roadmap

Four sprints, two weeks each. Weekly budget assumes ~4 hours of focused dev work.

### Sprint 1 — Notifications + safety

- A3 owner SMS on new orders (1 h)
- A1 customer SMS on confirmation (4 h)
- A6 Sentry (1 h)
- A7 UptimeRobot (0.5 h)
- Rotate `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, redeploy (0.5 h)
- **Cost added: ~$10–$20/mo. Time: ~7 hrs.**

### Sprint 2 — Owner ops

- A2 customer SMS on out-for-delivery (2 h)
- A4 email receipts via Resend (3 h)
- A5 daily sales digest (2 h)
- **Cost added: ~$0–5/mo. Time: ~7 hrs.**

### Sprint 3 — Admin power

- B2 Admin Hours editor (4 h)
- B5 Coupon redemption tracking (6 h)
- B7 Kitchen ticket page (3 h)
- **Cost added: $0. Time: ~13 hrs.**

### Sprint 4 — WhatsApp + scale

- B1 WhatsApp Business API (8–12 h)
- B4 Image CDN migration (3 h)
- B8 Nightly DB backup (2 h)
- **Cost added: ~$20–45/mo. Time: ~16 hrs.**

After Sprint 4 the operation is humming with end-to-end automated customer notifications, near-zero ops risk from data loss, and capacity to scale past 50 orders/day comfortably.

---

## Appendix — handover quick reference

Single table for the future maintainer: where every credential, dashboard, doc lives.

| Asset | Location | Notes |
|---|---|---|
| Source code | This Git repo (origin) | Push to `main` deploys via Netlify. |
| Live URL | `https://komals-coffee.netlify.app` | Domain may change after launch. |
| Admin login URL | `/admin/login` | Credentials in env vars (see `ADMIN_EMAIL` / `ADMIN_PASSWORD`). |
| Supabase dashboard | `https://supabase.com/dashboard/project/<project-ref>` | Project ref is `vubogkpplgcxmkcdyjza` (subdomain in `NEXT_PUBLIC_SUPABASE_URL`). |
| Supabase API keys | `.env.local` + Netlify env panel | Anon key (public), service-role (server-only — never commit). |
| Safepay dashboard | `https://sandbox.api.getsafepay.com` (sandbox) / `https://getsafepay.com` (prod) | Merchant ID + keys in Safepay account. |
| Netlify dashboard | `https://app.netlify.com/sites/komals-coffee/overview` | Build logs, env vars, deploy previews. |
| Domain registrar | Netlify | Auto-renews; check expiry in Domain panel. |
| Onboarding doc | This file + `README.md` | Read both in order: README for "how it works", OPERATIONS for "how to keep it alive". |
| Migration files | `supabase/migrations/` | Numbered, idempotent. Apply via Supabase SQL Editor. |
| Static seed data | `src/lib/data/*.ts` | Menu, hours, reviews, gallery. Edited as code. |
| Image source | `images.unsplash.com` (today) / planned Cloudflare R2 (future) | Replace with own photography over time. |
| Last live test results | This file's git history | Probes are run ad-hoc and deleted; commit logs preserve the dates. |

---

*Last updated: 2026-05-26. Refresh whenever you finish a sprint or change a service.*
