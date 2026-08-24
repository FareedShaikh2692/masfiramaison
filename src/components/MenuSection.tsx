import { listProducts } from "@/lib/catalogStore";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

export default async function MenuSection() {
  const products = await listProducts({ activeOnly: true });
  const menuProducts = products.filter((p) => p.category !== "specials");

  return (
    <section id="menu" className="py-28">
      <div className="container-app">
        <Reveal className="text-center max-w-[680px] mx-auto mb-14">
          <span className="eyebrow justify-center">Our Menu</span>
          <h2 className="text-[clamp(2rem,3.6vw,2.9rem)] mt-3.5">Freshly Baked, Made To Order</h2>
          <p className="mt-4 text-[1.08rem] text-text-muted">
            From everyday favorites to signature combos — every item is baked fresh once you order.
          </p>
        </Reveal>
        {menuProducts.length === 0 ? (
          <p className="text-center text-text-muted">Our menu is being updated — check back shortly.</p>
        ) : (
          <Reveal delay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
