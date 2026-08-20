import { getSql } from "@/lib/db";
import { readOrders } from "@/lib/orderStore";

export interface CustomerSummary {
  phone: string;
  name: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  favoriteProduct: string | null;
  status: "active" | "new" | "lapsed";
  notes: string;
}

let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    const sql = getSql();
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS customer_notes (
        phone TEXT PRIMARY KEY,
        notes TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return tableReady;
}

/** Customers aren't a separate signup flow — they're derived from order history, grouped by phone number. */
export async function listCustomers(): Promise<CustomerSummary[]> {
  await ensureTable();
  const sql = getSql();
  const [orders, noteRows] = await Promise.all([readOrders(), sql`SELECT * FROM customer_notes`]);
  const notesByPhone = new Map(noteRows.map((r) => [r.phone as string, r.notes as string]));

  const byPhone = new Map<string, typeof orders>();
  for (const o of orders) {
    const list = byPhone.get(o.phone) || [];
    list.push(o);
    byPhone.set(o.phone, list);
  }

  const now = Date.now();
  const summaries: CustomerSummary[] = [];
  for (const [phone, customerOrders] of byPhone) {
    const sorted = customerOrders.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latest = sorted[0];
    const totalSpent = customerOrders.reduce((sum, o) => sum + (o.advancePaid || 0), 0);
    const daysSinceLast = (now - new Date(latest.createdAt).getTime()) / (1000 * 60 * 60 * 24);

    const productCounts = new Map<string, number>();
    for (const o of customerOrders) productCounts.set(o.productName, (productCounts.get(o.productName) || 0) + 1);
    const favoriteProduct = [...productCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    summaries.push({
      phone,
      name: latest.fullName,
      email: latest.email,
      totalOrders: customerOrders.length,
      totalSpent,
      lastOrderDate: latest.createdAt,
      favoriteProduct,
      status: customerOrders.length === 1 ? "new" : daysSinceLast > 60 ? "lapsed" : "active",
      notes: notesByPhone.get(phone) || ""
    });
  }

  return summaries.sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
}

export async function getCustomerOrders(phone: string) {
  const orders = await readOrders();
  return orders.filter((o) => o.phone === phone).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveCustomerNotes(phone: string, notes: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO customer_notes (phone, notes, updated_at) VALUES (${phone}, ${notes}, now())
    ON CONFLICT (phone) DO UPDATE SET notes = ${notes}, updated_at = now()
  `;
}
