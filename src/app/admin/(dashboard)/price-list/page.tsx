"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import PageHeader from "@/components/admin/PageHeader";

interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  active: boolean;
}

interface ProductRecord {
  id: string;
  name: string;
  categoryId: string | null;
  category: string;
  price: number | null;
  pricePerUnit?: boolean;
  image: string;
  active: boolean;
  displayOrder: number;
  [key: string]: unknown;
}

export default function PriceListBuilderPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([fetch("/api/admin/categories").then((r) => r.json()), fetch("/api/admin/products").then((r) => r.json())])
      .then(([cats, prods]) => {
        setCategories((cats.categories || []).slice().sort((a: CategoryRecord, b: CategoryRecord) => a.displayOrder - b.displayOrder));
        setProducts(prods.products || []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    Promise.resolve().then(load);
  }, []);

  async function toggleActive(p: ProductRecord) {
    setBusyId(p.id);
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)));
    try {
      await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, active: !p.active })
      });
    } catch {
      showToast("Could not update — please retry.", "error");
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function move(categoryId: string | null, productId: string, direction: -1 | 1) {
    const group = products
      .filter((p) => p.categoryId === categoryId)
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder);
    const index = group.findIndex((p) => p.id === productId);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= group.length) return;

    const reordered = group.slice();
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    setBusyId(productId);
    const updates = reordered.map((p, i) => ({ ...p, displayOrder: i }));
    setProducts((prev) => {
      const others = prev.filter((p) => p.categoryId !== categoryId);
      return [...others, ...updates];
    });
    try {
      await Promise.all(
        updates.map((p) =>
          fetch(`/api/admin/products/${p.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(p)
          })
        )
      );
    } catch {
      showToast("Could not save the new order — please retry.", "error");
      load();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div className="card h-64 animate-pulse max-w-[820px]" />;

  const grouped = categories.map((c) => ({
    category: c,
    items: products.filter((p) => p.categoryId === c.id).sort((a, b) => a.displayOrder - b.displayOrder)
  }));
  const uncategorized = products.filter((p) => !p.categoryId).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="max-w-[820px]">
      <PageHeader
        title="Price List Builder"
        description="Reorder items and control what's visible on the public menu."
        actions={
          <button onClick={() => setPreview((v) => !v)} className="btn btn-outline btn-sm">
            {preview ? "Back to Editing" : "Live Preview"}
          </button>
        }
      />

      {preview ? (
        <div className="space-y-10">
          {grouped
            .filter((g) => g.items.some((p) => p.active))
            .map((g) => (
              <div key={g.category.id}>
                <h2 className="text-[1.2rem] mb-4">{g.category.name}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {g.items
                    .filter((p) => p.active)
                    .map((p) => (
                      <div key={p.id} className="card overflow-hidden">
                        <div className="aspect-[4/3] bg-blush-soft overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="p-3.5">
                          <p className="text-[0.9rem] font-semibold text-ink m-0">{p.name}</p>
                          <p className="text-[0.82rem] text-gold-dark font-medium m-0 mt-1">
                            {p.price != null ? `₹${p.price}${p.pricePerUnit ? " / unit" : ""}` : "Price on request"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          {grouped.every((g) => !g.items.some((p) => p.active)) && (
            <p className="text-text-muted text-center py-16">No active products — nothing will show on the public menu yet.</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((g) => (
            <div key={g.category.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[1.05rem]">{g.category.name}</h2>
                <span className="text-[0.78rem] text-text-muted">{g.items.filter((p) => p.active).length} of {g.items.length} visible</span>
              </div>
              {g.items.length === 0 ? (
                <p className="text-text-muted text-[0.85rem]">No products in this category yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {g.items.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[10px]" style={{ background: "var(--ivory)" }}>
                      <div className="flex flex-col gap-0.5 flex-shrink-0">
                        <button
                          type="button"
                          disabled={i === 0 || busyId === p.id}
                          onClick={() => move(p.categoryId, p.id, -1)}
                          className="w-6 h-5 flex items-center justify-center text-[0.7rem] rounded border border-border disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={i === g.items.length - 1 || busyId === p.id}
                          onClick={() => move(p.categoryId, p.id, 1)}
                          className="w-6 h-5 flex items-center justify-center text-[0.7rem] rounded border border-border disabled:opacity-30"
                        >
                          ▼
                        </button>
                      </div>
                      <span className="flex-1 text-[0.9rem] text-ink font-medium truncate">{p.name}</span>
                      <span className="text-[0.85rem] text-text-muted flex-shrink-0">
                        {p.price != null ? `₹${p.price}` : "On request"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleActive(p)}
                        disabled={busyId === p.id}
                        className={`text-[0.72rem] px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${p.active ? "text-white" : "text-text-muted bg-blush-soft"}`}
                        style={p.active ? { background: "var(--gold-dark)" } : undefined}
                      >
                        {p.active ? "Visible" : "Hidden"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {uncategorized.length > 0 && (
            <div className="card p-5">
              <h2 className="text-[1.05rem] mb-3">Uncategorized</h2>
              <div className="space-y-1.5">
                {uncategorized.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[10px]" style={{ background: "var(--ivory)" }}>
                    <span className="flex-1 text-[0.9rem] text-ink font-medium truncate">{p.name}</span>
                    <span className="text-[0.85rem] text-text-muted flex-shrink-0">{p.price != null ? `₹${p.price}` : "On request"}</span>
                    <button
                      type="button"
                      onClick={() => toggleActive(p)}
                      disabled={busyId === p.id}
                      className={`text-[0.72rem] px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${p.active ? "text-white" : "text-text-muted bg-blush-soft"}`}
                      style={p.active ? { background: "var(--gold-dark)" } : undefined}
                    >
                      {p.active ? "Visible" : "Hidden"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
