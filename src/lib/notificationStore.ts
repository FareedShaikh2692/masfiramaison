import { getSql } from "@/lib/db";

export type NotificationType =
  | "new_order"
  | "payment_received"
  | "payment_pending"
  | "order_cancelled"
  | "custom_request"
  | "delivery_approaching";

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId: string | null;
  read: boolean;
  createdAt: string;
}

let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    const sql = getSql();
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        order_id TEXT,
        read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return tableReady;
}

function mapNotification(r: Record<string, unknown>): NotificationRecord {
  return {
    id: r.id as string,
    type: r.type as NotificationType,
    title: r.title as string,
    message: r.message as string,
    orderId: (r.order_id as string) || null,
    read: r.read as boolean,
    createdAt: r.created_at as string
  };
}

export async function createNotification(input: {
  type: NotificationType;
  title: string;
  message: string;
  orderId?: string | null;
}): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO notifications (type, title, message, order_id)
    VALUES (${input.type}, ${input.title}, ${input.message}, ${input.orderId || null})
  `;
}

export async function listNotifications(limit = 30): Promise<NotificationRecord[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT * FROM notifications ORDER BY created_at DESC LIMIT ${limit}`;
  return rows.map(mapNotification);
}

export async function countUnreadNotifications(): Promise<number> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT count(*)::int AS count FROM notifications WHERE read = false`;
  return rows[0].count as number;
}

export async function markNotificationRead(id: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`UPDATE notifications SET read = true WHERE id = ${id}`;
}

export async function markAllNotificationsRead(): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`UPDATE notifications SET read = true WHERE read = false`;
}
