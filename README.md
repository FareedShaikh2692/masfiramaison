# Masfira Maison

Premium homemade bakery website — Next.js (App Router, TypeScript, Tailwind CSS v4).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Editing the catalog & site config

Almost everything a store owner would need to change day-to-day lives in one file:

**[`src/data/data.ts`](src/data/data.ts)** — business info (phone, Instagram, lead time), the full product catalog, flavors, weights, cake designs, delivery areas & charges, payment method labels, Terms & Conditions text, "Why Us" copy, gallery images, testimonials, Instagram strip.

No prices, UPI IDs, or business address are hard-coded — fields that weren't supplied are left `null`/empty and the UI shows honest fallbacks ("Price on request", "shared with you directly on WhatsApp") until they're filled in.

## How orders work

- `POST /api/orders` creates an order (status `pending`) and persists it via [`src/lib/orderStore.ts`](src/lib/orderStore.ts) to `data/orders.json`, with any uploaded images saved to `data/uploads/`.
- Product orders then go through a payment step; submitting a payment screenshot calls `POST /api/orders/[id]/payment`, which moves the order to `payment_verification`.
- **No order is ever auto-confirmed.** Moving an order to `confirmed` → `preparing` → `ready` → `completed` (see `OrderStatus` in [`src/lib/types.ts`](src/lib/types.ts)) is a manual step for the business owner — there's no payment gateway wired up, by design.
- Custom cake requests skip payment entirely and stay `pending` until the business follows up.

`data/` is gitignored — order records and payment screenshots contain customer PII and must never be committed.

`orderStore.ts` is intentionally a thin file-based store so it's a drop-in swap for a real database (Postgres, SQLite, etc.) once an admin dashboard is built — every route handler only talks to that module.

## Still placeholder, by design

- Product photography — currently elegant line-art SVG illustrations in `public/images/`.
- Business address / city — needed for local SEO structured data in `src/app/layout.tsx`.
- Payment identifiers (UPI ID, Google Pay/Paytm numbers) — set these in `PAYMENT_METHODS` in `src/data/data.ts`.
- Prices — set per-product in `PRODUCTS` (and delivery charges in `DELIVERY_AREAS`) once finalized.
