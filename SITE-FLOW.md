# Komal's Coffee — Site Flow Diagrams

A complete pictorial walkthrough of the website for explaining to the client. Every block below is a self-contained **Mermaid** diagram. Open https://mermaid.live, paste **one block at a time** (the lines between the ```` ```mermaid ```` fences only — not the fences themselves), and the rendered diagram appears on the right.

Use the heading above each block as the title when you talk through it.

---

## Table of contents

1. [The big picture — public site + admin](#1-the-big-picture--public-site--admin)
2. [Customer order journey — step by step](#2-customer-order-journey--step-by-step)
3. [What the admin can do](#3-what-the-admin-can-do)
4. [Deals + coupons lifecycle](#4-deals--coupons-lifecycle)
5. [How "Open / Closed" is decided](#5-how-open--closed-is-decided)
6. [Busyness — automatic order progression](#6-busyness--automatic-order-progression)
7. [Database tables and relationships](#7-database-tables-and-relationships)
8. [Hosting + deployment pipeline](#8-hosting--deployment-pipeline)

---

## 1. The big picture — public site + admin

Everything a visitor or the admin can reach, on one map. The public site is on the left; the admin dashboard is on the right.

```mermaid
flowchart TB
    Visitor((🧑 Visitor))

    subgraph Public["🌐 PUBLIC WEBSITE"]
        direction TB
        Home["🏠 Home<br/>hero · marquee · story<br/>bestsellers · reviews · CTA"]
        Menu["📜 Menu<br/>searchable + categorised"]
        Drink["☕ Drink detail<br/>image · description · price<br/>Add to cart"]
        Order["🛒 Order page<br/>picker · coupon · address<br/>cash or card"]
        Success["✅ Order success<br/>receipt · print · WhatsApp"]
        About["👋 About / Story"]
        Gallery["📸 Gallery"]
        Reviews["⭐ Reviews · 28 entries"]
        Contact["📞 Contact form"]
    end

    Visitor --> Home
    Home --> Menu
    Menu --> Drink
    Drink --> Order
    Menu --> Order
    Home --> Order
    Order --> Success
    Home --> About
    Home --> Gallery
    Home --> Reviews
    Home --> Contact

    AdminUser((🧑‍🍳 Admin))

    subgraph Admin["🔒 ADMIN DASHBOARD"]
        direction TB
        Login["🔑 Login"]
        Dashboard["📊 Dashboard<br/>stats · busyness · recent orders"]

        OrdersAdm["📦 Orders"]
        Revenue["💰 Revenue report"]
        Products["☕ Products"]
        Cats["📁 Categories"]
        Deals["✨ Deals"]
        Coupons["🎟️ Coupons"]
        Rev["⭐ Reviews"]
        Msg["💬 Messages"]
        News["📧 Newsletter"]
        StoreSet["🏪 Store status"]
        Anncm["📢 Announcement"]
        Busy["🎚️ Busyness"]
    end

    AdminUser --> Login
    Login --> Dashboard
    Dashboard --> OrdersAdm
    Dashboard --> Revenue
    Dashboard --> Products
    Dashboard --> Cats
    Dashboard --> Deals
    Dashboard --> Coupons
    Dashboard --> Rev
    Dashboard --> Msg
    Dashboard --> News
    Dashboard --> StoreSet
    Dashboard --> Anncm
    Dashboard --> Busy

    Order -. saves to .-> DB[(🗄️ Supabase<br/>database)]
    OrdersAdm -. reads + writes .-> DB
    Coupons -. reads + writes .-> DB
    Deals -. reads + writes .-> DB
    StoreSet -. controls .-> DB
    DB -. powers banners and<br/>store-status chip on .-> Public
```

---

## 2. Customer order journey — step by step

Exactly what happens from the moment a visitor adds something to the cart to the moment Komal is notified.

```mermaid
sequenceDiagram
    actor C as 🧑 Customer
    participant Web as 🌐 Website
    participant Cart as 🛒 Cart Drawer
    participant API as ⚙️ Order API
    participant DB as 🗄️ Supabase
    participant Pay as 💳 Safepay
    participant K as 🧑‍🍳 Komal

    C->>Web: Browse menu, click "Add to cart"
    Web->>Cart: Save line item (also to localStorage)
    Cart-->>C: Floating button shows item count

    C->>Web: Open /order, fill name + address
    opt Has a code
        C->>Web: Type coupon code, click Apply
        Web->>API: POST /api/coupons/validate
        API->>DB: Check coupon (active, in window,<br/>max_uses, min order)
        DB-->>API: Coupon row
        API-->>Web: Preview discount + new total
    end

    C->>Web: Click "Place order"
    Web->>API: POST /api/orders

    Note over API,DB: Server is the authority — never trusts<br/>the client's claimed total

    API->>API: Recompute subtotal from items
    opt Coupon present
        API->>DB: Re-validate coupon (same logic)
        API->>DB: redeem_coupon() RPC (atomic)
        DB-->>API: Redeemed row or null
    end
    API->>DB: INSERT orders row<br/>(subtotal, discount, coupon, total)

    alt 💳 Card payment
        API->>Pay: Create checkout tracker
        Pay-->>API: Hosted-checkout URL
        API-->>Web: Redirect to Safepay
        C->>Pay: Enter card on Safepay
        Pay-->>C: Redirect to /order/success
        Web->>API: GET /api/orders/[id]/summary
        API-->>Web: Receipt: subtotal, discount, total
        Web-->>C: Receipt + print button + Message Komal
    else 💰 Cash on delivery
        API-->>Web: Done — inline confirmation
        Web->>Cart: Clear
        Web-->>C: "Order received" panel
    end

    Note over DB,K: New order appears in /admin/orders.
    K->>DB: Marks status "confirmed"
    K->>C: WhatsApp confirmation (uses<br/>pre-filled deep-link button)
```

---

## 3. What the admin can do

Every screen the admin can reach, grouped by purpose. Each leaf is one page in the dashboard.

```mermaid
flowchart LR
    Login["🔑 /admin/login"] --> Dash["📊 Dashboard<br/>(/admin)"]

    Dash --> Ovs["🅰 Overview"]
    Ovs --> Stats["Stats by date range<br/>orders · revenue · pending · avg"]
    Ovs --> RevRep["Revenue report<br/>by-day chart · CSV-friendly"]
    Ovs --> OrdL["Orders list<br/>filter: range · status · coupon · search<br/>summary chips · CSV export"]
    OrdL --> OrdDet["Order detail<br/>items · customer<br/>📞 Call · 💬 WhatsApp<br/>status controls"]

    Dash --> Cat["🅱 Catalog"]
    Cat --> ProdL["Products CRUD"]
    Cat --> CatL["Categories CRUD"]
    Cat --> DealL["Deals CRUD<br/>live · scheduled · expired · disabled"]
    Cat --> CpnL["Coupons CRUD<br/>+ per-code analytics<br/>+ redemption history"]

    Dash --> Eng["🅲 Engagement"]
    Eng --> RvM["Reviews moderation"]
    Eng --> MsgIn["Messages inbox"]
    Eng --> NwsL["Newsletter subscribers"]

    Dash --> Cfg["🅳 Configuration"]
    Cfg --> StSet["Store status<br/>open/close · reason · reopen time"]
    Cfg --> AncF["Announcement banner<br/>top-of-site marketing strip"]
    Cfg --> BzyF["Busyness<br/>×1 / ×2 / ×3 multiplier<br/>auto-advance timers"]
```

---

## 4. Deals + coupons lifecycle

How a marketing campaign goes from an idea in the admin head to a discount on a customer's order.

```mermaid
flowchart TB
    Admin([🧑‍🍳 Admin]) -->|creates| Coupon["🎟️ Coupon<br/>code · percent or flat · value<br/>min order · max uses · window"]
    Admin -->|creates| Deal["✨ Deal · marketing tile<br/>title · image · badge<br/>discount headline · window"]

    Deal -. copy mentions .-> Coupon
    Deal -->|is_active AND in window| DealsStrip["📣 DealsStrip<br/>visible on /order page"]

    Customer([🧑 Customer]) -->|sees| DealsStrip
    Customer -->|types code| CouponInput["💬 CouponInput field"]
    CouponInput -->|preview| Val["⚙️ /api/coupons/validate"]
    Val --> Coupon
    Val -->|"{discount, total}<br/>or error reason"| CouponInput

    Customer -->|"places order"| OrderAPI["⚙️ /api/orders"]
    OrderAPI -->|re-validates server-side| Coupon
    OrderAPI -->|atomic| RPC[("Postgres function<br/>redeem_coupon()<br/>UPDATE used_count<br/>only if max_uses unmet")]
    RPC -->|success| Ord["📦 orders row stores<br/>subtotal · discount · coupon_code"]
    RPC -.->|"race lost — proceeds<br/>without the discount"| OrdNoDisc["📦 orders row<br/>no discount"]

    Ord -.->|aggregated| Analytics["📊 Admin analytics<br/>per-coupon redemptions<br/>discount given · top performer"]
    Analytics --> Admin
```

---

## 5. How "Open / Closed" is decided

Three signals combine to decide whether the store accepts orders right now.

```mermaid
flowchart TB
    A[🔘 Admin manual switch<br/>store_settings.is_open] --> Combine
    B[📅 Published schedule<br/>site.hours]:::sched --> Combine
    C[⏰ Pakistan clock<br/>Asia/Karachi now]:::sched --> Combine

    Combine{"Effective<br/>store state"}

    Combine -->|"is_open = false"| X[🔴 manually_closed<br/>dark banner across site<br/>/api/orders → 503]
    Combine -->|"is_open = true<br/>but outside hours"| Y[🟠 after_hours<br/>banner with reopen time]
    Combine -->|"is_open = true<br/>and within hours"| Z[🟢 OPEN<br/>orders accepted normally]

    X --> Live[📡 Hero status badge<br/>re-checks every 30 s<br/>on tab focus]
    Y --> Live
    Z --> Live

    classDef sched fill:#fef3c7,stroke:#a16207
```

---

## 6. Busyness — automatic order progression

Komal sets a busyness level (Normal / Busy / Super busy) which multiplies the auto-advance timers. New orders crawl forward through the pipeline by themselves; final delivery is always manual.

```mermaid
stateDiagram-v2
    direction LR
    [*] --> new: Order placed
    new --> confirmed: ⏱ after t1 = base × multiplier<br/>default 2 min
    confirmed --> out_for_delivery: ⏱ after t2 = base × multiplier<br/>default 10 min
    out_for_delivery --> delivered: ✋ manual<br/>(Komal / driver)

    new --> cancelled: ✋ manual
    confirmed --> cancelled: ✋ manual
    out_for_delivery --> cancelled: ✋ manual

    delivered --> [*]
    cancelled --> [*]

    note right of new
        Multiplier set in
        /admin/busyness:
          Normal = ×1
          Busy = ×2
          Super busy = ×3
    end note
```

---

## 7. Database tables and relationships

The Supabase schema. Each box is a table; arrows mark foreign keys / soft links.

```mermaid
erDiagram
    menu_categories ||--o{ menu_items : "has many"
    orders }o..o| coupons : "redeemed via coupon_code"

    menu_categories {
        uuid id PK
        text slug UK
        text name
        int sort_order
    }

    menu_items {
        uuid id PK
        text slug UK
        text name
        int price_pkr
        text image_url
        boolean is_bestseller
        boolean is_signature
    }

    orders {
        uuid id PK
        text name
        text phone
        text delivery_address
        jsonb items
        int subtotal_pkr
        int discount_pkr
        text coupon_code
        int total_pkr
        text status
        text payment_method
        text payment_status
        timestamptz auto_advance_at
        timestamptz created_at
    }

    coupons {
        uuid id PK
        text code UK
        text kind
        int value
        int min_order_pkr
        int max_uses
        int used_count
        timestamptz starts_at
        timestamptz expires_at
        boolean is_active
    }

    deals {
        uuid id PK
        text title
        text description
        text image_url
        int discount_pkr
        int discount_percent
        timestamptz valid_from
        timestamptz valid_until
        boolean is_active
    }

    reviews {
        uuid id PK
        text source
        text author_name
        int rating
        text body
        date reviewed_at
    }

    store_settings {
        int id PK
        boolean is_open
        text closed_reason
        timestamptz closed_until
        text announcement
        text busyness_level
        jsonb auto_progress_minutes
    }

    contact_messages {
        uuid id PK
        text name
        text email
        text message
        boolean handled
    }

    newsletter_subscribers {
        uuid id PK
        text email UK
    }

    gallery_images {
        uuid id PK
        text url
        text alt
    }
```

---

## 8. Hosting + deployment pipeline

What happens between a `git push` and the live site updating.

```mermaid
flowchart LR
    Dev([👨‍💻 Developer]) -->|git push to main| GH[🐙 GitHub repository]
    GH -->|webhook| NL[☁️ Netlify<br/>build + deploy]
    NL --> CDN[🌍 Netlify CDN<br/>global edge nodes]

    Visitor([🧑 Visitor]) -->|HTTPS| CDN
    AdminU([🧑‍🍳 Admin]) -->|HTTPS| CDN

    NL -. environment vars .-> Cfg[🔐 .env values<br/>Supabase keys<br/>Safepay keys<br/>admin password]

    CDN <-->|server requests| Fns[⚙️ Netlify Functions<br/>API routes from Next.js]
    Fns -->|service-role key<br/>no-store fetch| SB[(🗄️ Supabase<br/>Postgres + RLS)]
    Fns -->|create tracker / redirect| SP[💳 Safepay<br/>hosted checkout]

    Visitor -.->|complete payment| SP
    SP -.->|webhook<br/>status = paid| Fns
    SP -.->|redirect back| CDN

    Visitor -. WhatsApp deep-link .-> WA[💬 WhatsApp<br/>directly to Komal's number]
    AdminU -. order-detail WhatsApp button .-> WA
```

---

## How to present these to the client

1. **Open** https://mermaid.live in your browser.
2. **Open** this file (`SITE-FLOW.md`) in any text viewer.
3. For each section in turn:
   - Copy the lines between the ```` ```mermaid ```` and ```` ``` ```` fences.
   - Paste into the Mermaid Live editor's left panel.
   - The diagram renders instantly on the right.
   - Walk the client through it using the short paragraph above the block as your script.
4. Mermaid Live has an **Export → PNG / SVG** button if you want to save each diagram as an image for a slide deck.

> 💡 Tip — diagrams 1, 3, and 7 are the most impressive for a non-technical client. Lead with those, then drill into the journey (diagram 2) and the coupon flow (diagram 4) only if they want to go deeper.
