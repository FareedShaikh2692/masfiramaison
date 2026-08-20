import { getSql } from "@/lib/db";

export interface DeliveryZoneRecord {
  id: string;
  name: string;
  chargeType: "fixed" | "range" | "quote"; // quote = "as per delivery service", no fixed charge
  fixedCharge: number | null;
  minCharge: number | null;
  maxCharge: number | null;
  active: boolean;
  displayOrder: number;
}

let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    const sql = getSql();
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS delivery_zones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        charge_type TEXT NOT NULL DEFAULT 'fixed',
        fixed_charge NUMERIC,
        min_charge NUMERIC,
        max_charge NUMERIC,
        active BOOLEAN NOT NULL DEFAULT true,
        display_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return tableReady;
}

function mapZone(r: Record<string, unknown>): DeliveryZoneRecord {
  return {
    id: r.id as string,
    name: r.name as string,
    chargeType: r.charge_type as DeliveryZoneRecord["chargeType"],
    fixedCharge: r.fixed_charge == null ? null : Number(r.fixed_charge),
    minCharge: r.min_charge == null ? null : Number(r.min_charge),
    maxCharge: r.max_charge == null ? null : Number(r.max_charge),
    active: r.active as boolean,
    displayOrder: r.display_order as number
  };
}

export async function listDeliveryZones(opts: { activeOnly?: boolean } = {}): Promise<DeliveryZoneRecord[]> {
  await ensureTable();
  const sql = getSql();
  const rows = opts.activeOnly
    ? await sql`SELECT * FROM delivery_zones WHERE active = true ORDER BY display_order ASC, name ASC`
    : await sql`SELECT * FROM delivery_zones ORDER BY display_order ASC, name ASC`;
  return rows.map(mapZone);
}

export interface DeliveryZoneInput {
  name: string;
  chargeType: DeliveryZoneRecord["chargeType"];
  fixedCharge: number | null;
  minCharge: number | null;
  maxCharge: number | null;
  active?: boolean;
  displayOrder?: number;
}

export async function createDeliveryZone(input: DeliveryZoneInput): Promise<DeliveryZoneRecord> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO delivery_zones (name, charge_type, fixed_charge, min_charge, max_charge, active, display_order)
    VALUES (${input.name}, ${input.chargeType}, ${input.fixedCharge}, ${input.minCharge}, ${input.maxCharge}, ${input.active ?? true}, ${input.displayOrder ?? 0})
    RETURNING *
  `;
  return mapZone(rows[0]);
}

export async function updateDeliveryZone(id: string, patch: Partial<DeliveryZoneInput>): Promise<DeliveryZoneRecord | null> {
  await ensureTable();
  const sql = getSql();
  const existingRows = await sql`SELECT * FROM delivery_zones WHERE id = ${id}`;
  if (!existingRows.length) return null;
  const existing = mapZone(existingRows[0]);
  const next = { ...existing, ...patch };
  const rows = await sql`
    UPDATE delivery_zones SET
      name = ${next.name}, charge_type = ${next.chargeType}, fixed_charge = ${next.fixedCharge},
      min_charge = ${next.minCharge}, max_charge = ${next.maxCharge},
      active = ${next.active}, display_order = ${next.displayOrder}
    WHERE id = ${id}
    RETURNING *
  `;
  return mapZone(rows[0]);
}

export async function deleteDeliveryZone(id: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`DELETE FROM delivery_zones WHERE id = ${id}`;
}
