import { getSql } from "@/lib/db";
import { BUSINESS as DEFAULT_BUSINESS, TERMS as DEFAULT_TERMS } from "@/data/data";

export interface BusinessSettings {
  name: string;
  tagline: string;
  phone: string;
  countryCode: string;
  email: string;
  instagramHandle: string;
  instagramUrl: string;
  city: string;
  area: string;
  addressLine: string;
  currencySymbol: string;
  leadTimeDays: number;
  closedWeekdays: number[];
  blackoutDates: string[];
  pickupSlots: { value: string; label: string }[];
}

export interface TermsItem {
  title: string;
  text: string;
}

let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    const sql = getSql();
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return tableReady;
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT data FROM site_settings WHERE key = 'business'`;
  if (!rows.length) return DEFAULT_BUSINESS;
  return { ...DEFAULT_BUSINESS, ...(rows[0].data as Partial<BusinessSettings>) };
}

export async function saveBusinessSettings(settings: BusinessSettings): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO site_settings (key, data, updated_at) VALUES ('business', ${JSON.stringify(settings)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(settings)}::jsonb, updated_at = now()
  `;
}

export async function getTerms(): Promise<TermsItem[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT data FROM site_settings WHERE key = 'terms'`;
  if (!rows.length) return [...DEFAULT_TERMS];
  return rows[0].data as TermsItem[];
}

export async function saveTerms(terms: TermsItem[]): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO site_settings (key, data, updated_at) VALUES ('terms', ${JSON.stringify(terms)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(terms)}::jsonb, updated_at = now()
  `;
}
