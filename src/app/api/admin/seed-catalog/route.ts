import { NextResponse } from "next/server";
import { CATEGORIES, PRODUCTS, BASIC_FLAVORS, TRES_LECHES_FLAVORS, JAR_FLAVORS } from "@/data/data";
import { listCategories, listProducts, listFlavors, createCategory, createFlavor, createProduct } from "@/lib/catalogStore";

/**
 * One-time migration from the static catalog (src/data/data.ts) into
 * Postgres. Protected by admin middleware like every other /api/admin
 * route; also refuses to run if the catalog tables already have data, so
 * it's safe to call more than once.
 */
export async function POST() {
  const [existingCategories, existingProducts, existingFlavors] = await Promise.all([
    listCategories(),
    listProducts(),
    listFlavors()
  ]);

  if (existingCategories.length || existingProducts.length || existingFlavors.length) {
    return NextResponse.json({ error: "Catalog already has data — seeding is only for a first-time migration." }, { status: 409 });
  }

  const categoryIdBySlug = new Map<string, string>();
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const created = await createCategory({ name: cat.name, displayOrder: i });
    categoryIdBySlug.set(cat.id, created.id);
  }

  const flavorNames = Array.from(new Set([...BASIC_FLAVORS, ...TRES_LECHES_FLAVORS, ...JAR_FLAVORS]));
  for (let i = 0; i < flavorNames.length; i++) {
    await createFlavor(flavorNames[i], i);
  }

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    await createProduct({
      name: p.name,
      categoryId: categoryIdBySlug.get(p.category) || null,
      description: p.description,
      image: p.image,
      flavors: p.flavors,
      fields: p.fields,
      price: p.price,
      pricePerUnit: p.pricePerUnit,
      weightOptions: p.weightOptions,
      packOptions: p.packOptions,
      badge: p.badge,
      featured: p.featured,
      active: true,
      displayOrder: i
    });
  }

  return NextResponse.json({
    ok: true,
    categories: CATEGORIES.length,
    flavors: flavorNames.length,
    products: PRODUCTS.length
  });
}
