import { promises as fs } from "fs";
import path from "path";
import type { OrderRecord } from "@/lib/types";

/**
 * Minimal file-based order store so the ordering flow is real
 * (orders persist, get a stable ID, and carry a status) without
 * standing up a database for a homemade-bakery site.
 *
 * This is intentionally a thin, swappable layer: a future admin
 * dashboard just needs to replace these three functions with real
 * database calls — every route handler only talks to this module.
 *
 * NOTE: serverless hosts (e.g. Vercel) ship a read-only filesystem
 * outside `/tmp`, so this works as-is for a traditional Node host
 * (or `next start` on a VPS); moving to Postgres/SQLite is a drop-in
 * swap here before deploying to a serverless target.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

async function ensureStore() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  try {
    await fs.access(ORDERS_FILE);
  } catch {
    await fs.writeFile(ORDERS_FILE, "[]", "utf-8");
  }
}

export async function readOrders(): Promise<OrderRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(ORDERS_FILE, "utf-8");
  try {
    return JSON.parse(raw) as OrderRecord[];
  } catch {
    return [];
  }
}

export async function saveOrder(order: OrderRecord): Promise<void> {
  const orders = await readOrders();
  orders.push(order);
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

export async function updateOrder(
  orderId: string,
  patch: Partial<OrderRecord>
): Promise<OrderRecord | null> {
  const orders = await readOrders();
  const idx = orders.findIndex((o) => o.orderId === orderId);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], ...patch, updatedAt: new Date().toISOString() };
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  return orders[idx];
}

/** Saves a base64 data-URL image to disk (outside /public — these can contain payment info) and returns its stored filename. */
export async function saveUploadedImage(dataUrl: string, prefix: string): Promise<string | null> {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  await ensureStore();
  const ext = match[1].split("/")[1].replace("jpeg", "jpg");
  const filename = `${prefix}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(match[2], "base64");
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);
  return filename;
}
