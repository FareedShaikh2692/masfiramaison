import { NextRequest, NextResponse } from "next/server";
import { listCategories, createCategory } from "@/lib/catalogStore";

export async function GET() {
  const categories = await listCategories();
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "A category name is required." }, { status: 400 });
  }
  const category = await createCategory({
    name: body.name,
    description: body.description,
    image: body.image,
    displayOrder: body.displayOrder
  });
  return NextResponse.json({ category });
}
