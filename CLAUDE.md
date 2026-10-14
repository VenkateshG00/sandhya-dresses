# Sandhya Dresses — Developer Notes

## Stack

- **Frontend**: React 18, Vite 6, TypeScript (strict), Tailwind CSS
- **Backend**: Cloudflare Workers (Hono), D1 (SQLite), R2 (object storage)
- **Payments**: Razorpay (server-side verification), UPI QR, Cash on Delivery
- **State**: Zustand (persistent cart), TanStack Query (server data)

## Commands

```bash
npm run dev        # Start dev server (Vite + Worker)
npm run build      # Production build (tsc + vite build)
npx wrangler dev   # Worker-only dev (without Vite)
wrangler deploy    # Deploy to Cloudflare
```

## Project Layout

```
src/               React frontend
  components/      Shared UI, layout, product, shop, cart, checkout, admin
  pages/           Route-level pages
  lib/             api.ts, cart.ts, config.ts, utils.ts
  types/           TypeScript domain types
worker/            Cloudflare Worker (Hono API)
  routes/          products, orders, webhooks, config, admin
  lib/             db.ts, auth.ts, r2.ts, razorpay.ts
migrations/        D1 SQL migrations
public/            Static assets (favicon, placeholder, robots.txt, sitemap)
```

## Key Rules

- Prices stored and computed in **paise** (smallest INR unit). ₹100 = 10000 paise.
- Never trust browser-side price totals. Orders route recalculates from DB prices.
- Never hardcode secrets. All secrets via `wrangler secret`.
- Admin session tokens are SHA-256 hashed before storing in D1.
- Razorpay webhook signature must be verified (HMAC-SHA256) before updating order.
- Public `/api/config` endpoint uses an explicit allow-list — never exposes secrets.

## TypeScript

- Strict mode + `exactOptionalPropertyTypes: true`
- Optional props use `prop?: Type | undefined` pattern
- Worker code is excluded from main `tsconfig.json` (Cloudflare types conflict with DOM)

## Admin

URL: `/admin`
Password: set via `wrangler secret put ADMIN_PASSWORD_HASH` (SHA-256 hash of password)

## Address

Sandhya Dresses  
Near Union Bank, Elabaka Road  
Challur, Veenavanka Mandal  
Karimnagar District, Telangana 505505  

**Never use Hyderabad as the address.**
