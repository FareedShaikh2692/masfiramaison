import { sql } from "@vercel/postgres";
import type { OrderRecord } from "@/lib/types";

/**
 * Order store backed by Postgres (Vercel Postgres / Neon).
 *
 * Orders are stored as a JSONB blob per row rather than a rigid column-per-field
 * schema — OrderRecord has many optional fields that change as the order form
 * grows, and this keeps the store a drop-in match for that shape without a
 * migration every time a field is added. `created_at`/`order_id` are real
 * columns so listing/lookup stay simple SQL.
 *
 * Every route handler only talks to the four functions below — swapping to a
 * different backend later only means rewriting this one file.
 */

const MAX_IMAGE_DATA_URL_LENGTH = 4 * 1024 * 1024; // ~3MB of image data as base64

let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        data JSONB NOT NULL
      )
    `.then(() => undefined);
  }
  return tableReady;
}

export async function readOrders(): Promise<OrderRecord[]> {
  await ensureTable();
  const { rows } = await sql`SELECT data FROM orders ORDER BY created_at ASC`;
  return rows.map((r) => r.data as OrderRecord);
}

export async function saveOrder(order: OrderRecord): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO orders (order_id, created_at, updated_at, data)
    VALUES (${order.orderId}, ${order.createdAt}, ${order.updatedAt}, ${JSON.stringify(order)}::jsonb)
    ON CONFLICT (order_id) DO NOTHING
  `;
}

export async function updateOrder(
  orderId: string,
  patch: Partial<OrderRecord>
): Promise<OrderRecord | null> {
  await ensureTable();
  const { rows } = await sql`SELECT data FROM orders WHERE order_id = ${orderId}`;
  if (!rows.length) return null;

  const merged: OrderRecord = { ...(rows[0].data as OrderRecord), ...patch, updatedAt: new Date().toISOString() };
  await sql`
    UPDATE orders SET data = ${JSON.stringify(merged)}::jsonb, updated_at = ${merged.updatedAt}
    WHERE order_id = ${orderId}
  `;
  return merged;
}

/**
 * Validates an uploaded image (reference photo / payment screenshot) and
 * returns it unchanged as a data URL, stored directly in the order's JSONB
 * payload. Local disk isn't an option here — Vercel's serverless functions
 * have a read-only filesystem, so files written there vanish (or throw)
 * between invocations.
 */
export async function saveUploadedImage(dataUrl: string): Promise<string | null> {
  if (!/^data:image\/[a-zA-Z0-9+.-]+;base64,/.test(dataUrl)) return null;
  if (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) return null;
  return dataUrl;
}
