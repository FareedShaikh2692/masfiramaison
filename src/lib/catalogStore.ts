import { getSql } from "@/lib/db";
import type { Product, ProductCategory, ProductFieldKey, WeightOption } from "@/lib/types";

/**
 * Product catalog backed by Postgres. This is what makes the admin dashboard
 * real: editing a product here is what the public site actually reads —
 * there's no separate "publish" step and no static data file to keep in sync.
 */

let tablesReady: Promise<void> | null = null;
function ensureTables(): Promise<void> {
  if (!tablesReady) {
    tablesReady = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          image TEXT,
          display_order INT NOT NULL DEFAULT 0,
          active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS flavors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT UNIQUE NOT NULL,
          display_order INT NOT NULL DEFAULT 0,
          active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          slug TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
          description TEXT NOT NULL DEFAULT '',
          image TEXT,
          additional_images JSONB NOT NULL DEFAULT '[]',
          flavors JSONB NOT NULL DEFAULT '[]',
          fields JSONB NOT NULL DEFAULT '[]',
          price NUMERIC,
          price_per_unit BOOLEAN NOT NULL DEFAULT false,
          weight_options JSONB,
          pack_options JSONB,
          badge TEXT,
          featured BOOLEAN NOT NULL DEFAULT false,
          active BOOLEAN NOT NULL DEFAULT true,
          display_order INT NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      // Additive migration — the products table already existed in production
      // before this column was added, and CREATE TABLE IF NOT EXISTS doesn't
      // retrofit existing tables.
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS prep_time TEXT`;
      await sql`
        CREATE TABLE IF NOT EXISTS size_presets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          label TEXT NOT NULL,
          value TEXT NOT NULL,
          display_order INT NOT NULL DEFAULT 0,
          active BOOLEAN NOT NULL DEFAULT true
        )
      `;
    })();
  }
  return tablesReady;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ---------------------------------- Categories ---------------------------------- */

export interface CategoryRecord extends ProductCategory {
  id: string;
  slug: string;
  description: string;
  image: string | null;
  displayOrder: number;
  active: boolean;
}

function mapCategory(r: Record<string, unknown>): CategoryRecord {
  return {
    id: r.id as string,
    name: r.name as string,
    slug: r.slug as string,
    description: (r.description as string) || "",
    image: (r.image as string) || null,
    displayOrder: r.display_order as number,
    active: r.active as boolean
  };
}

export async function listCategories(opts: { activeOnly?: boolean } = {}): Promise<CategoryRecord[]> {
  await ensureTables();
  const sql = getSql();
  const rows = opts.activeOnly
    ? await sql`SELECT * FROM categories WHERE active = true ORDER BY display_order ASC, name ASC`
    : await sql`SELECT * FROM categories ORDER BY display_order ASC, name ASC`;
  return rows.map(mapCategory);
}

export async function createCategory(input: {
  name: string;
  description?: string;
  image?: string | null;
  displayOrder?: number;
}): Promise<CategoryRecord> {
  await ensureTables();
  const sql = getSql();
  const slug = slugify(input.name);
  const rows = await sql`
    INSERT INTO categories (name, slug, description, image, display_order)
    VALUES (${input.name}, ${slug}, ${input.description || ""}, ${input.image || null}, ${input.displayOrder ?? 0})
    RETURNING *
  `;
  return mapCategory(rows[0]);
}

export async function updateCategory(
  id: string,
  patch: Partial<{ name: string; description: string; image: string | null; displayOrder: number; active: boolean }>
): Promise<CategoryRecord | null> {
  await ensureTables();
  const sql = getSql();
  const existingRows = await sql`SELECT * FROM categories WHERE id = ${id}`;
  if (!existingRows.length) return null;
  const existing = mapCategory(existingRows[0]);

  const next = { ...existing, ...patch };
  const slug = patch.name ? slugify(patch.name) : existing.slug;
  const rows = await sql`
    UPDATE categories SET
      name = ${next.name}, slug = ${slug}, description = ${next.description},
      image = ${next.image}, display_order = ${next.displayOrder}, active = ${next.active},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return mapCategory(rows[0]);
}

export async function deleteCategory(id: string): Promise<void> {
  await ensureTables();
  const sql = getSql();
  await sql`DELETE FROM categories WHERE id = ${id}`;
}

/* ---------------------------------- Flavors ---------------------------------- */

export interface FlavorRecord {
  id: string;
  name: string;
  displayOrder: number;
  active: boolean;
}

function mapFlavor(r: Record<string, unknown>): FlavorRecord {
  return { id: r.id as string, name: r.name as string, displayOrder: r.display_order as number, active: r.active as boolean };
}

export async function listFlavors(opts: { activeOnly?: boolean } = {}): Promise<FlavorRecord[]> {
  await ensureTables();
  const sql = getSql();
  const rows = opts.activeOnly
    ? await sql`SELECT * FROM flavors WHERE active = true ORDER BY display_order ASC, name ASC`
    : await sql`SELECT * FROM flavors ORDER BY display_order ASC, name ASC`;
  return rows.map(mapFlavor);
}

export async function createFlavor(name: string, displayOrder = 0): Promise<FlavorRecord> {
  await ensureTables();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO flavors (name, display_order) VALUES (${name}, ${displayOrder}) RETURNING *
  `;
  return mapFlavor(rows[0]);
}

export async function updateFlavor(
  id: string,
  patch: Partial<{ name: string; displayOrder: number; active: boolean }>
): Promise<FlavorRecord | null> {
  await ensureTables();
  const sql = getSql();
  const existingRows = await sql`SELECT * FROM flavors WHERE id = ${id}`;
  if (!existingRows.length) return null;
  const existing = mapFlavor(existingRows[0]);
  const next = { ...existing, ...patch };
  const rows = await sql`
    UPDATE flavors SET name = ${next.name}, display_order = ${next.displayOrder}, active = ${next.active}
    WHERE id = ${id} RETURNING *
  `;
  return mapFlavor(rows[0]);
}

export async function deleteFlavor(id: string): Promise<void> {
  await ensureTables();
  const sql = getSql();
  await sql`DELETE FROM flavors WHERE id = ${id}`;
}

/* ---------------------------------- Products ---------------------------------- */

export interface ProductRecord extends Product {
  id: string;
  slug: string;
  categoryId: string | null;
  additionalImages: string[];
  active: boolean;
  displayOrder: number;
}

function mapProduct(r: Record<string, unknown>, categorySlugById: Map<string, string>): ProductRecord {
  const categoryId = r.category_id as string | null;
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    categoryId,
    category: (categoryId && categorySlugById.get(categoryId)) || "",
    description: (r.description as string) || "",
    image: (r.image as string) || "",
    additionalImages: (r.additional_images as string[]) || [],
    flavors: (r.flavors as string[]) || undefined,
    fields: (r.fields as ProductFieldKey[]) || [],
    price: r.price == null ? null : Number(r.price),
    pricePerUnit: (r.price_per_unit as boolean) || undefined,
    weightOptions: (r.weight_options as WeightOption[]) || undefined,
    packOptions: (r.pack_options as WeightOption[]) || undefined,
    badge: (r.badge as string) || undefined,
    featured: (r.featured as boolean) || undefined,
    prepTime: (r.prep_time as string) || undefined,
    active: r.active as boolean,
    displayOrder: r.display_order as number
  };
}

async function categorySlugMap(): Promise<Map<string, string>> {
  const cats = await listCategories();
  return new Map(cats.map((c) => [c.id, c.slug]));
}

export async function listProducts(opts: { activeOnly?: boolean } = {}): Promise<ProductRecord[]> {
  await ensureTables();
  const sql = getSql();
  const [rows, slugMap] = await Promise.all([
    opts.activeOnly
      ? sql`SELECT * FROM products WHERE active = true ORDER BY display_order ASC, name ASC`
      : sql`SELECT * FROM products ORDER BY display_order ASC, name ASC`,
    categorySlugMap()
  ]);
  return rows.map((r) => mapProduct(r, slugMap));
}

export async function getProductById(id: string): Promise<ProductRecord | null> {
  await ensureTables();
  const sql = getSql();
  const [rows, slugMap] = await Promise.all([sql`SELECT * FROM products WHERE id = ${id}`, categorySlugMap()]);
  if (!rows.length) return null;
  return mapProduct(rows[0], slugMap);
}

export interface ProductInput {
  name: string;
  categoryId: string | null;
  description: string;
  image: string;
  additionalImages?: string[];
  flavors?: string[];
  fields: ProductFieldKey[];
  price: number | null;
  pricePerUnit?: boolean;
  weightOptions?: WeightOption[] | null;
  packOptions?: WeightOption[] | null;
  badge?: string | null;
  featured?: boolean;
  prepTime?: string | null;
  active?: boolean;
  displayOrder?: number;
}

export async function createProduct(input: ProductInput): Promise<ProductRecord> {
  await ensureTables();
  const sql = getSql();
  const slug = slugify(input.name);
  const rows = await sql`
    INSERT INTO products (
      slug, name, category_id, description, image, additional_images, flavors, fields,
      price, price_per_unit, weight_options, pack_options, badge, featured, prep_time, active, display_order
    ) VALUES (
      ${slug}, ${input.name}, ${input.categoryId}, ${input.description}, ${input.image},
      ${JSON.stringify(input.additionalImages || [])}::jsonb, ${JSON.stringify(input.flavors || [])}::jsonb,
      ${JSON.stringify(input.fields)}::jsonb, ${input.price}, ${input.pricePerUnit || false},
      ${input.weightOptions ? JSON.stringify(input.weightOptions) : null}::jsonb,
      ${input.packOptions ? JSON.stringify(input.packOptions) : null}::jsonb,
      ${input.badge || null}, ${input.featured || false}, ${input.prepTime || null}, ${input.active ?? true}, ${input.displayOrder ?? 0}
    )
    RETURNING *
  `;
  return mapProduct(rows[0], await categorySlugMap());
}

export async function updateProduct(id: string, input: ProductInput): Promise<ProductRecord | null> {
  await ensureTables();
  const sql = getSql();
  const slug = slugify(input.name);
  const rows = await sql`
    UPDATE products SET
      slug = ${slug}, name = ${input.name}, category_id = ${input.categoryId},
      description = ${input.description}, image = ${input.image},
      additional_images = ${JSON.stringify(input.additionalImages || [])}::jsonb,
      flavors = ${JSON.stringify(input.flavors || [])}::jsonb,
      fields = ${JSON.stringify(input.fields)}::jsonb,
      price = ${input.price}, price_per_unit = ${input.pricePerUnit || false},
      weight_options = ${input.weightOptions ? JSON.stringify(input.weightOptions) : null}::jsonb,
      pack_options = ${input.packOptions ? JSON.stringify(input.packOptions) : null}::jsonb,
      badge = ${input.badge || null}, featured = ${input.featured || false}, prep_time = ${input.prepTime || null},
      active = ${input.active ?? true}, display_order = ${input.displayOrder ?? 0},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  if (!rows.length) return null;
  return mapProduct(rows[0], await categorySlugMap());
}

export async function deleteProduct(id: string): Promise<void> {
  await ensureTables();
  const sql = getSql();
  await sql`DELETE FROM products WHERE id = ${id}`;
}

export async function duplicateProduct(id: string): Promise<ProductRecord | null> {
  await ensureTables();
  const existing = await getProductById(id);
  if (!existing) return null;
  return createProduct({
    name: `${existing.name} (Copy)`,
    categoryId: existing.categoryId,
    description: existing.description,
    image: existing.image,
    additionalImages: existing.additionalImages,
    flavors: existing.flavors,
    fields: existing.fields,
    price: existing.price,
    pricePerUnit: existing.pricePerUnit,
    weightOptions: existing.weightOptions,
    packOptions: existing.packOptions,
    badge: existing.badge,
    prepTime: existing.prepTime,
    featured: false,
    active: false,
    displayOrder: existing.displayOrder
  });
}

/* ---------------------------------- Size Presets ---------------------------------- */
/** A reusable library of size/weight labels admins can pick from when building a product's weight pricing — e.g. "Bento, 500g, 1kg, 1.5kg". */

export interface SizePresetRecord {
  id: string;
  label: string;
  value: string;
  displayOrder: number;
  active: boolean;
}

function mapSizePreset(r: Record<string, unknown>): SizePresetRecord {
  return { id: r.id as string, label: r.label as string, value: r.value as string, displayOrder: r.display_order as number, active: r.active as boolean };
}

export async function listSizePresets(opts: { activeOnly?: boolean } = {}): Promise<SizePresetRecord[]> {
  await ensureTables();
  const sql = getSql();
  const rows = opts.activeOnly
    ? await sql`SELECT * FROM size_presets WHERE active = true ORDER BY display_order ASC`
    : await sql`SELECT * FROM size_presets ORDER BY display_order ASC`;
  return rows.map(mapSizePreset);
}

export async function createSizePreset(label: string, displayOrder = 0): Promise<SizePresetRecord> {
  await ensureTables();
  const sql = getSql();
  const value = label.toLowerCase().replace(/\s+/g, "");
  const rows = await sql`INSERT INTO size_presets (label, value, display_order) VALUES (${label}, ${value}, ${displayOrder}) RETURNING *`;
  return mapSizePreset(rows[0]);
}

export async function updateSizePreset(id: string, patch: Partial<{ label: string; displayOrder: number; active: boolean }>): Promise<SizePresetRecord | null> {
  await ensureTables();
  const sql = getSql();
  const existingRows = await sql`SELECT * FROM size_presets WHERE id = ${id}`;
  if (!existingRows.length) return null;
  const existing = mapSizePreset(existingRows[0]);
  const next = { ...existing, ...patch };
  const value = patch.label ? patch.label.toLowerCase().replace(/\s+/g, "") : existing.value;
  const rows = await sql`
    UPDATE size_presets SET label = ${next.label}, value = ${value}, display_order = ${next.displayOrder}, active = ${next.active}
    WHERE id = ${id} RETURNING *
  `;
  return mapSizePreset(rows[0]);
}

export async function deleteSizePreset(id: string): Promise<void> {
  await ensureTables();
  const sql = getSql();
  await sql`DELETE FROM size_presets WHERE id = ${id}`;
}
