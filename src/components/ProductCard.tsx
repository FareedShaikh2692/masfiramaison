"use client";

import Image from "next/image";
import { useOrder } from "@/components/order/OrderContext";
import { useBusiness } from "@/components/BusinessContext";
import type { Product } from "@/lib/types";

export default function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const { openProductOrder } = useOrder();
  const business = useBusiness();

  return (
    <article
      className={`group card overflow-hidden flex flex-col transition-all duration-500 ease-out hover:-translate-y-3 hover:shadow-[0_30px_70px_rgba(64,51,42,0.16)] ${
        featured ? "ring-1 ring-gold-light" : ""
      }`}
    >
      <div className="relative aspect-[4/3] bg-blush-soft overflow-hidden">
        {product.badge && (
          <span className="absolute top-4 left-4 z-10 text-white text-[0.7rem] font-semibold uppercase tracking-wide px-3.5 py-1.5 rounded-full" style={{ background: "var(--gold-dark)" }}>
            {product.badge}
          </span>
        )}
        <Image
          src={product.image}
          alt={`${product.name} — ${business.name}`}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
            {product.price ? `${business.currencySymbol}${product.price}` : "Price on request"}
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
