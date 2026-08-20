import { NextResponse } from "next/server";
import { CATEGORIES, PRODUCTS, BASIC_FLAVORS, TRES_LECHES_FLAVORS, JAR_FLAVORS, WEIGHTS, BASIC_CAKE_WEIGHTS, TRUFFLE_CAKE_WEIGHTS, CUPCAKE_PACKS } from "@/data/data";
import {
  listCategories,
  listProducts,
  listFlavors,
  listSizePresets,
  createCategory,
  createFlavor,
  createProduct,
  createSizePreset
} from "@/lib/catalogStore";

/**
 * One-time migration from the static catalog (src/data/data.ts) into
 * Postgres. Protected by admin middleware like every other /api/admin
 * route. Each entity type (categories, flavors, products, sizes) is only
 * seeded if it's currently empty, so this is safe to call repeatedly as
 * new starter data is added without re-creating what's already there.
 */
export async function POST() {
  const [existingCategories, existingProducts, existingFlavors, existingSizes] = await Promise.all([
    listCategories(),
    listProducts(),
    listFlavors(),
    listSizePresets()
  ]);

  if (existingCategories.length && existingProducts.length && existingFlavors.length && existingSizes.length) {
    return NextResponse.json({ error: "Starter data is already loaded." }, { status: 409 });
  }

  let categoriesCreated = 0;
  const categoryIdBySlug = new Map<string, string>();
  if (existingCategories.length) {
    existingCategories.forEach((c) => categoryIdBySlug.set(c.slug, c.id));
  } else {
    for (let i = 0; i < CATEGORIES.length; i++) {
      const cat = CATEGORIES[i];
      const created = await createCategory({ name: cat.name, displayOrder: i });
      categoryIdBySlug.set(cat.id, created.id);
      categoriesCreated++;
    }
  }

  let flavorsCreated = 0;
  if (!existingFlavors.length) {
    const flavorNames = Array.from(new Set([...BASIC_FLAVORS, ...TRES_LECHES_FLAVORS, ...JAR_FLAVORS]));
    for (let i = 0; i < flavorNames.length; i++) {
      await createFlavor(flavorNames[i], i);
      flavorsCreated++;
    }
  }

  let productsCreated = 0;
  if (!existingProducts.length) {
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
      productsCreated++;
    }
  }

  let sizesCreated = 0;
  if (!existingSizes.length) {
    const sizeLabels = Array.from(
      new Set([...WEIGHTS, ...BASIC_CAKE_WEIGHTS, ...TRUFFLE_CAKE_WEIGHTS, ...CUPCAKE_PACKS].map((w) => w.label))
    );
    for (let i = 0; i < sizeLabels.length; i++) {
      await createSizePreset(sizeLabels[i], i);
      sizesCreated++;
    }
  }

  return NextResponse.json({
    ok: true,
    categories: categoriesCreated,
    flavors: flavorsCreated,
    products: productsCreated,
    sizes: sizesCreated
  });
}
