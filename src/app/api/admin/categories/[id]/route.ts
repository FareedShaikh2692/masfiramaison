import { NextRequest, NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/lib/catalogStore";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const category = await updateCategory(id, body);
  if (!category) return NextResponse.json({ error: "Category not found." }, { status: 404 });
  return NextResponse.json({ category });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteCategory(id);
  return NextResponse.json({ ok: true });
}
