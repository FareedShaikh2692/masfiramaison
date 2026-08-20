# Masfira Maison

Premium homemade bakery website — Next.js (App Router, TypeScript, Tailwind CSS v4).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.local.example` to `.env.local` and fill in real values to enable Postgres order storage and Razorpay checkout locally — see below.

## Editing the catalog & site config

Almost everything a store owner would need to change day-to-day lives in one file:

**[`src/data/data.ts`](src/data/data.ts)** — business info (phone, Instagram, lead time), the full product catalog, flavors, weights, cake designs, delivery areas & charges, payment method labels, Terms & Conditions text, "Why Us" copy, gallery images, testimonials, Instagram strip.

## How orders work

- `POST /api/orders` creates an order (status `pending`) and persists it via [`src/lib/orderStore.ts`](src/lib/orderStore.ts) to a Postgres table (Vercel Postgres / Neon) — connect a database in the Vercel dashboard (Project → Storage) and it auto-injects the `POSTGRES_URL` env var this reads.
- Product orders then go through a payment step. Two paths:
  - **Razorpay** (real UPI/Google Pay/Paytm/card checkout) — if `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are set, a verified payment signature is the one thing in the app allowed to move an order straight to `confirmed`, since a valid signature is real cryptographic proof the payment succeeded.
  - **Manual** (screenshot upload or cash-at-pickup) — falls back automatically when Razorpay isn't configured; moves the order to `payment_verification` for the business owner to check by hand.
- Custom cake requests skip payment entirely and stay `pending` until the business follows up.
- Every order gets a printable invoice at `/invoice/[orderId]`.

Uploaded images (reference photos, payment screenshots) are stored as base64 data URLs directly in the order's row — there's no local disk involved, since Vercel's serverless functions can't write to one.

`orderStore.ts` is intentionally a thin wrapper (`readOrders` / `saveOrder` / `updateOrder` / `saveUploadedImage`) — every route handler only talks to those four functions, so swapping the backend again later is a one-file change.

## Environment variables

See [`.env.local.example`](.env.local.example) for the full list and where to get each one:

- `POSTGRES_URL` (or whatever the Vercel Postgres/Neon integration names it) — order storage. Without it, order creation fails.
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` — optional; enables real online checkout instead of the manual flow.

## Still placeholder, by design

- Product photography — currently elegant line-art SVG illustrations in `public/images/`.
- Business address / city — already set from the real details provided; update in `BUSINESS` in `src/data/data.ts` if it changes.
- Payment identifiers (UPI ID, Google Pay/Paytm numbers) for the *manual* payment flow — set these in `PAYMENT_METHODS` in `src/data/data.ts`. (Not needed if Razorpay is configured.)
