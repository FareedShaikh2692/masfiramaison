"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";

export interface GalleryDisplayItem {
  id: string;
  image: string;
  alt: string;
  category: string;
}

export default function GalleryClient({ items }: { items: GalleryDisplayItem[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((g) => g.category)))], [items]);
  const [filter, setFilter] = useState("All");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filtered = filter === "All" ? items : items.filter((g) => g.category === filter);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") setLightboxIdx((i) => (i === null ? null : (i + 1) % filtered.length));
      if (e.key === "ArrowLeft") setLightboxIdx((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, filtered.length]);

  return (
    <section id="gallery" className="py-28">
      <div className="container-app">
        <Reveal className="text-center max-w-[680px] mx-auto mb-10">
          <span className="eyebrow justify-center">Our Creations</span>
          <h2 className="text-[clamp(2rem,3.6vw,2.9rem)] mt-3.5">Gallery</h2>
          <p className="mt-4 text-[1.08rem] text-text-muted">A look at some of our handcrafted homemade cakes and desserts.</p>
        </Reveal>

        <div className="flex flex-wrap justify-center gap-2.5 mb-9">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4.5 py-2.5 rounded-full text-[0.86rem] font-medium border transition-colors ${
                filter === c ? "text-white" : "text-text border-border"
              }`}
              style={filter === c ? { background: "var(--gold-dark)", borderColor: "var(--gold-dark)" } : { background: "var(--ivory)" }}
            >
              {c}
            </button>
          ))}
        </div>

        <Reveal delay={0.1} className="columns-2 md:columns-3 lg:columns-4 gap-5 [column-fill:_balance]">
          {filtered.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setLightboxIdx(idx)}
              className="block w-full mb-5 rounded-[18px] overflow-hidden relative group break-inside-avoid shadow-[0_6px_20px_rgba(64,51,42,0.06)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(64,51,42,0.16)]"
            >
              <Image src={item.image} alt={item.alt} width={400} height={400} className="w-full transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(180deg, rgba(64,51,42,0) 55%, rgba(64,51,42,0.7) 100%)" }}>
                <span className="text-white text-[0.85rem] font-semibold">{item.category}</span>
              </span>
            </button>
          ))}
        </Reveal>
      </div>

      {lightboxIdx !== null && filtered[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-6"
          style={{ background: "rgba(64,51,42,0.9)" }}
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxIdx(null)}
        >
          <button aria-label="Close" className="absolute top-6 right-6 text-white text-3xl" onClick={() => setLightboxIdx(null)}>
            &times;
          </button>
          <button
            aria-label="Previous image"
            className="absolute left-4 md:left-8 text-white text-3xl px-3"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
            }}
          >
            &#8249;
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-[600px] w-full">
            <Image
              src={filtered[lightboxIdx].image}
              alt={filtered[lightboxIdx].alt}
              width={600}
              height={600}
              className="w-full rounded-[18px] bg-white"
            />
            <p className="text-center text-white/80 mt-4 text-sm">{filtered[lightboxIdx].alt}</p>
          </div>
          <button
            aria-label="Next image"
            className="absolute right-4 md:right-8 text-white text-3xl px-3"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx((i) => (i === null ? null : (i + 1) % filtered.length));
            }}
          >
            &#8250;
          </button>
        </div>
      )}
    </section>
  );
}
