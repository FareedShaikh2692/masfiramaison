import Image from "next/image";
import { INSTAGRAM_POSTS } from "@/data/data";
import { getBusinessSettings } from "@/lib/settingsStore";

export default async function InstagramStrip() {
  const business = await getBusinessSettings();
  return (
    <section id="instagram" className="py-28">
      <div className="container-app">
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="eyebrow justify-center">{business.instagramHandle}</span>
          <h2 className="text-[clamp(2rem,3.6vw,2.9rem)] mt-3.5">Follow {business.name}</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3.5">
          {INSTAGRAM_POSTS.map((p, i) => (
            <a key={i} href={business.instagramUrl} target="_blank" rel="noopener" className="relative aspect-square rounded-[10px] overflow-hidden group">
              <Image src={p.image} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <span className="absolute inset-0 bg-gold/0 group-hover:bg-gold/25 transition-colors" />
            </a>
          ))}
        </div>
        <div className="text-center mt-9">
          <a href={business.instagramUrl} target="_blank" rel="noopener" className="btn btn-outline">
            Follow Us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
