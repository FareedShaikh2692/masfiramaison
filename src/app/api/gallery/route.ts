import { NextResponse } from "next/server";
import { listGalleryImages } from "@/lib/galleryStore";

export async function GET() {
  const images = await listGalleryImages({ activeOnly: true });
  return NextResponse.json({ images });
}
