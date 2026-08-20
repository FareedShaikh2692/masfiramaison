import { getSql } from "@/lib/db";

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    const sql = getSql();
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return tableReady;
}

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT id, email, password_hash, created_at FROM admins WHERE email = ${email.toLowerCase()}`;
  if (!rows.length) return null;
  const r = rows[0];
  return { id: r.id, email: r.email, passwordHash: r.password_hash, createdAt: r.created_at };
}

export async function createAdmin(email: string, passwordHash: string): Promise<AdminUser> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO admins (email, password_hash)
    VALUES (${email.toLowerCase()}, ${passwordHash})
    RETURNING id, email, password_hash, created_at
  `;
  const r = rows[0];
  return { id: r.id, email: r.email, passwordHash: r.password_hash, createdAt: r.created_at };
}

export async function countAdmins(): Promise<number> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT count(*)::int AS count FROM admins`;
  return rows[0].count as number;
}

export async function updateAdminPassword(id: string, passwordHash: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`UPDATE admins SET password_hash = ${passwordHash} WHERE id = ${id}`;
}

export async function findAdminById(id: string): Promise<AdminUser | null> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT id, email, password_hash, created_at FROM admins WHERE id = ${id}`;
  if (!rows.length) return null;
  const r = rows[0];
  return { id: r.id, email: r.email, passwordHash: r.password_hash, createdAt: r.created_at };
}
