import { NextRequest, NextResponse } from "next/server";
import { duplicateProduct } from "@/lib/catalogStore";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await duplicateProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ product });
}
