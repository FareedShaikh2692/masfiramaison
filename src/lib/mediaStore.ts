import { getSql } from "@/lib/db";

export interface MediaAsset {
  id: string;
  name: string;
  dataUrl: string;
  sourceType: "upload" | "external";
  sourceUrl: string | null;
  createdAt: string;
}

const MAX_IMAGE_LENGTH = 4 * 1024 * 1024;

let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    const sql = getSql();
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS media_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        data_url TEXT NOT NULL,
        source_type TEXT NOT NULL DEFAULT 'upload',
        source_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return tableReady;
}

function mapAsset(r: Record<string, unknown>): MediaAsset {
  return {
    id: r.id as string,
    name: r.name as string,
    dataUrl: r.data_url as string,
    sourceType: r.source_type as MediaAsset["sourceType"],
    sourceUrl: (r.source_url as string) || null,
    createdAt: r.created_at as string
  };
}

export async function listMedia(search?: string): Promise<MediaAsset[]> {
  await ensureTable();
  const sql = getSql();
  const rows = search
    ? await sql`SELECT * FROM media_assets WHERE name ILIKE ${"%" + search + "%"} ORDER BY created_at DESC`
    : await sql`SELECT * FROM media_assets ORDER BY created_at DESC`;
  return rows.map(mapAsset);
}

export async function createMediaAsset(input: { name: string; dataUrl: string; sourceType?: "upload" | "external"; sourceUrl?: string | null }): Promise<MediaAsset> {
  if (input.sourceType !== "external") {
    if (!/^data:image\/[a-zA-Z0-9+.-]+;base64,/.test(input.dataUrl)) {
      throw new Error("Only image uploads are supported.");
    }
    if (input.dataUrl.length > MAX_IMAGE_LENGTH) {
      throw new Error("Image is too large (max ~3MB).");
    }
  }
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO media_assets (name, data_url, source_type, source_url)
    VALUES (${input.name}, ${input.dataUrl}, ${input.sourceType || "upload"}, ${input.sourceUrl || null})
    RETURNING *
  `;
  return mapAsset(rows[0]);
}

export async function deleteMediaAsset(id: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`DELETE FROM media_assets WHERE id = ${id}`;
}
