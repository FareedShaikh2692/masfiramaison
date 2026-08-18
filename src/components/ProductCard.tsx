"use client";

import Image from "next/image";
import { BUSINESS } from "@/data/data";
import { useOrder } from "@/components/order/OrderContext";
import type { Product } from "@/lib/types";

export default function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const { openProductOrder } = useOrder();

  return (
    <article
      className={`card overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(64,51,42,0.10)] ${
        featured ? "ring-1 ring-gold-light" : ""
      }`}
    >
      <div className="relative aspect-[4/3] bg-blush-soft overflow-hidden">
        {product.badge && (
          <span className="absolute top-4 left-4 z-10 text-white text-[0.7rem] font-semibold uppercase tracking-wide px-3.5 py-1.5 rounded-full" style={{ background: "var(--gold-dark)" }}>
            {product.badge}
          </span>
        )}
        <Image src={product.image} alt={`${product.name} — ${BUSINESS.name}`} fill sizes="(max-width: 768px) 100vw, 320px" className="object-cover" />
      </div>
      <div className="p-6 flex flex-col gap-3 flex-1">
        <h3 className="text-[1.28rem]">{product.name}</h3>
        <p className="text-[0.94rem] text-text-muted m-0">{product.description}</p>
        {product.flavors && (
          <p className="text-[0.78rem] text-text-muted">
            <strong className="text-ink">Flavors:</strong> {product.flavors.join(", ")}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-dashed border-border">
          <span className="font-serif text-[1.05rem] font-semibold text-gold-dark">
            {product.price ? `${BUSINESS.currencySymbol}${product.price}` : "Price on request"}
            <small className="block font-sans text-[0.7rem] font-normal text-text-muted">Starting from</small>
          </span>
          <button
            onClick={() => openProductOrder({ productId: product.id, flavor: product.flavors?.[0] })}
            className="btn btn-primary btn-sm"
          >
            Order Now
          </button>
        </div>
      </div>
    </article>
  );
}
