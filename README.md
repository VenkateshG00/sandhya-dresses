# Sandhya Dresses

Online store for Sandhya Dresses — traditional Indian fashion boutique in Challur, Telangana.

## Features

- Product catalogue with search, category filters, price filters
- Product detail with image gallery, size selector, colour selector
- Indian size chart (cm & inches)
- Shopping cart (persisted across sessions)
- Checkout with Razorpay, UPI QR, and Cash on Delivery
- WhatsApp order confirmation
- Admin dashboard: orders, products, CSV bulk upload, low-stock alerts, site settings

## Quick Start

### Prerequisites

- Node.js 18+
- A Cloudflare account (free tier is sufficient)
- Wrangler CLI: `npm install -g wrangler`

### Development

```bash
npm install
npm run dev
```

### Deploy

See [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) for the complete step-by-step deployment guide.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6, TypeScript, Tailwind CSS |
| API | Cloudflare Workers, Hono |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 |
| Payments | Razorpay, UPI, COD |
| State | Zustand, TanStack Query |

## Store Address

Sandhya Dresses  
Near Union Bank, Elabaka Road  
Challur, Veenavanka Mandal  
Karimnagar District, Telangana 505505
