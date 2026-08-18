import { PRODUCTS } from "@/data/data";
import ProductCard from "@/components/ProductCard";

export default function MenuSection() {
  const menuProducts = PRODUCTS.filter((p) => p.category !== "specials");

  return (
    <section id="menu" className="py-28">
      <div className="container-app">
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="eyebrow justify-center">Our Menu</span>
          <h2 className="text-[clamp(2rem,3.6vw,2.9rem)] mt-3.5">Freshly Baked, Made To Order</h2>
          <p className="mt-4 text-[1.08rem] text-text-muted">
            From everyday favorites to signature combos — every item is baked fresh once you order.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
