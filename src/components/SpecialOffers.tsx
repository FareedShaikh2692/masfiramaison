import Image from "next/image";
import { getOffers } from "@/lib/contentStore";

export default async function SpecialOffers() {
  const offers = await getOffers();
  if (!offers.length) return null;

  return (
    <section id="offers" className="py-28" style={{ background: "var(--ivory)" }}>
      <div className="container-app">
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="eyebrow justify-center">Limited Time</span>
          <h2 className="text-[clamp(2rem,3.6vw,2.9rem)] mt-3.5">Special Offers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <div key={offer.id} className="card overflow-hidden flex flex-col">
              {offer.image && (
                <div className="relative aspect-[4/3] bg-blush-soft overflow-hidden">
                  <Image src={offer.image} alt={offer.title} fill sizes="(max-width: 768px) 100vw, 380px" className="object-cover" />
                </div>
              )}
              <div className="p-6 flex flex-col gap-3 flex-1">
                <h3 className="text-[1.28rem]">{offer.title}</h3>
                {offer.description && <p className="text-[0.94rem] text-text-muted m-0">{offer.description}</p>}
                <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-dashed border-border">
                  {offer.price && <span className="font-serif text-[1.05rem] font-semibold text-gold-dark">{offer.price}</span>}
                  {offer.ctaText && (
                    <a href={offer.ctaLink || "#"} className="btn btn-primary btn-sm">
                      {offer.ctaText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
