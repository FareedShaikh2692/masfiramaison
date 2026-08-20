import { NextRequest, NextResponse } from "next/server";
import { listProducts, createProduct, type ProductInput } from "@/lib/catalogStore";

export async function GET() {
  const products = await listProducts();
  return NextResponse.json({ products });
}

function validate(body: Partial<ProductInput>): string | null {
  if (!body.name || !String(body.name).trim()) return "A product name is required.";
  if (!Array.isArray(body.fields)) return "fields must be an array.";
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const error = validate(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const product = await createProduct({
    name: body.name,
    categoryId: body.categoryId || null,
    description: body.description || "",
    image: body.image || "",
    additionalImages: body.additionalImages || [],
    flavors: body.flavors || [],
    fields: body.fields || [],
    price: body.price === "" || body.price == null ? null : Number(body.price),
    pricePerUnit: Boolean(body.pricePerUnit),
    weightOptions: body.weightOptions || null,
    packOptions: body.packOptions || null,
    badge: body.badge || null,
    prepTime: body.prepTime || null,
    featured: Boolean(body.featured),
    active: body.active ?? true,
    displayOrder: body.displayOrder ?? 0
  });
  return NextResponse.json({ product });
}
