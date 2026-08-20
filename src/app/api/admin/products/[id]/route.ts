import { NextRequest, NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct, type ProductInput } from "@/lib/catalogStore";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "A product name is required." }, { status: 400 });
  }

  const input: ProductInput = {
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
  };

  const product = await updateProduct(id, input);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
