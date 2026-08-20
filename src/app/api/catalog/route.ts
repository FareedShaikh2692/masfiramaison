import { NextResponse } from "next/server";
import { listProducts, listCategories, listFlavors } from "@/lib/catalogStore";

/** Public, read-only — only ever returns active products/categories/flavors. */
export async function GET() {
  const [products, categories, flavors] = await Promise.all([
    listProducts({ activeOnly: true }),
    listCategories({ activeOnly: true }),
    listFlavors({ activeOnly: true })
  ]);
  return NextResponse.json({
    products,
    categories: categories.map((c) => ({ id: c.slug, name: c.name })),
    flavors: flavors.map((f) => f.name)
  });
}
