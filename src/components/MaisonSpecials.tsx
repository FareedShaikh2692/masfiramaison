import { listProducts } from "@/lib/catalogStore";
import ProductCard from "@/components/ProductCard";

export default async function MaisonSpecials() {
  const products = await listProducts({ activeOnly: true });
  const specials = products.filter((p) => p.category === "specials");

  if (!specials.length) return null;

  return (
    <section
      id="specials"
      className="py-28"
      style={{ background: "radial-gradient(circle at 50% 0%, rgba(198,161,91,0.12), transparent 55%), var(--ink)" }}
    >
      <div className="container-app">
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="eyebrow justify-center" style={{ color: "var(--gold-light)" }}>
            Signature Shelf
          </span>
          <h2 className="text-[clamp(2rem,3.6vw,2.9rem)] mt-3.5 text-white">Maison Specials</h2>
          <p className="mt-4 text-[1.08rem] text-white/70">
            Our most distinctive creations — richer flavors, limited to those who ask for something a little extraordinary.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {specials.map((product) => (
            <ProductCard key={product.id} product={product} featured />
          ))}
        </div>
      </div>
    </section>
  );
}
