import Image from "next/image";
import { getGalleryPhotos } from "@/lib/reviewStore";
import { getReviewSettings } from "@/lib/settingsStore";

export default async function CustomerGallery() {
  const settings = await getReviewSettings();
  if (!settings.showPhotosPublicly) return null;

  const photos = await getGalleryPhotos();
  if (photos.length === 0) return null;

  return (
    <section id="customer-gallery" className="py-28" style={{ background: "var(--cream)" }}>
      <div className="container-app">
        <div className="text-center max-w-[680px] mx-auto mb-12">
          <span className="eyebrow justify-center">Real Moments</span>
          <h2 className="text-[clamp(2rem,3.6vw,2.9rem)] mt-3.5">Customer Cakes Gallery</h2>
          <p className="mt-4 text-[1.08rem] text-text-muted">Real cakes, real celebrations, shared by our customers.</p>
        </div>

        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 [&>*]:mb-4">
          {photos.slice(0, 16).map(({ review, image }, i) => (
            <div key={`${review.id}-${i}`} className="relative rounded-[14px] overflow-hidden border border-border break-inside-avoid group">
              <Image src={image} alt={`${review.customerName}'s cake`} width={400} height={400} className="w-full h-auto object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-white text-[0.8rem] font-medium m-0">{review.customerName}</p>
                {review.productName && <p className="text-white/80 text-[0.72rem] m-0">{review.productName}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
