import { listGalleryImages } from "@/lib/galleryStore";
import GalleryClient from "@/components/GalleryClient";

export default async function Gallery() {
  const images = await listGalleryImages({ activeOnly: true });
  if (!images.length) return null;

  const items = images.map((img) => ({
    id: img.id,
    image: img.image,
    alt: img.alt || img.categoryName || "Masfira Maison cake",
    category: img.categoryName || "Other"
  }));

  return <GalleryClient items={items} />;
}
