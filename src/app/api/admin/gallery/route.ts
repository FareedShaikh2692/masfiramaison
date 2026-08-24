import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { listGalleryImages, createGalleryImage } from "@/lib/galleryStore";

export async function GET() {
  const images = await listGalleryImages();
  return NextResponse.json({ images });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.image) {
    return NextResponse.json({ error: "An image is required." }, { status: 400 });
  }
  const image = await createGalleryImage({
    image: body.image,
    categoryId: body.categoryId || null,
    alt: body.alt || "",
    displayOrder: body.displayOrder,
    active: body.active
  });
  revalidatePath("/", "layout");
  return NextResponse.json({ image });
}
