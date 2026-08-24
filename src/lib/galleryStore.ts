import { getSql } from "@/lib/db";

export interface GalleryImageRecord {
  id: string;
  image: string;
  categoryId: string | null;
  categoryName: string | null;
  alt: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
}

let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    const sql = getSql();
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        image TEXT NOT NULL,
        category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        alt TEXT NOT NULL DEFAULT '',
        display_order INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return tableReady;
}

function mapImage(r: Record<string, unknown>): GalleryImageRecord {
  return {
    id: r.id as string,
    image: r.image as string,
    categoryId: (r.category_id as string) || null,
    categoryName: (r.category_name as string) || null,
    alt: (r.alt as string) || "",
    displayOrder: r.display_order as number,
    active: r.active as boolean,
    createdAt: r.created_at as string
  };
}

export async function listGalleryImages(opts: { activeOnly?: boolean } = {}): Promise<GalleryImageRecord[]> {
  await ensureTable();
  const sql = getSql();
  const rows = opts.activeOnly
    ? await sql`
        SELECT g.*, c.name AS category_name FROM gallery_images g
        LEFT JOIN categories c ON c.id = g.category_id
        WHERE g.active = true
        ORDER BY g.display_order ASC, g.created_at DESC
      `
    : await sql`
        SELECT g.*, c.name AS category_name FROM gallery_images g
        LEFT JOIN categories c ON c.id = g.category_id
        ORDER BY g.display_order ASC, g.created_at DESC
      `;
  return rows.map(mapImage);
}

export interface GalleryImageInput {
  image: string;
  categoryId: string | null;
  alt: string;
  displayOrder?: number;
  active?: boolean;
}

export async function createGalleryImage(input: GalleryImageInput): Promise<GalleryImageRecord> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO gallery_images (image, category_id, alt, display_order, active)
    VALUES (${input.image}, ${input.categoryId}, ${input.alt}, ${input.displayOrder ?? 0}, ${input.active ?? true})
    RETURNING *
  `;
  return mapImage(rows[0]);
}

export async function updateGalleryImage(id: string, patch: Partial<GalleryImageInput>): Promise<GalleryImageRecord | null> {
  await ensureTable();
  const sql = getSql();
  const existingRows = await sql`SELECT * FROM gallery_images WHERE id = ${id}`;
  if (!existingRows.length) return null;
  const existing = mapImage(existingRows[0]);
  const next = { ...existing, ...patch };
  const rows = await sql`
    UPDATE gallery_images SET
      image = ${next.image}, category_id = ${next.categoryId}, alt = ${next.alt},
      display_order = ${next.displayOrder}, active = ${next.active}
    WHERE id = ${id}
    RETURNING *
  `;
  return mapImage(rows[0]);
}

export async function deleteGalleryImage(id: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`DELETE FROM gallery_images WHERE id = ${id}`;
}
