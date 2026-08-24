import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateGalleryImage, deleteGalleryImage, type GalleryImageInput } from "@/lib/galleryStore";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const patch: Partial<GalleryImageInput> = {};
  if (typeof body.image === "string") patch.image = body.image;
  if (typeof body.categoryId !== "undefined") patch.categoryId = body.categoryId;
  if (typeof body.alt === "string") patch.alt = body.alt;
  if (typeof body.displayOrder === "number") patch.displayOrder = body.displayOrder;
  if (typeof body.active === "boolean") patch.active = body.active;

  const image = await updateGalleryImage(id, patch);
  if (!image) return NextResponse.json({ error: "Image not found." }, { status: 404 });
  revalidatePath("/", "layout");
  return NextResponse.json({ image });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteGalleryImage(id);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
