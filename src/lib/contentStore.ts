import { getSql } from "@/lib/db";

export interface HeroBanner {
  image: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface SpecialOffer {
  id: string;
  image: string;
  title: string;
  description: string;
  price: string;
  ctaText: string;
  ctaLink: string;
}

const DEFAULT_BANNER: HeroBanner = {
  image: "/images/product-basic-white-cake.jpg",
  heading: "Beautifully Baked. Made For Your Moments.",
  description: "Handcrafted homemade cakes and desserts, freshly prepared with love for birthdays, celebrations, and every special moment.",
  buttonText: "Order Now",
  buttonLink: "#order"
};

let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    const sql = getSql();
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS site_content (
        key TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return tableReady;
}

export async function getHeroBanner(): Promise<HeroBanner> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT data FROM site_content WHERE key = 'banner'`;
  if (!rows.length) return DEFAULT_BANNER;
  return { ...DEFAULT_BANNER, ...(rows[0].data as Partial<HeroBanner>) };
}

export async function saveHeroBanner(banner: HeroBanner): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO site_content (key, data, updated_at) VALUES ('banner', ${JSON.stringify(banner)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(banner)}::jsonb, updated_at = now()
  `;
}

export async function getOffers(): Promise<SpecialOffer[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT data FROM site_content WHERE key = 'offers'`;
  if (!rows.length) return [];
  return rows[0].data as SpecialOffer[];
}

export async function saveOffers(offers: SpecialOffer[]): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO site_content (key, data, updated_at) VALUES ('offers', ${JSON.stringify(offers)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(offers)}::jsonb, updated_at = now()
  `;
}
